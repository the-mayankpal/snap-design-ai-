# _unused

Retired code kept for reference, excluded from the build (tsconfig, eslint).

- `lib/ai/playbooks`, `router.ts`, `core-rules.ts`, `pipeline.ts`, `app/api/prompt/analyze`,
  `app/api/generations/route.ts`, `lib/db/generations.ts` — the category-playbook pipeline
  (route → analyze → clarify → compose → generate), replaced by the art director (D71).
- `lib/ai/chat.ts`, `app/api/chat` — the text-only editor chat, replaced by `/api/designs/[id]/turn`.
