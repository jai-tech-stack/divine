import Ionicons from '@expo/vector-icons/Ionicons';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dialogueLine, focusForSpeaker, UpadesamStage } from '@/components/gita/UpadesamStage';
import { bodyFont, ReaderSettings, usePalette, verseFont } from '@/components/reader/ReaderKit';
import { chapterVerses, getEn, getNote, getVerse, momentFor, speakerFor } from '@/content/gita';
import { chantAlong } from '@/lib/chant';
import { localDateKey } from '@/lib/date';
import { prepareNarrator } from '@/lib/narrator';
import { progress, useProgress } from '@/lib/progress';
import { F } from '@/theme';

const native = Platform.OS !== 'web';
const SECOND: Record<'ta' | 'sa' | 'en', 'ta' | 'sa' | 'en'> = { ta: 'en', sa: 'ta', en: 'ta' };
type Step = 'scene' | 'verse' | 'wisdom' | 'done';
type Tab = 'e' | 'l' | 'q';

function Page({ height, children, style }: { height: number; children: React.ReactNode; style?: object }) {
  return <View style={{ height }}><ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={[{ flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 24, paddingBottom: 56 }, style]}>{children}</ScrollView></View>;
}

/**
 * One verse as a guided flow — swipe up through: this moment → the verse (karaoke + word chips)
 * → wisdom (three tabs) → a share card → the next verse. "கேளுங்கள்" carries you through it.
 */
export default function GitaVerse() {
  const params = useLocalSearchParams<{ c: string; v: string; flow?: string }>();
  const c = Number(params.c) || 1;
  const parsedV = Number(params.v);
  const v = Number.isFinite(parsedV) ? parsedV : 1;
  const verse = getVerse(c, v);
  const note = getNote(c, v);
  const list = chapterVerses(c);
  const idx = list.findIndex((x) => x.v === v);
  const prevHref = idx > 0 ? `/gita/${c}/${list[idx - 1].v}` : c > 1 ? `/gita/${c - 1}/${chapterVerses(c - 1).slice(-1)[0].v}` : null;
  const nextHref = idx < list.length - 1 ? `/gita/${c}/${list[idx + 1].v}` : c < 18 ? `/gita/${c + 1}/1` : null;
  const moment = momentFor(c, v);
  const prevMoment = idx > 0 ? momentFor(c, list[idx - 1].v) : '';
  const showScene = idx <= 0 || moment !== prevMoment;
  const steps: Step[] = showScene ? ['scene', 'verse', 'wisdom', 'done'] : ['verse', 'wisdom', 'done'];
  const speaker = speakerFor(c, v);
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const en = prefs.meaning === 'en' ? getEn(c, v) : undefined;
  const meaning = en?.m ?? note?.m ?? '';
  const saved = p.gitaSaved.includes(`${c}.${v}`);
  const committed = p.commitments.some((x) => x.key === `${c}.${v}` && x.date === localDateKey());

  const [h, setH] = useState(0);
  const [page, setPage] = useState(0);
  const [line, setLine] = useState(-1);
  const [playing, setPlaying] = useState<'verse' | 'meaning' | Tab | null>(null);
  const [word, setWord] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('e');
  const [settings, setSettings] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [flow, setFlow] = useState(params.flow === '1');
  const scroll = useRef<any>(null);
  const chant = useRef<{ cancel: () => void } | null>(null);
  const [hint] = useState(() => new Animated.Value(0));

  useEffect(() => {
    prepareNarrator();
    progress.setLast(c, v);
    return () => {
      chant.current?.cancel();
      Speech.stop();
    };
  }, [c, v]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hint, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(hint, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hint]);

  // in flow mode, arriving on the verse starts the reading
  useEffect(() => {
    if (flow && steps[page] === 'verse' && !playing) playVerse();
    if (flow && steps[page] === 'scene') {
      const t = setTimeout(() => goPage(page + 1), 4500);
      return () => clearTimeout(t);
    }
  }, [page, flow]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!verse) {
    return (
      <View style={{ flex: 1, backgroundColor: pal.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: pal.ink, fontFamily: F.ta }}>இந்தச் சுலோகம் கிடைக்கவில்லை.</Text>
      </View>
    );
  }

  const textOf = (s: 'ta' | 'sa' | 'en') => (s === 'ta' ? verse.ta : s === 'sa' ? verse.sa : verse.en).split('\n').filter(Boolean);
  const main = textOf(prefs.script);
  const second = prefs.showTranslit ? textOf(SECOND[prefs.script]) : [];
  const stopAll = () => {
    chant.current?.cancel();
    chant.current = null;
    Speech.stop();
    setPlaying(null);
    setLine(-1);
  };
  function goPage(i: number) {
    if (!h) return;
    const k = Math.max(0, Math.min(steps.length - 1, i));
    scroll.current?.scrollTo({ y: k * h, animated: true });
    setPage(k);
  };
  const speak = (text: string, kind: 'meaning' | Tab, then?: () => void) => {
    Speech.stop();
    setPlaying(kind);
    Speech.speak(text, {
      language: en ? 'en-IN' : 'ta-IN',
      rate: 0.92,
      onDone: () => {
        setPlaying(null);
        then?.();
      },
      onStopped: () => setPlaying(null),
      onError: () => setPlaying(null),
    });
  };
  function playVerse() {
    if (!verse) return;
    if (playing) return stopAll();
    progress.markRead(c, v);
    speak(`${dialogueLine(speaker)}. ${meaning}`, 'meaning', () => flow && setTimeout(() => goPage(steps.indexOf('wisdom')), 900));
  };
  const startFlow = () => {
    setFlow(true);
    if (steps[page] === 'verse') playVerse();
    else goPage(steps.indexOf('verse'));
  };
  const toNext = () => {
    stopAll();
    progress.markRead(c, v);
    if (nextHref) router.replace((flow ? `${nextHref}?flow=1` : nextHref) as never);
  };
  const tabText = (t: Tab) => (t === 'e' ? (en?.e ?? note?.e ?? '') : t === 'l' ? (en?.l ?? note?.l ?? '') : (note?.q ?? 'இந்தச் சுலோகத்தின் எந்தச் சொல் இன்று உங்களுக்குப் பொருந்துகிறது? ஒரு நிமிடம் அமைதியாக நினைத்துப் பாருங்கள்.'));
  const share = () => Share.share({ message: `${main.join('\n')}\n\n${meaning}\n\nபகவத் கீதை ${c}.${v} · Divine Life` }).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      {/* soft painting behind every step */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <UpadesamStage focus={focusForSpeaker(speaker)} variant={c === 11 ? 'vishwaroopa' : 'upadesam'} glow={false} />
        <LinearGradient colors={[`${pal.bg}99`, `${pal.bg}E6`, pal.bg]} locations={[0, 0.35, 0.7]} style={StyleSheet.absoluteFill} />
      </View>

      {/* top bar */}
      <View style={[st.top, { paddingTop: insets.top + 4 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} hitSlop={8} style={[st.round, { backgroundColor: pal.card }]}>
          <Ionicons name="chevron-back" size={22} color={pal.ink} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/gita/${c}`)} style={[st.pill, { backgroundColor: pal.card, borderColor: pal.line }]}>
          <Text style={[st.pillT, { color: pal.ink }]} numberOfLines={1}>
            அத்தியாயம் {c} · சுலோகம் {v}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="வாசிப்பு அமைப்புகள்" onPress={() => setSettings(true)} hitSlop={8} style={[st.round, { backgroundColor: pal.card }]}>
          <Ionicons name="text-outline" size={19} color={pal.ink} />
        </Pressable>
      </View>

      <View style={{ flex: 1 }} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
        {h > 0 && (
          <ScrollView
            ref={scroll}
            key={`${c}.${v}`}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={h}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.y / h))}
            onScroll={Platform.OS === 'web' ? (e) => setPage(Math.round(e.nativeEvent.contentOffset.y / h)) : undefined}
            scrollEventThrottle={64}>
            {steps.map((s) => {
              if (s === 'scene')
                return (
                  <Page height={h} key={s} style={{ justifyContent: 'flex-end', paddingBottom: 70 }}>
                    <View style={[st.sceneCard]}>
                      <UpadesamStage focus={focusForSpeaker(speaker)} variant={c === 11 ? 'vishwaroopa' : 'upadesam'} />
                      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.92)']} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
                      <View style={st.sceneText}>
                        <View style={st.sceneBadge}>
                          <Text style={st.sceneBadgeT}>இந்தத் தருணம்</Text>
                        </View>
                        <Text style={st.sceneBig}>{moment}</Text>
                      </View>
                    </View>
                  </Page>
                );

              if (s === 'verse')
                return (
                  <Page height={h} key={s} style={{ justifyContent: 'center', gap: 18 }}>
                    <View style={[st.chip, { backgroundColor: pal.accent }]}>
                      <Ionicons name="chatbubble-ellipses" size={12} color="#fff" />
                      <Text style={st.chipT}>{dialogueLine(speaker)}</Text>
                    </View>
                    <Text selectable style={[bodyFont('ta', prefs.fontScale, 19), { color: playing === 'meaning' ? pal.accent : pal.ink, textAlign: 'left' }]}>{meaning}</Text>
                    <Text style={{ fontFamily: F.ta, fontSize: 12, lineHeight: 21, color: pal.sub }}>சுலோகத்தின் எளிய தமிழ் பொருள்</Text>
                    <Pressable accessibilityRole="button" accessibilityState={{ expanded: showOriginal }} onPress={() => setShowOriginal(!showOriginal)} style={[st.originalToggle, { borderColor: pal.line, backgroundColor: pal.card }]}>
                      <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: pal.accent }}>{showOriginal ? 'மூலச் சுலோகத்தை மறை' : 'மூலச் சுலோகம் · தமிழ் உச்சரிப்பு'}</Text>
                      <Ionicons name={showOriginal ? 'chevron-up' : 'chevron-down'} size={16} color={pal.accent} />
                    </Pressable>
                    {showOriginal && <View style={{ gap: 8 }}>
                      {main.map((ln, i) => (
                        <Text selectable key={i} style={[verseFont('ta', prefs.fontScale, 18), { textAlign: 'left', color: line === i ? pal.accent : line >= 0 ? pal.sub : pal.verse }, line === i && st.glow]}>
                          {ln}
                        </Text>
                      ))}
                      <Pressable accessibilityRole="button" onPress={() => { if (playing) return stopAll(); setPlaying('verse'); chant.current = chantAlong(main, { rate: 0.8, onLine: setLine, onDone: () => { chant.current = null; setPlaying(null); setLine(-1); } }); }} style={st.listen}>
                        <Ionicons name={playing === 'verse' ? 'pause-circle' : 'play-circle'} size={26} color={pal.accent} />
                        <Text style={[st.listenT, { color: pal.accent }]}>மூலச் சுலோகம் கேளுங்கள்</Text>
                      </Pressable>
                    </View>}
                    {second.length > 0 && (
                      <View>
                        {second.map((ln, i) => (
                          <Text key={i} style={[verseFont(SECOND[prefs.script], prefs.fontScale * 0.74, 21), st.center, { color: pal.sub }]}>
                            {ln}
                          </Text>
                        ))}
                      </View>
                    )}
                    {/* word chips */}
                    {showOriginal && note && note.w.length > 0 && (
                      <View style={{ gap: 8 }}>
                        <View style={st.chips}>
                          {note.w.map(([w], i) => (
                            <Pressable key={i} accessibilityRole="button" onPress={() => setWord(word === i ? null : i)} style={[st.word, { borderColor: word === i ? pal.accent : pal.line, backgroundColor: word === i ? pal.hi : pal.card }]}>
                              <Text style={[st.wordT, { color: word === i ? pal.accent : pal.ink }]}>{w}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Text style={[st.wordMean, { color: word !== null ? pal.accent : pal.sub }]}>
                          {word !== null ? `${note.w[word][0]} · ${note.w[word][1]}` : 'பொருளைக் காண சொல்லைத் தட்டவும்'}
                        </Text>
                      </View>
                    )}
                    <View style={st.row}>
                      <Pressable accessibilityRole="button" onPress={playVerse} style={[st.big, { backgroundColor: pal.accent }]}>
                        <Ionicons name={playing === 'verse' || playing === 'meaning' ? 'pause' : 'play'} size={18} color="#fff" />
                        <Text style={st.bigT}>{playing === 'verse' || playing === 'meaning' ? 'நிறுத்து' : 'கேளுங்கள்'}</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" onPress={flow ? () => setFlow(false) : startFlow} style={[st.big, { borderColor: pal.accent, borderWidth: 1.5, backgroundColor: flow ? pal.hi : pal.card }]}>
                        <Ionicons name={flow ? 'infinite' : 'play-forward'} size={18} color={pal.accent} />
                        <Text style={[st.bigT, { color: pal.accent }]}>{flow ? 'தொடர் வாசிப்பு ஆன்' : 'தொடர்ந்து கேளுங்கள்'}</Text>
                      </Pressable>
                    </View>
                  </Page>
                );

              if (s === 'wisdom')
                return (
                  <Page height={h} key={s} style={{ justifyContent: 'center', gap: 18 }}>
                    <Text style={[st.h1, { color: pal.ink }]}>ஞானம்</Text>
                    <View style={st.tabs}>
                      {(
                        [
                          ['e', 'போதனை', 'bulb-outline'],
                          ['l', 'இன்று உங்களுக்கு', 'leaf-outline'],
                          ['q', 'சிந்திக்க', 'help-circle-outline'],
                        ] as const
                      ).map(([t, label, icon]) => (
                        <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => setTab(t)} style={[st.tab, { borderColor: tab === t ? pal.accent : pal.line, backgroundColor: tab === t ? pal.hi : pal.card }]}>
                          <Ionicons name={icon} size={16} color={tab === t ? pal.accent : pal.sub} />
                          <Text style={[st.tabT, { color: tab === t ? pal.accent : pal.ink }]}>{label}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={[st.card, { backgroundColor: pal.card, borderColor: pal.line }]}>
                      <Text selectable style={[bodyFont('ta', prefs.fontScale, 18), { color: pal.ink, textAlign: 'left' }]}>{tabText(tab)}</Text>
                      <View style={st.row}>
                        <Pressable accessibilityRole="button" onPress={() => (playing === tab ? stopAll() : speak(tabText(tab), tab, () => flow && tab === 'e' && setTimeout(() => goPage(steps.indexOf('done')), 800)))} style={st.listen}>
                          <Ionicons name={playing === tab ? 'pause-circle' : 'play-circle'} size={28} color={pal.accent} />
                          <Text style={[st.listenT, { color: pal.accent }]}>{playing === tab ? 'நிறுத்து' : 'கேளுங்கள்'}</Text>
                        </Pressable>
                        {tab === 'l' && note && (
                          <Pressable accessibilityRole="button" onPress={() => !committed && progress.commit(c, v, note.l.split('.')[0])} style={[st.commit, { backgroundColor: committed ? 'transparent' : pal.accent, borderColor: pal.accent }]}>
                            <Ionicons name={committed ? 'checkmark-circle' : 'flame'} size={15} color={committed ? pal.accent : '#fff'} />
                            <Text style={[st.commitT, { color: committed ? pal.accent : '#fff' }]}>{committed ? 'ஏற்றுக்கொண்டீர்கள்' : 'இன்று செய்வேன்'}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                    <Pressable accessibilityRole="button" onPress={() => router.push('/companion')} style={[st.ask, { backgroundColor: pal.card, borderColor: pal.line }]}>
                      <Ionicons name="chatbubbles-outline" size={18} color={pal.accent} />
                      <Text style={[st.askT, { color: pal.ink }]}>கடவுளிடம் கேளுங்கள்</Text>
                      <Ionicons name="chevron-forward" size={16} color={pal.sub} />
                    </Pressable>
                  </Page>
                );

              return (
                <Page height={h} key={s} style={{ justifyContent: 'center', gap: 16 }}>
                  <View style={[st.shareCard, { borderColor: pal.line }]}>
                    <View style={st.shareArt}>
                      <UpadesamStage focus="wide" variant={c === 11 ? 'vishwaroopa' : 'upadesam'} glow={false} />
                    </View>
                    <View style={{ padding: 14, gap: 8, backgroundColor: '#1A1408' }}>
                      <Text style={[verseFont(prefs.script, 0.72, 20), { color: '#F6DFA4' }]} numberOfLines={3}>
                        {main.join('\n')}
                      </Text>
                      <Text style={[bodyFont(en ? 'en' : 'ta', 0.92, 15), { color: '#F3E6C8' }]} numberOfLines={5}>
                        {meaning}
                      </Text>
                      <Text style={st.brand}>பகவத் கீதை {c}.{v}</Text>
                    </View>
                  </View>
                  <View style={st.row}>
                    <Pressable accessibilityRole="button" onPress={share} style={[st.big, { backgroundColor: pal.card, borderColor: pal.line, borderWidth: 1 }]}>
                      <Ionicons name="share-social-outline" size={18} color={pal.ink} />
                      <Text style={[st.bigT, { color: pal.ink }]}>பகிருங்கள்</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => progress.toggleSaved(c, v)} style={[st.big, { backgroundColor: pal.card, borderColor: pal.line, borderWidth: 1 }]}>
                      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? pal.accent : pal.ink} />
                      <Text style={[st.bigT, { color: pal.ink }]}>{saved ? 'சேமித்தது' : 'சேமி'}</Text>
                    </Pressable>
                  </View>
                  {nextHref ? (
                    <Pressable accessibilityRole="button" onPress={toNext} style={[st.next, { backgroundColor: pal.accent }]}>
                      <Text style={st.nextT}>அடுத்த சுலோகம்</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </Pressable>
                  ) : (
                    <Text style={[st.h1, { color: pal.accent, fontSize: 18 }]}>கீதையை நிறைவு செய்தீர்கள் 🙏</Text>
                  )}
                  {prevHref && (
                    <Pressable accessibilityRole="button" onPress={() => router.replace(prevHref as never)} style={{ alignSelf: 'center', padding: 8 }}>
                      <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: pal.sub }}>முந்தைய சுலோகம்</Text>
                    </Pressable>
                  )}
                </Page>
              );
            })}
          </ScrollView>
        )}

        {/* step dots */}
        <View style={st.dots} pointerEvents="box-none">
          {steps.map((s, i) => (
            <Pressable key={s} accessibilityLabel={`படி ${i + 1}`} onPress={() => goPage(i)} hitSlop={6}>
              <View style={[st.dot, { backgroundColor: i === page ? pal.accent : pal.line, height: i === page ? 22 : 8 }]} />
            </Pressable>
          ))}
        </View>

        {page < steps.length - 1 && (
          <Animated.View pointerEvents="box-none" style={[st.hint, { paddingBottom: insets.bottom + 6, transform: [{ translateY: hint.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]}>
            <Pressable onPress={() => goPage(page + 1)} style={st.hintBtn} accessibilityRole="button" accessibilityLabel="அடுத்த படி">
              <Ionicons name="chevron-up" size={16} color={pal.sub} />
              <Text style={[st.hintT, { color: pal.sub }]}>மேலே ஸ்வைப் செய்யுங்கள்</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
      <ReaderSettings open={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 6 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { flex: 1, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, height: 36, justifyContent: 'center' },
  pillT: { fontFamily: F.taSemi, fontSize: 13 },
  sceneCard: { height: '78%', borderRadius: 26, overflow: 'hidden', backgroundColor: '#000' },
  sceneText: { position: 'absolute', left: 18, right: 18, bottom: 20, gap: 10 },
  sceneBadge: { alignSelf: 'flex-start', backgroundColor: '#F3D48F', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  sceneBadgeT: { fontFamily: F.taBold, fontSize: 12, color: '#2B1D0E' },
  sceneBig: { fontFamily: F.taBold, fontSize: 22, lineHeight: 34, color: '#FFF6E2' },
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  chipT: { fontFamily: F.taSemi, fontSize: 14, lineHeight: 24, color: '#fff', flexShrink: 1 },
  originalToggle: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  center: { textAlign: 'center' },
  glow: { textShadowColor: 'rgba(227,150,40,0.45)', textShadowRadius: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  word: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  wordT: { fontFamily: F.taSemi, fontSize: 12.5 },
  wordMean: { fontFamily: F.taSemi, fontSize: 13.5, textAlign: 'center', minHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  big: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 10 },
  bigT: { fontFamily: F.taBold, fontSize: 14, color: '#fff' },
  h1: { fontFamily: F.taBold, fontSize: 26, textAlign: 'left' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 4, borderRadius: 14, borderWidth: 1.5, paddingVertical: 10 },
  tabT: { fontFamily: F.taSemi, fontSize: 13, lineHeight: 23, textAlign: 'center', flexShrink: 1 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14 },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listenT: { fontFamily: F.taSemi, fontSize: 13.5 },
  commit: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, height: 36 },
  commitT: { fontFamily: F.taSemi, fontSize: 12.5 },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, borderWidth: 1, padding: 14 },
  askT: { flex: 1, fontFamily: F.taSemi, fontSize: 14 },
  shareCard: { borderRadius: 22, overflow: 'hidden', borderWidth: 1 },
  shareArt: { height: 150, backgroundColor: '#000' },
  brand: { fontSize: 10.5, letterSpacing: 1.5, color: '#C9973F', fontWeight: '700' },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 54, borderRadius: 18 },
  nextT: { fontFamily: F.taBold, fontSize: 16, color: '#fff' },
  dots: { position: 'absolute', right: 6, top: '40%', gap: 6, alignItems: 'center' },
  dot: { width: 5, borderRadius: 3 },
  hint: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12 },
  hintT: { fontFamily: F.ta, fontSize: 12 },
});
