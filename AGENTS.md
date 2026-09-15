<!-- BEGIN:nextjs-agent-rules -->

# Next.js Agent Rules

This project uses a current Next.js version with potentially breaking APIs and conventions. Before writing Next.js-specific code, inspect the relevant guides under `node_modules/next/dist/docs/` available in the repository environment and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# DC Organizer — Agent, Design System & Engineering Rules

These rules apply to the entire repository unless a more specific implementation requirement says otherwise.

## 1. Required Workflow Before Coding

Before any material change, inspect in this order:

1. `AGENTS.md`
2. `SKILL.md` and every applicable `skill.md`
3. `prd.md`
4. `PRD-TAMBAHAN.md`
5. `README.md`
6. Relevant implementation files, routes, components, schema, and APIs

Every AI-made material change MUST be recorded in `PRD-TAMBAHAN.md` without deleting prior implementation history. Validation must never be described as PASS unless an actual build/CI result is available.

## 2. Product Identity & Preservation

- Official product brand: **DC Organizer**.
- Never introduce legacy customer-facing brands such as Citin or DC Wedding.
- Preserve `/dashboard` and Beranda.
- Follow **Extend Over Replace**: inspect and extend existing routes, APIs, components, schema, and data flows before replacing anything.
- Database is the source of truth; do not introduce fake/mock invitation data.
- Authorization is server-side; UI entitlement must reflect server entitlement.
- Existing routes and compatibility aliases must remain when required by the PRD.
- **Pintu is a core landing-page navigation surface. Do not remove or bypass it without explicit user instruction.**
- **Rose petals in `components/Layout/background.tsx` are a protected visual element. Do not alter their behavior, appearance, count, timing, or styling unless explicitly instructed.**

## 3. Typography

Use only these application UI fonts:
- **Cinzel** — display, headings, titles, branding, editorial elements.
- **Fauna One** — body/UI copy, navigation, forms, buttons, descriptions.
- **DM Mono** — metadata, codes, timestamps, status values, technical labels, small utility text.

Do not introduce additional fonts, random Google Fonts, template fonts, or intentional browser/system fallback styling. Invitation-template typography may remain dynamic when it belongs to invitation content itself.

## 4. Canonical Theme

### Brand Anchor
- Logo / brand primary: `#C07A84` Rose.
- Supporting rose: `#D9A3AA`.
- Deep hover/pressed rose: `#A65E69`.
- All application accent colors must stay within this Rose family unless a semantic status color is required.

### Light
- **Background:** `#FFFFFF` pure white.
- **Headings, icons, buttons, links, help chat, menu, and accents:** Rose `#C07A84` as the canonical brand accent. Supporting Rose `#D9A3AA` and Deep Rose `#A65E69` may be used for states and emphasis.
- **Primary text:** `#111111` near-black.
- **Secondary text:** black with opacity, preferably the semantic muted token, rather than introducing another text color.
- Surfaces should stay white; do not use pink as a page background or repeated card fill.

### Dark
- **Background:** `#0B0B0C` almost black.
- **Headings, icons, buttons, links, help chat, menu, and accents:** Rose `#C07A84` as the canonical brand accent. Supporting Rose `#D9A3AA` and Deep Rose `#A65E69` may be used for states and emphasis.
- **Primary text:** `#FFFFFF` white.
- **Secondary text:** white with opacity, preferably the semantic muted token, rather than introducing another text color.
- Surfaces should remain near-black/dark neutral; do not use pink as a page background or repeated card fill.

### Neutral / Accent Balance
- The visual goal is a white or almost-black canvas with Rose concentrated on meaningful brand elements: headings, icons, buttons, links, menus, help chat, selected states, outlines, and small accents.
- Treat 60/30/10 as a visual-balance principle, not literal pixel coverage. Do not force large pink areas merely to satisfy a ratio.
- Do not use Rose as a large decorative glow, repeated card fill, or default body-text color.
- Text hierarchy should come primarily from typography, spacing, layout, and opacity.

### Navbar Control Standard
- Public-navbar controls use the same restrained opacity treatment established in the current implementation; do not increase their fill opacity or redesign them into solid/pill-heavy controls without explicit user instruction.
- Theme toggle, language selector, and burger trigger should read as one control family through consistent dimensions, borders, spacing, and subtle Rose hover treatment.
- The public navbar itself stays visually continuous with the page canvas; do not add a contrasting navbar block merely to mask background effects.

### Button Color Standard
- **`components/ui/button.tsx` is the single canonical application button primitive. All reusable application buttons MUST render through `Button`; do not introduce or maintain separate visual button primitives.**
- The button has **one visual treatment only**. There are no visual variants. `size` is only a sizing axis and must not change color, border, shadow, gradient, or shape language.
- Canonical shape: compact rectangular button with clearly rounded corners, never a pill. Canonical fill: solid Rose `#C07A84`; hover/pressed state may use Deep Rose `#A65E69` or Supporting Rose `#D9A3AA` within the same palette.
- Canonical depth: subtle raised shadow only. **No gradients** and no page-specific glow/shine effects.
- Light mode button text is **white**. Dark mode button text is **black**.
- Legacy `variant` values are accepted only for source compatibility and MUST resolve to the exact same visual treatment.
- Do not introduce one-off button colors, gradients, borders, shadows, rounded treatments, or page-specific button variants outside `components/ui/button.tsx`.

## 5. Anti AI-Slop Text Hierarchy

- Do not color every piece of text differently.
- Functional/body text should remain the primary readable text color.
- Rose is an accent for the specified brand elements, not a replacement for body text.
- Establish secondary hierarchy through opacity, typography, weight, size, spacing, layout, and contrast first.

## 6. Motion & Accessibility

- Animated files must use `"use client"` when required by the framework.
- Animate transform (`x`, `y`, `scale`, `rotate`) and opacity whenever possible; do not animate layout properties such as width, height, margin, or padding for routine motion.
- Button interactions: soft hover scale around `1.02`, tap scale around `0.98` where appropriate.
- Interactive cards: vertical lift around `y: -4` with spring physics.
- Natural entrance easing: `[0.22, 1, 0.36, 1]`, normally `0.4s–0.6s`.
- Interactive spring: `stiffness: 400`, `damping: 25`.
- Scroll reveal uses `whileInView` with `viewport.once`.
- Use `AnimatePresence mode="wait"` for tab/modal/page transitions where applicable.
- Always respect `useReducedMotion()` and remove heavy motion when requested.
- Motion must never reduce usability or obscure important content.

## 7. UI Components

Use existing Shadcn UI and Lucide React patterns. Customize Shadcn components using DC Organizer semantic theme tokens instead of untouched slate/zinc/neutral defaults.

Use Lucide icons consistently and keep interactive targets at least `44x44px`. Use `asChild` on `SheetTrigger`/`DialogTrigger` when wrapping custom trigger elements to avoid nested-button DOM issues.

## 8. Code Quality

- TypeScript must remain type-safe.
- Prefer existing architecture and dependencies.
- Do not add a dependency when an installed package already solves the requirement.
- Keep components maintainable; avoid unnecessarily large files and duplicated logic.
- Follow existing Prettier/ESLint conventions and Tailwind class ordering.
- Avoid unused variables, invalid DOM nesting, stale hook dependencies, and client-only APIs in server components.

## 9. Data & Entitlement Rules

- Shared wedding/event data must be persisted and read from PostgreSQL/Prisma.
- Couple names are canonical onboarding data and remain consistent/read-only where required by the PRD.
- No placeholder couple names or fake invitation records.
- Server-side access checks are authoritative.
- Guest management and seating mutations must remain server-authoritative and collision-safe.

## 10. Documentation Rule

At the end of every material implementation change:

- Update `PRD-TAMBAHAN.md` with the change, rationale, affected files, commit(s), and validation status.
- Do not delete or rewrite prior history merely to add a new implementation note.
- Never claim build, lint, CI, or deployment success without an actual observed result.
