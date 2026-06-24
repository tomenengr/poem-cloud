---
name: poem-cloud-creative-viz
description: Specialized for this poem-cloud project. Use when working on immersive experiences: TimeRiver (upstream time flow, bank elements: poems/poets/scenery), NebulaBackground, PoetryCloud, StarMap, hybrid Canvas + React Three Fiber scenes, calligraphy typography (Zhi Mang Xing), cold cosmic aesthetic, slow organic "breathing" motion, particle systems, focal interactive elements (star gates), and poetic 意境 design. Always combine with AGENTS.md and nextjs-fullstack/frontend-ux-engineer.
version: 1.0.0
author: project-specific
---

# Poem Cloud Creative Visualization

This project builds "诗云" — an immersive, poetic experience inspired by Liu Cixin's story. Focus on long-river time flow, floating classical fragments, cold deep universe palette, slow deliberate animations that evoke drifting upstream through poems and history. Prioritize artistic conception (意境) over generic UI polish.

## Core Principles

- **Upstream time river metaphor**: Elements (poems, poets, scenery) spawn far (small, top, faint), flow toward viewer (grow, move down, gain opacity), then fade. Never rush — slow, organic, breathing.
- **Hybrid rendering discipline**: 
  - Canvas 2D excellent for flowing river + particles + calligraphy text + stylized ink scenery (high control, perf).
  - React Three Fiber only when real 3D depth, orbiting, or complex lighting needed (StarMap/PoetryCloud pages).
  - DOM overlays (framer-motion) for titles, interactive labels, hover states. Use pointer-events-none on pure viz layers.
- **Typography & poetry first**: Zhi Mang Xing for all floating/real poem text and poet names. Keep sans for UI chrome. Real classical lines only — no lorem.
- **Cold cosmic + ink aesthetic**: Deep indigos (#030308, #05040f), cold purples, faint silver/gold accents (#e6e1ff, #f4d35e desaturated). Heavy vignette, low opacity layers, subtle star-like particles in water.
- **Motion language**: Extremely slow (50-90s cycles for poem fragments). Subtle parallax on mouse. Focal "star gate" (诗云星图) pulses and has constellation lines. Hover/click feedback minimal and elegant.
- **Performance & limits**: Cap active river elements (~8-12). Particle count reasonable (200-250). requestAnimationFrame only. Avoid layout thrashing. Test with real poems data load.

## Technical Patterns (this project)

- Canvas river: perspective river width function, quadratic banks, flowing particles with sinusoidal x wiggle following river path, multi-layer bank silhouettes.
- Spawning: time-based interval + count cap. Elements have progress 0→1 (far→near), side, type, life. Calculate screen pos + scale + alpha from progress + perspective.
- Focal points: Persistent glowing constellation in river center for key navigation (click → /star-map). Store hit area for mouse detection.
- Background layers: NebulaBackground (cold volumetric) behind → dot pattern → vignette → main canvas river → bottom gradient fade.
- Overlays: Title + quote very light at top (pointer-events-none), "缓缓呼吸" breathing text at bottom.
- State: No heavy React state in viz loop. Drive everything from RAF time + refs. Mouse only for subtle bank shift + hover on focal.
- Fonts: Ensure 'Zhi Mang Xing' loaded in layout. Use in ctx.font for canvas text.
- Data: Pull short real poem lines and poet names. Scenery as simple procedural ink drawings (mountain, pine, boat, moon, willow, cloud).

## Workflow when asked for creative viz work

1. Re-read current TimeRiver / Nebula / page.tsx + AGENTS.md.
2. Clarify the 意境 goal (e.g. "more alive poetic when elements appear", "stronger sense of traveling upstream against time").
3. Plan layers, spawn logic, motion curves first (in thinking).
4. Implement with heavy use of progress-based math, low alpha, slow deltas.
5. Add subtle interactivity only where it enhances the poem (star gate is primary).
6. Profile: limit elements, use simple paths not heavy ctx ops.
7. Verify: build, visual flow over 30-60s, mobile (canvas scales), reduced motion (if applicable).
8. Cross-check with frontend-ux-engineer and nextjs-fullstack for boundaries/perf.

## Anti-patterns

- Fast bouncy springs or product-like hovers on the river itself.
- Turning the immersive homepage into a card grid or standard landing.
- High element counts or complex per-frame calculations.
- Using real 3D when 2D Canvas + perspective math suffices.
- Fake placeholder poetry or scenery.

## Example usage

```
Use poem-cloud-creative-viz + frontend-ux-engineer. Make the TimeRiver banks feel more like drifting through history — vary element density by "era", improve poem fragment calligraphy readability at distance, add very subtle ink wash trails behind scenery.
```

```
Use poem-cloud-creative-viz. Refine the star gate focal point so it feels like the destination of the upstream journey. Better glow layers, slight rotation of constellation, clearer but still poetic click affordance.
```
