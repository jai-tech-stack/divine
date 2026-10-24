import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Particles as ParticleKind } from '@/content/types';

const native = Platform.OS !== 'web';

type P = { left: number; top: number; size: number; dur: number; delay: number; drift: number; rise: number };

const LOOK: Record<Exclude<ParticleKind, 'none'>, { color: string; count: number; size: [number, number]; dur: [number, number]; rise: number; drift: number; round: boolean; glow: boolean }> = {
  dust: { color: '#ffe2b0', count: 26, size: [1.5, 3.5], dur: [7000, 13000], rise: 70, drift: 40, round: true, glow: false },
  embers: { color: '#ff8a3a', count: 30, size: [2, 4.5], dur: [3500, 7000], rise: 420, drift: 60, round: true, glow: true },
  sparks: { color: '#fff0b8', count: 34, size: [1.5, 3.5], dur: [2500, 5000], rise: 360, drift: 30, round: true, glow: true },
  petals: { color: '#f4a3b6', count: 18, size: [6, 10], dur: [6000, 11000], rise: -720, drift: 90, round: false, glow: false },
  stars: { color: '#ffffff', count: 40, size: [1, 2.6], dur: [2000, 5000], rise: 0, drift: 0, round: true, glow: true },
};

export function Particles({ kind, paused }: { kind: ParticleKind; paused: boolean }) {
  const look = kind === 'none' ? null : LOOK[kind];
  const items = useMemo<P[]>(() => {
    if (!look) return [];
    return Array.from({ length: look.count }, () => ({
      left: Math.random() * 100,
      top: look.rise < 0 ? -10 + Math.random() * 30 : 25 + Math.random() * 80,
      size: look.size[0] + Math.random() * (look.size[1] - look.size[0]),
      dur: look.dur[0] + Math.random() * (look.dur[1] - look.dur[0]),
      delay: Math.random() * 4000,
      drift: (Math.random() - 0.5) * 2 * look.drift,
      rise: look.rise * (0.6 + Math.random() * 0.6),
    }));
  }, [look]);
  if (!look) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((p, i) => (
        <Particle key={i} p={p} color={look.color} round={look.round} glow={look.glow} twinkle={kind === 'stars'} paused={paused} />
      ))}
    </View>
  );
}

function Particle({ p, color, round, glow, twinkle, paused }: { p: P; color: string; round: boolean; glow: boolean; twinkle: boolean; paused: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (paused) {
      v.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(v, { toValue: 1, duration: p.dur, easing: Easing.linear, useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [paused, p, v]);
  const style = twinkle
    ? { opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 1, 0.15] }) }
    : {
        opacity: v.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.9, 0.7, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -p.rise] }) },
          { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.drift, p.drift * 0.3] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', round ? '0deg' : '540deg'] }) },
        ],
      };
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: round ? p.size : p.size * 0.6,
          borderRadius: p.size,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: glow ? 0.9 : 0,
          shadowRadius: glow ? 4 : 0,
        },
        style,
      ]}
    />
  );
}

/** Slowly turning god-rays centred on (x, y) in screen pixels. */
export function Rays({ x, y, color, opacity, paused }: { x: number; y: number; color: string; opacity: number; paused: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (paused) return;
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 90000, easing: Easing.linear, useNativeDriver: native }));
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [paused, spin, pulse]);
  const size = 1400;
  const n = 14;
  const polys = Array.from({ length: n }, (_, i) => {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = a0 + 0.09;
    const c = size / 2;
    return `${c},${c} ${c + Math.cos(a0) * c},${c + Math.sin(a0) * c} ${c + Math.cos(a1) * c},${c + Math.sin(a1) * c}`;
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [opacity * 0.6, opacity] }),
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="rayfade" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {polys.map((pts, i) => (
          <Polygon key={i} points={pts} fill="url(#rayfade)" />
        ))}
      </Svg>
    </Animated.View>
  );
}

export function Vignette({ strength = 0.75 }: { strength?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000" stopOpacity={strength} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#vig)" />
      </Svg>
    </View>
  );
}
