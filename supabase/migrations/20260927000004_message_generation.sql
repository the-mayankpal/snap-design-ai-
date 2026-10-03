-- Links an assistant reply to the image it produced (D74), so clicking an
-- image on the canvas can bring its part of the conversation into view.

alter table public.messages
  add column generation_id uuid references public.generations (id) on delete set null;
