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

Book readers download published documents from Supabase on first open, validate the complete page sequence and persist them in the app documents directory (browser Cache Storage on web). Offline loads reuse that copy. Original source JSON stays in this repository for auditing and import, outside the app bundle. Local reading position is preserved. Account progress sync is not yet integrated. The new wisdom function is not deployed; its URL is deliberately omitted from local configuration until deployment is verified.

Recovery requires a maintenance window: rename the current public schema aside, restore the archived schema name, restore original ACLs from the recorded inventory and the old auth trigger, then reload PostgREST. Do not run an unreviewed DROP/RESET or assume restoring schema names alone restores revoked permissions.
