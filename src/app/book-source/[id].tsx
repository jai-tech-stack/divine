import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Icons } from '@/components/ui';
import { BOOKS, loadBook, type BookText } from '@/content/books';
import { C, F } from '@/theme';
import { progress } from '@/lib/progress';

const key = (id: string) => `divine-life:book-page:${id}`;
export default function BookReader() {
  const { id, page } = useLocalSearchParams<{ id: string; page?: string }>();
  return <BookReaderContent key={`${id}:${page ?? 'saved'}`} id={id} startPage={page} />;
}

function BookReaderContent({ id, startPage }: { id: string; startPage?: string }) {
  const meta = BOOKS.find(book => book.id === id);
  const insets = useSafeAreaInsets();
  const [book, setBook] = useState<BookText | null>(null);
  const [page, setPage] = useState(1);
  const [jump, setJump] = useState('1');
  const [size, setSize] = useState(18);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    let active = true;
    if (id) Promise.all([loadBook(id), AsyncStorage.getItem(key(id)).catch(() => null)])
      .then(([result, saved]) => {
        const data = result.book;
        if (!active) return;
        const requested = Number(startPage);
        const number = Number.isInteger(requested) && requested >= 1 && requested <= data.pages.length ? requested : Number(saved);
        const last = Number.isInteger(number) && number >= 1 && number <= data.pages.length ? number : 1;
        setPage(last); setJump(String(last)); setBook(data);
        setMessage(result.offline ? 'இந்த நூல் இணையமின்றியும் வாசிக்கச் சேமிக்கப்பட்டுள்ளது.' : 'சேமிக்க முடியவில்லை. இந்த முறை இணையத்துடன் வாசிக்கலாம்.');
      }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [id, startPage, attempt]);
  useEffect(() => {
    if (book && book.id === id && book.pages.length) {
      AsyncStorage.setItem(key(id), String(page)).catch(() => {});
      void progress.bookPosition(id, page);
    }
  }, [id, book, page]);
  const move = (number: number) => {
    if (!book || !Number.isInteger(number) || number < 1 || number > book.pages.length) { setMessage('சரியான பக்க எண்ணை உள்ளிடுங்கள்.'); return; }
    setPage(number); setJump(String(number)); setMessage(''); scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const find = () => {
    const needle = search.trim().normalize('NFC').toLocaleLowerCase();
    if (!needle || !book) return;
    const matches = book.pages.filter(item => item.reviewed && item.text.toLocaleLowerCase().includes(needle));
    const next = matches.find(item => item.number > page) ?? matches[0];
    if (next) { move(next.number); setMessage(`${matches.length} பக்கங்களில் பொருந்துகிறது.`); }
    else setMessage('இந்தச் சொல்லுக்கு உரையில் பொருத்தம் இல்லை.');
  };
  const current = book?.pages[page - 1];
  const hasReviewedText = book?.pages.some(item => item.reviewed) ?? false;
  return <View style={[st.fill, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
    <View style={st.header}><IconButton label="கதைப்பயணத்திற்குத் திரும்பு" onPress={() => router.back()}>{Icons.back()}</IconButton><Text style={st.title} numberOfLines={2}>மூலப்பிரதி · {meta?.title ?? 'நூல் கிடைக்கவில்லை'}</Text></View>
    {!meta ? <Text style={st.note}>வேறு நூலைத் தேர்ந்தெடுக்கவும்.</Text> : failed ? <View style={st.center}><Text style={st.note}>நூலை ஏற்ற முடியவில்லை. முதல் முறை திறக்க இணைய இணைப்பு தேவை.</Text><Pressable accessibilityRole="button" onPress={() => { setFailed(false); setMessage(''); setAttempt(value => value + 1); }} style={st.button}><Text style={st.buttonText}>மீண்டும் முயல்</Text></Pressable></View> : !book ? <View style={st.center}><ActivityIndicator color={C.gold} /><Text style={st.note}>நூல் திறக்கிறது… முதல் பதிவிறக்கச் சிறிது நேரம் ஆகலாம்.</Text></View> : !book.pages.length ? <Text style={st.note}>இந்நூலின் உரை மாற்றப்பணி நடைபெறுகிறது.</Text> : !hasReviewedText ? <ScrollView contentContainerStyle={st.unreviewed}>
      <Text style={st.reviewEyebrow}>மூலப்பிரதி · மெய்ப்புப் பணி நிலுவையில்</Text>
      <Text style={st.reviewTitle}>இந்த நூலின் எழுத்துருவை இப்போது காட்டவில்லை</Text>
      <Text style={st.reviewText}>இப்பதிப்பில் உள்ள உரை PDF-இலிருந்து இயந்திரம் பிரித்தெடுத்தது. உங்கள் திரைப் படங்களில் தெரிந்ததுபோல் எழுத்து மாற்றங்கள் உள்ளன; ஒரு பக்கமும் மூலத்துடன் மெய்ப்புப் பார்க்கப்படவில்லை. தவறான உரையை மூலநூல் எனக் காட்டாமல் மறைத்துள்ளோம்.</Text>
      <Text style={st.reviewText}>சரிபார்க்கப்பட்ட கதைப்பயணம் தயாரானதும் அது தனியாக இங்கே வரும். மூலத்தை ஒப்பிட வேண்டுமெனில் தெளிவான ஸ்கேனும் உரிய வெளியீட்டு அனுமதியும் தேவை.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.replace(id === 'nayanmar-stories' || id === 'periyapuranam' ? '/nayanmar' : '/reading')} style={st.button}><Text style={st.buttonText}>கிடைத்த கதைப்பயணத்தைப் பார் →</Text></Pressable>
      <Text style={st.note}>{meta.title} · {book.sourcePages} பக்கங்கள் · உரை மெய்ப்புப் பணி நிலுவையில்</Text>
    </ScrollView> : <>
      <View style={st.controls}>
        <Text style={st.pageLabel}>மூலப் பக்கம் {page} / {book.sourcePages}</Text>
        <IconButton label="எழுத்தளவைக் குறை" onPress={() => setSize(value => Math.max(14, value - 2))}><Text style={st.fontButton}>அ−</Text></IconButton>
        <IconButton label="எழுத்தளவைக் கூட்டு" onPress={() => setSize(value => Math.min(30, value + 2))}><Text style={st.fontButton}>அ+</Text></IconButton>
      </View>
      <View style={st.searchRow}><TextInput accessibilityLabel="இந்த நூலில் தேடு" value={search} onChangeText={setSearch} onSubmitEditing={find} placeholder="உரையில் தேடு" placeholderTextColor={C.muted} style={[st.input, { flex: 1 }]} /><Pressable accessibilityRole="button" accessibilityLabel="அடுத்த பொருத்தத்தைத் தேடு" onPress={find} style={st.button}><Text style={st.buttonText}>தேடு</Text></Pressable></View>
      {message !== '' && <Text accessibilityRole="alert" style={st.message}>{message}</Text>}
      <ScrollView ref={scroll} contentContainerStyle={st.body}>
        <Text style={st.warning}>{current?.reviewed ? 'இந்தப் பக்கம் மூலத்துடன் ஒப்பிட்டுச் சரிபார்க்கப்பட்டது.' : 'மூலப் பிரதியிலிருந்து பிரித்தெடுக்கப்பட்ட உரை. எழுத்துப் பிழைகள் இருக்கலாம்; முழு மெய்ப்புத் திருத்தம் நிலுவையில் உள்ளது.'}</Text>
        {current?.reviewed && current.text ? <Text selectable style={[st.text, { fontSize: size, lineHeight: Math.round(size * 1.8) }]}>{current.text}</Text> : <Text style={st.note}>இந்தப் பக்கத்தின் உரை மூலத்துடன் மெய்ப்புப் பார்க்கப்படவில்லை; சரிபார்க்கப்படும் வரை மறைக்கப்பட்டுள்ளது.</Text>}
      </ScrollView>
      <View style={st.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel="முந்தைய பக்கம்" disabled={page === 1} accessibilityState={{ disabled: page === 1 }} onPress={() => move(page - 1)} style={[st.pageButton, page === 1 && st.disabled]}>{Icons.prev(C.goldLight)}</Pressable>
        <TextInput accessibilityLabel="செல்ல வேண்டிய பக்க எண்" keyboardType="number-pad" value={jump} onChangeText={setJump} onSubmitEditing={() => move(Number(jump))} style={[st.input, { width: 64, textAlign: 'center' }]} />
        <Pressable accessibilityRole="button" onPress={() => move(Number(jump))} style={st.button}><Text style={st.buttonText}>செல்</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="அடுத்த பக்கம்" disabled={page === book.pages.length} accessibilityState={{ disabled: page === book.pages.length }} onPress={() => move(page + 1)} style={[st.pageButton, page === book.pages.length && st.disabled]}>{Icons.next(C.goldLight)}</Pressable>
      </View>
    </>}
  </View>;
}
const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.night }, header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8 }, title: { flex: 1, fontFamily: F.taBold, color: C.cream, fontSize: 18, lineHeight: 29 },
  controls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }, pageLabel: { flex: 1, fontFamily: F.ta, color: C.goldLight, fontSize: 11.5 }, fontButton: { fontFamily: F.taBold, color: C.goldLight, fontSize: 16 },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 5 }, input: { minHeight: 44, borderWidth: 1, borderColor: C.goldDark, borderRadius: 9, paddingHorizontal: 10, color: C.cream, fontFamily: F.ta, fontSize: 13 },
  button: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center', borderRadius: 9, backgroundColor: C.gold }, buttonText: { fontFamily: F.taBold, color: C.night, fontSize: 12 },
  body: { padding: 18, paddingBottom: 32, width: '100%', maxWidth: 780, alignSelf: 'center' }, text: { fontFamily: F.ta, color: C.cream }, warning: { fontFamily: F.ta, color: C.muted, fontSize: 11, lineHeight: 19, paddingBottom: 18 },
  note: { fontFamily: F.ta, color: C.cream, fontSize: 14, lineHeight: 25, padding: 16 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  unreviewed: { flexGrow: 1, justifyContent: 'center', gap: 16, padding: 24, maxWidth: 680, width: '100%', alignSelf: 'center' }, reviewEyebrow: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 24, color: C.gold }, reviewTitle: { fontFamily: F.taBold, color: C.cream, fontSize: 22, lineHeight: 36 }, reviewText: { fontFamily: F.ta, color: C.muted, fontSize: 15, lineHeight: 29 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderColor: 'rgba(227,184,101,0.2)' }, pageButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.3 }, message: { fontFamily: F.ta, color: C.goldLight, paddingHorizontal: 16, fontSize: 11, lineHeight: 20 },
});
