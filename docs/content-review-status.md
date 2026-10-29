# Content review status

## Source comparison

- All 64 story records have an explicit source citation and `sourceReviewed` status. “Reviewed” means the retelling was compared with the cited source pages; it is not a critical-edition or specialist theological certification.
- The Prithu retelling was compared with the supplied *Pathinenn Puranangal*, Brahma Purana, print pages 10–13 (PDF pages 39–42).
- The 25-work devotional catalogue has source references and bounded work/section scopes. It is a selected catalogue, not an exhaustive collection of every hymn, Alvar work, or Siddhar text. One Ayyappa refuge prayer has conventional attribution and its exact original source is still pending.
- Tamil meanings and explanations are app-written paraphrases, separately labelled from original verses. They have not received specialist scholarly review; traditional devotional claims are identified as such.
- All ten supplied books and 3,214 pages match between local originals and the live Supabase catalogue. OCR and extracted text are not manually proofread page by page and can contain recognition errors.

## Live service checks

- Supabase auth/account checks passed for password login, recovery session, own progress save/read, cross-account isolation, revision conflicts, anonymous-write denial, and logout. Disposable test accounts were deleted. No email was sent, so actual SMTP delivery remains unverified.
- The live book catalogue matches all ten local books exactly.
- The live Tirunilakanta cinema metadata now matches the current reviewed local source. Only that existing episode's text/source metadata was updated; its media URLs and all other records were preserved.

## Build readiness

- Android version is set to 1.0.4 (versionCode 5). A rebuild is blocked in this Windows environment: `react-native-worklets` CMake/Ninja fails to create an object directory derived from the long absolute checkout path. Earlier APKs remain available but do not include this version increment.
- iOS cloud build requires a signed-in Expo account and Apple signing setup. EAS currently reports `Not logged in`; no iOS artifact has been produced.
