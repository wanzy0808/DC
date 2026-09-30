---
name: undara-design-orchestrator
description: Undara-specific design workflow. Use for any frontend design, redesign, visual polish, template art direction, motion, marketing, Studio, Dashboard, or public invitation surface.
---

# Undara Design Orchestrator

This file does not replace upstream design skills. It tells agents **which skills and libraries to use, in what order, and what wins when rules conflict**.

## Authority

Use this order:

1. explicit owner request;
2. `prd.md`;
3. `AGENTS.md`;
4. scoped docs such as `template.md` and `studio.md`;
5. current source/design tokens/components/assets;
6. installed or upstream design skills.

External skills improve craft. They never override product behavior, data contracts, authorization, accessibility, responsive-web rules, or a direct owner decision.

## Skill discovery is mandatory for design work

Before materially designing or redesigning a UI:

1. Inspect the runtime's installed/global skills.
2. If available, use the relevant installed skill rather than only relying on memory.
3. If an expected global skill is not exposed in the current runtime, read its pinned upstream `SKILL.md` before proceeding.
4. Do not claim a skill was executed when the runtime did not expose it.
5. Do not silently skip the skill layer merely because the skill is not stored in this repository.

### Pinned design skills

- **GPT Taste / `gpt-taste`** — primary art direction, composition, hierarchy, anti-generic layout, whitespace, visual variance.
  - upstream: `https://github.com/tasteskill/tasteskill`
  - canonical file: `gpt-taste/SKILL.md`
- **Emil Design Engineering / `emil-design-eng`** — interaction and design-engineering craft.
  - upstream: `https://github.com/emilkowalski/skills`
  - canonical file: `skills/emil-design-eng/SKILL.md`
- **Emil Animate / `animate`** — purposeful motion implementation.
  - upstream file: `skills/animate/SKILL.md`
- **Emil Review Animations / `review-animations`** — strict motion review after implementation when motion changed materially.
  - upstream file: `skills/review-animations/SKILL.md`
- **Impeccable / `impeccable`** — critique, shape, polish, audit, harden/adapt/refinement.
  - upstream: `https://github.com/pbakaus/impeccable`
  - canonical file: `.agents/skills/impeccable/SKILL.md`
  - Impeccable is a package with referenced files/scripts. Do not vendor only its top-level SKILL.md and pretend the package is complete.

## Practical workflow

For a normal Undara visual task:

1. **Recon:** read the target source and existing visual system first.
2. **Library pass:** reuse existing Undara components/assets/tokens before inventing new primitives.
3. **Taste pass:** decide the composition and art direction.
4. **Implementation:** code only inside the requested scope.
5. **Motion pass:** use Emil methods when motion materially matters; restraint is preferred over decorative animation.
6. **Impeccable pass:** critique/polish/audit the finished surface in bounded passes.
7. **Validation:** verify source/build and, when tooling permits, real desktop/mobile visual behavior.

Do not stack every skill mechanically. Use only the skill that has a clear job in the current pass.

## Library-first rule

Before creating new UI, ornament, animation system, or asset treatment, inspect reusable resources already available:

- `components/ui/`;
- shared Layout/Marketing/Dashboard/Studio primitives;
- `app/globals.css` semantic tokens and utilities;
- `lib/templates/catalog.ts` and template capabilities;
- existing `public/assets/` and template assets;
- existing animation helpers and Motion usage;
- project/connected Library or knowledge resources when the runtime exposes them.

Prefer adapting a fitting existing resource over creating a parallel component or a second design system. Do not force reuse when the existing component cannot meet the requested visual direction without harming semantics or accessibility.

## Undara art direction

The current public brand world is woodland / forest editorial.

Preferred motifs:
- forest silhouette;
- canopy and branches;
- restrained leaves;
- engraved organic vines / sulur;
- fog and ambient depth;
- fireflies;
- subtle warm lanterns in Dark Mode only when appropriate.

Avoid global wedding clip-art, rose-petal ambience, large floral clusters, repetitive thin divider lines, generic card grids, nested card-on-card UI, and filler decorative numbering.

Dark woodland lantern rule:
- small;
- sparse;
- warm and dim;
- placed in background depth;
- no festival/string-light look;
- never compete with copy, CTA, navigation, or Pintu.

Invitation templates remain independent artworks and may intentionally use floral or other themes.
