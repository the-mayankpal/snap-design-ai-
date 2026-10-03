-- Free canvas (D78): an image's place on the board is canvas_x / canvas_y
-- (from 20260927000002) plus its width here, all in canvas units at 100% zoom.
-- Height always follows the image's own aspect ratio. Null = not placed yet;
-- the editor lays it out automatically.

alter table public.generations add column if not exists canvas_w numeric;
