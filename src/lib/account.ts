import type { Session } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { AppState, Linking } from 'react-native';
import { authReturnCode } from './authLinks';
import { connectProgress, syncProgress } from './progressSync';
import { supabase } from './supabase';

type Account = { ready: boolean; session: Session | null; recovery: boolean; linkMessage?: string };
let state: Account = { ready: false, session: null, recovery: false };
const listeners = new Set<(value: Account) => void>();
let user: string | null | undefined;
function accept(session: Session | null, recovery = state.recovery) {
  state = { ...state, ready: true, session, recovery: !!session && recovery }; listeners.forEach(fn => fn(state));
  const id = session?.user.id ?? null;
  if (user !== id) { user = id; void connectProgress(id); }
}
export function finishPasswordRecovery() { accept(state.session, false); }
let exchanging: string | null = null;
async function handleLink(url: string) {
  const code = authReturnCode(url);
  if (!code || !supabase || exchanging === code) return;
  exchanging = code;
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    state = { ...state, linkMessage: error ? 'இந்த இணைப்பு காலாவதியாகியிருக்கலாம் அல்லது வேறு சாதனத்தில் கோரப்பட்டிருக்கலாம். இதே சாதனத்தில் புதிய இணைப்பைக் கோருங்கள்.' : 'மின்னஞ்சல் இணைப்பு ஏற்கப்பட்டது.' };
  } catch { state = { ...state, linkMessage: 'இணைப்பை ஏற்க முடியவில்லை. இணைய இணைப்பைப் பார்த்து மீண்டும் முயலுங்கள்.' }; }
  finally { exchanging = null; listeners.forEach(fn => fn(state)); }
}
/** Mounted once at the root; auth callbacks never await another auth call. */
export function startAccount() {
  const client = supabase;
  if (!client) { accept(null); return () => {}; }
  let alive = true;
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (alive) accept(session, event === 'PASSWORD_RECOVERY' ? true : state.recovery);
  });
  const links = Linking.addEventListener('url', event => { void handleLink(event.url); });
  void Linking.getInitialURL().then(url => { if (alive && url) void handleLink(url); }).catch(() => {});
  const subscription = AppState.addEventListener('change', value => {
    if (value === 'active') { client.auth.startAutoRefresh(); void syncProgress(); }
    else client.auth.stopAutoRefresh();
  });
  client.auth.startAutoRefresh();
  const retry = setInterval(() => { if (AppState.currentState === 'active') void syncProgress(); }, 60000);
  return () => { alive = false; data.subscription.unsubscribe(); subscription.remove(); links.remove(); clearInterval(retry); client.auth.stopAutoRefresh(); };
}
export function useAccount() {
  return useSyncExternalStore(callback => { listeners.add(callback); return () => { listeners.delete(callback); }; }, () => state, () => state);
}
export function authMessage(error: { code?: string; message?: string }) {
  if (error.code === 'invalid_credentials') return 'மின்னஞ்சல் அல்லது கடவுச்சொல் சரியாக இல்லை.';
  if (error.code === 'email_not_confirmed') return 'மின்னஞ்சலில் வந்த இணைப்பைத் திறந்து கணக்கை உறுதிசெய்த பிறகு உள்நுழையுங்கள்.';
  if (error.code === 'user_already_exists') return 'இந்த மின்னஞ்சலுக்கு ஏற்கெனவே கணக்கு உள்ளது. உள்நுழையுங்கள்.';
  if (error.code === 'weak_password') return 'வலுவான கடவுச்சொல்லைத் தேர்ந்தெடுங்கள்; குறைந்தது 8 எழுத்துகள் தேவை.';
  if (error.code?.includes('rate_limit') || error.code === 'over_email_send_rate_limit') return 'பல முயற்சிகள் செய்யப்பட்டுள்ளன. சிறிது நேரம் கழித்து மீண்டும் முயலுங்கள்.';
  if (error.code === 'email_address_not_authorized') return 'கணக்கிற்கான மின்னஞ்சல் அனுப்பும் சேவை இன்னும் அமைக்கப்படவில்லை. ஏற்கெனவே உள்ள கணக்கில் உள்நுழையலாம்.';
  return 'இப்போது கணக்குச் சேவையை அணுக முடியவில்லை. இணைய இணைப்பைப் பார்த்து மீண்டும் முயலுங்கள்.';
}
