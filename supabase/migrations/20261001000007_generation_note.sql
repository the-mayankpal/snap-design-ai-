-- Notes on canvas images (D80): a short label the user writes under an image
-- ("final v1", "too dark"). The art director reads them; a note that marks an
-- image final makes its look the project style.

alter table public.generations add column if not exists note text;
