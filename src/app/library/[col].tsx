import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Icons } from '@/components/ui';
import { getCollection, type LibEntry } from '@/content/library';
import { C, F } from '@/theme';

export default function CollectionScreen() {
  const { col } = useLocalSearchParams<{ col: string }>();
  const c = getCollection(col);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(c?.entries[0]?.id ?? null);
  useEffect(() => () => {
    Speech.stop();
  }, []);
  if (!c) return <View style={st.fill} />;
  return (
    <ScrollView style={st.fill} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={st.hero}>
        <Image source={c.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
        <LinearGradient colors={['rgba(7,11,20,0.4)', 'transparent', C.night]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
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
        {c.note && <Text style={st.note}>{c.note}</Text>}
        {c.entries.map((e, i) => (
          <Entry key={e.id} e={e} n={i + 1} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

function Entry({ e, n, open, onToggle }: { e: LibEntry; n: number; open: boolean; onToggle: () => void }) {
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
  intro: { fontFamily: F.ta, fontSize: 15, lineHeight: 26, color: C.cream },
  note: { fontFamily: F.ta, fontSize: 12, lineHeight: 20, color: C.muted, borderLeftWidth: 0, backgroundColor: 'rgba(227,184,101,0.08)', padding: 10, borderRadius: 10 },
  card: { borderRadius: 16, padding: 14, backgroundColor: C.panel, borderWidth: 1, borderColor: 'rgba(227,184,101,0.2)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  num: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.panelLine, alignItems: 'center', justifyContent: 'center' },
  numT: { fontFamily: F.num, fontSize: 15, color: C.gold },
  eTitle: { fontFamily: F.taBold, fontSize: 16, color: C.cream },
  eSub: { fontFamily: F.ta, fontSize: 12, color: C.goldLight },
  body: { fontFamily: F.ta, fontSize: 15, lineHeight: 26, color: C.cream },
  link: { borderRadius: 999, borderWidth: 1, borderColor: C.panelLine, paddingHorizontal: 14, minHeight: 36, justifyContent: 'center' },
  linkGold: { backgroundColor: C.gold, borderColor: C.gold },
  linkT: { fontFamily: F.taSemi, fontSize: 12.5, color: C.cream },
});
