import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeityImage } from '@/components/DeityImage';
import { ART } from '@/content/artwork';
import { groupOf, MANTRA_GROUPS, mantraOfTheDay, MANTRAS } from '@/content/mantraLib';
import { BOOKS } from '@/content/books';
import { getStory } from '@/content';
import { streak, useProgress, wicks } from '@/lib/progress';
import { F } from '@/theme';

const REFLECTIONS = [
  'இன்று ஒருவரிடம் நன்றியைச் சொல்லுங்கள். சிறிய அன்பும் ஒரு நல்ல தொடக்கமே.',
  'பதில் சொல்லும் முன் ஒரு கணம் கேளுங்கள். கவனமாகக் கேட்பதும் அன்பின் ஒரு வடிவம்.',
  'இன்றைய ஒரு செயலை முழுக் கவனத்துடன் செய்யுங்கள். அவசரமின்றி, ஒவ்வொரு படியாக.',
  'உங்களால் இயன்ற ஒரு சிறிய உதவியைச் செய்யுங்கள். அதன் பலனை எண்ணாமல் மகிழுங்கள்.',
  'கற்ற ஒரு நல்ல கருத்தை இன்றைய வாழ்வில் முயன்று பாருங்கள்.',
  'சற்று நேரம் அமைதியாக அமருங்கள். மனம் அலைந்தால் மென்மையாக நிகழ்காலத்திற்குத் திரும்புங்கள்.',
  'இன்று நடந்த ஒரு நல்ல நிகழ்வை நினைவுகூருங்கள். அதற்கு மனத்தில் நன்றி சொல்லுங்கள்.',
];
const color = { bg: '#0C1412', card: '#15221E', line: '#2D3C34', gold: '#E0BE83', ink: '#F2EEE3', sub: '#ABB8AF' };

/** One daily sequence, with navigation owned by the tab layout. */
export default function Home() {
  const inset = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const p = useProgress();
  const [more, setMore] = useState(false);
  const now = new Date();
  const todayMantra = mantraOfTheDay();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'இனிய பகல்' : hour < 21 ? 'மாலை வணக்கம்' : 'இனிய இரவு';
  const compact = width < 350 || fontScale > 1.3;
  const book = p.bookLast && BOOKS.find(b => b.id === p.bookLast!.id);
  const story = p.storyLast && !p.storyLast.completed && getStory(p.storyLast.id);
  const readings = [
    ...(book && p.readingLast?.kind === 'book' ? [{ kind: 'book', title: book.title, detail: `மூலப்பிரதி · பக்கம் ${p.bookLast!.page}`, href: `/book-source/${book.id}?page=${p.bookLast!.page}` }] : []),
    ...(story ? [{ kind: 'story', title: story.title, detail: `காட்சி ${p.storyLast!.scene + 1}`, href: `/stories/${story.id}` }] : []),
    ...(p.gitaLast ? [{ kind: 'gita', title: 'பகவத் கீதை', detail: `அத்தியாயம் ${p.gitaLast.c} · சுலோகம் ${p.gitaLast.v}`, href: `/gita/${p.gitaLast.c}/${p.gitaLast.v}` }] : []),
  ];
  const latest = readings.find(r => r.kind === p.readingLast?.kind) ?? readings[0];
  const rest = readings.filter(r => r !== latest);
  const done = wicks(p);
  const days = streak(p.streakDays);
  return <View style={{ flex: 1, backgroundColor: color.bg }}>
    <ScrollView contentContainerStyle={[st.content, { paddingTop: inset.top + 16 }]}>
      <View style={st.header}>
        <View><Text style={st.brand}>Divine Life</Text><Text style={st.tag}>அறிவோம் · உணர்வோம் · வாழ்வோம்</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="எனது கணக்கு மற்றும் அமைப்புகள்" onPress={() => router.push('/account')} style={st.account}>
          <Ionicons name="person-outline" size={23} color={color.gold} />
        </Pressable>
      </View>
      <View style={st.greeting}>
        <Text style={st.date}>{now.toLocaleDateString('ta-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <Text style={st.title}>{greeting}</Text>
        <Text style={st.body}>ஒரு நல்ல தொடக்கம். ஒரு தெளிவான சிந்தனை.</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="விநாயகர் வணக்கத்துடன் நாளைத் தொடங்குங்கள்" onPress={() => router.push('/mantras/ganesha-aindhu-karathanai')} style={[st.opening, compact && { flexDirection: 'column' }]}>
        <Image source={ART['deities/ganesha']} resizeMode="contain" style={st.ganesha} accessibilityLabel="விநாயகர்" />
        <View style={{ flex: compact ? undefined : 1, gap: 9 }}>
          <Text style={st.eyebrow}>நாளின் தொடக்கம்</Text>
          <Text style={st.cardTitle}>விநாயகர் வணக்கம்</Text>
          <Text style={st.body}>ஐந்து கரத்தனை…</Text>
          <Text style={st.action}>துதி பாடுவோம் →</Text>
        </View>
      </Pressable>

      <View style={st.section}>
        <View style={st.rowBetween}>
          <Text style={st.sectionTitle}>மந்திரங்கள்</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/mantras')} hitSlop={8}><Text style={st.action}>அனைத்தும் →</Text></Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/mantras/${todayMantra.id}`)} style={st.todayM}>
          <DeityImage source={groupOf(todayMantra.deity).image} style={st.todayImg} resizeMode="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.eyebrow}>இன்றைய மந்திரம்</Text>
            <Text style={st.cardTitle} numberOfLines={2}>{todayMantra.name}</Text>
            <Text style={st.body} numberOfLines={1}>{groupOf(todayMantra.deity).ta} · இன்றைய மந்திரம்</Text>
          </View>
          <Ionicons name="play-circle" size={36} color={color.gold} />
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 8 }} style={{ marginHorizontal: -22 }}>
          <View style={{ width: 8 }} />
          {MANTRA_GROUPS.filter(d => MANTRAS.some(m => m.deity === d.id)).map(d => <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={d.ta} onPress={() => router.push({ pathname: '/mantras', params: { group: d.id } } as never)} style={st.deityChip}>
            <DeityImage source={d.image} style={st.deityImg} resizeMode="cover" />
            <Text style={st.deityName} numberOfLines={1}>{d.ta}</Text>
          </Pressable>)}
        </ScrollView>
      </View>

      <View style={st.section}>
        <Text style={st.sectionTitle}>{latest ? 'விட்ட இடத்திலிருந்து' : 'இன்றைய வாசிப்பு'}</Text>
        {latest ? <>
          <Pressable accessibilityRole="button" onPress={() => router.push(latest.href as never)} style={st.reading}>
            <View style={{ flex: 1, gap: 6 }}><Text style={st.cardTitle}>{latest.title}</Text><Text style={st.body}>{latest.detail}</Text><Text style={st.action}>வாசிப்பைத் தொடருங்கள் →</Text></View>
          </Pressable>
          {rest.length > 0 && <>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore(!more)} style={st.more}><Text style={st.secondary}>{more ? 'மற்ற வாசிப்புகளை மறை' : 'மற்ற வாசிப்புகள்'}</Text></Pressable>
            {more && rest.map(r => <Pressable key={r.href} accessibilityRole="button" onPress={() => router.push(r.href as never)} style={st.other}><Text style={st.body}>{r.title}</Text><Text style={st.secondary}>{r.detail} →</Text></Pressable>)}
          </>}
        </> : <Pressable accessibilityRole="button" onPress={() => router.push('/reading')} style={st.reading}>
          <Text style={st.cardTitle}>ஒரு பக்கத்துடன் தொடங்கலாம்</Text><Text style={st.body}>கீதை, திருச்சரிதங்கள், ஞானநூல்கள்—உங்களுக்கு ஏற்ற வாசிப்பைத் தேர்ந்தெடுங்கள்.</Text><Text style={st.action}>வாசிப்பைத் தேர்ந்தெடு →</Text>
        </Pressable>}
      </View>

      <View style={st.section}>
        <Text style={st.sectionTitle}>இன்றைய பயணம்</Text>
        <View style={st.practice}>
          {([{ key: 'read', label: 'வாசிப்பு' }, { key: 'chant', label: 'ஜபம்' }, { key: 'talk', label: 'உரையாடல்' }] as const).map(item => <View key={item.key} style={[st.pill, done[item.key] && st.pillDone]}><Text style={[st.pillText, done[item.key] && { color: '#D6EACB' }]}>{done[item.key] ? '✓ ' : ''}{item.label}</Text></View>)}
        </View>
        {days > 0 && <Text style={st.secondary}>தொடர்ந்து {days} {days === 1 ? 'நாள்' : 'நாட்கள்'} · உங்கள் நிதானமான முயற்சி தொடரட்டும்.</Text>}
      </View>
      <View style={st.reflection}>
        <Text style={st.eyebrow}>இன்றைய சிறு முயற்சி</Text><Text style={[st.body, { lineHeight: 29 }]}>{REFLECTIONS[now.getDay()]}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/practice/dhyanam')} style={{ paddingVertical: 8 }}><Text style={st.action}>ஒரு நிமிடம் அமைதி →</Text></Pressable>
      </View>
    </ScrollView>
  </View>;
}

const st = StyleSheet.create({
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 30, gap: 26 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  brand: { fontFamily: F.num, fontSize: 29, color: color.gold, lineHeight: 36 },
  tag: { fontFamily: F.ta, fontSize: 10, lineHeight: 20, color: color.sub },
  account: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: color.line, alignItems: 'center', justifyContent: 'center' },
  greeting: { gap: 8, paddingTop: 2 },
  date: { fontFamily: F.ta, fontSize: 12, lineHeight: 22, color: color.sub },
  title: { fontFamily: F.taBold, fontSize: 27, lineHeight: 43, color: color.ink },
  body: { fontFamily: F.ta, fontSize: 13, lineHeight: 25, color: color.sub },
  opening: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 18, borderRadius: 22, backgroundColor: '#1B2B24', borderWidth: 1, borderColor: '#3D4B37' },
  ganesha: { width: 98, height: 142, borderRadius: 12 },
  eyebrow: { fontFamily: F.taSemi, fontSize: 11, lineHeight: 21, color: color.gold },
  cardTitle: { fontFamily: F.taSemi, fontSize: 18, lineHeight: 31, color: color.ink },
  action: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 24, color: color.gold },
  section: { gap: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  todayM: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, backgroundColor: color.card, borderWidth: 1, borderColor: color.line },
  todayImg: { width: 64, height: 78, borderRadius: 12 },
  deityChip: { width: 76, alignItems: 'center', gap: 6 },
  deityImg: { width: 66, height: 66, borderRadius: 33, borderWidth: 1.5, borderColor: color.gold },
  deityName: { fontFamily: F.ta, fontSize: 11, lineHeight: 20, color: color.sub },
  sectionTitle: { fontFamily: F.taBold, fontSize: 17, lineHeight: 29, color: color.ink },
  reading: { backgroundColor: color.card, borderRadius: 18, padding: 20, gap: 10, borderWidth: 1, borderColor: color.line },
  more: { alignSelf: 'flex-start', paddingVertical: 4 },
  secondary: { fontFamily: F.ta, fontSize: 11, lineHeight: 23, color: color.sub },
  other: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.line, gap: 4 },
  practice: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  pill: { borderWidth: 1, borderColor: color.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  pillDone: { backgroundColor: '#253E30', borderColor: '#466149' },
  pillText: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 23, color: color.sub },
  reflection: { borderTopWidth: 1, borderTopColor: color.line, paddingTop: 22, gap: 10 },
});
