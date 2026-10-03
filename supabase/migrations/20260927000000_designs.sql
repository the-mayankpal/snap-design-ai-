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
