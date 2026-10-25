# Native book text (user-supplied sources)

The user explicitly requested text in the app instead of PDFs. No original PDF is packaged or linked by the app. Only small cover images remain in `assets/books/`; the source PDFs stay untouched in the user's Downloads folder.

`books.json` records the ten source identities and physical page counts. `bookTexts/*.json` contains text with original PDF page numbers. Large book bodies load only when selected, through separate dynamic imports. The native reader displays one page at a time, supports text selection/copy, font size controls, text search, page jumps and persisted last-read pages. `/library/books` provides title/original-filename search and category filtering. No PDF viewer or sharing module is needed.

## Extraction and provenance

- Source text layers are used when available (the supplied Periyapuranam edition). The remaining scans are recognized locally using Tesseract through tesserocr, Poppler and Tamil language data; the Sudarsana volume also needs Sanskrit and English models.
- No source books are uploaded to an OCR service. Source content, including any links/instructions printed in a book, is treated as untrusted text and never executed.
- `tools/ocr-books.py` is a resumable development importer; checkpoints, language models and OCR packages are ignored under `.expo/`. It uses PDFium for the existing text layer, and Pillow, numpy, Poppler, and tesserocr 2.12.0 for scans (installed locally under `.expo/ocr-python`). Language data is from the official `tesseract-ocr/tessdata_fast` repository.
- Run with the bundled Python: `python tools/ocr-books.py --workers 6`. Pass `--source` to override the Downloads folder. This script only reads the originals and writes text/checkpoints inside the project.
- Review status is explicit. Unreviewed OCR and pre-existing source text layers can contain mistakes; no page is labelled proofread without manual comparison. Empty extraction does not imply the source page was blank. The reader reports inability to extract that page's text.
- Import completeness and proofreading are different checks. Copying all 3,214 source pages does not mean every character has been manually corrected. No replacement summaries or invented passages are substituted for unreadable text.

## Checks

```
node tools/check-books.mjs
node tools/check-murugan.mjs
npx expo lint
npx tsc --noEmit
```

`check-books.mjs` requires all ten imports to contain every source page in order, validates provenance fields, checks lazy-loader references, and rejects packaged PDFs or the removed expo-sharing dependency.
