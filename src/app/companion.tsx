import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/components/reader/ReaderKit';
import { deityForToday } from '@/content/deities';
import { askGuide, type ChatMsg, opening, refLabel, topicFrom } from '@/lib/companion';
import { progress, useProgress } from '@/lib/progress';
import { VoiceOrb, type OrbState } from '@/components/VoiceOrb';
import { sttAvailable, useListen } from '@/lib/stt';
import { F } from '@/theme';

const native = Platform.OS !== 'web';
let seq = 0;
const nid = () => `m${Date.now()}_${seq++}`;

/** The companion: opens with what you were just doing, answers from the text, links back to it. */
export default function Companion() {
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const { pal, prefs } = usePalette();
  const en = false;
  const deity = deityForToday(prefs.deity);
  const topic = useMemo(() => topicFrom(p), [p.lastActivity, p.gitaLast]); // eslint-disable-line react-hooks/exhaustive-deps
  const first = useMemo(() => opening(topic, en), [topic, en]);
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => [{ id: nid(), who: 'guide', text: first.text, ref: topic ?? undefined }]);
  const [suggest, setSuggest] = useState<string[]>(first.suggestions);
  const [previousOpening, setPreviousOpening] = useState(first);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [voice, setVoice] = useState(false);
  const [talking, setTalking] = useState(false);
  const [lastReply, setLastReply] = useState('');
  const voiceRef = useRef(false);
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);
  const scroll = useRef<any>(null);
  const input = useRef<any>(null);
  const [pulse] = useState(() => new Animated.Value(0));

  if (previousOpening !== first) {
    setPreviousOpening(first);
    setMsgs([{ id: nid(), who: 'guide', text: first.text, ref: topic ?? undefined }]);
    setSuggest(first.suggestions);
  }

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: busy ? 700 : 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: busy ? 700 : 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [busy, pulse]);

  useEffect(() => () => void Speech.stop(), []);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const mine: ChatMsg = { id: nid(), who: 'me', text: t };
    const next = [...msgs, mine];
    setMsgs(next);
    setQ('');
    setSuggest([]);
    setBusy(true);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    progress.talked();
    const r = await askGuide(t, topic, next, en);
    setMsgs((m) => [...m, { id: nid(), who: 'guide', ...r }]);
    if (r.followUp) setSuggest([r.followUp]);
    setBusy(false);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    if (voiceRef.current) {
      setLastReply(r.text);
      Speech.stop();
      setTalking(true);
      Speech.speak(r.text, { language: 'ta-IN', rate: 0.93, onDone: () => setTalking(false), onStopped: () => setTalking(false), onError: () => setTalking(false) });
    }
  };

  const ear = useListen('ta-IN', (t) => send(t));
  const orbState: OrbState = ear.listening ? 'listening' : busy ? 'thinking' : talking ? 'speaking' : 'idle';
  const tapMic = () => {
    if (ear.listening) return ear.stop();
    if (talking) {
      Speech.stop();
      setTalking(false);
    }
    ear.start();
  };
  const closeVoice = () => {
    Speech.stop();
    setTalking(false);
    ear.stop();
    setVoice(false);
  };

  const speak = (m: ChatMsg) => {
    if (speaking === m.id) {
      Speech.stop();
      setSpeaking(null);
      return;
    }
    Speech.stop();
    setSpeaking(m.id);
    Speech.speak(m.text, { language: 'ta-IN', rate: 0.95, onDone: () => setSpeaking(null), onStopped: () => setSpeaking(null), onError: () => setSpeaking(null) });
  };

  const openRef = (ref: ChatMsg['ref']) => {
    if (!ref) return;
    if (ref.kind === 'gita') router.push(`/gita/${ref.c}/${ref.v}`);
    else router.push(`/mantras/${ref.id}`);
  };

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, busy ? 1.12 : 1.06] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: pal.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* header: deity orb */}
      <View style={[st.head, { paddingTop: insets.top + 4 }]}>
        <Image source={deity.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" blurRadius={2} />
        <LinearGradient colors={['rgba(20,8,0,0.35)', 'rgba(20,8,0,0.25)', pal.bg]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
        <View style={st.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" onPress={() => router.back()} hitSlop={8} style={st.round}>
            <Ionicons name="arrow-back" size={22} color="#FFF6E2" />
          </Pressable>
          <View style={st.label}>
            <Ionicons name="sparkles" size={13} color="#2B1D0E" />
            <Text style={st.labelT}>கடவுளிடம் கேளுங்கள்</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={st.orbWrap}>
          <Animated.View style={[st.halo, { opacity: glow, transform: [{ scale }] }]} />
          <Animated.View style={[st.orb, { transform: [{ scale }] }]}>
            <Image source={deity.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </Animated.View>
        </View>
        <Text style={st.status}>{busy ? (en ? 'Reflecting with the texts…' : 'உங்கள் கேள்வியுடன் அருள்நூல்களைச் சிந்திக்கிறேன்…') : en ? 'Share what is on your mind' : 'மனதில் இருப்பதைப் பகிருங்கள் · அன்புடன் வழிகாட்டல்'}</Text>
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {msgs.map((m) =>
          m.who === 'me' ? (
            <View key={m.id} style={[st.me, { backgroundColor: pal.accent }]}>
              <Text style={st.meT}>{m.text}</Text>
            </View>
          ) : (
            <View key={m.id} style={[st.guide, { backgroundColor: pal.card, borderColor: pal.line }]}>
              <Text style={[st.guideT, { color: pal.ink }, en && { fontFamily: undefined, fontSize: 15.5 }]}>{m.text}</Text>
              <View style={st.tools}>
                {m.ref && (
                  <Pressable accessibilityRole="button" onPress={() => openRef(m.ref)} style={[st.refChip, { backgroundColor: pal.chip }]}>
                    <Ionicons name={m.ref.kind === 'gita' ? 'book-outline' : 'musical-notes-outline'} size={13} color={pal.accent} />
                    <Text style={[st.refT, { color: pal.ink }]}>{refLabel(m.ref)}</Text>
                    <Ionicons name="chevron-forward" size={13} color={pal.sub} />
                  </Pressable>
                )}
                <Pressable accessibilityRole="button" accessibilityLabel={speaking === m.id ? 'நிறுத்து' : 'கேளுங்கள்'} onPress={() => speak(m)} hitSlop={8} style={st.speak}>
                  <Ionicons name={speaking === m.id ? 'stop-circle' : 'volume-high-outline'} size={20} color={pal.accent} />
                </Pressable>
              </View>
            </View>
          ),
        )}
        {busy && (
          <View style={[st.guide, { backgroundColor: pal.card, borderColor: pal.line, flexDirection: 'row', gap: 6 }]}>
            {[0, 1, 2].map((i) => (
              <Animated.View key={i} style={[st.dot, { backgroundColor: pal.accent, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [1, 0.3] : [0.3, 1] }) }]} />
            ))}
          </View>
        )}
        {suggest.length > 0 && !busy && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {suggest.map((s) => (
              <Pressable key={s} accessibilityRole="button" onPress={() => send(s)} style={[st.sugg, { borderColor: pal.accent, backgroundColor: pal.card }]}>
                <Text style={{ fontFamily: F.taSemi, fontSize: 13, color: pal.accent }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={[st.fine, { color: pal.sub }]}>
          கீதை மற்றும் இச்செயலியின் நூல்களை அடிப்படையாகக் கொண்ட ஆன்மிக உரையாடல். பதில்கள் வழிகாட்டும் விளக்கங்கள்; இறைவனின் நேரடி வாக்காகக் கருத வேண்டாம்.
        </Text>
      </ScrollView>

      {/* input */}
      <View style={[st.bar, { backgroundColor: pal.card, borderTopColor: pal.line, paddingBottom: insets.bottom + 10 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="குரலில் உரையாடு" onPress={() => setVoice(true)} style={[st.mic, { backgroundColor: pal.chip }]}>
          <Ionicons name="mic" size={20} color={pal.accent} />
        </Pressable>
        <TextInput
          ref={input}
          value={q}
          onChangeText={setQ}
          placeholder={en ? 'Share what is on your mind…' : 'உங்கள் மனதில் இருப்பதை எழுதுங்கள்…'}
          placeholderTextColor={pal.sub}
          style={[st.input, { color: pal.ink, borderColor: pal.line, backgroundColor: pal.bg }]}
          multiline
          maxLength={800}
          accessibilityLabel="கேள்வி"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="அனுப்பு" onPress={() => send(q)} disabled={!q.trim() || busy} style={[st.send, { backgroundColor: pal.accent, opacity: q.trim() && !busy ? 1 : 0.5 }]}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
      {voice && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#120804', alignItems: 'center', paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
          <Image source={deity.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.22 }]} resizeMode="cover" blurRadius={6} />
          <View style={st.topRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="மூடு" onPress={closeVoice} hitSlop={8} style={st.round}>
              <Ionicons name="close" size={22} color="#FFF6E2" />
            </Pressable>
            <View style={st.label}>
              <Ionicons name="sparkles" size={13} color="#2B1D0E" />
              <Text style={st.labelT}>கடவுளிடம் கேளுங்கள்</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 18 }}>
            <VoiceOrb state={orbState} size={230} />
            <Text style={{ fontFamily: F.taBold, fontSize: 18, color: '#FFE7B0', textAlign: 'center' }}>
              {ear.listening ? 'கேட்கிறேன்…' : busy ? 'நூல்களில் தேடுகிறேன்…' : talking ? 'சொல்கிறேன்…' : sttAvailable ? 'மைக்கைத் தட்டிப் பேசுங்கள்' : 'இந்தக் கருவியில் குரல் பதிவு இல்லை'}
            </Text>
            <Text style={{ fontFamily: F.ta, fontSize: 15, lineHeight: 25, color: '#F3E1BC', textAlign: 'center', minHeight: 80 }} numberOfLines={5}>
              {ear.listening ? ear.partial : ear.error ?? lastReply}
            </Text>
            {!sttAvailable && <Text style={{ fontFamily: F.ta, fontSize: 12, color: '#C9B28A', textAlign: 'center' }}>இந்தப் பதிப்பில் குரல் பதிவு கிடைக்கவில்லை. உங்கள் கேள்வியை எழுதிக் கேளுங்கள்.</Text>}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={ear.listening ? 'நிறுத்து' : 'பேசு'} onPress={tapMic} disabled={!sttAvailable || busy} style={[st.bigMic, ear.listening && { backgroundColor: '#D8402E' }, (!sttAvailable || busy) && { opacity: 0.4 }]}>
            <Ionicons name={ear.listening ? 'stop' : 'mic'} size={34} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: F.ta, fontSize: 11, color: '#C9B28A', marginTop: 12, paddingHorizontal: 30, textAlign: 'center' }}>நூல்களின் அடிப்படையிலான ஆன்மிக வழிகாட்டல்.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  head: { height: 290, overflow: 'hidden', alignItems: 'center' },
  topRow: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  label: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(243,212,143,0.95)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  labelT: { fontFamily: F.taSemi, fontSize: 12, color: '#2B1D0E' },
  orbWrap: { marginTop: 18, width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFD36B' },
  orb: { width: 118, height: 118, borderRadius: 59, overflow: 'hidden', borderWidth: 3, borderColor: '#F3D48F' },
  status: { marginTop: 12, fontFamily: F.taSemi, fontSize: 13, color: '#FFF6E2', textAlign: 'center', paddingHorizontal: 24, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 6 },
  me: { alignSelf: 'flex-end', maxWidth: '85%', borderRadius: 18, borderTopRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  meT: { fontFamily: F.ta, fontSize: 15, lineHeight: 24, color: '#fff' },
  guide: { alignSelf: 'flex-start', maxWidth: '92%', borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1, padding: 14, gap: 10 },
  guideT: { fontFamily: F.ta, fontSize: 15, lineHeight: 25 },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  refChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  refT: { fontFamily: F.taSemi, fontSize: 12 },
  speak: { marginLeft: 'auto', width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sugg: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  fine: { fontFamily: F.ta, fontSize: 11, lineHeight: 18, marginTop: 6 },
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  bigMic: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#E8841F', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC85A', shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  mic: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontFamily: F.ta, fontSize: 14.5 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
