import { ART } from '@/content/artwork';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { deityForToday, SCENES } from '@/content/deities';
import { usePrefs } from '@/lib/prefs';
import { streak, useProgress, wicks } from '@/lib/progress';
import { F } from '@/theme';
import { getStory } from '@/content';
import { getMantra } from '@/content/mantraLib';
import { BOOKS } from '@/content/books';

/**
 * Home — a window into a painted heaven. The art fills the screen; everything you can do sits on it as
 * quiet glass. The daily "lamp" is three small lights: படி (read), ஜபி (chant), பேசு (talk).
 */

type Phase = 'dawn' | 'noon' | 'dusk' | 'night';

const GOLD = '#F4C46E';
const GOLD_SOFT = 'rgba(244,196,110,0.55)';
const GLASS = 'rgba(24,10,4,0.46)';
const GLASS_LINE = 'rgba(244,196,110,0.42)';
const CREAM = '#FFF1D6';
const CREAM_SOFT = '#E9D2AA';

const BG = { shiva: ART['home/shiva'], murugan: ART['home/murugan'] };

function phaseNow(): Phase {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'dawn';
  if (h >= 11 && h < 16) return 'noon';
  if (h >= 16 && h < 19) return 'dusk';
  return 'night';
}

const GREETING: Record<Phase, { t: string; s: string }> = {
  dawn: { t: 'காலை வணக்கம்', s: 'ஞானம் உங்கள் நாளை வழிநடத்தட்டும்' },
  noon: { t: 'இனிய நண்பகல்', s: 'ஒரு கணம் நின்று, மனதைத் தெளிவாக்குங்கள்' },
  dusk: { t: 'மாலை வணக்கம்', s: 'விளக்கேற்றும் வேளை' },
  night: { t: 'இனிய இரவு', s: 'மனம் அமைதி பெறட்டும்' },
};

function forThisHour(ph: Phase, last: { c: number; v: number }) {
  switch (ph) {
    case 'dawn':
      return { kicker: 'நாளின் தொடக்கத்துக்கு', title: 'காயத்ரி மந்திரம்', sub: 'மூன்று முறை, மெதுவாக', href: '/mantras/universal-gayatri', img: ART['story/loka-brahmaloka'] };
    case 'noon':
      return { kicker: 'நடுப்பகலுக்கு', title: `கீதை ${last.c}.${last.v} — தொடருங்கள்`, sub: 'ஒரு சுலோகம் போதும்', href: `/gita/${last.c}/${last.v}`, img: SCENES.krishnaArjuna };
    case 'dusk':
      return { kicker: 'விளக்கேற்றும் வேளைக்கு', title: 'கர்ப்பூர கௌரம்', sub: 'ஆரத்தி மந்திரம்', href: '/mantras/shiva-karpuragauram', img: ART['story/loka-kailasam'] };
    default:
      return { kicker: 'இன்றிரவு அமைதிக்கு', title: 'சாந்தாகாரம்', sub: 'மனம் அடங்க ஒரு மந்திரம்', href: '/mantras/vishnu-shantakaram', img: ART['story/loka-cosmos'] };
  }
}

function Lotus({ size = 44, color = GOLD }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M32 8 C26 18 26 30 32 40 C38 30 38 18 32 8Z" />
      <Path d="M32 40 C22 36 14 28 14 16 C22 18 28 24 32 40Z" />
      <Path d="M32 40 C42 36 50 28 50 16 C42 18 36 24 32 40Z" />
      <Path d="M32 42 C18 42 8 34 6 24 C14 24 24 30 32 42Z" />
      <Path d="M32 42 C46 42 56 34 58 24 C50 24 40 30 32 42Z" />
      <Path d="M18 50 C26 54 38 54 46 50" />
      <Path d="M22 56 C28 58 36 58 42 56" />
    </Svg>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const W = Math.min(width, 520);
  const prefs = usePrefs();
  const p = useProgress();
  const ph = phaseNow();
  const lit = wicks(p);
  const count = Number(lit.read) + Number(lit.chant) + Number(lit.talk);
  const days = streak(p.streakDays);
  const last = p.gitaLast ?? { c: 2, v: 47 };
  const hour = forThisHour(ph, last);
  const deity = deityForToday(prefs.deity);
  const savedStory = p.storyLast && !p.storyLast.completed ? getStory(p.storyLast.id) : undefined;
  const savedMantra = p.lastActivity?.kind === 'mantra' ? getMantra(p.lastActivity.ref) : undefined;
  const savedBook = p.bookLast ? BOOKS.find(book => book.id === p.bookLast!.id) : undefined;
  const resume = [
    ...(p.gitaLast ? [{ title: `பகவத் கீதை ${p.gitaLast.c}.${p.gitaLast.v}`, href: `/gita/${p.gitaLast.c}/${p.gitaLast.v}` }] : []),
    ...(savedStory ? [{ title: `${savedStory.title} · காட்சி ${p.storyLast!.scene + 1}`, href: `/stories/${savedStory.id}` }] : []),
    ...(savedMantra ? [{ title: savedMantra.name, href: `/mantras/${savedMantra.id}` }] : []),
    ...(savedBook ? [{ title: `${savedBook.title} · பக்கம் ${p.bookLast!.page}`, href: `/books/${savedBook.id}?page=${p.bookLast!.page}` }] : []),
  ];
  const g = GREETING[ph];
  const bg = deity.id === 'shiva' ? BG.shiva : deity.id === 'murugan' ? BG.murugan : deity.image;
  const backgroundAsset = Image.resolveAssetSource(bg);
  const backgroundHeight = W * (backgroundAsset?.height || 3) / (backgroundAsset?.width || 2);


  const circles = [
    { t: 'அமைதி', icon: 'flower-outline', href: '/practice/dhyanam' },
    { t: 'ஞானம்', icon: 'book-outline', href: '/gita' },
    { t: 'பக்தி', icon: 'flame-outline', href: '/mantras' },
    { t: 'ஆத்ம விசாரம்', icon: 'ear-outline', href: '/companion' },
  ] as const;

  const small = [
    { t: 'நாயன்மார் திருச்சரிதம்', s: 'அறுபத்து மூவர் அருள்வாழ்வு', icon: 'people-outline', href: '/nayanmar', img: ART['story/loka-kailasam'] },
    { t: 'புராணச் சரிதங்கள்', s: 'புராணங்கள் உணர்த்தும் அறநெறி', icon: 'sparkles-outline', href: '/puranas', img: ART['story/naimisha'] },
    { t: 'ஞான நூல்கள்', s: 'வேதாந்தம் · யோகம் · சித்தர்நெறி', icon: 'library-outline', href: '/library', img: ART['story/loka-cosmos'] },
  ] as const;

  const tabs = [
    { t: 'முகப்பு', icon: 'home', href: '', on: true },
    { t: 'கீதை', icon: 'book-outline', href: '/gita', on: false },
    { t: 'மந்திரம்', icon: 'musical-notes-outline', href: '/mantras', on: false },
    { t: 'கேளுங்கள்', icon: 'chatbubble-ellipses-outline', href: '/companion', on: false },
    { t: 'தெய்வம்', icon: 'flower-outline', href: '/deity', on: false },
  ] as const;

  const tabH = 62 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0503', alignItems: 'center' }}>
      <View style={{ width: W, flex: 1, overflow: 'hidden', backgroundColor: '#1A0A04' }}>
        <Image source={bg} resizeMode="contain" style={{ position: 'absolute', top: insets.top + 75, left: 0, width: W, height: backgroundHeight }} />
        <LinearGradient colors={['rgba(10,4,2,0.55)', 'rgba(10,4,2,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }} />
        <LinearGradient colors={['rgba(14,6,3,0)', 'rgba(14,6,3,0.72)', 'rgba(14,6,3,0.94)']} locations={[0, 0.5, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: height * 0.4 }} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: tabH + 28 }}>
          <View style={st.topBar}>
            <Lotus size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.brand}>Divine Life</Text>
              <Text style={st.tag}>உங்கள் ஆன்மிகத் துணை</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="இஷ்ட தெய்வத்தைத் தேர்ந்தெடு" onPress={() => router.push('/deity')} style={st.profile}>
              <Ionicons name="flower-outline" size={22} color={GOLD} />
              <Text style={{ fontFamily: F.taSemi, fontSize: 9, lineHeight: 16, color: GOLD }}>தெய்வம்</Text>
            </Pressable>
          </View>
          <View style={{ height: Math.max(height * 0.28, 180) }} />
          <View style={st.welcome}>
            <Text style={st.greet}>{g.t}</Text>
            <Text style={st.greetSub}>{g.s}</Text>
            <View style={st.rule}>
              <View style={st.ruleLine} />
              <Lotus size={26} />
              <View style={st.ruleLine} />
            </View>
            <View style={st.lampRow} accessibilityLabel={`இன்றைய தீபம் ${count} / 3`}>
              {[lit.read, lit.chant, lit.talk].map((on, i) => (
                <View key={i} style={[st.dot, on ? st.dotOn : st.dotOff]} />
              ))}
              <Text style={st.lampText}>{count === 0 ? 'இன்றைய தீபம் இன்னும் ஏற்றப்படவில்லை' : count === 3 ? 'மூன்று திரிகளும் எரிகின்றன' : `${count} / 3 திரி எரிகிறது`}</Text>
              {days > 0 && (
                <View style={st.streak}>
                  <Ionicons name="flame" size={13} color={GOLD} />
                  <Text style={{ fontFamily: F.num, fontSize: 15, color: CREAM }}>{days}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={st.circles}>
            {circles.map((c) => (
              <Pressable key={c.t} accessibilityRole="button" accessibilityLabel={c.t} onPress={() => router.push(c.href as never)} style={({ pressed }) => [{ alignItems: 'center', flex: 1, minWidth: 0 }, pressed && { opacity: 0.8 }]}>
                <View style={st.circle}>
                  <Ionicons name={c.icon} size={29} color={GOLD} />
                </View>
                <Text style={st.circleT} numberOfLines={2}>
                  {c.t}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ paddingHorizontal: 18, gap: 12 }}>
            {resume.length > 0 && <View style={st.resume}>
              <Text style={st.smallT}>விட்ட இடத்திலிருந்து தொடருங்கள்</Text>
              {resume.map(item => <Pressable key={item.href} accessibilityRole="button" onPress={() => router.push(item.href as never)} style={st.resumeRow}>
                <Text style={[st.smallS, { flex: 1 }]}>{item.title}</Text><Ionicons name="arrow-forward" size={18} color={GOLD} />
              </Pressable>)}
              <Text style={st.smallS}>முன்னேற்றம் இந்தச் சாதனத்தில் சேமிக்கப்படுகிறது.</Text>
            </View>}
            <Pressable accessibilityRole="button" onPress={() => router.push(hour.href as never)} style={({ pressed }) => [st.banner, pressed && { opacity: 0.9 }]}>
              <Image source={hour.img} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
              <LinearGradient colors={['rgba(20,8,3,0.15)', 'rgba(20,8,3,0.9)']} start={{ x: 0, y: 0 }} end={{ x: 0.62, y: 0 }} style={StyleSheet.absoluteFill} />
              <View style={{ flex: 1, paddingLeft: '34%', paddingRight: 44, justifyContent: 'center', gap: 2 }}>
                <Text style={st.kicker}>{hour.kicker}</Text>
                <Text style={st.bannerT}>
                  {hour.title}
                </Text>
                <Text style={st.bannerS}>{hour.sub}</Text>
              </View>
              <View style={st.arrow}>
                <Ionicons name="arrow-forward" size={18} color={GOLD} />
              </View>
            </Pressable>

            <View style={{ gap: 12 }}>
              {small.map((x) => (
                <Pressable key={x.href} accessibilityRole="button" accessibilityLabel={x.t} onPress={() => router.push(x.href as never)} style={({ pressed }) => [st.small, pressed && { opacity: 0.88 }]}>
                  <Image source={x.img} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.4 }]} resizeMode="cover" />
                  <LinearGradient colors={['rgba(20,8,3,0.35)', 'rgba(20,8,3,0.92)']} style={StyleSheet.absoluteFill} />
                  <View style={st.smallIcon}><Ionicons name={x.icon} size={24} color={GOLD} /></View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={st.smallT}>{x.t}</Text>
                    <Text style={st.smallS}>{x.s}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={GOLD} />
                </Pressable>
              ))}
            </View>

            <Pressable accessibilityRole="button" accessibilityLabel="தெய்வத்தை மாற்று" onPress={() => router.push('/deity')} style={st.deityLink}>
              <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: CREAM_SOFT }}>
                {prefs.deity === 'weekday' ? 'இன்றைய தெய்வம்' : 'உங்கள் தெய்வம்'} · {deity.ta}
              </Text>
              <Ionicons name="swap-horizontal" size={15} color={CREAM_SOFT} />
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => router.push('/library/sources')} style={{ alignSelf: 'center', padding: 12 }}>
              <Text style={{ fontFamily: F.ta, fontSize: 12, lineHeight: 21, color: CREAM_SOFT }}>மூலநூல் குறிப்புகள்</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={[st.tabBar, { height: tabH, paddingBottom: insets.bottom }]}>
          {tabs.map((t) => (
            <Pressable key={t.t} accessibilityRole="button" accessibilityLabel={t.t} onPress={() => t.href && router.push(t.href as never)} style={st.tab}>
              <Ionicons name={t.icon} size={24} color={t.on ? GOLD : CREAM_SOFT} />
              <Text style={{ fontFamily: F.taSemi, fontSize: 10.5, lineHeight: 18, textAlign: 'center', color: t.on ? GOLD : CREAM_SOFT }}>{t.t}</Text>
              {t.on && <View style={st.tabOn} />}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  resume: { padding: 16, gap: 8, borderRadius: 18, borderWidth: 1, borderColor: GLASS_LINE, backgroundColor: 'rgba(14,6,3,0.9)' },
  resumeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderBottomWidth: 1, borderBottomColor: GLASS_LINE, paddingVertical: 8 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12 },
  brand: { fontFamily: F.num, fontSize: 30, lineHeight: 38, color: GOLD, letterSpacing: 0.5 },
  tag: { fontFamily: F.ta, fontSize: 12, lineHeight: 21, color: CREAM, opacity: 0.9 },
  profile: { width: 54, height: 54, borderRadius: 20, borderWidth: 1.2, borderColor: GLASS_LINE, backgroundColor: 'rgba(20,8,3,0.4)', alignItems: 'center', justifyContent: 'center' },
  welcome: { alignItems: 'center', marginHorizontal: 18, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(14,6,3,0.65)', borderWidth: 1, borderColor: GLASS_LINE },
  greet: { fontFamily: F.taBold, fontSize: 30, lineHeight: 46, color: CREAM, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 8 },
  greetSub: { fontFamily: F.ta, fontSize: 15, lineHeight: 24, color: CREAM_SOFT, textAlign: 'center' },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, width: '78%' },
  ruleLine: { flex: 1, height: 1, backgroundColor: GOLD_SOFT },
  lampRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 11, height: 11, borderRadius: 6 },
  dotOn: { backgroundColor: GOLD, shadowColor: GOLD, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  dotOff: { borderWidth: 1.4, borderColor: GOLD_SOFT },
  lampText: { fontFamily: F.ta, fontSize: 12.5, color: CREAM_SOFT, marginLeft: 4 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 6, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 14, borderWidth: 1, borderColor: GLASS_LINE, backgroundColor: GLASS },
  circles: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, marginTop: 22, marginBottom: 22 },
  circle: { width: 66, height: 66, borderRadius: 33, borderWidth: 1.3, borderColor: GLASS_LINE, backgroundColor: 'rgba(40,18,6,0.5)', alignItems: 'center', justifyContent: 'center', shadowColor: GOLD, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  circleT: { fontFamily: F.taSemi, fontSize: 13, lineHeight: 20, color: CREAM, marginTop: 7, textAlign: 'center' },
  banner: { minHeight: 128, paddingVertical: 16, borderRadius: 20, borderWidth: 1.2, borderColor: GLASS_LINE, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', backgroundColor: GLASS },
  kicker: { fontFamily: F.taSemi, fontSize: 11.5, color: GOLD },
  bannerT: { fontFamily: F.taBold, fontSize: 17, lineHeight: 27, color: CREAM },
  bannerS: { fontFamily: F.ta, fontSize: 12.5, color: CREAM_SOFT },
  arrow: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  small: { minHeight: 108, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 1.2, borderColor: GLASS_LINE, overflow: 'hidden', padding: 16, backgroundColor: GLASS },
  smallIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: GLASS_LINE, backgroundColor: 'rgba(40,18,6,0.55)', alignItems: 'center', justifyContent: 'center' },
  smallT: { fontFamily: F.taBold, fontSize: 17, lineHeight: 29, color: CREAM },
  smallS: { fontFamily: F.ta, fontSize: 12, lineHeight: 22, color: CREAM_SOFT },
  deityLink: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', paddingVertical: 8 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: 'rgba(14,6,3,0.94)', borderTopWidth: 1, borderTopColor: 'rgba(244,196,110,0.25)' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 6 },
  tabOn: { position: 'absolute', bottom: 2, width: 34, height: 2.5, borderRadius: 2, backgroundColor: GOLD },
});
