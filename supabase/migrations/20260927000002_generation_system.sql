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
