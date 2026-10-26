import type { BookStorage } from './bookRepository';
const cacheName = 'divine-life-books-v1';
const address = (id: string) => new URL(`/offline-books/${encodeURIComponent(id)}.json`, window.location.origin).href;
export const bookStorage: BookStorage = {
  async read(id) {
    const response = await (await caches.open(cacheName)).match(address(id));
    return response ? response.text() : null;
  },
  async write(id, text) {
    await (await caches.open(cacheName)).put(address(id), new Response(text, { headers: { 'Content-Type': 'application/json' } }));
  },
};
