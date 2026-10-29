import * as Crypto from 'expo-crypto';

// The auth SDK expects WebCrypto for PKCE. Hermes does not supply that API;
// use Expo's native secure randomness and SHA-256 instead of SDK fallbacks.
if (!globalThis.crypto?.getRandomValues || !globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    getRandomValues: Crypto.getRandomValues,
    randomUUID: Crypto.randomUUID,
    subtle: { digest: (algorithm: string | { name: string }, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name !== 'SHA-256') throw new Error('Unsupported authentication digest');
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
    } },
  } });
}
