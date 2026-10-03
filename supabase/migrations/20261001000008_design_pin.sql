-- Pinned designs (D81): pinned ones sit in their own section at the top of the
-- dashboard, most recently pinned first. Null = not pinned.

alter table public.designs add column if not exists pinned_at timestamptz;
