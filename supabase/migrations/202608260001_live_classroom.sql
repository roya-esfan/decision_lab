-- Decision Lab live classroom schema.
-- Student browsers never receive direct database credentials. All access is
-- performed by the application's server routes with the Supabase secret key.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.classroom_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  join_code text not null unique check (join_code ~ '^[A-Z2-9]{8}$'),
  state text not null default 'open' check (state in ('open', 'closed')),
  joins_open boolean not null default true,
  capacity smallint not null default 120 check (capacity between 1 and 500),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '8 hours')
);

create table if not exists public.classroom_participants (
  id uuid primary key,
  run_id uuid not null references public.classroom_runs(id) on delete cascade,
  joined_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists classroom_participants_run_idx
  on public.classroom_participants(run_id);

create table if not exists public.classroom_activity_states (
  run_id uuid not null references public.classroom_runs(id) on delete cascade,
  activity_key text not null check (activity_key in ('assignment-1', 'assignment-2')),
  is_open boolean not null default true,
  is_revealed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (run_id, activity_key)
);

create table if not exists public.classroom_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  run_id uuid not null references public.classroom_runs(id) on delete cascade,
  participant_id uuid not null references public.classroom_participants(id) on delete cascade,
  activity_key text not null check (activity_key in ('assignment-1', 'assignment-2')),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (participant_id, activity_key),
  unique (participant_id, idempotency_key)
);

create index if not exists classroom_submissions_run_activity_idx
  on public.classroom_submissions(run_id, activity_key);

create table if not exists public.classroom_responses (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.classroom_submissions(id) on delete cascade,
  run_id uuid not null references public.classroom_runs(id) on delete cascade,
  participant_id uuid not null references public.classroom_participants(id) on delete cascade,
  prompt_key text not null check (prompt_key in ('bargain-50', 'bargain-20', 'bargain-2', 'exam-result')),
  choice text not null,
  created_at timestamptz not null default now(),
  unique (participant_id, prompt_key),
  check (
    (prompt_key in ('bargain-50', 'bargain-20', 'bargain-2') and choice in ('accept', 'reject'))
    or (prompt_key = 'exam-result' and choice in ('70/100', '96/137'))
  )
);

create index if not exists classroom_responses_run_prompt_idx
  on public.classroom_responses(run_id, prompt_key, choice);

alter table public.classroom_runs enable row level security;
alter table public.classroom_participants enable row level security;
alter table public.classroom_activity_states enable row level security;
alter table public.classroom_submissions enable row level security;
alter table public.classroom_responses enable row level security;

revoke all on table public.classroom_runs from anon, authenticated;
revoke all on table public.classroom_participants from anon, authenticated;
revoke all on table public.classroom_activity_states from anon, authenticated;
revoke all on table public.classroom_submissions from anon, authenticated;
revoke all on table public.classroom_responses from anon, authenticated;
revoke all on sequence public.classroom_responses_id_seq from anon, authenticated;

grant select, insert, update, delete on table public.classroom_runs to service_role;
grant select, insert, update, delete on table public.classroom_participants to service_role;
grant select, insert, update, delete on table public.classroom_activity_states to service_role;
grant select, insert, update, delete on table public.classroom_submissions to service_role;
grant select, insert, update, delete on table public.classroom_responses to service_role;
grant usage, select on sequence public.classroom_responses_id_seq to service_role;

create or replace function public.join_classroom_run(
  p_code text,
  p_participant_id uuid
)
returns table (run_id uuid, run_expires_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_run public.classroom_runs%rowtype;
  participant_count integer;
begin
  select * into target_run
  from public.classroom_runs
  where join_code = upper(trim(p_code))
  for update;

  if not found
    or target_run.state <> 'open'
    or not target_run.joins_open
    or target_run.expires_at <= now()
  then
    raise exception using errcode = 'P0001', message = 'RUN_UNAVAILABLE';
  end if;

  select count(*) into participant_count
  from public.classroom_participants
  where classroom_participants.run_id = target_run.id
    and expires_at > now();

  if participant_count >= target_run.capacity then
    raise exception using errcode = 'P0001', message = 'RUN_FULL';
  end if;

  insert into public.classroom_participants (id, run_id, expires_at)
  values (p_participant_id, target_run.id, target_run.expires_at);

  return query select target_run.id, target_run.expires_at;
end;
$$;

create or replace function public.submit_classroom_responses(
  p_run_id uuid,
  p_participant_id uuid,
  p_activity_key text,
  p_idempotency_key uuid,
  p_responses jsonb
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submission_id uuid;
  expected_count integer;
begin
  if p_activity_key not in ('assignment-1', 'assignment-2') then
    raise exception using errcode = 'P0001', message = 'INVALID_ACTIVITY';
  end if;

  if jsonb_typeof(p_responses) <> 'array' then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
  end if;

  expected_count := case when p_activity_key = 'assignment-1' then 3 else 1 end;
  if jsonb_array_length(p_responses) <> expected_count then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
  end if;

  perform 1
  from public.classroom_runs
  where id = p_run_id and state = 'open' and expires_at > now()
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'RUN_CLOSED';
  end if;

  perform 1
  from public.classroom_participants
  where id = p_participant_id and run_id = p_run_id and expires_at > now();
  if not found then
    raise exception using errcode = 'P0001', message = 'SESSION_EXPIRED';
  end if;

  perform 1
  from public.classroom_activity_states
  where run_id = p_run_id and activity_key = p_activity_key and is_open
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'ACTIVITY_CLOSED';
  end if;

  select id into submission_id
  from public.classroom_submissions
  where participant_id = p_participant_id and idempotency_key = p_idempotency_key;
  if found then
    return 'IDEMPOTENT_REPLAY';
  end if;

  if exists (
    select 1 from public.classroom_submissions
    where participant_id = p_participant_id and activity_key = p_activity_key
  ) then
    raise exception using errcode = 'P0001', message = 'ALREADY_SUBMITTED';
  end if;

  insert into public.classroom_submissions (
    run_id, participant_id, activity_key, idempotency_key
  ) values (
    p_run_id, p_participant_id, p_activity_key, p_idempotency_key
  ) returning id into submission_id;

  insert into public.classroom_responses (
    submission_id, run_id, participant_id, prompt_key, choice
  )
  select submission_id, p_run_id, p_participant_id, item.prompt_key, item.choice
  from jsonb_to_recordset(p_responses) as item(prompt_key text, choice text);

  return 'ACCEPTED';
exception
  when check_violation or unique_violation then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
end;
$$;

create or replace function public.cleanup_decision_lab_data()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.classroom_runs
  where created_at < now() - interval '30 days';
$$;

revoke all on function public.join_classroom_run(text, uuid) from public, anon, authenticated;
revoke all on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.cleanup_decision_lab_data() from public, anon, authenticated;
grant execute on function public.join_classroom_run(text, uuid) to service_role;
grant execute on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) to service_role;
grant execute on function public.cleanup_decision_lab_data() to service_role;

create extension if not exists pg_cron;
select cron.schedule(
  'decision-lab-daily-cleanup',
  '17 3 * * *',
  'select public.cleanup_decision_lab_data()'
);
