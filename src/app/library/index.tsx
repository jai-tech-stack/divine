import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Particles, Vignette } from '@/components/cinema/Effects';
import { KenBurns, Reveal } from '@/components/library/KenBurns';
import { IconButton, Icons } from '@/components/ui';
import { COLLECTIONS } from '@/content/library';
import type { Particles as ParticleKind } from '@/content/types';
import { C, F } from '@/theme';

const NUM = ['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮'];
const MOOD: Record<string, ParticleKind> = { yogas: 'sparks', gunas: 'embers', siddhars: 'dust', alvars: 'petals', saiva: 'stars' };
const teaser = (s: string) => (s.split(/(?<=[.!?])\s/)[0] ?? s).slice(0, 150);

/** Wisdom library as a film reel: one full-screen chapter at a time. */
export default function Library() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  return (
    <View style={st.fill}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onEnd} scrollEventThrottle={16}>
        {COLLECTIONS.map((c, i) => {
          const active = i === page;
          return (
            <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`${c.title}. ${c.subtitle}`} onPress={() => router.push(`/library/${c.id}` as never)} style={{ width, height }}>
              <KenBurns source={c.image} active={active} variant={i} />
              <LinearGradient colors={['rgba(7,11,20,0.55)', 'rgba(7,11,20,0)', 'rgba(7,11,20,0.55)', 'rgba(7,11,20,0.96)']} locations={[0, 0.3, 0.62, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
              <Particles kind={MOOD[c.id] ?? 'dust'} paused={!active} />
              <Vignette strength={0.7} />
              <View style={[st.text, { paddingBottom: insets.bottom + 56 }]}>
                <Reveal show={active} delay={150}>
                  <Text style={st.chapter}>அத்தியாயம் {NUM[i] ?? i + 1}</Text>
                </Reveal>
                <Reveal show={active} delay={350}>
                  <Text style={st.title}>{c.title}</Text>
                  <Text style={st.sub}>{c.subtitle}</Text>
                </Reveal>
                <Reveal show={active} delay={650}>
                  <Text style={st.teaser}>{teaser(c.intro)}</Text>
                  <View style={st.cta}>
                    <Text style={st.ctaT}>கதையைத் தொடங்கு · {c.entries.length} பகுதிகள்</Text>
                    {Icons.arrow(C.ink)}
                  </View>
                </Reveal>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[st.top, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <IconButton label="பின்செல்" onPress={() => router.back()} style={{ backgroundColor: 'rgba(7,11,20,0.5)' }}>
          {Icons.back(C.cream)}
        </IconButton>
        <Text style={st.head}>வாழ்வியல் ஞானம்</Text>
      </View>
      <View style={[st.dots, { bottom: insets.bottom + 22 }]} pointerEvents="none">
        {COLLECTIONS.map((c, i) => (
          <View key={c.id} style={[st.dot, i === page && st.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  head: { fontFamily: F.taSemi, fontSize: 14, color: C.goldLight, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 8 },
  text: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, gap: 10 },
  chapter: { fontFamily: F.taSemi, fontSize: 12, letterSpacing: 1.5, color: C.gold },
  title: { fontFamily: F.taBold, fontSize: 36, lineHeight: 54, color: C.cream, textShadowColor: 'rgba(0,0,0,0.85)', textShadowRadius: 14 },
  sub: { fontFamily: F.ta, fontSize: 14, lineHeight: 24, color: C.goldLight },
  teaser: { fontFamily: F.ta, fontSize: 15, lineHeight: 27, color: '#EADFC6', marginTop: 6 },
  cta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: C.gold, borderRadius: 999, paddingHorizontal: 18, minHeight: 44 },
  ctaT: { fontFamily: F.taSemi, fontSize: 13.5, lineHeight: 24, color: C.ink },
  dots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(243,230,200,0.35)' },
  dotOn: { width: 22, backgroundColor: C.gold },
});
