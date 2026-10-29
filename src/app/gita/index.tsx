import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Focus, UpadesamStage } from '@/components/gita/UpadesamStage';
import { bodyFont, LangBar, ReaderSettings, usePalette } from '@/components/reader/ReaderKit';
import { chapterVerses, getEn, getNote, GITA_CHAPTERS, MOODS, speakerFor } from '@/content/gita';
import { streak, useProgress } from '@/lib/progress';
import { localDateKey } from '@/lib/date';
import { F } from '@/theme';

/** Gita home in the reading style: the upadesam scene, continue, feelings, 18 steps. */
export default function GitaHome() {
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const [settings, setSettings] = useState(false);
  const last = p.gitaLast ?? { c: 1, v: 1 };
  const [focus, setFocus] = useState<Focus>('krishna');
  const days = streak(p.streakDays);
  const lastEn = prefs.meaning === 'en' ? getEn(last.c, last.v) : undefined;
  const lastText = lastEn?.m ?? getNote(last.c, last.v)?.m ?? chapterVerses(last.c).find((x) => x.v === last.v)?.ta.split('\n')[0];
  const lastSpeaker = speakerFor(last.c, last.v).replace(' கூறினார்', '').replace(' கூறினான்', '');
  const todays = p.commitments.filter((x) => x.date === localDateKey());
  const totalRead = p.gitaRead.length;

  useEffect(() => {
    const seq: Focus[] = ['krishna', 'arjuna', 'hand', 'wide'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setFocus(seq[i]);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <View style={[st.appbar, { paddingTop: insets.top + 4 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={pal.ink} />
        </Pressable>
        <Text style={[st.appT, { color: pal.ink }]}>பகவத் கீதை</Text>
        {days > 0 && (
          <View style={[st.streak, { backgroundColor: pal.chip }]}>
            <Ionicons name="flame" size={14} color={pal.accent} />
            <Text style={{ fontFamily: F.num, fontSize: 15, color: pal.ink }}>{days}</Text>
          </View>
        )}
      </View>
      <LangBar pal={pal} onSettings={() => setSettings(true)} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: insets.bottom + 40 }}>
        {/* scene */}
        <View style={st.hero}>
          <UpadesamStage focus={focus} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.9)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
          <View style={st.heroText}>
            <Text style={st.kicker}>கிருஷ்ணர் — அர்ஜுனன் உரையாடல்</Text>
            <Text style={st.heroTitle}>பகவத் கீதை</Text>
            <Text style={st.heroSub}>18 அத்தியாயங்கள் · தமிழ் பொருளும் விளக்கமும்</Text>
          </View>
        </View>

        {/* continue */}
        <Pressable accessibilityRole="button" onPress={() => router.push(`/gita/${last.c}/${last.v}`)} style={({ pressed }) => [st.card, { backgroundColor: pal.card, borderColor: pal.line }, pressed && { opacity: 0.9 }]}>
          <View style={st.rowBetween}>
            <View style={[st.badge, { backgroundColor: pal.accent }]}>
              <Ionicons name="book" size={13} color="#fff" />
              <Text style={st.badgeT}>தொடருங்கள் · {last.c}.{last.v}</Text>
            </View>
            <Text style={{ fontFamily: F.taSemi, fontSize: 12, color: pal.sub }}>{lastSpeaker}</Text>
          </View>
          <Text style={[bodyFont(lastEn ? 'en' : 'ta', prefs.fontScale, 15), { color: pal.ink }]} numberOfLines={3}>
            {lastText}
          </Text>
          <View style={[st.track, { backgroundColor: pal.chip }]}>
            <View style={[st.fillBar, { width: `${Math.min(100, (totalRead / 700) * 100)}%`, backgroundColor: pal.accent }]} />
          </View>
          <Text style={{ fontFamily: F.ta, fontSize: 12, color: pal.sub }}>மொத்தம் படித்தவை {totalRead} / 700</Text>
        </Pressable>

        {/* feelings */}
        <View style={{ gap: 10 }}>
          <Text style={[st.h, { color: pal.ink }]}>இன்று உங்கள் மனம்?</Text>
          <View style={st.moods}>
            {MOODS.map((m) => (
              <Pressable key={m.id} accessibilityRole="button" accessibilityHint={m.why} onPress={() => router.push(`/gita/${m.c}/${m.v}`)} style={({ pressed }) => [st.mood, { borderColor: pal.line, backgroundColor: pressed ? pal.hi : pal.card }]}>
                <Text style={{ fontFamily: F.taSemi, fontSize: 13.5, color: pal.ink }}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {todays.length > 0 && (
          <View style={[st.card, { backgroundColor: pal.card, borderColor: pal.line }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-done" size={17} color={pal.accent} />
              <Text style={[st.h, { color: pal.ink, fontSize: 15 }]}>இன்று ஏற்றுக்கொண்டவை</Text>
            </View>
            {todays.map((x) => (
              <Text key={x.key} style={{ fontFamily: F.ta, fontSize: 14, lineHeight: 23, color: pal.ink }}>
                • {x.text} <Text style={{ color: pal.sub }}>({x.key})</Text>
              </Text>
            ))}
          </View>
        )}

        {/* 18 steps */}
        <View style={{ gap: 10 }}>
          <View style={st.rowBetween}>
            <Text style={[st.h, { color: pal.ink }]}>பதினெட்டுப் படிகள்</Text>
            <Text style={{ fontFamily: F.ta, fontSize: 12, color: pal.sub }}>அத்தியாயங்கள்</Text>
          </View>
          <View style={[st.list, { backgroundColor: pal.card, borderColor: pal.line }]}>
            {GITA_CHAPTERS.map((c, i) => {
              const total = chapterVerses(c.n).length;
              const done = p.gitaRead.filter((k) => k.startsWith(`${c.n}.`)).length;
              const here = c.n === last.c;
              return (
                <Pressable
                  key={c.n}
                  accessibilityRole="button"
                  accessibilityLabel={`அத்தியாயம் ${c.n}, ${c.title}`}
                  onPress={() => router.push(`/gita/${c.n}`)}
                  style={({ pressed }) => [st.row, i > 0 && { borderTopWidth: 1, borderTopColor: pal.line }, (pressed || here) && { backgroundColor: pal.hi }]}>
                  <View style={[st.num, { backgroundColor: done ? pal.accent : pal.chip }]}>
                    <Text style={[st.numT, { color: done ? '#fff' : pal.accent }]}>{c.n}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: F.taBold, fontSize: 14.5, color: pal.ink }} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={{ fontFamily: F.ta, fontSize: 12.5, color: pal.sub }} numberOfLines={1}>
                      {c.title} · {total} சுலோகங்கள்
                    </Text>
                    {done > 0 && (
                      <View style={[st.track, { backgroundColor: pal.chip, marginTop: 4 }]}>
                        <View style={[st.fillBar, { width: `${(done / total) * 100}%`, backgroundColor: pal.accent }]} />
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={pal.sub} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <ReaderSettings open={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  appT: { flex: 1, fontFamily: F.taBold, fontSize: 18 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, height: 32, marginRight: 8 },
  hero: { height: 330, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 2 },
  kicker: { fontFamily: F.taSemi, fontSize: 12, color: '#F3D48F' },
  heroTitle: { fontFamily: F.taBold, fontSize: 30, lineHeight: 44, color: '#FFF6E2' },
  heroSub: { fontFamily: F.ta, fontSize: 12.5, color: '#F1E2C2' },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeT: { fontFamily: F.taSemi, fontSize: 12, color: '#fff' },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 3 },
  h: { fontFamily: F.taBold, fontSize: 17 },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mood: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  list: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12 },
  num: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numT: { fontFamily: F.num, fontSize: 18 },
});
