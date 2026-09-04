-- Give every implemented activity the same closed, live and review controls.
-- Private activities remain device-local; these rows store availability only.

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
    'rei-10'
  ));

insert into public.classroom_activity_states (run_id, activity_key, is_open, is_revealed)
select run.id, activity.activity_key, false, false
from public.classroom_runs as run
cross join (
  values
    ('life-experience-bingo'),
    ('rational-decision'),
    ('rei-10')
) as activity(activity_key)
on conflict (run_id, activity_key) do nothing;

