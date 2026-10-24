import { useAudioPlayer } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { VolumeSlider } from '@/components/Slider';
import { Stars } from '@/components/Stars';
import { GoldButton, IconButton, Icons } from '@/components/ui';
import { C, F } from '@/theme';

const native = Platform.OS !== 'web';
type Phase = 'in' | 'hold' | 'out' | 'rest';
const LABEL: Record<Phase, string> = { in: 'மூச்சை உள்ளிழுங்கள்', hold: 'மூச்சை நிறுத்தி வையுங்கள்', out: 'மெதுவாக வெளிவிடுங்கள்', rest: 'அமைதியாக இருங்கள்' };

function parsePattern(p: string): [Phase, number][] {
  const n = p.split('-').map(Number);
  if (n.length === 4) return [['in', n[0]], ['hold', n[1]], ['out', n[2]], ['rest', n[3]]];
  return ([['in', n[0]], ['hold', n[1]], ['out', n[2]]] as [Phase, number][]).filter(([, s]) => s > 0);
}

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export default function Dhyanam() {
  const params = useLocalSearchParams<{ minutes?: string; pattern?: string }>();
  const insets = useSafeAreaInsets();
  const [target, setTarget] = useState(Number(params.minutes) || 15);
  const [pattern] = useState(params.pattern || '4-4-6');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [tambura, setTambura] = useState(false);
  const [vol, setVol] = useState(65);
  const drone = useAudioPlayer(require('@/assets/audio/tambura.wav'));
  const gong = useAudioPlayer(require('@/assets/audio/gong.wav'));
  const breath = useRef(new Animated.Value(0)).current;
  const last = useRef(Date.now());

  const pat = useMemo(() => parsePattern(pattern), [pattern]);
  const cycle = pat.reduce((a, [, s]) => a + s, 0);

  useEffect(() => {
    drone.loop = true;
  }, [drone]);
  useEffect(() => {
    drone.volume = (vol / 100) * 0.8;
    gong.volume = vol / 100;
  }, [vol, drone, gong]);
  useEffect(() => {
    if (tambura) drone.play();
    else drone.pause();
  }, [tambura, drone]);
  useEffect(() => () => drone.pause(), [drone]);

  // clock
  useEffect(() => {
    if (!running) return;
    last.current = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      const dt = (now - last.current) / 1000;
      last.current = now;
      setElapsed((e) => {
        const n = e + dt;
        if (n >= target * 60) {
          setRunning(false);
          setDone(true);
          try {
            gong.seekTo(0);
            gong.play();
          } catch {}
          return target * 60;
        }
        return n;
      });
    }, 200);
    return () => clearInterval(t);
  }, [running, target, gong]);

  // which breath phase are we in?
  let acc = 0;
  let phase: Phase = pat[0][0];
  let phaseLen = pat[0][1];
  const tc = elapsed % cycle;
  for (const [p, s] of pat) {
    if (tc < acc + s) {
      phase = p;
      phaseLen = s;
      break;
    }
    acc += s;
  }
  const left = Math.max(1, Math.ceil(acc + phaseLen - tc));
  const phaseKey = `${Math.floor(elapsed / cycle)}-${phase}`;

  // animate lotus to the phase target over the phase's remaining time
  useEffect(() => {
    breath.stopAnimation();
    if (!running) {
      Animated.timing(breath, { toValue: 0.5, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: native }).start();
      return;
    }
    const to = phase === 'in' || phase === 'hold' ? 1 : 0;
    const remaining = Math.max(400, (acc + phaseLen - tc) * 1000);
    Animated.timing(breath, { toValue: to, duration: remaining, easing: Easing.inOut(Easing.sin), useNativeDriver: native }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseKey, running]);

  const pct = Math.min(100, Math.round((elapsed / (target * 60)) * 100));
  const label = done ? 'தியானம் நிறைவு' : running ? LABEL[phase] : elapsed > 0 ? 'இடைநிறுத்தப்பட்டது' : 'தயாராகுங்கள்';
  const sub = done ? 'சில கணங்கள் அமைதியில் இருங்கள்' : running ? `${left} வினாடி` : `மூச்சு முறை · ${pattern}`;

  const toggle = () => {
    if (done) {
      setElapsed(0);
      setDone(false);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  };

  return (
    <View style={[st.fill, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <Stars height="62%" />
      <View style={st.header}>
        <IconButton label="பின்செல்" onPress={() => router.back()}>
          {Icons.back()}
        </IconButton>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.title}>தியானம்</Text>
          <Text style={st.sub}>அமைதியான ஒரு தருணம்</Text>
        </View>
        <IconButton label="தம்புரா ஒலி" onPress={() => setTambura(!tambura)} style={st.ring}>
          {Icons.speaker(C.gold, !tambura)}
        </IconButton>
      </View>

      <View style={st.stage}>
        <Ripples running={running} />
        {[300, 232, 168].map((size, i) => (
          <Animated.View
            key={size}
            style={[
              st.circle,
              { width: size, height: size, borderRadius: size, marginLeft: -size / 2, marginTop: -size / 2, borderColor: `rgba(227,184,101,${0.18 + i * 0.09})` },
              { transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1 - 0.05 * (i + 1), 1 + 0.06 * (i + 1)] }) }] },
            ]}
          />
        ))}
        <Svg width={346} height={80} viewBox="0 0 346 80" style={st.hills}>
          <Path d="M0 80 L0 58 L40 40 L78 54 L120 30 L160 50 L196 36 L240 52 L282 34 L320 50 L346 44 L346 80 Z" fill="#0c1426" />
        </Svg>
        <View style={st.horizon} />
        <Animated.View style={[st.lotus, { transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.14] }) }] }]}>
          <LotusArt />
        </Animated.View>
        <Animated.View style={[st.reflect, { opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.2] }) }]}>
          <View style={{ transform: [{ scaleY: -0.5 }] }}>
            <LotusArt />
          </View>
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', height: 56, justifyContent: 'center' }}>
        <Text key={label} style={st.phase} accessibilityLiveRegion="polite">
          {label}
        </Text>
        <Text style={st.sub}>{sub}</Text>
      </View>
      <Text style={st.clock} accessibilityRole="timer">
        {fmt(elapsed)}
      </Text>
      <Text style={[st.sub, { textAlign: 'center', marginTop: 4 }]}>இலக்கு · {target} நிமிடங்கள்</Text>

      <View style={st.px}>
        <View style={st.bar}>
          <View style={[st.barFill, { width: `${pct}%` }]} />
        </View>
        <View style={st.barLabels}>
          <Text style={st.small}>{fmt(elapsed)}</Text>
          <Text style={st.small}>{fmt(target * 60)}</Text>
        </View>
        <View style={st.chips}>
          {[5, 10, 15, 20].map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityState={{ selected: target === m }}
              onPress={() => {
                setTarget(m);
                setDone(false);
                setElapsed((e) => Math.min(e, m * 60 - 1));
              }}
              style={[st.chip, target === m && st.chipOn]}>
              <Text style={[st.chipText, target === m && { color: C.goldLight }]}>{m} நிமி</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: tambura }} onPress={() => setTambura(!tambura)} style={st.tambura}>
          <Eq on={tambura} />
          <View style={{ flex: 1 }}>
            <Text style={st.tamburaT}>Tambura</Text>
            <Text style={st.small}>{tambura ? 'ஸ – ப ஸ்ருதி · இயங்குகிறது' : 'தொட்டு இயக்குங்கள்'}</Text>
          </View>
          {Icons.arrow()}
        </Pressable>
        <VolumeSlider value={vol} onChange={setVol} />
      </View>

      <View style={{ flex: 1 }} />
      <View style={[st.px, { flexDirection: 'row', gap: 14 }]}>
        <GoldButton style={{ flex: 1 }} label={running ? 'இடைநிறுத்து' : elapsed > 0 && !done ? 'தொடர்' : 'தொடங்கு'} icon={running ? Icons.pause() : Icons.play()} onPress={toggle} />
        <GoldButton
          style={{ flex: 1 }}
          outline
          label="மீட்டமை"
          icon={Icons.reset()}
          onPress={() => {
            setRunning(false);
            setElapsed(0);
            setDone(false);
          }}
        />
      </View>
    </View>
  );
}

function LotusArt() {
  const petal = 'M0,20 C-20,-14 -20,-70 0,-104 C20,-70 20,-14 0,20Z';
  return (
    <Svg width={210} height={143} viewBox="-110 -110 220 150">
      <G stroke="#F0C56E" strokeWidth={1.6} fill="rgba(227,184,101,0.08)" strokeLinejoin="round">
        <Path d="M0,20 C-60,22 -100,4 -104,-12 C-74,-18 -36,-4 0,20Z" />
        <Path d="M0,20 C60,22 100,4 104,-12 C74,-18 36,-4 0,20Z" />
        <Path d="M0,20 C-44,6 -78,-34 -74,-62 C-40,-50 -14,-18 0,20Z" />
        <Path d="M0,20 C44,6 78,-34 74,-62 C40,-50 14,-18 0,20Z" />
        <Path d="M0,20 C-28,-6 -44,-56 -32,-88 C-8,-66 4,-24 0,20Z" />
        <Path d="M0,20 C28,-6 44,-56 32,-88 C8,-66 -4,-24 0,20Z" />
        <Path d={petal} fill="rgba(243,201,121,0.16)" />
      </G>
      <Circle cx={0} cy={18} r={3} fill="#F3D48F" />
    </Svg>
  );
}

function Ripples({ running }: { running: boolean }) {
  const vals = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    if (!running) return;
    const loops = vals.map((v, i) =>
      Animated.loop(Animated.sequence([Animated.delay(i * 2000), Animated.timing(v, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: native }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: native })])),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [running, vals]);
  return (
    <>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            st.circle,
            { width: 300, height: 300, borderRadius: 300, marginLeft: -150, marginTop: -150, borderColor: 'rgba(227,184,101,0.45)' },
            { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.5] }) }] },
          ]}
        />
      ))}
    </>
  );
}

function Eq({ on }: { on: boolean }) {
  const heights = [10, 18, 26, 14, 22, 12, 20, 9];
  const vals = useRef(heights.map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (!on) {
      vals.forEach((v) => v.setValue(0.3));
      return;
    }
    const loops = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 400 + (i % 3) * 140, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
          Animated.timing(v, { toValue: 0.3, duration: 400 + (i % 3) * 140, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        ]),
      ),
    );
    loops.forEach((l, i) => setTimeout(() => l.start(), i * 90));
    return () => loops.forEach((l) => l.stop());
  }, [on, vals]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 26, opacity: on ? 1 : 0.45 }}>
      {heights.map((h, i) => (
        <Animated.View key={i} style={{ width: 3, height: h, borderRadius: 2, backgroundColor: C.gold, transform: [{ scaleY: vals[i] }] }} />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 60 },
  ring: { borderWidth: 1, borderColor: 'rgba(227,184,101,0.6)' },
  title: { fontFamily: F.taBold, fontSize: 22, color: C.gold },
  sub: { fontFamily: F.ta, fontSize: 13, color: C.muted },
  stage: { width: 346, height: 300, alignSelf: 'center', overflow: 'visible' },
  circle: { position: 'absolute', left: '50%', top: '46%', borderWidth: 1 },
  hills: { position: 'absolute', left: 0, bottom: 34, opacity: 0.6 },
  horizon: { position: 'absolute', left: 10, right: 10, bottom: 34, height: 1, backgroundColor: 'rgba(243,212,143,0.55)' },
  lotus: { position: 'absolute', left: 68, top: 46, width: 210, height: 143 },
  reflect: { position: 'absolute', left: 68, bottom: -36, width: 210, height: 143 },
  phase: { fontFamily: F.taSemi, fontSize: 20, color: C.cream },
  clock: { fontFamily: F.num, fontSize: 64, lineHeight: 72, color: '#F0C56E', textAlign: 'center', textShadowColor: 'rgba(240,197,110,0.4)', textShadowRadius: 18 },
  px: { paddingHorizontal: 22 },
  bar: { height: 12, borderRadius: 6, backgroundColor: '#18213A', borderWidth: 1, borderColor: 'rgba(227,184,101,0.35)', overflow: 'hidden', marginTop: 12 },
  barFill: { height: '100%', backgroundColor: C.goldLight },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  small: { fontFamily: F.ta, fontSize: 12, color: C.muted },
  chips: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(227,184,101,0.3)', alignItems: 'center', justifyContent: 'center' },
  chipOn: { borderColor: C.gold, backgroundColor: 'rgba(227,184,101,0.18)' },
  chipText: { fontFamily: F.ta, fontSize: 14, color: C.muted },
  tambura: { marginTop: 12, height: 58, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(227,184,101,0.45)', backgroundColor: 'rgba(16,24,44,0.75)', flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  tamburaT: { fontFamily: F.en, fontSize: 21, color: C.cream },
});
