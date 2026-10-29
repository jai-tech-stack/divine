/** Only our exact mobile callback is accepted. Never log links containing codes. */
export function authReturnCode(link: string): string | null {
  try {
    const url = new URL(link);
    if (url.protocol !== 'divinelife:' || url.hostname !== 'account' || !['', '/'].includes(url.pathname)) return null;
    const code = url.searchParams.get('code');
    return code && code.length <= 2048 ? code : null;
  } catch { return null; }
}
