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
