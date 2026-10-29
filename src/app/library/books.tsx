import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Icons } from '@/components/ui';
import { BOOK_CATEGORIES, BOOKS } from '@/content/books';
import { storiesForBook } from '@/content/journeys';
import { C, F } from '@/theme';

export default function Books() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('அனைத்தும்');
  const filtered = useMemo(() => {
    const needle = query.trim().normalize('NFC').toLocaleLowerCase();
    return BOOKS.filter(book => (category === 'அனைத்தும்' || book.category === category) && `${book.title} ${book.originalFilename} ${book.category}`.normalize('NFC').toLocaleLowerCase().includes(needle));
  }, [category, query]);
  return <View style={[st.fill, { paddingTop: insets.top }]}>
    <View style={st.heading}><IconButton label="கதைப்பயணங்களுக்குத் திரும்பு" onPress={() => router.back()}>{Icons.back()}</IconButton><View style={{ flex: 1 }}><Text style={st.title}>நூல்களின் கதைப்பயணம்</Text><Text style={st.sub}>மூல நூல்களிலிருந்து காட்சிகளுக்குள்</Text></View></View>
    <FlatList data={filtered} keyExtractor={book => book.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, gap: 12 }}
      ListHeaderComponent={<View style={{ gap: 12, marginBottom: 4 }}>
        <Text style={st.intro}>கதைசொல்லலுடன் அந்த உலகத்திற்குள் செல்வோம். நூலைத் தேர்ந்தெடுத்து, தயாராக உள்ள காட்சிக் கதைகளைப் பார்க்கலாம்.</Text>
        <View style={st.search}><Ionicons name="search-outline" size={20} color={C.goldLight} /><TextInput accessibilityLabel="நூல் தேடு" placeholder="நூல் அல்லது ஆசிரியர் தேடு" placeholderTextColor={C.muted} value={query} onChangeText={setQuery} style={st.input} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{BOOK_CATEGORIES.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === category }} onPress={() => setCategory(item)} style={[st.chip, item === category && st.selected]}><Text style={[st.chipText, item === category && { color: C.night }]}>{item}</Text></Pressable>)}</ScrollView>
        <Text style={st.hint}>காட்சியாக்கம் முடிந்த பகுதிகள் மட்டும் கதைகளாகக் கிடைக்கும். மூலப்பிரதி தனியாக உள்ளது.</Text>
      </View>}
      ListEmptyComponent={<Text style={st.intro}>பொருந்தும் நூல்கள் இல்லை. வேறு சொல்லைத் தேடுங்கள்.</Text>}
      renderItem={({ item: book }) => <Pressable accessibilityRole="button" accessibilityLabel={`${book.title} கதைப்பயணங்கள்`} onPress={() => router.push(`/books/${book.id}` as never)} style={({ pressed }) => [st.card, pressed && { opacity: 0.75 }]}>
        <Image source={book.cover} resizeMode="contain" accessibilityLabel={`${book.title} அட்டை`} style={st.cover} />
        <View style={{ flex: 1, gap: 7 }}><Text style={st.bookTitle}>{book.title}</Text><Text style={st.meta}>{book.category}</Text><Text style={st.hint}>{storiesForBook(book.id).length ? 'கதைப்பயணங்கள் உள்ளன' : 'காட்சியாக்கம் தயாராகிறது'}</Text><View style={st.read}><Text style={st.readText}>கதைத் தொகுப்பைப் பார்</Text>{Icons.arrow(C.goldLight)}</View></View>
      </Pressable>} />
  </View>;
}
const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night }, heading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  title: { fontFamily: F.taBold, fontSize: 24, lineHeight: 36, color: C.cream }, sub: { fontFamily: F.ta, fontSize: 12, color: C.goldLight },
  intro: { fontFamily: F.ta, fontSize: 14, lineHeight: 24, color: C.cream }, search: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(227,184,101,0.3)', borderRadius: 12 },
  input: { flex: 1, minHeight: 48, fontFamily: F.ta, fontSize: 14, color: C.cream }, chip: { borderWidth: 1, borderColor: C.goldDark, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 }, selected: { backgroundColor: C.gold },
  chipText: { fontFamily: F.ta, fontSize: 12, color: C.goldLight }, card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(227,184,101,0.22)', backgroundColor: '#101722' },
  cover: { width: 76, height: 112, borderRadius: 4, backgroundColor: '#ece5d5' }, bookTitle: { fontFamily: F.taBold, color: C.cream, fontSize: 16, lineHeight: 26 },
  meta: { fontFamily: F.ta, color: C.goldLight, fontSize: 11.5, lineHeight: 19 }, hint: { fontFamily: F.ta, color: C.muted, fontSize: 11.5, lineHeight: 20 }, read: { flexDirection: 'row', alignItems: 'center', gap: 8 }, readText: { fontFamily: F.taBold, color: C.goldLight, fontSize: 12 },
});
