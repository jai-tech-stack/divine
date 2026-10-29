import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Particles, Vignette } from '@/components/cinema/Effects';
import { KenBurns, Reveal } from '@/components/library/KenBurns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Icons } from '@/components/ui';
import { type Collection as LibCollection, getCollection, type LibEntry } from '@/content/library';
import { C, F } from '@/theme';

export default function CollectionScreen() {
  const { col } = useLocalSearchParams<{ col: string }>();
  const c = getCollection(col);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(c?.entries[0]?.id ?? null);
  const [reel, setReel] = useState(false);
  useEffect(() => () => {
    Speech.stop();
  }, []);
  if (!c) return <View style={st.fill} />;
  return (
    <ScrollView style={st.fill} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={st.hero}>
        <KenBurns source={c.image} />
        <LinearGradient colors={['rgba(7,11,20,0.4)', 'transparent', C.night]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Particles kind="dust" paused={false} />
        <Vignette strength={0.6} />
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12 }}>
          <IconButton label="பின்செல்" onPress={() => router.back()} style={{ backgroundColor: 'rgba(7,11,20,0.5)' }}>
            {Icons.back(C.cream)}
          </IconButton>
        </View>
        <View style={st.heroText}>
          <Text style={st.title}>{c.title}</Text>
          <Text style={st.sub}>{c.subtitle}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Text style={st.intro}>{c.intro}</Text>
        <Pressable accessibilityRole="button" onPress={() => setReel(true)} style={st.play}>
          {Icons.arrow(C.ink)}
          <Text style={st.playT}>கதையாகக் காண் · {c.entries.length} காட்சிகள்</Text>
        </Pressable>
        {c.note && <Text style={st.note}>{c.note}</Text>}
        {c.entries.map((e, i) => (
          <Entry key={e.id} e={e} n={i + 1} collectionId={c.id} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} />
        ))}
      </View>
      {reel && <Reel visible onClose={() => setReel(false)} title={c.title} image={c.image} entries={c.entries} />}
    </ScrollView>
  );
}

/** Entries told as full-screen scenes, one swipe at a time. */
function Reel({ visible, onClose, title, image, entries }: { visible: boolean; onClose: () => void; title: string; image: LibCollection['image']; entries: LibEntry[] }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  useEffect(() => () => {
    Speech.stop();
  }, []);
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onEnd} key={String(visible)}>
          {entries.map((e, i) => {
            const active = visible && i === page;
            return (
              <View key={e.id} style={{ width, height }}>
                <KenBurns source={image} active={active} variant={i} />
                <LinearGradient colors={['rgba(7,11,20,0.6)', 'rgba(7,11,20,0.25)', 'rgba(7,11,20,0.9)', 'rgba(7,11,20,0.98)']} locations={[0, 0.25, 0.6, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
                <Particles kind={i % 2 ? 'sparks' : 'dust'} paused={!active} />
                <Vignette strength={0.7} />
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 22, paddingTop: height * 0.3, paddingBottom: insets.bottom + 60, gap: 12 }}>
                  <Reveal show={active}>
                    <Text style={st.reelNo}>காட்சி {i + 1} / {entries.length}</Text>
                    <Text style={st.reelTitle}>{e.title}</Text>
                    {e.subtitle && <Text style={st.eSub}>{e.subtitle}</Text>}
                  </Reveal>
                  <Reveal show={active} delay={400}>
                    <Text style={st.reelBody}>{e.body}</Text>
                    {e.points?.map((p) => (
                      <View key={p} style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        <Text style={{ color: C.gold }}>•</Text>
                        <Text style={[st.reelBody, { flex: 1, fontSize: 14 }]}>{p}</Text>
                      </View>
                    ))}
                    {e.links && e.links.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {e.links.map((l) => (
                          <Pressable key={l.href} onPress={() => { onClose(); router.push(l.href as never); }} style={[st.link, st.linkGold]}>
                            <Text style={[st.linkT, { color: C.ink }]}>{l.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </Reveal>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
        <View style={{ position: 'absolute', top: insets.top + 6, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconButton label="மூடு" onPress={onClose} style={{ backgroundColor: 'rgba(7,11,20,0.5)' }}>
            {Icons.back(C.cream)}
          </IconButton>
          <Text style={[st.sub, { flex: 1 }]} numberOfLines={1}>{title}</Text>
        </View>
        <View style={{ position: 'absolute', bottom: insets.bottom + 22, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 }} pointerEvents="none">
          {entries.map((e, i) => (
            <View key={e.id} style={{ width: i === page ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === page ? C.gold : 'rgba(243,230,200,0.35)' }} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

function Entry({ e, n, collectionId, open, onToggle }: { e: LibEntry; n: number; collectionId: string; open: boolean; onToggle: () => void }) {
  const [speaking, setSpeaking] = useState(false);
  const listen = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(`${e.title}. ${e.body} ${(e.points ?? []).join('. ')}`, { language: 'ta-IN', rate: 0.92, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };
  return (
    <View style={[st.card, open && { borderColor: C.gold }]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} style={st.head}>
        <View style={st.num}>
          <Text style={st.numT}>{n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.eTitle}>{e.title}</Text>
          {e.subtitle && <Text style={st.eSub}>{e.subtitle}</Text>}
        </View>
        <Text style={{ color: C.gold, fontSize: 18 }}>{open ? '−' : '+'}</Text>
      </Pressable>
      {open && (
        <View style={{ gap: 10, paddingTop: 4 }}>
          <Text style={st.body}>{e.body}</Text>
          {collectionId === 'alvars' && <Text style={st.entryNote}>சுருக்கமான மரபுக் குறிப்பு · முழுச் சரிதமல்ல · மூலப் பாசுர ஒப்பீடு நிலுவையில்</Text>}
          {e.points?.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: C.gold }}>•</Text>
              <Text style={[st.body, { flex: 1, fontSize: 14 }]}>{p}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Pressable onPress={listen} style={st.link}>
              <Text style={st.linkT}>{speaking ? 'நிறுத்து' : 'கேளுங்கள்'}</Text>
            </Pressable>
            {e.links?.map((l) => (
              <Pressable key={l.href} onPress={() => router.push(l.href as never)} style={[st.link, st.linkGold]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[st.linkT, { color: C.ink }]}>{l.label}</Text>
                  {Icons.arrow(C.ink)}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  hero: { height: 300, backgroundColor: '#000', overflow: 'hidden', marginBottom: 12 },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  title: { fontFamily: F.taBold, fontSize: 28, lineHeight: 42, color: C.cream, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 },
  sub: { fontFamily: F.ta, fontSize: 13, color: C.goldLight },
  play: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.gold, borderRadius: 999, paddingHorizontal: 18, minHeight: 44 },
  playT: { fontFamily: F.taSemi, fontSize: 13.5, lineHeight: 24, color: C.ink },
  reelNo: { fontFamily: F.taSemi, fontSize: 12, letterSpacing: 1.2, color: C.gold },
  reelTitle: { fontFamily: F.taBold, fontSize: 30, lineHeight: 46, color: C.cream, textShadowColor: 'rgba(0,0,0,0.85)', textShadowRadius: 12 },
  reelBody: { fontFamily: F.ta, fontSize: 16, lineHeight: 29, color: '#F0E6CE' },
  intro: { fontFamily: F.ta, fontSize: 15, lineHeight: 26, color: C.cream },
  note: { fontFamily: F.ta, fontSize: 12, lineHeight: 20, color: C.muted, borderLeftWidth: 0, backgroundColor: 'rgba(227,184,101,0.08)', padding: 10, borderRadius: 10 },
  card: { borderRadius: 16, padding: 14, backgroundColor: C.panel, borderWidth: 1, borderColor: 'rgba(227,184,101,0.2)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  num: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.panelLine, alignItems: 'center', justifyContent: 'center' },
  numT: { fontFamily: F.num, fontSize: 15, color: C.gold },
  eTitle: { fontFamily: F.taBold, fontSize: 16, color: C.cream },
  eSub: { fontFamily: F.ta, fontSize: 12, color: C.goldLight },
  body: { fontFamily: F.ta, fontSize: 15, lineHeight: 26, color: C.cream },
  entryNote: { fontFamily: F.ta, fontSize: 11, lineHeight: 18, color: C.goldLight, backgroundColor: 'rgba(227,184,101,0.08)', padding: 10, borderRadius: 10 },
  link: { borderRadius: 999, borderWidth: 1, borderColor: C.panelLine, paddingHorizontal: 14, minHeight: 36, justifyContent: 'center' },
  linkGold: { backgroundColor: C.gold, borderColor: C.gold },
  linkT: { fontFamily: F.taSemi, fontSize: 12.5, color: C.cream },
});
