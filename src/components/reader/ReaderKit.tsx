import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Prefs, setPrefs, usePrefs } from '@/lib/prefs';
import { C, F } from '@/theme';

/** Reading palettes. Sepia is the default: warm paper, dark ink — easiest for long Tamil text. */
export const PALETTE = {
  dark: { bg: '#0B1120', card: '#131C2F', line: 'rgba(227,184,101,0.18)', ink: '#F3E6C8', sub: '#C9BB9B', accent: '#E3B865', verse: '#F6DFA4', hi: 'rgba(227,184,101,0.18)', chip: '#1B2540' },
  sepia: { bg: '#F6EEDD', card: '#FFF9EC', line: '#E6D5B0', ink: '#2B1D0E', sub: '#6E5A3E', accent: '#A8641B', verse: '#5A2A0A', hi: '#F7E2B5', chip: '#EFE2C4' },
  light: { bg: '#F5F5F2', card: '#FFFFFF', line: '#E4E0D6', ink: '#1C1C1C', sub: '#5D5D5D', accent: '#B5651D', verse: '#3D2306', hi: '#FCEFCF', chip: '#ECE8DE' },
} as const;
export type Palette = (typeof PALETTE)[keyof typeof PALETTE];

export function usePalette(): { pal: Palette; prefs: Prefs } {
  const prefs = usePrefs();
  return { pal: PALETTE[prefs.readTheme] ?? PALETTE.sepia, prefs };
}

export const SCRIPT_LABEL = { ta: 'தமிழ்', sa: 'संस्कृत', en: 'English' } as const;
export const MEANING_LABEL = { ta: 'தமிழ்', en: 'English' } as const;

/** Font for a script, scaled. */
export function verseFont(script: 'ta' | 'sa' | 'en', scale: number, base = 20) {
  const size = Math.round(base * scale);
  if (script === 'sa') return { fontFamily: F.deva, fontSize: size + 1, lineHeight: Math.round((size + 1) * 1.75) };
  if (script === 'en') return { fontFamily: undefined, fontStyle: 'italic' as const, fontSize: size - 1, lineHeight: Math.round(size * 1.6) };
  return { fontFamily: F.taSemi, fontSize: size, lineHeight: Math.round(size * 1.75) };
}
export function bodyFont(lang: 'ta' | 'en', scale: number, base = 16) {
  const size = Math.round(base * scale);
  return lang === 'en' ? { fontSize: size + 1, lineHeight: Math.round((size + 1) * 1.55) } : { fontFamily: F.ta, fontSize: size, lineHeight: Math.round(size * 1.75) };
}

/** Compact segmented control. */
export function Segment<T extends string>({ value, options, onChange, pal }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; pal: Palette }) {
  return (
    <View style={[st.seg, { backgroundColor: pal.chip, borderColor: pal.line }]}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable key={o.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.id)} style={[st.segBtn, on && { backgroundColor: pal.accent }]}>
            <Text style={[st.segT, { color: on ? '#fff' : pal.ink, fontFamily: o.id === 'sa' ? F.deva : F.taSemi }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The quick language bar shown at the top of a reader. */
export function LangBar({ pal, onSettings }: { pal: Palette; onSettings: () => void }) {
  const prefs = usePrefs();
  return (
    <View style={[st.langBar, { backgroundColor: pal.bg, borderBottomColor: pal.line }]}>
      <Segment pal={pal} value={prefs.script} onChange={(script) => setPrefs({ script })} options={(['ta', 'sa', 'en'] as const).map((id) => ({ id, label: SCRIPT_LABEL[id] }))} />
      <Pressable accessibilityRole="button" accessibilityLabel="வாசிப்பு அமைப்புகள்" onPress={onSettings} style={[st.aa, { borderColor: pal.line, backgroundColor: pal.chip }]}>
        <Ionicons name="text-outline" size={18} color={pal.ink} />
        <Ionicons name="options-outline" size={16} color={pal.ink} />
      </Pressable>
    </View>
  );
}

/** Bottom sheet with every reading setting. */
export function ReaderSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pal, prefs } = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.scrim} onPress={onClose} accessibilityLabel="மூடு" />
      <View style={[st.sheet, { backgroundColor: pal.card, paddingBottom: insets.bottom + 18 }]}>
        <View style={[st.grab, { backgroundColor: pal.line }]} />
        <Text style={[st.sheetH, { color: pal.ink }]}>வாசிப்பு அமைப்புகள்</Text>

        <Row label="சுலோக எழுத்து" pal={pal}>
          <Segment pal={pal} value={prefs.script} onChange={(script) => setPrefs({ script })} options={(['ta', 'sa', 'en'] as const).map((id) => ({ id, label: SCRIPT_LABEL[id] }))} />
        </Row>
        <Row label="பொருள் மொழி" pal={pal}>
          <Segment pal={pal} value={prefs.meaning} onChange={(meaning) => setPrefs({ meaning })} options={(['ta', 'en'] as const).map((id) => ({ id, label: MEANING_LABEL[id] }))} />
        </Row>
        <Row label="இரண்டாம் எழுத்தும் காட்டு" pal={pal}>
          <Segment pal={pal} value={prefs.showTranslit ? 'on' : 'off'} onChange={(v) => setPrefs({ showTranslit: v === 'on' })} options={[{ id: 'on', label: 'ஆம்' }, { id: 'off', label: 'இல்லை' }]} />
        </Row>
        <Row label="எழுத்து அளவு" pal={pal}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable accessibilityLabel="சிறிதாக்கு" onPress={() => setPrefs({ fontScale: Math.max(0.8, +(prefs.fontScale - 0.1).toFixed(2)) })} style={[st.round, { borderColor: pal.line }]}>
              <Text style={{ color: pal.ink, fontSize: 14, fontWeight: '700' }}>அ−</Text>
            </Pressable>
            <Text style={{ color: pal.sub, minWidth: 44, textAlign: 'center' }}>{Math.round(prefs.fontScale * 100)}%</Text>
            <Pressable accessibilityLabel="பெரிதாக்கு" onPress={() => setPrefs({ fontScale: Math.min(1.6, +(prefs.fontScale + 0.1).toFixed(2)) })} style={[st.round, { borderColor: pal.line }]}>
              <Text style={{ color: pal.ink, fontSize: 18, fontWeight: '700' }}>அ+</Text>
            </Pressable>
          </View>
        </Row>
        <Row label="பின்னணி" pal={pal}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['sepia', 'light', 'dark'] as const).map((t) => (
              <Pressable key={t} accessibilityRole="button" accessibilityLabel={t} onPress={() => setPrefs({ readTheme: t })} style={[st.swatch, { backgroundColor: PALETTE[t].bg, borderColor: prefs.readTheme === t ? pal.accent : pal.line }]}>
                <Text style={{ color: PALETTE[t].ink, fontFamily: F.taSemi }}>அ</Text>
              </Pressable>
            ))}
          </View>
        </Row>
      </View>
    </Modal>
  );
}

function Row({ label, pal, children }: { label: string; pal: Palette; children: React.ReactNode }) {
  return (
    <View style={[st.row, { borderTopColor: pal.line }]}>
      <Text style={[st.rowL, { color: pal.sub }]}>{label}</Text>
      {children}
    </View>
  );
}

/** Sticky bottom player: play/pause, current line, repeat, speed. */
export function AudioBar({
  pal,
  playing,
  title,
  sub,
  onToggle,
  onPrev,
  onNext,
  right,
}: {
  pal: Palette;
  playing: boolean;
  title: string;
  sub?: string;
  onToggle: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.bar, { backgroundColor: pal.card, borderTopColor: pal.line, paddingBottom: insets.bottom + 8 }]}>
      {onPrev && (
        <Pressable accessibilityRole="button" accessibilityLabel="முந்தைய" onPress={onPrev} hitSlop={8} style={st.barSide}>
          <Ionicons name="play-skip-back" size={20} color={pal.ink} />
        </Pressable>
      )}
      <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'நிறுத்து' : 'கேளுங்கள்'} onPress={onToggle} style={[st.play, { backgroundColor: pal.accent }]}>
        <Ionicons name={playing ? 'pause' : 'play'} size={22} color="#fff" style={playing ? undefined : { marginLeft: 3 }} />
      </Pressable>
      {onNext && (
        <Pressable accessibilityRole="button" accessibilityLabel="அடுத்தது" onPress={onNext} hitSlop={8} style={st.barSide}>
          <Ionicons name="play-skip-forward" size={20} color={pal.ink} />
        </Pressable>
      )}
      <View style={{ flex: 1, marginLeft: 6 }}>
        <Text numberOfLines={1} style={{ color: pal.ink, fontFamily: F.taSemi, fontSize: 13.5 }}>
          {title}
        </Text>
        {!!sub && (
          <Text numberOfLines={1} style={{ color: pal.sub, fontFamily: F.ta, fontSize: 11.5 }}>
            {sub}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const st = StyleSheet.create({
  seg: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, padding: 3 },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, minHeight: 32, justifyContent: 'center' },
  segT: { fontSize: 13 },
  langBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  aa: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, minHeight: 38 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 8 },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 10 },
  sheetH: { fontFamily: F.taBold, fontSize: 17, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, gap: 10, flexWrap: 'wrap' },
  rowL: { fontFamily: F.taSemi, fontSize: 13.5 },
  round: { width: 44, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 44, height: 40, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  barSide: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  play: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});

export { C };
