import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, Platform, StyleSheet } from 'react-native';

import type { Scene } from '@/content/types';
import { getLayers } from './backdrops';
import { Cosmos } from './Cosmos';
import { Particles, Vignette } from './Effects';

const native = Platform.OS !== 'web';

/**
 * One full-screen story scene: a painted backdrop in three parallax layers (or an artwork
 * image when the scene has one), a slow camera move, light rays, particles and an entry effect.
 */
export function CinematicScene({ scene, durationMs, paused }: { scene: Scene; durationMs: number; paused: boolean }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [cam] = useState(() => new Animated.Value(0));
  const [fx] = useState(() => new Animated.Value(0));
  const [shake] = useState(() => new Animated.Value(0));
  const layers = useMemo(() => getLayers(scene.backdrop), [scene.backdrop]);
  const pos = useRef(0);

  useEffect(() => {
    const id = cam.addListener(({ value }) => (pos.current = value));
    return () => cam.removeListener(id);
  }, [cam]);

  // camera move: resumes from where it was paused
  useEffect(() => {
    if (paused) {
      cam.stopAnimation();
      return;
    }
    const remaining = Math.max(300, durationMs * (1 - pos.current));
    const a = Animated.timing(cam, { toValue: 1, duration: remaining, easing: Easing.inOut(Easing.quad), useNativeDriver: native });
    a.start();
    return () => a.stop();
  }, [paused, durationMs, cam]);

  // entry effect
  useEffect(() => {
    if (scene.effect === 'lightning') {
      const flash = () =>
        Animated.sequence([
          Animated.timing(fx, { toValue: 0.85, duration: 60, useNativeDriver: native }),
          Animated.timing(fx, { toValue: 0, duration: 120, useNativeDriver: native }),
          Animated.timing(fx, { toValue: 0.5, duration: 50, useNativeDriver: native }),
          Animated.timing(fx, { toValue: 0, duration: 500, useNativeDriver: native }),
        ]);
      const loop = Animated.loop(Animated.sequence([Animated.delay(600), flash(), Animated.delay(3800)]));
      loop.start();
      return () => loop.stop();
    }
    if (scene.effect === 'bloom') {
      fx.setValue(0.75);
      Animated.timing(fx, { toValue: 0, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
    }
    if (scene.effect === 'tremor') {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      const s = (to: number) => Animated.timing(shake, { toValue: to, duration: 55, useNativeDriver: native });
      const quake = Animated.sequence([s(6), s(-6), s(5), s(-5), s(3), s(-3), s(0)]);
      const loop = Animated.loop(Animated.sequence([Animated.delay(400), quake, Animated.delay(2600)]), { iterations: 3 });
      loop.start();
      return () => loop.stop();
    }
  }, [scene.effect, fx, shake]);

  const { zoom, panX, panY = [0, 0] } = scene.camera;
  const layer = (depth: number) => ({
    transform: [
      { translateX: cam.interpolate({ inputRange: [0, 1], outputRange: [panX[0] * depth, panX[1] * depth] }) },
      { translateY: cam.interpolate({ inputRange: [0, 1], outputRange: [panY[0] * depth, panY[1] * depth] }) },
      { scale: cam.interpolate({ inputRange: [0, 1], outputRange: [1 + (zoom[0] - 1) * depth, 1 + (zoom[1] - 1) * depth] }) },
    ],
  });

  const flashColor = scene.effect === 'lightning' ? '#ffd8d0' : '#fff3d6';

  return (
    <Animated.View onLayout={(e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={[StyleSheet.absoluteFill, { backgroundColor: '#000', transform: [{ translateX: shake }] }]}>
      {scene.image ? (
        (() => {
          // the artwork is wide; fit it to the screen height and drift slowly across it
          const aspect = scene.imageAspect ?? 1.5;
          const ih = box.h * 1.06;
          const iw = Math.max(box.w * 1.06, ih * aspect);
          const ov = Math.max(0, iw - box.w);
          const [f0, f1] = scene.focus ?? [0.4, 0.6];
          return (
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: -(ih - box.h) / 2,
                width: iw,
                height: ih,
                transform: [
                  { translateX: cam.interpolate({ inputRange: [0, 1], outputRange: [-ov * f0, -ov * f1] }) },
                  { scale: cam.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) },
                ],
              }}>
              <Image source={scene.image} style={{ width: iw, height: ih }} resizeMode="cover" />
            </Animated.View>
          );
        })()
      ) : (
        <Cosmos backdrop={scene.backdrop} paused={paused} layer={layer} />
      )}
      <Particles kind={scene.particles} paused={paused} />
      <Vignette />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: flashColor, opacity: fx }]} />
      <LinearGradient pointerEvents="none" colors={['transparent', layers.shade + 'cc', layers.shade]} style={styles.shade} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bleed: { position: 'absolute', left: '-6%', right: '-6%', top: '-4%', bottom: '-4%' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%' },
});
