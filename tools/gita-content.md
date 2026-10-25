# Bhagavad Gita text review

The supplied video was inspected locally. The reader now starts with the Tamil meaning and the speaker; the Sanskrit original in Tamil script is an optional expanded reading. Noto Serif Tamil is already bundled in regular, semibold and bold. Long passages scroll within each step, including at increased text sizes.

Source edition: https://sanskritdocuments.org/doc_giitaa/bhagvadnew.html
The traditional Sanskrit text is public domain. `gita-originals.json` stores the selected source reading without site annotations or editorial variants. Chapter 13's opening question remains 13.0 in this app, matching the existing notes and routes; source 13.1–35 maps to app 13.0–34. The total remains 701 including that question.

The older dataset contained malformed vowel signs, spurious nuktas, misspelled words, omitted Om in 17.23 and a truncated final word in 17.25. The readings were rebuilt from the selected edition with `node tools/ganesha-build.mjs gita`. Edition variants are not all spelling mistakes.

Tamil meanings and explanatory notes are the app's own paraphrases, not a verbatim traditional commentary. This source-text audit does not constitute a complete scholarly review of every Tamil explanatory note. `node tools/check-gita.mjs` validates chapter counts, order, complete readings and concrete spelling regressions.
