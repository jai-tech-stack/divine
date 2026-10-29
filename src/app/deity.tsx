import { DeityImage } from '@/components/DeityImage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Icons } from '@/components/ui';
import { DEITIES, deityForToday, type Deity } from '@/content/deities';
import { setPrefs, usePrefs } from '@/lib/prefs';
import { C, F } from '@/theme';

const DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export default function DeityPicker() {
  const insets = useSafeAreaInsets();
  const prefs = usePrefs();
  const { width, fontScale } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const availableWidth = gridWidth || Math.max(1, width - 32);
  const columns = fontScale >= 1.5 || availableWidth < 260 ? 1 : 2;
  const cardWidth = Math.floor((availableWidth - (columns - 1) * 12) / columns);
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
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={st.title}>இஷ்ட தெய்வம்</Text>
          <Text style={[st.sub, { textAlign: 'center' }]}>முகப்பிற்கும் ஜபத்திற்கும் தெய்வத்தைத் தேர்ந்தெடுங்கள்</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 16 }}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: prefs.deity === 'weekday' }}
          onPress={() => pick('weekday')}
          style={[st.weekday, prefs.deity === 'weekday' && st.on]}>
          <DeityImage source={today.image} style={st.weekdayImg} resizeMode="cover" />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={st.name}>வாரநாள் வழிபாடு</Text>
            <Text style={st.sub}>
              இன்று {DAYS[new Date().getDay()]} · {today.ta}
            </Text>
          </View>
        </Pressable>
        <View style={st.grid} onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
          {DEITIES.map((d) => (
            <Card key={d.id} width={cardWidth} fontScale={fontScale} d={d} on={prefs.deity === d.id} onPress={() => pick(d.id)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ d, width, fontScale, on, onPress }: { d: Deity; width: number; fontScale: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={d.ta} onPress={onPress} style={({ pressed }) => [st.card, { width, height: Math.max(240 * fontScale, width * 1.5) }, on && st.on, pressed && { opacity: 0.9 }]}>
      <DeityImage source={d.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(7,11,20,0.2)', 'rgba(7,11,20,0.92)']} style={StyleSheet.absoluteFill} />
      <View style={st.cardText}>
        <Text style={st.name}>{d.ta}</Text>
        <Text style={st.mantra}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, minHeight: 84 },
  title: { fontFamily: F.taBold, fontSize: 20, lineHeight: 32, color: C.gold },
  sub: { fontFamily: F.ta, fontSize: 12, lineHeight: 21, color: C.muted },
  weekday: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: C.panelLine, backgroundColor: C.panel },
  weekdayImg: { width: 64, height: 64, borderRadius: 32 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 },
  card: { flexGrow: 0, flexShrink: 0, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)', backgroundColor: '#000' },
  on: { borderColor: C.gold, borderWidth: 2 },
  cardText: { position: 'absolute', left: 12, right: 12, bottom: 10 },
  name: { fontFamily: F.taBold, fontSize: 16, lineHeight: 27, color: C.cream },
  mantra: { fontFamily: F.ta, fontSize: 11.5, lineHeight: 20, color: C.goldLight },
  check: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
});
