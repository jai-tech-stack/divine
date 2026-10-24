import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, GoldButton, IconButton, Icons, T } from '@/components/ui';
import { getStory } from '@/content';
import { aiConfigured, askWisdom, type WisdomReply } from '@/lib/ai';
import { hasTamilVoice, prepareNarrator } from '@/lib/narrator';
import { C, F } from '@/theme';

const native = Platform.OS !== 'web';
const STEPS = ['சுலோகம்', 'பொருள்', 'ஞானம்', 'செயல்', 'கேள்'];

export default function Learn() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(id);
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  useEffect(() => {
    prepareNarrator();
    return () => {
      Speech.stop();
    };
  }, [step]);

  if (!story) return null;
  const last = step === STEPS.length - 1;

  return (
    <View style={[st.fill, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <IconButton label="பின்செல்" onPress={() => (step > 0 ? setStep(step - 1) : router.back())}>
          {Icons.back()}
        </IconButton>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={st.hTitle}>{story.title}</Text>
          <Text style={st.hSub}>{story.purana}</Text>
        </View>
        <IconButton label="மூடு" onPress={() => router.dismissTo('/')}>
          {Icons.close(C.muted)}
        </IconButton>
      </View>

      <View style={st.stepper}>
        {STEPS.map((s, i) => (
          <Pressable key={s} accessibilityRole="tab" accessibilityState={{ selected: i === step }} onPress={() => setStep(i)} style={st.stepItem}>
            <View style={[st.stepDot, i <= step && st.stepDotOn]}>
              <Text style={[st.stepNum, i <= step && { color: C.ink }]}>{i + 1}</Text>
            </View>
            <Text style={[st.stepLabel, i === step && { color: C.goldLight }]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView key={step} contentContainerStyle={{ padding: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Reveal key={step}>
          {step === 0 && <VerseStep story={story} />}
          {step === 1 && <MeaningStep story={story} />}
          {step === 2 && <WisdomStep story={story} />}
          {step === 3 && <YouStep story={story} />}
          {step === 4 && <AskStep story={story} />}
        </Reveal>
      </ScrollView>

      {!last && (
        <View style={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 16 }}>
          <GoldButton label={`அடுத்து: ${STEPS[step + 1]}`} icon={Icons.arrow(C.ink)} onPress={() => setStep(step + 1)} />
        </View>
      )}
    </View>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, [v]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>{children}</Animated.View>;
}

type StepProps = { story: NonNullable<ReturnType<typeof getStory>> };

function VerseStep({ story }: StepProps) {
  const [speaking, setSpeaking] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  const read = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(story.verse.tamilScript.replace(/[|\n]/g, ' '), {
      language: 'ta-IN',
      rate: 0.78,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };
  return (
    <View style={{ gap: 18 }}>
      <Badge text={story.verse.ref} />
      <Animated.View style={[st.verseCard, { shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.45] }) }]}>
        {story.verse.devanagari ? (
          <>
            <Text style={st.deva}>{story.verse.devanagari}</Text>
            <View style={st.divider} />
          </>
        ) : null}
        <Text style={st.verseTa}>{story.verse.tamilScript}</Text>
      </Animated.View>
      <GoldButton outline label={speaking ? 'நிறுத்து' : 'தமிழ்க் குரலில் கேளுங்கள்'} icon={speaking ? Icons.stop() : Icons.speaker(C.gold)} onPress={read} />
      {!hasTamilVoice() && <T style={st.small}>இந்தச் சாதனத்தில் தமிழ்க் குரல் நிறுவப்படவில்லை என்றால் ஒலி கேட்காது.</T>}
      <T style={st.small}>{story.verse.note}</T>
    </View>
  );
}

function MeaningStep({ story }: StepProps) {
  return (
    <View style={{ gap: 16 }}>
      <Badge text="Divine Life உரை" tone="muted" />
      <View style={st.panel}>
        {story.verse.words.map((w, i) => (
          <View key={w.w} style={[st.wordRow, i > 0 && st.wordRowLine]}>
            <Text style={st.word}>{w.w}</Text>
            <Text style={st.wordM}>{w.m}</Text>
          </View>
        ))}
      </View>
      <Text style={st.sectionH}>முழுப் பொருள்</Text>
      <T style={{ fontSize: 17, lineHeight: 31 }}>{story.verse.meaning}</T>
      <Text style={st.sectionH}>கதையோடு இணைப்பு</Text>
      <T>பிருதுவின் சினம் "பூமியைப் பிளப்பேன்" என்ற மயக்கத்துக்குக் கொண்டு சென்றது — அதுவே சுலோகத்தின் முதல் படி. பூமி பேசியபோது அவன் நின்றான்; நினைவும் பகுத்தறிவும் திரும்பின; அழிவு தவிர்க்கப்பட்டது.</T>
    </View>
  );
}

function WisdomStep({ story }: StepProps) {
  return (
    <View style={{ gap: 14 }}>
      <Badge text="ஞானக் குறிப்புகள்" tone="muted" />
      {story.wisdom.map((w, i) => (
        <Stagger key={w.heading} i={i}>
          <View style={st.panel}>
            <Text style={st.wisH}>{w.heading}</Text>
            <T>{w.body}</T>
          </View>
        </Stagger>
      ))}
    </View>
  );
}

function Stagger({ i, children }: { i: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 500, delay: 160 * i, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, [v, i]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>{children}</Animated.View>;
}

function YouStep({ story }: StepProps) {
  const [pick, setPick] = useState<number | null>(null);
  const replies = [
    'அது மிகவும் இயல்பானது — பிருதுவும் முதலில் வில்லைத்தான் எடுத்தான். அடுத்த முறை, பேசும் முன் ஒரு மூச்சு இடைவெளி.',
    'விலகிச் செல்வது சில நேரம் புத்திசாலித்தனம். பின்பு திரும்பி வந்து "கேட்பது" தான் அடுத்த படி.',
    'அதுவே கதையின் திருப்புமுனை. அந்தக் கணத்தில் உதவியது எது என்று கவனியுங்கள் — அதைப் பழக்கமாக்கலாம்.',
    'பரவாயில்லை. அடுத்த முறை சினம் வரும் போது, உடலில் அது எங்கே உணரப்படுகிறது என்பதை மட்டும் கவனியுங்கள்.',
  ];
  return (
    <View style={{ gap: 16 }}>
      <T style={{ fontSize: 17, lineHeight: 30, fontFamily: F.taSemi }}>{story.reflection.question}</T>
      <View style={{ gap: 10 }}>
        {story.reflection.options.map((o, i) => (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ checked: pick === i }}
            onPress={() => setPick(i)}
            style={[st.option, pick === i && st.optionOn]}>
            <View style={[st.radio, pick === i && { borderColor: C.gold }]}>{pick === i && <View style={st.radioIn} />}</View>
            <T style={{ flex: 1 }}>{o}</T>
          </Pressable>
        ))}
      </View>
      {pick !== null && (
        <Reveal>
          <View style={[st.panel, { gap: 14 }]}>
            <T>{replies[pick]}</T>
            <View style={st.divider} />
            <Text style={st.wisH}>இன்றைய சிறிய செயல்</Text>
            <T>{story.practice.detail}</T>
            <GoldButton
              label={story.practice.label}
              icon={Icons.play()}
              onPress={() => router.push({ pathname: story.practice.route, params: { minutes: String(story.practice.minutes), pattern: '4-4-6', from: story.id } })}
            />
            <T style={st.small}>விருப்பம் மட்டுமே — தவிர்க்கலாம் அல்லது நேரத்தை மாற்றலாம். உங்கள் பதில் இந்தச் சாதனத்தைவிட்டு எங்கும் அனுப்பப்படுவதில்லை.</T>
          </View>
        </Reveal>
      )}
    </View>
  );
}

function AskStep({ story }: StepProps) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<{ q: string; a: WisdomReply }[]>([]);
  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setBusy(true);
    setQ('');
    const a = await askWisdom(question, story);
    setThread((t) => [...t, { q: question, a }]);
    setBusy(false);
  };
  return (
    <View style={{ gap: 16 }}>
      <View style={st.panel}>
        <T style={st.small}>
          இது ஒரு AI ஞானத் துணை — தெய்வமோ குருவோ அல்ல. கதை, சுலோகம், ஞானக் குறிப்புகளின் அடிப்படையில் மட்டும் பதில் தரும். மருத்துவ அல்லது அவசர நிலைகளில் நம்பிக்கையான மனிதரை அணுகுங்கள்.
        </T>
        {!aiConfigured() && <Badge text="ஆஃப்லைன் · தயாரிக்கப்பட்ட பதில்கள்" tone="muted" />}
      </View>
      <View style={{ gap: 8 }}>
        {story.askSuggestions.map((s) => (
          <Pressable key={s} onPress={() => ask(s)} style={({ pressed }) => [st.chip, pressed && { opacity: 0.8 }]}>
            <T style={{ fontSize: 14, lineHeight: 22, color: C.goldLight }}>{s}</T>
          </Pressable>
        ))}
      </View>
      {thread.map((m, i) => (
        <Reveal key={i}>
          <View style={{ gap: 10 }}>
            <View style={st.qBubble}>
              <T style={{ fontSize: 14.5 }}>{m.q}</T>
            </View>
            <View style={st.aBubble}>
              <T>{m.a.text}</T>
              {!!m.a.followUp && <T style={{ color: C.goldLight, marginTop: 8 }}>{m.a.followUp}</T>}
              <Text style={st.srcTag}>{m.a.source === 'offline' ? 'தயாரிக்கப்பட்ட பதில்' : `AI · ${m.a.source}`}</Text>
            </View>
          </View>
        </Reveal>
      ))}
      {busy && <ActivityIndicator color={C.gold} />}
      <View style={st.inputRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="உங்கள் கேள்வியை எழுதுங்கள்…"
          placeholderTextColor="rgba(201,187,155,0.7)"
          style={st.input}
          multiline
          accessibilityLabel="கேள்வி"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="அனுப்பு" onPress={() => ask(q)} style={st.send}>
          {Icons.send()}
        </Pressable>
      </View>
      <GoldButton outline label="முகப்புக்குத் திரும்பு" onPress={() => router.dismissTo('/')} />
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.deep },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 6 },
  hTitle: { fontFamily: F.taBold, fontSize: 17, color: C.gold },
  hSub: { fontFamily: F.ta, fontSize: 12, color: C.muted },
  stepper: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(227,184,101,0.15)' },
  stepItem: { flex: 1, alignItems: 'center', gap: 5, minHeight: 44 },
  stepDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.panelLine, alignItems: 'center', justifyContent: 'center' },
  stepDotOn: { backgroundColor: C.gold, borderColor: C.gold },
  stepNum: { fontFamily: F.num, fontSize: 15, color: C.muted },
  stepLabel: { fontFamily: F.ta, fontSize: 11, color: C.muted },
  verseCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.panelLine,
    backgroundColor: C.panel,
    padding: 22,
    gap: 16,
    shadowColor: C.gold,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  deva: { fontFamily: F.deva, fontSize: 21, lineHeight: 40, color: C.goldLight, textAlign: 'center' },
  verseTa: { fontFamily: F.taSemi, fontSize: 17, lineHeight: 32, color: C.cream, textAlign: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(227,184,101,0.25)' },
  small: { fontSize: 12.5, lineHeight: 21, color: C.muted },
  panel: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)', backgroundColor: 'rgba(17,26,46,0.85)', padding: 16, gap: 8 },
  wordRow: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  wordRowLine: { borderTopWidth: 1, borderTopColor: 'rgba(227,184,101,0.12)' },
  word: { width: 128, fontFamily: F.taSemi, fontSize: 14.5, color: C.goldLight },
  wordM: { flex: 1, fontFamily: F.ta, fontSize: 14.5, color: C.cream, lineHeight: 23 },
  sectionH: { fontFamily: F.taBold, fontSize: 15, color: C.gold, marginTop: 6 },
  wisH: { fontFamily: F.taBold, fontSize: 16, color: C.goldLight },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(227,184,101,0.25)' },
  optionOn: { borderColor: C.gold, backgroundColor: 'rgba(227,184,101,0.1)' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  radioIn: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold },
  chip: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(227,184,101,0.4)', paddingHorizontal: 14, paddingVertical: 10 },
  qBubble: { alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: 'rgba(227,184,101,0.16)', borderRadius: 16, borderBottomRightRadius: 4, padding: 12 },
  aBubble: { alignSelf: 'flex-start', maxWidth: '96%', backgroundColor: C.panel, borderRadius: 16, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: 'rgba(227,184,101,0.2)' },
  srcTag: { marginTop: 8, fontFamily: F.ta, fontSize: 11, color: C.muted },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, minHeight: 52, maxHeight: 140, borderRadius: 14, borderWidth: 1, borderColor: C.panelLine, color: C.cream, fontFamily: F.ta, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  send: { width: 52, height: 52, borderRadius: 14, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
});
