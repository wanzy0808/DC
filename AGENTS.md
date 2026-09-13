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
- Primary/action: `#C07A84` Rose
- Supporting accent: `#D9A3AA`
- Hover/pressed: `#A65E69`
- Main background: `#FAF8F8`
- Secondary surface: `#F7ECEE`
- Primary text: `#241D1F`
- Muted text: `#7F4B55`

### Dark
- Background: `#100D0F`
- Surface: `#21181A`
- Primary accent: `#D9A3AA`
- Secondary brand accent: `#C07A84`
- Highlight accent: `#F1C9CE`
- Primary text: `#F8F3F4`

Deprecated palette: `#8C4A56`, `#E8B4B8`, `#6E3843`, `#0F0E11`, and `#1A181E`. Do not reintroduce the deprecated palette. Readability always outranks color matching.

### Neutral-First 60 / 30 / 10 Composition
- Customer-facing application surfaces should be **neutral-first**: approximately 60% clean white/warm-white background and whitespace, with roughly 30% Rose reserved for meaningful brand surfaces such as primary buttons, selected controls, or deliberate outline treatments, and roughly 10% for remaining visual accents such as icons, rules, status marks, or supporting brand details.
- Treat the ratio as a visual-balance guideline, not a literal pixel calculation.
- **Do not use Rose as a page background, large decorative glow, repeated card fill, or default body-text color.**
- Body/headline text should remain near-black/primary text. Muted text may use the semantic muted token only where hierarchy requires it.
- Rose should be concentrated into actions, selected states, outlines, and small icon/status accents so the interface reads editorial and calm rather than monochromatic.
- When a component can communicate hierarchy through typography, spacing, borders, or whitespace, prefer those before adding another color.

### Button Color Standard
- All reusable application buttons MUST use the shared `components/ui/button.tsx` variants instead of arbitrary background/text color classes.
- `default` is the canonical primary CTA: `var(--primary)` with `var(--primary-foreground)`.
- `secondary` is the canonical soft-rose secondary action.
- `outline`, `ghost`, `link`, and `destructive` retain semantic meaning and must not be recolored per page without a documented product reason.
- Do not introduce one-off button colors such as `bg-blue-*`, `bg-green-*`, arbitrary rose hex values, gradients, or legacy palette values for ordinary actions.
- Primary button hover/pressed states must resolve through the shared theme tokens so light and dark mode remain visually consistent.

## 5. Anti AI-Slop Text Hierarchy

- Do not color every piece of text differently.
- Functional/body text should remain the primary readable text color.
- Rose is an accent, not a default replacement for body text.
- Establish hierarchy through typography, weight, size, spacing, layout, and contrast first.

## 6. Motion & Accessibility

- Animated files must use `"use client"` when required by the framework.
- Animate transform (`x`, `y`, `scale`, `rotate`) and opacity whenever possible; do not animate layout properties such as width, height, margin, or padding for routine motion.
- Button interactions: soft hover scale around `1.02`, tap scale around `0.98` where appropriate.
- Interactive cards: vertical lift around `y: -4` with spring physics.
- Natural entrance easing: `[0.22, 1, 0.36, 1]`, normally `0.4s–0.6s`.
- Interactive spring: `stiffness: 400`, `damping: 25`.
- Scroll reveal uses `whileInView` with `viewport.once`.
- Lists may use `staggerChildren: 0.08` when it improves hierarchy.
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
