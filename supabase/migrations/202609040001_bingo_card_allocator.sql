-- Anonymous sequential allocation for the Life Experience Bingo card catalog.
-- This stores only one aggregate counter. It stores no participant identifiers,
-- answers, marked squares, device information, or IP addresses.

create table if not exists public.bingo_card_counters (
  activity_key text primary key check (activity_key = 'life-experience-bingo'),
  next_card integer not null default 0 check (next_card between 0 and 99),
  updated_at timestamptz not null default now()
);

alter table public.bingo_card_counters enable row level security;
revoke all on table public.bingo_card_counters from public, anon, authenticated;
grant select, insert, update, delete on table public.bingo_card_counters to service_role;

create or replace function public.claim_bingo_card(
  p_activity_key text,
  p_catalog_size integer
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  claimed_index integer;
begin
  if p_activity_key <> 'life-experience-bingo'
    or p_catalog_size < 1
    or p_catalog_size > 100
  then
    raise exception using errcode = 'P0001', message = 'INVALID_BINGO_CARD_REQUEST';
  end if;

  insert into public.bingo_card_counters (activity_key, next_card)
  values (p_activity_key, 0)
  on conflict (activity_key) do nothing;

  select next_card % p_catalog_size into claimed_index
  from public.bingo_card_counters
  where activity_key = p_activity_key
  for update;

  update public.bingo_card_counters
  set next_card = (claimed_index + 1) % p_catalog_size,
      updated_at = now()
  where activity_key = p_activity_key;

  return claimed_index;
end;
$$;

revoke all on function public.claim_bingo_card(text, integer) from public, anon, authenticated;
grant execute on function public.claim_bingo_card(text, integer) to service_role;
