-- Free tier (D83): a lifetime allowance of images and chat turns, counted per
-- normalised email AND per network (IP, IPv6 /64). Keys are HMACs made on the
-- server, so neither address is stored. Only the server (service role) can
-- read or change this, and only through the functions below.

create table if not exists public.free_usage (
  key        text primary key,            -- 'email:<hmac>' or 'ip:<hmac>'
  images     integer not null default 0,
  turns      integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.free_usage enable row level security;
revoke all on public.free_usage from anon, authenticated;

-- Takes one unit of `kind` ('image' or 'turn') from every key, or none if any
-- key is already at `max_units`. Rows are locked in key order, so concurrent
-- requests cannot both pass the check.
create or replace function public.take_free(keys text[], kind text, max_units integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if kind not in ('image', 'turn') then
    raise exception 'unknown kind %', kind;
  end if;

  insert into free_usage (key) select unnest(keys) on conflict (key) do nothing;
  perform 1 from free_usage where key = any(keys) order by key for update;

  if exists (
    select 1 from free_usage
    where key = any(keys)
      and (case when kind = 'image' then images else turns end) >= max_units
  ) then
    return false;
  end if;

  update free_usage
  set images = images + (case when kind = 'image' then 1 else 0 end),
      turns = turns + (case when kind = 'turn' then 1 else 0 end),
      updated_at = now()
  where key = any(keys);
  return true;
end;
$$;

-- Hands one image back, after a render that failed or was blocked.
create or replace function public.refund_free_image(keys text[])
returns void
language sql
security definer
set search_path = public
as $$
  update free_usage
  set images = greatest(images - 1, 0), updated_at = now()
  where key = any(keys);
$$;

revoke all on function public.take_free(text[], text, integer) from public, anon, authenticated;
revoke all on function public.refund_free_image(text[]) from public, anon, authenticated;
grant execute on function public.take_free(text[], text, integer) to service_role;
grant execute on function public.refund_free_image(text[]) to service_role;
