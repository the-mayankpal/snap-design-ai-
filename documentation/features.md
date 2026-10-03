# Features

> Every feature in the project, its status, and how it works.
> Status values: `PLANNED` · `IN PROGRESS` · `DONE` · `REMOVED`

_Last updated: 2026-09-25_

---

## Summary

| # | Feature | Status |
|---|---|---|
| 1 | Landing page with prompt box | IN PROGRESS |
| 2 | Auth (signup, login, OAuth) | IN PROGRESS |
| 3 | Designs saved to Supabase (create, list, open, delete) | IN PROGRESS |
| 4 | AI prompt rewriting (Prompt Studio compose) | IN PROGRESS |
| 5 | AI image generation | IN PROGRESS |
| 6 | Image storage & delivery | IN PROGRESS |
| 7 | Credits system | PLANNED |
| 8 | Billing (Stripe checkout + webhook) | PLANNED |
| 9 | Settings page | PLANNED |
| 10 | Pricing page | PLANNED |
| 11 | Showcases page | PLANNED |
| 12 | Footer | IN PROGRESS |
| 13 | Editor workspace | IN PROGRESS |
| 14 | "How it works" section | IN PROGRESS |
| 15 | FAQ section | DONE |
| 16 | 404 page | DONE |
| 17 | Showcase | IN PROGRESS |
| 17 | Docked prompt bar | IN PROGRESS |
| 18 | Prompt Studio (Route → Analyze → Clarify → Compose → Generate) | IN PROGRESS |

---

## 1. Landing page with prompt box — IN PROGRESS

**Done**
- Navigation bar: `snapdesign` wordmark, three primary links (Mockups with a caret menu, How it
  works, About), Sign in, and a `Design` primary CTA. Floating glass bar, fixed to the viewport.
  Responsive — primary links collapse below `md`.
- Navbar reveal: mounts as a rounded-square bubble, holds 2s, then stretches open from the
  centre with its contents fading in. Respects `prefers-reduced-motion`.
- Hero section: mixed-weight serif display heading over a 1.91:1 background image panel.
- Prompt composer floating centered on the panel: textarea with placeholder copy and a circular
  submit button that stays disabled until the prompt has content.
- Dictation on the homepage prompt (hero box and docked bar): a mic beside the send arrow; speech
  types into the prompt. Hidden where the browser does not support speech recognition.
- Dark theme (D79): a moon/sun toggle in the navbar (homepage and About) switches the page to
  a near-black theme; About becomes dark notebook paper with chalk-white pen lines.
  The same choice themes the dashboard, the editor (light canvas with dark dots) and the
  sign-in pages; each area keeps its own default until a choice is made. Remembered per browser and applied before first paint; the "Design
  anything" mockup tiles stay light.

**Not done**
- Nav dropdown menus do not open; every link points at `#`.
- No mobile menu button — primary links simply hide below `md`.
- ~~Prompt submit is a stub~~ — now runs Prompt Studio (#18).
- `public/hero-crowd.jpg` is a generated placeholder, not the final photograph.
- Nothing below the hero (the rest of the landing page).

## 2. Auth — IN PROGRESS

**Done (UI only)**
- `/signup` and `/login`, both matching the reference design: centred card, gradient promo panel
  on the left, form on the right.
- Email + password fields with native validation (`type="email"`, `required`) and a password
  visibility toggle.
- "or continue with" row for Google, GitHub and Apple.
- Cross-links between the two pages; "Forgot password?" on login only.
- Navbar "Design" and "Sign in" route here.

**Not done**
- **No authentication actually happens.** Both forms call `preventDefault()` and stop; nothing
  is sent, validated server-side, or stored. Supabase Auth is not wired.
- The three social buttons are presentational — no OAuth flow exists.
- "Forgot password?" points at `#`; there is no reset flow.
- No session handling, no `middleware.ts`, no route guards. `app/(app)/` does not exist yet, so
  there is nothing to protect.
- No error, loading or success states, because there is no request to have them for.

## 3. Designs saved to Supabase — IN PROGRESS
(Planned as "projects"; the product calls them designs — D62.)

**Done**
- Pin designs (D81): a pin on each dashboard card keeps it in a "Pinned" section at the top.
- Designs, their chat history and attached images are stored in Supabase (Postgres + Storage),
  replacing the browser's IndexedDB. Existing IndexedDB designs are not migrated.
- The gallery (`/designs`) lists, creates and deletes designs; the editor loads a design,
  appends messages, saves settings and the chosen cover — all through `/api/designs`.
- **No login.** A browser owns its designs through the `sd_device` cookie (D60). Testers never
  see each other's designs; clearing cookies loses access.
- Deleting a design removes its rows and its stored images.
- A message that fails to save shows a notice in the chat; a design that fails to load says so
  instead of claiming it was deleted.

**Not done**
- Auth, `profiles`, claiming device designs into an account (D59).
- No rename UI; the title comes from the first prompt.
- Files orphaned by an abandoned upload (slot issued, message never saved) are not cleaned up.

## 4. AI prompt rewriting — IN PROGRESS
Built as Prompt Studio's compose step (#18): `pipeline.compose()` writes the final image prompt
from the completed brief with `CORE_RULES` + the playbook's rules + few-shot examples. The
final prompt is stored on the generation row and never sent to the browser.
**Not done:** the few-shot examples are samples (see #18); non-web categories.

## 5. AI image generation — IN PROGRESS
`pipeline.generate()` calls the OpenAI Images API with `OPENAI_IMAGE_MODEL`, one PNG at the
playbook's size (desktop page 1024×2560, section 1536×864; mobile 720×2160 / 864×1536).
**Not done:** variations/count, editing and re-edit flows, the editor chat still does not
generate (it shows its "not connected" reply), rate limiting beyond the kill switch.

## 6. Image storage & delivery — IN PROGRESS
**Done:** private `designs` bucket (10 MB, PNG/JPG/WebP/GIF); chat attachments upload straight
from the browser through signed upload URLs; images are served by 1-hour signed URLs;
Prompt Studio stores each generated PNG at `generations/<generation-id>.png`.
**Not done:** reduced WebP variant (PLANNED — needs an image library, not approved yet);
`image_url` is intentionally null because links are signed per request (D61).

## 7. Credits system — PLANNED
Each generation costs credits. Balance on `profiles.credits`. Checked before generating,
deducted after success. Insufficient credits → HTTP 402.

## 8. Billing — PLANNED
Stripe checkout session created server-side; the webhook verifies the event and adds credits.
Credits are only ever granted by the verified webhook, never by the client.

## 9. Settings — PLANNED
Account, plan, and credit balance.

## 10. Pricing — PLANNED
Public plan comparison leading into checkout.

## 11. Showcases — PLANNED
Public gallery of generated designs.


## 12. Footer — IN PROGRESS

**Done**
- Desktop: six-column grid — brand mark, Browse, About, Legal, Follow (icon + label), newsletter.
- Mobile: collapsible accordions for Browse / About / Legal, Follow as an icon row, Currency
  chip, newsletter, all on a black surface.
- Oversized brand wordmark spanning the full footer width at every viewport.
- Social icons are Phosphor (`InstagramLogoIcon`, `XLogoIcon`, `TiktokLogoIcon`).

**Not done**
- Footer links point at real paths, but only `/` and `/showcase` exist — the rest correctly
  render the 404 page. Social links remain `#` pending real profile URLs.
- Newsletter submit is a stub — no mailing list provider is connected, and nothing is stored.
- The Currency control is presentational only. No multi-currency support exists anywhere in the
  product; it renders a static `$` chip that does not open.
- `BrandMark` is a placeholder circle with "s", not real logo art.


## 13. Editor workspace — IN PROGRESS

`/editor`. Three-panel dark app shell, and the landing surface after signup or login.

**Done**
- Chat panel (left, 320px): thread with user bubbles and full-width assistant turns, empty state
  with tappable suggestions, composer with Enter-to-send and Shift+Enter for a newline, and a
  new-chat action.
- Image attachments in the composer, up to 5, with thumbnails, per-image removal and a cap that
  releases when one is removed. Sent images appear in the thread.
- Voice dictation: speech transcribes into the composer so it can be edited before sending.
  Hidden where the browser does not support it.
- Canvas stage: a free board, like FigJam. Drag an image to move it; select it and drag a corner
  handle to resize (aspect ratio kept). Drag empty space or scroll to pan; pinch or Ctrl/Cmd +
  scroll zooms toward the cursor. New images land below the others; a placeholder out of view
  brings the view to it. Positions and sizes are saved per image (D78).
- Notes on images (D80): write a short label under any image ("final v1"). The chat reads them;
  a note marking an image final makes its look the project style for what comes next.
- Inspector: an "Editor" heading, a zoom control, and a "Generate" section (ratio, design type,
  variation count). Nothing else.
- Generate controls: 8 aspect ratios drawn to true proportion, 4 design types (Website,
  Marketing, Slides, Graphic — no apps or dashboards), and a 1/2/3/Auto variation selector.
- Cursor comet: dots near the pointer brighten to white and stream behind it, easing back to
  the resting grid on pointer leave. Respects `prefers-reduced-motion`.
- Canvas zoom, 25%–400%: Ctrl/Cmd + wheel, Ctrl/Cmd + `=`/`-`/`0`, `−`/`+` buttons in the
  inspector, and click-the-percentage to reset.
- Both side panels are resizable by dragging the divider, with min/max clamps, double-click to
  reset, and arrow-key support. The canvas takes the remaining width.
- Mobile (below `md`): only the chat panel renders, full screen. The generate settings collapse
  into a section above the composer with a live summary, sharing state with the desktop
  inspector.
- Live state: the selected tool, and the selected inspector tab.

**Not done — this is a shell, not a working editor**
- The Generate controls hold real selection state but nothing reads it — there is no pipeline.
- The stage is an empty dotted canvas. Nothing can be placed on it — there is no document
  model, no selection, no media pipeline, no decode and no playback.
- **No model is connected.** Sending captures the message and returns a fixed note saying
  generation is not wired. Nothing is generated, stored or sent anywhere.
- Attachments live in browser memory only — nothing is uploaded.
- Panel widths are not persisted; a refresh returns to the defaults.
- The thread does not persist — a refresh clears it.
- The inspector's "Chat" tab is now a duplicate of this panel and still renders a placeholder.
- No project, document, timeline, undo stack or persistence of any kind.
- The Chat tab renders a placeholder.
- **Anyone can open `/editor` directly.** There is no auth guard, because there is no auth.


## 14. "How it works" section — IN PROGRESS

A serif section heading over four tinted cards walking through the product: Describe, Refine,
Download, Own it. Sits between the hero and the footer at `#how-it-works`.

**Done**
- Section heading, anchored so the navbar's "How it works" link scrolls here.
- 2x2 grid on `md` and up, stacking to a single column below.
- Each card: pill badge with a coloured access dot, heading, body copy, underlined arrow link,
  and an abstract SVG artwork bleeding off the right edge.
- Arrow nudges right on hover; link underline darkens.

**Not done**
- The cards carry no links — they read as an explanation, not as entry points.
- The navbar's About link points at `/about`, which does not exist yet and renders the 404.
- The access labels ("Open / Free to start", "Invite only") are copy only; nothing gates
  anything.


## 15. FAQ section — DONE

`#faq` on the landing page. Centred eyebrow and heading over five disclosure rows.

**Done**
- Resting rows render as pills; the open row expands into a bordered white card and its `+`
  control flips to `×`.
- One row open at a time; clicking the open row closes it.
- Animated panel height, no layout jump.
- Disclosure semantics: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`.
- Five real questions covering output, experience level, ownership, brand kits and pricing.

**Worth knowing**
- Copy follows `brand-and-content.md`. Claims for unbuilt features (brand kits, workspaces, API,
  affiliate programme) were removed; the only forward-looking claim left is credit-based pricing
  with a free trial, which §7 marks as planned for launch.


## 16. 404 page — DONE

Handles every unmatched URL and returns a real 404 status.

**Done**
- Artwork (separate landscape and portrait crops), serif heading, supporting copy.
- "Go to homepage" and "Try again" actions; "Try again" re-fetches via `router.refresh()`.
- Suggestion links to How it works, FAQ and Sign in.
- Navbar rendered, so the page stays navigable.
- Responsive with no horizontal overflow at 390px.


## 17. Docked prompt bar — IN PROGRESS

**Done**
- A compact prompt bar rises from the bottom of the viewport once the hero prompt scrolls out of
  view, and follows the reader down the page.
- Shares its value with the hero box, so typed text survives the handover in both directions.
- Stays visible all the way to the bottom of the page, footer included.
- A black line travels the pill's border with a fading tail.
- Not focusable while hidden; respects `prefers-reduced-motion`.

- Submitting runs Prompt Studio (#18); questions and progress appear above the bar.

**Not done**
- Nothing specific to the bar; see #18.


## 17. Showcase — IN PROGRESS

**Done**
- "Made with snapdesign" marquee on the landing page: two rows of card frames scrolling in
  opposite directions, edge-faded, pausing on hover, respecting `prefers-reduced-motion`.
- `/showcase` gallery page with a responsive grid of the same frames.
- Navbar "Mockups" links to the gallery.

- 19 designs wired in: 12 websites, 3 marketing campaigns, 3 graphics, 2 slide decks. Each
  renders at its own aspect ratio, so the rows have real variety. Ordered by cycling through the
  categories so rows and columns stay mixed.

**Not done**
- Frames are not clickable and there is no per-design detail view.
- Categories are stored on each design but there is no filtering UI on the gallery page.

## 18. Prompt Studio (Route → Analyze → Clarify → Compose → Generate) — IN PROGRESS
Phase 1 of the generation system (D70).

**Done**
- **Router:** every prompt is classified into one of 9 categories with a confidence label.
  Low confidence asks "What are you making?" with category chips (unavailable ones tagged
  "Soon"). A recognised but not-yet-enabled category (e.g. "make me a birthday card" →
  greeting_card) gets a friendly coming-soon message — never forced into web.
- Submitting from the hero box or the docked bar calls `POST /api/prompt/analyze`. The model
  (Structured Outputs, strict JSON schema) extracts the web brief — mode, section(s), industry,
  business type, vibe, name, audience, colours, key content, device.
- **Clarify:** if required parts are missing (mode, section when mode is section, industry) or
  the model flags business type / vibe as worth asking, up to 3 questions appear under the
  prompt as chips, each with "Surprise me". One round only; questions come only from the bank
  in `questions.ts`. Skipping is allowed; the Generate button goes with what is answered.
- **Ready:** a specific prompt skips the questions and generates straight away.
- **Compose + generate:** `POST /api/generations` re-validates the prompt, brief and answers,
  fills defaults, composes the final prompt, generates the PNG, stores it, and records the row
  (`pending` → `succeeded` / `failed`).
- On success the image is saved to a new design owned by this browser (with the prompt as its
  first chat message), and the browser opens it in the editor, where the canvas shows it.
- Loading, error, content-filter and "generation switched off" (403) states have their own copy.
- **Kill switch:** both routes return 403 unless `ALLOW_UNAUTHENTICATED_GENERATION=true`.
- Only `web_section` is enabled (full pages and single sections); the pipeline and registry
  are category-agnostic.
- `/api/generations` accepts an optional `projectId` (a design this browser owns) to add the
  image to an existing design instead of creating one. The landing page doesn't send it yet.
- Nullable columns for later phases exist: `generations.parent_id`, `canvas_x`, `canvas_y`,
  `designs.style_lock`.

**Not done**
- **Real few-shot examples are pending from the owner.** `lib/ai/playbooks/web/examples.ts`
  holds two SAMPLE pairs marked `// SAMPLE — replace with owner's prompts`.
- Not yet run against live OpenAI and Supabase (no keys configured at build time).
- Router not yet run against the live model — "birthday card → greeting_card" is verified only
  via the explicit-category path.
- Phase 2 canvas, versions and edit-from-image; phase 3 taste lock; phase 4–5 playbooks.
- Auth, credits, rate limiting; the editor chat does not use the pipeline.

## 19. Owner's users page (`/admin`) — DONE
- One card per account: email, verified, provider, joined / last sign-in / last active, free
  images used, totals (designs, images, failed, prompts), 8 newest images with notes, and every
  design with its prompts (expandable). Owner only via `ADMIN_EMAILS`; others get a 404 (D84).

## 20. Free tier — DONE
- 5 images for life per email + network + browser (refused if any is used up); 25 chat turns
  for life; disposable or unconfirmed emails get none; owner exempt. Counter in the editor (D83).

## 21. Dashboard drag to reorder — DONE
- Drag cards within Pinned or All designs; order saved on drop; touch = press and hold (D82).

