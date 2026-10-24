import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { VolumeSlider } from '@/components/Slider';
import { Stars } from '@/components/Stars';
import { GoldButton, IconButton, Icons } from '@/components/ui';
import { DEITIES, deityForToday } from '@/content/deities';
import { getMantra, groupOf } from '@/content/mantraLib';
import { usePrefs } from '@/lib/prefs';
import { C, F } from '@/theme';

const native = Platform.OS !== 'web';
const TOTAL = 108;


export default function Japa() {
  const prefs = usePrefs();
  const { m: mantraId } = useLocalSearchParams<{ m?: string }>();
  const chosen = getMantra(mantraId);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const ring = Math.min(340, width - 40);
  const [di, setDi] = useState<number | null>(null);
  const idx = di ?? Math.max(0, DEITIES.findIndex((d) => d.id === deityForToday(prefs.deity).id));
  const base = DEITIES[idx];
  // a mantra opened from the library overrides the deity's default mantra until the user taps to change
  const fromLib = chosen && di === null;
  const deity = fromLib
    ? {
        ...base,
        id: chosen.id,
        ta: groupOf(chosen.deity).ta,
        image: groupOf(chosen.deity).image,
        mantra: { ta: chosen.kind === 'mantra' ? chosen.lines.map((l) => l.ta).join(' ') : chosen.name, en: chosen.kind === 'mantra' ? '' : chosen.lines[0].ta },
      }
    : base;
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [auto, setAuto] = useState(false);
  const [tempo] = useState(2.4);
  const [vol, setVol] = useState(65);
  const [done, setDone] = useState(false);
  const bell = useAudioPlayer(require('@/assets/audio/bell.wav'));
  const gong = useAudioPlayer(require('@/assets/audio/gong.wav'));
  const ripple = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const countRef = useRef(0);

  useEffect(() => {
    bell.volume = vol / 100;
    gong.volume = vol / 100;
  }, [vol, bell, gong]);

  const play = (p: typeof bell) => {
    try {
      p.seekTo(0);
      p.play();
    } catch {}
  };

  const step = useCallback(() => {
    const c = countRef.current + 1;
    ripple.setValue(0);
    Animated.timing(ripple, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
    pop.setValue(0.85);
    Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: native }).start();
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    if (c >= TOTAL) {
      countRef.current = 0;
      setCount(0);
      setRounds((r) => r + 1);
      play(gong);
      setDone(true);
      burst.setValue(0);
      Animated.timing(burst, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
      setTimeout(() => setDone(false), 2600);
    } else {
      countRef.current = c;
      setCount(c);
      play(bell);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bell, gong]);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(step, tempo * 1000);
    return () => clearInterval(t);
  }, [auto, tempo, step]);

  const pct = Math.round((count / TOTAL) * 100);
  const r = ring / 2 - 12;
  const beads = Array.from({ length: TOTAL }, (_, k) => {
    const a = -Math.PI / 2 + ((k + 1) * 2 * Math.PI) / (TOTAL + 2);
    return { x: ring / 2 + r * Math.cos(a), y: ring / 2 + r * Math.sin(a) };
  });
  const om = ring * 0.44;

  return (
    <View style={[st.fill, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <Image key={deity.id} source={deity.image} resizeMode="cover" style={st.bg} />
      <LinearGradient colors={['rgba(7,11,20,0.35)', 'rgba(7,11,20,0.75)', C.night]} locations={[0, 0.45, 0.72]} style={StyleSheet.absoluteFill} />
      <Stars />
      <View style={st.header}>
        <IconButton label="பின்செல்" onPress={() => router.back()}>
          {Icons.back()}
        </IconButton>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.title}>ஜப மாலை</Text>
          <Text style={st.sub} numberOfLines={1}>{deity.ta}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ width: ring, height: ring, alignSelf: 'center', marginTop: 4 }}>
        <Mandala size={ring * 0.76} offset={ring * 0.12} />
        {beads.map((b, i) => (
          <Bead key={i} x={b.x} y={b.y} lit={i < count} current={i === count - 1} />
        ))}
        <Svg width={20} height={20} viewBox="-10 -10 20 20" style={{ position: 'absolute', left: ring / 2 - 10, top: 2 }}>
          <Circle r={7} fill="#1a2236" stroke={C.gold} strokeWidth={1.2} />
          <Circle r={3} fill={C.gold} />
        </Svg>
        <Animated.View
          pointerEvents="none"
          style={[
            st.ripple,
            { width: om, height: om, borderRadius: om, left: (ring - om) / 2, top: (ring - om) / 2 - 18 },
            { opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }), transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2] }) }] },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            st.ripple,
            { width: ring - 40, height: ring - 40, borderRadius: ring, left: 20, top: 20, borderWidth: 2, borderColor: C.goldLight },
            { opacity: burst.interpolate({ inputRange: [0, 1], outputRange: [done ? 1 : 0, 0] }), transform: [{ scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.5] }) }] },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ஒரு மணி எண்ணு"
          onPress={step}
          style={({ pressed }) => [st.omBtn, { width: om, height: om, borderRadius: om, left: (ring - om) / 2, top: (ring - om) / 2 - 18 }, pressed && { transform: [{ scale: 0.95 }] }]}>
          <OmGlyph size={om * 0.52} />
        </Pressable>
        <Animated.View style={[st.countRow, { top: ring * 0.7, transform: [{ scale: pop }] }]}>
          <Text style={st.count}>{count}</Text>
          <Text style={st.countOf}>/ {TOTAL}</Text>
        </Animated.View>
      </View>

      {done && (
        <View style={st.banner} accessibilityLiveRegion="polite">
          <Text style={st.bannerText}>ஒரு சுற்று நிறைவு</Text>
        </View>
      )}

      <Pressable accessibilityRole="button" accessibilityLabel="மந்திரத்தை மாற்று" onPress={() => setDi((idx + 1) % DEITIES.length)} style={{ alignItems: 'center', marginTop: 4 }}>
        <Text style={[st.mantra, deity.mantra.ta.length > 24 && { fontSize: 16, lineHeight: 27, textAlign: 'center', paddingHorizontal: 20 }]}>{deity.mantra.ta}</Text>
        {!!deity.mantra.en && <Text style={[st.mantraEn, deity.mantra.en.length > 30 && { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }]} numberOfLines={2}>{deity.mantra.en}</Text>}
        <Text style={st.tiny}>{deity.ta} · தொட்டு மந்திரத்தை மாற்றலாம்</Text>
      </Pressable>

      <View style={st.stats}>
        <View style={st.stat}>
          <Text style={st.statL}>சுற்றுகள்</Text>
          <Text style={st.statV}>{rounds}</Text>
        </View>
        <View style={st.vline} />
        <View style={st.stat}>
          <Text style={st.statL}>இலக்கு</Text>
          <Text style={st.statV}>{TOTAL}</Text>
        </View>
      </View>

      <View style={st.px}>
        <View style={st.barRow}>
          <View style={st.bar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: TOTAL, now: count }}>
            <View style={[st.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={st.pct}>{pct}%</Text>
        </View>
        <Text style={st.hint}>{auto ? 'ஒலி முடிந்ததும் அடுத்த எண்ணிக்கை' : 'ஓம் மீது தொட்டு ஒவ்வொரு மணியையும் எண்ணுங்கள்'}</Text>
        <VolumeSlider value={vol} onChange={setVol} />
      </View>

      <View style={{ flex: 1 }} />
      <View style={[st.px, { flexDirection: 'row', gap: 14 }]}>
        <GoldButton style={{ flex: 1 }} label={auto ? 'இடைநிறுத்து' : 'தொடங்கு'} icon={auto ? Icons.pause() : Icons.play()} onPress={() => setAuto(!auto)} />
        <GoldButton
          style={{ flex: 1 }}
          outline
          label="நிறுத்து"
          icon={Icons.stop()}
          onPress={() => {
            setAuto(false);
            countRef.current = 0;
            setCount(0);
          }}
        />
      </View>
    </View>
  );
}

function Bead({ x, y, lit, current }: { x: number; y: number; lit: boolean; current: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!current) {
      v.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, v]);
  return (
    <Animated.View
      style={[
        st.bead,
        { left: x - 4.5, top: y - 4.5 },
        lit && st.beadLit,
        current && { zIndex: 2, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1.4, 1.75] }) }] },
      ]}
    />
  );
}

function Mandala({ size, offset }: { size: number; offset: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 90000, easing: Easing.linear, useNativeDriver: native }));
    a.start();
    return () => a.stop();
  }, [spin]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: offset, top: offset, width: size, height: size, opacity: 0.35, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      <Svg width={size} height={size} viewBox="-100 -100 200 200">
        <G fill="none" stroke={C.gold} strokeWidth={0.6}>
          <Circle r={96} />
          <Circle r={70} strokeDasharray="1 3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <Path key={a} d="M0,-92 C14,-70 14,-56 0,-48 C-14,-56 -14,-70 0,-92Z" transform={`rotate(${a})`} />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}

export function OmGlyph({ size }: { size: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.Text
      style={{
        fontFamily: F.deva,
        fontSize: size,
        lineHeight: size * 1.3,
        color: '#F0C56E',
        textShadowColor: 'rgba(243,212,143,0.8)',
        textShadowRadius: 18,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
      }}>
      ॐ
    </Animated.Text>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  bg: { position: 'absolute', left: 0, top: 0, width: '100%', height: '70%', opacity: 0.55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 60 },
  title: { fontFamily: F.taBold, fontSize: 22, color: C.gold },
  sub: { fontFamily: F.ta, fontSize: 13, color: C.muted },
  bead: { position: 'absolute', width: 9, height: 9, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(227,184,101,0.45)', backgroundColor: 'rgba(10,15,28,0.9)' },
  beadLit: { backgroundColor: '#E4A64A', borderColor: '#F3C979', shadowColor: '#FFC86E', shadowOpacity: 0.8, shadowRadius: 5 },
  ripple: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(243,201,121,0.85)' },
  omBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(227,184,101,0.6)',
    backgroundColor: '#141d33',
    shadowColor: C.gold,
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  countRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 6 },
  count: { fontFamily: F.num, fontSize: 50, color: C.goldLight },
  countOf: { fontFamily: F.num, fontSize: 26, color: '#A99B7E' },
  banner: { alignSelf: 'center', marginTop: -6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(227,184,101,0.5)', backgroundColor: 'rgba(227,184,101,0.16)' },
  bannerText: { fontFamily: F.taSemi, fontSize: 14, color: C.goldLight },
  mantra: { fontFamily: F.taBold, fontSize: 26, color: C.gold },
  mantraEn: { fontFamily: F.en, fontSize: 20, color: '#E8DCC0' },
  tiny: { fontFamily: F.ta, fontSize: 11, color: 'rgba(201,187,155,0.75)', marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: 14, marginHorizontal: 22 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statL: { fontFamily: F.ta, fontSize: 13, color: C.muted },
  statV: { fontFamily: F.num, fontSize: 28, color: C.cream },
  vline: { width: 1, backgroundColor: 'rgba(227,184,101,0.3)' },
  px: { paddingHorizontal: 22 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  bar: { flex: 1, height: 12, borderRadius: 6, backgroundColor: '#18213A', borderWidth: 1, borderColor: 'rgba(227,184,101,0.35)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.goldLight },
  pct: { width: 46, textAlign: 'right', fontFamily: F.num, fontSize: 18, color: C.cream },
  hint: { fontFamily: F.ta, fontSize: 13, color: C.muted, textAlign: 'center', marginVertical: 8 },
});
