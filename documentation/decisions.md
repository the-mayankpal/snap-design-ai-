# Decisions

> Why we chose what we chose. Read this before proposing a change to any of it — these decisions
> are settled and should not be re-litigated without a new explicit instruction.

_Last updated: 2026-09-26_

---

## D1 — Supabase for database, auth, and storage
**Decision:** Use Supabase for all three instead of separate services (e.g. MongoDB + custom auth
+ Cloudflare R2).
**Why:** One platform covers DB + Auth + Storage, cutting the stack to four services
(Vercel · Supabase · OpenAI · Stripe). Row Level Security gives per-user data isolation at the
database layer rather than in application code.
**Trade-off:** Supabase Storage charges egress (~$0.09/GB). If image traffic grows, only
`lib/storage/upload.ts` changes to swap in R2 — both are S3-compatible.

## D2 — Next.js App Router, one app for frontend and backend
**Decision:** Frontend and API live in a single Next.js app.
**Why:** Code under `app/api/` and `lib/` compiles into the server bundle only, so the prompt
rewriting logic — the core IP — is never shipped to the browser and cannot be read via inspect.

## D3 — Phosphor Icons, Lucide banned
**Decision:** `@phosphor-icons/react` is the only icon library.
**Why:** One consistent icon system across the app; multiple icon libraries produce visual
inconsistency and bundle bloat. Phosphor's weight system gives one family across all densities.
**Applies to:** scaffolded/shadcn components too — any Lucide import must be replaced on sight.

## D4 — Root-cause fixing, never patching
**Decision:** Bugs are traced to their origin and fixed there. Symptom suppression is banned.
**Why:** Patched symptoms compound into an unmaintainable codebase and hide real defects until
they surface in production. Taking longer is always the right call.

## D5 — Locked tech stack
**Decision:** The stack in `RULEBOOK.md` may not be added to or substituted without explicit
approval.
**Why:** Every extra dependency is a permanent maintenance and security cost. Proposals are
welcome; unilateral additions are not.

## D6 — Documentation as project memory
**Decision:** `/documentation` is updated after every prompt and is the single source of truth.
**Why:** Sessions lose context. Written state is the only reliable memory across sessions, and it
prevents rebuilding or contradicting work that already exists.

## D7 — Newsreader as the display serif
**Decision:** Use Google's Newsreader for the hero display heading.
**Why:** The reference lockup uses a licensed editorial serif (Tiempos Headline / Financier
family) that cannot be redistributed. Newsreader is the closest freely licensable match —
transitional letterforms, ball terminals, moderate stroke contrast — and ships weights 400–800,
which the mixed-weight heading needs.
**If the licensed face is ever purchased:** swap the `Newsreader` import in `app/layout.tsx`;
nothing else references the font directly, since everything goes through `--font-newsreader`.

## D8 — Hero photograph is a placeholder
**Decision:** `public/hero-crowd.jpg` ships as a generated warm, motion-blurred abstract image.
**Why:** The photograph in the reference is licensed stock and cannot be copied. The placeholder
holds the correct tone, aspect ratio (1.91:1) and contrast so the prompt box stays legible.
**Action required:** replace it with a real licensed motion-blurred crowd photograph at
1920×1005 or larger. Drop it in at the same path — no code change needed.

## D9 — Phosphor SSR entry in server components
**Decision:** Server components import from `@phosphor-icons/react/ssr`; client components
import from `@phosphor-icons/react`.
**Why:** The package's default entry is client-only and throws when rendered on the server.
The `/ssr` entry exports the same icon names with no client runtime, so icons stay in the
server bundle and cost nothing on the client.

## D10 — Design tokens in CSS, exposed via `@theme inline`
**Decision:** All colours live as CSS custom properties on `:root` in `app/globals.css` and are
mapped into Tailwind through `@theme inline`.
**Why:** One place to retune the palette, and components stay readable (`text-ink-500`, not a
hex literal). This is the Tailwind v4 idiom — there is no `tailwind.config.ts` colour block.

## D11 — `suppressHydrationWarning` on the root `<html>` element
**Decision:** `app/layout.tsx` sets `suppressHydrationWarning` on `<html>`.
**Why:** Browser extensions routinely write attributes onto `<html>` between the server response
and hydration. React compares its output against the already-mutated DOM and reports a mismatch
that no application change can prevent — the cause is outside the codebase and outside our
control, and it affects real visitors, not just local development.
**Why this is not symptom-patching:** the mismatch was traced to its actual origin and confirmed
from both sides (absent in server HTML, absent in an extension-free browser) before any code
changed. `suppressHydrationWarning` is the API React provides for exactly this case.
**Scope guard:** the flag applies to the element's own attributes and text only — it does **not**
propagate to descendants. Hydration bugs anywhere inside the app still throw normally. Do not
add this flag to any other element to quiet an error; anywhere else it would hide a real defect,
which rule 4 of `RULEBOOK.md` forbids.

## D12 — Glass navbar degrades by opacity, not by removal
**Decision:** The floating navbar's translucent fill is set at 65% and lowered to 45% only
inside `supports-[backdrop-filter]`.
**Why:** `backdrop-filter` is what makes the bar legible — it blurs whatever scrolls behind it.
Where the browser cannot blur, a 45% fill would leave nav links sitting directly on the
high-contrast hero photograph and become unreadable. Raising the opacity in the fallback keeps
the bar functional rather than merely decorative.
**Coupling to watch:** the hero's `pt-28` exists solely to clear the fixed bar. Bar height
(`h-14`) and offset (`top-4`) and that padding must be changed together.

## D13 — Footer wordmark is SVG text, not CSS
**Decision:** The oversized footer wordmark is an SVG `<text>` with `textLength` +
`lengthAdjust="spacingAndGlyphs"`, not an HTML element with a large `font-size`.
**Why:** The design requires the word to span the footer's full width exactly, at every
viewport. CSS cannot express "be precisely this wide" for text — rendered width is a function of
font metrics, so `clamp()` only approximates it and leaves ragged gaps at some widths.
`textLength` states the width as a constraint and the renderer satisfies it.
**Cost to watch:** `spacingAndGlyphs` stretches glyphs when the natural width is far from the
target. `fontSize="190"` was picked so `snapdesign` renders close to 1000 units naturally.
**A different brand name, or a different weight, needs that number retuned.**

## D14 — Footer copy adapted to this product, layout kept verbatim
**Decision:** The reference's structure, spacing, type scale and behaviour were reproduced
as-is, but its music-marketplace copy (Tracks, Sounds, Artists, "new tracks & sounds") was
rewritten for snapdesign (Mockups, Templates, Showcase, "new mockups & templates").
**Why:** The request was for this footer *design* carrying our brand. Shipping music-store
vocabulary on a design product would have been a faithful copy of the wrong thing.
**Kept deliberately:** "Limited Edition" and "Free Stuff" read as plausible product categories,
so they were left. The mobile Currency control was kept because it is part of the referenced
design, but it is presentational — see `features.md` §12.

## D15 — One form component for both auth pages
**Decision:** `components/auth/auth-form.tsx` takes a `mode` prop and reads its strings from a
`COPY` map, rather than existing as two sibling components.
**Why:** The two pages differ only in labels, one extra link, and an autocomplete token — the
field markup, validation, styling and layout are identical. Two copies would drift the moment
either is touched, and auth forms are exactly where a silent divergence is expensive.
**Where they legitimately differ:** signup sets `autoComplete="new-password"` so password
managers offer to generate one; login sets `current-password` so they offer to fill. Getting
this backwards quietly breaks password managers, which is why it lives in the map rather than
being hardcoded.

## D16 — Promo panel gradient is CSS, not an image
**Decision:** The auth promo panel's mesh gradient is six stacked `radial-gradient` layers in a
`MESH` constant.
**Why:** It stays sharp at any panel size and any DPR, adds no network request and no asset to
maintain, and the colours are editable in place. An exported PNG would need several sizes and
would band on wide screens.
**Colours** were sampled from a 6×8 downsample of the reference panel, so the hot core, blush
top-left and cream bottom-right sit where the original has them.

## D17 — Reference's footer link copy was corrected
**Decision:** The signup page reads "Already have an account? **Sign in**", not "Register" as
the reference image shows.
**Why:** The reference has a copy bug — on a *create account* page, "Already have an account?"
must lead to signing in, not registering again. Reproducing it would have shipped a link that
sends existing users back to the page they are already on.

## D18 — Third-party brand marks are official SVG, not Phosphor
**Decision:** Logos for external companies live in `components/brand-logos.tsx` as each vendor's
own artwork. `RULEBOOK.md` §3 carries a matching carve-out.
**Why:** Phosphor draws *interpretations* of brand marks — its GitHub icon is a generic cat
silhouette rather than the Octocat, and its Google icon is a plain letterform with none of the
four-colour construction. On a sign-in row, where users recognise these marks instantly, an
approximation reads as untrustworthy — exactly the wrong signal on an auth screen. Brand marks
are trademarks with prescribed artwork; they are reproduced, not redrawn.
**Scope of the exception:** brand marks only. Every functional UI icon — carets, arrows, eyes —
is still Phosphor, and no general-purpose icon library was added.
**Colour handling:** Google keeps its fixed brand colours. GitHub and Apple use `currentColor`,
so they inherit from the button and will work unchanged on a dark surface.

## D19 — Workspace lives at `/editor`, not `project/[id]`
**Decision:** The workspace route is `app/(app)/editor/page.tsx`, diverging from the
`project/[id]` path in the original structure sketch.
**Why:** `project/[id]` needs an id, which needs a projects table and a record to point at.
Neither exists. Inventing a fake id to satisfy a route shape would be scaffolding built to be
thrown away.
**Migration:** when projects land, move the file to `app/(app)/project/[id]/page.tsx`. The three
panel components need no changes — they take no props today, and will take a project instead of
inventing one.

## D20 — Auth forms navigate but do not authenticate
**Decision:** Submitting signup or login calls `router.push("/editor")`.
**Why:** It makes the flow walkable end to end — the thing the request asked for — without
pretending to a security boundary that does not exist.
**The risk this carries:** `/editor` is reachable by anyone typing the URL, and the forms accept
any input. This is fine for a prototype and **not** fine once real data exists. When Supabase
Auth is wired, the `router.push` must be replaced by a real sign-in call, and `/editor` must
gain a guard — both in the same change, or the app ships an unprotected workspace.

## D21 — The stage is an open dotted canvas
**Decision:** The dot grid is applied to the whole stage panel — `#0F1012` with 1px white dots
at 20% on an 18px pitch — with no artboard rectangle, no selection outline, no corner handles
and no size badge.
**History:** this went through two earlier passes. Literal rocket and silhouette shapes read as
abstract blobs, and the gradient scene that replaced them still implied footage that does not
exist. A dot grid states the truth plainly: the canvas is empty.
**Why it is also the right end state:** snapdesign generates designs, not video. An open dotted
canvas is the correct idiom for a design surface, and it needs no asset, no decode and no
placeholder that has to be torn out later. The selection chrome was removed with it — a
selection outline around nothing is chrome describing a state that cannot exist yet. It comes
back when there is a document with something in it to select.

## D22 — "Add audio" dropped from the canvas
**Decision:** The Add audio action was removed from the editor's frame actions; Upscale stayed.
**Why:** It came across from the video-editor reference. snapdesign generates designs, not
video — an audio affordance on a design canvas promises a capability the product will not have.
Upscale, by contrast, is meaningful for generated imagery and was kept.

## D23 — Cursor comet uses masked layers + refs, not state or canvas
**Decision:** The canvas hover effect is three CSS dot layers with radial masks, driven by a
`requestAnimationFrame` loop that writes CSS custom properties from React refs.
**Why not React state:** the pointer position changes every frame. Holding it in state would
re-render the entire canvas panel — and its tool bar and header — 60 times a second for a purely
visual effect. Refs plus `style.setProperty` keep React out of the loop entirely.
**Why not `<canvas>` or JS-drawn dots:** the resting grid is already a CSS background. Reusing
the same lattice for the comet layers guarantees the bright dots land exactly on the dim ones —
a separately drawn overlay would have to re-derive the grid origin and would drift on resize.
**Why two layers:** one masked layer gives a spotlight, not a comet. The trail comes from the
tail easing toward the *head* rather than the cursor, so it lags proportionally to speed — fast
movement stretches it, stopping lets it catch up.
**Tuning:** mask radii and layer alphas in `app/globals.css`; `HEAD_EASE` / `TAIL_EASE` in
`components/editor/canvas-stage.tsx`.

## D24 — Navbar reveal animates `max-width`, not `transform`
**Decision:** The bubble-to-bar stretch animates `max-width` on a centred (`mx-auto`) element,
with contents toggled by `visibility` rather than opacity alone.
**Why not `transform: scaleX()`:** scaling would squash and stretch the wordmark and links with
the container. The bar has to *grow* while its contents stay at true size.
**Why centred max-width:** it expands from the middle outward in both directions with no
positioning maths, which is the "stretch from both sides" the effect needs.
**Why `visibility`, not just opacity:** an `opacity-0` link is still focusable. During the 2s
hold a keyboard user could tab into links they cannot see. `invisible` removes them from the tab
order natively and still transitions.
**Cost:** `max-width` is a layout-affecting property, so this animation is not purely
composited. It is acceptable here — one element, once per page load, nothing else in the bar
reflowing — but the same approach should not be reused for anything animating continuously.

## D25 — Reduced-motion read as an external store
**Decision:** `prefers-reduced-motion` is read with `useSyncExternalStore` and the navbar's open
state is *derived* from it, rather than an effect calling `setState` when the query matches.
**Why:** the first version tripped `react-hooks/set-state-in-effect`. Setting state
synchronously from an effect forces a second render pass immediately after the first. The media
query is a subscription — something React can read and re-read — not a one-time computation, so
`useSyncExternalStore` is the honest shape. It also picks up a preference change mid-session,
which the effect version would have missed.
**Rule 4 note:** the lint error was traced to its cause and the shape corrected; no rule was
disabled to silence it.

## D26 — Animated initial state must be inline, not class-driven
**Decision:** The navbar reveal's animated values live in inline `style`; only the transition
properties, durations and easing stay in Tailwind classes.
**Why:** a class-driven collapsed `max-width` produced a flash of the full-width bar. Classes
depend on a stylesheet that has not necessarily loaded when the HTML is first laid out, so the
element renders unconstrained and then snaps. Inline styles are part of the HTML and apply
during parse.
**The general rule:** any element whose *initial* state must be visually correct before
hydration — collapsed, hidden, offscreen, scaled — needs that state inline. This applies to
future reveal or entrance animations, not just this one.
**How to catch it:** test against a production build. Dev mode injects CSS through JavaScript,
so its timing is not representative of what users get.

## D27 — Separate `--background` and `--surface` tokens
**Decision:** Two tokens exist even though both are currently `#FFFFFF`: `--background` for the
page canvas, `--surface` for anything that must read as raised above it — the floating navbar,
the prompt box.
**History:** the navbar originally had no separation from the page (both `#FFFFFA`), so the
canvas was moved to warm cream to create a tonal step. That change *also* replaced the
near-invisible `border-white/50` with a real `border-black/[0.07]` hairline and roughly doubled
the shadow. When the canvas was later returned to white on request, the bar still read clearly —
the chrome, not the tonal step, turned out to be doing the work.
**Why keep both tokens:** they mean different things even at the same value. If a raised element
ever needs separation again, only `--surface` moves and every raised element follows.
**Rule going forward:** page-level backgrounds use `--background`; cards, bars, popovers and
anything floating use `--surface`.
**Lesson:** a shadow only reads as depth when it is strong enough and its border is actually
visible. The original bar failed on both counts, and the cream canvas was compensating for that
rather than fixing it.

## D28 — Blacks are deep but warm, not pure `#000`
**Decision:** The ink scale was deepened to near-black (`--ink-900: #060505`,
`--ink-700: #0F0D0E`, `--auth-ink: #0A0A0A`), keeping the red channel a point or two above blue.
**Why deepen:** the previous charcoals (`#241F21`, `#2A2527`) read as soft grey against the
cream canvas and undercut the editorial weight of the display serif.
**Why not pure `#000`:** a perfectly neutral black next to a warm cream canvas reads cold and
slightly detached — the eye registers the hue mismatch. Holding a trace of warmth keeps the
black sitting *in* the palette. The footer is the exception and stays `#000000`, because it is a
full-bleed inverted surface with no cream beside it.

## D29 — Disabled states must not dim dark-on-light controls with `opacity`
**Decision:** The prompt-box submit button keeps its full `--ink-900` fill when disabled and
signals the state through the cursor instead of `opacity`.
**Why:** `opacity` blends a control toward whatever sits behind it. A near-black circle at 70%
on a white card reads as mid-grey — so the button looked unstyled even after the ink scale was
deepened, and the real cause was invisible from the token values alone.
**Rule:** for dark-on-light controls, express a disabled state by swapping a colour token, or by
cursor and `aria-disabled` alone. Reserve `opacity` dimming for elements on surfaces close to
their own tone, where the blend does not change the read.

## D30 — Audience cards: layout reproduced, copy adapted
**Decision:** The reference's grid, card anatomy, badges, type scale, artwork treatment and link
styling were reproduced as asked. Its copy was not — Companies / Builders / Scouts / Partners
and the TMW-token wording became Creators / Studios / Affiliates / Partners.
**Why:** the request was for this design on snapdesign's site. The original copy describes
another company's token economy; shipping it verbatim would put a referral programme for a
different product on the landing page. The visual design is what was being praised and that is
what was copied.
**Reversible:** all copy lives in the `CARDS` array in `components/audience-cards.tsx`, so
restoring the reference's wording is a single edit if that was actually wanted.

## D31 — Card artwork is inline SVG, authored to the card's right edge
**Decision:** The four artworks are inline SVG in `components/audience-art.tsx`. Each viewBox is
sized so its right edge coincides with the card's right edge (275 or 235 x 410), paired with
`w-[38%]` on the artwork element.
**Why inline SVG:** four abstract graphics as image files would be four requests, four assets to
maintain, and would band across a gradient. As SVG they scale cleanly and cost nothing to ship.
**Why the viewBox is anchored to the card edge:** every one of these designs has shapes that run
off the right of the card — half-discs clipped to crescents, blocks cut mid-stride. That bleed
only lands correctly if the viewBox's right edge *is* the clip boundary. Authoring in an
arbitrary square and hoping `slice` crops it in the right place does not reproduce it.
**Matched pair:** viewBox width and `w-[38%]` must change together.
**How these were built:** each artwork was cropped from the reference at 2x and read
shape-by-shape — skew angle, corner radius, centre offsets and gradient endpoints measured
before any code. An earlier pass that eyeballed them produced shapes that were recognisably
the wrong construction (lens petals instead of skewed rectangles, concentric circles instead of
a drifting funnel).

## D32 — FAQ takes the reference's geometry, the site's typography
**Decision:** The FAQ reproduces the reference layout precisely — centred eyebrow, two-line
heading, pill rows, circular `+`/`×` control, open-row-as-card — but sets the heading in
Newsreader, the site's display serif, rather than the reference's geometric sans.
**Why:** the request was this design in our colour system. Typography is part of that system:
the hero and "How it works" are both serif, and a sans heading here would read as a section
lifted from another site. Colour was mapped as asked; type follows the same logic.
**Reversible:** swap `font-serif` for the default sans on the `h2` if the reference's face is
wanted after all.

## D33 — FAQ row radius is constant, and must not animate from `rounded-full`
**Decision:** FAQ rows carry a fixed `rounded-[32px]` in both states. Only `background-color`,
`border-color` and `box-shadow` transition; the open/closed distinction is carried by fill,
border and shadow rather than by shape.
**Why not animate the radius:** `rounded-full` resolves to `calc(infinity * 1px)` in Tailwind
v4. Interpolating from infinity to any finite radius is a step function in practice — measured
per frame, the value was still `55411px` at 288ms of a 300ms transition and only reached its
target in the final frames. The row therefore held its pill shape and snapped at the very end,
which is exactly what "not opening smoothly" looked like.
**Why 32px specifically:** the closed row is 64px tall, so a 32px radius renders as a true pill.
The resting appearance is identical to `rounded-full` while remaining a finite, animatable
value — and it gives the open card a generous corner rather than a tight one.
**General rule:** never transition a property whose start value is `infinity`, `auto` or any
other non-numeric keyword. Pick a finite equivalent, or animate something else.

## D34 — `not-found.tsx`, not `global-not-found.js`
**Decision:** The 404 lives at `app/not-found.tsx`.
**Why:** the root `not-found` file has handled all unmatched URLs since Next 13.3, and it
renders inside the root layout — so fonts, global styles and the theme come for free.
`global-not-found.js` is experimental, must be enabled with a config flag, bypasses the layout
entirely (requiring styles, fonts and theme to be re-imported by hand), and exists to solve two
problems we do not have: multiple root layouts, and top-level dynamic segments.
**Checked against** `node_modules/next/dist/docs/` rather than memory, per `AGENTS.md`.

## D35 — Source artwork was repaired, not just reused
**Decision:** Both 404 source images were processed into `public/` rather than referenced
directly, and the desktop one had a baked-in checkerboard removed.
**Why:** the desktop file is fully opaque RGB. Its checkerboard is not transparency — it is grey
squares painted into the pixels, which would have shipped as a visible checkered rectangle.
**Why component labelling and not a flood fill:** a border-seeded fill cannot reach regions
enclosed by the artwork. It left the counters of both `4` glyphs checkered. Labelling every
connected checkerboard component and clearing those above a size threshold catches the enclosed
pockets too, while leaving the artwork's own light areas alone — those are warm-toned, and the
test requires near-neutral colour.
**Worth remembering:** a checkerboard in an image preview is not proof of transparency. Check
the alpha channel before assuming a PNG will composite cleanly.

## D36 — Docked prompt is a second element sharing one value, not the hero box re-positioned
**Decision:** The hero prompt and the docked bar are two components reading one `PromptProvider`
value, rather than a single element that switches to `position: fixed`.
**Why:** moving one element between static-in-the-hero and fixed-at-the-bottom means either a
visible jump or a FLIP animation, and it forces the hero layout to reserve a placeholder so the
page does not reflow. Two elements let each be styled for where it actually lives — the hero box
is a tall multi-line composer, the dock is a single-line pill — and the handover is a simple
cross-fade.
**What the shared context buys:** text typed in either survives the switch. That is the whole
reason the context exists; with local state the value would silently reset exactly when the bar
appears.

## D37 — Direction-aware docking, and no footer stand-down
**Decision:** The bar docks only when the hero anchor exits *upward*, and once docked it stays
visible for the rest of the page, over the footer included.
**Why the direction check:** `!isIntersecting` alone is true both above and below the hero, so
the bar would appear when the reader scrolls up past the top of the page.
**Why no footer stand-down:** a version that hid the bar over the footer was built and removed.
It was never requested — it came from assuming that covering the footer wordmark would be
unwanted — and in practice it made the bar vanish mid-FAQ, because the footer is tall enough to
enter the viewport long before the reader reaches it. The point of the bar is to follow the
reader the whole way down; anything that interrupts that defeats it.
**Lesson:** an unrequested refinement that changes when a feature is visible is not a free
improvement. It changed the behaviour the request actually specified.

## D38 — Border chase uses a masked conic-gradient with a registered custom property
**Decision:** The travelling border light is one `conic-gradient` rotated by `--border-angle`
and masked to the ring, rather than an animated SVG stroke or a moving element.
**Why masking a conic-gradient:** the ring follows `border-radius: inherit` for free, so the
same rule works on the pill and would work on any radius. An SVG stroke with
`stroke-dasharray` would need its path recomputed whenever the element resizes; the bar is
fluid-width, so that path would have to be measured in JavaScript.
**Why `@property` is not optional:** a custom property that is not registered has no type, so
the browser cannot interpolate it — the keyframe becomes a discrete swap at 100% and the arc
snaps instead of travelling. Registering it with `syntax: "<angle>"` is what makes the rotation
animate at all. Verified by sampling the computed value mid-animation.
**Graceful fallback:** `var(--border-angle, 0deg)`. Where `@property` is unsupported the
property is invalid, which would invalidate the whole gradient and remove the ring; the fallback
leaves a static arc.
**The tail is the gradient, not an effect:** transparent for 232deg then ramping to opaque over
the last 128deg. Adjust those stops to change the tail's length and falloff.

## D39 — "How it works" keeps its heading; the cards became the steps
**Decision:** `brand-and-content.md` §6.6 flags that the heading promises an explanation while
the cards listed audiences, and offers two fixes. It recommends **A** — rename the heading,
keep audience cards. I built **B**: keep "How it works" and rewrite the cards as Describe →
Refine → Download → Own it.
**Why B over the recommendation:**
1. The heading was chosen explicitly by the product owner in an earlier request.
2. The navbar's "How it works" link targets `#how-it-works`. Under A the link would land on a
   section titled something else, so A is not a one-line change — it needs the nav reworked too.
3. B also resolves §6.6's four card problems at once: the Affiliates and Partners cards were
   both on hold for unbuilt features, and B removes them rather than needing replacements.
**What A would still buy:** an audience-segmented section (Founders · Creators · Studios ·
Developers) is a different and legitimate page section. It could be added separately rather than
displacing the explanation.

## D40 — Unconfirmed claims were dropped, not softened
**Decision:** Where `brand-and-content.md` marked a claim "confirm first", the claim was removed
rather than hedged.
**Example:** §6.7 permits "on every plan including the free tier" *if* a free tier exists at
launch, and asks to confirm. The FAQ now says only that there is a free trial — which §7 lists
as planned — and makes no claim about plan coverage.
**Why:** a hedged version of an unverified claim is still a claim on a public page. §5 is a
guardrail, so the safe reading wins until the product owner confirms.

## D41 — The chat panel says it is not connected rather than faking a reply
**Decision:** Sending a message appends the user's turn and a fixed assistant reply stating that
generation is not connected.
**Why not leave it silent:** a chat that swallows messages reads as broken, and the panel would
be impossible to evaluate as a design.
**Why not fake a design response:** `brand-and-content.md` §5 forbids claiming capabilities the
product does not have, and a convincing fake reply is exactly that — worse here than in copy,
because a demo that appears to work invites decisions based on it.
**When the pipeline lands:** replace `NOT_WIRED_REPLY` with the real call. The message shape
(`role`, `text`) already matches what a chat completion returns, so nothing else needs to move.

## D42 — Ratio swatches are drawn, not labelled
**Decision:** Each aspect-ratio option renders a rectangle at its true proportion, sized from one
`SWATCH` constant, with the numeric ratio as a secondary label.
**Why:** the shape is the fastest thing to scan — someone picking a format is looking for
"tall" or "wide", not parsing `9:16`. Deriving the short side from the ratio also means adding a
format is a one-line data change with no new sizing to get wrong.
**The alignment trap:** a swatch placed directly above its label transfers its own height
variation to the label, so a row of mixed portrait and landscape shapes has labels at different
heights. Each swatch is therefore centred inside a fixed-height box. Measured before and after:
label tops went from varying by up to 10px to identical within each row.

## D43 — The variation control uses one sliding thumb
**Decision:** `1 / 2 / 3 / Auto` is a track with a single absolutely positioned thumb that
translates between segments, rather than four buttons that each toggle their own background.
**Why:** four independent fills cross-fade — the old one dims while the new one lights, which
reads as a blink. One element moving reads as a single continuous action, and `transform` is
compositor-only so it stays smooth.

## D44 — Zoom exposes `zoomBy`, not `setZoom`
**Decision:** The zoom context's multiplying API is `zoomBy(factor)`, implemented with
`setState(current => ...)`.
**Why:** the wheel handler needs "zoom relative to wherever we are". With a `setZoom(value)` API
it must read the current zoom, which means either putting `zoom` in the listener's dependencies —
re-binding a non-passive listener on every wheel notch — or syncing it through a ref, which
means writing to a ref during render. React forbids the latter and `react-hooks/refs` caught it.
The updater form removes the need to read the value at all.
**General shape:** when a handler needs *relative* change, give the context a relative operation.
Exposing only an absolute setter pushes the read back onto every caller.

## D45 — The canvas wheel listener is attached manually
**Decision:** Ctrl/Cmd + wheel zoom uses `addEventListener("wheel", ..., { passive: false })` in
an effect, not React's `onWheel` prop.
**Why:** React registers wheel handlers passively. `preventDefault()` inside `onWheel` is
ignored, so the browser would zoom the entire page on top of the canvas zooming — two zooms at
once. The listener has to be registered non-passively, which React's prop cannot do.

## D46 — Dictation writes into the composer, it does not send
**Decision:** Speech is transcribed into the textarea, appended to whatever was already typed,
and the user presses send themselves.
**Why:** dictation is unreliable on names, punctuation and anything domain-specific. Auto-sending
would turn every misrecognition into a message that has to be re-done. Landing in the field makes
the transcript a draft, which is what was asked for.
**Appending rather than replacing** means a correction typed before speaking is not thrown away.

## D47 — Attachment object URLs are revoked on unmount, not on send
**Decision:** `URL.createObjectURL` results are collected and revoked together when the panel
unmounts, rather than when the message is sent.
**Why:** sent messages keep their thumbnails in the thread. Revoking at send would free the URL
the thread is still displaying and the images would break immediately after sending — the exact
moment the user is looking at them.
**Cost:** blobs are held for the session. Acceptable for at most five images per message in an
editor session; if threads ever persist, this needs real uploads instead.

## D48 — The resizer is the divider, not an extra element beside one
**Decision:** `ChatPanel` and `Inspector` lost their `border-r` / `border-l`; the resizer draws
the dividing hairline itself.
**Why:** a border plus an adjacent handle gives two vertical lines a few pixels apart, which
looks like a rendering bug. One element owning the line means it can also express state —
it turns blue on hover, focus and drag, which a static border cannot.
**Hit target:** the strip is 5px wide around a 1px line. A 1px grab target is effectively
unusable; the line is the affordance, the strip is the target.

## D49 — Panel widths live in the shell, not in the panels
**Decision:** `EditorShell` holds both widths and applies them to wrapper elements; the panels
are `w-full`.
**Why:** a panel that sets its own width fights whatever the shell applies, and the drag appears
to do nothing. Keeping width ownership in one place also means the canvas's `flex-1` is the only
rule deciding how leftover space is distributed.
**If a panel ever needs a fixed width again**, it belongs in `CHAT` / `INSPECTOR` in the shell,
not back inside the component.

## D50 — Mobile shows the chat only, and the settings follow it
**Decision:** Below `md` the canvas, inspector and resizers are hidden; the chat panel fills the
screen and the generate settings appear inside it, collapsed behind a summary line.
**Why:** the editor is a three-pane desktop layout. Squeezed onto a phone the canvas would be a
few hundred pixels of empty dot grid and the inspector would have nowhere to sit. The chat is
the one pane that is genuinely useful at that size — describing a design does not need a canvas.
**Why the settings move rather than disappear:** they are part of composing a request, not part
of inspecting a result. Dropping them on mobile would make the phone a strictly weaker way to
ask for a design.
**Collapsed by default,** with the current selection shown as a summary, so it costs one line of
vertical space until someone wants it.

## D51 — Duplicated controls, single source of state
**Decision:** `GenerateControls` renders in both the inspector and the chat panel, with state
lifted into `GenerateProvider`.
**Why not conditionally render one:** choosing between them needs a JS media query, which does
not exist during SSR and would flash the wrong one on load. CSS breakpoints decide it correctly
on the first paint.
**Why the state must be lifted:** two mounted copies with local state keep separate selections.
Turn a phone to landscape, cross the breakpoint, and the settings would silently change.
**Cost:** both copies are in the DOM. The hidden one is `display:none`, so it is not focusable
and does not duplicate the tab order.

## D52 — The canvas has no editing tools
**Decision:** The tool bar (select, grid, shape, text, effects) and the Upscale action were
removed. The canvas displays; it does not edit.
**Why:** they were inert, but the real problem was what they implied. A select arrow implies
objects to pick; shape and text tools imply an editor producing vector objects. That is exactly
the claim `brand-and-content.md` §5 forbids — "Editable output, not a flat image" — because the
output *is* an image. The FAQ copy had already been corrected; the UI was still asserting it.
**Upscale** was removed on the same test: it does not appear in the §7 facts sheet. It had
survived an earlier pass on the argument that it was *plausible* for generated imagery, which is
reasoning about what could exist rather than checking what does.
**The rule this sets:** a control on the canvas is a promise about the product. Check §7 before
adding one.

## D53 — Card artwork suggests its step through structure, not symbols
**Decision:** Each "How it works" artwork is an abstract composition whose *arrangement* carries
the meaning — growth, repetition, descent, containment.
**What was tried and rejected:** drawing the step literally. A download arrow, a tick in a
rounded square, bars standing in for lines of text. All three read as stock icons and were a
visible drop in quality from the layered originals. "Make the shape match the step" is not an
instruction to draw the noun.
**Three rules that came out of getting it wrong:**
1. **Hold the opacity floor around 0.4.** Layers below that disappear into the tinted card and
   the composition reads as haze rather than depth.
2. **Give each card its own primitive and its own structure.** Three cards of overlapping
   rounded squares at falling opacity is one idea recoloured, however different the intent.
3. **One gradient per group in `userSpaceOnUse`.** Per-shape `objectBoundingBox` gradients light
   every element identically, which flattens a stack that depends on depth to read.

## D54 — The marquee wraps by a full period, not by `-50%`
**Decision:** The keyframe ends at `translateX(calc(-50% - var(--marquee-gap) / 2))`.
**Why:** `-50%` is the standard recipe and it is subtly wrong for a gapped flex track. Rendering
the list twice gives `2n` items but only `2n - 1` gaps, so half the track width is one gap short
of one repetition. The row therefore jumps by half a gap on every wrap — measured here as 10px
on a 2520px period, which is small enough to look like a stutter rather than an obvious bug.
**Constraint:** `--marquee-gap` must match the track's flex gap. They are set in two different
places (CSS and a Tailwind class) and nothing enforces agreement.

## D55 — Showcase frames size themselves from each design
**Decision:** `ShowcaseFrame` takes a `design` carrying intrinsic `width`/`height`, and sets its
aspect ratio from them rather than forcing every card to one shape.
**Why:** the real designs are a mix of 16:9, 4:3, 1:1, 4:5 and 3:4. Forcing a single ratio would
crop the square and portrait pieces — which are the packaging and social campaign work, where
the whole composition is the point. Varied card widths also give the marquee the look of a real
gallery rather than a conveyor of identical tiles.

## D57 — Duplicates found by content hash, not by filename
**Decision:** The `assets/` dedupe compared SHA-256 of file contents.
**Why:** four of the five duplicate pairs followed the macOS `… 2.png` convention, which is easy
to spot by name. The fifth — `06_03_36` and `06_06_43` — had unrelated timestamps and would have
survived a name-based pass. Hashing costs nothing and is the only way to be certain.

## D58 — The marquee loads eagerly
**Decision:** `ShowcaseFrame` takes an `eager` prop; the marquee sets it.
**Why:** `next/image` lazy-loads by default, which is right almost everywhere and wrong here. A
marquee moves continuously, so cards cross into view constantly and a not-yet-loaded card
arrives blank — measured as 24 of 34 images unloaded. Both marquee passes share the same URLs,
so eager loading is one request per design.

## D56 — Unbuilt pages get real paths, not `#`
**Decision:** Footer and navbar links point at the paths those pages will occupy, even though
most do not exist yet.
**Why:** a `#` anchor does nothing when clicked — no navigation, no feedback, no 404. The reader
cannot tell a missing page from a broken link. A real path returns a real 404 and lands on a
page that explains and offers a way back, which is the honest failure.
**Exception — external links.** Social profiles stay `#` until real URLs exist. Giving them an
internal path would serve our own 404 for a link meant to leave the site.

## D59 — Auth deferred; backend starts with Supabase DB + Storage only
**Decision:** Build the backend without authentication first. Supabase Postgres and Supabase
Storage are wired now; Supabase Auth (signup, login, Google OAuth), `profiles`, credits and
Stripe are added last.
**Why:** lets the generation pipeline (rewrite → image → store → save) be built and tested end
to end before user accounts exist.
**How it stays safe meanwhile:** every read/write goes through server code using the
service-role key. RLS is enabled on every table with **no public policies**, so the browser's
anon key can touch nothing. Tables carry a nullable `user_id` so adding auth later means filling
the column and adding owner policies — no schema rewrite.
**Known risk:** until auth lands, `/api/generations` is callable by anyone who can reach it and
spends OpenAI credits. Keep it local or behind a shared-secret check until auth ships.

## D60 — Until auth, a device cookie owns designs
**Decision:** each browser gets a random UUID in an httpOnly, SameSite=Lax cookie (`sd_device`,
one year). `designs.device_id` stores it and every query filters on it.
**Why:** without auth, the alternative was one shared pool where every tester sees every design
— wrong for a product that promises designs are private. The cookie gives per-browser privacy
with no login, matching what IndexedDB gave before.
**Trade-off:** clearing cookies loses access (the designs remain until deleted). It is not
security against someone who steals the cookie. When auth ships, a sign-in copies the device's
designs to `user_id` and owner RLS policies take over.

## D61 — Private bucket, signed URLs, direct browser uploads
**Decision:** the `designs` bucket is private. Images are read through signed URLs re-issued on
every load (1 hour). Attachments are uploaded by the browser straight to Storage through signed
upload URLs whose paths the server chooses.
**Why:** a public bucket makes every image readable forever by anyone with the link. Direct
uploads because Vercel limits a function's request body to 4.5 MB, below one 10 MB attachment.
The bucket itself enforces size and type, so a signed slot cannot be abused for other files.

## D62 — The table is `designs`, not `projects`
**Decision:** the planned `projects` table is `designs`, with chat history in `messages`.
**Why:** the UI, routes (`/designs`, `/editor/[id]`) and client store all say "design". One
name end to end avoids a translation layer.

## D63 — Analyze uses Structured Outputs with a strict schema
**Decision:** the analyze step calls the Responses API with `text.format` = `json_schema`,
`strict: true`. Every field is required and absence is `null`; enums come from the playbook.
The server still re-parses the output through `parseBrief` (lenient) before trusting it.
**Why:** free-form JSON from a model fails often enough to break the flow; strict schemas make
the shape guaranteed, and our own validation keeps the values honest (length caps, dropping
anything unexpected).

## D64 — Clarify is stateless and one round
**Decision:** `/api/prompt/analyze` stores nothing. The browser holds the partial brief and
answers and sends them to `/api/generations`, which re-validates everything as if it had never
seen it: strict brief parsing, answers must be bank option values or `surprise`, unknown fields
are 400s. At most 3 questions, one round, only from the question bank.
**Why:** no session storage before auth, no half-finished rows, and nothing the client sends is
trusted. A single round with quick picks keeps the path to a first image short; defaults cover
anything skipped.

## D65 — Kill switch on generation until auth
**Decision:** both Prompt Studio routes answer 403 unless `ALLOW_UNAUTHENTICATED_GENERATION` is
exactly `"true"`. It is set only in the owner's local `.env.local` and is removed when auth ships.
**Why:** with no auth (D59) anyone who can reach the routes spends OpenAI credit. Off by
default means a deploy without the variable is safe.

## D66 — The composed prompt never leaves the server
**Decision:** the final prompt, core rules, playbook rules and examples live in `lib/ai`
(`server-only`) and in `generations.final_prompt`. No response includes them; provider errors
reach the browser only as our own copy. Verified by grepping `.next/static` for phrases from
`core-rules.ts` and `examples.ts`.
**Why:** the prompt craft is the product's IP, and provider messages can leak internals.

## D67 — Prompt Studio extends the existing tables; results open in the editor
**Decision:** the Prompt Studio columns were added to the existing `generations` table (second
migration) instead of a new `projects` + `generations` pair; `designs` is the project. A
successful generation creates a design for this browser and the landing page navigates to
`/editor/<id>`. The bucket stays private (D61), so `image_url` stays null and responses carry a
signed URL. Chosen by the owner on 2026-09-27.
**Why:** one model of designs and generations, no new UI surface, and the editor canvas already
renders a design's generations.

## D68 — Models: gpt-6-luna for text, gpt-image-2.5-flare for images
**Decision:** `OPENAI_TEXT_MODEL=gpt-6-luna` (analyze + compose) and
`OPENAI_IMAGE_MODEL=gpt-image-2.5-flare`. Set in env (`.env.local` locally, Vercel later), never
in code.
**Why:** Luna is OpenAI's cost-efficient model and supports Structured Outputs and the
Responses API, which analyze needs. Flare is the fast everyday image model and accepts custom
sizes (the tall full-page captures). `gpt-image-2.5-sunburst` is the upgrade path when quality
matters more than speed — an env change only.

## D69 — A router classifies every prompt before any playbook runs
**Decision:** step 1 is `lib/ai/router.ts`: Structured Outputs (as D63) returning one of 9
category ids plus a confidence label (`high | medium | low`). Low confidence asks one question,
"What are you making?", with category chips. A category without a playbook returns
`unsupported_category` with coming-soon copy. The router always knows all 9 categories,
enabled or not. The web category id is `web_section`.
**Why:** routing a birthday card into the web playbook would produce a confidently wrong
design. Classifying against the full list, even before those playbooks exist, means the answer
is honest now and becomes a real design the day a playbook is registered. Labels instead of a
numeric confidence because models are poorly calibrated on self-reported probabilities.
**Contract note:** `/api/prompt/analyze` accepts an optional `category` (sent after the user
picks a chip), keeping clarify stateless (D64). `/api/generations` requires `category` and
accepts an optional `projectId`.

## D70 — Generation system is built in six phases
**Decision:** 1 router + web_section end to end (built); 2 canvas nodes, version stack via
`parent_id`, edit-from-image, downloads; 3 taste lock (`designs.style_lock` + reference image);
4 multi-output playbooks (slide_deck, social_post, menu); 5 remaining playbooks (business_card,
greeting_card, packaging, sticker, invoice); 6 auth, credits, Stripe, owner RLS, kill switch
removed. Columns later phases need are created now as nullable.
**Why:** each phase ships something usable, and no later phase needs a schema rewrite.
**Unchanged by the spec:** per D67, `designs` is the spec's `projects` table, the bucket stays
private with signed URLs, and results open in the editor.

## D71 — One art-director call replaces the category-playbook pipeline
**Decision:** a chat turn in the editor makes one Structured Outputs call
(`lib/ai/studio/director.ts`) that returns the action (new, edit, series_next, variation,
clarify, chat), a one-line reply, suggestion chips, and — for an image — a short design spec
(asset type, family, ratio, concept, signature move, one taste block id per axis, composition,
exact copy, palette override, imagery subject, locked fields, avoid list, edit instruction).
Code compiles the spec into an 8-slot prompt with per-slot word budgets; the model never writes
the image prompt. The turn returns the reply at once with a pending generation; a second
request renders it. Edits send the source image to `images.edit`; the next in a series sends
its anchor as a style reference. The spec is stored with every generation and is the source of
truth for edits and project style. Supersedes D63's analyze step, D64's clarify round and D69's
router; the retired code is in `_unused/`.
**Why:** the owner wants a five-word prompt to produce art-directed work fast, with no design
questions. One call that only chooses ids and writes specifics returns in a second or two;
three sequential text calls did not. A structured spec forces explicit decisions (the real
anti-slop mechanism), gives edits something to patch, and makes output comparable across
knowledge versions.

## D72 — Taste as curated blocks on five axes, assets as families
**Decision:** taste lives in `studio/taste.ts` as blocks on five independent axes — type,
color, layout, imagery, graphic (37 to start). The model reads each block's `use` line and picks
one id per axis; the compiler writes the block's `detail`. Asset knowledge lives in
`studio/families.ts` as 10 families grouped by how an asset is read (screen, slide, document,
poster, social, packaging, stationery, logo, illustration, other), not by subject. No reference
image library at runtime.
**Why:** categories are unbounded; how things are read is not. Subject matter comes from the
model's world knowledge, structure from families, craft from blocks — their combinations cover
far more than any template set while every block is human-curated. Pinterest-level references
inform how blocks are written, offline.

## D73 — Project style follows the latest new design
**Decision:** `designs.style_lock` holds `{ type, color, imagery, graphic, palette }`. Every
successful `new` design sets it; other actions fill it only when empty. The director keeps the
project style for new assets unless the user asks for a different look, and the turn route
forces it onto `series_next`. Layout is always chosen per asset.
**Why:** a `new` design either follows the project style or was asked to change it, so it is
always the look to keep; edits and variations are explorations and must not silently restyle
the project.

## D74 — Selecting an image focuses the chat on it
**Decision:** clicking an image on the canvas selects it: the reply that made it scrolls into
view and is highlighted, a chip above the composer reads "Editing this design", and the next
turn sends `targetId` so the art director sees it as `SELECTED ON CANVAS` (with its full spec)
and edits default to it. A freshly made image is selected automatically. Each assistant reply
that made an image stores `messages.generation_id` and shows the image as a thumbnail that
selects it too. Clicking empty canvas clears the selection.
**Why:** a project holds many designs; "make the headline smaller" has to mean the one the
user is looking at, and each design's history is already in the conversation stored in
Supabase — selection only has to bring it forward.


## D75 — The user's own style choice beats the taste system
**Decision:** the taste blocks are the default, not a cage. When the user names a look, font,
colour or style that no block covers, the art director writes it per axis in `spec.custom`
(concrete, one sentence) and still sets the nearest block id; the compiler uses the custom text
in place of the block detail, and standing bans the choice contradicts are dropped. The taste
system also gained nine current blocks (film snapshot, flat lay, moodboard, bento, lowercase
italic serif, cherry/cream, butter/chocolate, wide sans, tape and annotations).
**Why:** people bring their own taste; a fixed menu of 37 looks would make every project feel
alike and refuse reasonable requests. Our taste fills the gaps — it never overrules the user.

## D76 — Plain images get their own light prompt
**Decision:** a request for a picture rather than a layout maps to the `image` family. Its
prompt keeps concept, signature, subject, composition, the imagery block (medium and light),
the scene's palette, a real-texture finish and the standing bans, and leaves out typography,
layout and graphic blocks. The standing bans are listed first everywhere.
**Why:** snapdesign is used as a general image tool too; layout rules make a photo look like a
flyer, while the image model already handles a picture well once it is given a specific
subject and kept away from the generic AI look (gradients, stray text, clip-art icons, waxy
textures).

## D77 — Supabase Auth, email and password; data scoped by user
**Decision:** accounts use Supabase Auth (free plan) with email and password, via
`@supabase/ssr` cookies. The server verifies the session with `getClaims` in `requireUser`
and keeps using the service-role client for data, scoped by `designs.user_id`; RLS stays on
with no policies. `proxy.ts` only refreshes the session and redirects optimistically. Email
links (confirm sign-up, reset password) land on `/auth/callback`. Social sign-in is left out
until a provider is set up. Replaces the device cookie of D59.
**Why:** real accounts were needed before sharing the product; server-side scoping keeps one
data path and no browser access to tables. Supabase's built-in email sender is test-only
(team addresses, a few per hour), so production needs custom SMTP (e.g. Resend's free tier).

## D78 — The canvas is a free board; layout saved per image
**Decision:** images sit on the canvas at a saved `canvas_x`, `canvas_y` and `canvas_w`
(canvas units at 100% zoom) on their `generations` row; height follows the aspect ratio.
Unplaced images are laid out below the others. Moving or resizing saves the whole board through
`PUT /api/designs/[id]/layout`. Resizing always keeps the aspect ratio.
**Why:** the user wanted FigJam-style arranging. The position columns were already reserved for
this (phase 2); the width needed one more column. Distorting a generated design would misrepresent
it, so there is no free-aspect resize.

## D79 — Dark theme on the homepage and About, opt-in by toggle
**Decision:** the homepage has a light (default) and a near-black dark theme, switched by a
moon/sun toggle in the navbar that only shows on `/`. The choice is saved in `localStorage`
(`snapdesign-theme`) and applied to `<html data-theme>` by a script in the root layout's
`<head>` before first paint. Only `[data-home]` re-maps the surface and ink tokens; the
"Design anything" mockup tiles are `[data-keep-light]` and keep light tokens; the navbar is `[data-invert]`, always the opposite of its page (black bar on light pages, white on the dark homepage) so it never blends in. Tailwind's
`dark:` variant is scoped to the homepage for the few hardcoded hairlines.
**Update 2 (2026-10-01):** the choice is site-wide. Unset means each area's default (marketing
and sign-in light, editor and dashboard dark), so nobody's editor turns light until they pick.
The editor and dashboard (`[data-app]`) gain a light `ed-*` set; the sign-in pages (`[data-auth]`)
a dark `auth-*` set, with the orange promo panel unchanged. Toggles: navbar (home, About),
dashboard header, editor inspector, sign-in corner.
**Update (2026-10-01):** About joined; the scope is `[data-themed]`. Its notebook turns dark with
chalk pen lines; Belief cards, Polaroids and Tags stay light as printed objects. The toggle shows
on themed pages only.
**Why:** the user asked for a premium dark look on the homepage, then About. Other pages (legal,
showcase) were not part of the ask and are not themed; the mockup tiles are
artwork, so recolouring them would break them. Flat colours only, orange stays the one accent.

## D80 — Notes on canvas images; "final" locks the project style
**Decision:** each image can carry a short note (≤80 chars, `generations.note`), edited inline
below it on the canvas. The director sees notes as `[note: "…"]` on its asset lines. A note that
marks the image final ("final", "approved", "use this", … — not when negated) also makes that
image's type, colour, imagery and graphic the project style (`style_lock`), so series and new
assets follow it. The constitution adds: silence is approval — moving on without criticism keeps
the last look.
**Why:** the user wanted to label versions ("finalized first version") and have the chat build on
the chosen one. Locking style in code when the note is saved makes "final" reliable; the prompt
rule covers everything else a note can say.

## D81 — Pinned designs on the dashboard
**Decision:** `designs.pinned_at` (timestamptz, null = not pinned). Pinned designs show in a
"Pinned" section at the top of the dashboard, most recently pinned first; the rest follow under
"All designs" with the New design tile. Pinning goes through `PATCH /api/designs/[id]`
`{ pinned }` and does not touch `updated_at`, so "edited … ago" stays honest.
**Why:** the user wanted to keep favourite designs at hand. A timestamp orders pins without a
separate position column.

## D84 — Owner's users page
**Decision:** `/admin` (inside the `(app)` group, ed-* theme) lists every account as one card:
identity and sign-in dates, free-tier use, totals, newest images and every design's prompts. It is
a Server Component that reads with the service role; access is limited to `ADMIN_EMAILS` and
everyone else gets `notFound()`, so the page's existence isn't revealed. Read-only — no actions.
**Why:** the owner wanted "one place, one card, one user's full data". Data already hangs off one
`user_id`, so this is a read across existing tables, not a schema change. Deleted designs vanish
from it (cascade); the free-tier count in `free_usage` survives deletion.

## D82 — Drag to reorder dashboard cards
**Decision:** `designs.position` (double, null = never arranged). The list orders by position
(nulls first), then newest edited. A drop saves the whole list's order (`PUT /api/designs/order`,
position = index, scoped by owner). Cards reorder only within their section. Masonry is row-major
(i % columns) because CSS columns read top-down and made drops unpredictable. Pinned designs now
follow the saved order; pin time no longer sorts them.
**Why:** the user wanted to arrange designs "like folders". Pointer events, no new dependency.

## D83 — Strict free tier: 5 images per person, for life
**Decision:** a free image is counted against every key of the request at once: normalised email,
network (IP, IPv6 /64) and browser (httpOnly random cookie). It is refused if any key has 5.
Counting lives in Postgres (`take_free`, row locks in key order, so concurrent requests can't
overshoot); only the service role can call it. Keys are HMAC-SHA256 with `QUOTA_SECRET`, so no
email or IP is stored. The image is taken before OpenAI is called and refunded only when the
render fails before storing. Turns are refused before the director runs once images are used, and
capped at 25 for life. Disposable domains and unconfirmed emails get none. `QUOTA_EXEMPT_EMAILS`
skips all of it. Errors are HTTP 402.
**Why:** the owner's main goal: "anyone from any account any place can just generate only five
images maximum". Email alone is beaten by new accounts; IP alone by changing network; the browser
cookie by clearing it. Together, all three must change at once.
**Trade-offs:** people sharing one network (an office, a college) share 5 images. A determined
person with a fresh email, a new network and a clean browser can still get 5 more; closing that
needs phone verification or a card on file.

## D85 — Security headers without a script CSP
**Decision:** every response carries HSTS, nosniff, a strict referrer policy, a permissions
policy, COOP and a CSP limited to `frame-ancestors`, `base-uri`, `form-action` and `object-src`.
No `script-src`/`style-src` policy. Post-login `?next=` targets go through one helper
(`lib/safe-next.ts`) that resolves the URL and requires the same origin.
**Why:** a nonce-based script CSP forces dynamic rendering on every page (losing static
marketing pages and the CDN cache), and the app renders no user HTML, so the main XSS vectors are
already closed by React escaping. The framing/base/form rules cost nothing. String checks on
redirect targets miss browser quirks (`/\host`, tabs), so the check uses the URL parser itself.
