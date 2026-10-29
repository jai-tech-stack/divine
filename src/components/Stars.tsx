import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

const native = Platform.OS !== 'web';

// Stable pseudo-random positions keep decorative layouts consistent across renders.
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** Quietly twinkling star field for the dark practice screens. */
export function Stars({ count = 34, height = '100%' as `${number}%` }) {
  const stars = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ l: noise(i * 17 + 1) * 100, t: noise(i * 17 + 2) * 100, s: noise(i * 17 + 3) > 0.75 ? 3 : 2, d: 2500 + noise(i * 17 + 4) * 3500, delay: noise(i * 17 + 5) * 3000 })),
    [count],
  );
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height }]}>
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </View>
  );
}

function Star({ l, t, s, d, delay }: { l: number; t: number; s: number; d: number; delay: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: d / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: d / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, d, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${l}%`,
        top: `${t}%`,
        width: s,
        height: s,
        borderRadius: s,
        backgroundColor: '#F3E6C8',
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.85] }),
      }}
    />
  );
}
