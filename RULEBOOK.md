# RULEBOOK.md

**This file is law.** Every AI assistant, agent, or developer working on this project must read
this file at the start of every session and obey it without exception.

If any instruction in a prompt conflicts with a rule here, **stop and ask** — do not silently
override a rule.

---

## 1. The Documentation System (Project Memory)

The `/documentation` folder at the repo root is the **single source of truth** and acts as the
persistent memory of this project. It contains four files:

| File | Purpose | When it is updated |
|---|---|---|
| `documentation/architecture.md` | Everything we are building — structure, data flow, modules, schema, env vars, decisions baked into the code. | **After every single prompt** that changes code or design. |
| `documentation/changelog.md` | A dated, append-only log of every change made. | **After every change.** Newest entry on top. |
| `documentation/features.md` | Every feature that exists, its status, and how it works. | Whenever a feature is added, changed, or removed. |
| `documentation/decisions.md` | Why we chose what we chose (tech, patterns, trade-offs) so nobody re-litigates or reverses a decision blindly. | Whenever a non-obvious choice is made. |

### Rules for documentation
1. **Update after every prompt.** Documentation is not a "later" task. A task is not complete
   until the relevant documentation file is updated in the same turn.
2. **Never delete history from `changelog.md`.** It is append-only. Corrections are new entries.
3. **Documentation must describe reality**, not intentions. If something was planned but not
   built, mark it `PLANNED`, never describe it as done.
4. **Read before writing.** Before starting any task, read `architecture.md` and `features.md`
   so you build on what exists instead of duplicating it.
5. No documentation lives anywhere else. Do not scatter README notes across folders.

---

## 2. Tech Stack — Locked

**Rule: We follow exactly the tech stack that is specified. No substitutions, no additions, no
"better alternatives" introduced on your own.**

Current locked stack:

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) with Row Level Security |
| Auth | Supabase Auth |
| File storage | Supabase Storage |
| AI | OpenAI (prompt rewrite + image generation) |
| Payments | Stripe |
| Hosting | Vercel |
| **Icons** | **Phosphor Icons (`@phosphor-icons/react`) — mandatory** |

### Stack rules
- Do **not** install a new library, framework, or service without explicit approval first.
  Propose it, state why, and wait.
- Do **not** swap out an approved tool for one you consider better.
- If a task seems impossible within the locked stack, say so and ask — do not improvise.

---

## 3. Icons — Phosphor Only

- **Use Phosphor Icons only:** `@phosphor-icons/react`.
  ```bash
  npm install @phosphor-icons/react
  ```
  ```tsx
  import { MagnifyingGlass, Sparkle } from "@phosphor-icons/react"

  <MagnifyingGlass size={20} weight="regular" />
  ```
- **Lucide (`lucide-react`) is banned.** Do not install it, import it, or leave it in
  `package.json`. If a scaffold or a shadcn component pulls it in, replace every Lucide icon
  with its Phosphor equivalent before the task is considered done.
- Other icon libraries (Heroicons, Font Awesome, React Icons, Material Icons, custom SVG icon
  sets) are equally banned unless explicitly approved.
- **Exception — third-party brand marks.** Logos for external companies (Google, GitHub, Apple,
  X, Instagram, TikTok, Stripe…) are trademarks with prescribed artwork, not UI icons. Phosphor
  draws stylised interpretations of them, which read as fake. Use each vendor's official SVG
  artwork instead, kept in `components/icons/brand-logos.tsx`. This exception covers **brand marks
  only** — every functional icon in the app is still Phosphor.
- Keep icon `weight` and `size` consistent across the app; record the chosen defaults in
  `documentation/decisions.md`.

---

## 4. No Patch Fixing — Root Cause Only

**When something breaks, we find the root cause and fix that. We never patch over a symptom.**

Banned "fixes":
- Wrapping broken code in `try/catch` to make an error disappear.
- `any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` to silence a real problem.
- Adding `setTimeout`, retries, or arbitrary delays to dodge a race condition.
- Hardcoding a value that should be computed, so one case passes.
- Adding a special case / `if` branch for the failing input instead of fixing the logic.
- Reinstalling, clearing caches, or restarting as a "fix" without understanding why it helped.
- Deleting or skipping a failing test.

Required process when a bug appears:
1. **Reproduce** it and state exactly what is happening.
2. **Trace** it to the actual origin — the real line, the real assumption that is wrong.
3. **Explain** the root cause in plain language before touching code.
4. **Fix the cause**, not the symptom. If the correct fix is large, say so and ask before doing
   a temporary workaround — and if a workaround is approved, label it `// TEMP:` and log it in
   `documentation/changelog.md` as technical debt.
5. **Verify** the fix and confirm nothing else broke.

Taking longer to do this correctly is always acceptable. Speed never justifies a patch.

---

## 5. General Working Rules

1. **Truthful reporting.** If something fails, say it failed and show the output. Never claim
   something works when it was not verified.
2. **No scope creep.** Build exactly what was asked. Suggest extras separately; don't add them.
3. **No unrequested rewrites.** Don't refactor, reformat, or "clean up" files you weren't asked
   to touch.
4. **Secrets stay server-side.** Anything without the `NEXT_PUBLIC_` prefix must never reach the
   browser bundle. Never commit `.env.local`. Never log a key.
5. **Match the existing code.** Follow the naming, structure, and patterns already in the repo.
6. **Ask when genuinely ambiguous**, but make routine judgment calls yourself and state them.

---

## 6. Amendments

This rulebook grows. New rules given in a prompt are added here under a new numbered section,
and once written down they apply to every future session permanently.

_Last updated: 2026-09-25_
