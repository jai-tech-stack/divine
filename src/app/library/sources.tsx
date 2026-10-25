import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Icons } from '@/components/ui';
import { stories } from '@/content';
import { C, F } from '@/theme';

export default function Sources() {
  const insets = useSafeAreaInsets();
  return <View style={[st.fill, { paddingTop: insets.top }]}>
    <View style={st.header}><IconButton label="பின்செல்" onPress={() => router.back()}>{Icons.back()}</IconButton><Text style={st.title}>மூலநூல் குறிப்புகள்</Text></View>
    <FlatList data={stories} keyExtractor={story => story.id} contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 24, gap: 14 }}
      ListHeaderComponent={<View style={{ gap: 12, marginBottom: 8 }}>
        <Text style={st.body}>நாயன்மார் திருச்சரிதங்கள் சேக்கிழார் அருளிய பெரியபுராணத்தை அடிப்படையாகக் கொண்டவை. புராணச் சரிதங்களின் நூல் விவரங்கள் ஒவ்வொரு பதிவிலும் கீழே தரப்பட்டுள்ளன.</Text>
        <Text style={st.body}>சரிதங்களும் ஞானநெறி விளக்கங்களும் எளிய தமிழில் வழங்கப்படும் சுருக்கங்கள். மூலப் பாடல்களும் அவற்றின் பொருள் விளக்கங்களும் வாசிப்பில் தனித்தனியாகக் குறிக்கப்படுகின்றன.</Text>
        <Text style={st.body}>மூல நூல்கள் பகுதியில் வழங்கப்பட்ட நூல்களின் உரைகள் உள்ளன. எழுத்துணர்வு மூலம் பெறப்பட்ட பக்கங்களில் மெய்ப்புத் திருத்த நிலை காட்டப்படும்.</Text>
        <Text style={st.heading}>சரிதங்களின் ஆதாரங்கள்</Text>
      </View>}
      renderItem={({ item }) => <View style={st.card}><Text style={st.heading}>{item.title}</Text><Text style={st.tag}>{item.purana}</Text><Text selectable style={st.body}>{item.source}</Text></View>} />
  </View>;
}
const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  title: { flex: 1, fontFamily: F.taBold, fontSize: 20, lineHeight: 32, color: C.gold },
  heading: { fontFamily: F.taSemi, fontSize: 17, lineHeight: 29, color: C.cream },
  body: { fontFamily: F.ta, fontSize: 14, lineHeight: 26, color: C.muted },
  tag: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 22, color: C.goldLight },
  card: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: C.panelLine, backgroundColor: C.panel, gap: 8 },
});
