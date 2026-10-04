# Changelog

> Append-only. Newest entry on top. Never edit or delete a past entry — corrections are new
> entries. Every change to the project gets logged here.

---

## 2026-10-04 (141)

### Docs & security — GitHub repo check, README corrected
- Repo `the-mayankpal/snap-design-ai-` is **public**. Scanned every commit: no real key, token or
  admin email is tracked; the only key-shaped strings are README placeholders (`sk-proj-...`).
  Only `.env.example` of the env files is tracked.
- `npm audit`: 0 vulnerabilities in production dependencies; 5 high in dev tooling (`braces`,
  via the ESLint toolchain, never shipped). Left alone: the fix is a forced breaking upgrade.
- README fixes: 46 taste blocks (said 37+); component tree matched to real folders (no
  `canvas/` or `ui/`); env example no longer names outdated models and uses the real image
  quality values (`low | medium | high`); "server-only" claim made accurate; added safe-redirect
  and authenticated-API notes, Supabase auth setup steps, a **Deploy to Vercel** section and
  a security contact.

---

## 2026-10-04 (140)

### Fixed — Vercel build failed prerendering /admin
- Vercel build: `Error occurred prerendering page "/admin"` — "Sign-in isn't configured". The
  project had no Supabase env vars on Vercel, and `authClient()` checked the config *before*
  reading cookies. The throw came first, so Next never saw the cookies read that marks /admin as
  per-request, treated it as static and tried to prerender it.
- `lib/supabase/auth.ts`: `authClient()` now reads cookies first. Verified: `next build` passes
  with the Supabase env vars blank and with them set; /admin stays `ƒ` (dynamic).
- Still required on Vercel: every variable in `.env.example`. `NEXT_PUBLIC_*` values are baked
  in at build time, so add them and then redeploy.
- Checked the GitHub repo: only `.env.example` is tracked; no secret value appears in any commit.

---

## 2026-10-03 (139)

### GitHub & Documentation
- Rewrote root `README.md` with a comprehensive, production-grade guide covering the complete snapdesign.ai architecture: Art Director engine, 37+ taste blocks across 5 axes, FigJam-style free-board canvas editor, multi-vector HMAC-SHA256 quota anti-abuse system, database migrations, and environment setup.
- Updated `.gitignore` to explicitly ignore loose generation scratch files (`butterfly.png`).
- Verified zero secret leakage across codebase; verified `.env.local`, `.DS_Store`, build artifacts, and sensitive keys are strictly excluded from git tracking.

---

## 2026-10-03 (138)

### Security — pre-deploy check
- **Fixed open redirect after sign-in.** `?next=` was accepted if it started with "/" and not
  "//", but browsers read `/\evil.com` (and `/<tab>/evil.com`) as `//evil.com`, so
  `/login?next=/%5Cevil.com` sent people to another site after signing in; the proxy did the same
  for signed-in visitors. One shared `lib/safe-next.ts` now resolves the value like a browser and
  only keeps it if it stays on this site. Used by `proxy.ts`, `app/auth/callback` and the sign-in
  form (`safeNext` re-exported from `lib/supabase/browser.ts`).
- **Security headers** on every response (`next.config.ts`): HSTS (2 years), CSP
  `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`,
  X-Frame-Options DENY, nosniff, Referrer-Policy strict-origin-when-cross-origin,
  Permissions-Policy (camera, microphone, geolocation, topics off), COOP same-origin.
  `X-Powered-By` removed. No script CSP: it would need nonces and make every page dynamic.
- `.env.example` lists every variable the app reads (added `OPENAI_IMAGE_QUALITY`,
  `QUOTA_SECRET`, `QUOTA_EXEMPT_EMAILS`, `ADMIN_EMAILS`; fixed a misplaced comment). The
  generation kill switch comment now says what it is: it must be `"true"` on Vercel or the chat
  and render routes answer 403.
- `supabase/setup-all.sql` rebuilt from all 11 migrations (it stopped at 0004, missing auth
  owner, pins, order and the free tier). Old copy in `_unused/supabase/`.

### Verified (production build, `next start`)
- `next build` and `eslint` pass. Every API route answers 401 signed out; /designs, /editor and
  /admin redirect to /login; /admin is also `notFound()` for non-admins.
- Every data query is scoped by `user_id`; upload paths are picked by the server.
- No server secret (OpenAI key, service-role key, `QUOTA_SECRET`, admin/exempt emails) appears
  in the client bundle or prerendered HTML.
- Database: RLS on every table with anon/authenticated revoked; bucket private (signed URLs,
  10 MB, image types only); `take_free` / `refund_free_image` executable by service role only.

---

## 2026-10-02 (137)

### Fixed — heading hierarchy audit
- Audited the h1–h3 outline of /, /about, /showcase, /terms, /privacy, /signup. Each has exactly
  one h1 and no skipped levels in the content.
- Footer column titles (Browse, Company, Legal) were h3s that landed under whatever section came
  before the footer (the FAQ on the home page, the h1 on /showcase, skipping a level). They are
  now labelled `<nav>` groups with a plain title.
- Home "Design anything": two of the four tiles had a heading. The slides caption is now an h3
  and the social tile has a screen-reader-only h3, so all four are covered.
- Left as is: /showcase has an h1 only (the gallery is one mixed grid with no sections);
  /signup has an h1 only.

---

## 2026-10-02 (136)

### Added — /favicon.ico and fuller home-page structured data
- `/favicon.ico` (`app/favicon.ico/route.ts`) now answers 200 with the same icon as `/icon`
  instead of a 404.
- Organization `logo` is now a 180×180 `ImageObject` (`/apple-icon`) instead of the wide share
  image. New `SoftwareApplication` entry (web, DesignApplication) linked to the organization.
- `sameAs` is still omitted: there are no real social accounts yet. Add the URLs to the
  Organization entry (and `footer-data.ts`) when they exist.
- Page weight (~330 KB home HTML) is not changed; needs a Lighthouse run on a production build.

---

## 2026-10-02 (135)

### Fixed — footer headings and duplicate id (SEO audit item 7)
- "Currency" is a plain label (`<p>`), not an h3, and its button has an accessible name. "Follow"
  was already gone with the dead links (133).
- The newsletter form rendered twice (phone + desktop footers) with the same `id`
  (`newsletter-email`), which is invalid HTML and tied both labels to the first input. It now
  uses `useId`. No duplicate ids remain on the home page.

---

## 2026-10-02 (134)

### Changed — SEO pass on the home page: wording, robots, sitemap
- Title: "snapdesign — AI design generator: describe it, get a design" (59 chars). Description cut
  to 148 chars (was 169, which search results truncate) and now names the AI design generator.
  Both live in `SITE` (`components/site.ts`), so social cards, `llms.txt` and the OG image alt
  follow. The old "yours to keep" line is gone from the description (still on the page and in
  the FAQ).
- `robots.txt`: also blocks `/admin`, `/api/` and `/auth/`; dropped the Yandex-only `Host:` line;
  AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User,
  PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended) are explicitly allowed on
  public pages, with the same private paths blocked.
- Sitemap: `lastmod` is now a real per-page date (`updated` in `PUBLIC_ROUTES`; Terms/Privacy
  follow their "Last updated" date) instead of the build/request time. Bump a page's date when
  its content really changes.

---

## 2026-10-02 (133)

### Changed — SEO pass, items 4–6 (descriptions, alt text, dead links)
- `/login`, `/forgot-password`, `/reset-password` and the 404 page now have their own meta
  descriptions instead of repeating the home page's.
- One alt text per showcase image: new `altOf(src)` in `components/showcase-data.ts` (the gallery
  list plus the two invoices only on the home page). The home bento, invoices tile and /about now
  use it, so Lumen, Vestra, Sunsip, Marmita, Vanta, Suvo and the portfolio poster read the same
  everywhere.
- Footer: `SOCIAL_LINKS` now keeps only accounts with a real link (all three were `#`), and the
  "Follow" block is hidden while there are none. Add a real `href` in `footer-data.ts` and it
  comes back. The newsletter stays in the last desktop column.

---

## 2026-10-02 (132)

### Changed — SEO pass on /about and /showcase
- `/about`: title "About snapdesign, the AI design generator" (absolute, no brand suffix);
  description names the product as an AI design generator. The real headline ("We turn a
  sentence…") is now the h1 and the wordmark a `<p>`; the three belief headings are h2 (were h3).
  The intro note now says snapdesign is an AI design generator. Look unchanged.
- `/showcase`: title "Mockups & AI design examples", h1 "AI designs made with snapdesign",
  description updated. `llms.txt` link label matches.
- Added structured data: `AboutPage` on /about, `CollectionPage` + `ImageObject` list (all
  gallery designs) on /showcase, via new `components/json-ld.tsx`.
- Still open from the audits: home-page title/description wording, robots.txt rules, sitemap
  dates, Organization logo/sameAs, dead footer `#` links, repeated footer headings.

---

## 2026-10-02 (131)

### Added — strict free tier: 5 images for life (D83)
- Each image is counted against the normalised email (lowercase, `+tags` dropped, Gmail dots
  dropped), the network (IP; IPv6 cut to /64) and the browser (`sd_device` httpOnly cookie). If
  ANY of them has used 5, the request is refused, so a new account on the same laptop or Wi-Fi
  gets nothing new. Only HMACs are stored (`free_usage`, migration 20261002000010).
- Turn route refuses before the AI call once images are used up (also a 25-turn lifetime cap).
  Render route takes the image atomically (`take_free`) before calling OpenAI; a failed or
  blocked render gives it back (`refund_free_image`); a stored image always counts.
- Disposable inbox domains and unconfirmed emails get 0 free images.
- Editor shows "N of 5 free images left" above the chat box; at 0 the message stays and sending
  is disabled. `GET /api/usage` added. 402 = free limit.
- `QUOTA_EXEMPT_EMAILS` (the owner) has no limit.
- Tested: 10 simultaneous requests → exactly 5 granted; new email in a used browser → refused;
  refund returns exactly 1; publishable key can't call the functions (401); full app run with
  throwaway accounts (refused at 5 in 0.6 s with no model call; 4 → one real render → 0 left →
  refused; disposable → 0; `+tag` of a used email → 0). Test accounts deleted.

### Added — drag to reorder dashboard cards (D82)
- Drag a card to move it; cards move live within their own section (Pinned or All designs) and
  the order is saved once on drop (`PUT /api/designs/order`, `designs.position`). Mouse drags
  after 6 px; touch needs a 350 ms press-and-hold, so swiping still scrolls. The click that ends
  a drag doesn't open the design. Never-arranged designs come first, newest-edited first.
- Layout is now row-by-row masonry (item i in column i % columns) instead of CSS columns, so a
  card's new place is predictable. Pinned designs follow the saved order instead of pin time.
- Tested in Chrome: drag last → first, order kept after reload, plain click still opens the
  editor, phone layout fine. Test order reset afterwards. Touch hold not yet tried on a real phone.

---

## 2026-10-02 (130)

### Added — owner's users page (`/admin`)
- One page, one card per account: email, verified or not, sign-in method, joined, last sign-in,
  last active, free images used ("N of 5", or "No limit" for exempt emails), totals (designs,
  images, failed renders, prompts), the 8 newest images with their notes, and an expandable list
  of every design with all the prompts typed into it. Newest activity first.
- Owner only: `ADMIN_EMAILS` (new env var). Anyone else gets a 404, and signed-out visitors are
  sent to login (`/admin` added to the proxy's private paths). Verified with a throwaway account
  (404) that was deleted afterwards.
- `lib/db/admin.ts` reads everything with the service role in a few queries; `lib/quota.ts` added
  with the free-tier email key (normalised email → HMAC) shared with the coming quota (D83).
- Confirmed the data model is one-owner: auth user → designs (`user_id`, cascade delete) →
  messages + generations (`design_id`, cascade delete). No design is without an owner.

---

## 2026-10-02 (129)

### Added — dictation on the homepage prompt
- A mic button beside the send arrow in the hero prompt box and the docked bar. One shared
  dictation state lives in `PromptProvider`, so both bars show the same listening state and
  speech lands in the one prompt. Listening = brand orange with a stop icon; sending stops it;
  errors (e.g. mic denied) show in the hero box. Hidden where the browser has no speech recognition.
- `use-dictation.ts` moved from `components/editor/` to `components/` (shared now);
  `components/mic-button.tsx` added.

---

## 2026-10-02 (128)

### Changed — homepage prompt designs straight away
- A prompt carried from the homepage (directly, or after the sign-up confirmation link) is now
  sent automatically as the editor opens, instead of waiting unsent in the composer — the user
  found the flow "stopped and did not design". `ChatPanel` `initialDraft` → `autoSend`, sent once
  (ref-guarded). Still nothing generates on the homepage itself.

---

## 2026-10-02 (127)

### Fixed — underwear / swimwear requests blocked by the image filter (knowledge `k8`)
- "Poster for my men's underwear brand" failed twice with `moderation_blocked` after ~14s: the
  director planned waist-to-thigh crops of a model. `moderation: "low"` did not help.
- Constitution §12: for underwear, lingerie and swimwear the product is the hero (folded, flat
  lay, waistband, packaging, hanger, fabric); people only fully clothed, full-figure, never cropped
  to torso/hips/thighs.
- Verified end to end: same request rendered first time (plan 7.1s + render 12.0s).

### Notes
- Current timings (k7–k8, WebP medium): plan 5–8s, render 11–15s, ~20s total — down from
  30–70s on 2026-10-01.

---

## 2026-10-01 (126)

### Changed
- `components/brand/wordmark.tsx`: one wordmark with the orange pen stroke, sized in `em` from the
  navbar's proportions. Now used in the editor chat header, the dashboard header and the sign-in
  pages, so the logo matches the homepage everywhere.
- Editor top bars 44/48px → 56px. "New design" in the chat header, the theme toggle and the zoom
  control are 36px chips on `ed-field` with a hairline ring; zoom is one segmented pill (− | % | +)
  with bold icons and 13px figures.

### Pending
- Dashboard drag-to-reorder (D82) waits on migration `20261001000009_design_position.sql`.

---

## 2026-10-01 (125)

### Changed
- Dashboard card pin and delete buttons: 32px near-black chips (85%) with a white hairline ring,
  a soft lift shadow, bold white icons and a 1px hover lift; delete turns its icon red on hover.
  Pinned stays solid blue. Readable over light and dark covers.

---

## 2026-10-01 (124)

### Added — pin designs (D81)
- Migration `20261001000008_design_pin.sql` adds `designs.pinned_at` (run before the code shipped).
- Dashboard: a pin button beside delete on each card (hover; always shown on touch, and solid blue
  when pinned). Pinned designs get their own section at the top, newest pin first. Optimistic,
  restored on a failed save.
- `pinDesign` (DB, store); `DesignSummary.pinnedAt`; `PATCH /api/designs/[id]` accepts `pinned`
  and no longer bumps `updated_at` for an empty patch.

---

## 2026-10-01 (123)

### Removed
- The generating card (entry 122), at the user's request — it read as vague. The plain pulsing
  placeholder is back; `generating-card.tsx` moved to `_unused/components/editor/`, its CSS removed.

---

## 2026-10-01 (122)

### Changed — the image being made looks alive
- `components/editor/generating-card.tsx` replaces the pulsing box: a solid card with a wireframe
  of the design's shape (copy, button, image area; wide or tall layout) whose blocks breathe in
  turn, a flat `ed-blue` scan line sweeping down, and below it a progress bar easing toward 95%,
  a stage line ("Composing the layout" → "Setting the type" → "Rendering details" → "Adding
  final touches" → "Almost there") and elapsed seconds — at constant screen size.
- CSS `gen-block` / `gen-scan`; both still under reduced motion. Flat colours, no gradients.

---

## 2026-10-01 (121)

### Added — notes on canvas images (D80, knowledge `k7`)
- Migration `20261001000007_generation_note.sql` adds `generations.note`.
- Canvas: a note line under each image (same screen size at any zoom): the note, or "Add note"
  on hover / when selected. Click to edit; Enter or blur saves, Esc cancels. Final notes show a
  pin. Stacking gap 48 → 64 so labels above and notes below never collide.
- `PATCH /api/designs/[id]/generations/[generationId]` `{ note }`; `saveNote` (DB, store);
  `isFinalNote` / `MAX_NOTE` in the design model. Failed saves restore the old note.
- Director gets `[note: "…"]` on each asset; constitution §10 explains final notes, other notes as
  feedback, and silence as approval. A final note sets the project style when saved.

---

## 2026-10-01 (120)

### Changed — short replies, no visible thinking (knowledge `k6`)
- Constitution §11: the reply is one line of at most 14 words saying what was made or changed —
  no reasoning, assumptions, choices, process or "kept the rest the same"; one short clause only
  when sample content stands in for a real fact. Suggestions are at most 4 words.
- §2 no longer asks the director to explain what it assumed; it invents silently.
- Code caps: `reply` 400 → 160 characters, `suggestion` 40 → 32.
- Sampled: "Here's a Matchau poster for iced matcha in Delhi." / "Here's a menu for Hearthline
  Pizza. Send your real prices to swap them in."

---

## 2026-10-01 (119)

### Changed — images appear whole, never in strips
- `components/loaded-img.tsx` (plain `<img>`) and `components/fade-image.tsx` (`next/image`):
  hidden until fully downloaded and `decode()`d, then a 300ms fade. Images already cached show
  straight away. Reduced motion skips the fade.
- Used on dashboard cards, canvas images, chat thumbnails and the homepage showcase frames, each
  over a flat placeholder (`ed-field` / `ed-raised` / `frame`).

---

## 2026-10-01 (118)

### Changed — speed (measured 2026-10-01)
- Renders are WebP at 85% and `quality: "medium"` (`OPENAI_IMAGE_QUALITY`): ~2.5 MB PNG → ~170 KB,
  and ~25% faster (17.8s → 13.5s on a 1152×1536 test) with no visible difference.
- Director runs at `OPENAI_TEXT_REASONING_EFFORT=low` (8.5s → 6.4s on the same turn).
- Signed image URLs are reused for 50 of their 60 minutes, so an image keeps one URL across page
  loads and the browser caches it; generated images upload with a 1-year `cacheControl`.
  Previously every load re-signed and re-downloaded every image.
- Edit sources are sent with their real type (WebP or PNG).
- Thumbnails in the dashboard and chat load lazily and decode off the main thread.

### Fixed
- Image `alt` text on the canvas, chat thumbnails and dashboard cards was the prompt, which could
  show in place of an image while it loaded. Those images now have empty `alt` (their button or
  card already names them).

### Notes
- Images made before this change stay PNG (no image library to convert them).

---

## 2026-10-01 (117)

### Changed
- Canvas: the "Cover" badge and "Set as cover" moved from on top of the image to a small text
  label above its top-left corner (like a frame name), so they never hide the design at any zoom.

---

## 2026-10-01 (116)

### Changed
- Dashboard "New design" tile: filled `ed-panel` card with a stronger dashed border, an inverted
  plus disc (`ed-text` on `ed-panel`), a semibold label and a "Describe it in a sentence" hint,
  so it stands out in both themes.

---

## 2026-10-01 (115)

### Added — light and dark everywhere (D79)
- One site-wide choice. With none saved, `data-theme` stays unset and each area keeps its
  default: marketing and sign-in light, editor and dashboard dark. The pre-paint script only
  applies a saved choice.
- Editor and dashboard (`app/(app)/layout.tsx` → `[data-app]`): light `ed-*` token set, canvas
  dots via `--canvas-bg` / `--canvas-dot*`, new `--ed-hairline` token replacing white tints,
  `light:` variant for softer shadows. Toggles in the inspector bar and the dashboard header.
- Sign-in pages (`app/(auth)/layout.tsx` → `[data-auth]`): dark `auth-*` set, new `--auth-card`
  token for the card and button text, error notice dark variant, logo on `auth-ink`. The orange
  promo panel keeps dark text. Toggle in the top-right corner.
- `ThemeToggle` takes a `fallback` (the area's default) and its styling from the caller.

---

## 2026-10-01 (114)

### Added — About page dark theme (D79)
- The theme scope is now `[data-themed]` (was `[data-home]`), on the homepage and the About
  page; the toggle shows on both (`THEMED_PATHS` in `navbar.tsx`).
- Dark tokens add notebook paper (`--paper` #0b0a09, `--paper-rule` #191715) and chalk pen
  lines (`--ink-sketch` #e7e2da); the light reset restores them.
- About: "Start designing" buttons use `text-surface` so they flip with the theme; the Belief
  cards, Polaroids and Tags are `data-keep-light`; tape blends normally on dark paper.

---

## 2026-10-01 (113)

### Changed
- Dark homepage: the prompt bars (`.border-chase`) get a bright white border (32% white) and a
  white chasing streak; the black streak vanished on the dark page.
- The hero prompt box gets the same treatment in dark only (`.border-chase-dark`): 32% white
  border (50% on focus) and the white chasing streak. Light mode unchanged.
- The navbar is always the opposite of its page (`data-invert`): a near-black bar with white
  text on light pages, white on the dark homepage. Its black-tinted borders and hovers now use
  the `line` and `surface-muted` tokens so they work on both. On light pages it uses the
  footer's palette (pure black, `footer-link` grey links, `footer-line` hairlines). The glass
  is now 94% opaque (was 78%): black at 78% over a white page read as mid grey, not black.

---

## 2026-10-01 (112)

### Added — homepage dark theme (D79)
- `components/theme-toggle.tsx` (switch in the navbar, homepage only) and
  `components/theme-script.ts` (pre-paint script, run from `app/layout.tsx` `<head>`).
- `globals.css`: dark token set under `[data-theme="dark"] [data-home]`, light reset for
  `[data-keep-light]`, homepage-scoped `dark:` variant, black body behind the homepage.
- Homepage content wrapped in `[data-home]`; "Design anything" tiles marked `[data-keep-light]`;
  dark hairlines added to navbar, prompt box, showcase frame and step badges.

---

## 2026-10-01 (111)

### Added — free canvas (D78)
- `canvas-stage.tsx` rewritten as a board: drag to move, corner handles to resize (aspect kept),
  drag empty space / scroll to pan, pinch or Ctrl/Cmd + scroll zooms toward the cursor. Dots
  pan with the board. Cover badge, handles and selection outline keep their screen size.
- Layout saved per image: migration `20261001000006_canvas_size.sql` adds `generations.canvas_w`;
  `Generation.frame`, `isFrame`, `saveLayout` (DB and store), `PUT /api/designs/[id]/layout`.

---

## 2026-10-01 (110)

### Fixed — edits came back as near-copies
- The art director only ever saw the text spec of a design, never the rendered image, so vague
  feedback ("I don't like the nav bar") produced an edit that matched what was already there.
- `turn` route now signs the selected image (else the newest) and `director.ts` sends it to the
  text model as a low-detail `input_image`, labelled ATTACHED IMAGE.
- Constitution §10: for "I don't like X", make a clearly visible change to X and say what it
  looks like now and what it becomes. Knowledge version bumped to `k5`.

---

## 2026-10-01 (109)

### Fixed
- Rendering a generation always failed with 500 (PGRST201): `claimPending` in
  `lib/db/generations.ts` embedded `designs` from `generations`, but two foreign keys join them
  (`generations_design_id_fkey` and `designs_cover_generation_fk`). The embed now names
  `generations_design_id_fkey`.
- `.env.local`: Supabase publishable (anon) key filled in, so sign-in sessions reach the server.
- Supabase schema: `designs.device_id` NOT NULL dropped and `designs_user_fk` added (migration
  0005 had not been applied), which made "New design" fail.
- Every render failed with OpenAI `400 invalid_value`: `.env.local` had been switched to
  `gpt-4.1` / `gpt-image-1`, which can't make the compiler's sizes (e.g. 1536×864). Restored the
  D68 models, `gpt-6-luna` and `gpt-image-2.5-flare` (both verified on the key).

---

## 2026-09-27 (108)

### Changed
- The auth promo panel's orange mesh gradient is back (removed in 106), at the user's request —
  an approved exception to the no-gradients rule for this one panel.

---

## 2026-09-27 (107)

### Removed
- The auth mascot (entry 106), at the user's request: `mascot.tsx` and `mascot-store.ts` moved
  to `_unused/components/auth/`; field focus hooks, mascot CSS and tokens removed. The promo
  panel stays flat `--paper-warm` with its headline.

---

## 2026-09-27 (106)

### Added — auth mascot "Snap"
- `components/auth/mascot.tsx` + `mascot-store.ts`: a flat orange rounded-square character on
  the auth promo panel (and small, by the logo, on phones). Eyes follow the pointer, then the
  text as you type; hands cover its eyes while a hidden password is typed; eyes open wide with
  an "o" mouth when the password is shown; head shake + frown on a form error; blinks.
- Text and password fields report focus to the store; `Notice` (error) triggers the shake.
  The show-password button keeps focus in its input.
- Tokens `--mascot-hand`, `--mascot-hand-line`; mascot CSS at the end of `globals.css`
  (transitions and blinks off under reduced motion).

### Changed
- The promo panel's mesh gradient is gone — flat `--paper-warm`, per the no-gradients rule.

---

## 2026-09-27 (105)

### Changed
- Auth screens are more compact: card 1080px → 860px, promo panel 620px → 540px tall, smaller
  heading and logo, 40px fields and button, tighter spacing.
- Mobile: no card or grey frame below `md` — the form sits on plain white with a 20px side
  gutter; inputs use 16px text on phones so iOS doesn't zoom in on focus; `min-h-dvh`.

---

## 2026-09-27 (104)

### Added
- Sign-up has a "Confirm password" field; the form stops with "The two passwords don't match."
  before anything is sent to Supabase.

---

## 2026-09-27 (103)

### Added — Supabase Auth (D77)
- Email + password accounts: sign up (with name, confirmation email, resend with 60s cooldown),
  sign in, forgot password → reset link → choose a new password, sign out, rename.
- `lib/supabase/auth.ts` (`authClient`, `readUser` via `getClaims`, `requireUser` → 401),
  `lib/supabase/browser.ts` (browser client, `safeNext`, `toSignIn`), `proxy.ts` (refreshes the
  session; `/designs` and `/editor` need sign-in, `/login` `/signup` `/forgot-password` send
  signed-in users on), `app/auth/callback/route.ts` (PKCE code or token_hash links).
- Pages `/forgot-password`, `/reset-password`; `components/auth/{auth-ui,check-email,forgot-form,reset-form,account}.tsx`.
- Migration `20260927000005_auth_owner.sql`: `designs.user_id` → auth.users, `device_id` nullable.
- Env `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; dependency `@supabase/ssr`.

### Changed
- Designs belong to the signed-in user: every query is scoped by `user_id`; the device
  cookie is retired (`lib/device.ts` → `_unused/`, `isUuid` → `lib/ids.ts`).
- The homepage prompt gate checks the real session; the pending prompt is kept in
  localStorage so it survives a confirmation link opened in a new tab, and the designs list
  opens it on arrival.
- The fake local account (`account-store.ts`) and the unwired social buttons moved to `_unused/`.

---

## 2026-09-27 (102)

### Fixed
- Listing and opening designs failed with PGRST201 once the schema was live: `designs` and
  `generations` are joined by two foreign keys (`generations.design_id` and
  `designs.cover_generation_id`), so the embed was ambiguous. Both queries in
  `lib/db/designs.ts` now name `generations!generations_design_id_fkey`.

### Added
- `supabase/setup-all.sql`: the five migrations concatenated, for a one-paste setup.

---

## 2026-09-27 (101)

### Added
- `image` asset family (D76) for plain pictures (photo, artwork, scene, wallpaper, product
  shot). Its prompt skips the type, layout and graphic blocks and spends the words on subject,
  medium, the scene's colour and light, and real textures; no text unless asked for.

### Changed
- Anti-slop bans extended: generic clip-art icons anywhere, unrequested text/captions/
  watermarks, plastic or over-smoothed textures. Standing bans now come first in the avoid
  slot (budget 60 words) so the design's own avoids can never crowd them out.
- `KNOWLEDGE_VERSION` → k4.

### Decided
- D76 plain images get their own light prompt.

---

## 2026-09-27 (100)

### Added
- Custom art direction (D75): `DesignSpec.custom` holds a written-out direction per axis when
  the user names a look no block covers (or none fits). It replaces that axis's block detail
  in the prompt and is kept in the project style lock. A ban the user's own choice contradicts
  (e.g. they asked for a gradient or neon) is dropped for that design.
- Nine current, "saved-on-Pinterest" taste blocks: T09 Wide extended sans, T10 Lowercase
  serif with italic mix, C09 Cherry red and cream, C10 Butter yellow and chocolate, L09
  Scrapbook moodboard, L10 Bento grid, I08 35mm film snapshot, I09 Styled flat lay, G07 Tape,
  paper and annotations (46 blocks in total). Constitution asks for work people would save and pin.

### Changed
- `KNOWLEDGE_VERSION` → k3. `ALWAYS_AVOID` entries carry trigger words.

### Decided
- D75 the user's own style choice beats the taste system.

---

## 2026-09-27 (99)

### Added
- Canvas selection (D74): click an image to select it; the chat scrolls to and highlights the
  reply that made it, shows an "Editing this design" chip, and the turn sends `targetId`.
  New images are selected automatically; replies show their image as a clickable thumbnail.
- Migration `20260927000004_message_generation.sql`: `messages.generation_id`.

### Changed
- Anti-slop rules are now their own section of the constitution (gradients, glows,
  meaningless shapes, filler logos and icons, stock 3D, template habits) and `ALWAYS_AVOID`
  is longer; a logo request doesn't ban logos (`AVOID_EXCEPT`). `KNOWLEDGE_VERSION` → k2.

### Decided
- D74 selecting an image focuses the chat on it.

---

## 2026-09-27 (98)

### Added — art-director pipeline (D71–D73)
- `lib/ai/studio/`: `constitution.ts` (director rules, `KNOWLEDGE_VERSION` k1), `taste.ts`
  (37 blocks on 5 axes), `families.ts` (10 families), `spec.ts` (plan schema + validation),
  `director.ts` (one cached Structured Outputs call), `compiler.ts` (8-slot prompt, word
  budgets), `render.ts` (generate, or edit with a source image).
- `POST /api/designs/[id]/turn` (plan + pending generation) and
  `POST /api/generations/[id]/render` (claims, renders, stores, sets project style).
- Migration `20260927000003_art_director.sql`: `generations.spec`, `action`,
  `knowledge_version`, `plan_ms`, `render_ms`; status `rendering`.
- Editor chat: reply first, "Designing…" with a canvas placeholder, then the image;
  suggestion chips under the reply; clarify options as chips.
- `OPENAI_TEXT_REASONING_EFFORT` (optional) in `.env.example`.

### Changed
- Homepage prompt no longer generates: it saves the prompt, sends signed-out visitors to
  sign-up, then opens a new design with the prompt unsent in the chat (`prompt-handoff.ts`).
- Designs gallery shows the server's reason when a new design can't be created.

### Removed
- Router, analyze, clarify question banks, web playbook, compose rules, the text-only
  `/api/chat`, `/api/prompt/analyze` and `/api/generations` — moved to `_unused/` (excluded
  from tsconfig and eslint).

### Decided
- D71 one art-director call, D72 taste blocks + families, D73 project style.

---

## 2026-09-27 (97)

### Added — generation system phase 1: router
- `lib/ai/router.ts`: classifies prompts into 9 categories with a confidence label
  (Structured Outputs). Low confidence → `needs_category`; not enabled → `unsupported_category`.
- `lib/ai/playbooks/index.ts` is now the category registry (`CATEGORIES`, `PLAYBOOKS`,
  enabled = has a playbook); `types.ts` holds `Playbook`/`Question`; the web playbook moved to
  `web/playbook.ts`. Category id `web` → `web_section`.
- `/api/prompt/analyze` accepts optional `category`; `/api/generations` requires `category`
  and accepts optional `projectId` (appends to that design; ownership checked).
- Migration `20260927000002_generation_system.sql`: `designs.style_lock`,
  `generations.parent_id`, `canvas_x`, `canvas_y`; existing `web` rows → `web_section`.
- UI: "What are you making?" category chips (unavailable tagged "Soon") and a coming-soon note.

### Decided
- D69 router, D70 six-phase plan (projects = designs, private bucket, editor result kept per D67).

---

## 2026-09-27 (96)

### Decided
- **D68 — models chosen:** `gpt-6-luna` (text) and `gpt-image-2.5-flare` (images).
- Created a git-ignored `.env.local` with the two model ids filled in; the API keys, Supabase
  values and the kill switch are left blank for the owner. No code changed.

---

## 2026-09-27 (95)

### Added — Prompt Studio (Analyze → Clarify → Compose → Generate), web only
- **`lib/ai/`** (all `server-only`): `pipeline.ts` (analyze/compose/generate, kill switch,
  prompt parsing, provider-error mapping), `core-rules.ts`, `openai.ts`, `playbooks/index.ts`
  (registry + `Playbook` type), `playbooks/web/{parts,questions,rules,examples}.ts`.
- **Routes:** `POST /api/prompt/analyze`, `POST /api/generations` (both 403 without
  `ALLOW_UNAUTHENTICATED_GENERATION=true`).
- **`lib/db/generations.ts`:** pending/succeeded/failed records and the design a success opens in.
- **Migration** `20260927000001_generations.sql`: extends `generations` (renames to
  `raw_prompt`/`final_prompt`/`image_path`; adds `user_id`, `category`, `brief`, `answers`,
  `image_url`, `status`, `error`; `design_id`, `image_path`, `width`, `height` nullable).
- **UI:** `components/prompt-studio.tsx` (progress, chips, errors); `prompt-context.tsx` now
  runs the flow; hero box and docked bar render the panel and disable submit while busy; both
  inputs cap at 1000 characters.
- Packages: `openai` 7.23.0, `server-only` 0.0.1 (approved).
- `.env.example` rewritten as names only, adding `OPENAI_TEXT_MODEL`, `OPENAI_IMAGE_MODEL`,
  `ALLOW_UNAUTHENTICATED_GENERATION`.

### Changed
- `NotConfiguredError` moved to `lib/api.ts`; added `readStrictJson()` (unknown fields → 400).
- `uploadGeneration()` now writes `generations/<id>.png`; `insertGeneration()` removed from
  `lib/db/designs.ts`. Design reads only include `succeeded` generations.

### Decided
- D63 Structured Outputs, D64 stateless one-round clarify, D65 kill switch, D66 final prompt
  server-side, D67 extend existing tables + open results in the editor + private bucket.

---

## 2026-09-27 (94)

### Added — Supabase database and storage (no auth)
- **Schema** `supabase/migrations/20260927000000_designs.sql`: `designs`, `messages`,
  `generations`; RLS on, no policies, no anon grants; private `designs` bucket (10 MB,
  PNG/JPG/WebP/GIF).
- **Server** (`lib/`, all `server-only`): `supabase/server.ts` (service-role client, 503 when
  unconfigured), `device.ts` (`sd_device` cookie), `api.ts` (`respond`, `HttpError`),
  `db/designs.ts` (all queries, scoped by device), `storage/images.ts` (upload slots, signed
  URLs, generation upload, cleanup).
- **Routes:** `GET/POST /api/designs`, `GET/PATCH/DELETE /api/designs/[id]`,
  `POST /api/designs/[id]/uploads`, `POST /api/designs/[id]/messages`.
- `@supabase/supabase-js` 2.117.2 installed (Supabase is in the locked stack).
- `.env.example` added; `.gitignore` now un-ignores it.

### Changed
- **`design-store.ts` calls the API instead of IndexedDB.** Designs made before this change
  stay in the old IndexedDB and are not shown.
- Shared shapes moved to `components/designs/design-model.ts`; generate option lists moved to
  `components/editor/generate-options.ts` (re-exported from `generate-context.tsx`).
- Chat panel `onSend` now receives the added messages and returns a promise; a failed save shows
  a notice. Attachments loaded from a saved design have a signed `url` and no `blob`.
- Editor shows "couldn't be loaded" for server/network errors instead of "couldn't be found".
- Gallery reads design summaries with signed cover URLs; its error copy no longer blames
  browser storage.
- **Privacy page:** designs, chat and attachments are now described as saved on our servers,
  linked to the browser by an essential cookie until accounts exist.

### Decided
- D60 device cookie ownership, D61 private bucket + signed URLs + direct uploads, D62 `designs`
  not `projects`.

---

## 2026-09-26 (93)

### Decided
- **D59 — auth deferred.** Backend begins with Supabase DB + Storage only; Supabase Auth,
  `profiles`, credits and Stripe move to last. Server-only writes via service-role key, RLS on
  with no public policies, nullable `user_id` for a painless auth migration. No code changed.

---

## 2026-09-26 (92)

### Changed — colour system
- **Every brand and supporting colour is now a named token** in `app/globals.css` (`:root` +
  `@theme`), grouped by role: brand accent (`accent`, `accent-soft`, `accent-tint`), hand-made
  layer (`ink-sketch`, `ink-night`, `paper`, `paper-rule`, `paper-warm`, `frame`), supporting
  (`sun`, `cobalt`, `leaf`, `pink`, `rose`, `lilac`, `sage`, `blue`, `periwinkle`) and pastels
  (`mint`, `butter`, `sky`, `tint-sage`, `tint-rose`, `tint-sky`). Values unchanged.
- **New `components/brand/palette.ts`:** `COLOR` (CSS-variable references for SVG attributes,
  inline styles and colour props) and `HEX` (literal values for the share card and app icon).
- ~70 hard-coded hex values replaced with tokens across the About page, scrapbook, How it works
  art, flow icons, bento tiles, invoices tile, showcase frames, pen stroke, OG image and app icon.
  Remaining literals are content colours (mockup window dots, Ember & Bean palette, brand logos).
- **Flattened two leftover gradients:** the marketing tile background (radial pink→green → flat
  `tint-rose`) and the account avatar (blue→violet gradient with glow → flat `cobalt`).
- Architecture doc §3 gains a **Colour** section: the palette by role and the rules.

### Not changed — flagged
- The sign-in / sign-up promo panel (`components/auth/auth-shell.tsx`) is still a mesh gradient
  sampled from the original reference. Left for the owner to decide.

---

## 2026-09-26 (91)

### Changed — asset and SVG structure
- **SVG components grouped:** `components/icons/` (`brand-logos.tsx`, `flow-icons.tsx`) and
  `components/brand/` (`pen-underline.tsx`, new `app-icon.tsx`). Imports updated in hero, about,
  navbar, legal page and social buttons; RULEBOOK §3 path updated.
- **Pen stroke paths shared:** `PEN_STROKE`, `PEN_SECOND_PASS`, `PEN_VIEWBOX`, `PEN_COLOR` are
  exported from `pen-underline.tsx`; the share image no longer keeps its own copy of the path.
- **`public/`:** 404 artwork moved to `public/errors/` (`app/not-found.tsx` updated).
- **`assets/`:** showcase PNG masters moved to `assets/showcase/`; the two original 404 PNGs that
  sat loose in the project root moved to `assets/errors/` (`404-desktop-source.png`,
  `404-mobile-source.png`). New `assets/README.md` explains each folder.
- **Architecture doc §3** now has the folder map and the rule for where images and SVGs go.

### Added — app icon
- `app/icon.tsx` (96px, rounded square) and `app/apple-icon.tsx` (180px, square): the wordmark's
  "s" in Inter ExtraBold over the orange pen stroke, on ink. Replaces the stock Next.js
  `app/favicon.ico`, which was moved (not deleted) to `_unused/favicon.ico`.

### Pending — owner to delete
- Unused files left in place because deleting needs the owner's go-ahead: `public/next.svg`,
  `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`,
  `public/hero-crowd.jpg`, and `_unused/favicon.ico`. `butterfly.png` in the root is also
  unreferenced.

---

## 2026-09-26 (90)

### Changed — `/llms.txt` privacy section
- Privacy moved out of "Optional" (which the llms.txt convention lets assistants skip) into its
  own **Privacy** section summarising the policy's commitments: no AI training on prompts,
  uploads or designs; data never sold; designs private by default; limited sharing with
  providers; no advertising cookies; 30-day deletion; data rights via `LEGAL.email`. Terms get
  their own section. Wording follows `app/(marketing)/privacy/page.tsx` — keep them in step.

---

## 2026-09-26 (89)

### Added — `/llms.txt`
- **`app/llms.txt/route.ts`** → `/llms.txt`: a plain-markdown summary of snapdesign for AI
  assistants (llmstxt.org convention) — title, description, what it makes, the three steps,
  public page links, the FAQ, and Terms/Privacy under "Optional". Built from `SITE` and the
  exported `FAQS`, so it stays in step with the pages. Private app pages are not listed.
  `dynamic = "force-static"`, so it is prerendered at build (GET handlers default to dynamic).

---

## 2026-09-26 (88)

### Added — SEO and site structure
- **`components/site.ts`:** one source for the site URL (`NEXT_PUBLIC_SITE_URL`, default
  `https://snapdesign.ai`), name, title, description, the public route list, and `OG_BASE` /
  `OG_IMAGE` (a page's own `openGraph` replaces the root one rather than merging, so pages spread
  the base in to keep site name, type, locale and image).
- **Root metadata:** `metadataBase`, title template `%s · snapdesign` (pages now set short titles),
  Open Graph and `summary_large_image` Twitter defaults.
- **Per page:** canonical URL, description and Open Graph on `/`, `/showcase` ("Mockups &
  designs"), `/about`, `/terms`, `/privacy`, `/signup`. **`noindex, nofollow`** on `/login`,
  `/designs`, `/editor/[id]`; 404 keeps `noindex`.
- **`app/sitemap.ts`** → `/sitemap.xml` with the six public pages. **`app/robots.ts`** →
  `/robots.txt`: allow all, disallow `/designs` and `/editor`, sitemap and host declared.
- **`app/opengraph-image.tsx`:** generated 1200×630 share card — notebook paper, `snapdesign` in
  Inter ExtraBold with the orange pen stroke, tagline and range. Inter 800/600 TTFs added under
  `assets/fonts/` (the generator's default font has no heavy weight).
- **Structured data (JSON-LD) on `/`:** `Organization`, `WebSite`, and `FAQPage` built from the
  same `FAQS` the page renders (`FAQS` now exported). `<` escaped in the inline script.

### Fixed — broken links
- Footer had five links to pages that do not exist (`/showcase/websites`, `/showcase/marketing`,
  `/showcase/graphics`, `/pricing`, `/help`). Columns are now **Browse** (Home, Mockups, How it
  works, FAQ) · **Company** (About us, Contact) · **Legal** (Terms, Privacy). Every internal link
  resolves (checked with `curl`).

### Still placeholders (need the owner's input)
- Footer social links (Instagram, X, TikTok) and "Forgot password?" point to `#`.

### Verified
- Every page's status, title, canonical, `og:*`, `twitter:image` and robots tag checked over HTTP;
  JSON-LD parses (3 nodes, 5 questions); `next build` prerenders `/sitemap.xml`, `/robots.txt`
  and `/opengraph-image` as static.

---

## 2026-09-26 (87)

### Changed — navbar
- The links (Mockups · How it works · About · FAQ) are **centred in the bar**, positioned
  independently of the brand and the actions; brand left, Sign in / Design right. Checked at
  1440px and 768px (no collision).

### Changed — hero mockups marquee
- **Never pauses** (the hover-to-pause rule is gone).
- **Pushable:** new `components/drag-marquee.tsx` drives the drift with `requestAnimationFrame`
  instead of CSS keyframes. A sideways two-finger trackpad swipe (or shift + wheel) moves it in
  either direction; mouse or finger drag moves it too, and a fling glides with momentum before
  easing back into the drift. Mostly-vertical wheel and `touch-action: pan-y` keep page scrolling
  untouched. Wraps by one measured period (half the track plus half the computed gap), so the
  loop stays seamless at every `--u` scale. Reduced motion: no auto-drift, still draggable.
- The CSS marquee keyframes/rules are removed (nothing else used them).

### Verified
- DevTools at 1440px: hovering, offset 202 → 254 in 2s (still moving); 10 × 60px horizontal wheel
  → +612px; 300px drag right → −300px; after release it drifts again; vertical wheel over the
  mockups scrolls the page 0 → 400.

---

## 2026-09-26 (86)

### Added — two invoices in the showcase
- `DESIGNS` gains the two strongest, most contrasting invoices: **Vanta** (bold dark) and
  **Ashgrove & Tide** (engraved vintage). New `DesignCategory` value `"invoice"`.
- Placed far apart — 3rd and 19th of 21 — chosen by simulating the gallery's shortest-column
  masonry so they land in **opposite columns and at opposite ends** at both 2 columns (phones:
  left-top / right-bottom) and 3 columns (desktop: right-top / middle-low).
- `/showcase` subline and metadata now list invoices.

### Verified
- 390px screenshot of the gallery: both invoices where intended, all 21 images loaded.

---

## 2026-09-26 (85)

### Fixed — the real cause of dead taps on phones
- **The navbar's `<header>` was blocking the top ~340px of the screen on phones.** It holds the
  mobile menu panel, which stays in layout while hidden (`invisible`), so the transparent header
  box stretched far below the bar and captured every tap there. Anything scrolled into the top of
  the screen — often the first FAQ question, or the invoices card — could not be tapped. Desktop
  was unaffected (no menu panel there).
- `<header>` is now `pointer-events-none`; the bar is `pointer-events-auto`, and the menu panel
  only while open.
- Entries 82 and 84 treated symptoms; this is the cause. Their changes stay (native `<details>`
  and checkbox are sturdier regardless).

### Verified
- Touch emulation at 390px, JavaScript on, with each target scrolled to ~150px from the top:
  taps land on the FAQ `<h3>` / invoice `<input>` (previously `HEADER`); FAQ closes and reopens,
  invoices spread and settle.

---

## 2026-09-26 (84)

### Fixed — FAQ and invoices on real phones (no JavaScript required)
Both still failed on the user's phone after 82, where they needed JavaScript. They now use native
browser controls, so they work even if the page never hydrates.
- **FAQ → native `<details>`/`<summary>`.** Tap always toggles; each question opens and closes
  independently (was one-at-a-time); the first starts open. Open styling via `open:` /
  `group-open:`; the answer eases in (`.faq-answer`). No longer a client component.
- **Invoices → a transparent native checkbox** covering the card (`h-full w-full` — an input
  does not stretch from `inset-0` alone). Papers spread under `group-has-[:checked]:` as well as
  `group-hover:`. No longer a client component.
- **Navbar:** added **FAQ** (`/#faq`) — desktop bar and phone menu.
- **`next.config.ts`:** `allowedDevOrigins` for private network ranges (`10.*.*.*`,
  `192.168.*.*`, `172.*.*.*`, `*.local`) so a phone on the LAN gets scripts and live reload from
  the dev server. Dev only; takes effect after restarting `next dev`.

### Verified
- DevTools touch emulation at 390px **with JavaScript disabled**: FAQ open → tap → closed → tap →
  open; Q1 and Q3 open together. Invoice paper −13° → tap → −17° / −8px → tap → −13°.

---

## 2026-09-26 (83)

### Changed — legal pages take a little of About's language
- **Banner:** the dark photo-collage banner is replaced by **notebook paper** (`.lined-paper`)
  with the brand's **orange pen stroke under the title**; ink title, muted subtitle.
- **"Last updated"** is now the flat mono tag used for step labels (date in the accent).
- Everything below — sticky contents, headings, body text — is unchanged: legal text stays
  plain and structured for readability and trust.
- The pen stroke is now one shared component, `components/pen-underline.tsx`, used by the
  navbar wordmark and the legal titles.
- Terms intro no longer repeats its heading ("The short version: …").

### Verified
- /privacy at 1440px and /terms at 390px.

---

## 2026-09-26 (82)

### Fixed — touch devices
- **FAQ answers would not close on phones.** The collapse animates `grid-template-rows` to `0fr`;
  Safari keeps the row at its child's automatic min height, so the answer stayed visible while the
  state (and icon) closed. The inner wrapper gets `min-h-0`. Same fix on the editor's mobile
  Generate-settings panel, which uses the same pattern.
- **Docked prompt bar swallowed taps.** Its wrapper spans the full width at the bottom of the
  screen; it is now `pointer-events-none`, with only the bar itself `pointer-events-auto`.
- **Invoices fan-out now works by tap.** Tailwind applies `hover:` only on hover-capable devices,
  so touch never saw it. `InvoicesTile` moved to a client component
  (`components/invoices-tile.tsx`) that toggles `data-spread` on tap; each paper's spread is
  written under both `group-hover:` and `group-data-[spread=true]:`. `TILE` moved to
  `components/tile.ts` to share it.

### Verified
- Chrome DevTools, touch emulation at 390px: FAQ 1 panel 138px → tap → 0 → tap → 138; invoices
  first paper −13° → tap → −17° / −8px → tap → −13°.

---

## 2026-09-26 (81)

### Changed — navbar wordmark
- A **pen-sketch underline** under `snapdesign` in the accent `#EF7A43`: one filled swoosh that
  thickens mid-way and tapers to a flick at the right, plus a faint short second pass at the start.
  Inline SVG, stretched to the wordmark's width; same on every page and at every width.

---

## 2026-09-26 (80)

### Changed — hero heading
- **"Describe" sits in a design-tool selection box**: a 1.5px frame with six square handles
  (corners and mid top/bottom), white-filled, all in the brand accent `#EF7A43` — the same
  orange as the Describe icon and step numbers. Sized in `em` so it scales with the heading.

### Verified
- Screenshots at 1440px and 390px.

---

## 2026-09-26 (79)

### Fixed — About page on phones
- **The desktop hero tags showed on phones and hung off-screen**, widening the page; mobile
  browsers then zoomed out, so the navbar looked clipped and lost its menu button. Cause: `Tag`
  carried a built-in `inline-block` that beat the caller's `hidden md:inline-block`. `Tag` no
  longer sets a display; the hero also clips decorative overflow (`overflow-x-clip`).
- The phone-only tag row now shows alone, in a tidy wrap under the wordmark.
- Status line on phones: "Now designing everything" on one line (the long version wrapped and
  stranded its dot). Headline icons show from `sm` up so phone lines break evenly.
- Tighter phone spacing throughout; smaller stamp stickers; belief panels with slimmer padding
  and an 82%-wide image; smaller wordmark box inset.

### Verified
- DevTools phone emulation (390px, 2×, mobile): page is exactly 390px wide (no overflow), full
  page reviewed section by section. Desktop (1440px) re-checked, unchanged.

---

## 2026-09-26 (78)

### Added — About page (`/about`)
Scrapbook energy, borrowed from a personal-portfolio reference, on the site's own frame (navbar,
footer, Inter / Plex Mono, ink + accent) and written about snapdesign as a company.
- **Notebook paper** background (`.lined-paper`: ruled lines every 32px on `#FBFAF7`).
- **Hero:** "hello, we're" in handwriting over a squiggle; the `snapdesign` wordmark in Plex Mono
  inside a **hand-drawn orange box**; tilted sticky tags ("Describe it", "Sweat the details", "a
  design studio in a sentence", "made for small businesses") with **pen-sketch arrows**; round
  stickers of real work either side; "We turn a sentence into design you'd put your name on"
  with the flow icons inline; a "Start designing" button.
- **"what's up":** a handwritten paragraph (Caveat) flanked by **taped polaroids** of real work
  captioned "made from one sentence" / "v2, a bit bolder"; then **stamp-edged stickers** for
  Websites, Marketing, Slides, Invoices, Graphics, each with an icon stamp.
- **Beliefs:** three stacked, folder-tabbed panels (ink / yellow / paper) — "Plain words are
  enough.", "Real design, not AI slop.", "It's yours. All of it." — each with a taped design.
- **Close:** "go on — describe something" with a sketched arrow to "Start designing".
- New **Caveat** font (`font-hand`). Pieces in `components/about/scrapbook.tsx`: `Tape`,
  `Polaroid`, `Sticker` (clip-path stamp edge), `SketchArrow`, `ScribbleBox`, `Tag`.
- The navbar/menu "About" link, previously a 404, now resolves.

### Verified
- Screenshots at 1440px and 390px.

---

## 2026-09-26 (77)

### Fixed — blank cards in the /showcase gallery on phones
- **Cause:** the masonry used CSS `columns`. Lazy-loaded images inside multi-column layout can
  miss their load trigger (notably iOS Safari), leaving the beige placeholder.
- **Fix:** real column containers. Designs are dealt into the currently shortest column (by
  height ÷ width) so columns stay balanced; two layouts — 2 columns below `lg`, 3 above — and the
  hidden one's lazy images are never fetched.

### Verified
- Chrome DevTools Protocol, emulated phone (390px, 3× DPR, mobile) scrolling the page: all 19
  gallery images report `complete` with a decoded width, including Reelhouse and Suvo (the two
  that were blank). Headless screenshots inside an iframe still show blanks — an artefact of that
  capture method (lazy loading in an unscrolled iframe), not the site.
- Cleared `.next/dev/cache/images` (regenerates). Note: Next serves the 256px variant for `w=384`
  on these images even from a fresh cache — its own behaviour, harmless.

---

## 2026-09-26 (76)

### Removed — app screens
snapdesign does not design app screens, so nothing promises them any more:
- Footer "Browse": **App screens** link removed (it pointed at `/showcase/app-screens`).
- FAQ "What can I generate": now "Websites, marketing visuals, slides, invoices and graphic design".
- Site metadata description, `/showcase` subline and metadata: "app screens" replaced with the
  real range.
- Editor chat suggestion "App screens for a habit tracker" → "An invoice for a small design
  studio, clean and minimal".

---

## 2026-09-26 (75)

### Changed — Describe: the real design, and a brief that matches it
- The drawn "Roast & Co." poster is replaced by **the real Ember & Bean deck cover**, cropped in
  SVG from `slides-ember-bean-brand-guideline.webp` (panel at 14,12 · 476×246 of 992×1586) into a
  90-wide slot — no new asset.
- The brief now truthfully describes that design: prompt **"a brand deck for a coffee roaster"**
  (33 chars; clip 227.7px, `steps(33)`); underlines "brand deck" and "coffee roaster"; FORMAT
  Brand deck · 16:9; MOOD Cozy, crafted; PALETTE the deck's own **Roast Brown #3B2418 / Caramel
  Glow #D9822B / Oat Cream #F3E6D3**; TYPE DM Sans.
- Row dividers shortened so they stop before the cover.

### Verified
- 3× screenshot of the finished state.

---

## 2026-09-26 (74)

### Changed — Describe illustration: words become a brief
- Replaces the chips-over-a-composer scene (generic AI-UI) with a story: the sentence **types into
  a message**, the words that matter — "poster", "coffee roaster" — **underline in the accent**,
  then a **BRIEF** assembles row by row (FORMAT: Poster · 4:5 · MOOD: Warm, hand-roasted ·
  PALETTE: espresso / caramel / cream / orange · TYPE: Aa editorial serif), and finally a **mini
  "Roast & Co." poster** built from exactly that palette and type. Flat: solid fills, hairlines.
- Typing now reveals whole letters: the clip is exactly 29 × 6.9px (Plex Mono 11.5px = 0.6em),
  and the caret travels 200.1px (it was 204px, drifting into half-letters).
- One 7s clock: `.hiw-type` / `.hiw-caret`, `.ds-mark`, `.ds-row-1…4`, `.ds-reading`,
  `.ds-poster`; reduced motion shows the finished brief.

### Fixed during build
- A nameless `animation:` shorthand (`animation: 7s … infinite`) compiled to `animation: none`, so
  the rows showed from the start. Written as longhands instead.

### Verified
- Screenshots mid-typing (rows hidden, whole letters) and of the finished state (underlines align
  with "poster" and "coffee roaster").

---

## 2026-09-26 (73)

### Changed — flat pass (supersedes 72's glossy finish)
The gradient bodies, sheens, inner highlights and glows read as generic "AI gradient" styling.
All of it is gone from the section's small UI; the language is now flat: solid fills, 1px
hairlines, clean type, shadow only where something floats.
- **Step labels:** a 1px-bordered mono tag, "STEP 01", number in the accent. No fill.
- **Download:** a solid white button, ink "Download" and a muted mono "4K". Format tags are flat
  bordered pills. The orange glows behind the stack and the frame sheens are removed.
- **Describe:** flat chips and composer (solid `#1E1714`, 1px border); the focus ring, glow and
  sheen are removed; send is solid accent.
- **"Try another version":** solid ink with an accent sparkle and a quiet arrow; widened.
- **Websites badge:** white, 1px border, flat green icon, hairline divider.
- `DarkFinish` / `GlassPill` removed; `FlatPill` added.

---

## 2026-09-26 (72)

### Changed — finishing pass on four flat elements
One surface language for small UI across the section: vertical gradient body, 1px hairline border,
inner top highlight/sheen, soft shadow, and a proper icon tile.
- **Step labels** (`Chip`): an accent-gradient number tile ("01" / "02" / "03", mono) beside a
  letter-spaced "STEP", in a glass pill — dark or light per card.
- **Websites badge:** green gradient icon tile, "Landing pages | Hero sections" split by a
  hairline divider, lifted shadow.
- **Describe illustration:** glass suggestion chips with their own icons (browser / picture /
  stacked slides); the composer gets a gradient body, an accent focus ring fading to a hairline,
  a glow and a top sheen, plus a real toolbar (attach, "4:5" ratio, "Poster" type); the send
  button has gradient, hairline and sheen. Shared `DarkFinish` gradients and a `GlassPill` helper.
- **Download:** the button gets a hairline and sheen, and "4K" becomes its own badge; the format
  tags ("4096px" with a resize glyph, "PNG" with an accent dot) are solid-bodied glass pills set
  level with the button, off the cards (translucent over white cards they lost contrast).

### Verified
- 2× screenshots of all three step cards and the Websites tile.

---

## 2026-09-26 (71)

### Changed — "Try another version" chip, finishing
- Rebuilt as a small composer: vertical dark gradient body (`#2E2521 → #15100E`), hairline white
  border, a top sheen, soft drop shadow; an orange sparkle tile on the left and a frosted send
  button with an up-arrow on the right; widened to 156 so the label has clear padding.
- Checked at 3× device scale.

---

## 2026-09-26 (70)

### Changed — Design card illustration, premium pass
- The wireframe artboard (grey bars, drawn landscape) is replaced by **the canvas at work**: an
  editor window ("Canvas · 100%") holding a real landing page, its headline selected (blue box,
  corner handles, "Headline" tag), and a **Variations** panel of three real designs — Vestra,
  Virella, Solvena, the look-alike fashion stores, read here as variations of one brief.
- An orange ring steps through the variations 1 → 2 → 3 and the canvas **cross-fades** to the
  picked one (`.dv-*`, 9s clock; reduced motion holds variation 1). A dark chip, "Try another
  version", sits off the corner.
- `.hiw-piece` CSS and the unused `PURPLE`/`GREEN` constants removed.

---

## 2026-09-26 (69)

### Changed — Marketing tile is a live Instagram carousel
- Replaces the full-bleed campaign photo + chat bubble, which read as a busy wall of image.
- **Tile:** soft blush-to-sage gradient with sparks. A dark chat bubble asks "Turn this into an
  Instagram carousel"; a white reply chip answers "5 slides, ready to post".
- **Post mockup:** avatar with story ring, `suvo.drinks · Sponsored`, 4:5 image, heart / comment /
  share / save icons, "2,418 likes", caption.
- **Slides are real posts:** the Suvo image is a 3×3 grid of 4:5 posts, so each slide crops one
  cell (grid scaled 300% and offset, ×1.035 to hide gutters). Five posts on a six-frame track
  (the first repeats) slide every ~2.4s on a 12s loop; the carousel dot and a "1/5…5/5" counter
  (`content` keyframes) run on the same clock. Slides load eagerly — one shared URL.
- `.typing-dot` CSS removed (no longer used); `.carousel-track` / `-dot` / `-count` added, off
  under reduced motion.

---

## 2026-09-26 (68)

### Added — invoice designs
- Four invoices added to `assets/`, renamed from their ChatGPT filenames by what they are (all
  1055×1491, distinct by SHA-256):
  - `invoice-ashgrove-tide-vintage` — engraved vintage nautical (3294kb → 454kb WebP)
  - `invoice-vanta-studio-dark` — bold dark with orange (1230kb → 75kb)
  - `invoice-nexlane-studio-corporate` — navy corporate (1282kb → 107kb)
  - `invoice-crumb-co-bakery` — playful illustrated bakery (1555kb → 139kb)
- WebP copies (`cwebp -q 82`) in `public/showcase/`. Not yet in `DESIGNS` — the showcase
  categories have no "invoice" type.

### Changed — Invoices tile
- The drawn Ember & Bean invoice is replaced by the **four real invoices scattered at odd angles
  like papers on a desk** (−13°, 6°, −4°, 12°), overlapping, with paper shadows. On hover they
  fan out a little further. The "Paid · 2 min ago" ping stays; the caption sits over a fade so
  the papers can run beneath it.

---

## 2026-09-26 (67)

### Fixed
- Slides tile prompt overflowed the bar in the mono face ("…coffee br"). Shortened to
  **"Coffee brand pitch deck"** (23 characters, ~172px at 12.5px), with `steps(23)` / `23ch`.

---

## 2026-09-26 (66)

### Changed — Slides tile comes alive
- The search bar is now a **generate** bar: the button shows a sparkle, not a magnifier.
- One 8s loop on a shared clock ("Request loop" in `globals.css`): "Pitch deck for a coffee brand"
  **types out** with a blinking caret → a **cursor glides in and presses** the button (it dips,
  a ring pulses out) → the four pieces **pop in one after another** → hold → fade and restart.
  Thumbnails are staggered with separate keyframes rather than delays so every part stays in
  sync. Reduced motion shows the finished state.
- The prompt is set in IBM Plex Mono so each of the 29 `steps()` reveals exactly one character
  (`29ch`); in Inter the even steps cut letters in half.

---

## 2026-09-26 (65)

### Added — "Design anything" section
- New section after "How it works" (`components/design-range.tsx`): **"Design anything"** /
  "From invoices to marketing slides, and everything in between." Page order is now Hero →
  How it works → Design anything → FAQ → Footer.
- Four-tile bento copied from the reference's arrangement:
  - **Websites** (wide, `#E4EEDC`) — Lumen landing page in a tilted browser window, "Websites that
    look designed, not templated.", "Landing pages · Hero sections" badge, faint sparks.
  - **Marketing** (tall, full-bleed Suvo campaign) — glass chat bubble "Turn this into an
    Instagram carousel?" and a green reply pill with bouncing typing dots.
  - **Invoices** (cream) — **drawn** (no invoice in the showcase yet): Ember & Bean invoice #0042,
    two line items, $2,400 total, PAID stamp; pings "Invoice #0042 sent" and "Paid · 2 min ago".
  - **Slides & graphics** (light blue) — search bar "Pitch deck for a coffee brand" over real
    deck, poster and sticker thumbnails plus a slides-icon tile.
- `.typing-dot` keyframes added (off under reduced motion).

### Verified
- 1440px screenshot after fixing two overlaps (browser window vs headline; "Paid" ping vs invoice
  number). Phone layout (stacked tiles) not yet screenshot.

---

## 2026-09-26 (64)

### Changed — Download card illustration, premium pass
- **Real work, fanned:** three showcase designs in white frames with a top sheen and deep shadow —
  Clarix website (behind left, −11°), Sunsip cans (behind right, 10°), Rose Haus campaign (front)
  — via SVG `<image>` from `/showcase/`, so it shows actual output in several formats.
- **"Download 4K" button** replaces the chunky badge and file chip: vertical accent gradient,
  hairline top highlight, orange glow, bobbing arrow-to-tray icon.
- **Format tags** "4096 px" and "PNG" float off the stack; two-tone orange/peach glow behind.
- Removed the file-chip progress bar and its `.hiw-progress` CSS.

---

## 2026-09-26 (63)

### Changed — "How it works" visuals are SVG illustrations
- **`components/how-it-works-art.tsx`** (new): one SVG per step, drawn in the brand palette in the
  same language as the hero's flow icons:
  - **Describe** — "Landing page / Poster / Carousel" chips over a prompt box; "a poster for a
    coffee roaster" types out a character at a time with an orange caret riding its edge; attach
    and send buttons; two sparks.
  - **Design** — an artboard assembling in turn (nav → hero image → headline → copy → button),
    dashed alignment guides, orange/purple/green swatches, "Aa", and a piece held by the cursor.
  - **Download** — the finished poster tipped up with a drop shadow, a large orange download
    badge (arrow bobs), and a `snapdesign.png · 4096 × 4096 · PNG` file chip whose bar fills.
- Replaces the CSS ring, variation dots and streaks, and the Describe card's CSS gradient haze.
  Kept: the grain overlay on dark cards and the SVG cloud haze on Describe (softened to 70%).
- Download's glow is a blurred SVG circle with `overflow="visible"`, so the card — not the SVG
  box — clips it (a gradient-filled rect showed a hard rectangle).
- CSS: `.hiw-type` / `.hiw-caret` / `.hiw-piece` / `.hiw-bob` / `.hiw-progress`; the old ring,
  dot, streak and `download-fall` rules removed.

---

## 2026-09-26 (62)

### Changed — "How it works" rebuilt on the three D's
- **Three cards, not four:** Describe → Design → Download, matching the hero pill. "Own it" is
  folded into Download's copy ("It is yours, commercial use included.").
- **Reference layout:** centred heading, subline "Three steps to your **finished design**" (accent),
  dark / light / dark cards (6px radius, deep soft shadow, ~424:560 on desktop), big title, small
  uppercase chip with an accent tick ("Step 1–3"), copy at the foot; "Getting started is simple"
  caption beneath.
- **Visuals (CSS/SVG, accent orange instead of the reference's red):**
  - Describe — grainy cloud haze in the top-left and bottom-right corners.
  - Design — a grainy conic ring turning slowly, and a three-dot switch whose active dot steps
    1 → 2 → 3 (the Variations control), with a cursor.
  - Download — light streaks sliding down out of the top-right corner.
- `components/how-it-works.tsx` replaces `audience-cards.tsx` + `audience-art.tsx` (deleted).
  Anchor `#how-it-works` unchanged.

### Fixed during build
- Per-element `animation-delay` utilities were reset by the `animation` shorthand in globals
  (unlayered CSS beats Tailwind's utilities layer), so all three dots lit at once. Delays now
  live in globals via `:nth-child`.

### Verified
- 1440px screenshot: one dot active at a time, cloud texture visible, streaks lit.

---

## 2026-09-26 (61)

### Added — mobile navigation menu
- **Hamburger button** beside "Design" below `md` (where the nav links are hidden); icon swaps
  List ↔ X, with `aria-expanded` / `aria-controls`.
- **Menu panel:** a second glass card under the bar, same material and radius, dropping in with a
  short fade/slide (off under reduced motion). Lists Mockups, How it works, About, and — below
  `sm`, where the bar has no room for it — Sign in.
- Closes on link tap, tap outside, Escape, and any route change (checked during render, so the
  new page never paints with the menu open). `invisible` when closed, so its links are out of the
  tab order.

---

## 2026-09-26 (60)

### Changed — contact email
- **`LEGAL.email` = `me.mayank.pal@gmail.com`** (was the `[legal@snapdesign.ai]` placeholder). It
  feeds every email on the Terms and Privacy pages.
- **Footer "Contact"** now opens that address (`mailto:`) — it pointed at `/contact`, which does
  not exist.
- Left alone: the sign-up field's example text (`you@studio.com`) and a code comment — neither is
  a contact address.

---

## 2026-09-26 (59)

### Changed — legal page layout (Terms and Privacy)
- **Banner:** a dark rounded panel (the floating navbar sits over its top edge) with the serif
  title, a one-line subtitle and a "Last updated" chip. Behind it, a row of showcase designs at
  22% opacity and a warm accent glow along the bottom edge.
- **Sticky table of contents** (`components/legal/legal-toc.tsx`, client): every section gets a
  Phosphor icon; the section being read is filled black, tracked with an IntersectionObserver
  band a third of the way down the viewport. On phones it folds into a "Table of contents"
  `<details>` row so the text is not pushed below a 13–17 item list.
- **Reading column:** the intro becomes the first section ("Introduction" in the contents, with
  its own heading — "Your privacy, in plain words" / "The short version"); larger unnumbered
  section headings separated by hairlines; bold lead-ins on list items.
- `LegalSection` gained `icon`; `LegalPage` gained `subtitle` and `introHeading`.

### Verified
- Screenshots of /privacy at 1440px and 390px.

---

## 2026-09-26 (58)

### Changed
- **"How it works" step 2: Refine → Design.** Copy now covers both halves: "snapdesign lays it
  out: type, color, spacing. Want changes? Ask the way you would ask a designer. Darker, more
  minimal, or another version." Matches the hero's Describe → Design → Download.
  `RefineArt` renamed `DesignArt`.

### Added — legal pages
- **`/terms`** (Terms of Service, 16 sections) and **`/privacy`** (Privacy Policy, 12 sections).
  The footer already linked both; they were 404s.
- **`components/legal/legal-page.tsx`** — shared layout: centred serif title, "Last updated",
  plain-English summary, an "On this page" contents card, numbered sections in a 720px column,
  and a foot linking the sibling document and contact email.
- **`components/legal/legal-data.ts`** — company name, contact email, address, governing law,
  minimum age (16) and date in one place. **Name, email, address and jurisdiction are
  `[bracketed]` placeholders and render as-is until filled in.**
- Terms reflect what the site already promises: users **own their designs, commercial use, no
  attribution** (FAQ), and **credits with a free trial** (FAQ) — plus AI-specific caveats
  (similar outputs for others, copyrightability varies, clear a design before trademark use).
- Privacy reflects how the product works: prompts and uploads go to AI model providers; some
  work is stored in the browser (IndexedDB/localStorage, true today); Google/GitHub/Apple
  sign-in. **It states that user content is not used to train AI models — a commitment that
  must be true of every provider before launch.**
- **Sign-up** now shows "By creating an account, you agree to our Terms and Privacy Policy."
- Drafted, not reviewed by a lawyer.

---

## 2026-09-26 (57)

### Changed
- **Hero mosaic no longer cropped.** The fixed 640px window cut every card off in a hard line
  (read as a stray border). The mosaic is now in-flow and as tall as its longest column, and each
  column's drop is re-derived from its card heights so all columns **end within ~60px of one
  line** — tops stagger, every card shows whole. Bottom padding keeps shadows unclipped.
- **"See all designs" button:** pill → 12px rounded square, 44px tall, with a soft drop shadow
  and a 1px press — matching the navbar's squared "Design" button. Sits closer to the mosaic.

### Verified
- 1440px screenshot of the full hero: whole cards, near-even bottom edge, button centred.

---

## 2026-09-26 (56)

### Changed — /showcase gallery
- **Two columns on phones** (was one full-width column — every card filled the screen). Tighter
  gaps (12px), slimmer frame padding and radius below `sm`; three columns from `lg` as before.
- **Click to enlarge** (`components/showcase-gallery.tsx`, new client component): tapping a design
  opens it large and centred over the page, which blurs behind a frosted backdrop
  (`backdrop-blur-xl`). The design rises and scales in (`.lightbox-*` keyframes, off under reduced
  motion). Sized to fit whichever viewport side runs out first. Close with ×, a tap outside, or
  Escape; ←/→ step through the set. Page scroll locks while open; focus moves to × and returns to
  the card on close.

### Verified
- Screenshot at 390px: two-column masonry. The lightbox itself is interaction-only and was not
  exercised headlessly.

---

## 2026-09-26 (55)

### Changed — FAQ shapes
- FAQ rows: 32px pill → **18px rounded square**; the +/× control: circle → **11px rounded
  square**, nested inside the row's radius. Same shape language as the prompt boxes (54).

---

## 2026-09-26 (54)

### Changed — prompt shapes
- **Docked prompt bar:** `rounded-full` pill → `rounded-2xl` (16px), matching the site's
  rounded-square language. The border-chase ring inherits the radius, so it follows.
- **Submit buttons** in the docked bar and the hero prompt box: circles → rounded squares
  (10px / 9px), so each button echoes its container.

---

## 2026-09-26 (53)

### Removed — "Made with snapdesign" section
- The homepage marquee section is gone: the hero mosaic already shows the designs, so it
  repeated the point immediately. Page order is now **Hero → How it works → FAQ → Footer**.
- `components/showcase-marquee.tsx` and `MARQUEE_ROWS` deleted. The `.marquee-track` CSS stays —
  the hero mosaic uses it.

### Moved
- **"See all designs"** (the only in-page link to `/showcase`) now sits centred under the hero
  mosaic, same pill style.

---

## 2026-09-26 (52)

### Changed
- **Prompt box made unmistakable on white.** Border `line` (#e8e6e1) → `black/12`, and a
  three-layer shadow (contact, mid, long) replaces the faint one; focus darkens both. On some
  displays the old edge disappeared entirely.
- **Mosaic: no white fade.** The bottom gradient is gone; the hero's bottom edge crops the cards.
- **Recede effect removed** (45). The mosaic no longer tips back on scroll.
  `components/recede-on-scroll.tsx` and the `.recede-*` rules deleted.

---

## 2026-09-26 (51)

### Changed — hero pill size, moving mosaic
- **Eyebrow pill enlarged:** text 12 → 15px, icons 16 → 20px, roomier padding, `rounded-xl`
  (phones: 12.5px text, tighter padding, so it still fits one line).
- **Mosaic drifts left forever.** It reuses the showcase marquee loop — columns rendered twice,
  `.marquee-track` sliding by half the track plus half a gap (`--marquee-gap` set to
  `calc(16 * var(--u))` so the wrap stays exact at every scale), 110s per cycle. Hover pauses,
  reduced motion stops it. Cards load eagerly since they are always in motion.

---

## 2026-09-26 (50)

### Changed — hero eyebrow
- Pill now reads **Describe → Design → Download** (was "Refine" in the middle).
- Each step has its own **custom two-tone SVG icon** (`components/flow-icons.tsx`), drawn on a
  20×20 grid in the "How it works" palette: a speech bubble mid-sentence with a spark
  (Describe), a circle, square and triangle overlapping into a composition (Design), and a
  picture with an orange download badge (Download). Replaces the two generic Phosphor icons.

---

## 2026-09-26 (49)

### Changed — hero rebuilt on the reference layout (supersedes 48's frame and collage)
- **Structure:** eyebrow pill → heading → subline → **prompt box** (kept, in the place the
  reference has CTA buttons) → a **full-bleed staggered mosaic** of real designs. Navbar
  unchanged.
- **Display face: IBM Plex Mono** (500/600/700) via `next/font`, exposed as `font-mono`
  (`--font-plex-mono`). Chosen as the closest Google font to the reference's mono heading, not an
  exact match. Heading `clamp(1.85rem, 4.3vw, 3.25rem)`; §6.3 lockup kept by weight (700/500).
- **Eyebrow pill:** "Describe → Refine → Download", mono, with accent-orange pencil and download
  icons — the product flow in one line, in the reference's pill style.
- **`components/hero-mosaic.tsx`** (new) replaces `hero-collage.tsx` (deleted): 9 hand-placed
  columns of `ShowcaseFrame` cards, each a different width and drop — narrow columns take decks
  and portrait posts, wide ones landing pages. Scaled by `--u` so phones get the same
  composition, smaller. Bottom fades into the page. Wrapped in `RecedeOnScroll`, so it still
  tips back as you scroll.
- **Prompt box** gained a hairline border and a deeper shadow — it now sits on white, not on an
  image. Removed the unused `.recede-shade` rule.
- `documentation/architecture.md` hero entries rewritten (they still described the original
  "Outbound" hero).

### Verified
- Headless screenshots at 1440px and 390px (iframe): mosaic bleeds both edges with no horizontal
  page overflow; heading wraps to two balanced lines on both.

---

## 2026-09-26 (48)

### Changed — hero redesign
- **Centred lockup, one size.** "**Describe** it. We'll design it." is centred, and both parts now
  share one size (was 5rem / 4.6rem) — the §6.3 two-part lockup is carried by weight alone
  (800 vs 500), so it reads as deliberate rather than slightly mismatched.
- **Subline added:** "Websites, social posts, slides and graphics, designed from a single
  sentence." (`text-balance`, so it breaks evenly.)
- **Frame backdrop is real work.** The blurred crowd photo is replaced by
  `components/hero-collage.tsx`: the showcase designs tiled on a plane tilted −8°, 5 rows × 8,
  sized in container units so the proportions hold at every width, knocked back by a radial
  scrim (darkest behind the prompt) and a 1.5px blur. `public/hero-crowd.jpg` is now unused.
- **Phones:** the frame is 4:3 below `sm` (was 1.91:1, ~180px tall — the prompt filled it) and
  the collage plane scales 1.3× to keep its corners covered.
- **Prompt box** textarea `rows 2 → 3`: on phones the placeholder wraps to three lines and its
  last word was clipped. No height change on desktop (inside the 112px min height).
- The recede-on-scroll effect (45) is unchanged.

### Verified
- Headless Chrome screenshots at 1440px and at 390px (inside an iframe — headless windows will
  not go below ~500px): collage covers the frame edge to edge, no horizontal overflow.

---

## 2026-09-26 (47)

### Changed — showcase mix
- **`DESIGNS` reordered so formats alternate.** Entry 40's category cycle still left eight
  websites at the tail (11 of 19 are websites), so the marquee showed runs of landing pages.
  The list now interleaves two hand-set rows — row 1: W M W S W W G W W M, row 2:
  W G W M W W S W G — so **no more than two websites ever sit together**, the loop's wrap
  included, and the four look-alike fashion stores are split across rows. `MARQUEE_ROWS` still
  takes even/odd indices, which yields exactly those rows.

---

## 2026-09-26 (46)

### Changed — landing section order
- **Hero → Made with snapdesign (showcase) → How it works → FAQ.** The showcase now follows the
  hero directly, so the first thing after the prompt is finished work; "How it works" moved
  below it. Both sections use bottom padding only, so spacing is unchanged by the swap.

---

## 2026-09-26 (45)

### Changed — hero effect reworked (supersedes 44)
- **No pinning, no overlap.** Entry 44 made "How it works" slide over a pinned hero; the intent
  is the opposite — the hero should look **pulled back into the page**, with the next section
  simply scrolling up beneath it. `HeroStack` removed; page flow is normal again.
- **`components/recede-on-scroll.tsx`** sets `--recede` 0 → 1 from when the frame is fully on
  screen until half of it has left the top. The frame **tips back** (`rotateX` up to 16°, hinged
  on its bottom edge) and **sinks** (`translateZ` to −260px) under a 1400px perspective, dimming
  up to 40%. Reduced motion drops the transform.
- Reverted: hero `pb-8 → pb-20`, "How it works" `pt-12` removed, `HERO_COVER_ID` removed, docked
  prompt back to docking once the hero prompt leaves the top (kept as a rAF scroll check).

---

## 2026-09-26 (44)

### Added — hero stack scroll effect
- **`components/hero-stack.tsx`.** The hero now pins once its bottom meets the viewport's, and
  "How it works" (now on an opaque background, one layer up) slides over it. As it covers the
  frame, `--recede` runs 0 → 1 and the hero frame **scales back 8% and dims** (up to 45% black) —
  `.recede-frame` / `.recede-shade` in `globals.css`. Reduced motion keeps the overlap, drops the
  scale. The pin is released at the end of "How it works", so later transparent sections never
  show the hero behind them.
- Spacing preserved: hero `pb-20 → pb-8`, "How it works" gained `pt-12`.

### Changed
- **Docked prompt trigger.** A pinned hero prompt never scrolls off the top, so the bar now also
  docks once the covering section's top passes the prompt's middle (`HERO_COVER_ID`). Switched
  from IntersectionObserver to a rAF-throttled scroll check.

---

## 2026-09-26 (43)

### Changed — account menu polish
- The account trigger is now a **pill** (hairline ring, soft fill) holding a **gradient avatar**
  with initials and a two-line label: name over email. With no name yet it reads "Your account"
  over "Add your name".
- The dropdown opens on a larger avatar with name and email, and its items are inset, rounded
  rows. The pre-mount placeholder matches the trigger's size so the header does not shift.

---

## 2026-09-26 (42)

### Changed — designs header
- **No "Sign in" on `/designs`.** Reaching the page means the person is in. With no stored name
  (e.g. signed in before the name field existed) the account menu shows a neutral avatar and
  "Your account", and offers **Add your name**; the menu also has **Edit name**.
- **Mockups** is now a proper secondary button — filled, hairline ring, same 36px height as
  **New design** — instead of a muted text link. Icon-only below `sm`.

---

## 2026-09-26 (41)

### Added — designs list, accounts, saved canvases
- **`/designs` — "Your designs".** Sign-in and sign-up now land here instead of the editor. Lists
  every design newest-edited first, in showcase-style framed cards laid out in CSS columns. A
  card's image is the design's chosen cover, else its newest generated image; with none yet it
  shows an empty dotted frame at the design's ratio (no stand-in imagery). Delete asks inline.
  Designs opened but never prompted are pruned on load.
- **`/editor/[id]`.** Each design has its own canvas URL; opening it restores the full chat
  (text and attached images) and the Generate settings. Bare `/editor` redirects to `/designs`.
- **`components/designs/design-store.ts`** — designs persist in **IndexedDB** (images are Blobs;
  localStorage's quota could not hold them). Browser-only until Supabase is wired: a design lives
  on the device it was made on. Every read/write goes through this one module. Writes are
  queued so overlapping updates cannot clobber each other.
- **Generations and covers (data + UI, awaiting the pipeline).** A design stores `generations`
  (Blob, intrinsic size, prompt) and a `coverId`. The canvas lays them out, scaled by zoom, with
  **Set as cover** on hover. Nothing produces generations yet, so this is unseen until it does.
- **Account (local only).** Sign-up gained a **Your name** field. The typed name and email are kept
  in localStorage (`components/auth/account-store.ts`) — no credential is checked. The designs
  header shows an **account menu** (initials avatar, name, email, Sign out) and a **Mockups**
  link to `/showcase`.

### Changed
- **Editor on tablets and landscape phones:** the compact chat-only layout now applies below
  `lg` (was `md`) — at 768–1023px two side panels left a 140–400px canvas. Height uses `h-dvh`.
- **Mobile Generate settings** open from a sliders button in the composer (showing the current
  ratio) instead of a summary row.
- **Composer:** attach moved beside send. Attachments limited to PNG/JPG/WebP/GIF up to 10 MB,
  max 5; rejected files, oversize files and the limit each produce a dismissible notice.
- **Editor header:** the "Chat" title is replaced by the `snapdesign` wordmark linking to
  `/designs`. The new-chat button now starts a **new design** rather than wiping the current one.
- **Auth pages:** the orange asterisk is replaced by the `snapdesign` wordmark (home link); the
  duplicate badge logo on the promo panel was removed.
- **Landing:** "Made with snapdesign" and "How it works" headings centred (as is `/showcase`'s).
  "See all" became a centred pill button, **"See all designs"**, below the marquee.

### Verified
- `tsc --noEmit` and `eslint` clean; `next build` succeeds with `/designs` and `/editor/[id]`.
- Not yet exercised in a browser.

---

## 2026-09-26 (40)

### Added
- **Two more designs, 17 → 19.** Both are multi-slide decks:
  - `slides-reelhouse-festival-proposal` — Reelhouse film festival proposal deck
  - `slides-ember-bean-brand-guideline` — Ember & Bean brand guideline deck
- **New `slides` category.** Neither fits website / marketing / graphic, and "Slides" is already
  one of the four design types in the editor's Generate panel — so the showcase category now
  matches what the product says it makes.
- Renamed from their ChatGPT filenames and optimised to WebP: `2090kb → 246kb` and
  `2004kb → 221kb`.
- Both checked against every existing asset by content hash before adding — neither was a
  duplicate.

### Changed
- **`DESIGNS` is now ordered by cycling through the categories** rather than appended in
  arrival order. Appending would have put both decks at the end, so one row of the marquee would
  have carried both and the gallery would have ended on a block of decks. Cycling keeps every
  row and column mixed.
- `DesignCategory` gained `"slides"`.

### Verified
- Marquee: 38 frames (19 x 2), **all 38 loaded**, 4 deck frames present (2 designs x 2 passes).
- Gallery: 19 designs, all loaded, no horizontal overflow.
- No ChatGPT-named files remain in `assets/`.
- `npm run lint` clean; `npm run build` succeeds.

---

## 2026-09-26 (39)

### Changed — design assets
- **22 files in `assets/` deduplicated to 17.** Compared by SHA-256 of file contents, not by
  filename: four pairs were the macOS `… 2.png` pattern, but **`06_03_36` and `06_06_43` were
  also byte-identical** despite different timestamps. Trusting the " 2" suffix would have left
  that one in.
- **Renamed by what each design is**, with a category prefix so the file name sorts and filters:
  `website-monoma-finance-platform`, `marketing-suvo-juice-campaign`,
  `graphic-sunsip-can-packaging`, and so on — 12 websites, 3 marketing campaigns, 2 graphics.
- **Optimised copies in `public/showcase/`** as WebP, capped at 1600px wide:
  **~32MB of PNG → ~2.5MB**. The renamed PNGs stay in `assets/` as the source of truth.

### Added
- **`components/showcase-data.ts`** — the `DESIGNS` list with `src`, `alt`, `category` and
  intrinsic `width`/`height`, plus `MARQUEE_ROWS` splitting them across the two rows by
  alternating index so neither row is all one shape.
- `ShowcaseFrame` now takes a `design` and renders it with `next/image`, sizing the frame from
  the design's **own** aspect ratio — so square and portrait pieces sit beside landscape without
  being cropped.
- The gallery uses CSS **columns** rather than a grid, so each card keeps its natural height
  instead of every row matching its tallest card.

### Fixed during build
- **24 of 34 marquee images never loaded.** `next/image` lazy-loads by default, and a marquee
  moves continuously — cards were arriving on screen blank.
  - **Fix:** an `eager` prop on `ShowcaseFrame`, set by the marquee. The second pass reuses the
    same URLs, so it is still only 17 requests.
  - **Verified:** 32 of 34 complete on load (the last two still in flight), against 10 before.

### Verified
- Marquee renders 34 frames (17 x 2) with genuinely varied widths — measured `313 / 410 / 240 /
  186px` among the first nine, confirming per-design ratios rather than one fixed shape.
- Gallery renders all 17, every image loaded, no horizontal overflow.
- `npm run lint` clean; `npm run build` succeeds.

### Note
- `butterfly.png` (3MB) sits in the repo root and is not referenced anywhere. Left alone — it
  was not part of this task.

---

## 2026-09-26 (38)

### Fixed
- **Footer and navbar links were dead `#` anchors**, so clicking them did nothing at all — they
  never reached the 404 page. They now point at real paths, which means unbuilt pages land on
  the 404 instead of silently failing.

| Column | Now |
|---|---|
| Browse | `/` · `/showcase/websites` · `/showcase/app-screens` · `/showcase/marketing` · `/showcase/graphics` · `/showcase` |
| About | `/#how-it-works` · `/pricing` · `/help` · `/contact` |
| Legal | `/terms` · `/privacy` |
| Navbar | "About" → `/about` |

### Verified
- Status codes for every wired path: `/pricing`, `/help`, `/contact`, `/terms`, `/privacy`,
  `/about` and the four `/showcase/*` category paths all return **404**; `/showcase` and `/`
  return **200**.
- A missing path renders the real 404 page — "This page went in the bin." is in the response
  body, not just a bare status.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Left as `#` on purpose
- **Instagram, Twitter and TikTok.** These are external profiles, and no accounts exist yet.
  Pointing them at internal paths would serve our own 404 for a link that is supposed to leave
  the site, which is worse than an inert anchor. They need real URLs, not routes.

---

## 2026-09-26 (37)

### Added
- **`components/showcase-frame.tsx`** — the card frame: white card, hairline border, soft
  shadow, and a 16:10 inner surface. **Takes `children`**, so a design drops straight in; with
  none it renders the empty surface.
- **`components/showcase-marquee.tsx`** — "Made with snapdesign" on the landing page. Two rows
  of frames scrolling in **opposite directions** at different speeds (58s / 72s), full-bleed
  with the edges masked so cards fade in and out rather than being chopped at the viewport.
  Hovering pauses a row so a card can be looked at. Heading plus a "See all" link.
- **`app/(marketing)/showcase/page.tsx`** — the gallery page at `/showcase`: navbar, heading,
  a 1/2/3-column grid of the same frames, footer.
- Marquee keyframes in `app/globals.css`.

### Changed
- The navbar's **"Mockups"** link now points at `/showcase` (and lost its caret, since it is a
  page rather than a menu).

### Fixed during build
- **The marquee loop had a 10px seam.** With the list rendered twice there are `2n - 1` gaps, so
  half the track is one gap short of a full period — the row jumped by half a gap every cycle.
  - **Measured:** track width `5020px`, but one period (7 cards + 7 gaps) is `2520px`, while
    `-50%` moves only `2510px`.
  - **Fix:** the keyframe ends at `translateX(calc(-50% - var(--marquee-gap) / 2))`.
  - **Verified:** travel now `2520px`, exactly equal to the period.
- **Frames were nearly invisible.** A white card on a white page with a near-white inner surface
  read as a faint rectangle. Border raised to `black/[0.07]`, shadow deepened, and the inner
  surface moved to `#EBE9E2` with an inset ring so the frame reads as a frame.

### Verified
- Both rows animate, in opposite directions, at their own durations.
- `/showcase` renders 12 frames; no horizontal overflow on either page.
- `npm run lint` clean; `npm run build` succeeds — `/showcase` prerendered.

### Ready for content
- Pass a design as `children` to `ShowcaseFrame`. Row counts live in `ROWS` in
  `showcase-marquee.tsx`; the gallery count is `FRAME_COUNT` in the page.
- The second copy of each row is `aria-hidden` — real content needs the same treatment so
  screen readers do not hear every design twice.

---

## 2026-09-26 (36)

### Changed
- **Card artwork rebuilt as compositions rather than pictograms.** The previous pass
  (entry 35) drew literal symbols — a download arrow, a tick in a rounded square, stacked text
  bars. Those read as stock icons, not artwork, and were a clear regression from the layered
  originals.

  | Step | Structure | Primitive |
  |---|---|---|
  | Describe | growth along a diagonal, each form larger than the last | skewed pills |
  | Refine | the same form re-drawn, each pass turned less and sitting clearer | rotated squares |
  | Download | a form travelling down and out of the frame, gaining weight | circles |
  | Own it | shells closing on a solid core | concentric squares |

### What was wrong and what fixed it
- **Literal symbols.** An arrow and a tick are pictograms; the surrounding design language is
  abstract. Each card now suggests its step through *arrangement* — growth, repetition,
  descent, containment — which carries the meaning without drawing the noun.
- **Everything washed out.** The first rebuild ran opacities down to `0.2`, which against a
  tinted card is barely distinguishable from the background. The floor is now ~`0.4`, and the
  gradients are considerably more saturated (`#EFA96A → #B0541A` rather than
  `#F2E1CE → #C9743A`).
- **One idea repeated four times.** Three of the four were overlapping rounded squares at
  falling opacity. Each card now uses a different primitive *and* a different structural idea,
  so the set reads as four things rather than one recoloured.

### Verified
- Rendered at DPR 2 against all four card tints; every layer reads, and each composition bleeds
  off the right edge.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (35)

### Changed
- **All four card artworks redrawn so each says what its step does**, in the same visual
  language as before: rounded geometry, one gradient swept across the group, shapes running off
  the right edge.

  | Step | Was | Now |
  |---|---|---|
  | Describe | petal pinwheel | ragged lines of typed text with a caret on the last line |
  | Refine | stacked discs | one shape iterated — a circle squaring off across four passes, corner radius the only variable |
  | Download | nested vortex | an arrow coming down onto a baseline |
  | Own it | staircase blocks | a block with a check struck through it |

- **Gradients moved to `userSpaceOnUse`** via a shared `SweepGradient` helper. Per-shape
  `objectBoundingBox` gradients made every element light the same way; one sweep across the
  whole group reads as lighting rather than as four separately filled shapes.
- All four now share a single `250x410` viewBox. They previously used `275` and `235`, inherited
  from where the original reference crops happened to start — with every card the same width
  that difference was meaningless.
- **Components renamed** `PetalArt / DiscArt / RingArt / BlockArt` →
  `DescribeArt / RefineArt / DownloadArt / OwnArt`. The old names described shapes that no
  longer exist.

### Fixed during build
- Card 2's shapes stopped 2px short of the viewBox edge, so they did not bleed like the others —
  widened and shifted right.
- Card 4's block sat fully inside the frame, which read as a centred app icon rather than
  artwork. It now crops against the card edge, and its echo block moved to the opposite side so
  the group is not a single column.

### Verified
- Rendered at DPR 2; each artwork bleeds off the right edge and reads as its step.
- No references to the old component names remain.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (34)

### Removed
- **The canvas tool bar** (select, grid, shape, text, effects) and the **Upscale** action.
- With them: the `TOOLS` array, `activeTool` state, and six Phosphor imports. `CanvasStage` now
  has no React state at all and no icon imports — it is the dot grid, the comet and the zoom
  handlers.

### Why
These came from the video-editor reference screenshot, and none of them did anything. Worse,
they made a claim the product does not support: a select arrow implies objects to pick, and
shape and text tools imply an editor that creates vector objects. `brand-and-content.md` §5
lists **"Editable output, not a flat image"** as a claim not to make — the output *is* an image.
That claim was already stripped out of the FAQ copy; the tool bar was still making it visually.

"Upscale" went for the same reason: it is not in the §7 facts sheet. It had been kept on the
argument that it was plausible for generated imagery — which was reasoning about what could
exist rather than checking what does.

Refinement happens in the chat panel ("make it darker", "another version"), which is the actual
product. The canvas shows the result; it does not edit it.

### Verified
- Canvas now contains exactly 2 children (the two comet layers); "Upscale" is absent from the
  page text.
- Zoom still works after the trim: `100% → 125%`, dot pitch `22.5px`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (33)

### Added
- **Mobile editor layout.** Below `md` the canvas, inspector and both resizers are hidden and
  the chat panel fills the screen. A 320px canvas is not usable, and the side panels have
  nowhere to go on a phone.
- **Generate settings inside the chat panel on mobile**, in a collapsible section above the
  composer. Collapsed it shows a live summary — `1:1 · Marketing · 3 variations` — and expands to
  the full ratio / type / variation controls. Animated with the same
  `grid-rows-[0fr→1fr]` technique used by the FAQ and footer accordions.
- `components/editor/generate-context.tsx` — `GenerateProvider` holding ratio, kind and count,
  plus the `RATIOS` / `KIND_IDS` / `KIND_LABELS` / `COUNTS` data.

### Changed
- `GenerateControls` reads from the provider instead of local state, and takes a `showHeading`
  prop so the mobile copy can omit the "Generate" section header.
- Panel widths now apply from `md` up only, via a CSS variable
  (`w-full md:w-[var(--chat-w)]`). The drag value still drives the desktop layout while the
  panel is full-bleed on phones — an inline `width` would have applied at every breakpoint.

### Why the state had to move
The controls now render **twice** — inspector on desktop, chat on mobile. With local state each
copy would keep its own selection, so a change made on one would not be reflected by the other
when the viewport crossed the breakpoint. The hidden copy is `display:none`, so it is not
focusable and does not duplicate the tab order.

### Verified
- **Mobile (390×844):** chat width 390, canvas hidden, inspector hidden, 0 visible resizers,
  `scrollWidth === clientWidth`, summary reads `16:9 · Website · 1 variation`.
- Changed ratio, type and count on mobile → summary updated to
  `1:1 · Marketing · 3 variations`.
- **Resized to desktop (1440×900) without reloading:** canvas visible, and the inspector shows
  the same `1:1 / Marketing / 3` — confirming both copies share one state. The mobile section
  computed `display: none`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (32)

### Added
- **Both side panels are now resizable**, so the canvas can be widened or narrowed from either
  edge.
  - `components/editor/editor-shell.tsx` (client) owns both widths and renders the three panels
    with a `PanelResizer` between each pair. The canvas is `flex-1`, so it absorbs whatever the
    sides give up.
  - `components/editor/panel-resizer.tsx` — a 5px grab strip drawing a 1px hairline. The strip
    is wider than the line because a 1px target is not grabbable.
  - **Chat** 240–560px (default 320). **Inspector** 260–480px (default 308).
  - **Double-click resets** a panel to its default width.
  - Keyboard accessible: `role="separator"` with `aria-orientation`, `aria-valuenow/min/max`,
    and Arrow Left/Right nudging in 16px steps.
  - Uses `setPointerCapture`, so a fast drag keeps working once the cursor outruns the 5px
    handle — which it immediately does.
  - Hairline turns `--ed-blue` on hover, focus and during a drag.

### Changed
- `ChatPanel` and `Inspector` are now **width-agnostic** (`w-full`); only the shell decides how
  much room they get. Their side borders were removed — the resizer draws the dividing line now,
  so there is exactly one line rather than a border plus a handle.
- `app/(app)/editor/page.tsx` is down to metadata plus `<EditorShell />`.

### Verified
- Measured panel and canvas widths through real pointer drags at 1600px wide:
  - start `chat 320 / canvas 962 / inspector 308`
  - drag left handle +140 → `chat 460 / canvas 822` (canvas gave up exactly 140)
  - drag right handle −120 → `inspector 428 / canvas 702` (exactly 120)
  - drag left handle −400 → `chat 240`, clamped at its minimum rather than collapsing
  - double-click left handle → `chat 320`, back to default
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Not done
- Widths are not persisted; a refresh returns to the defaults.

---

## 2026-09-26 (31)

### Added
- **Image attachments in the chat composer, capped at 5.**
  - Paperclip button opens a hidden `input[type=file][accept=image/*][multiple]`.
  - Non-image files are filtered out, and a selection larger than the remaining slots is
    truncated rather than rejected — picking 6 with 0 attached keeps 5.
  - Pending thumbnails sit above the textarea, each with a remove control. The paperclip
    disables at 5 and re-enables as soon as one is removed.
  - A quiet "Up to 5" note appears only when a selection was actually truncated.
  - The file input's value is cleared after each pick, or choosing the same file twice would
    not fire `change`.
  - Sent images travel with the message and render as thumbnails in the thread bubble.
  - Object URLs are kept for the session (so sent thumbnails keep resolving) and revoked
    together on unmount.

- **Voice dictation** via `components/editor/use-dictation.ts`.
  - Wraps the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), which is not in
    TypeScript's lib.dom — a minimal local interface declares only the members used, so no
    `any` and no ambient global.
  - Continuous with interim results, so words appear as they are spoken. **Transcription
    appends to whatever is already typed**, and lands in the textarea rather than sending, so it
    can be corrected before pressing send — which is what was asked for.
  - The mic button becomes a stop button while listening, and the placeholder reads "Listening…".
  - Language follows `navigator.language`.
  - Denied microphone permission surfaces "Microphone access was denied." rather than failing
    silently.
  - The button is hidden entirely where the API is unsupported (Firefox).
  - Recognition is stopped on unmount and on send, so the microphone is never left open.

### Notes on implementation
- **Feature detection uses `useSyncExternalStore`**, not `setState` in an effect — the same
  shape as `D25`. Support cannot change during a session, so `subscribe` is a no-op and the
  server snapshot is `false`.
- Thumbnails use a plain `<img>`, not `next/image`: these are `blob:` URLs, which the image
  optimiser cannot process. The lint rule is disabled inline at those two lines only, with the
  reason stated.

### Verified
- Picked 6 images → 5 attached, cap notice shown, paperclip disabled.
- Removed one → 4 attached, paperclip re-enabled.
- Sent with attachments → 4 thumbnails in the thread bubble, composer cleared.
- Mic button rendered (API detected).
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Still not wired
- Attachments are held in browser memory only. Nothing is uploaded, and no model receives the
  images or the text.

---

## 2026-09-26 (30)

### Added
- **Canvas zoom**, 25%–400%, driven four ways:
  - **Ctrl/Cmd + scroll wheel** over the canvas — continuous, exponential so each notch is a
    constant *ratio* rather than a constant step.
  - **Ctrl/Cmd + `=` / `-` / `0`** — step in, step out, reset.
  - **`−` / `+` buttons** in the inspector header, stepping through
    `25 · 50 · 75 · 100 · 125 · 150 · 200 · 300 · 400`.
  - **Clicking the percentage** resets to 100%.
- `components/editor/zoom-context.tsx` — `ZoomProvider` wrapping the editor, since the canvas
  owns the gesture and the inspector shows the number.
- `components/editor/zoom-control.tsx` — the `− 150% +` control, replacing the static "62% ⌄".

### How it works
- Zoom sets `--dot-gap` on the canvas section; `.canvas-dots` **and both `.canvas-comet` layers**
  read that same variable. They must stay in lockstep — the comet is the same lattice revealed
  through a mask, so if the pitches diverge the bright dots stop landing on the dim ones.
- The wheel listener is attached with `addEventListener(..., { passive: false })` rather than
  React's `onWheel`. React registers wheel handlers passively, so `preventDefault()` there is
  ignored and the browser would zoom the whole page instead.
- Stepping uses discrete stops, so the buttons land on round numbers even after the wheel has
  left the zoom on an arbitrary value like 154%.

### Fixed during build
- **`react-hooks/refs`: "Cannot update ref during render".** The wheel handler needed the
  current zoom, and the first version kept it in a ref synced during render.
  - **Fix:** removed the ref. The context exposes `zoomBy(factor)` implemented with the state
    updater form, so the handler never reads the current value and the effect's dependencies
    stay stable. No rule was disabled.

### Verified
- Buttons: `100 → 125 → 150`, then three steps out → `75`.
- Ctrl+wheel from 75%: → 154% (continuous, as intended).
- Keyboard: `Ctrl+=` → 125 → 150, `Ctrl+-` → 125, `Ctrl+0` → 100.
- Clicking the percentage resets to 100%.
- At every level the dot grid and comet layer reported **identical** `background-size`
  (`18 → 22.5 → 27 → 13.5 → 27.73 → 18`), confirming they scale together.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Not done
- Zoom scales the lattice but does not pan, and does not zoom toward the cursor — it zooms about
  the canvas origin. There is no content on the canvas yet for that to matter.

---

## 2026-09-26 (29)

### Removed
- **The "Chat" tab from the inspector header**, along with the placeholder panel it showed. The
  left panel is the chat; a second entry point for it was a duplicate.
- With the tab gone there was nothing left to toggle, so the `tab` state and the conditional
  render went too. **`inspector.tsx` is now a server component** — `"use client"` and `useState`
  removed, and Phosphor moved back to the `/ssr` entry per `D9`.
- "Editor" is now a plain heading rather than a tab button.

### Verified
- Inspector's first line of text is `"Editor"`, it no longer contains "Chat", and the left panel
  still opens on the chat thread.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (28)

### Removed
- **The entire video-editor property stack from the inspector**: Time (Length, Speed, In & Out),
  Transform (position, alignment pad, rotate, scale), Layout, Appearance (opacity, blending,
  radius), Fill, Source (`A_CAM_C0024.mp4`), Stroke and Shadow. These came across from the
  reference screenshot and described a video clip, not a design.
- `components/editor/inspector.tsx` shrank from ~230 lines to ~50: tabs, the zoom control and
  `<GenerateControls />`.
- **`components/editor/controls.tsx` trimmed to `SectionHeader` only.** `Row`, `Field`,
  `SelectField` and `IconButton` existed solely to build the property rows that just went away,
  and `Stepper` / `AlignmentPad` inside the inspector went with them.
- Fourteen now-unused Phosphor imports dropped along with them.

### Verified
- Asserted against the rendered page text that none of `Time`, `Transform`, `Layout`,
  `Appearance`, `Fill`, `Source`, `Stroke`, `Shadow`, `A_CAM_C0024.mp4`, `Blending`, `Opacity`,
  `Rotate` or `Scale` remain — `stillPresent: []` — while `Generate` and `Ratio` are still there.
- Grepped the source for every removed symbol: no references left.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Still open
- The inspector's **"Chat" tab** remains and renders "Chat is not built yet." It duplicates the
  left chat panel. Not removed because it was not requested.

---

## 2026-09-26 (27)

### Added
- **`components/editor/generate-controls.tsx`** (client) — a "Generate" section at the top of
  the inspector with three controls, built from the existing editor tokens.

  - **Ratio** — eight options in a 4-column grid: `1:1 · 4:5 · 3:4 · 9:16` (square/portrait)
    and `16:9 · 3:2 · 4:3 · 2:1` (landscape). **Each swatch is drawn to its true proportion**
    from a single `SWATCH` constant — the longest side is fixed and the short side derived — so
    the shape itself is the label rather than the text doing the work.
  - **Designing** — four types in a 2x2 grid with Phosphor icons: Website, Marketing, Slides,
    Graphic. **No apps and no dashboards**, as specified. The selected icon fills and turns
    `--ed-blue`.
  - **Variations** — `1 · 2 · 3 · Auto` as a segmented control with a **sliding thumb**: one
    absolutely positioned element translating between segments on
    `cubic-bezier(0.16, 1, 0.3, 1)`, rather than four independent fills. The selection glides
    instead of blinking.

- Mounted above the existing "Time" section, which gained a top border to separate them.

### Fixed during build
- **Ratio labels sat at ragged heights across each row.** Portrait and landscape swatches have
  different heights, so a label directly under the swatch inherits that difference.
  - **Fix:** each swatch is centred inside a fixed `SWATCH`-height box, so every label starts
    from the same baseline.
  - **Verified:** label `top` values are now identical within each row — `[158,158,158,158]` and
    `[218,218,218,218]`; before the fix they varied by up to 10px.

### Verified
- Every swatch measured against its declared ratio from the rendered DOM: all eight match
  (1.00/1.00, 0.82/0.80, 0.77/0.75, 0.55/0.56, 1.83/1.78, 1.47/1.50, 1.29/1.33, 2.00/2.00 —
  deltas are whole-pixel rounding).
- Selection exercised across all three controls: 9:16 + Slides + Auto all registered.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Worth raising
- The inspector still carries its **video-editor sections below Generate** — Time (Length,
  Speed, In & Out timecodes), and Source pointing at `A_CAM_C0024.mp4`. Those describe a video
  clip and do not fit a design tool. Left in place because removing them was not requested.
- The three controls hold **local state only**. Nothing reads them — there is no generation
  pipeline for them to configure yet.

---

## 2026-09-26 (26)

### Removed
- **`components/editor/asset-sidebar.tsx`** — the left asset panel (project switcher, assets
  header, search, folder grid) is gone entirely, along with its `ASSET_FOLDERS` data.

### Added
- **`components/editor/chat-panel.tsx`** (client) — a ChatGPT-style thread in its place, built
  from the existing editor tokens rather than a new palette.
  - **Header:** "Chat" plus a new-chat button that clears the thread.
  - **Empty state:** a prompt line and three tappable suggestions that fill the composer. The
    suggestions are the spare hero placeholders from the brand brief.
  - **Thread:** user turns sit in a right-aligned `bg-ed-raised` bubble; assistant turns run
    full width with a small blue sparkle avatar and no bubble, so longer answers stay readable
    in a 320px column. This is the ChatGPT asymmetry, and it is the reason the panel reads as a
    chat rather than a list.
  - **Composer:** auto-clearing textarea, Enter to send, Shift+Enter for a newline, submit
    disabled while empty.
  - Thread auto-scrolls to the newest message.
  - Panel widened `268px → 320px`; a chat column needs more room than a folder grid.

### Honesty note
- There is no model behind this. Rather than fake a design response, sending produces a fixed
  assistant reply stating that generation is not connected and that the prompt has been
  captured. The flow is walkable without claiming a capability the product does not have —
  consistent with the `brand-and-content.md` §5 guardrail.

### Verified
- Exercised end to end: clicked a suggestion, submitted, typed a follow-up, submitted again →
  4 turns rendered and the draft cleared both times.
- Captured the empty state and the populated thread at DPR 2.
- No remaining references to `AssetSidebar`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Worth raising
- The **inspector still has an "Editor / Chat" tab pair**, whose Chat tab renders "Chat is not
  built yet." With a dedicated chat panel on the left, that tab is now a duplicate affordance.
  Left in place because removing it was not requested.

---

## 2026-09-26 (25)

### Changed
- **FAQ closed-row control is now solid black with a white plus** (`bg-ink-900` / `text-surface`,
  border dropped). It was a white circle with a hairline border and a grey plus, which read as
  faint against the light row.
- The **open row's control is unchanged** — a quiet `surface-muted` chip with a dark `×`. The
  two states now invert each other, so the control itself signals open vs closed rather than
  relying on the glyph alone.

### Verified
- Computed styles: closed circle `rgb(6, 5, 5)` with `rgb(255, 255, 255)` icon; open circle
  `rgb(244, 242, 237)` with `rgb(53, 49, 47)` icon.
- Captured at DPR 2.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (24)

### Removed
- **CTA links from the four "How it works" cards** — "Start designing", "See how", "What you
  get", "Ownership". The `cta` and `href` fields were dropped from the `CARDS` data, and the
  now-unused `Link` and `ArrowRightIcon` imports removed with them.

### Changed
- **Card text block is now vertically centred.** Removing the link left ~119px of dead space at
  the bottom of every card, which read top-heavy. Wrapping the heading and body in a `my-auto`
  div centres them in the space the link vacated: 69px above the heading, 97px below the body.
  Card height, padding and artwork are unchanged.

### Verified
- `document.querySelectorAll('article a').length === 0` after render.
- Captured at DPR 2 before and after the centring fix.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (23)

### Changed
- **Site copy rewritten against `documentation/brand-and-content.md`.** Every §8 checklist item
  is done. All lines checked against the §5 claims guardrail and §4 voice rules.

| Area | Was | Now |
|---|---|---|
| Title (§6.1) | "snapdesign.ai" | "snapdesign — describe it, get a finished design" (47 chars) |
| Description (§6.1) | "AI design generation — describe it, get it." | 160 chars, in the 140–160 band |
| Hero (§6.3) | "**Outbound** agents for every rep" | "**Describe** it. We'll design it." |
| Placeholder (§6.4) | "Find 10 top-rated catering companies…" | "A bold landing page for a family-run roofing company in Austin" (62 chars) |
| Cards (§6.6) | Creators / Studios / Affiliates / Partners | Describe / Refine / Download / Own it |
| FAQ (§6.7) | 5 questions, 3 flagged | rewritten; brand-kit question replaced |
| Footer (§6.8) | "curated edit of new mockups & templates" | "The best designs made with snapdesign, in your inbox." |
| Sign up (§6.9) | "Get access to your personal hub for clarity and productivity." | "Turn a sentence into a design you would be proud to ship." |
| Log in (§6.10) | blurb repeated the headline | "Your designs are waiting." |

### Claims removed (§5 guardrail)
- "editable output, not a flat image" — the product returns an image.
- "every result opens in the editor so you can take over" — replaced with refine-by-chat.
- Brand kits, unlimited exports, workspaces, the affiliate programme and the API — all **not
  built**, so every card and answer that referenced them is gone.
- "on every plan including the free tier" — §6.7 asks to confirm a free tier exists; the plan
  claim was dropped rather than published unconfirmed.
- Footer "Limited Edition" and "Free Stuff" replaced with real output categories.

### Also
- Headings and buttons moved to sentence case: "Frequently Asked Questions" → "Frequently asked
  questions".
- US English: "Help Centre" → "Help Center", "colour" → "color". Remaining British spellings are
  in code comments only, not published copy.
- Card links now carry real `href`s instead of every one pointing at `#`.

### Verified
- Copy read back out of the rendered DOM, not just the source.
- Every length constraint in the brief checked: title 47 (≤60), description 160 (140–160), card
  bodies 95–104 (90–130), FAQ answers 87–172 (≤300).
- Grepped the whole source for stale product language, banned §4 words and UK spellings.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Open items for the product owner
1. **§6.6 direction:** the brief recommends **A** (rename the heading, keep audience cards). I
   built **B** (keep "How it works", cards become steps) — see `D39`.
2. **§6.2 "Mockups" nav label** does not match the output categories in §1 (websites, app
   screens, marketing, graphics). Left as-is because it was chosen explicitly; worth revisiting.
3. **Free tier** — §6.7 asks to confirm one exists at launch. Until then the FAQ says only that
   there is a free trial.
4. **Footer category links** (Websites, App screens, Marketing, Graphics) point at `#`; those
   pages do not exist.
5. **Spare placeholders** for §6.4 rotation, if it gets built:
   - "A launch poster for an independent coffee roaster"
   - "App screens for a habit tracker, calm and minimal"
   - "Instagram ads for a yoga studio's spring offer"
   - "A homepage hero for a solar installation company"
   - "A menu for a neighborhood pizza place"

---

## 2026-09-26 (22)

### Added
- **Travelling border light on the docked prompt bar.** A black line runs around the pill with
  its tail fading out behind it.
  - `.border-chase` in `app/globals.css`: a `conic-gradient` rotated by `--border-angle` and
    masked down to the border ring with the `content-box` / `mask-composite: exclude` pair, so
    only a thin arc of the gradient is ever visible.
  - The gradient is transparent for its first 232deg and ramps `0.05 → 0.18 → 0.45 → 0.8 → 1`
    opaque across its last 128deg. That puts a solid head at the front of the arc with the tail
    falling off behind it, which is what reads as movement.
  - `--border-angle` is registered with `@property` (`syntax: "<angle>"`). **Without that
    registration the browser animates it as a discrete string swap, not a rotation** — the arc
    would jump rather than travel.
  - 3.2s linear loop; `prefers-reduced-motion: reduce` stops it.
  - `var(--border-angle, 0deg)` fallback: where `@property` is unsupported the property is
    unregistered, which would make the whole `conic-gradient` invalid and drop the ring
    entirely. The fallback leaves a static arc instead of nothing.

### Verified
- Read `--border-angle` off the `::before` twice, 500ms apart: `168.716deg → 224.955deg`. That
  is 56.24deg, exactly the 56.25deg expected at 3.2s per revolution — so the property really is
  registered and interpolating, not snapping.
- Froze the animation at 0/90/180/270deg and captured each at DPR 3: the head sits on the top,
  right end, bottom and left end respectively, tail trailing behind in every frame.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (22)

### Added
- **`documentation/brand-and-content.md`**: brand & content brief for content writers. Covers
  what snapdesign is, audiences, differentiators, voice & tone, naming rules, a claims guardrail,
  and a section-by-section brief (metadata, navbar, hero, prompt placeholder, How-it-works cards,
  FAQ, footer, auth pages, 404) with current copy, required action and length limits.

### Flagged (no code changed)
- Hero headline "Outbound agents for every rep" and prompt placeholder "Find 10 top-rated catering
  companies…" are leftover reference content for a different product.
- FAQ, Studios/Affiliates/Partners cards and signup copy promise features that are not built
  (editable output, brand kits, workspaces, unlimited exports, API, affiliate programme).
- "How it works" heading sits over audience cards, not steps.

---

## 2026-09-26 (21)

### Fixed
- **Docked prompt bar disappeared partway down the page.** It now stays visible from just past
  the hero all the way to the bottom of the footer.
  - **Cause:** the footer stand-down behaviour added in the previous entry. That was not asked
    for — it was added on the assumption that covering the footer wordmark would be unwanted.
    Even with the `rootMargin` tuning it hid the bar while the reader was still in the FAQ.
  - **Fix:** removed the footer `IntersectionObserver`, the `overFooter` state, the `FOOTER_ID`
    export and the `id="site-footer"` attribute. Only the hero anchor observer remains; once
    docked the bar stays for the rest of the page.

### Verified
- Visibility asserted at seven scroll positions on a 3199px page: hidden at 0, visible at 600,
  1200, 1800, 2400, 2800 and at the document bottom.
- Captured at the very bottom — the white pill reads clearly over the black footer.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors. No leftover
  references to the removed symbols.

---

## 2026-09-26 (20)

### Added
- **Docked prompt bar.** Once the hero prompt scrolls out of view, a compact copy rises from the
  bottom of the viewport and follows the reader down the page.
  - `components/prompt-context.tsx` — `PromptProvider` holding one prompt value, so text typed
    in the hero box is still there when the bar docks (and vice versa). Also exports the shared
    placeholder and the two element ids the bar observes.
  - `components/docked-prompt.tsx` (client) — fixed bottom bar, single-line pill form with the
    same submit control. Slides up on `cubic-bezier(0.16, 1, 0.3, 1)` over 500ms.
  - `components/prompt-box.tsx` now reads from the context instead of holding local state.
  - `app/(marketing)/page.tsx` wraps the page in `PromptProvider` and mounts `<DockedPrompt />`.
  - `components/hero.tsx` gives the prompt wrapper an id for the observer;
    `components/footer.tsx` gains `id="site-footer"`.

### Behaviour
- Docks only when the hero prompt has left **upward** (`boundingClientRect.top < 0`). Leaving
  downward means the reader is above the hero, where the real box is already visible.
- **Stands down once the footer dominates the viewport**, so it never covers the oversized
  wordmark. A plain intersection test fired far too early — the footer is ~700px tall, so it
  enters view while the reader is still in the FAQ. `rootMargin: "0px 0px -55% 0px"` shrinks the
  observer root from the bottom, so the footer only counts once it reaches the upper half.
- Hidden state uses `invisible` plus `tabIndex={-1}` on both the input and the button, so the
  bar is never focusable while off-screen.
- `motion-reduce:transition-none` on the slide.

### Verified
- State asserted at seven scroll positions on a 3199px page (footer starts at 2489):
  hidden at top, visible from past-hero through the audience cards and FAQ, hidden once the
  footer takes the upper half, hidden at the bottom.
- Value sharing proved by setting the hero textarea and reading the docked input back:
  `"wedding invites, art deco"` carried across.
- Mobile at 390x844: docks correctly, `scrollWidth === clientWidth`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (19)

### Added
- **404 page** at `app/not-found.tsx`, following the layout of the supplied reference: artwork,
  serif heading, supporting copy, primary + secondary actions, and a "You might be looking for"
  row.
  - Uses the Next.js `not-found.js` file convention (confirmed against
    `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`).
    The root `app/not-found.tsx` handles **all** unmatched URLs, so the experimental
    `global-not-found.js` is unnecessary — that is only needed with multiple root layouts or a
    top-level dynamic segment, neither of which applies here.
  - `components/not-found-actions.tsx` (client) holds the two buttons; "Try again" calls
    `router.refresh()`. `not-found.tsx` itself stays a server component.
  - Renders the site navbar so a 404 is still navigable.
  - Suggestion links point at `/#how-it-works`, `/#faq` and `/login`.
- **`public/404-desktop.png`** (1200x770) and **`public/404-mobile.png`** (900x1338), processed
  from the two source files in the repo root. The landscape crop shows at `sm` and up; the
  portrait crop below it, since a landscape lockup reads badly in a narrow column.

### Fixed (source assets)
- **`404 image desktop vierson .png` had its checkerboard painted in, not transparent.** The
  file is fully opaque RGB; what looks like a transparency checkerboard is literal grey squares
  baked into the pixels, which would have rendered as a grey checkered rectangle on the white
  page.
  - **Fix:** connected-component pass over checkerboard-coloured pixels (near-neutral,
    luminance > 196), clearing every component larger than 250px. A border-seeded flood fill
    alone was not enough — it cleared 58.4% and left the enclosed counters of both `4` glyphs
    still checkered, because those pockets are unreachable from the edge. Component labelling
    catches them: 58.9% cleared.
  - The artwork's own light areas survive because they are warm-toned, not neutral.
  - Both images were then cropped to their alpha bounding box and downscaled.
- `404 vertical .png` needed no repair — it is genuinely transparent (60% of pixels fully
  clear). Its apparent dark-brown background is only how a preview composites transparency.

### Verified
- `curl` against an unmatched route returns **HTTP 404**, not 200.
- Rendered at 1280x900 and 390x844: `scrollWidth === clientWidth` at both, and exactly one
  artwork is visible per breakpoint.
- Both processed PNGs composited over white to confirm no residual checkerboard.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Notes
- The two original files remain in the repo root, untouched, as the only copies of the sources.
  They can be deleted or moved out once you are happy with the processed versions.

---

## 2026-09-26 (18)

### Changed
- **Card artwork saturation increased** — the shapes read as washed out against their tints.
  Nothing was literally transparent; the gradients' saturated endpoints were simply too pale, so
  those were deepened rather than any opacity touched.

  | Art | Before | After |
  |---|---|---|
  | Petals | `#F2E1CE → #D79872` | `#F0DCC2 → #CD7C43` |
  | Discs | `#96938D → #EFEDE9` | `#7C7972 → #E9E7E3` |
  | Vortex ring 3 | `#BAABD6 → #F6F4FA` | `#A793CE → #F0ECF8` |
  | Vortex ring 4 | `#AC9CD0 → #F2EFF8` | `#9781C6 → #E9E3F4` |
  | Vortex ring 5 | `#9F8ECB → #D7CEE9` | `#8871BD → #C6B8E2` |
  | Block 1 | `#4B7360 → #6A8C7A` | `#36614D → #567E69` |
  | Block 2 | `#6F9080 → #9AB2A1` | `#527D67 → #82A190` |
  | Block 3 | `#98B2A1 → #D9E4D2` | `#7FA08D → #B8CCBB` |
  | Block 4 | `#DFEAD7 → #EEF4E9` | `#C4D8C0 → #DCE9D6` |

- The vortex's two outermost rings were left alone — they sit just above the card tint on
  purpose, and deepening them would ring the artwork in visible edges (see `D21`/`D31`).
- Card tints unchanged; only the artwork moved.

### Verified
- Rendered at DPR 2. The fourth green block, which previously disappeared into the card tint,
  now reads as a distinct step in the staircase.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (17)

### Fixed
- **FAQ rows snapped instead of opening smoothly.**
  - **Root cause:** the closed state used `rounded-full`, which in Tailwind v4 computes to
    `calc(infinity * 1px)`. Animating `border-radius` from infinity to a finite `26px` is
    effectively a step function — the interpolated value stays astronomically large for almost
    the whole transition, so the row holds its pill shape and then snaps at the end.
  - **Evidence:** sampled `borderTopLeftRadius` per frame through the open transition —
    `3.36e7px` at 7ms, still `55411px` at 288ms, then `26px` at 339ms. The panel height was
    never the problem: it ran `0 → 92.25px` smoothly and monotonically over the same window.
  - **Fix:** a fixed `rounded-[32px]` in both states. At the 64px closed row height, 32px *is* a
    pill, so the resting look is unchanged and there is no radius to animate.
  - **Verified:** re-sampled — exactly one distinct radius (`32px`) across every frame, and the
    height still eases out cleanly (`+30.3, +26.5, +16.6, +10.4, +5.9, +2.4, +0.2`).

### Changed
- **Open card radius `26px` → `32px`**, as requested — the corners were cut too tight.
- **`border-color` added to the transition list.** It was changing from transparent to
  `--line` with no transition declared, so the border popped in while everything else eased.

---

## 2026-09-26 (16)

### Added
- **FAQ section** on the landing page, between "How it works" and the footer, built to the
  supplied reference geometry with our own palette.
  - `components/faq.tsx` (client) — centred eyebrow, two-line heading, and five disclosure rows
    in a `max-w-[640px]` column.
  - **Resting rows are pills** (`rounded-full`, `bg-surface-muted`) with a bordered white `+`
    circle. **The open row becomes a card** (`rounded-[26px]`, `bg-surface`, hairline border and
    soft shadow) and its control flips to a filled `×`, exactly as in the reference.
  - Panel height animates with the `grid-rows-[0fr→1fr]` technique — no JS measuring.
  - One row open at a time; clicking the open row closes it. First row open by default.
  - Proper disclosure semantics: `aria-expanded` / `aria-controls` on each button, matching
    `role="region"` + `aria-labelledby` on each panel, questions wrapped in `h3`.
- **`--surface-muted` `#F4F2ED`** token in `app/globals.css` for quiet resting fills on a white
  page.
- Section carries `id="faq"` with `scroll-mt-24`.

### Verified
- Toggle behaviour asserted through `aria-expanded` across all five rows: initial
  `[true,false,false,false,false]`; clicking row 3 gives `[false,false,true,false,false]`;
  clicking it again gives all `false`.
- Mobile at 390x844: `scrollWidth === clientWidth`, rows reflow to two lines and stay pill-shaped.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Notes
- Colours mapped to our tokens rather than the reference's blue-greys, as asked.
- The heading is set in the display serif to match the hero and "How it works", not the
  reference's geometric sans — see `D32`.
- The reference's eyebrow read "TRUSTED BY", which does not belong above an FAQ; used "FAQ".

---

## 2026-09-26 (15)

### Added
- **"How it works" heading** above the audience cards, set in the display serif (Newsreader) to
  match the hero, at `clamp(2rem, 4.4vw, 3.25rem)`.
- The section now carries `id="how-it-works"` plus `scroll-mt-24`, so jumping to it clears the
  fixed navbar instead of hiding the heading behind it.

### Changed
- `NAV_LINKS` in `components/navbar.tsx` gained a `href` field; the **"How it works" nav link now
  points at `/#how-it-works`** instead of `#`. Mockups and About still point at `#` — they have
  no destination yet.

### Verified
- `document.getElementById('how-it-works')` resolves and its `h2` reads "How it works".
- Rendered at DPR 2.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (14)

### Changed
- **All four card artworks rebuilt to match the reference construction**, replacing the
  approximations in `components/audience-art.tsx`. Each is now authored in a viewBox whose right
  edge *is* the card's right edge, so shapes running past it bleed exactly as in the original.

  | Art | Construction |
  |---|---|
  | `PetalArt` | Four rounded parallelograms in a 2x2 grid, 98x146 with `rx 36`. Top row `skewX(21)`, bottom row `skewX(-21)` — the mirror is what opens the slanted cross of negative space between them. |
  | `DiscArt` | Modular disc-tile grid: full circle, bottom half and top dome down the left column; half-discs centred **on** the right edge so they clip to a crescent. |
  | `RingArt` | Five nested ellipses, each smaller and drifting right, each lit from the upper-left so the overlaps read as crescents down a funnel. |
  | `BlockArt` | Four rounded rects (`rx 24`) meeting at opposite corners, stepping down-right then down-left, darkening upward. |

- **Gradients** re-sampled per shape from the reference at 2x: petals `#F2E1CE → #D79872`
  (mirrored on the bottom row), discs `#96938D → #EFEDE9`, vortex `#BAABD6 → #F6F4FA` over
  near-tint outer rings, blocks `#4B7360` through `#EEF4E9`.
- **Card tints** replaced with the sampled flats: `#F4E7D5`, `#F0EFEB`, `#E5E0E8`, `#E4EEDC`
  (the earlier versions were invented gradients).
- **Proportions re-derived** from the reference at our card width: artwork column `50% → 38%`,
  heading `32px → 28px`, body `14px → 13px`, badge `13px → 12px`, padding `p-8 → p-7`,
  min-height `320px → 330px`.

### Verified
- Each artwork cropped from the reference at 2x and read shape-by-shape before building —
  geometry and gradient endpoints measured rather than eyeballed.
- Rendered and compared at DPR 2. The vortex needed a second pass: the outer rings were lighter
  than the card tint, which ringed the artwork in white and made it read as a target rather than
  a funnel. Lowered to just above the tint.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (13)

### Changed
- **Page canvas from cream back to white.** `--background` `#F5F1E6` → **`#FFFFFF`**;
  `--surface` `#FFFDF7` → **`#FFFFFF`**; `--line` `#E4E0D3` → `#E8E6E1` (neutralised, since the
  warm hairline was tuned for a cream canvas).

### Notes
- The cream canvas had been introduced (see `D27`) to give the floating navbar tonal separation.
  That separation now comes entirely from the hairline border and shadow added in the same
  change — `border-black/[0.07]` and a two-stop shadow — which read fine on white where the
  original `border-white/50` and weak shadow did not. **Verified rather than assumed:** the bar
  was re-captured on the white canvas and still reads as a distinct floating element.
- `--background` and `--surface` are now the same value. The two tokens are kept separate
  because they carry different meaning; if the navbar ever needs tonal separation again, only
  `--surface` moves. See `D27`.
- Side effect, in the good direction: the audience cards' pastel tints read more clearly against
  white than against cream, closer to the reference they were built from.

### Verified
- Computed `body` background `rgb(255, 255, 255)`.
- Navbar and the audience cards section re-captured at DPR 2.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (12)

### Added
- **Audience cards section** between the hero and the footer, built to the supplied reference.
  - `components/audience-cards.tsx` — a `md:grid-cols-2` grid of four tinted cards, each with a
    pill badge (coloured dot + access label), a large heading, a three-line body and an
    underlined arrow link. Driven by a `CARDS` array so copy and tint live in one place.
  - `components/audience-art.tsx` — four abstract artworks as inline SVG: petals, stacked discs,
    concentric rings, descending blocks. Each shares a 320×320 viewBox with
    `preserveAspectRatio="xMidYMid slice"`, sits in the right half of its card and bleeds off
    the edge.
  - Card tints, artwork gradients and dot colours sampled from the reference: peach `#F8E7D6`
    / dot `#EC8A5B`, grey `#F1F0EB` / dot `#1C1616`, lavender `#E8E2EE` / dot `#9F87C3`,
    green `#E3EFDB` / dot `#528773`.
  - Mounted on `app/(marketing)/page.tsx` between `<Hero />` and `<Footer />`.

### Verified
- Captured at 1280×900 DPR 2 against the reference. Artwork scale was tuned twice — the first
  pass oversized the shapes so they dominated the cards rather than sitting in the right half.
- Mobile at 390×844: all four cards present, stacked in order, `scrollWidth === clientWidth`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Notes
- Copy adapted to snapdesign (Creators / Studios / Affiliates / Partners) rather than carrying
  over the reference's Companies / Builders / Scouts / Partners and its TMW-token wording. The
  layout, badges, type scale, artwork and link treatment are reproduced as-is. See `D30`.

---

## 2026-09-26 (11)

### Fixed
- **Prompt-box submit button rendered mid-grey instead of deep black.**
  - **Root cause:** not a missed token — the button was already `bg-ink-900` (`#060505`). It
    carried `disabled:opacity-70`, and it is disabled whenever the prompt is empty, which is its
    resting state. 70% opacity over the white card washed the near-black circle out to grey.
    Deepening the ink scale made no visible difference because the opacity was doing the damage.
  - **Fix:** dropped `disabled:opacity-70`; the disabled state is now signalled with
    `disabled:cursor-not-allowed`, matching the reference design where the button stays dark
    while the placeholder is showing.
  - **Verified:** computed `background-color: rgb(6, 5, 5)`, `opacity: 1`, `disabled: true`.
    Captured at DPR 4.

### Notes
- Worth remembering: dimming a whole control with `opacity` shifts it toward whatever is behind
  it. On a light surface that turns black into grey. Prefer swapping a colour token for disabled
  states on dark-on-light controls.

---

## 2026-09-26 (10)

### Changed
- **Ink scale deepened** so the blacks read as true black rather than soft charcoal.

  | Token | Before | After | Used by |
  |---|---|---|---|
  | `--foreground` | `#1F1B1D` | `#0D0B0C` | body text |
  | `--ink-900` | `#241F21` | `#060505` | display heading, prompt submit button |
  | `--ink-700` | `#2A2527` | `#0F0D0E` | solid CTA ("Design") |
  | `--ink-500` | `#4A4542` | `#35312F` | nav links, "Sign in" |
  | `--ink-300` | `#8A8783` | `#807C78` | placeholder / muted |
  | `--auth-ink` | `#131313` | `#0A0A0A` | auth headings, labels, submit button |

- The blacks keep a trace of warmth (red channel a point or two above blue) rather than going
  to pure neutral `#000`, so they sit with the cream canvas instead of looking cold against it.

### Verified
- Computed styles on the live page: heading `rgb(6, 5, 5)`, CTA background `rgb(15, 13, 14)`,
  nav links `rgb(53, 49, 47)` over a `rgb(245, 241, 230)` canvas.
- Landing hero and `/signup` both captured at DPR 2 — contrast holds on the cream canvas and on
  the white auth card.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Notes
- `--auth-ink` was deepened alongside the marketing scale so the brand black is consistent
  across the landing page and the auth pages. The footer was already pure `#000000`.

---

## 2026-09-26 (9)

### Changed
- **Page canvas and raised surfaces now separated.** The navbar read as the same colour as the
  page because both were `#FFFFFA`.
  - `--background` `#FFFFFA` → **`#F5F1E6`** — a warm cream page canvas.
  - New **`--surface` `#FFFDF7`** token for raised elements that must sit above the page.
  - `--line` `#E6E4DC` → `#E4E0D3`, to stay a hairline against the warmer canvas.
- **Navbar** now uses `bg-surface/92` (`/78` where `backdrop-filter` is supported), a real
  hairline `border-black/[0.07]` in place of the near-invisible `border-white/50`, and a deeper
  shadow (`0_10px_28px_-8px` at 20% vs `0_8px_24px_-6px` at 12%).
- **Prompt box** moved from `bg-background` to `bg-surface`, so it stays a white card rather
  than picking up the cream canvas.
- The two `text-background` labels (Design CTA, prompt submit) moved to `text-surface`.

### Verified
- Computed styles: body `rgb(245, 241, 230)`, navbar resolving to a distinct near-white at 78%
  alpha over it.
- Full hero captured at 1280×800 DPR 2 — navbar, heading, image panel and prompt box all still
  correct against the warmer canvas.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

### Notes
- This is a visible palette shift: the site now reads as warm cream rather than off-white. The
  hero photograph's sepia tone sits better against it than it did against near-white.

---

## 2026-09-26 (8)

### Fixed
- **Flash of the full-width navbar before it collapsed to the bubble.** This was the visible
  jolt at the start of the reveal.
  - **Root cause:** the collapsed `max-width` came from a Tailwind class. A stylesheet applies
    only once it has loaded and parsed; until then `max-width` was unset, so the bar laid out at
    full width for the first frames and then snapped to 56px when the CSS landed.
  - **Evidence:** sampling the live `nav` width against a **production** build (not dev, where
    CSS is JS-injected and would not be representative) gave `t=27ms → 1264px`, `t=109ms → 56px`.
  - **Fix:** the animated values — `maxWidth` on the bar, and opacity / visibility / transform /
    filter on the content groups — moved from classes to inline `style`. Inline styles ship
    inside the HTML and apply during parse, so there is no window where the collapsed state is
    unstyled. Transition properties, durations and easing stay in classes.
  - **Verified:** re-sampled in production — first measured width is now **56px**, and the curve
    runs 56 → 320 → 640 → 834 → 948 → 1006 → 1052 → 1080 → 1098 → 1108 → 1114 → 1118 → 1120,
    monotonic with no overshoot.

### Changed
- **Reveal delay 2000ms → 180ms.** The animation now plays as the visitor lands. The remaining
  180ms is only enough for first paint to land, so the browser has a start value to transition
  from — it is not a wait.
- **Easing `cubic-bezier(0.34, 1.32, 0.5, 1)` → `cubic-bezier(0.16, 1, 0.3, 1)`.** The old curve
  overshot past full width and sprang back, which read as a bounce rather than a glide. The new
  curve is a long expo-style deceleration that settles without overshoot.
- **Stretch duration 950ms → 1150ms**, with `will-change: max-width`.
- **Contents now emerge instead of popping.** Each group scales from `0.94` and clears a 3px
  blur over 820ms on the same easing, with `origin-left` on the brand and `origin-right` on the
  actions, so they appear to unfold outward from the centre with the stretch.

### Verified
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.
- Mid-stretch and settled frames captured at DPR 2 against the production build.

---

## 2026-09-26 (7)

### Removed
- **"Book a Demo" button** from the navbar. "Sign in" and the "Design" CTA remain.

### Added
- **Navbar reveal animation.** The bar mounts as a 56×56 rounded-square bubble, holds for 2s,
  then stretches symmetrically to its full 1120px and its contents fade in.
  - `components/navbar.tsx` is now a client component (Phosphor imported from the main entry
    rather than `/ssr`, per decision `D9`).
  - The stretch animates `max-width` on an `mx-auto` element, so it grows from the centre
    outward in both directions. 950ms on `cubic-bezier(0.34, 1.32, 0.5, 1)` — the >1 control
    point gives a slight overshoot, which is what makes it read as a bubble rather than a slide.
  - Contents use `invisible`, not just `opacity-0`. Hidden visibility keeps the links out of the
    tab order during the 2s hold, so a keyboard user cannot focus a link they cannot see.
  - Contents fade in on a 420ms delay, after the stretch is underway.
  - `prefers-reduced-motion: reduce` renders the finished bar immediately with no reveal.

### Fixed
- **`react-hooks/set-state-in-effect` lint error** introduced by the first pass at the
  reduced-motion branch.
  - **Root cause:** the effect called `setOpen(true)` synchronously when the media query
    matched, which forces an immediate second render.
  - **Fix:** the preference is now read with `useSyncExternalStore` — it is something to
    subscribe to, not compute once — and the open state is *derived*
    (`prefersReducedMotion || revealed`). The effect now only schedules a timer.

### Verified
- Measured the live `nav` width via CDP across the reveal: **56px at t=1.2s**, **675px at
  t=2.3s**, **1120px at t=3.8s** — confirming the hold, the stretch and the settle.
- Captured all three states at DPR 2.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (6)

### Removed
- **Sidebar window chrome row** — the macOS traffic lights and the two panel-toggle icons.
  `TRAFFIC_LIGHTS`, `SidebarSimpleIcon` and `ColumnsIcon` were dropped with it rather than left
  unused. The project switcher is now the sidebar's top row.
- **Canvas clip header** — the pause glyph, "A Little Farther", the `Active` badge and the
  `04:22` timecode. `PauseIcon` dropped from the imports. The dotted canvas now runs clean to
  the top of the panel.

### Verified
- DOM assertions after render: page text no longer contains "A Little Farther" or "04:22";
  still contains "Starship Sources". No leftover references to any removed symbol.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (5)

### Added
- **Cursor comet on the editor canvas.** Dots near the pointer brighten to white and stream
  behind it as it moves.
  - Three layers share one 18px dot lattice so they register exactly: the resting grid at 38%
    white, a `.canvas-comet-tail` at 62% revealed through a 215px radial mask, and a
    `.canvas-comet-head` of pure white revealed through a 125px mask.
  - `components/editor/canvas-stage.tsx` runs a `requestAnimationFrame` loop that eases the head
    toward the cursor (`0.34`) and the tail toward the head (`0.11`). The lag between the two is
    what draws the trail.
  - Pointer position is held in **refs, not state** — it updates every frame and must never
    trigger a React re-render. The loop writes `--hx/--hy/--tx/--ty` as CSS custom properties, so
    only the mask centre changes and the browser recomposites instead of repainting.
  - On first pointer move, head and tail are seeded to the cursor so the comet does not fly in
    from wherever it was parked. On pointer leave, both comet layers fade out over 320ms.
  - Canvas content was wrapped in a `relative z-10` layer so the absolutely positioned comet
    sits behind the header, Upscale action and tool bar.
  - `prefers-reduced-motion: reduce` hides the tail — the highlight still tracks the cursor, it
    just stops streaming.

### Verified
- Driven with real CDP `Input.dispatchMouseEvent` sweeps, not simulated state. Mid-sweep the
  custom properties read head `x≈746px`, tail `x≈635px` — a 111px separation, confirming the
  trail is a genuine lag rather than a static glow. Captured at DPR 2.

### Notes
- Values are tuned in `app/globals.css` under the canvas comet block: mask radii for spread,
  the dot-layer alphas for brightness, and `HEAD_EASE` / `TAIL_EASE` in the component for how
  far the tail streams.

---

## 2026-09-26 (4)

### Changed
- **Canvas dots brightened** from 20% to 38% white, so the grid reads clearly against the
  `#0F1012` surface. Pitch unchanged at 18px.
- **"Add audio" action removed** from the canvas frame actions. `WaveformIcon` was dropped from
  the imports rather than left unused. "Upscale" remains.

### Verified
- DOM assertions after render: page text no longer contains "Add audio"; still contains
  "Upscale". No `WaveformIcon` references remain in the file.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (3)

### Changed
- **Selection chrome removed from the editor canvas.** Gone: the blue artboard outline, the four
  white corner handles and the `1920×1080` size badge. The now-unused `Handle` component was
  deleted rather than left behind.
- **The whole stage is now the dotted canvas.** The dot grid moved off the inner 16:9 artboard
  and onto the stage `<section>` itself, so it fills the entire centre panel: `#0F1012` surface,
  1px white dots at 20% on an 18px pitch (raised from 10% / 16px for visibility).
- The clip header, Add audio / Upscale actions and the tool bar are unchanged.

### Verified
- DOM assertions after render: `document.querySelectorAll('.outline-ed-blue').length === 0`, and
  the page text no longer contains `1920×1080`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26 (2)

### Changed
- **Editor canvas is now an empty dot grid.** The CSS gradient scene standing in for a video
  frame was removed from `components/editor/canvas-stage.tsx` and replaced with a dot-grid
  artboard: `#0F1012` surface, 1px dots at `rgba(255,255,255,0.10)` on a 16px pitch.
- The selection frame, corner handles and `1920×1080` badge are unchanged.

### Verified
- Computed styles on the canvas element resolve all three background properties independently:
  `background-color: rgb(15,16,18)`, the radial-gradient `background-image`, and
  `background-size: 16px 16px`.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-26

### Added
- **Editor workspace** at `/editor`, built to the supplied reference — a three-panel dark app
  shell that is now the post-auth landing surface.
  - `app/(app)/editor/page.tsx` — full-viewport `h-screen` flex row, no page scroll.
  - `components/editor/asset-sidebar.tsx` (server) — window chrome (traffic lights + panel
    toggles), project switcher, `Assets (10)` header, search field, and a two-column folder
    grid driven by an `ASSET_FOLDERS` array with per-folder counts.
  - `components/editor/canvas-stage.tsx` (client) — clip header with `Active` badge and
    timecode, the selection-framed stage with four corner handles and a `1920×1080` badge,
    Add audio / Upscale actions, and the floating tool bar with working active-tool state.
  - `components/editor/inspector.tsx` (client) — Editor/Chat tabs plus Time, Transform, Layout,
    Appearance, Fill, Source, Stroke and Shadow sections.
  - `components/editor/controls.tsx` — shared inspector primitives (`SectionHeader`, `Row`,
    `Field`, `SelectField`, `IconButton`) so every row shares one rhythm.
- **Editor tokens** in `app/globals.css`: `--ed-panel` `#0D0E10`, `--ed-canvas` `#141517`,
  `--ed-field` `#1C1D20`, `--ed-raised` `#232527`, `--ed-border` `#212328`, `--ed-text`
  `#E6E7E9`, `--ed-muted` `#8A8C90`, `--ed-dim` `#6B6C70`, `--ed-blue` `#2F6FED` — sampled from
  the reference.

### Changed
- Both auth forms now `router.push("/editor")` on submit, so signup and login land in the
  workspace. **This authenticates nothing** — see the note below.

### Verified
- Rendered via CDP at 1600×800 (DPR 2); inspector scrolled and captured separately to check the
  lower sections.
- `scrollWidth === clientWidth` and `body.scrollHeight === 800` — the shell fills the viewport
  exactly with no page scroll, as an app chrome should.
- `npm run lint` clean; `npm run build` succeeds, `/editor` prerendered.

### Notes
- The workspace is a faithful **shell**, not a working editor. Every inspector value is static,
  no asset folder opens, the search filters nothing, and the only live state is which tool and
  which tab is selected.
- The stage preview is a CSS gradient scene, not decoded media. There is no media pipeline.

---

## 2026-09-25 (8)

### Changed
- **Provider logos replaced with official brand artwork.** The auth pages' Google, GitHub and
  Apple marks were Phosphor icons, which draw stylised interpretations — Phosphor's "GitHub" is
  a generic cat silhouette, not the Octocat, and its "Google" is a plain letterform.
  - Added `components/brand-logos.tsx` exporting `GoogleLogo` (official four-colour G, 48×48
    viewBox), `GithubLogo` (Octocat, 24×24) and `AppleLogo` (24×24), each taking `size` and
    `className`, marked `aria-hidden` + `focusable="false"` since the buttons already carry
    `aria-label`.
  - `components/auth/social-buttons.tsx` now imports from it instead of
    `@phosphor-icons/react/ssr`.
- **`RULEBOOK.md` §3 clarified**: third-party brand marks are an explicit, narrow exception to
  the Phosphor-only rule. All functional UI icons remain Phosphor.

### Verified
- Provider row captured at DPR 3 and inspected at high zoom: all three marks render exactly,
  with no path artifacts or clipping.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-25 (7)

### Added
- **Auth pages** built to the supplied reference: `/signup` and `/login`.
  - `app/(auth)/signup/page.tsx`, `app/(auth)/login/page.tsx` — both static, each with its own
    `metadata.title`.
  - `components/auth/auth-shell.tsx` (server) — centred card on a grey canvas, split into the
    gradient promo panel and the form panel. Takes `kicker` + `headline` so each page supplies
    its own promo copy.
  - `components/auth/auth-form.tsx` (client) — one component serving both pages via a `mode`
    prop (`"signup" | "login"`) and a `COPY` map, so the two forms cannot drift apart.
  - `components/auth/password-field.tsx` (client) — password input with an Eye/EyeSlash
    visibility toggle carrying `aria-pressed` and a state-dependent `aria-label`.
  - `components/auth/social-buttons.tsx` (server) — "or continue with" divider plus Google,
    GitHub and Apple buttons.
  - `components/auth/auth-footer-link.tsx` (server) — the cross-link between the two pages.
- **Auth tokens** in `app/globals.css`: `--auth-canvas` `#E2E2E2`, `--auth-ink` `#131313`,
  `--auth-muted` `#9B9B9B`, `--auth-field` `#FCFCFC`, `--auth-border` `#E8E8E8`, and
  `--accent` `#EF7A43` — sampled from the reference.
- **Mesh gradient** for the promo panel: six stacked `radial-gradient` layers over a linear
  base, colours sampled from a 6x8 downsample of the reference panel. No image asset needed, so
  it stays sharp at any panel size.

### Changed
- Navbar is now wired: "Design" → `/signup`, "Sign in" → `/login`.

### Verified
- Rendered via CDP at 1280×800 (both pages) and 390×844, DPR 2.
- `scrollWidth === clientWidth` at every width tested — no horizontal overflow.
- `npm run lint` clean; `npm run build` succeeds, `/`, `/login`, `/signup` all prerendered.

### Notes
- Neither form submits anywhere. Supabase Auth is not wired, the social buttons do nothing, and
  "Forgot password?" points at `#`.

---

## 2026-09-25 (6)

### Added
- **Footer** built to the supplied reference, at both breakpoints.
  - `components/footer-data.ts` — `FOOTER_COLUMNS` and `SOCIAL_LINKS`, shared by the desktop
    grid and the mobile accordions so the two layouts cannot drift apart.
  - `components/footer.tsx` (server) — six-column desktop grid: brand mark, Browse, About,
    Legal, Follow (icon + label), newsletter. Mobile stack: accordions, Follow (icons only),
    Currency, newsletter. Ends with the oversized wordmark.
  - `components/footer-accordion.tsx` (client) — mobile accordions, one open at a time, animated
    with the `grid-rows-[0fr→1fr]` technique so no height is measured in JS. Collapsed links get
    `tabIndex={-1}` so they leave the tab order.
  - `components/newsletter-form.tsx` (client) — email input with an `ArrowRightIcon` submit.
    Submit handler is a stub; no mailing list is connected.
- **Footer tokens** in `app/globals.css`: `--footer-bg` `#000000`, `--footer-link` `#9D9D9D`,
  `--footer-muted` `#6A6C72`, `--footer-field` `#1D2028`, `--footer-line` `#26262B`, all sampled
  from the reference images.
- Footer mounted on `app/(marketing)/page.tsx`.

### Fixed
- **Navbar overflowed below ~430px.** The wordmark and the three actions could not fit the
  fixed bar, so "Book a Demo" overlapped the brand.
  - **Root cause:** the actions group had no responsive rule — all three rendered at every
    width — and the brand had no `shrink-0`, so flex resolved the conflict by overlapping.
  - **Fix:** "Book a Demo" is `hidden sm:block` (lowest-priority action, dropped first), the
    brand is `shrink-0`, and its flex parent is `min-w-0`.
  - **Verified:** at 390×844 `document.documentElement.scrollWidth === clientWidth === 390`.

### Verified
- Rendered via CDP at 1440×900 and 390×844 (DPR 2) against both reference images.
- Mobile accordion expanded and screenshotted in its open state.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-25 (5)

### Changed
- **Brand wordmark** `unify` → `snapdesign` in `components/navbar.tsx`.
- **Primary nav items** reduced from five to three: Product / Solutions / Customers / Resources /
  Pricing → **Mockups** (keeps the caret, treated as a category), **How it works**, **About**.
- **Primary CTA** label `Try for free` → `Design`. `Sign in` and `Book a Demo` are unchanged.

### Notes
- All nav items and buttons still point at `#`; no routes exist behind them yet.

---

## 2026-09-25 (4)

### Changed
- **Navigation bar is now a floating glass bar.** `components/navbar.tsx`:
  - `position: fixed`, offset `top-4` with `px-4` side gutters and `z-50`, so it detaches from
    the page edge and page content scrolls beneath it.
  - `rounded-2xl`, height reduced `h-16` → `h-14`, inner link gap `gap-10` → `gap-9`.
  - Glass treatment: `backdrop-blur-xl` + `backdrop-saturate-150` over a translucent
    `bg-[#FFFFFA]/65`, a `border-white/50` top-light edge, and a two-stop shadow
    (tight contact shadow + soft lift).
  - `supports-[backdrop-filter]:bg-[#FFFFFA]/45` drops the fill to 45% only where the browser
    can actually blur; without `backdrop-filter` support it stays at 65% so the bar remains
    opaque enough to read instead of turning into washed-out text on the photograph.
  - "Book a Demo" restyled to `bg-white/50` + `backdrop-blur-sm` so it reads as glass rather
    than a solid chip sitting on glass.
- `components/hero.tsx`: top padding `pt-8` → `pt-28` to clear the now-fixed bar.

### Verified
- Rendered at 1280×832 scrolled to y=380 via Chrome DevTools Protocol: the display heading is
  visibly blurred and diffused through the bar, confirming `backdrop-filter` is compositing.
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-25 (3)

### Fixed
- **Hydration mismatch on `<html>`.** React reported that server-rendered attributes did not
  match the client.
  - **Root cause:** a browser extension (`crxlauncher`) writes `crxlauncher=""` and
    `crxlauncher-bridged=""` onto the `<html>` element after the server response arrives but
    before React hydrates. Not a defect in application code.
  - **Evidence:** `curl http://localhost:3000 | grep crxlauncher` → 0 occurrences, so the
    attributes are absent from server output. Rendering in extension-free headless Chrome
    produces a hydrated `<html>` with only `lang` and `class`, and no hydration warning.
  - **Fix:** `suppressHydrationWarning` on `<html>` in `app/layout.tsx`. This is React's
    designated API for elements that third-party scripts legitimately mutate, and it applies to
    that element's own attributes only — it does not extend to descendants, so genuine
    mismatches inside the app still surface.
  - See decision `D11`.

### Verified
- `npm run lint` clean; `npm run build` succeeds with 0 TypeScript errors.

---

## 2026-09-25 (2)

### Added
- **Next.js app scaffolded** — Next.js 16.3.6 (App Router, Turbopack), React 19.2.8,
  TypeScript, Tailwind CSS v4, ESLint.
- **`@phosphor-icons/react` installed** as the sole icon library. Verified no Lucide present.
- **Google Fonts wired** via `next/font`: Inter (UI sans) and Newsreader (display serif).
- **Design tokens** defined in `app/globals.css` and exposed to Tailwind v4 via `@theme inline`:
  warm off-white canvas `#FFFFFA`, four-step warm ink scale, hairline `--line`.
- **`components/navbar.tsx`** — brand wordmark, five primary links (three with caret menus),
  Sign in, Book a Demo (outline), Try for free (solid). Server component; Phosphor imported
  from `@phosphor-icons/react/ssr`.
- **`components/prompt-box.tsx`** — client component. Auto-sized textarea with the catering
  placeholder copy and a circular submit button (Phosphor `ArrowUpIcon`), disabled until the
  prompt has content. Submit handler is a stub pending `/api/generations`.
- **`components/hero.tsx`** — mixed-weight serif display heading over a 1.91:1 background
  image panel with the prompt box floating centered on top.
- **`app/(marketing)/page.tsx`** — landing route composing Navbar + Hero. Default
  `app/page.tsx` removed so the route group owns `/`.
- **`public/hero-crowd.jpg`** — motion-blurred sepia crowd photograph used as the hero
  background.

### Verified
- `npm run build` succeeds: 0 TypeScript errors, `/` prerendered as static.

### Notes
- `AGENTS.md` / `CLAUDE.md` were generated by create-next-app and are maintained by `next dev`.
- The reference design uses a licensed display serif; Newsreader is the closest free substitute.
  See decisions `D7`.

---

## 2026-09-25

### Added
- `RULEBOOK.md` at repo root — the binding rules for all work on this project.
- `documentation/` folder created as the project's persistent memory, with four files:
  - `architecture.md` — what we are building
  - `changelog.md` — this file
  - `features.md` — every feature and its status
  - `decisions.md` — why choices were made

### Rules established
- Documentation must be updated after every prompt.
- The specified tech stack is locked; no substitutions or new dependencies without approval.
- No patch fixing — every bug is traced to its root cause and fixed there.
- Phosphor Icons (`@phosphor-icons/react`) is the only icon library. Lucide is banned.

### Notes
- Project is not yet scaffolded. `make-design-clone-structure.md` holds the planned structure and
  has been folded into `architecture.md`.
