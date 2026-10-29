begin;
alter table public.content_documents drop constraint content_documents_kind_check;
alter table public.content_documents add constraint content_documents_kind_check
  check (kind in ('book', 'mantra', 'gita', 'nayanmar', 'purana', 'cinema'));
notify pgrst, 'reload schema';
commit;
