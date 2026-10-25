import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Icons } from '@/components/ui';
import { SCENES } from '@/content/deities';
import { COLLECTIONS } from '@/content/library';
import { C, F } from '@/theme';

const EXTRA = [
  { title: 'மூல நூல்கள்', subtitle: '10 அருள்நூல்கள் · வாசிக்க · தேட · நகலெடுக்க', href: '/library/books', image: SCENES.library },
  { title: 'பகவத் கீதை', subtitle: '700 சுலோகங்கள் · தருணம், பொருள், ஞானம்', href: '/gita', image: SCENES.krishnaArjuna },
  { title: 'மந்திரங்கள்', subtitle: 'தெய்வம் வாரியாக · வரிக்கு வரி பொருள்', href: '/mantras', image: SCENES.temple },
  { title: 'தெய்வங்கள்', subtitle: '10 தெய்வங்கள் · உங்கள் தெய்வத்தைத் தேர்ந்தெடுங்கள்', href: '/deity', image: SCENES.shivaNandi },
];

export default function Library() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={st.fill} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={st.hero}>
        <Image source={SCENES.library} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
        <LinearGradient colors={['rgba(7,11,20,0.4)', 'transparent', C.night]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12 }}>
          <IconButton label="பின்செல்" onPress={() => router.back()} style={{ backgroundColor: 'rgba(7,11,20,0.5)' }}>
            {Icons.back(C.cream)}
          </IconButton>
        </View>
        <View style={st.heroText}>
          <Text style={st.title}>ஞான நூல்கள்</Text>
          <Text style={st.sub}>அருள்நூல்கள் · யோகநெறி · தத்துவம்</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {[...EXTRA, ...COLLECTIONS.map((c) => ({ title: c.title, subtitle: c.subtitle, href: `/library/${c.id}`, image: c.image }))].map((x) => (
          <Pressable key={x.href} accessibilityRole="button" onPress={() => router.push(x.href as never)} style={({ pressed }) => [st.card, pressed && { opacity: 0.9 }]}>
            <Image source={x.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
            <LinearGradient colors={['rgba(7,11,20,0.92)', 'rgba(7,11,20,0.35)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 2 }}>
              <Text style={st.cardTitle}>{x.title}</Text>
              <Text style={st.cardSub}>{x.subtitle}</Text>
            </View>
            <View style={{ justifyContent: 'center', paddingRight: 14 }}>{Icons.arrow(C.goldLight)}</View>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={() => router.push('/library/sources')} style={{ paddingVertical: 12 }}><Text style={st.note}>மூலநூல் குறிப்புகள்</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night },
  hero: { height: 300, backgroundColor: '#000', overflow: 'hidden', marginBottom: 12 },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  title: { fontFamily: F.taBold, fontSize: 30, lineHeight: 44, color: C.cream },
  sub: { fontFamily: F.ta, fontSize: 13, color: '#eadfc6' },
  card: { height: 96, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)', backgroundColor: '#000' },
  cardTitle: { fontFamily: F.taBold, fontSize: 18, color: C.cream },
  cardSub: { fontFamily: F.ta, fontSize: 12.5, color: C.goldLight },
  note: { fontFamily: F.ta, fontSize: 11.5, lineHeight: 19, color: C.muted, marginTop: 8 },
});
