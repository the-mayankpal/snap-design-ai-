-- ===== 20260927000000_designs.sql =====
-- snapdesign: designs, their chat history, and the images generated for them.
--
-- Auth is deferred (decisions.md D59). Until it ships:
--   * Every table has RLS enabled and NO policies, so the anon/publishable key
--     can read or write nothing. Only the server (service-role key) touches data.
--   * A design belongs to a browser through `device_id`, an opaque random id in
--     an httpOnly cookie. `user_id` stays null; when auth lands it is filled in
--     and owner policies are added — no schema rewrite.
--
-- Run once in the Supabase SQL editor (or `supabase db push`).

create table public.designs (
  id                  uuid primary key default gen_random_uuid(),
  device_id           uuid not null,
  user_id             uuid,
  title               text not null default 'Untitled design',
  settings            jsonb not null default '{"ratio":"16:9","kind":"website","count":"1"}',
  cover_generation_id uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index designs_device_updated_idx on public.designs (device_id, updated_at desc);

-- One row per chat message. `seq` is the client's message number, so a retried
-- save cannot duplicate a message and history always reads back in order.
-- `images` holds attachments as [{ "id": 1, "name": "ref.png", "path": "<storage path>" }].
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  design_id  uuid not null references public.designs (id) on delete cascade,
  seq        integer not null,
  role       text not null check (role in ('user', 'assistant')),
  text       text not null default '',
  images     jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (design_id, seq)
);

create table public.generations (
  id              uuid primary key default gen_random_uuid(),
  design_id       uuid not null references public.designs (id) on delete cascade,
  prompt          text not null,
  improved_prompt text,
  model           text,
  storage_path    text not null,
  width           integer not null,
  height          integer not null,
  created_at      timestamptz not null default now()
);

create index generations_design_idx on public.generations (design_id, created_at);

alter table public.designs
  add constraint designs_cover_generation_fk
  foreign key (cover_generation_id) references public.generations (id) on delete set null;

-- Locked down: RLS on, no policies. The service role bypasses RLS; nothing else gets in.
alter table public.designs     enable row level security;
alter table public.messages    enable row level security;
alter table public.generations enable row level security;

revoke all on public.designs, public.messages, public.generations from anon, authenticated;

-- Private bucket: images are served through short-lived signed URLs only.
-- The size and type limits are enforced by Storage itself, including on
-- direct browser uploads through signed upload URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'designs',
  'designs',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ===== 20260927000001_generations.sql =====
-- Prompt Studio: every generation attempt is recorded, including failures.
--
-- Extends the generations table from 20260927000000_designs.sql rather than
-- adding a second one. `designs` plays the role the spec calls `projects`
-- (D62), so `design_id` is the project link; it is null until the image
-- succeeds and a design is created for it.
--
-- RLS stays on with no policies (D59): only the service role can read or write.

alter table public.generations rename column prompt          to raw_prompt;
alter table public.generations rename column improved_prompt to final_prompt;
alter table public.generations rename column storage_path    to image_path;

alter table public.generations
  alter column design_id  drop not null,
  alter column image_path drop not null,
  alter column width      drop not null,
  alter column height     drop not null,
  add column user_id   uuid,
  add column category  text not null default 'web',
  add column brief     jsonb,
  add column answers   jsonb,
  -- Stays null: the bucket is private and images are served by short-lived
  -- signed URLs (D61), so there is no permanent URL to store.
  add column image_url text,
  add column status    text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed')),
  add column error     text;

alter table public.generations alter column category drop default;

-- Rows from before this migration were only ever written after a successful upload.
update public.generations set status = 'succeeded' where image_path is not null;

create index generations_status_idx on public.generations (status, created_at);

-- ===== 20260927000002_generation_system.sql =====
-- Generation system, phase 1: category ids from the router, and nullable
-- columns for later phases so they need no schema rewrite.
--   designs.style_lock       phase 3 — taste lock style spec (designs = projects, D62/D67)
--   generations.parent_id    phase 2 — edit lineage / version stack
--   generations.canvas_x/y   phase 2 — node position on the project canvas
--
-- RLS stays on with no policies (D59).

alter table public.designs
  add column style_lock jsonb;

alter table public.generations
  add column parent_id uuid references public.generations (id) on delete set null,
  add column canvas_x  numeric,
  add column canvas_y  numeric;

create index generations_parent_idx on public.generations (parent_id);

-- The web playbook's category id is now `web_section`.
update public.generations set category = 'web_section' where category = 'web';

-- ===== 20260927000003_art_director.sql =====
-- Art-director pipeline (D71). A generation now carries its design spec, the
-- action that produced it, the knowledge version it was made with, and step
-- timings. `brief` and `answers` stay for rows from the old pipeline.

alter table public.generations
  add column spec              jsonb,
  add column action            text
    check (action in ('new', 'edit', 'series_next', 'variation')),
  add column knowledge_version text,
  add column plan_ms           integer,
  add column render_ms         integer;

-- `rendering`: claimed by a render request, so a second request cannot run it twice.
alter table public.generations drop constraint if exists generations_status_check;
alter table public.generations
  add constraint generations_status_check
  check (status in ('pending', 'rendering', 'succeeded', 'failed'));

-- ===== 20260927000004_message_generation.sql =====
-- Links an assistant reply to the image it produced (D74), so clicking an
-- image on the canvas can bring its part of the conversation into view.

alter table public.messages
  add column generation_id uuid references public.generations (id) on delete set null;

-- ===== 20260927000005_auth_owner.sql =====
-- Supabase Auth (D77): designs now belong to a signed-in user through
-- `user_id` (auth.users). The device cookie is retired, so `device_id` is
-- only kept for rows made before sign-in existed. RLS stays on with no
-- policies: the server checks the session and scopes every query by user_id.

alter table public.designs alter column device_id drop not null;

-- Designs made before accounts existed keep user_id null: nobody can sign in
-- as their owner, so no query returns them. They are left, not deleted.

alter table public.designs
  add constraint designs_user_fk foreign key (user_id) references auth.users (id) on delete cascade;

create index designs_user_updated_idx on public.designs (user_id, updated_at desc);

-- ===== 20261001000006_canvas_size.sql =====
-- Free canvas (D78): an image's place on the board is canvas_x / canvas_y
-- (from 20260927000002) plus its width here, all in canvas units at 100% zoom.
-- Height always follows the image's own aspect ratio. Null = not placed yet;
-- the editor lays it out automatically.

alter table public.generations add column if not exists canvas_w numeric;

-- ===== 20261001000007_generation_note.sql =====
-- Notes on canvas images (D80): a short label the user writes under an image
-- ("final v1", "too dark"). The art director reads them; a note that marks an
-- image final makes its look the project style.

alter table public.generations add column if not exists note text;

-- ===== 20261001000008_design_pin.sql =====
-- Pinned designs (D81): pinned ones sit in their own section at the top of the
-- dashboard, most recently pinned first. Null = not pinned.

alter table public.designs add column if not exists pinned_at timestamptz;

-- ===== 20261001000009_design_position.sql =====
-- Dashboard order (D82): the user arranges cards by dragging. Lower positions
-- come first; null = never arranged, shown before arranged cards, newest-edited first.

alter table public.designs add column if not exists position double precision;

-- ===== 20261002000010_free_quota.sql =====
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
