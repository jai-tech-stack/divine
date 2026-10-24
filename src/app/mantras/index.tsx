import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LangBar, type Palette, ReaderSettings, usePalette } from '@/components/reader/ReaderKit';
import { groupOf, type Mantra, MANTRA_GROUPS, mantraOfTheDay, MANTRAS } from '@/content/mantraLib';
import { MANTRAS_EN } from '@/content/mantrasEn';
import { progress, useProgress } from '@/lib/progress';
import { F } from '@/theme';

const FILL = [StyleSheet.absoluteFill, { width: '100%' as const, height: '100%' as const }];
const DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

/** Mantra home: today's mantra, a deity picture grid, then rich mantra cards. */
export default function MantraHome() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const [settings, setSettings] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const today = mantraOfTheDay();
  const en = prefs.meaning === 'en';
  const tileW = (Math.min(width, 520) - 16 * 2 - 12) / 2;

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return MANTRAS.filter((m) => {
      if (group === 'favs') return p.mantraFavs.includes(m.id);
      if (group && m.deity !== group) return false;
      if (!t) return true;
      return [m.name, m.about, MANTRAS_EN[m.id]?.name ?? '', groupOf(m.deity).ta, ...m.lines.map((l) => l.ta + l.en)].join(' ').toLowerCase().includes(t);
    });
  }, [q, group, p.mantraFavs]);

  const showGrid = !group && !q.trim();
  const g = group && group !== 'favs' ? groupOf(group) : null;

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <View style={[st.appbar, { paddingTop: insets.top + 4 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => (group ? setGroup(null) : router.back())} hitSlop={8} style={st.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={pal.ink} />
        </Pressable>
        <Text style={[st.appT, { color: pal.ink }]} numberOfLines={1}>
          {g ? g.ta : group === 'favs' ? 'பிடித்தவை' : 'மந்திரங்கள் & ஸ்தோத்திரங்கள்'}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="பிடித்தவை" onPress={() => setGroup(group === 'favs' ? null : 'favs')} hitSlop={8} style={st.iconBtn}>
          <Ionicons name={group === 'favs' ? 'heart' : 'heart-outline'} size={23} color={group === 'favs' ? '#D9534F' : pal.ink} />
        </Pressable>
      </View>
      <LangBar pal={pal} onSettings={() => setSettings(true)} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 30 }}>
        <View style={[st.search, { backgroundColor: pal.card, borderColor: pal.line }]}>
          <Ionicons name="search" size={18} color={pal.sub} />
          <TextInput value={q} onChangeText={setQ} placeholder="மந்திரம், தெய்வம், வரி…" placeholderTextColor={pal.sub} style={[st.searchIn, { color: pal.ink }]} accessibilityLabel="தேடல்" />
          {!!q && (
            <Pressable onPress={() => setQ('')} hitSlop={8} accessibilityLabel="அழி">
              <Ionicons name="close-circle" size={18} color={pal.sub} />
            </Pressable>
          )}
        </View>

        {showGrid && (
          <>
            {/* today's mantra */}
            <Pressable accessibilityRole="button" onPress={() => router.push(`/mantras/${today.id}`)} style={st.hero}>
              <Image source={groupOf(today.deity).image} style={FILL} resizeMode="cover" />
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.55)', 'rgba(20,8,0,0.92)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
              <View style={st.heroBadge}>
                <Ionicons name="sunny" size={13} color="#2B1D0E" />
                <Text style={st.heroBadgeT}>இன்றைய மந்திரம் · {DAYS[new Date().getDay()]}</Text>
              </View>
              <View style={st.heroText}>
                <Text style={st.heroName}>{en && MANTRAS_EN[today.id] ? MANTRAS_EN[today.id].name : today.name}</Text>
                <Text style={[st.heroLine, prefs.script === 'sa' && { fontFamily: F.deva }]} numberOfLines={2}>
                  {today.lines[0][prefs.script]}
                </Text>
              </View>
              <View style={st.heroPlay}>
                <Ionicons name="play" size={22} color="#2B1D0E" style={{ marginLeft: 3 }} />
              </View>
            </Pressable>

            {/* deity grid */}
            <View style={st.secRow}>
              <Text style={[st.secT, { color: pal.ink }]}>தெய்வங்கள்</Text>
              <Text style={[st.secS, { color: pal.sub }]}>{MANTRAS.length} மந்திரங்கள்</Text>
            </View>
            <View style={st.grid}>
              {MANTRA_GROUPS.map((d) => {
                const n = MANTRAS.filter((m) => m.deity === d.id).length;
                if (!n) return null;
                return (
                  <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={`${d.ta}, ${n} மந்திரங்கள்`} onPress={() => setGroup(d.id)} style={({ pressed }) => [st.tile, { width: tileW, height: tileW * 1.22 }, pressed && { transform: [{ scale: 0.98 }] }]}>
                    <Image source={d.image} style={FILL} resizeMode="cover" />
                    <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(20,8,0,0.88)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
                    <View style={st.tileText}>
                      <Text style={st.tileName} numberOfLines={1}>
                        {d.ta}
                      </Text>
                      <View style={st.tileCount}>
                        <Ionicons name="musical-notes" size={11} color="#F3D48F" />
                        <Text style={st.tileCountT}>{n}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {!showGrid && (
          <>
            {g && (
              <View style={st.banner}>
                <Image source={g.image} style={FILL} resizeMode="cover" />
                <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(20,8,0,0.85)']} style={StyleSheet.absoluteFill} />
                <View style={st.heroText}>
                  <Text style={st.heroName}>{g.ta}</Text>
                  <Text style={st.heroLine}>{results.length} மந்திரங்கள் & ஸ்தோத்திரங்கள்</Text>
                </View>
              </View>
            )}
            {results.length === 0 && <Text style={[st.empty, { color: pal.sub }]}>{group === 'favs' ? 'இன்னும் பிடித்தவை இல்லை. மந்திரத்தில் இதயக் குறியைத் தட்டுங்கள்.' : 'எதுவும் கிடைக்கவில்லை.'}</Text>}
            {results.map((m) => (
              <Card key={m.id} m={m} pal={pal} fav={p.mantraFavs.includes(m.id)} script={prefs.script} en={en} />
            ))}
          </>
        )}
      </ScrollView>
      <ReaderSettings open={settings} onClose={() => setSettings(false)} />
    </View>
  );
}

function Card({ m, pal, fav, script, en }: { m: Mantra; pal: Palette; fav: boolean; script: 'ta' | 'sa' | 'en'; en: boolean }) {
  const d = groupOf(m.deity);
  const name = en && MANTRAS_EN[m.id] ? MANTRAS_EN[m.id].name : m.name;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/mantras/${m.id}`)} style={({ pressed }) => [st.card, { backgroundColor: pal.card, borderColor: pal.line }, pressed && { opacity: 0.92 }]}>
      <Image source={d.image} style={st.thumb} resizeMode="cover" />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[st.cardName, { color: pal.ink }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[st.cardLine, { color: pal.sub }, script === 'sa' && { fontFamily: F.deva }, script === 'en' && { fontFamily: undefined, fontStyle: 'italic' }]} numberOfLines={1}>
          {m.lines[0][script]}
        </Text>
        <View style={st.meta}>
          <Meta pal={pal} icon={m.kind === 'mantra' ? 'radio-button-on' : 'document-text-outline'} text={m.kind === 'mantra' ? 'மந்திரம்' : 'ஸ்லோகம்'} />
          <Meta pal={pal} icon="reorder-three" text={m.sections ? `${m.sections.reduce((a, x) => a + x.verses.length, 0)} ச்லோகம்` : `${m.lines.length} வரி`} />
          <Meta pal={pal} icon="repeat" text={`${m.japa}`} />
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View style={[st.play, { backgroundColor: pal.accent }]}>
          <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
        </View>
        <Pressable accessibilityLabel={fav ? 'பிடித்தவையிலிருந்து நீக்கு' : 'பிடித்தவையில் சேர்'} hitSlop={10} onPress={() => progress.toggleFav(m.id)}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#D9534F' : pal.sub} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function Meta({ pal, icon, text }: { pal: Palette; icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={[st.metaItem, { backgroundColor: pal.chip }]}>
      <Ionicons name={icon} size={11} color={pal.accent} />
      <Text style={{ fontFamily: F.ta, fontSize: 11, color: pal.sub }}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  appbar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  appT: { flex: 1, fontFamily: F.taBold, fontSize: 17 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, minHeight: 46 },
  searchIn: { flex: 1, fontFamily: F.ta, fontSize: 14, paddingVertical: 8 },
  hero: { height: 210, borderRadius: 22, overflow: 'hidden', backgroundColor: '#000' },
  heroBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(243,212,143,0.95)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeT: { fontFamily: F.taSemi, fontSize: 11.5, color: '#2B1D0E' },
  heroText: { position: 'absolute', left: 16, right: 70, bottom: 14, gap: 2 },
  heroName: { fontFamily: F.taBold, fontSize: 21, lineHeight: 31, color: '#FFF6E2' },
  heroLine: { fontFamily: F.ta, fontSize: 13, lineHeight: 21, color: '#F1E2C2' },
  heroPlay: { position: 'absolute', right: 14, bottom: 16, width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3D48F', alignItems: 'center', justifyContent: 'center' },
  secRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  secT: { fontFamily: F.taBold, fontSize: 17 },
  secS: { fontFamily: F.ta, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  tileText: { position: 'absolute', left: 10, right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  tileName: { flex: 1, fontFamily: F.taBold, fontSize: 15.5, color: '#FFF6E2' },
  tileCount: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  tileCountT: { color: '#F3D48F', fontFamily: F.num, fontSize: 13 },
  banner: { height: 150, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  empty: { fontFamily: F.ta, fontSize: 13.5, textAlign: 'center', marginTop: 30 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, padding: 10 },
  thumb: { width: 76, height: 92, borderRadius: 14 },
  cardName: { fontFamily: F.taBold, fontSize: 15.5, lineHeight: 23 },
  cardLine: { fontFamily: F.ta, fontSize: 12.5 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  play: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
