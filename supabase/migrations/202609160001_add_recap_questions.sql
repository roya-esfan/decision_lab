create table if not exists public.recap_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  idempotency_key uuid not null unique,
  question text not null check (char_length(btrim(question)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists recap_questions_created_at_idx
  on public.recap_questions (created_at desc);

alter table public.recap_questions enable row level security;

revoke all on table public.recap_questions from public, anon, authenticated;
grant select, insert on table public.recap_questions to service_role;
