import { DeityImage } from '@/components/DeityImage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { speakTamil, stopTamilSpeech } from '@/lib/tamilSpeech';
import { LinearGradient } from 'expo-linear-gradient';
import { VoiceOrb, type OrbState } from '@/components/VoiceOrb';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/components/reader/ReaderKit';
import { deityForToday } from '@/content/deities';
import { askGuide, type ChatMsg, opening, refLabel, topicFrom } from '@/lib/companion';
import { progress, useProgress } from '@/lib/progress';
import { sttAvailable, useListen } from '@/lib/stt';
import { F } from '@/theme';

const native = Platform.OS !== 'web';
let seq = 0;
const nid = () => `m${Date.now()}_${seq++}`;

/** The companion: opens with what you were just doing, answers from the text, links back to it. */
export default function Companion() {
  const p = useProgress();
  const { prefs } = usePalette();
  const deity = deityForToday(prefs.deity);
  const topic = useMemo(() => topicFrom(p, deity.id), [p.lastActivity, p.gitaLast, deity.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const topicKey = topic?.kind === 'gita' ? `gita:${topic.c}.${topic.v}` : topic?.kind === 'mantra' ? `mantra:${topic.id}` : 'general';
  return <Conversation key={`${deity.id}:${topicKey}`} deity={deity} topic={topic} />;
}

function Conversation({ deity, topic }: { deity: ReturnType<typeof deityForToday>; topic: ReturnType<typeof topicFrom> }) {
  const insets = useSafeAreaInsets();
  const en = false;
  const first = useMemo(() => opening(topic, en), [topic, en]);
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => [{ id: nid(), who: 'guide', text: first.text, ref: topic ?? undefined }]);
  const [suggest, setSuggest] = useState<string[]>(first.suggestions);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [talking, setTalking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const speakNext = useRef(false);
  const history_ = useRef<any>(null);
  const [dim] = useState(() => new Animated.Value(0));

  const say = (text: string) => {
    stopTamilSpeech();
    setTalking(true);
    void speakTamil(text, { language: 'ta-IN', rate: 0.93, onDone: () => setTalking(false), onStopped: () => setTalking(false), onError: () => setTalking(false) });
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const viaVoice = speakNext.current;
    speakNext.current = false;
    const next = [...msgs, { id: nid(), who: 'me', text: t } as ChatMsg];
    setMsgs(next);
    setQ('');
    setSuggest([]);
    setBusy(true);
    progress.talked();
    const r = await askGuide(t, topic, next, en, deity.id);
    setMsgs((m) => [...m, { id: nid(), who: 'guide', ...r }]);
    setSuggest(r.followUps?.length ? r.followUps : r.followUp ? [r.followUp] : []);
    setBusy(false);
    if (viaVoice) say(r.text);
  };

  const ear = useListen('ta-IN', (t) => {
    speakNext.current = true;
    void send(t);
  });
  const state: OrbState = ear.listening ? 'listening' : busy ? 'thinking' : talking ? 'speaking' : 'idle';
  const active = state !== 'idle';

  useEffect(() => {
    Animated.timing(dim, { toValue: active ? 1 : 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
  }, [active, dim]);
  useEffect(() => () => void stopTamilSpeech(), []);

  const tapMic = () => {
    if (ear.listening) return ear.stop();
    if (talking) {
      stopTamilSpeech();
      setTalking(false);
      return;
    }
    if (!sttAvailable) {
      setTyping(true);
      return;
    }
    ear.start();
  };
  const speakMsg = (m: ChatMsg) => {
    if (speaking === m.id) {
      stopTamilSpeech();
      setSpeaking(null);
      return;
    }
    stopTamilSpeech();
    setSpeaking(m.id);
    void speakTamil(m.text, { language: 'ta-IN', rate: 0.95, onDone: () => setSpeaking(null), onStopped: () => setSpeaking(null), onError: () => setSpeaking(null) });
  };
  const openRef = (ref: ChatMsg['ref']) => {
    if (!ref) return;
    if (ref.kind === 'gita') router.push(`/gita/${ref.c}/${ref.v}`);
    else router.push(`/mantras/${ref.id}`);
  };

  const last = [...msgs].reverse().find((m) => m.who === 'guide');
  const label = ear.listening ? 'உங்கள் குரலைக் கேட்கிறேன்…' : busy ? 'நூல்களில் தேடுகிறேன்…' : talking ? 'பதிலை வாசிக்கிறேன்…' : ear.error ?? 'தட்டிப் பேசுங்கள்';
  const micOn = ear.listening || talking;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#120804' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <DeityImage source={deity.image} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" accessibilityLabel={deity.ta} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#120804', opacity: dim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.62] }) }]} />
      <LinearGradient colors={['rgba(18,8,4,0.55)', 'rgba(18,8,4,0)', 'rgba(18,8,4,0.7)', 'rgba(18,8,4,0.97)']} locations={[0, 0.25, 0.55, 0.8]} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {active && (
        <View pointerEvents="none" style={st.orbSlot}>
          <VoiceOrb state={state} size={210} />
        </View>
      )}

      <View style={[st.top, { paddingTop: insets.top + 8 }]}>
        <View style={st.label}>
          <Ionicons name="sparkles" size={13} color="#2B1D0E" />
          <Text style={st.labelT}>கடவுளிடம் கேளுங்கள் · AI வழிகாட்டி</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="உரையாடல் வரலாறு" onPress={() => setHistory(true)} hitSlop={8} style={st.round}>
          <Ionicons name="chatbubbles-outline" size={20} color="#FFF6E2" />
        </Pressable>
      </View>

      <View style={[st.sheet, { paddingBottom: 12 }]}>
        {last && (
          <View style={st.reply}>
            <ScrollView style={{ maxHeight: 190 }} showsVerticalScrollIndicator={false} accessibilityLiveRegion="polite">
              <Text style={st.replyT}>{busy ? '…' : last.text}</Text>
            </ScrollView>
            <View style={st.tools}>
              {last.ref ? (
                <Pressable accessibilityRole="button" onPress={() => openRef(last.ref)} style={st.refChip}>
                  <Ionicons name={last.ref.kind === 'gita' ? 'book-outline' : 'musical-notes-outline'} size={13} color="#F3D48F" />
                  <Text style={st.refT}>{refLabel(last.ref)}</Text>
                  <Ionicons name="chevron-forward" size={13} color="#C9B28A" />
                </Pressable>
              ) : <View />}
              <Pressable accessibilityRole="button" accessibilityLabel={speaking === last.id ? 'நிறுத்து' : 'கேளுங்கள்'} onPress={() => speakMsg(last)} hitSlop={8} style={st.speak}>
                <Ionicons name={speaking === last.id ? 'stop-circle' : 'volume-high-outline'} size={22} color="#F3D48F" />
              </Pressable>
            </View>
          </View>
        )}

        {suggest.length > 0 && !busy && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ flexGrow: 0 }}>
            {suggest.map((s) => (
              <Pressable key={s} accessibilityRole="button" onPress={() => send(s)} style={st.sugg}>
                <Text style={st.suggT}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {typing && (
          <View style={st.bar}>
            <TextInput value={q} onChangeText={setQ} placeholder="உங்கள் மனதில் இருப்பதை எழுதுங்கள்…" placeholderTextColor="#B9A27A" style={st.input} multiline maxLength={800} accessibilityLabel="கேள்வி" autoFocus />
            <Pressable accessibilityRole="button" accessibilityLabel="அனுப்பு" onPress={() => send(q)} disabled={!q.trim() || busy} style={[st.send, { opacity: q.trim() && !busy ? 1 : 0.45 }]}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        <View style={st.micRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={typing ? 'எழுதுவதை மூடு' : 'எழுதிக் கேள்'} onPress={() => setTyping(!typing)} style={st.side}>
            <Ionicons name={typing ? 'close' : 'create-outline'} size={22} color="#F3D48F" />
            <Text style={st.sideT}>{typing ? 'மூடு' : 'எழுது'}</Text>
          </Pressable>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={micOn ? 'நிறுத்து' : 'பேசு'} onPress={tapMic} disabled={busy} style={[st.bigMic, micOn && { backgroundColor: '#D8402E' }, busy && { opacity: 0.5 }]}>
              <Ionicons name={micOn ? 'stop' : 'mic'} size={32} color="#fff" />
            </Pressable>
            <Text style={st.stateT}>{label}</Text>
          </View>
          <View style={st.side} />
        </View>
        <Text style={st.fine}>AI வழிகாட்டி · கீதை மற்றும் இச்செயலியின் நூல்களை அடிப்படையாகக் கொண்டது. இறைவனின் நேரடி வாக்கு அல்ல.</Text>
      </View>

      <Modal visible={history} animationType="slide" onRequestClose={() => setHistory(false)} transparent>
        <View style={st.hist}>
          <View style={[st.histTop, { paddingTop: insets.top + 8 }]}>
            <Text style={st.histT}>உரையாடல்</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="மூடு" onPress={() => setHistory(false)} hitSlop={8} style={st.round}>
              <Ionicons name="close" size={22} color="#FFF6E2" />
            </Pressable>
          </View>
          <ScrollView ref={history_} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }} onContentSizeChange={() => history_.current?.scrollToEnd({ animated: false })}>
            {msgs.map((m) => (
              <View key={m.id} style={m.who === 'me' ? st.me : st.guide}>
                <Text style={m.who === 'me' ? st.meT : st.guideT}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  orbSlot: { position: 'absolute', top: '16%', left: 0, right: 0, alignItems: 'center' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  label: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(243,212,143,0.96)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  labelT: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 20, color: '#2B1D0E' },
  sheet: { flex: 1, justifyContent: 'flex-end', gap: 12 },
  reply: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(243,212,143,0.3)', backgroundColor: 'rgba(18,8,4,0.78)', padding: 14, gap: 10 },
  replyT: { fontFamily: F.ta, fontSize: 15, lineHeight: 26, color: '#FFF0D2' },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  refChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(243,212,143,0.14)' },
  refT: { fontFamily: F.taSemi, fontSize: 12, lineHeight: 20, color: '#FFE7B0' },
  speak: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sugg: { borderRadius: 999, borderWidth: 1, borderColor: '#F3D48F', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(18,8,4,0.65)' },
  suggT: { fontFamily: F.taSemi, fontSize: 13, lineHeight: 22, color: '#FFE7B0' },
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16 },
  input: { flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(243,212,143,0.4)', backgroundColor: 'rgba(18,8,4,0.85)', paddingHorizontal: 16, paddingVertical: 10, fontFamily: F.ta, fontSize: 14.5, color: '#FFF0D2' },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8841F', alignItems: 'center', justifyContent: 'center' },
  micRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 },
  side: { width: 64, alignItems: 'center', gap: 2 },
  sideT: { fontFamily: F.ta, fontSize: 11, lineHeight: 18, color: '#F3D48F' },
  bigMic: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#E8841F', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFC85A', shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  stateT: { fontFamily: F.taSemi, fontSize: 13, lineHeight: 22, color: '#FFE7B0', textAlign: 'center' },
  fine: { fontFamily: F.ta, fontSize: 10.5, lineHeight: 17, color: '#C9B28A', textAlign: 'center', paddingHorizontal: 24 },
  hist: { flex: 1, backgroundColor: 'rgba(18,8,4,0.97)' },
  histTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  histT: { fontFamily: F.taBold, fontSize: 18, color: '#FFE7B0' },
  me: { alignSelf: 'flex-end', maxWidth: '85%', borderRadius: 18, borderTopRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#B8691A' },
  meT: { fontFamily: F.ta, fontSize: 15, lineHeight: 24, color: '#fff' },
  guide: { alignSelf: 'flex-start', maxWidth: '92%', borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(243,212,143,0.3)', padding: 14, backgroundColor: 'rgba(255,240,210,0.08)' },
  guideT: { fontFamily: F.ta, fontSize: 15, lineHeight: 25, color: '#FFF0D2' },
});
