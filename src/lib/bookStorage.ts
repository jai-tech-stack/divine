import { Directory, File, Paths } from 'expo-file-system';
import type { BookStorage } from './bookRepository';

const directory = () => new Directory(Paths.document, 'devotional-books-v1');
export const bookStorage: BookStorage = {
  async read(id) {
    const file = new File(directory(), `${id}.json`);
    return file.exists ? file.text() : null;
  },
  async write(id, text) {
    const folder = directory();
    folder.create({ idempotent: true, intermediates: true });
    const temporary = new File(folder, `${id}.partial`);
    await temporary.write(text);
    const destination = new File(folder, `${id}.json`);
    if (destination.exists) destination.delete();
    temporary.move(destination);
  },
};
