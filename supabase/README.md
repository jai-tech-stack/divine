# Divine Life database

Project: `oojhfezpvpdfrjjdsjod` (divine-life).

The fresh start on 2026-10-26 replaced the app-facing `public` schema. The 37 previous tables and their data remain together in `divine_backup_20261026`, with schema, table, sequence and routine access revoked from PUBLIC, anon and authenticated. This is an in-database recovery copy, not an off-site disaster-recovery backup. Original and archived row inventories are in the ignored `artifacts/database-backup-2026-10-26/` folder. Do not delete the archive without a separate verified backup.

`fresh-start.sql` is a one-time operation, guarded against repetition. Do not run it as a routine migration. The old auth trigger was replaced; existing authentication identities remain, with fresh profiles and no imported progress. Supabase-managed auth/storage schemas were not reset.

New tables:

- `content_documents`: original content snapshots, keyed by kind/id, with source metadata inside each document, a SHA-256 manifest and published-only public reads. Client writes are denied.
- `profiles`: authenticated users may access only their own row.
- `user_progress`: authenticated users may access only their own row.

Run `node tools/upload-content.cjs --check` to validate local content, or `--upload` to import using the locally authenticated Supabase CLI. The service-role credential stays in the import process. Only the public URL and anon key are written to ignored `.env.local`. Never put a service-role key in Expo configuration.

Run `node tools/verify-remote-books.mjs` to compare every downloaded book with its canonical local JSON. Import does not mark OCR text as proofread: its review status is retained.

Book readers download published documents from Supabase on first open, validate the complete page sequence and persist them in the app documents directory (browser Cache Storage on web). Offline loads reuse that copy. Original source JSON stays in this repository for auditing and import, outside the app bundle. Local reading position is preserved.

The deployed `wisdom` function uses existing server-side provider keys, Tamil-only replies and provider request timeouts. `ai-usage.sql` provides atomic daily provider quotas; only service_role can reserve requests. Existing GEMINI_DAILY_LIMIT/GROQ_DAILY_LIMIT values are respected (default 20, capped at 1,000). Configured model names were updated after legacy models returned 404; a live Tamil response was verified from Groq. The app derives the wisdom endpoint from the public Supabase URL unless explicitly overridden. Natural Tamil speech uses the separate endpoint described below, with installed device speech as fallback.

Recovery requires a maintenance window: rename the current public schema aside, restore the archived schema name, restore original ACLs from the recorded inventory and the old auth trigger, then reload PostgREST. Do not run an unreviewed DROP/RESET or assume restoring schema names alone restores revoked permissions.
# Tamil voice

`tamil-voice` generates original Tamil speech with Gemini 3.8 Flash-Lite TTS
and the preset Kore voice, directed toward calm, warm delivery. It does not
replicate the reference recording or upload that recording. Only the text being
read is sent to Gemini; `store: false` disables stored interaction state.
The endpoint shares the atomic Gemini daily request budget with `wisdom`.
It accepts at most 2,000 characters and returns private, non-cacheable WAV audio.
The mobile client deletes temporary playback files, cancels pending speech on
stop, and falls back to the installed Tamil voice if the service is unavailable.
Deploy with `npx supabase functions deploy tamil-voice --project-ref oojhfezpvpdfrjjdsjod --use-api`.
No additional provider key or native dependency is required.

## Account and progress synchronization

The `/account` screen supports email/password login, signup, confirmation resend,
and password recovery. The public Supabase client persists sessions locally;
provider keys and service-role credentials are never part of this client.
PKCE email callbacks accept only `divinelife://account`. This exact URL was added
to the project's redirect allowlist on 2026-10-27. Confirmation and recovery
must be requested and opened on the same installed app/device.

**Custom SMTP is not configured.** Supabase's default sender is restricted to
project-team email addresses. Public signup and recovery email delivery require
the owner to connect an SMTP provider in Authentication > Emails > SMTP Settings.
Do not disable email confirmation to work around this. No emails were sent by
the automated account tests. Existing confirmed accounts can sign in.

`progress-sync.sql` adds an optimistic revision counter and an authenticated
compare-and-save RPC. Row-level security restricts all access to the signed-in
owner. Conflicting device writes refetch and merge, rather than blindly overwrite.
Guest history and each account use different local storage keys. Guest import is
an explicit action in the account screen; another account's local cache is never
imported. Offline edits persist locally and retry while the app is running, on
foreground resume, and from the manual sync button. No background-task promise
is made. Preferences and downloaded book files remain device-local.

Read history and practice dates merge by union; bookmarks and positions use
per-field edit clocks. Same-day counters and chant totals use maximums, so
repeated synchronization cannot inflate them. Counts for simultaneous offline
practice on two devices are conservative, not summed. Device clocks should be
set correctly for the latest-position/bookmark rule.

Checks: `node tools/check-progress.mjs`, `node tools/check-progress-sync.mjs`,
and `node tools/check-live-account.mjs`. The last command uses CLI-held admin
credentials only to create and remove disposable `example.invalid` users;
actual login, data access and compare-and-save requests use normal user tokens.

