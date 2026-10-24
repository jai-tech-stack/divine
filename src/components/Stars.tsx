import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

const native = Platform.OS !== 'web';

/** Quietly twinkling star field for the dark practice screens. */
export function Stars({ count = 34, height = '100%' as `${number}%` }) {
  const stars = useMemo(
    () => Array.from({ length: count }, () => ({ l: Math.random() * 100, t: Math.random() * 100, s: Math.random() > 0.75 ? 3 : 2, d: 2500 + Math.random() * 3500, delay: Math.random() * 3000 })),
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
  const v = useRef(new Animated.Value(0)).current;
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
