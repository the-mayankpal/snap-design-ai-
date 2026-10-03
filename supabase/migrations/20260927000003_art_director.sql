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
