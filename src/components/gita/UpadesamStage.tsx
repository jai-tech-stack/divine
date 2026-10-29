import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';

import { SCENES } from '@/content/deities';
import { Particles } from '@/components/cinema/Effects';

const native = Platform.OS !== 'web';

export type Focus = 'krishna' | 'arjuna' | 'wide' | 'hand';

/** Where faces sit in each upadesam painting (fractions of the square image). */
const ART = {
  upadesam: { src: SCENES.krishnaArjuna, krishna: [0.62, 0.24], arjuna: [0.3, 0.8], hand: [0.41, 0.42] },
  vishwaroopa: { src: SCENES.vishwaroopa, krishna: [0.69, 0.16], arjuna: [0.28, 0.86], hand: [0.5, 0.35] },
} as const;

const SCALE: Record<Focus, number> = { krishna: 1.45, arjuna: 1.75, hand: 1.6, wide: 1.02 };

/**
 * The Gita as a living dialogue: one painting of Krishna teaching Arjuna, and a camera that
 * moves to whoever is speaking. A soft light pulses from Krishna's raised hand.
 */
export function UpadesamStage({ focus, variant = 'upadesam', dim = 0, glow = true }: { focus: Focus; variant?: keyof typeof ART; dim?: number; glow?: boolean }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [tx] = useState(() => new Animated.Value(0));
  const [ty] = useState(() => new Animated.Value(0));
  const [sc] = useState(() => new Animated.Value(1.1));
  const [pulse] = useState(() => new Animated.Value(0));
  const art = ART[variant];
  const L = Math.max(box.w, box.h);

  const target = useMemo(() => {
    if (!L) return { x: 0, y: 0, s: 1.1 };
    const s = SCALE[focus];
    const [fx, fy] = focus === 'wide' ? [0.5, 0.5] : art[focus];
    const maxX = Math.max(0, (s * L - box.w) / 2);
    const maxY = Math.max(0, (s * L - box.h) / 2);
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    return { x: clamp(-s * (fx - 0.5) * L, maxX), y: clamp(-s * (fy - 0.5) * L, maxY), s };
  }, [focus, L, box.w, box.h, art]);

  useEffect(() => {
    const cfg = { duration: 1600, easing: Easing.inOut(Easing.cubic), useNativeDriver: native };
    Animated.parallel([Animated.timing(tx, { toValue: target.x, ...cfg }), Animated.timing(ty, { toValue: target.y, ...cfg }), Animated.timing(sc, { toValue: target.s, ...cfg })]).start();
  }, [target, tx, ty, sc]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const [hx, hy] = art.hand;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: '#000' }]} onLayout={onLayout}>
      {L > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            width: L,
            height: L,
            left: (box.w - L) / 2,
            top: (box.h - L) / 2,
            transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
          }}>
          <Image source={art.src} style={{ width: L, height: L }} resizeMode="cover" />
          {glow && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: hx * L - L * 0.09,
                top: hy * L - L * 0.09,
                width: L * 0.18,
                height: L * 0.18,
                borderRadius: L,
                backgroundColor: '#ffe7a3',
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.42] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] }) }],
                shadowColor: '#ffd36b',
                shadowOpacity: 1,
                shadowRadius: 30,
              }}
            />
          )}
        </Animated.View>
      )}
      <Particles kind="dust" paused={false} />
      {dim > 0 && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(7,11,20,${dim})` }]} />}
    </View>
  );
}

/** Which way the camera should look for a speaker line. */
export function focusForSpeaker(speaker: string): Focus {
  if (speaker.startsWith('அர்ஜுன')) return 'arjuna';
  if (speaker.startsWith('ஸ்ரீ பகவான்')) return 'krishna';
  return 'wide';
}

/** Who is speaking to whom, in plain Tamil. */
export function dialogueLine(speaker: string): string {
  if (speaker.startsWith('அர்ஜுன')) return 'அர்ஜுனன் கிருஷ்ணரிடம்';
  if (speaker.startsWith('ஸ்ரீ பகவான்')) return 'கிருஷ்ணர் அர்ஜுனனிடம்';
  if (speaker.startsWith('சஞ்சய')) return 'சஞ்சயன் திருதராஷ்டிரனிடம்';
  return 'திருதராஷ்டிரன் சஞ்சயனிடம்';
}
