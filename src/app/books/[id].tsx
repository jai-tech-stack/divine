import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOOKS } from '@/content/books';
import { storiesForBook } from '@/content/journeys';
import { F } from '@/theme';

export default function BookJourney() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meta = BOOKS.find(book => book.id === id);
  const episodes = storiesForBook(id ?? '');
  const inset = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: '#0C1412' }}>
    <ScrollView contentContainerStyle={{ padding: 22, paddingTop: inset.top + 18, paddingBottom: inset.bottom + 30, gap: 20 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.canGoBack() ? router.back() : router.replace('/reading')}><Text style={st.link}>← கதைப்பயணங்கள்</Text></Pressable>
      <Text style={st.title}>{meta?.title ?? 'நூல் கிடைக்கவில்லை'}</Text>
      <Text style={st.body}>நூல் சொல்லும் நிகழ்வுகளுக்குள், தமிழ்க் கதைசொல்லலுடன் ஒரு பயணம்.</Text>
      {episodes.length ? episodes.map((story, i) => <Pressable key={story.id} accessibilityRole="button" onPress={() => router.push(`/stories/${story.id}`)} style={st.card}>
        {story.id === 'tirunilakanta' && story.scenes[0].image && <Image source={story.scenes[0].image} resizeMode="cover" style={{ width: '100%', height: 210, borderRadius: 12 }} />}
        <Text style={st.eyebrow}>{story.id === 'tirunilakanta' ? 'புதிய காட்சியாக்கம் · தமிழ்க் குரல்' : `கதை ${i + 1}`}</Text>
        <Text style={st.heading}>{story.title}</Text><Text style={st.body}>{story.subtitle}</Text><Text style={st.link}>கதைப்பயணத்தைத் தொடங்கு →</Text>
      </Pressable>) : <View style={st.card}><Text style={st.heading}>காட்சித் தொகுப்பு தயாராகிறது</Text><Text style={st.body}>இந்த நூலின் பொருளை வாசித்து, ஆதாரத்துடன் காட்சிகளாக அமைக்கும் பணி இன்னும் நிறைவடையவில்லை.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/nayanmar')}><Text style={st.link}>தயாரான திருச்சரிதங்களைப் பாருங்கள் →</Text></Pressable></View>}
      {meta && <View style={st.source}><Text style={st.eyebrow}>ஆதாரத்தை ஒப்பிட விரும்பினால்</Text><Text style={st.body}>இங்கே தனியாக மூலப்பிரதியின் உரையைப் பார்க்கலாம். இது கதையின் காட்சிப் பதிப்பு அல்ல; பிரித்தெடுத்த உரையில் மெய்ப்புத் திருத்தம் நிலுவையில் உள்ளது.</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/book-source/[id]', params: { id: meta.id, ...(meta.id === 'nayanmar-stories' ? { page: '9' } : meta.id === 'eighteen-puranas' ? { page: '29' } : {}) } })}><Text style={st.link}>மூலப்பிரதியைத் திற →</Text></Pressable></View>}
    </ScrollView>
  </View>;
}
const st = StyleSheet.create({
  title: { fontFamily: F.taBold, fontSize: 27, lineHeight: 43, color: '#F2EEE3' },
  heading: { fontFamily: F.taSemi, fontSize: 18, lineHeight: 31, color: '#F2EEE3' },
  body: { fontFamily: F.ta, fontSize: 13, lineHeight: 26, color: '#ABB8AF' },
  link: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 25, color: '#E0BE83', paddingVertical: 5 },
  eyebrow: { fontFamily: F.ta, fontSize: 11, lineHeight: 23, color: '#E0BE83' },
  card: { padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#2D3C34', backgroundColor: '#15221E', gap: 12 },
  source: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#2D3C34', paddingTop: 22, gap: 10 },
});
