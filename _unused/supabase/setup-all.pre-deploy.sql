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

