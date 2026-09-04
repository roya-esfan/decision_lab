-- Keep classroom sessions and their totals separate for each teaching day.
-- Existing sessions predate day-specific control and therefore belong to Day 1.

alter table public.classroom_runs
  add column if not exists day_number smallint not null default 1
  check (day_number between 1 and 8);

create index if not exists classroom_runs_day_created_idx
  on public.classroom_runs(day_number, created_at desc);

