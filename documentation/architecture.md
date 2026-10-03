# Architecture

> Living document. Updated after **every** prompt that changes the project.
> Describes what actually exists. Anything not built yet is marked `PLANNED`.

_Last updated: 2026-09-25_

---

## 1. Overview

**snapdesign.ai** — an AI design generation app. A user writes a prompt, the server rewrites it
into a stronger design prompt, generates an image, stores it, and saves the generation against
the user's project and credit balance.

Status: **Scaffolded. Marketing hero shipped.** The Next.js app is running; the landing route
renders the navigation bar and hero section. Auth, DB, AI, storage and billing are not built yet.

---

## 2. Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8 + TypeScript | DONE |
| Styling | Tailwind CSS v4 | DONE |
| Icons | Phosphor Icons (`@phosphor-icons/react`) | DONE |
| Fonts | Inter (UI) + Newsreader (display serif), via `next/font/google` | DONE |
| Database | Supabase Postgres + RLS | IN USE — designs, messages, generations; scoped by user (D77) |
| Auth | Supabase Auth via `@supabase/ssr` — email + password | IN USE (D77) |
| Storage | Supabase Storage | IN USE — private `designs` bucket (D61) |
| AI | OpenAI — Responses API (analyze, compose) + Images API; models from env | IN USE — Prompt Studio, web only |
| Payments | Stripe | PLANNED |
| Hosting | Vercel | PLANNED |

---

## 3. Folder Structure (target)

```
app/
  (marketing)/      public pages: landing, pricing, showcases
  (app)/            authed shell: projects, project/[id], settings
  (auth)/           login, signup
  api/              server-only routes
    designs/        design CRUD, chat messages, attachment upload slots (built)
    prompt/analyze/ Prompt Studio: raw prompt → questions or ready brief (built)
    generations/    Prompt Studio: brief + answers → compose → image → store → record (built)
    billing/        stripe checkout + webhook
    auth/callback/  email links (confirm sign-up, reset password) → session (built)
  layout.tsx
  globals.css
lib/                server-only (`import "server-only"`)
  api.ts            respond() + HttpError: JSON responses and safe error messages (built)
  ids.ts            isUuid (built)
  supabase/         server.ts — service-role client; auth.ts — session, readUser, requireUser;
                    browser.ts — browser auth client (built)
  storage/          images.ts — upload slots, signed URLs, generation upload, cleanup (built)
  db/               designs.ts — every designs/messages/generations query (built)
  ai/               Prompt Studio (built)
    router.ts       step 1: classify the prompt into one of 9 categories (+ confidence)
    pipeline.ts     category-agnostic SOP: analyze(), compose(), generate(), kill switch
    core-rules.ts   anti-slop house rules for every category
    openai.ts       OpenAI client + model ids from env
    playbooks/      index.ts (CATEGORIES, enabled registry), types.ts (Playbook, Question)
      web/          web_section: parts, questions, rules, examples, playbook.ts
      <category>/   one folder per later category (PLANNED, phases 4–5)
  db/generations.ts generation records + the design a success opens in (built)
  billing/          stripe.ts (PLANNED)
components/         UI, including components/ui/*
  icons/            SVG icon components: brand-logos.tsx (third-party marks), flow-icons.tsx
  brand/            snapdesign's own marks: pen-underline.tsx (+ shared stroke paths), app-icon.tsx
supabase/migrations/  SQL run in the Supabase SQL editor; 20260927000000_designs.sql is the schema
public/             served as-is at the site root — web-ready files only
  showcase/         optimised WebP of every design (referenced from showcase-data.ts)
  errors/           404 artwork
assets/             source files, never served — see assets/README.md
  showcase/         full-size PNG masters of the showcase designs
  errors/           original 404 artwork
  fonts/            Inter TTFs for generated images (OG image, app icon)
middleware.ts
```

**Where images and SVGs go:**
- A drawing that is part of the UI (icons, the pen stroke, illustrations) is an **inline SVG
  React component**, not a file — it ships with the page, takes colour from props or
  `currentColor`, and needs no extra request. Icons live in `components/icons/`, snapdesign's
  own marks in `components/brand/`, and one-off illustrations next to the feature that uses them
  (`how-it-works-art.tsx`, `design-range.tsx`, `about/scrapbook.tsx`).
- Functional UI icons are Phosphor (RULEBOOK §3); custom SVG icons need approval.
- Photos and design images go in `public/<group>/` as optimised WebP (or PNG where a lossless
  copy matters), with the full-size master in `assets/<group>/` under the same name.
- The favicon, Apple icon and share image are generated in code (`app/icon.tsx`,
  `app/apple-icon.tsx`, `app/opengraph-image.tsx`), not stored as files.

### Colour

All colours are defined once, as CSS variables on `:root` in `app/globals.css`, and exposed to
Tailwind through `@theme` (`bg-sun`, `text-accent`, `bg-paper-warm`…). Components use the
Tailwind class; where a class can't reach (SVG `fill`/`stroke`, inline `style`, props like a
sticker's `bg`), they use `COLOR.*` from `components/brand/palette.ts`, which holds
`var(--…)` references. Generated images (share card, app icon) have no stylesheet, so they use
the literal `HEX.*` in the same file — keep it in step with `globals.css`.

The palette, by role:

| Role | Tokens | Rule |
| --- | --- | --- |
| **Neutrals** | `background`, `surface`, `surface-muted`, `line`, `foreground`, `ink-900/700/500/300` | Most of every page. Warm near-blacks, never pure `#000` for text. |
| **Brand accent** | `accent` `#EF7A43`, `accent-soft`, `accent-tint` | The one brand colour: pen stroke, "Describe" selection, links, step numbers. Small marks only — never a large fill. |
| **Hand-made layer** | `ink-sketch`, `ink-night`, `paper`, `paper-rule`, `paper-warm`, `frame` | Pen lines and arrows, dark "How it works" cards, notebook paper, image placeholders. |
| **Supporting** | `sun`, `cobalt`, `leaf`, `pink`, `rose`, `lilac`, `sage`, `blue`, `periwinkle` | Flat, bright, in small doses: stickers, tabs, icon second tones, mockup details. Only `sun` sits behind text (with ink). |
| **Pastels** | `mint`, `butter`, `sky`, `tint-sage`, `tint-rose`, `tint-sky` | Tape, tags, and bento tile backgrounds. |
| **Section palettes** | `auth-*`, `ed-*`, `footer-*` | Scoped to the sign-in pages, the editor's dark chrome and the footer. |

**Rules:**
- **Flat colour only.** No decorative gradients, glows or sheens. Allowed exceptions: a fade that
  hides content under a caption (invoices tile), the notebook ruling, the dot/mask effects in
  `globals.css`, and a mockup reproducing a real UI element (the Instagram story ring).
- **Content colours stay local.** Colours that depict something other than the brand — a mockup
  browser's window dots, a client design's own palette (Ember & Bean), third-party logos — are
  literal values next to the drawing, not tokens.
- **Adding a colour:** add the variable to `:root` and `@theme` with a comment on what it is
  for, and to `COLOR` (and `HEX` if generated images need it). Reuse an existing token first.

Boundary rule: everything under `lib/` and `app/api/` is server-only and must never be imported
by a client component.

---

## 4. Data Flow — Art Director (Turn → Compile → Render)

```
homepage box / docked bar (components/prompt-context.tsx)
  → prompt saved to sessionStorage (components/prompt-handoff.ts)
  → no account → /signup → after sign-up / sign-in the handoff continues
  → POST /api/designs → /editor/<id> with the prompt waiting, unsent, in the chat

editor chat (components/editor/chat-panel.tsx → studio-client.ts)
  → POST /api/designs/<id>/turn { messages (last 20, text), settings { ratio, kind }, targetId? }
      kill switch (403) → strict body (400) → signed in (401) → design owned by this user (404)
      → db: settings, style_lock, last 12 succeeded generations with specs
          (+ the selected image, even if older — D74)
      → studio/director.direct() — ONE Responses call, Structured Outputs (PLAN_SCHEMA)
          static instructions first (constitution + families + taste index, cached)
          ← { action, target, reply, suggestions, clarify, design }
      → chat / clarify ← { reply, suggestions, clarify, pending: null }
      → new / edit / series_next / variation:
          target resolved (handle → selected image → newest; none → action "new")
          settle(): edit keeps target ratio; series_next forced to project style
          studio/compiler → 8-slot prompt (edit / series variants)
          db: generations row `pending` with spec, final_prompt, size, action, parent_id
      ← { reply, suggestions, clarify, pending { id, width, height } }
  → chat shows the reply; canvas shows a placeholder at the final size
  → POST /api/generations/<id>/render
      kill switch → owned → claim `pending` → `rendering` (409 if already claimed)
      → edit: source = parent image; series_next: parent image as style reference
      → studio/render: images.edit (with source) or images.generate
      → storage generations/<id>.png → row `succeeded` (model, image_path, render_ms)
      → designs.style_lock: set by every `new`, filled if empty by other actions (D73)
      ← { id, url (signed, 1h), width, height, prompt }
  → image joins the canvas; suggestion chips appear under the reply
on any failure after the row exists: row `failed` + short code in `error`;
the browser gets our own copy (502), never a provider message.
```

- **Two model calls per image:** one text call (the art director), one image call. Clarify and
  chat turns are one text call. The model never writes the image prompt; code compiles it.
- **Knowledge is data, reasoning is one call (D71, D72):** `studio/constitution.ts` (rules),
  `studio/families.ts` (11 asset families by how they are read, incl. `image` for plain pictures), `studio/taste.ts` (46 blocks
  on 5 axes). `KNOWLEDGE_VERSION` is stored on every generation.
- **No design questions:** the director designs by default, invents content, and states its
  assumptions in the reply. Clarify only when it cannot tell what to make.
- PLANNED with auth: session check (401) and credit check (402) before the turn call.

---

## 5. Database Schema

Built: `supabase/migrations/20260927000000_designs.sql` (run once in the Supabase SQL editor).

```
designs       id, user_id → auth.users, device_id (legacy, nullable), title, settings jsonb,
              cover_generation_id → generations, created_at, updated_at
messages      id, design_id → designs (cascade), seq, role, text, images jsonb,
              generation_id → generations (null; the image a reply made — D74),
              created_at — unique (design_id, seq)
designs.style_lock  jsonb, null — project style { type, color, imagery, graphic, palette } (D73)
generations   id, design_id → designs (cascade; set when planned), user_id (null),
              parent_id → generations (null; the asset an edit / series / variation builds on),
              canvas_x, canvas_y numeric (null; canvas position, phase 2),
              category, raw_prompt, brief jsonb, answers jsonb, final_prompt, model,
              image_path, image_url (always null — D61), width, height,
              spec jsonb (the design spec — D71), action (new | edit | series_next |
              variation), knowledge_version, plan_ms, render_ms,
              status (pending | rendering | succeeded | failed), error, created_at
storage       bucket `designs` — private, 10 MB, PNG/JPG/WebP/GIF only
              <design_id>/uploads/<uuid>.<ext>      chat attachments
              generations/<generation-id>.png       generated images
```

Migrations, run in order: `20260927000000_designs.sql`, `20260927000001_generations.sql`
(renames `prompt`→`raw_prompt`, `improved_prompt`→`final_prompt`, `storage_path`→`image_path`
and adds the Prompt Studio columns), `20260927000002_generation_system.sql` (future-phase
columns; category `web` → `web_section`), `20260927000003_art_director.sql` (spec, action,
knowledge version, timings, `rendering` status). `category` now holds the asset family.
`brief` and `answers` are only set on rows from the retired pipeline. `designs` is the spec's
`projects` (D62). `20260927000004_message_generation.sql` adds `messages.generation_id`.

- Readers of designs (`lib/db/designs.ts`) only ever see `succeeded` generations.
- `final_prompt` is our IP: written by the server, never selected into any response (D66).

**Bucket setup** (the migration does this; to do it by hand in the dashboard instead):
1. Storage → New bucket → name `designs` (or your `SUPABASE_STORAGE_BUCKET`).
2. Leave **Public bucket off**.
3. Restrict file size to 10 MB and allowed MIME types to `image/png, image/jpeg, image/webp,
   image/gif`.
4. Add no policies. The server uses the service-role key, which bypasses Storage RLS.

- `messages.seq` is the chat panel's message number, so a retried save cannot duplicate a
  message. `messages.images` is `[{ id, name, path }]`.
- **RLS is on for every table with no policies**, and `anon`/`authenticated` have no grants.
  Only the service-role client in `lib/supabase/server.ts` can read or write (D59).
- Ownership is `user_id`, checked on the server, not RLS: **every query in `lib/db/` filters on
  it** (D77).
- PLANNED: `profiles (id, email, plan, credits)` and owner policies (`user_id = auth.uid()`).

---

## 6. Environment Variables

Template: `.env.example` (committed). Real values go in `.env.local` (git-ignored) and in Vercel.

Public (browser-safe, `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_SUPABASE_URL` — used (server-side only for now)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — PLANNED with auth
- `NEXT_PUBLIC_SITE_URL` — used

Secret (server-only, never committed):
- `SUPABASE_SERVICE_ROLE_KEY` — used; the service_role or newer `sb_secret_…` key
- `SUPABASE_STORAGE_BUCKET` — optional, defaults to `designs`
- `ADMIN_EMAILS` — comma-separated emails that can open `/admin` (D84)
- `QUOTA_SECRET` — random secret for the free-tier HMAC keys (D83); `QUOTA_EXEMPT_EMAILS` — emails with no free limit
- `OPENAI_API_KEY` — used
- `OPENAI_TEXT_MODEL` — used for the art director; **`gpt-6-luna`** (owner's choice, 2026-09-27)
- `OPENAI_IMAGE_MODEL` — used for images; **`gpt-image-2.5-flare`** (owner's choice, 2026-09-27); `gpt-image-2.5-sunburst` if quality matters more than speed
- `OPENAI_TEXT_REASONING_EFFORT` — director reasoning; `low` (default model effort was ~25% slower, no better plans). Supported: none, low, medium, high, xhigh, max
- `OPENAI_IMAGE_QUALITY` — image quality; `medium` (default `high`/`auto` was ~25% slower, no visible gain). Renders are WebP at 85%
- `OPENAI_TEXT_REASONING_EFFORT` — optional (`minimal | low | medium | high`), passed to the art
  director only when set; lower is faster
- `ALLOW_UNAUTHENTICATED_GENERATION` — kill switch; the turn and render routes return 403 unless
  exactly `true`. Local `.env.local` only, until auth ships (D65).
- `STRIPE_SECRET_KEY` — PLANNED
- `STRIPE_WEBHOOK_SECRET` — PLANNED

Missing Supabase or OpenAI variables make the API answer **503** with a message naming them.
Model ids are never hard-coded.

---

## 7. Modules

### `app/layout.tsx` — root layout
Loads Inter (`--font-inter`) and Newsreader (`--font-newsreader`) through `next/font/google` and
exposes both as CSS variables on `<html>`. Sets document metadata. Uses the Next.js 16
`LayoutProps<"/">` type.

### SEO and discovery — `components/site.ts` and metadata routes
`components/site.ts` is the one source for the site URL (`NEXT_PUBLIC_SITE_URL`), name,
description, the public route list and `OG_BASE`. Everything below derives from it:
- `app/sitemap.ts` → `/sitemap.xml` (public pages only).
- `app/robots.ts` → `/robots.txt` (disallows `/designs`, `/editor`).
- `app/opengraph-image.tsx` → generated 1200×630 share card.
- `app/icon.tsx` (96px, rounded) and `app/apple-icon.tsx` (180px, square) → the app icon: the
  wordmark's "s" over the pen stroke, on ink, drawn by `components/brand/app-icon.tsx`. The pen
  stroke paths are exported from `components/brand/pen-underline.tsx` and reused by all three.
- `app/llms.txt/route.ts` → `/llms.txt`, a markdown summary for AI assistants, built from `SITE`
  and `FAQS`; `force-static`, so it is prerendered.
- JSON-LD (Organization, WebSite, FAQPage) is inlined on `/`.

### `app/globals.css` — design tokens
Imports Tailwind v4 and defines the token layer:

| Token | Value | Use |
|---|---|---|
| `--background` | `#FFFFFF` | white page canvas |
| `--surface` | `#FFFFFF` | raised surfaces (navbar, prompt box, open FAQ row) |
| `--surface-muted` | `#F4F2ED` | quiet resting fills (closed FAQ rows) |
| `--foreground` | `#0D0B0C` | body ink |
| `--ink-900` | `#060505` | display headings, submit button |
| `--ink-700` | `#0F0D0E` | solid CTA button |
| `--ink-500` | `#35312F` | nav links, "Sign in" |
| `--ink-300` | `#807C78` | placeholder / muted text |

The blacks carry a trace of warmth (red a point or two above blue) rather than neutral `#000`,
so they read with the cream canvas rather than cold against it.
| `--line` | `#E8E6E1` | hairline borders |

Tokens are surfaced to Tailwind utilities via `@theme inline`, so `bg-background`,
`text-ink-500`, `border-line`, `font-serif` etc. are available as normal classes. There is no
dark mode — the design is a single warm light theme.

### `app/(marketing)/page.tsx` — landing route
Owns `/`. Composes `<Navbar />` + `<Hero />`. The default `app/page.tsx` was deleted so the
route group serves the root path.

### `components/navbar.tsx` — client component
Brand wordmark (`snapdesign`), three primary links driven by a `NAV_LINKS` array — each entry
carries `label`, `href` and `hasMenu`. "How it works" resolves to `/#how-it-works`; Mockups and
About are still `#`. Then Sign in and the Design CTA.

**Reveal animation.** The bar mounts collapsed to a 56px rounded square, waits
`REVEAL_DELAY_MS` (180ms — enough for first paint, not a deliberate pause), then animates
`max-width` to 1120px over 1150ms on `cubic-bezier(0.16, 1, 0.3, 1)`.

**The animated values are inline `style`, not Tailwind classes — this is load-bearing.** A
stylesheet applies only once loaded; with class-driven `max-width` the bar rendered full width
for the first frames and snapped to the bubble when CSS landed. Inline styles ship in the HTML
and apply during parse. **Do not move `maxWidth`, opacity, visibility, transform or filter back
into classes**; transition properties, durations and easing belong in classes and are fine
there. Because the element is `mx-auto`,
animating max-width grows it from the centre in both directions; the easing carries a slight
overshoot so it reads as a bubble stretching rather than a panel sliding. Contents are
`invisible` while collapsed — **not merely transparent** — which keeps them out of the tab order
during the hold.

It is a client component for this timing. Reduced-motion preference is read through
`useSyncExternalStore` and the open state is derived from it, rather than being assigned from an
effect (which trips `react-hooks/set-state-in-effect`). Container is `max-w-[1120px]`, height `h-14`. Primary links hide below
`md`; "Sign in" hides below `sm`.

**Floating glass bar.** The header is `fixed` at `top-4` with `z-50`, so it sits above the page
and content scrolls underneath it. The bar itself is `rounded-2xl` with `backdrop-blur-xl`,
`backdrop-saturate-150`, a translucent `#FFFFFA` fill, a `border-white/50` edge and a two-stop
shadow. The fill drops from 65% to 45% opacity only under
`supports-[backdrop-filter]`, so browsers that cannot blur keep a more opaque bar and the links
stay readable over the hero photograph. Because the header is fixed, `components/hero.tsx`
carries `pt-28` to clear it — **if the bar's height or top offset changes, that padding must
change with it.**
**Phosphor is imported from `@phosphor-icons/react/ssr`** because this is a server component —
the default entry is client-only and will fail to render on the server.

### `components/hero.tsx` — server component
Centred stack on the white page: a mono **eyebrow pill** ("Describe → Refine → Download"), the
`<h1>` lockup in **IBM Plex Mono** (`font-mono`; "Describe" bold, the rest medium, one size), a
sans subline, then the `PromptBox` (anchor `HERO_PROMPT_ANCHOR_ID`, watched by the docked bar).
Below it, full-bleed, `HeroMosaic`.

### `components/hero-mosaic.tsx` — server component
Nine hand-placed columns of `ShowcaseFrame` cards from `DESIGNS`, each with its own width and
vertical drop, so the showcase reads as a staggered mosaic, not a grid. Runs off both edges,
drifts left in an endless loop (the marquee track), and is cropped by the hero's bottom edge. All sizes are `calc(n * var(--u))`, with `--u` = 0.5px / 0.72px
/ 1px at base / `sm` / `lg`, so it scales as one composition rather than reflowing.

### `components/prompt-box.tsx` — client component
Textarea (max 1000 characters) and a submit button, disabled while the prompt is empty or a
request is running. Reads and writes the shared prompt through `usePrompt()`; renders
`<PromptStudio />` under itself.

### Homepage prompt — `prompt-context.tsx`, `prompt-studio.tsx`, `prompt-handoff.ts`
The homepage never generates. `submit()` saves the prompt to sessionStorage; signed out it goes
to `/signup`, signed in it creates a design and opens the editor, where the prompt waits unsent
in the chat composer (`takeDraft`). `auth-form.tsx` continues the handoff after sign-up or
sign-in. `PromptStudio` shows only "Opening the editor…" or an error.

### Art director — `lib/ai/studio/*`, `app/api/designs/[id]/turn`, `app/api/generations/[id]/render`
- **`constitution.ts`:** the director's rules (actions, never ask about design, elevate generic
  prompts with a concept + one signature move, direction choice, copy, ratio, conflicts, series,
  edits, reply), `DIRECTOR_INSTRUCTIONS` (rules + families + taste index; static for caching),
  `ALWAYS_AVOID`, `KNOWLEDGE_VERSION`.
- **`taste.ts`:** blocks `{ id, name, use, detail }` on axes type (T), color (C), layout (L),
  imagery (I), graphic (G). The model reads `use`; the compiler writes `detail`.
- **`families.ts`:** `screen, slide, document, poster, social, packaging, stationery, logo,
  illustration, other` — guide, copy word limit, render line, natural ratio. `KIND_HINTS` maps
  the editor's type selector to a hint.
- **`spec.ts`:** `TurnPlan`, `DesignSpec`, `PLAN_SCHEMA` (strict), `readPlan` / `readSpec`
  (clean, cap, fall back; a rendering action without a usable spec becomes chat).
- **`director.ts`:** `direct()` — one call, `prompt_cache_key` per knowledge version, full
  specs for the newest 2 assets and one line for older ones, recent directions to avoid.
- **`compiler.ts`:** `compilePrompt` (8 slots: format, concept + signature, composition, type +
  exact copy, colour, imagery + graphics, finish, avoid — each with a word budget, cut at clause
  breaks), `compileEditPrompt`, `compileSeriesPrompt`, `sizeFor(ratio)`.
- **`render.ts`:** `images.edit` with a source image, else `images.generate`.
- **`lib/db/generations.ts`:** `loadStudio`, `insertPlanned`, `claimPending`, `imagePathOf`,
  `markSucceeded`, `markFailed`, `saveStyle`.
- Sizes: 1:1 1024², 4:5 1024×1280, 3:4 1152×1536, 9:16 864×1536, 16:9 1536×864, 3:2 1536×1024,
  4:3 1536×1152, 2:1 1536×768.
- `maxDuration`: 60s turn, 300s render. The old category-playbook pipeline is in `_unused/`.

### `app/(auth)/signup/page.tsx` and `app/(auth)/login/page.tsx`
The two auth routes. Each composes `AuthShell` (with its own promo copy) + `AuthForm` +
`SocialButtons` + `AuthFooterLink`. Both are statically prerendered. Neither route group layout
includes the marketing navbar or footer, so the auth pages stand alone by construction.

### `components/auth/auth-shell.tsx` — server component
Centred white card on a `--auth-canvas` page. `md:grid-cols-2`: a gradient promo panel and the
form panel. The promo panel is `hidden md:flex` — below `md` the card collapses to the form
alone, which is what the narrow viewport needs.
The panel background is a `MESH` constant: six stacked `radial-gradient` layers over a linear
base, reproducing the reference's orange core, blush top-left and cream bottom-right. It is
CSS, not an image, so it resolves cleanly at any size.

### `components/auth/auth-form.tsx` — client component
Serves **both** pages. A `mode` prop selects from a `COPY` map holding title, blurb, password
label, submit label and autocomplete token. Signup uses `autoComplete="new-password"`, login
uses `current-password`; login additionally renders a "Forgot password?" action beside the
password label. `onSubmit` is a stub — no request is made.

### `components/auth/password-field.tsx` — client component
Password input with an Eye/EyeSlash toggle. The button carries `aria-pressed` and an
`aria-label` that changes with state, so the control is reported correctly by screen readers.

### `components/auth/social-buttons.tsx` / `auth-footer-link.tsx` — server components
The provider row (Google, GitHub, Apple) and the signup↔login cross-link. The provider buttons
are presentational; no OAuth is wired.

### Persistence — `components/designs/design-store.ts` → `app/api/designs/*` → `lib/`
The browser never holds a Supabase key. Client components call `design-store.ts`, which calls
our own routes; the routes call `lib/db/designs.ts` and `lib/storage/images.ts` with the
service-role client.

| Route | Does |
|---|---|
| `GET /api/designs` | The signed-in user's designs as summaries (title, settings, prompt/image counts, signed cover). Deletes its designs that have no messages. |
| `POST /api/designs` | Creates a design for the signed-in user. |
| `GET /api/designs/[id]` | Full design: messages (attachments as signed URLs) and generations. |
| `PATCH /api/designs/[id]` | Any of `title`, `settings` (validated against `generate-options.ts`), `coverId`. |
| `DELETE /api/designs/[id]` | Deletes the rows, then every stored image of the design. |
| `POST /api/designs/[id]/uploads` | `{ files: [{ type, size }] }` → signed upload URLs `[{ path, url }]`. |
| `POST /api/designs/[id]/messages` | `{ messages, title? }`; attachment paths must be this design's upload paths. |

- **Attachments** go browser → Storage directly: the store asks for upload slots, PUTs each
  file to its signed URL, then saves the message with the paths. Vercel caps function request
  bodies at 4.5 MB, below one 10 MB image (D61).
- **Reading images:** the bucket is private; every load re-signs paths for 1 hour
  (`SIGNED_URL_SECONDS`). Images are plain `<img>`, not `next/image`, which would cache past
  expiry.
- **Ownership (D77):** every route starts with `requireUser()` (401 when signed out); a design
  of another user gets the same 404 as a wrong id. `proxy.ts` refreshes the session and sends
  signed-out visitors of `/designs` and `/editor` to `/login?next=…`.
- **Auth flows:** sign-up (confirmation email, resend), sign-in, `/forgot-password` → email →
  `/auth/callback` → `/reset-password`, sign-out and rename from the account menu. Supabase's
  default mailer is for testing only; production needs custom SMTP.
- **Errors:** `lib/api.ts` `respond()` — `HttpError` messages go to the client, missing env is
  503, anything else is logged and answered with a generic 500.
- **Shared shapes:** `components/designs/design-model.ts` (types, `DEFAULT_SETTINGS`,
  `titleFromPrompt`, `coverOf`, image limits) is a plain module used by both sides. Generate
  option lists moved to `components/editor/generate-options.ts` for the same reason;
  `generate-context.tsx` re-exports them.
- `uploadGeneration()` (storage) is called by `/api/generations`; generation records live in
  `lib/db/generations.ts`.

### `app/(app)/editor/page.tsx` — the workspace
Post-auth landing surface. Metadata plus `<EditorShell />`.

### `components/editor/editor-shell.tsx` — client component
A `h-screen` flex row: chat panel, resizer, `CanvasStage` (`flex-1`, `min-w-0`), resizer,
inspector. `overflow-hidden` on the wrapper so the shell never page-scrolls; only the side
panels scroll internally.

**The shell owns both side-panel widths.** `ChatPanel` and `Inspector` are `w-full` and
width-agnostic — do not reintroduce a fixed width inside them, or dragging will appear to do
nothing. The canvas is `flex-1`, so it absorbs whatever the sides release.

Widths are applied through a CSS variable and a `md:` class (`w-full md:w-[var(--chat-w)]`), not
an inline `width` — the panel must be full-bleed below `md` while the same drag value still
drives desktop.

**Below `md` only the chat panel renders.** The canvas, inspector and both resizers are hidden;
the generate settings move into the chat panel instead.

### `components/editor/generate-context.tsx` — client component
Holds ratio, kind and count, plus the option data. **The state is here because the controls
render in two places** — the inspector on desktop and inside the chat panel on mobile. Local
state would give each copy its own selection, and they would disagree as soon as the viewport
crossed the breakpoint.

### `components/editor/panel-resizer.tsx` — client component
A 5px grab strip drawing a 1px hairline. The strip is deliberately wider than the line, because
a 1px hit target cannot be grabbed reliably. Uses `setPointerCapture` so a fast drag survives
the cursor leaving the handle. `role="separator"` with arrow-key support and double-click to
reset. The panels carry no side borders — this hairline is the divider.

**Route naming:** this is `/editor` rather than the `project/[id]` route sketched in §3, because
no projects table or record exists yet to key an id off. When projects land, this becomes
`app/(app)/project/[id]/page.tsx` and these components move with it unchanged.

### `components/editor/asset-sidebar.tsx` — server component
Project switcher (the top row), assets header, search, and a two-column folder grid from an
`ASSET_FOLDERS` array. Entirely presentational — the search input filters nothing and folders
do not open.

### `components/editor/canvas-stage.tsx` — client component
The open stage, the Upscale action and the tool bar. Holds one piece of real React state:
`activeTool`. There is no clip header — the dotted canvas runs to the top of the panel.

**Cursor comet.** Three layers share one 18px dot lattice: the resting grid (`.canvas-dots`), a
wide slow-following `.canvas-comet-tail`, and a tight fast-following white `.canvas-comet-head`.
Each comet layer is the same dot pattern revealed through a radial mask centred on a CSS
variable. A `requestAnimationFrame` loop eases head→cursor and tail→head; the lag between them
is the trail. **Pointer position is held in refs and written as CSS custom properties, never as
React state** — it changes every frame, so state would re-render the whole panel 60 times a
second. Styles live in `app/globals.css`; easing constants live in the component.

The dot grid is applied to the stage `<section>` itself — `#0F1012` with 1px white
dots at 38%. **The pitch comes from `--dot-gap`, set from zoom**, and `.canvas-dots` plus both
`.canvas-comet` layers all read it; they must never diverge or the comet's bright dots stop
landing on the grid's dim ones. At 100% the pitch is `BASE_DOT_GAP` (18px) — so the whole centre panel is the canvas. There is no artboard
rectangle, no selection chrome and no size badge; nothing is placed on it, because there is no
document model and no media pipeline.

### `components/editor/generate-controls.tsx` — client component
The "Generate" section at the top of the inspector: ratio, design type and variation count.

**Ratio swatches are drawn to true proportion.** A single `SWATCH` constant fixes the longest
side and the short side is derived from the ratio, so adding a ratio means adding one row to
`RATIOS` — no per-shape sizing. Each swatch is centred in a fixed `SWATCH`-height box; without
that, portrait and landscape shapes push their labels to different heights and the grid reads
ragged.

**Design types are capped at four and deliberately exclude apps and dashboards.**

**The variation control uses one sliding thumb**, not four independent fills — an absolutely
positioned element translating between segments, so the selection glides.

State is local and nothing reads it; there is no generation pipeline to configure yet.

### `components/editor/zoom-context.tsx` — client component
`ZoomProvider` holds the canvas zoom (25%–400%) and wraps the whole editor, because the canvas
owns the gesture while the inspector displays the number.

It exposes **`zoomBy(factor)` rather than `setZoom(value)`** — implemented with the state updater
form, so a wheel handler never has to read the current zoom. That keeps effect dependencies
stable and avoids syncing a ref during render, which React forbids.

### `components/editor/inspector.tsx` — client component
An "Editor" heading, `<ZoomControl />`, and `<GenerateControls />`. That is the whole panel.
The Chat tab it used to carry was removed — the left panel is the chat, and a second entry point
for it duplicated that.

It previously carried a full video-editor property stack (Time, Transform, Layout, Appearance,
Fill, Source, Stroke, Shadow) copied from the reference screenshot. All of it described a video
clip and was removed — **do not reintroduce those sections**; this product generates design
images, not timeline clips.

### `components/editor/controls.tsx`
Just `SectionHeader` now. The row primitives (`Row`, `Field`, `SelectField`, `IconButton`)
existed only for the removed property stack and went with it.

### `app/not-found.tsx` — server component
The 404 page. Next.js routes **all** unmatched URLs here via the `not-found.js` file convention,
and returns a real 404 status. Renders the navbar, the artwork, a serif heading, copy, actions
and suggestion links.

Two artworks, one per breakpoint: `/errors/404-desktop.png` (landscape) shows at `sm` and up,
`/errors/404-mobile.png` (portrait) below it. A landscape lockup reads badly in a narrow column, which
is why both exist rather than one image scaling.

`components/not-found-actions.tsx` is a small client component holding the two buttons — "Try
again" needs `router.refresh()`, so it is split out to keep `not-found.tsx` a server component.

**`global-not-found.js` is deliberately not used.** It is experimental, bypasses the root layout
(so styles, fonts and theme must be re-imported), and is only required with multiple root
layouts or a top-level dynamic segment. Neither applies.

### `components/icons/brand-logos.tsx`
Official third-party brand marks as inline SVG: `GoogleLogo` (four-colour, 48×48 viewBox),
`GithubLogo` and `AppleLogo` (monochrome `currentColor`, 24×24). Each takes `size` and
`className` and is `aria-hidden` + `focusable="false"` — the surrounding control supplies the
accessible name.
**These are deliberately not Phosphor icons** — see decision `D18`. Add future provider or
partner logos here, and keep using Phosphor for every functional UI icon.

### `components/how-it-works.tsx` — server component
"How it works": centred serif heading, a subline with "finished design" in the accent, then
three cards — **Describe** (dark), **Design** (light, centred), **Download** (dark) — and a
"Getting started is simple" caption. Each card carries an SVG illustration of its step from
`components/how-it-works-art.tsx`: **Describe** — suggestion chips over a prompt box that types
"a poster for a coffee roaster" with a riding caret; **Design** — an editor canvas with a real landing page, its headline selected, and a
Variations panel (Vestra / Virella / Solvena) whose pick steps 1→2→3 as the canvas cross-fades;
**Download** — the finished poster tipped up, a large orange download badge with a bobbing
arrow, and a `snapdesign.png · 4096 × 4096` file chip whose bar fills. Dark cards keep a grain
overlay; Describe keeps SVG cloud haze. Motion is `.hiw-*` in `globals.css`, off under reduced
motion.

### `components/design-range.tsx` — server component
"Design anything": centred heading and subline, then a four-tile bento (`md`: 3 columns × two
300px rows). **Websites** (wide, soft green) — a real landing page in a browser window bleeding
off the corner, headline and a "Landing pages · Hero sections" badge; **Marketing** (tall, blush-to-sage) — a chat request "Turn
this into an Instagram carousel", then a mock Instagram post whose slides are real posts cropped
from the 3×3 Suvo grid, swiping on a 12s loop with synced dots and "n/5" counter
(`.carousel-*`), and a "5 slides, ready to post" reply; **Invoices** (cream) — four real invoices scattered at
odd angles like papers on a desk (they fan out on hover), a "Paid" ping, caption over a fade; **Slides & graphics** (light blue) — a "Pitch deck for a coffee
brand" search bar over a grid of real deck, poster and sticker thumbnails. Stacks on phones.

### `components/footer.tsx` — server component
Dark inverted footer. Two layouts from one data source (`components/footer-data.ts`): a
`md:grid-cols-6` desktop grid, and a `md:hidden` mobile stack. Both end with `<Wordmark />`.
Phosphor imported from `@phosphor-icons/react/ssr`.

**`Wordmark`** renders the oversized brand name as SVG `<text>` with
`textLength="1000" lengthAdjust="spacingAndGlyphs"` inside a `0 0 1000 215` viewBox. This makes
the word fit the container width *exactly* at any viewport — a CSS `font-size` (even with
`clamp`) cannot, because the rendered width depends on font metrics. `fontSize="190"` is chosen
so the natural width is already close to 1000, keeping glyph distortion imperceptible.
**If the brand name's length changes, retune `fontSize`** or the glyphs will visibly stretch or
squash.

**`BrandMark`** is a placeholder — a bordered circle containing "s". Replace with real logo art.

### `components/footer-accordion.tsx` — client component
Mobile-only accordions, one panel open at a time. Animates via
`grid-rows-[0fr]` → `grid-rows-[1fr]` on a wrapper with an `overflow-hidden` child, which
transitions to the panel's natural height without measuring it in JavaScript. Collapsed links
carry `tabIndex={-1}`.

### `components/newsletter-form.tsx` — client component
Email input plus `ArrowRightIcon` submit. `onSubmit` is a stub — no mailing list is wired.

### `public/hero-crowd.jpg`
Former hero background photograph. **No longer referenced** — the hero now shows real designs
(`HeroMosaic`). Still in `public/` pending the owner's go-ahead to delete it (see changelog 91).
