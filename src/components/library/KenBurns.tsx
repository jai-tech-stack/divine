import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, type ImageSourcePropType, Platform, StyleSheet } from 'react-native';

const native = Platform.OS !== 'web';

/** Slow camera drift over a still picture, so a poster feels like a film frame. */
export function KenBurns({ source, active = true, variant = 0 }: { source: ImageSourcePropType; active?: boolean; variant?: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active) {
      v.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, v]);
  const dir = variant % 2 === 0 ? 1 : -1;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1.2] }) },
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 18 * dir] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          ],
        },
      ]}>
      <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </Animated.View>
  );
}

/** Fades and lifts its children in whenever `show` becomes true. */
export function Reveal({ show, delay = 0, children }: { show: boolean; delay?: number; children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (show) Animated.timing(v, { toValue: 1, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
    else v.setValue(0);
  }, [show, delay, v]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }}>{children}</Animated.View>;
}
