import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { C, F } from '@/theme';

export function GoldButton({ label, onPress, icon, style, outline }: { label: string; onPress: () => void; icon?: React.ReactNode; style?: ViewStyle; outline?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [outline ? s.outline : s.gold, pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 }, style]}>
      {icon}
      <Text style={[s.btnText, outline && { color: C.cream, fontFamily: F.ta }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ label, onPress, children, style }: { label: string; onPress: () => void; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={({ pressed }) => [s.icon, pressed && { opacity: 0.7 }, style]}>
      {children}
    </Pressable>
  );
}

export function T({ style, children, numberOfLines }: { style?: TextStyle | TextStyle[]; children: React.ReactNode; numberOfLines?: number }) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: F.ta, color: C.cream, fontSize: 15, lineHeight: 26 }, style]}>
      {children}
    </Text>
  );
}

export function Badge({ text, tone = 'gold' }: { text: string; tone?: 'gold' | 'muted' }) {
  return (
    <View style={[s.badge, tone === 'muted' && { borderColor: 'rgba(201,187,155,0.4)', backgroundColor: 'transparent' }]}>
      <Text style={[s.badgeText, tone === 'muted' && { color: C.muted }]}>{text}</Text>
    </View>
  );
}

/** Real icon set (Ionicons via @expo/vector-icons) — same call style as before. */
const I = (name: React.ComponentProps<typeof Ionicons>['name'], size: number, color: string) => <Ionicons name={name} size={size} color={color} />;

export const Icons = {
  back: (c = C.gold) => I('arrow-back', 24, c),
  close: (c = C.cream) => I('close', 24, c),
  play: (c = C.ink, size = 18) => I('play', size, c),
  pause: (c = C.ink, size = 18) => I('pause', size, c),
  stop: (c = C.cream) => I('stop', 18, c),
  reset: (c = C.cream) => I('refresh', 20, c),
  speaker: (c = C.gold, muted = false) => I(muted ? 'volume-mute-outline' : 'volume-high-outline', 22, c),
  arrow: (c = C.gold) => I('arrow-forward', 20, c),
  send: (c = C.ink) => I('send', 20, c),
  star: (c = C.cream, on = false) => I(on ? 'bookmark' : 'bookmark-outline', 20, c),
  share: (c = C.cream) => I('share-social-outline', 20, c),
  heart: (c = C.cream, on = false, size = 20) => I(on ? 'heart' : 'heart-outline', size, c),
  check: (c = C.ink, size = 16) => I('checkmark', size, c),
  checkCircle: (c = C.gold, size = 14) => I('checkmark-circle', size, c),
  prev: (c = C.cream) => I('chevron-back', 18, c),
  next: (c = C.ink) => I('chevron-forward', 18, c),
  open: (c = C.cream) => I('open-outline', 20, c),
  flame: (c = C.gold, size = 18) => I('flame', size, c),
};

const s = StyleSheet.create({
  gold: {
    height: 56,
    borderRadius: 16,
    backgroundColor: C.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    shadowColor: C.goldDark,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  outline: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(227,184,101,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  btnText: { fontFamily: F.taBold, fontSize: 16, color: C.ink },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: C.panelLine, backgroundColor: 'rgba(227,184,101,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: F.ta, fontSize: 11.5, color: C.goldLight },
});
