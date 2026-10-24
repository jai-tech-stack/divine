import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NAYANMARS } from '@/content/nayanmars';
import { C, F } from '@/theme';

/** The sixty-three, in the order of Sekkizhar's Periya Puranam. Ready stories open as cinematic tales. */
export default function Nayanmar() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(null);
  const ready = NAYANMARS.filter((x) => x.story);
  return (
    <View style={{ flex: 1, backgroundColor: C.night }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={st.hero}>
          <Image source={require('@/assets/story/loka-kailasam.jpg')} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
          <LinearGradient colors={['rgba(7,11,20,0.5)', 'transparent', C.night]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
          <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} style={[st.back, { top: insets.top + 6 }]}>
            <Ionicons name="arrow-back" size={22} color={C.cream} />
          </Pressable>
          <View style={st.heroText}>
            <Text style={st.kicker}>பெரிய புராணம் · சேக்கிழார்</Text>
            <Text style={st.title}>அறுபத்து மூன்று நாயன்மார்</Text>
            <Text style={st.sub}>எப்படி வாழ்ந்தார்கள் · எப்படி வழிபட்டார்கள் · என்ன ஒழுக்கம்</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Text style={st.h}>முழுக் கதைகள் · {ready.length} / 63</Text>
          {ready.map((x) => (
            <Pressable key={x.n} accessibilityRole="button" onPress={() => router.push(`/stories/${x.story}` as never)} style={({ pressed }) => [st.ready, pressed && { opacity: 0.88 }]}>
              <View style={st.num}>
                <Text style={st.numT}>{x.n}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={st.rName}>{x.ta}</Text>
                <Text style={st.rTheme}>{x.theme}</Text>
              </View>
              <Ionicons name="play-circle" size={30} color={C.gold} />
            </Pressable>
          ))}

          <Text style={[st.h, { marginTop: 10 }]}>அனைவரும்</Text>
          <View style={st.list}>
            {NAYANMARS.map((x, i) => (
              <Pressable
                key={x.n}
                accessibilityRole="button"
                onPress={() => (x.story ? router.push(`/stories/${x.story}` as never) : setOpen(open === x.n ? null : x.n))}
                style={[st.row, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(227,184,101,0.14)' }]}>
                <Text style={st.rn}>{x.n}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={st.rt}>{x.ta}</Text>
                  {(open === x.n || x.story) && <Text style={st.rs}>{x.place ? `${x.place} · ` : ''}{x.theme}</Text>}
                  {open === x.n && <Text style={st.soon}>முழுக் கதை விரைவில் சேர்க்கப்படும்.</Text>}
                </View>
                {x.story ? <Ionicons name="play-circle-outline" size={22} color={C.gold} /> : <Ionicons name={open === x.n ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />}
              </Pressable>
            ))}
          </View>
          <Text style={st.note}>பெயர்கள், வரிசை: சேக்கிழாரின் பெரிய புராணம். கதைகள் Divine Life-இன் சொந்த மறுகூறல்; நிகழ்வுகள் மரபுப்படி.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  hero: { height: 300, backgroundColor: '#000', overflow: 'hidden', marginBottom: 14 },
  back: { position: 'absolute', left: 12, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(7,11,20,0.55)', alignItems: 'center', justifyContent: 'center' },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  kicker: { fontFamily: F.taSemi, fontSize: 12.5, color: C.gold },
  title: { fontFamily: F.taBold, fontSize: 28, lineHeight: 42, color: C.cream },
  sub: { fontFamily: F.ta, fontSize: 13, color: '#eadfc6' },
  h: { fontFamily: F.taBold, fontSize: 17, color: C.gold },
  ready: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(227,184,101,0.4)', backgroundColor: 'rgba(17,26,46,0.9)' },
  num: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  numT: { fontFamily: F.num, fontSize: 18, color: C.ink },
  rName: { fontFamily: F.taBold, fontSize: 16.5, color: C.cream },
  rTheme: { fontFamily: F.ta, fontSize: 12.5, lineHeight: 20, color: C.muted },
  list: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)', backgroundColor: 'rgba(17,26,46,0.7)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 52 },
  rn: { width: 28, fontFamily: F.num, fontSize: 17, color: C.gold },
  rt: { fontFamily: F.taSemi, fontSize: 15, color: C.cream },
  rs: { fontFamily: F.ta, fontSize: 12.5, lineHeight: 20, color: C.muted },
  soon: { fontFamily: F.taSemi, fontSize: 12, color: C.goldLight },
  note: { fontFamily: F.ta, fontSize: 11, lineHeight: 18, color: 'rgba(201,187,155,0.75)' },
});
