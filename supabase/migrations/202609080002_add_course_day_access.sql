create table if not exists public.course_day_access (
  day_number smallint primary key check (day_number between 1 and 8),
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.course_day_access (day_number, is_published)
select day_number, day_number = 1
from generate_series(1, 8) as day_number
on conflict (day_number) do nothing;

alter table public.course_day_access enable row level security;

revoke all on table public.course_day_access from anon, authenticated;
