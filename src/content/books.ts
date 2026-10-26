import { ART } from '@/content/artwork';
import { createBookRepository, type LoadedBook } from '../lib/bookRepository';
import { bookStorage } from '../lib/bookStorage';
import type { ImageSourcePropType } from 'react-native';

export type Book = { id: string; title: string; category: string; originalFilename: string; pages: number; note?: string; cover: ImageSourcePropType };
export type BookPage = { number: number; text: string; confidence: number | null; reviewed: boolean };
export type BookText = { id: string; title: string; sourcePages: number; method: string; reviewStatus: string; pages: BookPage[] };
const covers: Record<string, ImageSourcePropType> = {
  'eighteen-puranas': ART['books/eighteen-puranas'],
  'nayanmar-stories': ART['books/nayanmar-stories'],
  periyapuranam: ART['books/periyapuranam'],
  'bogar-7000-3': ART['books/bogar-7000-3'],
  'bogar-7000-2': ART['books/bogar-7000-2'],
  'siddhar-yoga': ART['books/siddhar-yoga'],
  'sudarsana-satakam': ART['books/sudarsana-satakam'],
  'chakravarthi-thirumagan': ART['books/chakravarthi-thirumagan'],
  'bhagavata-puranam': ART['books/bhagavata-puranam'],
  kakapujandar: ART['books/kakapujandar'],
};
export const BOOKS: Book[] = (require('./books.json') as Omit<Book, 'cover'>[]).map(book => ({ ...book, cover: covers[book.id] }));
export const BOOK_CATEGORIES = ['அனைத்தும்', ...new Set(BOOKS.map(book => book.category))];
const repository = createBookRepository(bookStorage, async id => {
  const origin = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!origin || !key) throw new Error('நூல்கள் இணைப்பு அமைக்கப்படவில்லை.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${origin}/rest/v1/content_documents?kind=eq.book&id=eq.${encodeURIComponent(id)}&select=document`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: controller.signal,
    });
    if (!response.ok) throw new Error('நூலைப் பதிவிறக்க முடியவில்லை.');
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length !== 1) throw new Error('நூல் கிடைக்கவில்லை.');
    return rows[0].document;
  } finally { clearTimeout(timer); }
});
export async function loadBook(id: string): Promise<LoadedBook> {
  const meta = BOOKS.find(book => book.id === id);
  if (!meta) throw new Error('நூல் கிடைக்கவில்லை.');
  return repository(id, meta.pages);
}
