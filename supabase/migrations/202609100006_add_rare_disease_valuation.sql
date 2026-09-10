-- Add the Day 3 rare-disease valuation activity. This is cumulative with all
-- preceding Day 3 migrations and can be run regardless of their current state.

alter table public.classroom_activity_states
  drop constraint if exists classroom_activity_states_activity_key_check;
alter table public.classroom_activity_states
  add constraint classroom_activity_states_activity_key_check
  check (activity_key in (
    'life-experience-bingo',
    'assignment-1',
    'outcome-bias',
    'assignment-2',
    'rational-decision',
    'rei-10',
    'company-revenue',
    'causes-of-death',
    'crew-problem',
    'school-bag-framing',
    'calculator-trip',
    'endowment-framing',
    'coin-gamble',
    'rare-disease-valuation'
  ));

alter table public.classroom_submissions
  drop constraint if exists classroom_submissions_activity_key_check;
alter table public.classroom_submissions
  add constraint classroom_submissions_activity_key_check
  check (activity_key in (
    'assignment-1',
    'outcome-bias',
    'assignment-2',
    'company-revenue',
    'causes-of-death',
    'crew-problem',
    'school-bag-framing',
    'calculator-trip',
    'endowment-framing',
    'coin-gamble',
    'rare-disease-valuation'
  ));

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
    'exam-result',
    'company-revenue-group',
    'death-tobacco',
    'death-diet-inactivity',
    'death-motor-vehicles',
    'death-firearms',
    'death-illicit-drugs',
    'crew-choice',
    'school-bag-discount',
    'school-bag-surcharge',
    'calculator-trip-choice',
    'endowment-framing-choice',
    'coin-gamble-choice',
    'rare-disease-amount'
  ));

alter table public.classroom_responses
  drop constraint if exists classroom_responses_choice_check;
alter table public.classroom_responses
  add constraint classroom_responses_choice_check check (
    (prompt_key in ('bargain-50', 'bargain-20', 'bargain-2') and choice in ('accept', 'reject'))
    or (prompt_key in ('outcome-bypass', 'outcome-diagnostic-test', 'outcome-gamble')
      and choice ~ '^(failure|success):(-3|-2|-1|0|1|2|3)$')
    or (prompt_key = 'exam-result' and choice in ('70/100', '96/137'))
    or (prompt_key = 'company-revenue-group' and choice in ('Group A', 'Group B'))
    or (prompt_key in (
      'death-tobacco',
      'death-diet-inactivity',
      'death-motor-vehicles',
      'death-firearms',
      'death-illicit-drugs'
    ) and choice in ('1', '2', '3', '4', '5'))
    or (prompt_key = 'crew-choice' and choice in (
      'gain:certain',
      'gain:uncertain',
      'loss:certain',
      'loss:uncertain'
    ))
    or (prompt_key in ('school-bag-discount', 'school-bag-surcharge')
      and choice in ('Gain', 'Loss'))
    or (prompt_key = 'calculator-trip-choice' and choice in (
      'low-price:yes',
      'low-price:no',
      'high-price:yes',
      'high-price:no'
    ))
    or (prompt_key = 'endowment-framing-choice' and choice in (
      'gain:certain',
      'gain:gamble',
      'loss:certain',
      'loss:gamble'
    ))
    or (prompt_key = 'coin-gamble-choice' and choice in ('Yes', 'No'))
    or (
      prompt_key = 'rare-disease-amount'
      and choice ~ '^(A|B):(0|[1-9][0-9]{0,9})$'
      and case
        when choice ~ '^(A|B):(0|[1-9][0-9]{0,9})$'
          then split_part(choice, ':', 2)::numeric between 0 and 1000000000
        else false
      end
    )
  );

insert into public.classroom_activity_states (run_id, activity_key, is_open, is_revealed)
select run.id, activity.activity_key, false, false
from public.classroom_runs as run
cross join (
  values
    ('crew-problem'),
    ('school-bag-framing'),
    ('calculator-trip'),
    ('endowment-framing'),
    ('coin-gamble'),
    ('rare-disease-valuation')
) as activity(activity_key)
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
  if p_activity_key not in (
    'assignment-1',
    'outcome-bias',
    'assignment-2',
    'company-revenue',
    'causes-of-death',
    'crew-problem',
    'school-bag-framing',
    'calculator-trip',
    'endowment-framing',
    'coin-gamble',
    'rare-disease-valuation'
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_ACTIVITY';
  end if;

  if jsonb_typeof(p_responses) <> 'array' then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
  end if;

  expected_count := case
    when p_activity_key = 'assignment-1' then 3
    when p_activity_key = 'outcome-bias' then 3
    when p_activity_key = 'assignment-2' then 1
    when p_activity_key = 'company-revenue' then 1
    when p_activity_key = 'causes-of-death' then 5
    when p_activity_key = 'crew-problem' then 1
    when p_activity_key = 'school-bag-framing' then 2
    when p_activity_key = 'calculator-trip' then 1
    when p_activity_key = 'endowment-framing' then 1
    when p_activity_key = 'coin-gamble' then 1
    when p_activity_key = 'rare-disease-valuation' then 1
    else 0
  end;
  if jsonb_array_length(p_responses) <> expected_count then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
  end if;

  if p_activity_key = 'causes-of-death' and (
    select count(distinct response.choice)
    from jsonb_to_recordset(p_responses) as response(prompt_key text, choice text)
  ) <> 5 then
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
  select submission_id, p_run_id, p_participant_id, response.prompt_key, response.choice
  from jsonb_to_recordset(p_responses) as response(prompt_key text, choice text);

  return 'ACCEPTED';
exception
  when check_violation or unique_violation then
    raise exception using errcode = 'P0001', message = 'INVALID_RESPONSES';
end;
$$;

revoke all on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.submit_classroom_responses(uuid, uuid, text, uuid, jsonb) to service_role;
