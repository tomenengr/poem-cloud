---
name: nextjs-fullstack
description: Use for Next.js App Router, React Server Components, server actions, API routes, auth, database integration, caching, deployment, or full-stack product features. Especially important because this is NOT the standard Next.js you know (see AGENTS.md).
version: 1.0.0
author: awesome-grok-build (adapted for poem-cloud)
---

# Next.js Fullstack (project-aware)

Ship Next.js features with correct boundaries between server, client, data, and UI. This project uses Next.js 15 App Router with specific constraints noted in AGENTS.md.

## Grok Build Mode

- Always respect AGENTS.md rules first (read before editing).
- Use Plan Mode for routing, auth, persistence, caching, or data-fetching changes.
- Use subagents for broad changes:
  - `routes`: app router structure, layouts, metadata.
  - `data`: DB queries, server actions (here: /api/generate), validation.
  - `client`: 'use client' components, state, forms, Three.js canvases, framer-motion.
  - `tests`: build verification, typecheck.
- Arena-style comparison: compare server action vs API route vs client-only approaches and choose by security, simplicity, and cache behavior.

## Workflow

1. Detect Next version, package manager (npm), styling (Tailwind + shadcn), 3D (react-three-fiber), and any LLM proxy setup.
2. Keep server-only code out of client components.
3. Validate inputs on the server (especially LLM prompts/keys).
4. Respect existing caching/revalidation patterns (poems data is static JSON).
5. Add loading/error/empty states for async (data load, generation).
6. Run the narrowest relevant checks:
   - `npm run lint`
   - `npm run typecheck` (or tsc)
   - `npm run build`
   - Verify no regressions in canvas/3D rendering.

## Rules (poem-cloud specific)

- Do not leak secrets into `NEXT_PUBLIC_*`.
- Avoid unnecessary client components (keep heavy Three.js scenes client-only where needed).
- For creative viz (TimeRiver, Nebula, PoetryCloud, StarMap): prefer Canvas + framer-motion layers over unnecessary 3D unless depth is required.
- Do not mutate data without proper patterns.
- Keep forms progressive and resilient (generator prompt).
- Follow existing conventions: cosmic-card, poem-text, Zhi Mang Xing for poetry, cold dark palette.
- Read AGENTS.md before any Next.js structural change.

## Example Prompts

```
Use nextjs-fullstack. Review this change to app/page.tsx for proper server/client boundaries in the new TimeRiver scene.
```

```
Use nextjs-fullstack. Plan a better data loading strategy for the large poems JSON in star-map without blocking the interactive river.
```