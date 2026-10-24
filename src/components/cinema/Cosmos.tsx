import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as LG, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Backdrop } from '@/content/types';

/**
 * The worlds a story is told in — drawn as light, not as figures:
 *  cosmos     — a spiral galaxy in a deep nebula
 *  vaikuntam  — Vishnu's world: a milk-white ocean under a pearl sky
 *  kailasam   — Shiva's world: a moonlit snow peak with aurora
 *  brahmaloka — Brahma's world: a golden lotus sun, ringed in light
 */
export type Loka = 'cosmos' | 'vaikuntam' | 'kailasam' | 'brahmaloka';

export function lokaFor(b: Backdrop): { kind: Loka; hue: 'calm' | 'ember' | 'crimson' | 'green' } {
  switch (b) {
    case 'forest-dawn':
      return { kind: 'brahmaloka', hue: 'calm' };
    case 'palace-storm':
      return { kind: 'cosmos', hue: 'crimson' };
    case 'divine-birth':
      return { kind: 'vaikuntam', hue: 'calm' };
    case 'coronation':
      return { kind: 'brahmaloka', hue: 'calm' };
    case 'famine':
      return { kind: 'cosmos', hue: 'ember' };
    case 'wrath':
      return { kind: 'cosmos', hue: 'crimson' };
    case 'cosmic-chase':
      return { kind: 'cosmos', hue: 'calm' };
    case 'earth-speaks':
      return { kind: 'vaikuntam', hue: 'green' };
    case 'levelling':
      return { kind: 'kailasam', hue: 'calm' };
    default:
      return { kind: 'vaikuntam', hue: 'calm' };
  }
}

const nd = Platform.OS !== 'web';
const SW = 400;
const SH = 800;

const SKY: Record<Loka, [string, string, string]> = {
  cosmos: ['#05030F', '#150A33', '#2A1250'],
  vaikuntam: ['#06183A', '#0E3A7A', '#3C83C4'],
  kailasam: ['#050B1E', '#0F2150', '#2B4A86'],
  brahmaloka: ['#1C0A02', '#6A2A06', '#E58A1F'],
};

const NEBULA: Record<Loka, string[]> = {
  cosmos: ['#8B3DFF', '#FF4FA3', '#2EC4FF'],
  vaikuntam: ['#7FD0FF', '#FFFFFF', '#6BA7FF'],
  kailasam: ['#4FE3C1', '#6E8CFF', '#B8D4FF'],
  brahmaloka: ['#FFD25E', '#FF8A2B', '#FFF0B8'],
};

const HUE: Record<string, string> = { ember: '#FF6A1A', crimson: '#E02848', green: '#3FD08A' };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function useLoop(ms: number, paused: boolean, from = 0) {
  const v = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    if (paused) return;
    const l = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: nd }));
    v.setValue(from);
    l.start();
    return () => l.stop();
  }, [v, ms, paused, from]);
  return v;
}

function usePulse(ms: number, paused: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (paused) return;
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: nd }),
        Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: nd }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [v, ms, paused]);
  return v;
}

function Stars({ paused, tint }: { paused: boolean; tint: string }) {
  const groups = useMemo(() => {
    const r = rng(7);
    return [0, 1, 2].map(() =>
      Array.from({ length: 34 }, () => ({ x: r() * SW, y: r() * SH, r: 0.5 + r() * 1.5 })),
    );
  }, []);
  const a = usePulse(1700, paused);
  const b = usePulse(2300, paused);
  const c = usePulse(3100, paused);
  const ops = [a, b, c];
  return (
    <>
      {groups.map((g, i) => (
        <Animated.View key={i} pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: ops[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }]}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
            {g.map((s, j) => (
              <Circle key={j} cx={s.x} cy={s.y} r={s.r} fill={j % 7 === 0 ? tint : '#FFFFFF'} />
            ))}
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

/** Soft coloured clouds of light that drift and breathe. */
function Nebula({ kind, hue, paused }: { kind: Loka; hue?: string; paused: boolean }) {
  const cols = hue ? [hue, ...NEBULA[kind].slice(0, 2)] : NEBULA[kind];
  const t = usePulse(7000, paused);
  const spots = [
    { x: 90, y: 220, r: 260 },
    { x: 330, y: 460, r: 300 },
    { x: 140, y: 650, r: 240 },
  ];
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) }, { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [8, -8] }) }, { scale: 1.12 }] },
      ]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          {spots.map((s, i) => (
            <RadialGradient key={i} id={`nb${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={cols[i % cols.length]} stopOpacity={kind === 'vaikuntam' ? 0.55 : 0.5} />
              <Stop offset="1" stopColor={cols[i % cols.length]} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {spots.map((s, i) => (
          <Ellipse key={i} cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.72} fill={`url(#nb${i})`} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Galaxy({ paused, hue }: { paused: boolean; hue?: string }) {
  const spin = useLoop(90000, paused);
  const arms = useMemo(() => {
    const r = rng(21);
    const pts: { x: number; y: number; r: number; o: number }[] = [];
    for (let arm = 0; arm < 3; arm++) {
      for (let i = 0; i < 90; i++) {
        const t = i / 90;
        const ang = arm * 2.094 + t * 5.2;
        const rad = 14 + t * 150;
        pts.push({ x: Math.cos(ang) * rad + (r() - 0.5) * (8 + t * 26), y: Math.sin(ang) * rad * 0.5 + (r() - 0.5) * (5 + t * 14), r: 0.7 + r() * 1.8 * (1 - t * 0.4), o: 0.35 + r() * 0.65 });
      }
    }
    return pts;
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: '8%', height: 520, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '342deg'] }) }] }}>
      <Svg width={520} height={520} viewBox="-190 -190 380 380">
        <Defs>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF4D6" stopOpacity={1} />
            <Stop offset="0.25" stopColor={hue ?? '#FFC879'} stopOpacity={0.8} />
            <Stop offset="1" stopColor={hue ?? '#9B5CFF'} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={0} cy={0} rx={190} ry={95} fill="url(#core)" opacity={0.7} />
        {arms.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 5 === 0 ? '#FFD6A0' : '#CFE4FF'} opacity={p.o} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Vaikuntam({ paused }: { paused: boolean }) {
  const w = usePulse(3600, paused);
  const glow = usePulse(4500, paused);
  const drift = useLoop(60000, paused);
  return (
    <>
      {/* a vast pearl glow where the lotus-seat rises */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="vg" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
              <Stop offset="0.35" stopColor="#BFE3FF" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#6BA7FF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={200} cy={400} rx={250} ry={300} fill="url(#vg)" />
        </Svg>
      </Animated.View>
      {/* clouds drifting */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX: drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-30, 30, -30] }) }] }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
          {[[70, 330, 120], [310, 270, 150], [180, 480, 190], [350, 540, 120]].map(([x, y, r], i) => (
            <G key={i} opacity={0.5}>
              <Ellipse cx={x} cy={y} rx={r} ry={r * 0.22} fill="#FFFFFF" opacity={0.35} />
              <Ellipse cx={x + r * 0.25} cy={y - r * 0.1} rx={r * 0.6} ry={r * 0.16} fill="#FFFFFF" opacity={0.4} />
            </G>
          ))}
        </Svg>
      </Animated.View>
      {/* the milk ocean */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top: '58%' }]}>
        <LinearGradient colors={['rgba(210,236,255,0.0)', 'rgba(200,230,255,0.55)', 'rgba(150,205,250,0.9)']} style={StyleSheet.absoluteFill} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              top: `${12 + i * 17}%`,
              height: 2,
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: 2,
              opacity: w.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [0.15, 0.7] : [0.7, 0.15] }),
              transform: [{ translateX: w.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [-18, 18] : [18, -18] }) }],
            }}
          />
        ))}
      </View>
    </>
  );
}

function Kailasam({ paused }: { paused: boolean }) {
  const au = usePulse(5200, paused);
  return (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: au.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] }), transform: [{ translateX: au.interpolate({ inputRange: [0, 1], outputRange: [-26, 26] }) }] }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LG id="au1" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4FE3C1" stopOpacity={0} />
              <Stop offset="0.5" stopColor="#4FE3C1" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#6E8CFF" stopOpacity={0} />
            </LG>
          </Defs>
          <Path d="M-40 250 C80 120 200 330 440 150 L440 330 C240 470 100 250 -40 400 Z" fill="url(#au1)" />
          <Path d="M-40 360 C120 250 260 420 440 280 L440 400 C260 520 120 360 -40 470 Z" fill="url(#au1)" opacity={0.6} />
        </Svg>
      </Animated.View>
      {/* moon */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice" pointerEvents="none">
        <Defs>
          <RadialGradient id="moon" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="0.3" stopColor="#E8F0FF" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#8FB0FF" stopOpacity={0} />
          </RadialGradient>
          <LG id="peak" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F4F8FF" />
            <Stop offset="0.45" stopColor="#9DB4E8" />
            <Stop offset="1" stopColor="#1B2D5E" />
          </LG>
          <LG id="peak2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6F89C8" />
            <Stop offset="1" stopColor="#0C1736" />
          </LG>
        </Defs>
        <Circle cx={290} cy={190} r={110} fill="url(#moon)" />
        <Circle cx={290} cy={190} r={24} fill="#FFFFFF" />
        <Path d="M0 640 L110 520 L190 590 L290 470 L400 600 L400 800 L0 800 Z" fill="url(#peak2)" />
        <Path d="M60 800 L200 330 L340 800 Z" fill="url(#peak)" />
        <Path d="M200 330 L168 470 L192 452 L205 500 L226 458 L246 480 Z" fill="#FFFFFF" opacity={0.85} />
        <Path d="M0 740 Q200 690 400 740 L400 800 L0 800 Z" fill="#070F26" />
      </Svg>
    </>
  );
}

function Brahmaloka({ paused }: { paused: boolean }) {
  const a = useLoop(70000, paused);
  const b = useLoop(110000, paused);
  const glow = usePulse(3800, paused);
  const ring = (r: number, dash: string, w: number) => (
    <Circle cx={0} cy={0} r={r} fill="none" stroke="#FFE3A0" strokeWidth={w} strokeDasharray={dash} opacity={0.75} />
  );
  return (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFBE6" stopOpacity={1} />
              <Stop offset="0.2" stopColor="#FFD86B" stopOpacity={0.9} />
              <Stop offset="0.6" stopColor="#FF9A2B" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#FF7A00" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={200} cy={330} r={330} fill="url(#sun)" />
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 330 - 200, height: 400, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: a.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
        <Svg width={400} height={400} viewBox="-200 -200 400 400">
          {ring(190, '2 10', 3)}
          {ring(150, '14 8', 1.5)}
          {Array.from({ length: 12 }, (_, i) => (
            <Path key={i} d="M0 -120 C14 -92 14 -70 0 -52 C-14 -70 -14 -92 0 -120Z" fill="#FFE9B0" opacity={0.55} transform={`rotate(${i * 30})`} />
          ))}
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 330 - 200, height: 400, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: b.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) }] }}>
        <Svg width={400} height={400} viewBox="-200 -200 400 400">
          {ring(110, '1 7', 2.5)}
          {Array.from({ length: 8 }, (_, i) => (
            <Path key={i} d="M0 -96 C10 -78 10 -64 0 -50 C-10 -64 -10 -78 0 -96Z" fill="#FFF6D8" opacity={0.7} transform={`rotate(${i * 45 + 22.5})`} />
          ))}
        </Svg>
      </Animated.View>
      {/* lotus seat */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid slice" pointerEvents="none">
        <Defs>
          <LG id="lot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF0C2" />
            <Stop offset="1" stopColor="#E0841B" />
          </LG>
        </Defs>
        <G transform="translate(200 700)">
          {[-60, -36, -14, 14, 36, 60].map((r, i) => (
            <Path key={i} d="M0 0 C-26 -30 -26 -76 0 -112 C26 -76 26 -30 0 0Z" fill="url(#lot)" opacity={0.92} transform={`rotate(${r}) scale(${1 - Math.abs(r) / 260})`} />
          ))}
          <Path d="M0 0 C-26 -30 -26 -76 0 -112 C26 -76 26 -30 0 0Z" fill="#FFF8E0" />
        </G>
      </Svg>
    </>
  );
}

/** A full-bleed story world. `depth` lets the caller add camera parallax per layer. */
export function Cosmos({ backdrop, paused, layer }: { backdrop: Backdrop; paused: boolean; layer?: (d: number) => object }) {
  const { kind, hue } = lokaFor(backdrop);
  const tint = hue === 'calm' ? undefined : HUE[hue];
  const Wrap = layer ? Animated.View : View;
  const lay = (d: number) => (layer ? layer(d) : undefined);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={SKY[kind]} style={StyleSheet.absoluteFill} />
      <Wrap style={[StyleSheet.absoluteFill, lay(0.4)]}>
        <Nebula kind={kind} hue={tint} paused={paused} />
        <Stars paused={paused} tint={tint ?? '#FFE6B0'} />
      </Wrap>
      <Wrap style={[StyleSheet.absoluteFill, lay(0.9)]}>
        {kind === 'cosmos' && <Galaxy paused={paused} hue={tint} />}
        {kind === 'vaikuntam' && <Vaikuntam paused={paused} />}
        {kind === 'kailasam' && <Kailasam paused={paused} />}
        {kind === 'brahmaloka' && <Brahmaloka paused={paused} />}
      </Wrap>
    </View>
  );
}
