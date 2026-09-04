-- Include Life Experience Bingo in anonymous completion totals.
-- A completion means that the browser reached at least one four-square line.

alter table public.classroom_private_completions
  drop constraint if exists classroom_private_completions_activity_key_check;

alter table public.classroom_private_completions
  add constraint classroom_private_completions_activity_key_check
  check (activity_key in ('life-experience-bingo', 'rational-decision', 'rei-10'));
