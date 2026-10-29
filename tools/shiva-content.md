# Shiva collection

Edit `shiva_src.json` (Sanskrit/Hindi) and `shiva_tamil_src.json` (Tamil originals), then run:

```
node tools/ganesha-build.mjs shiva
node tools/check-shiva.mjs
npx expo lint
npx tsc --noEmit
```

The shared static builder keeps transliteration work off the phone. Entries flow through the existing Shiva category, search, reader, meanings, favourites and source links. No new packages or native APIs.

## Scope and editorial choices

- All 16 requested titles (both Panchakshara and Pancharatna), plus Vasishta's Daridrya Dahana and the Matsya Purana deva/danava hymn.
- Full 95-line Sivapuranam, grouped in 19 reading blocks of five lines; these blocks are not original verse divisions.
- Explicit selections: the first verse each from Sambandar 1.001, Appar 4.011 and Sundarar 7.001; two Tirumular verses; Sivavakkiyam 2, 3 and 6. These are clearly labelled excerpts, not the entire Tamil Shaiva canon.
- Bhairav Aarti is the traditional Hindi `Jai Bhairav Deva`, seven stanzas with the first refrain repeated as desired. The closing stanza names Dharanidhar; earliest edition and historical authorship are not asserted. Tamil and Latin readings are supplied manually for Hindi pronunciation. `sa` remains the legacy storage key for Devanagari; the reader's script label now accurately says Devanagari.
- Traditional attribution is distinguished from verified historical authorship. Pancharatna's colophon attribution is qualified. Jyotirlinga geography is not turned into disputed map locations.
- Text variants are not mixed indiscriminately: Tandava uses the 17-verse edition; Dakshinamurti uses the ten core verses without supplementary prayers. Jyotirlinga uses the documented `vasudhavakashe` variant in its first verse, replacing a damaged source reading.
- The devotional originals are ancient/traditional texts. Modern site explanations, translations and recordings are not copied. Tamil meanings are newly written concise paraphrases, awaiting specialist language/religious review, not a scholarly edition. Reading days and practices are optional devotional suggestions; phalashruti claims are presented as beliefs, not promised medical, financial or other outcomes.
- Each entry links its consulted source edition. Tamil originals keep an empty Devanagari field and fall back to Tamil in that script setting.
