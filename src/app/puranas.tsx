import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Icons } from '@/components/ui';
import { stories } from '@/content';
import { C, F } from '@/theme';
import { PURANA_SECTIONS } from '@/content/puranas';

const PURANAS = stories.filter(story => story.sourceReviewed === true && !/நாயன்மார்|பெரிய\s*புராணம்/.test(story.purana));
export default function Puranas() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);
  return <View style={[st.fill, { paddingTop: insets.top }]}>
    <View style={st.header}><IconButton label="பின்செல்" onPress={() => router.back()}>{Icons.back()}</IconButton><Text style={st.title}>புராணச் சரிதங்கள்</Text></View>
    <FlatList data={PURANA_SECTIONS} keyExtractor={item => item.id} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }}
      ListHeaderComponent={<View style={{ gap: 12, marginBottom: 6 }}>
        <Text style={st.body}>புராணங்கள் உணர்த்தும் பக்தி, அறம், வாழ்வியல் நெறிகள்.</Text>
        <Text style={st.name}>காட்சிச் சரிதங்கள்</Text>
        {PURANAS.map(story => <Pressable key={story.id} accessibilityRole="button" onPress={() => router.push(`/stories/${story.id}`)} style={st.card}><View style={{ flex: 1, gap: 5 }}><Text style={st.name}>{story.title}</Text><Text style={st.source}>{story.purana} · காட்சிகளுடன் மறுகூறல்</Text></View><Ionicons name="play-circle-outline" size={24} color={C.gold} /></Pressable>)}
        <Text style={st.name}>புராணம் வாரியாக</Text>
        <Text style={st.body}>தயாரான கதைகள் காட்சிகளுடன் திறக்கும். மற்ற புராணங்களின் காட்சியாக்கம் படிப்படியாகச் சேர்க்கப்படும்.</Text>
      </View>}
      renderItem={({ item, index }) => {
        const ready = PURANAS.filter(story => story.purana.replace(/\s/g, '') === item.title.replace(/\s/g, ''));
        return <View style={[st.card, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === item.id }} onPress={() => setOpen(open === item.id ? null : item.id)}><Text style={st.name}>{index + 1}. {item.title}</Text><Text style={st.source}>{ready.length ? 'காட்சிக் கதைகள் உள்ளன' : 'காட்சியாக்கம் தயாராகிறது'} · {open === item.id ? 'மறை' : 'பார்'}</Text></Pressable>
          {open === item.id && <View style={{ gap: 12 }}>
            {ready.map(story => <Pressable key={story.id} accessibilityRole="button" onPress={() => router.push(`/stories/${story.id}`)}><Text style={st.name}>{story.title} →</Text></Pressable>)}
            {!ready.length && <Text style={st.body}>இந்தப் புராணத்திற்கான காட்சிக் கதைகள் இன்னும் சேர்க்கப்படவில்லை.</Text>}
            {item.page && <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/book-source/[id]', params: { id: 'eighteen-puranas', page: String(item.page) } })}><Text style={st.source}>ஆதாரத்தை ஒப்பிட மூலப்பிரதியைத் திற →</Text></Pressable>}
          </View>}
        </View>;
      }} />
  </View>;
}
const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  title: { flex: 1, fontFamily: F.taBold, fontSize: 21, lineHeight: 34, color: C.gold },
  body: { fontFamily: F.ta, fontSize: 15, lineHeight: 28, color: C.muted },
  name: { fontFamily: F.taSemi, fontSize: 18, lineHeight: 30, color: C.cream },
  source: { fontFamily: F.ta, fontSize: 12.5, lineHeight: 23, color: C.goldLight },
  card: { minHeight: 100, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: C.panelLine, backgroundColor: C.panel, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
