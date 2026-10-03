-- Dashboard order (D82): the user arranges cards by dragging. Lower positions
-- come first; null = never arranged, shown before arranged cards, newest-edited first.

alter table public.designs add column if not exists position double precision;
