# snapdesign.ai ✦

> An AI-native design studio and art direction engine. Transform natural language prompts into production-ready websites, mockups, visual assets, and marketing collateral with human-level craft and zero generic AI slop.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Postgres%20%7C%20Storage-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Responses%20%26%20Images%20API-412991?style=flat&logo=openai)](https://openai.com/)
[![Phosphor Icons](https://img.shields.io/badge/Icons-Phosphor-orange?style=flat)](https://phosphoricons.com/)

---

## ⚡ Overview

**snapdesign.ai** is not another naive wrapper around image generation APIs. It is a full-stack design generation studio equipped with an **AI Art Director** that translates brief user ideas into rigorously structured, taste-curated, high-fidelity design specifications before rendering.

The system pairs an editorial aesthetic (Newsreader serif + Inter UI, dark/light themes, fluid glass navigation) with an interactive FigJam-style canvas editor, multi-tenant Supabase persistence, and a multi-vector anti-abuse quota system.

---

## 💎 Key Features

### 1. The Art Director Engine (`lib/ai/studio/`)
- **Structured Design Specifications**: Instead of allowing the model to hallucinate messy, generic prompts, the Art Director (`director.ts`) generates a strict JSON design spec via OpenAI Structured Outputs.
- **10 Core Design Families**: Categorizes requests into purpose-built structural families:
  `screen` · `slide` · `document` · `poster` · `social` · `packaging` · `stationery` · `logo` · `illustration` · `image`
- **37+ Curated Taste Blocks Across 5 Axes**:
  - **Type**: *Swiss Modernist, Brutalist Mono, Editorial Serif, Clean Geometric, Lowercase Italic Serif, Wide Display Sans...*
  - **Color**: *Warm Cream & Ink, Midnight Slate, Muted Earth, Neo-Tokyo Neon, Cherry & Cream, Butter & Chocolate...*
  - **Layout**: *Asymmetry Grid, Bento Box, Golden Ratio Split, Editorial Multi-Column, Magazine Hero...*
  - **Imagery**: *35mm Film Snapshot, Tactile Flat Lay, 3D Clay Render, Moody Studio Portrait...*
  - **Graphic**: *Brutalist Tape & Stickers, Minimalist Wireframe, Retro Risograph, Holographic Foil...*
- **Strict Anti-Slop Constitution (`constitution.ts`)**: Enforces negative constraints against generic AI tropes (random glowing geometric cubes, plastic waxy skin, clip-art badges, floating gradient orbs).
- **Project Style Lock (`style_lock`)**: When a user marks an image note as "final" or "approved", subsequent iterations across the design automatically preserve that asset's typography, palette, and artistic direction.

### 2. Interactive Canvas Editor (`/editor`)
- **Infinite Free-Board Stage**: Pan, zoom (25% to 400%), and reposition generated assets freely on a dotted matrix canvas.
- **Persistent Board Layout**: Card positions (`canvas_x`, `canvas_y`) and sizes (`canvas_w`) save automatically to Supabase.
- **Focus & Selection Context**: Clicking any canvas asset focuses the conversational thread, highlights historical prompts, and targets subsequent prompts to that specific design.
- **Asset Notes**: Attach custom tags and notes directly beneath designs on the board.
- **Cursor Comet & Micro-interactions**: Smooth physics-based cursor trailing effect with full `prefers-reduced-motion` compliance.

### 3. Bulletproof Security & Architecture
- **Server-Only Secrets**: All prompt engineering, AI system instructions, and service-role database operations enforce `import "server-only"`. No proprietary prompts or API keys are ever bundled into client JavaScript.
- **Private Storage with Signed URLs**: Supabase Storage bucket (`designs`) remains completely private; images are distributed strictly via time-limited 1-hour signed tokens.
- **Postgres Row Level Security (RLS)**: Designs, messages, and generations are scoped strictly by authenticated `user_id`.
- **HMAC-SHA256 Multi-Key Quota Protection**: Strict lifetime free-tier limits (5 images, 25 chat turns) enforced at the database level with row locking (`take_free` in Postgres). Quotas bind concurrently against normalized email, client IP (/64 subnet), and secure HTTP-only cookies without storing plaintext PII.
- **Global Kill Switch**: Instant spend mitigation via `ALLOW_UNAUTHENTICATED_GENERATION=false`.
- **Hardened HTTP Headers**: Comprehensive HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Cross-Origin-Opener-Policy, and restricted Content-Security-Policy.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.3 (App Router, Turbopack) | Server Components, Route Handlers, Streaming |
| **Language** | TypeScript 5 | Strict end-to-end type safety |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Variables | CSS `@theme inline` design system with zero runtime overhead |
| **Icons** | Phosphor Icons (`@phosphor-icons/react`) | Single uniform icon family across all weights and viewports |
| **Typography** | `next/font/google` (Inter + Newsreader) | High-contrast editorial display paired with crisp UI sans |
| **Database** | Supabase Postgres | Relational data, RLS, custom atomic quota functions |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Secure cookie-based authentication sessions |
| **Storage** | Supabase Storage | Private design buckets with signed upload & read tokens |
| **AI Models** | OpenAI API | Structured Outputs for Art Director + OpenAI Images API |

---

## 📁 Project Structure

```
snapdesign.ai/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Public routes (Landing, Showcase, About, Legal)
│   ├── (app)/                        # Authenticated app shell
│   │   ├── designs/                  # Saved designs dashboard (with pin & drag reorder)
│   │   ├── editor/                   # Interactive FigJam-style canvas studio
│   │   └── admin/                    # Owner analytics dashboard (gated by ADMIN_EMAILS)
│   ├── (auth)/                       # Login & Sign-up flows
│   ├── api/                          # Server-only API route handlers
│   │   ├── designs/                  # Design CRUD, chat turns, canvas layout
│   │   ├── generations/              # Art director compiler & image render routes
│   │   └── usage/                    # Free-tier quota telemetry
│   ├── layout.tsx                    # Root layout with font optimization & theme scripts
│   └── globals.css                   # Tailwind v4 tokens & color variables
│
├── components/                       # UI component library
│   ├── auth/                         # Unified login/signup forms
│   ├── brand/                        # Official SVG vector marks & logos
│   ├── canvas/                       # Canvas stage, image nodes, selection handles
│   ├── editor/                       # Chat sidebar, generator controls, inspector
│   └── ui/                           # Modals, buttons, accordions, badges
│
├── lib/                              # Server-only business logic ("server-only")
│   ├── ai/
│   │   ├── openai.ts                 # Configured OpenAI client
│   │   └── studio/                   # Art Director engine
│   │       ├── director.ts           # Structured Outputs classifier & spec generator
│   │       ├── families.ts           # 10 core asset taxonomy definitions
│   │       ├── taste.ts              # 37+ multi-axis aesthetic taste blocks
│   │       ├── compiler.ts           # Prompt budget builder & anti-slop assembler
│   │       ├── constitution.ts       # Design rules & negative constraint bounds
│   │       └── render.ts             # OpenAI Images API bridge & error handling
│   ├── db/                           # Postgres queries for designs, messages, generations
│   ├── storage/                      # Signed upload slots & 1-hr read URL generators
│   ├── supabase/                     # Service-role & browser SSR Supabase clients
│   └── quota.ts                      # HMAC-SHA256 multi-vector anti-abuse quota engine
│
├── supabase/
│   └── migrations/                   # 11 versioned SQL schema migrations
│
├── documentation/                    # Single source of truth (Living project memory)
│   ├── architecture.md               # Detailed system architecture & module specs
│   ├── decisions.md                  # Comprehensive log of architectural decisions (D1–D85)
│   ├── features.md                   # Feature status registry (DONE / IN PROGRESS / PLANNED)
│   └── changelog.md                  # Append-only chronological changelog
│
└── assets/                           # High-res design masters and vector sources
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **Supabase Account**: A Supabase project with Postgres & Storage
- **OpenAI API Key**: Access to OpenAI API (with image generation and Structured Outputs enabled)

### 1. Clone & Install

```bash
git clone https://github.com/the-mayankpal/snap-design-ai-.git
cd snap-design-ai-
npm install
```

### 2. Configure Environment Variables

Create a local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```bash
# -----------------------------------------------------------------------------
# OpenAI Configuration (Server-Only)
# -----------------------------------------------------------------------------
OPENAI_API_KEY=sk-proj-...
OPENAI_TEXT_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_TEXT_REASONING_EFFORT=low       # minimal | low | medium | high
OPENAI_IMAGE_QUALITY=standard          # standard | hd

# -----------------------------------------------------------------------------
# Supabase Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Server-only: bypasses RLS
SUPABASE_STORAGE_BUCKET=designs

# -----------------------------------------------------------------------------
# Generation Controls & Site Metadata
# -----------------------------------------------------------------------------
ALLOW_UNAUTHENTICATED_GENERATION=true  # Set to "false" to halt all generation spend
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# -----------------------------------------------------------------------------
# Anti-Abuse Quota & Administration
# -----------------------------------------------------------------------------
QUOTA_SECRET=your-random-32-byte-secret-key-here
QUOTA_EXEMPT_EMAILS=me@example.com
ADMIN_EMAILS=me@example.com            # Grants access to /admin
```

> **Security Note**: Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` / `OPENAI_API_KEY` to client-side bundles.

---

## 🗄️ Database & Storage Setup

1. In your **Supabase Dashboard**, open the **SQL Editor**.
2. Run the migrations located in `supabase/migrations/` in numerical sequence:
   - `20260927000000_designs.sql` (Creates `designs`, `messages`, initial tables)
   - `20260927000001_generations.sql` (Generations schema)
   - `20260927000002_generation_system.sql`
   - `20260927000003_art_director.sql`
   - `20260927000004_message_generation.sql`
   - `20260927000005_auth_owner.sql` (Enforces user scoping & RLS)
   - `20261001000006_canvas_size.sql` (Canvas coordinate persistence)
   - `20261001000007_generation_note.sql` (Asset annotations)
   - `20261001000008_design_pin.sql` (Dashboard pin functionality)
   - `20261001000009_design_position.sql` (Drag-and-drop dashboard reordering)
   - `20261002000010_free_quota.sql` (Atomic HMAC quota counter function)
3. In **Storage**, create a new private bucket named `designs` (allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`; max size: `10MB`).

---

## 💻 Development Commands

```bash
# Run local development server (Turbopack)
npm run dev

# Run static analysis & ESLint
npm run lint

# Run TypeScript compilation checks
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 🛡️ Coding Standard & Rulebook

This repository adheres to a strict engineering constitution recorded in `RULEBOOK.md`:
- **Root-Cause Only**: Symptom suppression (e.g. arbitrary `try/catch` wrapping, silencing type errors with `any` or `@ts-ignore`, or hacking around race conditions with `setTimeout`) is strictly prohibited.
- **Locked Tech Stack**: No ad-hoc libraries or dependency creep without explicit justification.
- **Living Documentation**: All architectural patterns and decisions are permanently documented in `/documentation`.

---

## 👤 Author & Acknowledgments

- **Created by**: Mayank Pal ([@the-mayankpal](https://github.com/the-mayankpal))
- **Icons**: [Phosphor Icons](https://phosphoricons.com)
- **Fonts**: [Newsreader](https://fonts.google.com/specimen/Newsreader) & [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
