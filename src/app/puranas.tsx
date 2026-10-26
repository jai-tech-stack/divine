import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Icons } from '@/components/ui';
import { stories } from '@/content';
import { C, F } from '@/theme';
import { PURANA_SECTIONS } from '@/content/puranas';

const PURANAS = stories.filter(story => !/நாயன்மார்|பெரிய\s*புராணம்/.test(story.purana));
export default function Puranas() {
  const insets = useSafeAreaInsets();
  return <View style={[st.fill, { paddingTop: insets.top }]}>
    <View style={st.header}><IconButton label="பின்செல்" onPress={() => router.back()}>{Icons.back()}</IconButton><Text style={st.title}>புராணச் சரிதங்கள்</Text></View>
    <FlatList data={PURANA_SECTIONS} keyExtractor={item => item.id} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }}
      ListHeaderComponent={<View style={{ gap: 12, marginBottom: 6 }}>
        <Text style={st.body}>புராணங்கள் உணர்த்தும் பக்தி, அறம், வாழ்வியல் நெறிகள்.</Text>
        <Text style={st.name}>காட்சிச் சரிதங்கள்</Text>
        {PURANAS.map(story => <Pressable key={story.id} accessibilityRole="button" onPress={() => router.push(`/stories/${story.id}`)} style={st.card}><View style={{ flex: 1, gap: 5 }}><Text style={st.name}>{story.title}</Text><Text style={st.source}>{story.purana} · காட்சிகளுடன் மறுகூறல்</Text></View><Ionicons name="play-circle-outline" size={24} color={C.gold} /></Pressable>)}
        <Text style={st.name}>பதினெண் புராணங்கள் · நூல் வாசிப்பு</Text>
        <Text style={st.body}>அ.ச. ஞானசம்பந்தன், ஞா. மீரா தொகுத்த தமிழ் சுருக்க நூலின் பகுதிகள். இவை பதினெட்டுப் புராணங்களின் முழு மூலப் பதிப்புகள் அல்ல. வழங்கப்பட்ட பிரதியில் 17 பகுதிகள் உள்ளன; பிரம்மாண்ட புராணப் பகுதி கிடைக்கவில்லை. பிரித்தெடுத்த உரையின் மெய்ப்புத் திருத்தம் நிலுவையில் உள்ளது.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/library/sources')}><Text style={st.source}>மூலநூல் குறிப்புகள்</Text></Pressable>
      </View>}
      renderItem={({ item, index }) => item.page ? <Pressable accessibilityRole="button" accessibilityLabel={`${item.title} பகுதியை வாசிக்க`} onPress={() => router.push({ pathname: '/books/[id]', params: { id: 'eighteen-puranas', page: String(item.page) } })} style={st.card}><View style={{ flex: 1, gap: 5 }}><Text style={st.name}>{index + 1}. {item.title}</Text><Text style={st.source}>தமிழ் நூல் பகுதி · மூலப் பக்கம் {item.page}</Text></View><Ionicons name="book-outline" size={20} color={C.gold} /></Pressable> : <View style={st.card}><View style={{ flex: 1, gap: 5 }}><Text style={st.name}>{index + 1}. {item.title}</Text><Text style={st.source}>வழங்கப்பட்ட நூல் பிரதியில் இப்பகுதி இல்லை.</Text></View></View>} />
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
