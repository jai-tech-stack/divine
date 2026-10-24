import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Icons } from '@/components/ui';
import { DEITIES, deityForToday, type Deity } from '@/content/deities';
import { setPrefs, usePrefs } from '@/lib/prefs';
import { C, F } from '@/theme';

const DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export default function DeityPicker() {
  const insets = useSafeAreaInsets();
  const prefs = usePrefs();
  const today = deityForToday('weekday');
  const pick = (id: string) => {
    setPrefs({ deity: id });
    router.back();
  };
  return (
    <View style={[st.fill, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <IconButton label="பின்செல்" onPress={() => router.back()}>
          {Icons.back()}
        </IconButton>
        <View style={{ alignItems: 'center' }}>
          <Text style={st.title}>உங்கள் தெய்வம்</Text>
          <Text style={st.sub}>முகப்பும் ஜப மாலையும் இதைப் பின்பற்றும்</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: prefs.deity === 'weekday' }}
          onPress={() => pick('weekday')}
          style={[st.weekday, prefs.deity === 'weekday' && st.on]}>
          <Image source={today.image} style={st.weekdayImg} resizeMode="cover" />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={st.name}>வாரநாள் படி</Text>
            <Text style={st.sub}>
              இன்று {DAYS[new Date().getDay()]} · {today.ta}
            </Text>
          </View>
        </Pressable>
        <View style={st.grid}>
          {DEITIES.map((d) => (
            <Card key={d.id} d={d} on={prefs.deity === d.id} onPress={() => pick(d.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ d, on, onPress }: { d: Deity; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={d.ta} onPress={onPress} style={({ pressed }) => [st.card, on && st.on, pressed && { opacity: 0.9 }]}>
      <Image source={d.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(7,11,20,0.2)', 'rgba(7,11,20,0.92)']} style={StyleSheet.absoluteFill} />
      <View style={st.cardText}>
        <Text style={st.name}>{d.ta}</Text>
        <Text style={st.mantra} numberOfLines={1}>
          {d.mantra.ta}
        </Text>
      </View>
      {on && (
        <View style={st.check}>
          {Icons.check(C.ink, 16)}
        </View>
      )}
    </Pressable>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, height: 60 },
  title: { fontFamily: F.taBold, fontSize: 20, color: C.gold },
  sub: { fontFamily: F.ta, fontSize: 12, color: C.muted },
  weekday: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: C.panelLine, backgroundColor: C.panel },
  weekdayImg: { width: 64, height: 64, borderRadius: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', flexGrow: 1, aspectRatio: 0.72, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)', backgroundColor: '#000' },
  on: { borderColor: C.gold, borderWidth: 2 },
  cardText: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  name: { fontFamily: F.taBold, fontSize: 16, color: C.cream },
  mantra: { fontFamily: F.ta, fontSize: 11.5, color: C.goldLight },
  check: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
});
