import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';
const native = Platform.OS !== 'web';

/** A golden mandala that breathes slowly when idle, quickens when it listens, spins while it thinks, swells while it speaks. */
export function VoiceOrb({ state, size = 220 }: { state: OrbState; size?: number }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const d = state === 'idle' ? 2600 : state === 'listening' ? 900 : state === 'speaking' ? 620 : 1400;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(breathe, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [state, breathe]);
  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: state === 'thinking' ? 4000 : 24000, easing: Easing.linear, useNativeDriver: native }));
    a.start();
    return () => a.stop();
  }, [state, spin]);
  const big = state === 'speaking' ? 1.14 : state === 'listening' ? 1.1 : 1.05;
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, big] });
  const ring = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const ringO = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  const hue = state === 'listening' ? '#FFE9A8' : '#FFC85A';
  return (
    <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {state !== 'idle' && <Animated.View style={{ position: 'absolute', width: size * 0.7, height: size * 0.7, borderRadius: size, borderWidth: 2, borderColor: '#FFD27A', opacity: ringO, transform: [{ scale: ring }] }} />}
      <Animated.View style={{ transform: [{ scale }, { rotate: rot }] }}>
        <Svg width={size} height={size} viewBox="-100 -100 200 200">
          <Defs>
            <RadialGradient id="g" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFF3C4" stopOpacity="1" />
              <Stop offset="0.45" stopColor={hue} stopOpacity="0.95" />
              <Stop offset="1" stopColor="#8E3B12" stopOpacity="0.9" />
            </RadialGradient>
          </Defs>
          <Circle r="92" fill="url(#g)" opacity={0.92} />
          <G stroke="#FFF6DA" strokeWidth="1.3" fill="none" opacity={0.85}>
            {petals.map((r) => (
              <Path key={r} transform={`rotate(${r})`} d="M0 -88 C14 -66 14 -40 0 -18 C-14 -40 -14 -66 0 -88Z" />
            ))}
            {petals.map((r) => (
              <Path key={`i${r}`} transform={`rotate(${r + 15})`} d="M0 -58 C8 -44 8 -30 0 -16 C-8 -30 -8 -44 0 -58Z" />
            ))}
            <Circle r="12" />
            <Circle r="92" strokeWidth="2" />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
