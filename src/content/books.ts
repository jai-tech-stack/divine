import type { ImageSourcePropType } from 'react-native';

export type Book = { id: string; title: string; category: string; originalFilename: string; pages: number; note?: string; cover: ImageSourcePropType };
export type BookPage = { number: number; text: string; confidence: number | null; reviewed: boolean };
export type BookText = { id: string; title: string; sourcePages: number; method: string; reviewStatus: string; pages: BookPage[] };
const covers: Record<string, ImageSourcePropType> = {
  'eighteen-puranas': require('../../assets/books/eighteen-puranas.jpg'),
  'nayanmar-stories': require('../../assets/books/nayanmar-stories.jpg'),
  periyapuranam: require('../../assets/books/periyapuranam.jpg'),
  'bogar-7000-3': require('../../assets/books/bogar-7000-3.jpg'),
  'bogar-7000-2': require('../../assets/books/bogar-7000-2.jpg'),
  'siddhar-yoga': require('../../assets/books/siddhar-yoga.jpg'),
  'sudarsana-satakam': require('../../assets/books/sudarsana-satakam.jpg'),
  'chakravarthi-thirumagan': require('../../assets/books/chakravarthi-thirumagan.jpg'),
  'bhagavata-puranam': require('../../assets/books/bhagavata-puranam.jpg'),
  kakapujandar: require('../../assets/books/kakapujandar.jpg'),
};
const loaders: Record<string, () => Promise<{ default: BookText }>> = {
  'eighteen-puranas': () => import('./bookTexts/eighteen-puranas.json'),
  'nayanmar-stories': () => import('./bookTexts/nayanmar-stories.json'),
  periyapuranam: () => import('./bookTexts/periyapuranam.json'),
  'bogar-7000-3': () => import('./bookTexts/bogar-7000-3.json'),
  'bogar-7000-2': () => import('./bookTexts/bogar-7000-2.json'),
  'siddhar-yoga': () => import('./bookTexts/siddhar-yoga.json'),
  'sudarsana-satakam': () => import('./bookTexts/sudarsana-satakam.json'),
  'chakravarthi-thirumagan': () => import('./bookTexts/chakravarthi-thirumagan.json'),
  'bhagavata-puranam': () => import('./bookTexts/bhagavata-puranam.json'),
  kakapujandar: () => import('./bookTexts/kakapujandar.json'),
};
export const BOOKS: Book[] = (require('./books.json') as Omit<Book, 'cover'>[]).map(book => ({ ...book, cover: covers[book.id] }));
export const BOOK_CATEGORIES = ['அனைத்தும்', ...new Set(BOOKS.map(book => book.category))];
export async function loadBook(id: string): Promise<BookText> {
  const load = loaders[id];
  if (!load) throw new Error('Unknown book');
  return (await load()).default;
}
