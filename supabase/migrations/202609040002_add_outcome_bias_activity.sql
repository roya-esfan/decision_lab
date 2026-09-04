-- Add the randomized outcome-evaluation activity to existing and future runs.

alter table public.classroom_activity_states
  drop constraint if exists classroom_activity_states_activity_key_check;
alter table public.classroom_activity_states
  add constraint classroom_activity_states_activity_key_check
  check (activity_key in ('assignment-1', 'outcome-bias', 'assignment-2'));

alter table public.classroom_submissions
  drop constraint if exists classroom_submissions_activity_key_check;
alter table public.classroom_submissions
  add constraint classroom_submissions_activity_key_check
  check (activity_key in ('assignment-1', 'outcome-bias', 'assignment-2'));

alter table public.classroom_responses
  drop constraint if exists classroom_responses_prompt_key_check;
alter table public.classroom_responses
  add constraint classroom_responses_prompt_key_check
  check (prompt_key in (
    'bargain-50',
    'bargain-20',
    'bargain-2',
    'outcome-bypass',
    'outcome-diagnostic-test',
    'outcome-gamble',
    'exam-result'
  ));

alter table public.classroom_responses
  drop constraint if exists classroom_responses_check;
alter table public.classroom_responses
  drop constraint if exists classroom_responses_choice_check;
alter table public.classroom_responses
  add constraint classroom_responses_choice_check check (
    (prompt_key in ('bargain-50', 'bargain-20', 'bargain-2') and choice in ('accept', 'reject'))
    or (prompt_key in ('outcome-bypass', 'outcome-diagnostic-test', 'outcome-gamble')
      and choice ~ '^(failure|success):(-3|-2|-1|0|1|2|3)$')
    or (prompt_key = 'exam-result' and choice in ('70/100', '96/137'))
  );

insert into public.classroom_activity_states (run_id, activity_key, is_open, is_revealed)
select id, 'outcome-bias', false, false
from public.classroom_runs
on conflict (run_id, activity_key) do nothing;

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
  if p_activity_key not in ('assignment-1', 'outcome-bias', 'assignment-2') then
    raise exception using errcode = 'P0001', message = 'INVALID_ACTIVITY';
  end if;

  if jsonb_typeof(p_responses) <> 'array' then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
  end if;

  expected_count := case
    when p_activity_key = 'assignment-1' then 3
    when p_activity_key = 'outcome-bias' then 3
    when p_activity_key = 'assignment-2' then 1
    else 0
  end;
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

revoke all on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) to service_role;
