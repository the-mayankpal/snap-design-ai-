# assets/

Source files that are **never served** to visitors. Anything a browser loads goes in `public/`
(web-ready copies) or is an inline SVG component (see `documentation/architecture.md` §3).

| Folder      | What it holds                                                        | Web copy                   |
| ----------- | -------------------------------------------------------------------- | -------------------------- |
| `showcase/` | Full-size PNG masters of every showcase design, `<category>-<subject>.png` | `public/showcase/*.webp` |
| `errors/`   | Original 404 artwork (`404-desktop-source.png`, `404-mobile-source.png`)   | `public/errors/*.png`    |
| `fonts/`    | Inter TTFs (OFL) read at build time by the share image and app icon        | —                        |

Adding a design: put the master PNG in `showcase/`, export an optimised WebP with the same name
into `public/showcase/`, and add an entry to `components/showcase-data.ts`.
