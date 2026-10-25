import { createAudioPlayer } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CinematicScene } from '@/components/cinema/CinematicScene';
import { GoldButton, IconButton, Icons } from '@/components/ui';
import { getStory } from '@/content';
import { sceneClip } from '@/content/audioManifest';
import { estimateMs, narrate, prepareNarrator, stopNarration } from '@/lib/narrator';
import { C, F } from '@/theme';
import { progress, useProgress } from '@/lib/progress';

const native = Platform.OS !== 'web';

type Phase = 'intro' | 'playing' | 'ended';

export default function StoryPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(id);
  const saved = useProgress().storyLast;
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('intro');
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceNote, setVoiceNote] = useState(false);
  const [fade] = useState(() => new Animated.Value(1));
  const busy = useRef(false);

  useEffect(() => {
    if (story && phase !== 'intro') void progress.storyPosition(story.id, si, li, phase === 'ended');
  }, [story, phase, si, li]);

  useEffect(() => {
    prepareNarrator();
    return () => stopNarration();
  }, []);

  const scene = story?.scenes[si];
  const sceneMs = useMemo(() => (scene ? scene.lines.reduce((a, l) => a + estimateMs(l), 900) : 0), [scene]);

  const goScene = useCallback(
    (n: number) => {
      if (!story || busy.current) return;
      if (n >= story.scenes.length) {
        stopNarration();
        setPhase('ended');
        return;
      }
      busy.current = true;
      Animated.timing(fade, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: native }).start(() => {
        setSi(Math.max(0, n));
        setLi(0);
        Animated.timing(fade, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: native }).start(() => (busy.current = false));
      });
    },
    [story, fade],
  );

  const next = useCallback(() => {
    if (!scene) return;
    if (li < scene.lines.length - 1) setLi(li + 1);
    else goScene(si + 1);
  }, [scene, li, si, goScene]);

  const prev = useCallback(() => {
    if (li > 0) setLi(li - 1);
    else if (si > 0) goScene(si - 1);
  }, [li, si, goScene]);

  // The narrator's own recording of the scene, when there is one: it drives the lines and the next scene.
  const clip = story && scene ? sceneClip(story.id, scene.id) : undefined;
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  useEffect(() => {
    if (!clip) return;
    try {
      playerRef.current = createAudioPlayer(clip);
    } catch {
      playerRef.current = null;
    }
    return () => {
      try {
        playerRef.current?.remove();
      } catch {}
      playerRef.current = null;
    };
  }, [clip]);

  useEffect(() => {
    if (!clip || !scene || phase !== 'playing') return;
    const p = playerRef.current;
    if (!p) return;
    if (paused || muted) {
      try {
        p.pause();
      } catch {}
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let done = false;
    const lens = scene.lines.map((l) => l.length);
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const sub = p.addListener('playbackStatusUpdate', (st: { didJustFinish?: boolean }) => {
      if (st.didJustFinish && !done) {
        done = true;
        timers.push(setTimeout(() => goScene(si + 1), 600));
      }
    });
    const schedule = () => {
      const dur = p.duration && p.duration > 0 ? p.duration : (scene.lines.reduce((a, l) => a + estimateMs(l), 0) / 1000);
      const now = p.currentTime || 0;
      let acc = 0;
      lens.forEach((n, k) => {
        if (k > 0 && acc / total * dur > now) timers.push(setTimeout(() => setLi(k), (acc / total * dur - now) * 1000));
        acc += n;
      });
    };
    try {
      p.play();
    } catch {}
    const wait = setTimeout(schedule, 400); // duration is known shortly after load
    timers.push(wait);
    return () => {
      sub.remove();
      timers.forEach(clearTimeout);
      try {
        p.pause();
      } catch {}
    };
  }, [clip, phase, paused, muted, si, scene, goScene]);

  // otherwise narrate the current line with the device voice (or timed subtitles), then advance
  useEffect(() => {
    if (phase !== 'playing' || paused || !scene || clip) return;
    const h = narrate(scene.lines[li], { muted, onDone: next });
    return () => h.cancel();
  }, [phase, paused, muted, si, li, scene, next, clip]);

  if (!story || !scene) {
    return (
      <View style={[st.fill, st.center]}>
        <Text style={st.sub}>சரிதம் கிடைக்கவில்லை</Text>
      </View>
    );
  }

  const start = async () => {
    const ok = await prepareNarrator();
    if (!ok) {
      setVoiceNote(true);
      setTimeout(() => setVoiceNote(false), 5000);
    }
    setPhase('playing');
  };

  const restart = () => {
    setSi(0);
    setLi(0);
    setPaused(false);
    setPhase('playing');
  };

  return (
    <View style={st.fill}>
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <CinematicScene key={scene.id} scene={scene} durationMs={sceneMs} paused={phase !== 'playing' || paused} />
      </Animated.View>

      {phase === 'playing' && (
        <>
          {/* tap zones: back | pause | next */}
          <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
            <Pressable accessibilityLabel="முந்தைய வரி" style={{ flex: 3 }} onPress={prev} />
            <Pressable accessibilityLabel={paused ? 'தொடர்' : 'இடைநிறுத்து'} style={{ flex: 4 }} onPress={() => setPaused((p) => !p)} />
            <Pressable accessibilityLabel="அடுத்த வரி" style={{ flex: 3 }} onPress={next} />
          </View>

          <View pointerEvents="box-none" style={[st.top, { paddingTop: insets.top + 10 }]}>
            <View style={st.bars}>
              {story.scenes.map((s, i) => (
                <View key={s.id} style={st.barTrack}>
                  <View style={[st.barFill, { width: i < si ? '100%' : i > si ? '0%' : `${((li + 1) / scene.lines.length) * 100}%` }]} />
                </View>
              ))}
            </View>
            <View style={st.topRow}>
              <SceneTitle key={scene.id} text={scene.title} index={si + 1} />
              <View style={{ flexDirection: 'row' }}>
                <IconButton label={muted ? 'குரலை இயக்கு' : 'குரலை நிறுத்து'} onPress={() => setMuted((m) => !m)}>
                  {Icons.speaker(C.cream, muted)}
                </IconButton>
                <IconButton label="மூடு" onPress={() => router.back()}>
                  {Icons.close()}
                </IconButton>
              </View>
            </View>
            {voiceNote && (
              <View style={st.note}>
                <Text style={st.noteText}>இந்தச் சாதனத்தில் தமிழ்க் குரல் இல்லை — உரை மட்டும் காட்டப்படும்.</Text>
              </View>
            )}
          </View>

          <View pointerEvents="none" style={[st.subWrap, { paddingBottom: insets.bottom + 36 }]}>
            <Subtitle key={`${si}-${li}`} text={scene.lines[li]} />
          </View>

          {paused && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, st.center]}>
              <View style={st.pausedDisc}>{Icons.play(C.goldLight, 30)}</View>
              <Text style={[st.sub, { marginTop: 14 }]}>இடைநிறுத்தப்பட்டது</Text>
            </View>
          )}
        </>
      )}

      {phase === 'intro' && (
        <View style={[StyleSheet.absoluteFill, st.introBg]}>
          <View style={[st.introTop, { paddingTop: insets.top + 8 }]}>
            <IconButton label="பின்செல்" onPress={() => router.back()}>
              {Icons.back()}
            </IconButton>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 28, gap: 10 }}>
            <Text style={st.kicker}>{story.purana}</Text>
            <Text style={st.title}>{story.title}</Text>
            <Text style={st.sub}>{story.subtitle} · {story.minutes} நிமிடம்</Text>
            <Text style={st.src}>{story.source}</Text>
            <GoldButton label="சரிதத்தைத் தொடங்கு" icon={Icons.play()} onPress={start} style={{ marginTop: 10 }} />
            {saved?.id === story.id && !saved.completed && (saved.scene > 0 || saved.line > 0) && (
              <GoldButton label={`விட்ட இடத்திலிருந்து தொடருங்கள் · காட்சி ${saved.scene + 1}`} outline icon={Icons.play()} onPress={() => {
                const sceneIndex = Math.max(0, Math.min(saved.scene, story.scenes.length - 1));
                setSi(sceneIndex);
                setLi(0);
                setPaused(false); void start();
              }} />
            )}
            <Text style={st.hint}>இடப்புறம் தொட்டால் முந்தையது · நடுவில் இடைநிறுத்தம் · வலப்புறம் அடுத்தது</Text>
          </View>
        </View>
      )}

      {phase === 'ended' && (
        <View style={[StyleSheet.absoluteFill, st.introBg, st.center, { paddingHorizontal: 24 }]}>
          <Text style={st.kicker}>சரிதம் நிறைவு</Text>
          <Text style={[st.title, { textAlign: 'center' }]}>{story.scenes[story.scenes.length - 1].title}</Text>
          <Text style={[st.sub, { textAlign: 'center', marginBottom: 26 }]}>இப்போது சுலோகம், பொருள், ஞானம் — பிறகு உங்களுக்கான ஒரு சிறிய பயிற்சி.</Text>
          <GoldButton label="சுலோகமும் பொருளும்" icon={Icons.arrow(C.ink)} onPress={() => router.replace(`/stories/${story.id}/learn`)} style={{ alignSelf: 'stretch' }} />
          <GoldButton label="மீண்டும் பார்க்க" outline icon={Icons.reset()} onPress={restart} style={{ alignSelf: 'stretch', marginTop: 12 }} />
        </View>
      )}
    </View>
  );
}

function Subtitle({ text }: { text: string }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, [v]);
  return (
    <Animated.Text
      accessibilityLiveRegion="polite"
      style={[st.subtitle, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
      {text}
    </Animated.Text>
  );
}

function SceneTitle({ text, index }: { text: string; index: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: native }),
      Animated.delay(2600),
      Animated.timing(v, { toValue: 0.55, duration: 900, useNativeDriver: native }),
    ]).start();
  }, [v]);
  return (
    <Animated.View style={{ opacity: v, flexShrink: 1 }}>
      <Text style={st.sceneNo}>காட்சி {index}</Text>
      <Text style={st.sceneTitle}>{text}</Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 14 },
  bars: { flexDirection: 'row', gap: 4 },
  barTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.goldLight },
  topRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sceneNo: { fontFamily: F.ta, fontSize: 11, color: C.muted, letterSpacing: 1 },
  sceneTitle: { fontFamily: F.taBold, fontSize: 18, color: C.goldLight, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 8 },
  subWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22 },
  subtitle: {
    fontFamily: F.taSemi,
    fontSize: 19,
    lineHeight: 33,
    color: '#fff8ea',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 1 },
  },
  pausedDisc: { width: 76, height: 76, borderRadius: 38, borderWidth: 1.5, borderColor: C.gold, backgroundColor: 'rgba(7,11,20,0.55)', alignItems: 'center', justifyContent: 'center', paddingLeft: 5 },
  introBg: { backgroundColor: 'rgba(5,7,14,0.45)' },
  introTop: { paddingHorizontal: 12 },
  kicker: { fontFamily: F.ta, fontSize: 13, color: C.gold, letterSpacing: 1.5 },
  title: { fontFamily: F.taBold, fontSize: 34, lineHeight: 50, color: C.cream, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 12 },
  sub: { fontFamily: F.ta, fontSize: 15, lineHeight: 25, color: '#eadfc6' },
  src: { fontFamily: F.ta, fontSize: 11.5, lineHeight: 19, color: 'rgba(234,223,198,0.75)' },
  hint: { fontFamily: F.ta, fontSize: 11.5, color: 'rgba(234,223,198,0.7)', textAlign: 'center', marginTop: 6 },
  note: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(7,11,20,0.75)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.panelLine },
  noteText: { fontFamily: F.ta, fontSize: 12, color: C.cream },
});
