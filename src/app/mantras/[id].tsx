import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioBar, bodyFont, LangBar, ReaderSettings, usePalette, verseFont } from '@/components/reader/ReaderKit';
import { getMantra, groupOf, MANTRAS } from '@/content/mantraLib';
import { MANTRAS_EN } from '@/content/mantrasEn';
import { chantAlong } from '@/lib/chant';
import { prepareNarrator } from '@/lib/narrator';
import { progress, useProgress } from '@/lib/progress';
import { F } from '@/theme';

const REPEATS = [1, 3, 11, 21, 108];
const SECOND = { ta: 'en', sa: 'ta', en: 'ta' } as const;

/** Stotram reader: clean numbered verses, script + meaning language, repeat chanting. */
export default function MantraReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = getMantra(id);
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const [settings, setSettings] = useState(false);
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [hi, setHi] = useState(-1);
  const [repeat, setRepeat] = useState(1);
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const handle = useRef<{ cancel: () => void } | null>(null);
  const roundRef = useRef(0);
  const scrollRef = useRef<any>(null);
  const secY = useRef<number[]>([]);
  const headY = useRef(0);

  useEffect(() => {
    if (id) progress.openedMantra(id);
    prepareNarrator();
    return () => {
      handle.current?.cancel();
      Speech.stop();
    };
  }, [id]);

  if (!m) return <View style={{ flex: 1, backgroundColor: pal.bg }} />;
  const g = groupOf(m.deity);
  const enInfo = MANTRAS_EN[m.id];
  const useEn = prefs.meaning === 'en' && !!enInfo;
  // An original Tamil hymn has no Sanskrit original. Keep its text visible in that setting.
  const script = m.originalLanguage === 'ta' && prefs.script === 'sa' ? 'ta' : prefs.script;
  const secondScript = SECOND[script];
  const formLabel = m.originalLanguage === 'ta' ? 'தமிழ்ப் பாடல்' : m.originalLanguage === 'hi' ? 'இந்தி ஆரத்தி' : m.kind === 'mantra' ? 'மந்திரம்' : 'ஸ்தோத்திரம்';
  const fav = p.mantraFavs.includes(m.id);
  const idx = MANTRAS.findIndex((x) => x.id === m.id);
  const prevM = idx > 0 ? MANTRAS[idx - 1] : null;
  const nextM = idx < MANTRAS.length - 1 ? MANTRAS[idx + 1] : null;
  const lineText = (l: { ta: string; sa: string; en: string }, s: 'ta' | 'sa' | 'en') => (s === 'ta' ? l.ta : s === 'sa' ? l.sa : l.en);
  /** every verse in reading order; long stotrams carry their part */
  const verses: { ta: string; sa: string; en: string; mean?: string; sec?: number; n: number }[] = m.sections
    ? m.sections.flatMap((sec, si) => sec.verses.map((v, k) => ({ ...v, sec: si, n: k + 1 })))
    : m.lines.map((l, k) => ({ ...l, mean: useEn ? enInfo?.mean[k] : l.mean, n: k + 1 }));
  const jump = (si: number) => scrollRef.current?.scrollTo({ y: (secY.current[si] ?? 0) + headY.current, animated: true });

  const runRound = () => {
    handle.current = chantAlong(
      verses.map((l) => l.ta),
      {
        onLine: setHi,
        onDone: () => {
          roundRef.current += 1;
          setRound(roundRef.current);
          if (roundRef.current < repeat) runRound();
          else {
            handle.current = null;
            setPlaying(false);
            progress.chanted(m.id, roundRef.current);
          }
        },
      },
    );
  };
  const toggle = () => {
    if (handle.current) {
      handle.current.cancel();
      handle.current = null;
      setPlaying(false);
      setHi(-1);
      return;
    }
    roundRef.current = 0;
    setRound(0);
    setPlaying(true);
    runRound();
  };
  const open = (to: string) => {
    handle.current?.cancel();
    handle.current = null;
    setPlaying(false);
    router.replace(`/mantras/${to}`);
  };
  const share = () =>
    Share.share({ message: `${m.name}\n\n${verses.map((l) => `${lineText(l, script)}\n${l.mean ?? ''}`).join('\n\n')}${m.practice ? `\n\nஎப்போது சொல்லலாம்?\n${m.practice.days}\n\nஎப்படிச் சொல்லலாம்?\n${m.practice.steps.join('\n')}` : ''}\n\nDivine Life` }).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <View style={[st.appbar, { paddingTop: insets.top + 4 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={pal.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[st.appT, { color: pal.ink }]} numberOfLines={1}>
            {useEn ? enInfo.name : m.name}
          </Text>
          <Text style={[st.appS, { color: pal.sub }]} numberOfLines={1}>
            {g.ta} · {formLabel}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={fav ? 'பிடித்தவையிலிருந்து நீக்கு' : 'பிடித்தவையில் சேர்'} onPress={() => progress.toggleFav(m.id)} hitSlop={8} style={st.iconBtn}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={23} color={fav ? '#D9534F' : pal.ink} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="பகிர்" onPress={share} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="share-social-outline" size={22} color={pal.ink} />
        </Pressable>
      </View>
      <LangBar pal={pal} onSettings={() => setSettings(true)} />
      {m.originalLanguage !== 'ta' && m.originalLanguage !== 'hi' && m.lines.some(l => l.sa.trim()) && (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showSanskrit }} onPress={() => setShowSanskrit(!showSanskrit)} style={{ paddingHorizontal: 18, paddingVertical: 12, backgroundColor: pal.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: pal.accent }}>{showSanskrit ? 'சம்ஸ்கிருத மூலத்தை மறை' : 'சம்ஸ்கிருத மூலமும் காட்டு'}</Text>
          <Ionicons name={showSanskrit ? 'chevron-up' : 'chevron-down'} size={18} color={pal.accent} />
        </Pressable>
      )}

      <ScrollView ref={scrollRef} key={m.id} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 170 }}>
        {/* picture header */}
        <View style={st.hero}>
          <Image source={g.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.6)', 'rgba(20,8,0,0.94)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={st.heroText}>
            <Text style={st.heroName}>{useEn ? enInfo.name : m.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <HeroTag icon="person-outline" text={g.ta} />
              <HeroTag icon={m.kind === 'mantra' ? 'radio-button-on' : 'document-text-outline'} text={formLabel} />
              <HeroTag icon="repeat" text={m.practice ? 'பாராயணம் · 1 முறை' : `ஜபம் ${m.japa}`} />
            </View>
          </View>
        </View>
        <Text style={[st.about, { color: pal.sub }, useEn ? { fontSize: 14.5 } : { fontFamily: F.ta }]}>{useEn ? enInfo.about : m.about}</Text>
        <View style={[st.when, { backgroundColor: pal.chip }]}>
          <Ionicons name="time-outline" size={14} color={pal.accent} />
          <Text style={{ fontFamily: F.ta, fontSize: 12.5, color: pal.ink, flex: 1 }}>{m.when}</Text>
        </View>

        {m.practice && (
          <View style={[st.practiceCard, { backgroundColor: pal.card, borderColor: pal.line }]}>
            <Text accessibilityRole="header" style={[st.practiceHeading, { color: pal.accent }]}>எந்த நாட்களில் சொல்லலாம்?</Text>
            <Text style={[bodyFont('ta', prefs.fontScale, 14), { color: pal.ink }]}>{m.practice.days}</Text>
            <Text accessibilityRole="header" style={[st.practiceHeading, { color: pal.accent }]}>எப்படிச் சொல்லலாம்?</Text>
            {m.practice.steps.map((step, index) => (
              <View key={index} style={st.practiceStep}>
                <Text style={{ fontFamily: F.num, color: pal.accent, fontSize: 16 }}>{index + 1}.</Text>
                <Text style={[bodyFont('ta', prefs.fontScale, 14), { color: pal.ink, flex: 1 }]}>{step}</Text>
              </View>
            ))}
            {!!m.practice.note && <Text style={[bodyFont('ta', prefs.fontScale, 12), { color: pal.sub }]}>{m.practice.note}</Text>}
          </View>
        )}
        {m.originalLanguage === 'ta' && prefs.script === 'sa' && (
          <Text style={[bodyFont('ta', prefs.fontScale, 12), { color: pal.sub }]}>இது தமிழில் இயற்றப்பட்ட பாடல்; தமிழ்மூலம் காட்டப்படுகிறது.</Text>
        )}

        {m.sections && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {m.sections.map((sec, si) => (
              <Pressable key={sec.key} accessibilityRole="button" onPress={() => jump(si)} style={[st.secChip, { borderColor: pal.line, backgroundColor: pal.card }]}>
                <Text style={{ fontFamily: F.taSemi, fontSize: 12.5, color: pal.ink }}>{useEn ? sec.titleEn.split(' — ')[0] : sec.title.split(' — ')[0]}</Text>
                <Text style={{ fontFamily: F.num, fontSize: 13, color: pal.accent }}>{sec.verses.length}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* verses: clean, centred, ornament between */}
        <View style={[st.page, { backgroundColor: pal.card, borderColor: pal.line }]} onLayout={(e) => (headY.current = e.nativeEvent.layout.y)}>
          {verses.map((l, i) => {
            const on = hi === i;
            const newSec = m.sections && (i === 0 || verses[i - 1].sec !== l.sec);
            return (
              <View key={i} onLayout={newSec ? (e) => (secY.current[l.sec!] = e.nativeEvent.layout.y) : undefined}>
                {newSec ? (
                  <View style={[st.secHead, { borderColor: pal.line }, i > 0 && { marginTop: 14 }]}>
                    <Ionicons name="flower" size={14} color={pal.accent} />
                    <Text style={[st.secHeadT, { color: pal.accent }]}>{useEn ? m.sections![l.sec!].titleEn : m.sections![l.sec!].title}</Text>
                    <Ionicons name="flower" size={14} color={pal.accent} />
                  </View>
                ) : (
                  i > 0 && <Ornament pal={pal} />
                )}
                <View style={[st.verse, on && { backgroundColor: pal.hi }]}>
                  <Text style={[st.num, { color: pal.accent }]}>॥ {l.n} ॥</Text>
                  <Text selectable style={[verseFont(script, prefs.fontScale, m.kind === 'mantra' ? 21 : 18), { textAlign: 'left', color: pal.verse }]}>{lineText(l, script)}</Text>
                  {showSanskrit && m.originalLanguage !== 'ta' && m.originalLanguage !== 'hi' && !!l.sa && <Text selectable style={[verseFont('sa', prefs.fontScale, 19), { textAlign: 'left', color: pal.sub, marginTop: 12 }]}>{l.sa}</Text>}
                  {prefs.showTranslit && <Text style={[verseFont(secondScript, prefs.fontScale * 0.78, m.sections ? 19 : 21), st.center, { color: pal.sub }]}>{lineText(l, secondScript)}</Text>}
                  {!!l.mean && (
                    <View style={[st.meanBox, { backgroundColor: pal.bg }]}>
                      <Text style={[st.meanH, { color: pal.accent }]}>{useEn ? 'Meaning' : 'பொருள்'}</Text>
                      <Text style={[bodyFont(useEn ? 'en' : 'ta', prefs.fontScale, 15), { color: pal.ink }]}>{l.mean}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/companion')} style={[st.askRow, { backgroundColor: pal.card, borderColor: pal.accent }]}>
          <Ionicons name="chatbubbles-outline" size={20} color={pal.accent} />
          <Text style={{ flex: 1, fontFamily: F.taSemi, fontSize: 14, color: pal.ink }}>கடவுளிடம் கேளுங்கள்</Text>
          <Ionicons name="chevron-forward" size={18} color={pal.accent} />
        </Pressable>

        <Text style={[st.fine, { color: pal.sub }]}>{m.source ? `${m.source} ` : 'மூலம்: பாரம்பரிய சம்ஸ்கிருதம். பொருள்: Divine Life. '}பாரம்பரியப் பயன்கள் நம்பிக்கை சார்ந்தவை; உறுதியளிக்கப்படுபவை அல்ல.</Text>
        {!!m.references?.length && (
          <View style={{ gap: 4 }}>
            <Text accessibilityRole="header" style={[st.practiceHeading, { color: pal.accent }]}>மூல ஆதாரங்கள்</Text>
            {m.references.map((reference) => (
              <Pressable key={reference.url} accessibilityRole="link" accessibilityLabel={reference.title} onPress={() => {
                setSourceError(false);
                WebBrowser.openBrowserAsync(reference.url).catch(() => setSourceError(true));
              }} style={st.sourceLink}>
                <Text style={[bodyFont('ta', prefs.fontScale, 12), { color: pal.accent, flex: 1 }]}>{reference.title}</Text>
                <Ionicons name="open-outline" size={16} color={pal.accent} />
              </Pressable>
            ))}
            {sourceError && <Text accessibilityRole="alert" style={[bodyFont('ta', prefs.fontScale, 12), { color: pal.ink }]}>இணைப்பைத் திறக்க முடியவில்லை. மீண்டும் முயலுங்கள்.</Text>}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[prevM, nextM].map((x, k) =>
            x ? (
              <Pressable key={x.id} accessibilityRole="button" onPress={() => open(x.id)} style={[st.nav, { backgroundColor: pal.card, borderColor: pal.line }, k === 1 && { alignItems: 'flex-end' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {k === 0 && <Ionicons name="chevron-back" size={15} color={pal.accent} />}
                  <Text style={{ fontFamily: F.taSemi, fontSize: 12, color: pal.sub }}>{k === 0 ? 'முந்தைய' : 'அடுத்த'}</Text>
                  {k === 1 && <Ionicons name="chevron-forward" size={15} color={pal.accent} />}
                </View>
                <Text numberOfLines={1} style={{ fontFamily: F.taSemi, fontSize: 13.5, color: pal.ink }}>
                  {x.name}
                </Text>
              </Pressable>
            ) : (
              <View key={k} style={{ flex: 1 }} />
            ),
          )}
        </View>
      </ScrollView>

      {/* repeat chips sit above the player */}
      <View style={[st.repeatRow, { bottom: insets.bottom + 76, backgroundColor: pal.bg, borderTopColor: pal.line }]}>
        <Ionicons name="repeat" size={16} color={pal.sub} />
        {REPEATS.map((r) => (
          <Pressable key={r} onPress={() => setRepeat(r)} style={[st.rep, { borderColor: pal.line }, repeat === r && { backgroundColor: pal.accent, borderColor: pal.accent }]} accessibilityState={{ selected: repeat === r }}>
            <Text style={[st.repT, { color: repeat === r ? '#fff' : pal.ink }]}>{r}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/practice/japa', params: { m: m.id } })} style={[st.japa, { borderColor: pal.accent }]}>
          <Ionicons name="ellipse-outline" size={14} color={pal.accent} />
          <Text style={{ fontFamily: F.taSemi, fontSize: 12.5, color: pal.accent }}>ஜப மாலை</Text>
        </Pressable>
      </View>
      <AudioBar pal={pal} playing={playing} title={playing ? `${m.sections ? 'ச்லோகம்' : 'வரி'} ${hi + 1} / ${verses.length}` : 'கூடவே ஜபியுங்கள்'} sub={`சுற்று ${round} / ${repeat}`} onToggle={toggle} />
      <ReaderSettings open={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

function HeroTag({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={st.heroTag}>
      <Ionicons name={icon} size={12} color="#F3D48F" />
      <Text style={{ fontFamily: F.ta, fontSize: 11.5, color: '#FFF6E2' }}>{text}</Text>
    </View>
  );
}

function Ornament({ pal }: { pal: ReturnType<typeof usePalette>['pal'] }) {
  return (
    <View style={st.orn}>
      <View style={[st.ornLine, { backgroundColor: pal.line }]} />
      <Ionicons name="flower-outline" size={16} color={pal.accent} />
      <View style={[st.ornLine, { backgroundColor: pal.line }]} />
    </View>
  );
}

const st = StyleSheet.create({
  practiceCard: { padding: 16, gap: 12, borderWidth: 1, borderRadius: 16 },
  practiceHeading: { fontFamily: F.taSemi, fontSize: 14, lineHeight: 24 },
  practiceStep: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  sourceLink: { minHeight: 44, paddingVertical: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  appT: { fontFamily: F.taBold, fontSize: 16.5 },
  appS: { fontFamily: F.ta, fontSize: 12 },
  secChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, height: 36 },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, marginHorizontal: 10 },
  secHeadT: { fontFamily: F.taBold, fontSize: 14.5 },
  askRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, padding: 14 },
  hero: { height: 230, borderRadius: 22, overflow: 'hidden', backgroundColor: '#000' },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 8 },
  heroName: { fontFamily: F.taBold, fontSize: 23, lineHeight: 34, color: '#FFF6E2' },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  page: { borderRadius: 20, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 8 },
  orn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 30, marginVertical: 6 },
  ornLine: { flex: 1, height: 1 },
  meanH: { fontFamily: F.taBold, fontSize: 12.5, marginBottom: 2 },
  head: { flexDirection: 'row', gap: 12, borderRadius: 18, borderWidth: 1, padding: 12, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  about: { fontSize: 13.5, lineHeight: 22 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, maxWidth: '100%' },
  verse: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 12, gap: 8 },
  num: { textAlign: 'center', fontFamily: F.deva, fontSize: 14, letterSpacing: 1 },
  numT: { color: '#fff', fontFamily: F.num, fontSize: 14 },
  center: { textAlign: 'center' },
  meanBox: { borderRadius: 12, padding: 12, marginTop: 4 },
  fine: { fontFamily: F.ta, fontSize: 11, lineHeight: 18 },
  nav: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, gap: 2 },
  repeatRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  rep: { minWidth: 38, height: 30, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  repT: { fontFamily: F.num, fontSize: 15 },
  japa: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, height: 30 },
});
