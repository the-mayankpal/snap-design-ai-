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
