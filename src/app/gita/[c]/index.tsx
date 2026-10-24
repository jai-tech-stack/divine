import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { focusForSpeaker, UpadesamStage } from '@/components/gita/UpadesamStage';
import { bodyFont, LangBar, ReaderSettings, usePalette, verseFont } from '@/components/reader/ReaderKit';
import { chapterVerses, getEn, getNote, GITA_CHAPTERS, momentFor, speakerFor } from '@/content/gita';
import { narrate, prepareNarrator, stopNarration } from '@/lib/narrator';
import { useProgress } from '@/lib/progress';
import { F } from '@/theme';

/** A chapter read as the dialogue it is — Krishna, Arjuna, Sanjaya — in the reading style. */
export default function GitaChapter() {
  const { c } = useLocalSearchParams<{ c: string }>();
  const n = Math.min(18, Math.max(1, Number(c) || 1));
  const ch = GITA_CHAPTERS[n - 1];
  const verses = chapterVerses(n);
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const [settings, setSettings] = useState(false);
  const readSet = new Set(p.gitaRead);
  const done = verses.filter((v) => readSet.has(`${v.c}.${v.v}`)).length;
  const [line, setLine] = useState(-1);
  const handle = useRef<{ cancel: () => void } | null>(null);
  const dark = prefs.readTheme === 'dark';
  const arjunaBg = dark ? 'rgba(90,140,170,0.16)' : '#E7EFF4';
  const arjunaLine = dark ? 'rgba(130,180,210,0.4)' : '#BCD0DD';
  const arjunaInk = dark ? '#9CC3DA' : '#2F5B74';

  useEffect(() => {
    prepareNarrator();
    return () => {
      handle.current?.cancel();
      stopNarration();
    };
  }, []);

  const play = (i: number) => {
    if (i >= ch.context.length) return setLine(-1);
    setLine(i);
    handle.current = narrate(ch.context[i], { muted: false, onDone: () => play(i + 1) });
  };
  const toggle = () => {
    if (line >= 0) {
      handle.current?.cancel();
      setLine(-1);
    } else play(0);
  };
  const resume = verses.find((v) => !readSet.has(`${n}.${v.v}`)) ?? verses[0];

  let lastMoment = '';
  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <View style={[st.appbar, { paddingTop: insets.top + 4 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={pal.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[st.appT, { color: pal.ink }]} numberOfLines={1}>
            அத்தியாயம் {n}
          </Text>
          <Text style={[st.appS, { color: pal.sub }]} numberOfLines={1}>
            {ch.name}
          </Text>
        </View>
      </View>
      <LangBar pal={pal} onSettings={() => setSettings(true)} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}>
        {/* chapter banner */}
        <View style={st.banner}>
          <UpadesamStage focus={n === 1 ? 'wide' : 'krishna'} variant={n === 11 ? 'vishwaroopa' : 'upadesam'} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.88)']} locations={[0.25, 1]} style={StyleSheet.absoluteFill} />
          <View style={st.bannerText}>
            <Text style={st.kicker}>படி {n} / 18 · {verses.length} சுலோகங்கள்</Text>
            <Text style={st.title}>{ch.name}</Text>
            <Text style={st.sub} numberOfLines={3}>
              {ch.essence}
            </Text>
          </View>
        </View>

        {/* progress + actions */}
        <View style={[st.panel, { backgroundColor: pal.card, borderColor: pal.line }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: pal.ink }}>
              படித்தவை {done} / {verses.length}
            </Text>
            <Text style={{ fontFamily: F.num, fontSize: 16, color: pal.accent }}>{Math.round((done / verses.length) * 100)}%</Text>
          </View>
          <View style={[st.track, { backgroundColor: pal.chip }]}>
            <View style={[st.fillBar, { width: `${(done / verses.length) * 100}%`, backgroundColor: pal.accent }]} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push(`/gita/${n}/${resume.v}`)} style={[st.btn, { backgroundColor: pal.accent }]}>
              <Ionicons name="book" size={16} color="#fff" />
              <Text style={[st.btnT, { color: '#fff' }]}>{done ? `தொடருங்கள் · ${n}.${resume.v}` : 'படிக்கத் தொடங்கு'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={toggle} style={[st.btn, { borderColor: pal.line, borderWidth: 1 }]}>
              <Ionicons name={line >= 0 ? 'pause' : 'headset-outline'} size={16} color={pal.ink} />
              <Text style={[st.btnT, { color: pal.ink }]}>{line >= 0 ? 'நிறுத்து' : 'சூழல்'}</Text>
            </Pressable>
          </View>
          {line >= 0 && <Text style={[bodyFont('ta', prefs.fontScale, 14), { color: pal.accent, textAlign: 'center' }]}>{ch.context[line]}</Text>}
        </View>

        {/* the dialogue */}
        {verses.map((v) => {
          const who = speakerFor(n, v.v);
          const side = focusForSpeaker(who);
          const note = getNote(n, v.v);
          const en = prefs.meaning === 'en' ? getEn(n, v.v) : undefined;
          const moment = momentFor(n, v.v);
          const showMoment = moment !== lastMoment;
          lastMoment = moment;
          const read = readSet.has(`${n}.${v.v}`);
          const isK = side === 'krishna';
          const isA = side === 'arjuna';
          const firstLine = (prefs.script === 'ta' ? v.ta : prefs.script === 'sa' ? v.sa : v.en).split('\n')[0];
          return (
            <View key={v.v} style={{ gap: 10 }}>
              {showMoment && (
                <View style={st.moment}>
                  <Ionicons name="flower-outline" size={14} color={pal.accent} />
                  <Text style={[st.momentT, { color: pal.sub }]}>{moment}</Text>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${who}, சுலோகம் ${v.v}`}
                onPress={() => router.push(`/gita/${n}/${v.v}`)}
                style={({ pressed }) => [
                  st.bubble,
                  isK && { alignSelf: 'flex-start', borderTopLeftRadius: 4, backgroundColor: pal.card, borderColor: pal.line },
                  isA && { alignSelf: 'flex-end', borderTopRightRadius: 4, backgroundColor: arjunaBg, borderColor: arjunaLine },
                  !isK && !isA && { alignSelf: 'center', maxWidth: '96%', backgroundColor: pal.chip, borderColor: pal.line },
                  pressed && { opacity: 0.85 },
                ]}>
                <View style={st.bubbleHead}>
                  <View style={[st.avatar, { backgroundColor: isK ? pal.accent : isA ? arjunaInk : pal.sub }]}>
                    <Text style={st.avatarT}>{isK ? 'கி' : isA ? 'அ' : who[0]}</Text>
                  </View>
                  <Text style={[st.who, { color: isA ? arjunaInk : pal.accent }]}>{who.replace(' கூறினார்', '').replace(' கூறினான்', '')}</Text>
                  <Text style={[st.ref, { color: pal.sub }]}>
                    {n}.{v.v}
                  </Text>
                  {read && <Ionicons name="checkmark-circle" size={14} color={pal.accent} />}
                </View>
                <Text style={[verseFont(prefs.script, prefs.fontScale * 0.72, 20), { color: pal.verse }]} numberOfLines={1}>
                  {firstLine}
                </Text>
                <Text style={[bodyFont(en ? 'en' : 'ta', prefs.fontScale, 15), { color: pal.ink }]} numberOfLines={4}>
                  {en ? en.m : note?.m}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <ReaderSettings open={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  appT: { fontFamily: F.taBold, fontSize: 16.5 },
  appS: { fontFamily: F.ta, fontSize: 12 },
  banner: { height: 230, borderRadius: 22, overflow: 'hidden', backgroundColor: '#000' },
  bannerText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  kicker: { fontFamily: F.taSemi, fontSize: 12, color: '#F3D48F' },
  title: { fontFamily: F.taBold, fontSize: 24, lineHeight: 35, color: '#FFF6E2' },
  sub: { fontFamily: F.ta, fontSize: 13, lineHeight: 21, color: '#F1E2C2' },
  panel: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 3 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 42, borderRadius: 999, paddingHorizontal: 10 },
  btnT: { fontFamily: F.taSemi, fontSize: 13 },
  moment: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8, paddingHorizontal: 6 },
  momentT: { flex: 1, fontFamily: F.ta, fontSize: 13, lineHeight: 21, fontStyle: 'italic' },
  bubble: { maxWidth: '90%', borderRadius: 18, padding: 12, gap: 6, borderWidth: 1 },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarT: { fontFamily: F.taBold, fontSize: 12, color: '#fff' },
  who: { flex: 1, fontFamily: F.taSemi, fontSize: 12.5 },
  ref: { fontFamily: F.num, fontSize: 15 },
});
