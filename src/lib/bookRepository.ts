import type { BookText } from '../content/books';

export type BookStorage = { read(id: string): Promise<string | null>; write(id: string, text: string): Promise<void> };
export type LoadedBook = { book: BookText; offline: boolean };
export function validateBook(value: unknown, id: string, count: number): BookText {
  const book = value as BookText | null;
  if (!book || book.id !== id || typeof book.title !== 'string' || book.sourcePages !== count || !Array.isArray(book.pages) || book.pages.length !== count ||
    book.pages.some((page, index) => !page || page.number !== index + 1 || typeof page.text !== 'string' || typeof page.reviewed !== 'boolean' ||
      !(page.confidence === null || (Number.isFinite(page.confidence) && page.confidence >= 0 && page.confidence <= 100)))) {
    throw new Error('நூலின் தரவு முழுமையாக இல்லை. மீண்டும் முயலுங்கள்.');
  }
  return book;
}
export function createBookRepository(storage: BookStorage, download: (id: string) => Promise<unknown>) {
  const pending = new Map<string, Promise<LoadedBook>>();
  return (id: string, count: number): Promise<LoadedBook> => {
    const existing = pending.get(id);
    if (existing) return existing;
    const task = (async () => {
      try {
        const cached = await storage.read(id);
        if (cached) return { book: validateBook(JSON.parse(cached), id, count), offline: true };
      } catch { /* Corrupt or unreadable cache: try a complete download. */ }
      const book = validateBook(await download(id), id, count);
      let offline = false;
      try { await storage.write(id, JSON.stringify(book)); offline = true; } catch { /* Reading still works when storage is full. */ }
      return { book, offline };
    })();
    pending.set(id, task);
    void task.finally(() => { pending.delete(id); }).catch(() => {});
    return task;
  };
}
