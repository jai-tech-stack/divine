import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authMessage, finishPasswordRecovery, useAccount } from '@/lib/account';
import { importGuestProgress, syncProgress, useSyncStatus } from '@/lib/progressSync';
import { supabase } from '@/lib/supabase';
import { C, F } from '@/theme';

const SYNC = {
  guest: 'இந்தச் சாதனத்தில் முன்னேற்றம் சேமிக்கப்படுகிறது.',
  loading: 'உங்கள் முன்னேற்றத்தைத் திறக்கிறோம்…',
  pending: 'மாற்றங்கள் சாதனத்தில் உள்ளன; ஒத்திசைக்கக் காத்திருக்கின்றன.',
  syncing: 'முன்னேற்றம் ஒத்திசைக்கப்படுகிறது…',
  synced: 'உங்கள் முன்னேற்றம் கணக்கிலும் சேமிக்கப்பட்டுள்ளது.',
  offline: 'மாற்றங்கள் சாதனத்தில் உள்ளன. இணையம் கிடைத்ததும் மீண்டும் ஒத்திசைக்கப்படும்.',
};

export default function AccountScreen() {
  const inset = useSafeAreaInsets();
  const account = useAccount();
  const sync = useSyncStatus();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const back = () => router.canGoBack() ? router.back() : router.replace('/');
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch { setMessage('இப்போது சேவையை அணுக முடியவில்லை. மீண்டும் முயலுங்கள்.'); }
    finally { setBusy(false); }
  };
  const credentials = async () => {
    if (!supabase) { setMessage('கணக்குச் சேவை இன்னும் இணைக்கப்படவில்லை. கணக்கின்றியும் தொடர்ந்து பயன்படுத்தலாம்.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்.'); return; }
    if (!password || (mode === 'signup' && password.length < 8)) { setMessage('குறைந்தது 8 எழுத்துகள் கொண்ட கடவுச்சொல்லை உள்ளிடுங்கள்.'); return; }
    if (mode === 'signup' && password !== confirmation) { setMessage('இரண்டு கடவுச்சொற்களும் ஒன்றாக இருக்க வேண்டும்.'); return; }
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: 'divinelife://account' } });
    if (result.error) { setMessage(authMessage(result.error)); return; }
    setPassword(''); setConfirmation('');
    if (!result.data.session) {
      setAwaitingEmail(true); setMode('signin');
      setMessage('மின்னஞ்சலில் வரும் உறுதிப்படுத்தும் இணைப்பைத் திறந்த பிறகு இங்கே உள்நுழையுங்கள். வரவில்லை என்றால் தேவையற்ற அஞ்சல் பகுதியையும் பாருங்கள்.');
    }
  };
  const button = (label: string, onPress: () => void, secondary = false, disabled = false) => (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || disabled }} disabled={busy || disabled} onPress={onPress}
      style={[st.button, secondary && st.secondary, (busy || disabled) && { opacity: 0.5 }]}>
      <Text style={[st.buttonText, secondary && { color: C.gold }]}>{label}</Text>
    </Pressable>
  );
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.night }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[st.header, { paddingTop: inset.top + 12 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="பின்செல்" hitSlop={12} onPress={back}><Ionicons name="arrow-back" size={25} color={C.gold} /></Pressable>
        <Text style={st.title}>எனது ஆன்மிகப் பயணம்</Text><View style={{ width: 25 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: inset.bottom + 32, gap: 18 }}>
        {!account.ready ? <ActivityIndicator color={C.gold} accessibilityLabel="கணக்கைத் திறக்கிறோம்" /> : account.session ? <>
          {account.recovery && <View style={st.card}>
            <Text style={st.heading}>புதிய கடவுச்சொல்</Text>
            <Text style={st.body}>இந்தக் கணக்கிற்கு புதிய கடவுச்சொல்லை அமைக்கலாம்.</Text>
            <TextInput accessibilityLabel="புதிய கடவுச்சொல்" style={st.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" editable={!busy} />
            <TextInput accessibilityLabel="புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடுங்கள்" style={st.input} value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" editable={!busy} />
            {button('புதிய கடவுச்சொல்லைச் சேமி', () => void run(async () => {
              if (password.length < 8 || password !== confirmation) { setMessage('குறைந்தது 8 எழுத்துகள் கொண்ட ஒரே கடவுச்சொல்லை இருமுறையும் உள்ளிடுங்கள்.'); return; }
              const result = await supabase?.auth.updateUser({ password });
              if (result?.error) { setMessage(authMessage(result.error)); return; }
              setPassword(''); setConfirmation(''); finishPasswordRecovery(); setMessage('புதிய கடவுச்சொல் சேமிக்கப்பட்டது.');
            }))}
          </View>}
          <View style={st.card}>
            <Ionicons name="person-circle-outline" size={48} color={C.gold} />
            <Text style={st.heading}>உங்கள் கணக்கு</Text>
            <Text style={st.email} selectable>{account.session.user.email}</Text>
            <Text style={st.body} accessibilityLiveRegion="polite">{SYNC[sync.phase]}</Text>
            {sync.at && <Text style={st.note}>கடைசியாக: {new Date(sync.at).toLocaleString('ta-IN')}</Text>}
            {button('இப்போது ஒத்திசை', () => void run(syncProgress), false, sync.phase === 'loading' || sync.phase === 'syncing')}
          </View>
          <View style={st.card}>
            <Text style={st.heading}>கணக்கின்றிச் செய்த பயிற்சிகள்</Text>
            <Text style={st.body}>இந்தச் சாதனத்தில் முன்பு கணக்கின்றிச் செய்த வாசிப்பையும் ஜபத்தையும் இந்தக் கணக்கில் சேர்க்கலாம். வேறு கணக்கின் முன்னேற்றம் சேர்க்கப்படாது.</Text>
            {button('சாதன முன்னேற்றத்தைச் சேர்க்கவும்', () => void run(async () => { await importGuestProgress(); setMessage('சாதன முன்னேற்றம் சேர்க்கப்பட்டது. மேலே ஒத்திசைவு நிலையைக் காணலாம்.'); }), true, sync.phase === 'loading')}
          </View>
          {button('கணக்கிலிருந்து வெளியேறு', () => void run(async () => {
            const result = await supabase?.auth.signOut({ scope: 'local' });
            if (result?.error) setMessage(authMessage(result.error));
          }), true)}
          <Text style={st.note}>வெளியேறினாலும் இந்தக் கணக்கின் சேமிப்புகள் அழியாது. மீண்டும் இதே கணக்கில் நுழைந்து தொடரலாம்.</Text>
        </> : <>
          <View style={st.card}>
            <Text style={st.heading}>விட்ட இடத்திலிருந்து தொடருங்கள்</Text>
            <Text style={st.body}>கீதை, நூல் வாசிப்பு, விருப்ப மந்திரங்கள், ஜபம் மற்றும் தினசரி பயிற்சிகளை உங்கள் கணக்கில் சேமித்து மற்றொரு சாதனத்திலும் தொடரலாம்.</Text>
            <Text style={st.label}>மின்னஞ்சல்</Text>
            <TextInput accessibilityLabel="மின்னஞ்சல்" style={st.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!busy} />
            <Text style={st.label}>கடவுச்சொல்</Text>
            <View style={st.passwordRow}>
              <TextInput accessibilityLabel="கடவுச்சொல்" style={[st.input, { flex: 1 }]} value={password} onChangeText={setPassword} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} editable={!busy} />
              <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'கடவுச்சொல்லை மறை' : 'கடவுச்சொல்லைக் காட்டு'} hitSlop={10} onPress={() => setVisible(!visible)}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={24} color={C.gold} /></Pressable>
            </View>
            {mode === 'signup' && <><Text style={st.label}>கடவுச்சொல்லை மீண்டும் உள்ளிடுங்கள்</Text><TextInput accessibilityLabel="கடவுச்சொல்லை மீண்டும் உள்ளிடுங்கள்" style={st.input} value={confirmation} onChangeText={setConfirmation} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" editable={!busy} /></>}
            {button(mode === 'signup' ? 'புதிய கணக்கு உருவாக்கு' : 'உள்நுழை', () => void run(credentials), false, !supabase)}
            {button(mode === 'signup' ? 'ஏற்கெனவே கணக்கு உள்ளது' : 'புதிய கணக்கு உருவாக்கு', () => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }, true)}
            {mode === 'signin' && button('கடவுச்சொல் மறந்துவிட்டதா?', () => void run(async () => {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('முதலில் உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்.'); return; }
              const result = await supabase?.auth.resetPasswordForEmail(email.trim(), { redirectTo: 'divinelife://account' });
              setMessage(result?.error ? authMessage(result.error) : 'இந்த முகவரிக்குக் கணக்கு இருந்தால் மீட்பு இணைப்பு மின்னஞ்சலில் வரும். இதே சாதனத்தில் இணைப்பைத் திறந்து புதிய கடவுச்சொல்லை அமைக்கலாம்.');
            }), true)}
            {awaitingEmail && button('உறுதிப்படுத்தும் மின்னஞ்சலை மீண்டும் அனுப்பு', () => void run(async () => {
              const result = await supabase?.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: 'divinelife://account' } });
              setMessage(result?.error ? authMessage(result.error) : 'மின்னஞ்சலைப் பார்த்து கணக்கை உறுதிசெய்யுங்கள்.');
            }), true)}
          </View>
          {button('கணக்கின்றித் தொடருங்கள்', back, true)}
          <Text style={st.note}>கணக்கின்றியும் செயலியைப் பயன்படுத்தலாம். அந்த முன்னேற்றம் இந்தச் சாதனத்தில் மட்டும் இருக்கும்.</Text>
        </>}
        {button('இஷ்ட தெய்வத்தைத் தேர்ந்தெடு', () => router.push('/deity'), true)}
        {busy && <ActivityIndicator color={C.gold} />}
        {!!message && <Text accessibilityLiveRegion="polite" style={st.message}>{message}</Text>}
        {!!account.linkMessage && <Text accessibilityLiveRegion="polite" style={st.message}>{account.linkMessage}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { flex: 1, textAlign: 'center', fontFamily: F.taBold, fontSize: 19, lineHeight: 32, color: C.gold },
  card: { backgroundColor: C.panel, borderColor: C.panelLine, borderWidth: 1, borderRadius: 20, padding: 18, gap: 14 },
  heading: { fontFamily: F.taBold, fontSize: 18, lineHeight: 30, color: C.cream },
  body: { fontFamily: F.ta, fontSize: 14, lineHeight: 25, color: C.cream },
  label: { fontFamily: F.taSemi, fontSize: 14, color: C.gold, lineHeight: 24 },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: C.panelLine, padding: 12, color: C.cream, fontSize: 17, backgroundColor: C.night },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: { minHeight: 50, backgroundColor: C.gold, padding: 13, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.panelLine },
  buttonText: { fontFamily: F.taSemi, fontSize: 14, lineHeight: 25, color: C.ink, textAlign: 'center' },
  email: { fontSize: 16, color: C.cream, lineHeight: 25 },
  note: { fontFamily: F.ta, fontSize: 12, lineHeight: 23, color: C.muted },
  message: { fontFamily: F.taSemi, fontSize: 14, lineHeight: 26, color: C.gold, padding: 12 },
});
