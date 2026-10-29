# Additional original devotional works

25 works / 260 reading units are added in `devotional.json`. Original Sanskrit or Tamil text is separate from the app's own short Tamil paraphrase. This finite selection is not an exhaustive canon of every hymn or all Siddhar/Alvar literature. Unknown authors and conventional attributions are explicitly identified; no unverified Siddhar attribution is invented. Adi Shankara and Shankaracharya are treated as the same traditional attribution.

Source readings and reference URLs are retained in `devotional_src.json`. Build with `node tools/ganesha-build.mjs devotional`; check with `node tools/check-devotional.mjs`. The first-verse-only Lakshmi seed is replaced using its existing route `lakshmi-namastestu`, preserving saved links. Kalabhairava's existing two texts are discoverable in their own category without duplicating the underlying works. The existing Murugan collection is retained.

Completeness boundaries:

- Alvars: complete Tiruppallandu (12), Tiruppavai (30), Tiruppalliezhuchi (10), Amalan Adipiran (10), and Kanninun Siruthambu (11), grouped as Alvar Arulicheyal. Native Tamil originals are not assigned Sanskrit originals. Sources are Project Madurai `pmuni0005_01.html` and `pmuni0005_02.html`; the edition's detached `சொன்ன` note in Tiruppavai 30 is restored to `கோதை சொன்ன` in reading order, and headings/taniyans after each final verse are excluded.

- Kali: three dhyana verses and all eight ashtaka verses, in separately numbered sections.
- Dattatreya: one dhyana and all 18 stotra verses; the source itself says its exact location in Narada Purana is unknown, so the app discloses that limitation.
- Narayaneeyam: the complete 11-verse **dasakam 100**, not the entire Narayaneeyam. The newer `nArAyaNIyam.html` edition is used because the older `narayaniya.html` transcription contains spelling defects.
- Durga: the 32-name garland and its following phalashruti/recitation notes (14 numbered units). The four introductory dialogue verses of the chapter are not included; this is stated in the entry.
- Annapurna: the common 12-verse version (ten main verses plus two concluding prayers). The source's three additional variant verses are not silently combined with this version.
- Krishna: the complete “bhaje vrajaika” ashtaka and its concluding verse. The separate Krishna Tandava on the same source page is not part of this entry. Modern English translations on source pages are excluded.
- Guruvatapurisha Pancharatnam attributed to the twentieth-century Anantharama Dikshitar was inspected but is not reproduced; Narayaneeyam is used for the Guruvayur category instead.

Traditional original works are public-domain texts. Source editions: Sanskrit Documents (volunteer transcriptions, each linked individually) and Project Madurai for Tiruppallandu. Project Madurai acknowledgement: Dr. K. Kalyanasundaram prepared the electronic text, first published in Inaimathi/Mylai in 1998, TSCII in 1999, later Unicode; © Project Madurai, 1998–2021, an open voluntary initiative to distribute Tamil literary texts. The original source header is retained in the development source download and the app credits and links its edition; modern translations are not reproduced.

Editorial normalization removes HTML, variant notes, modern prose, zero-width controls, line-continuation hyphens and printed verse numbers. The Achyuta transcription's `रुक्मिणिऱागिणे` is normalized to `रुक्मिणीरागिणे`; readings retain the intended Rukmini name. Selected source editions may have traditional textual variants. Tamil meanings are short explanatory paraphrases, not original mantras or a certified scholarly commentary. Phalashruti claims are labelled as traditional claims. Ritual prescriptions in the source are described, not converted into mandatory app instructions.

The latest user request explicitly asks for Tamil and Sanskrit. The mantra reader therefore offers a local “சம்ஸ்கிருத மூலமும் காட்டு” toggle alongside Tamil readings and meanings. Tamil originals do not acquire an invented Sanskrit version; Hindi originals are not relabelled Sanskrit. The Gita and general Tamil-only interface preferences remain as previously requested.
