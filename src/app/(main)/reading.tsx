import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F } from '@/theme';

const SHELVES = [
  { title: 'பகவத் கீதை', sub: 'சுலோகம் · தமிழ் பொருள் · வாழ்வியல் விளக்கம்', href: '/gita' },
  { title: 'நாயன்மார் திருச்சரிதம்', sub: 'அறுபத்து மூவரின் வாழ்வும் தொண்டும்', href: '/nayanmar' },
  { title: 'புராணக் கதைப்பயணம்', sub: 'புராண நிகழ்வுகளின் காட்சிக் கதைகள்', href: '/puranas' },
  { title: 'நூல்களின் கதைப்பயணம்', sub: 'ஆதார நூல்களிலிருந்து காட்சிகளுக்குள்', href: '/library/books' },
  { title: 'வாழ்வியல் ஞானம்', sub: 'வேதாந்தம் · யோகநெறி · தத்துவச் சிந்தனை', href: '/library' },
] as const;
export default function Reading() {
  const inset = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: '#0C1412' }}>
    <ScrollView contentContainerStyle={[st.content, { paddingTop: inset.top + 26 }]}>
      <Text style={st.eyebrow}>அறிவோம் · உணர்வோம் · வாழ்வோம்</Text>
      <Text style={st.title}>வாசிப்பு</Text>
      <Text style={st.sub}>ஒரு கருத்தை வாசிப்போம்.{ '\n' }அதன் பொருளை வாழ்வில் உணர்வோம்.</Text>
      <View style={{ gap: 12, marginTop: 22 }}>
        {SHELVES.map((s, i) => <Pressable key={s.href} accessibilityRole="button" onPress={() => router.push(s.href)} style={st.row}>
          <Text style={st.number}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={{ flex: 1, gap: 8 }}><Text style={st.name}>{s.title}</Text><Text style={st.sub}>{s.sub}</Text></View>
          <Text style={st.arrow}>→</Text>
        </Pressable>)}
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/library/sources')} style={{ paddingVertical: 25 }}><Text style={st.note}>மூலநூல் குறிப்புகளைப் பாருங்கள் →</Text></Pressable>
    </ScrollView>
  </View>;
}
const st = StyleSheet.create({
  content: { padding: 22, maxWidth: 600, width: '100%', alignSelf: 'center', paddingBottom: 30 },
  eyebrow: { fontFamily: F.ta, fontSize: 11, lineHeight: 24, color: '#ABB8AF' },
  title: { fontFamily: F.taBold, fontSize: 30, lineHeight: 48, color: '#F2EEE3', marginTop: 10 },
  sub: { fontFamily: F.ta, fontSize: 12, lineHeight: 25, color: '#ABB8AF' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 24, borderRadius: 16, backgroundColor: '#15221E', borderWidth: 1, borderColor: '#2D3C34' },
  number: { fontFamily: F.num, fontSize: 21, color: '#9F916E' },
  name: { fontFamily: F.taSemi, fontSize: 17, lineHeight: 30, color: '#F2EEE3' },
  arrow: { fontSize: 22, color: '#E0BE83' },
  note: { fontFamily: F.ta, fontSize: 12, lineHeight: 24, color: '#E0BE83' },
});
