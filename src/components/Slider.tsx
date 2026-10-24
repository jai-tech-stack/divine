import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { C, F } from '@/theme';

/** Gold volume slider with a speaker icon and percentage, 0–100. */
export function VolumeSlider({ value, onChange, label = 'ஒலி அளவு' }: { value: number; onChange: (v: number) => void; label?: string }) {
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  const set = (x: number) => {
    if (!wRef.current) return;
    onChange(Math.round(Math.max(0, Math.min(1, x / wRef.current)) * 100));
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    }),
  ).current;
  const onLayout = (e: LayoutChangeEvent) => {
    wRef.current = e.nativeEvent.layout.width;
    setW(e.nativeEvent.layout.width);
  };
  return (
    <View style={s.row}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 9v6h4l5 4V5L8 9z" fill={C.gold} />
        <Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </Svg>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: value }}
        onAccessibilityAction={(e) => onChange(Math.max(0, Math.min(100, value + (e.nativeEvent.actionName === 'increment' ? 10 : -10))))}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        style={s.hit}
        onLayout={onLayout}
        {...pan.panHandlers}>
        <View pointerEvents="none" style={s.track}>
          <View style={[s.fill, { width: `${value}%` }]} />
        </View>
        <View pointerEvents="none" style={[s.thumb, { left: (w * value) / 100 - 10 }]} />
      </View>
      <Text style={s.pct}>{value}%</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hit: { flex: 1, height: 44, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: C.track, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.gold },
  thumb: { position: 'absolute', top: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: C.gold, shadowColor: C.gold, shadowOpacity: 0.7, shadowRadius: 8 },
  pct: { width: 46, textAlign: 'right', fontFamily: F.num, fontSize: 17, color: C.cream },
});
