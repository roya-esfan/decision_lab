-- Count anonymous completions for private, device-local activities.
-- No answers, scores, problems, criteria, alternatives or ratings are stored.

create table if not exists public.classroom_private_completions (
  run_id uuid not null references public.classroom_runs(id) on delete cascade,
  anonymous_id uuid not null,
  activity_key text not null check (activity_key in ('rational-decision', 'rei-10')),
  completed_at timestamptz not null default now(),
  primary key (run_id, anonymous_id, activity_key)
);

create index if not exists classroom_private_completions_run_activity_idx
  on public.classroom_private_completions(run_id, activity_key);

alter table public.classroom_private_completions enable row level security;
revoke all on table public.classroom_private_completions from anon, authenticated;
grant select, insert, update, delete on table public.classroom_private_completions to service_role;
