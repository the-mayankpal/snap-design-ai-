# make.design clone — Folder Structure (Next.js + Supabase + OpenAI)

Legend:  🟦 frontend (ships to browser, visible in inspect)   🟥 backend (server-only, hidden)

```
make-design-clone/
│
├─ app/                              # Next.js App Router (front + back in ONE app)
│  │
│  ├─ (marketing)/                   # 🟦 PUBLIC pages
│  │  ├─ page.tsx                    #    landing + prompt box
│  │  ├─ pricing/page.tsx
│  │  └─ showcases/page.tsx
│  │
│  ├─ (app)/                         # 🟦 AUTHED app (dashboard shell)
│  │  ├─ layout.tsx                  #    guards session, renders sidebar
│  │  ├─ projects/page.tsx           #    list of user projects
│  │  ├─ project/[id]/page.tsx       #    the design view / editor
│  │  └─ settings/page.tsx
│  │
│  ├─ (auth)/                        # 🟦 auth UI (forms only)
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  │
│  ├─ api/                           # 🟥🟥 BACKEND — never sent to browser
│  │  ├─ generations/route.ts        # ⭐ THE PIPELINE (rewrite → OpenAI → Storage → DB)
│  │  ├─ projects/route.ts           #    CRUD projects
│  │  ├─ billing/
│  │  │  ├─ checkout/route.ts        #    create Stripe checkout session
│  │  │  └─ webhook/route.ts         #    Stripe → add credits (server verifies)
│  │  └─ auth/callback/route.ts      #    Supabase OAuth (Google/X) redirect
│  │
│  ├─ layout.tsx                     # 🟦 root layout, fonts (next/font)
│  └─ globals.css                    # 🟦 Tailwind v4
│
├─ lib/                              # 🟥 SHARED SERVER LOGIC (the moat)
│  ├─ ai/
│  │  ├─ system-prompt.ts            # ⭐⭐ THE REWRITER SYSTEM PROMPT (secret sauce)
│  │  ├─ rewrite.ts                  #    LLM call: raw prompt → improvedPrompt
│  │  └─ generate.ts                 #    OpenAI GPT Image call → PNG buffer
│  ├─ supabase/
│  │  ├─ server.ts                   # 🟥 server client (SERVICE ROLE key — secret)
│  │  └─ client.ts                   # 🟦 browser client (ANON key — safe to expose)
│  ├─ storage/upload.ts              # 🟥 upload png + reduced webp to Supabase Storage
│  ├─ db/queries.ts                  # 🟥 Postgres queries (projects, generations, credits)
│  └─ billing/stripe.ts             # 🟥 Stripe helpers
│
├─ components/                       # 🟦 frontend UI
│  ├─ prompt-box.tsx
│  ├─ design-card.tsx
│  └─ ui/…                           #    buttons, dialogs (shadcn-style)
│
├─ supabase/                         # DB schema, versioned in the repo
│  ├─ migrations/
│  │  └─ 0001_init.sql               #    tables + Row Level Security
│  └─ config.toml
│
├─ public/                           # 🟦 static assets (bg, graphics, fonts)
│
├─ middleware.ts                     # refreshes Supabase session cookie on each request
├─ .env.local                        # 🟥 ALL SECRETS (never committed)
├─ next.config.ts
├─ tailwind.config.ts
└─ package.json
```

## The secret-sauce path (why inspect can't see it)
`app/api/generations/route.ts`  →  imports  →  `lib/ai/system-prompt.ts` + `lib/ai/rewrite.ts`
Both live under `app/api` / `lib` and are only ever imported by server code → Next.js compiles them into the **server bundle** → Vercel never ships them → invisible.

## What Supabase replaces
| Job | File(s) using it | Replaces |
|---|---|---|
| **Database** (Postgres) | `lib/db/queries.ts`, `supabase/migrations` | MongoDB |
| **Auth** (signup/OTP/Google/X) | `(auth)/*`, `api/auth/callback`, `middleware.ts` | custom `/api/auth/*` |
| **Storage** (image files) | `lib/storage/upload.ts` | Cloudflare R2 |

> One platform now does DB + Auth + Storage → stack drops to 4 services (Vercel · Supabase · OpenAI · Stripe). Note: Supabase Storage charges egress (~$0.09/GB); if image traffic gets huge later, swap this one file to R2 ($0 egress) — both are S3-compatible.

## DB tables (supabase/migrations/0001_init.sql)
```
profiles         id, email, plan, credits            (1 row per user)
projects         id, user_id, title, created_at
generations      id, project_id, prompt, improved_prompt,
                 model, image_url, width, height, credits_used, created_at
```
+ Row Level Security: a user can only read/write rows where `user_id = auth.uid()`.

## Environment variables (.env.local)  🟥 = secret, 🟦 = public
```
🟦 NEXT_PUBLIC_SUPABASE_URL          # safe: browser needs it
🟦 NEXT_PUBLIC_SUPABASE_ANON_KEY     # safe: RLS protects data
🟥 SUPABASE_SERVICE_ROLE_KEY         # SECRET: full DB access, server only
🟥 OPENAI_API_KEY                    # SECRET
🟥 SUPABASE_STORAGE_BUCKET           # bucket name (e.g. "designs") — no separate keys needed
🟥 STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
```
Rule: `NEXT_PUBLIC_` = shipped to browser. Everything else = server-only.

## The generation route (pseudo-flow)
```ts
// app/api/generations/route.ts   (🟥 server only)
export async function POST(req) {
  const { prompt } = await req.json()
  const user = await getUser()                 // Supabase auth
  if (user.credits < 2) return 402

  const improved = await rewrite(prompt)        // lib/ai — uses system-prompt.ts
  const png      = await generateImage(improved)// lib/ai — OpenAI GPT Image
  const url      = await uploadImage(png)         // lib/storage/upload.ts → Supabase Storage
  await db.saveGeneration({ user, prompt, improved, url })
  await db.deductCredits(user, 2)
  return Response.json({ imageUrl: url, improvedPrompt: improved })
}
```

## Deploy (4 services)
- **Vercel** → hosts the whole app (frontend + `/api` functions)
- **Supabase** → managed Postgres + Auth + **Storage** (all-in-one, called from `lib/`)
- **Stripe** → payments
- **Cloudflare** (optional) → DNS/CDN/WAF in front of Vercel

Runtime cost per image ≈ $0.03–0.05 (OpenAI) + tiny rewriter + near-free Supabase on small scale.
