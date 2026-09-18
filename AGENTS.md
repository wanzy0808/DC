<!-- BEGIN:nextjs-agent-rules -->

# Next.js Agent Rules

This project uses a current Next.js version with potentially breaking APIs and conventions. Before writing Next.js-specific code, inspect the relevant guides under `node_modules/next/dist/docs/` available in the repository environment and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# DC Organizer — Agent, Design System & Engineering Rules

These rules apply to the entire repository unless a more specific implementation requirement says otherwise.

## 1. Required Workflow Before Coding

Before any material change, inspect in this order:

1. `AGENTS.md`
2. `prd.md`
3. `README.md`
4. Relevant implementation files, routes, components, schema, and APIs

`prd.md` is the single source of truth for active product requirements **and** the consolidated implementation history in Appendix A.

Every AI-made material change MUST update Appendix A in `prd.md` with rationale, affected files/area, commit(s), and validation status. If a change alters product requirements, update the canonical body section first and then append its implementation/history entry in the same `prd.md`.

Do not create or revive `prd1.md`, `prdnew.md`, `PRD2.md`, `PRD3.md`, or other split PRD files. When the owner **explicitly requests `prd-tambahan.md`**, it may exist only as a supplemental non-canonical delta log; active requirements must still be mirrored to `prd.md`, and `prd-tambahan.md` must never override the canonical body or Appendix A.

Do not add generic project-wide prompt/skill documents that duplicate or conflict with `AGENTS.md` and `prd.md`. If specialized instructions are genuinely needed, keep them narrowly scoped and explicitly referenced.

Validation must never be described as PASS unless an actual build/CI result is available.

## 2. Product Identity & Preservation

- Official product brand: **DC Organizer**.
- **Protected brand wordmark contract:** customer-facing `DC Organizer` wordmarks MUST render through `components/Brand/BrandWordmark.tsx` (or preserve its exact output when technically impossible to import it). The wordmark font is `var(--font-dc-heading)` / Cinzel, its wording and Rose treatment are locked, and agents must not reinterpret, restyle, substitute, or resize it into a different logo system unless the user explicitly requests a brand change.
- Public navbar may show the existing brand tagline through `BrandWordmark showTagline`. **Dashboard/app workspace headers MUST NOT show the marketing tagline; dashboard brand anchor is wordmark-only.**
- Never introduce legacy customer-facing brands such as Citin or DC Wedding.
- Never reintroduce wedding-only assumptions into general event workflows unless the selected event category specifically requires them.
- Preserve `/dashboard` and Beranda.
- Follow **Extend Over Replace**: inspect and extend existing routes, APIs, components, schema, and data flows before replacing anything.
- Database is the source of truth; do not introduce fake/mock invitation data.
- Authorization is server-side; UI entitlement must reflect server entitlement.
- Published Rangkaian Acara is customer-immutable: once `Invitation.isPublished = true`, server APIs must reject event-detail edits, unpublish attempts, and event deletion. UI must also stop exposing Edit/Hapus for that event. This lock applies to Rangkaian Acara metadata/lifecycle and must not silently disable unrelated Studio capabilities unless the PRD explicitly expands the lock.
- Existing routes and compatibility aliases must remain when required by the PRD.
- **Pintu is a core landing-page navigation surface. Do not remove or bypass it without explicit user instruction.**
- **Rose petals in `components/Layout/RosePetalBackground.tsx` are a protected visual element. Do not alter their behavior, appearance, count, timing, or styling unless explicitly instructed.**

## 3. Typography

Use only these application UI fonts:
- **Cinzel** — display, headings, titles, branding, editorial elements. **DC Organizer wordmark always uses the canonical `--font-dc-heading` token and must not be swapped to another font class.**
- **Fauna One** — body/UI copy, navigation, forms, buttons, descriptions.
- **DM Mono** — metadata, codes, timestamps, status values, technical labels, small utility text.

Do not introduce additional fonts, random Google Fonts, template fonts, or intentional browser/system fallback styling. Invitation-template typography may remain dynamic when it belongs to invitation content itself.

## 4. Canonical Theme
### Desktop View

- Always !! use 80% VW for primary desktop header/content/footer containers. Do not regress page-level content to a fixed `max-width: 1400px` (or similarly narrow legacy wrapper) that leaves excessive unused desktop space.
- Dashboard chrome may span the viewport, but the customer-facing header/content workspace should target `80vw` and remain capped by the available pane width so the sidebar never causes horizontal overflow.
- **Dashboard visual consistency is mandatory:** Beranda is the reference visual language for every customer dashboard page and nested dashboard component. Use neutral white/near-black surfaces, subtle borders/low shadow, Rose only as meaningful accent, consistent icon treatment, and the same table/card hierarchy. Do not invent a page-specific color/card system that makes tabs look like different products.
- **Dashboard readability:** use the generous desktop workspace. Routine dashboard body/form/table copy should generally read around 14–16px, small metadata around 11–12px, section headings around 20–24px, and metric values around 24px. Do not shrink operational copy to 8–10px merely to make the UI look “clean”.
- **Dashboard sidebar contrast:** the customer sidebar follows the page canvas, not a full Rose rail. Light mode uses a white sidebar with readable near-black default text/icons; Dark mode uses the same near-black background as the Dashboard body with white default text/icons. In both themes, navigation buttons remain neutral/transparent by default and use Rose with white text/icons for hover/active states; Deep Rose may mark the active state. Sidebar navigation copy should be slightly larger than dense utility copy (roughly 15–16px for main items). **Dashboard header controls must inherit the established public landing-navbar control language rather than creating a separate Dashboard-only treatment.** Reuse the same ThemeToggle and LanguageToggle behavior; Dashboard burger mirrors the landing burger classes; the account trigger should visually follow the same restrained transparent/bordered navbar treatment. Do not add Dashboard CSS overrides that change those shared controls away from the landing navbar.
- **Dashboard access before Publish:** Digital Invitation payment must not hide RSVP, Guest Management, Personal Invitation, or other preparation workspaces. Users may explore and prepare them before Publish; the Digital Invitation payment gate belongs to the Publish action. Separate product entitlements such as WA Blast quota and Guestbook/Usher remain independent.
- **Dashboard bilingual + theme contract:** all customer Dashboard tabs/components must work in Light and Dark mode and support Indonesian + English through the existing shared providers. Indonesian is the default locale. Translate application copy/state, never user-owned event/guest/content data. Theme and language controls must remain reachable from the Dashboard header, including mobile access.
- Reuse/extend `components/Dashboard/DashboardPrimitives.tsx` for new dashboard surfaces, metrics, notices, and section structure instead of creating another dashboard visual primitive.
- Tables/graphs are encouraged when they expose real stored/derived product data; never manufacture dashboard metrics merely to fill space.
- Do not use decorative sequence numbering in customer-facing page/component copy (for example `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature labels, or numbered cards). Use descriptive labels instead. Numeric values that are actual product data remain allowed and required where meaningful, including dates, times, prices, counts, capacities, quotas, child order, phone numbers, and metrics.
- Public burger menu omits a dedicated Home/Beranda item; the logo remains the home path. In Indonesian, service labels are `Perencana Acara`, `Undangan Digital`, and `Buku Tamu Digital`. `Layanan` remains a submenu parent, `Masuk` and `Daftar` remain visible, and service/package icons must be visually distinct.
- Explicit UI exception: burger navigation buttons plus registration/login controls use a neutral white surface with black text and a subtle border in both themes. Keep using the shared `Button` primitive, but this surface-specific treatment supersedes the Rose fill rule for these auth/navigation surfaces. Rose remains the accent for focus, links, and selected emphasis.
- Registration dialog headers must reserve the top-right area for the close `X`; do not place a `Masuk` action there. Put the login switch below the registration form. Auth copy must remain general-event oriented.
- Landing 80vw should read as one editorial composition: the copy column may widen/grow downward, a quote/proof block may sit above a subtle separator, and muted capability checks sit below it.
- Never fabricate customer testimonials, customer names, ratings, or quotes. Only attribute a quote to a customer when a real source is available; otherwise use clearly non-customer brand/service copy.

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
- Exception defined above: burger navigation and auth/login/register surfaces may override the canonical Rose fill with the documented neutral white/black treatment while still rendering through `Button`.

## 5. Anti AI-Slop Text Hierarchy

- Do not color every piece of text differently.
- Functional/body text should remain the primary readable text color.
- Rose is an accent for the specified brand elements, not a replacement for body text.
- Establish secondary hierarchy through opacity, typography, weight, size, spacing, layout, and contrast first.


### Dashboard microcopy

- Customer-facing Dashboard copy must be concise, natural, and context-aware. Do not repeat a page/category noun merely to fill an eyebrow, title, description, selector label, metric, card, or action.
- Avoid stacked repetition such as `Workspace → Acara → pilih acara → acara aktif` when the current screen already supplies that context. Keep a term only when it disambiguates scope, state, or the next action.
- Prefer removing redundant copy over replacing it with a synonym. A shorter label such as `Total`, `Terbaru`, `Lihat semua`, `Detail`, or a context-specific eyebrow is better when the surrounding UI already names the object.
- Generic decorative labels such as `Workspace` must not be used as filler. Use a meaningful context label such as `Persiapan`, `Publikasi`, `Distribusi`, `Kehadiran`, or omit the label when it adds no information.
- Do not duplicate the same metric/context in adjacent header cards and metric grids. If the information is already clearly visible nearby, remove the duplicate.
- Small owner corrections to recurring UI/copy style are repository conventions, not throwaway tweaks: capture them in this file and mirror active requirements/history to `prd.md`; when the owner explicitly asks for the supplemental log, also update `prd-tambahan.md`.
- Landing root chrome must visually merge with the landing canvas: header and compact landing footer use `var(--background)` rather than a visibly separate surface. In landing Dark Mode, the selected ID/EN option uses opaque Rose with near-black text, and the theme toggle uses opaque Rose with a near-black icon/text. Scope these landing-only overrides through the landing navbar class so Dashboard/shared controls are not accidentally restyled.

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
- Landing Pintu decorative ornament at the top belongs to the closed-door surface: it fades/moves out when that door is active/open and returns when the door closes. Keep this synchronized with the same `isActive` state as the door panels and respect reduced motion.

## 7. UI Components

Use existing Shadcn UI and Lucide React patterns. Customize Shadcn components using DC Organizer semantic theme tokens instead of untouched slate/zinc/neutral defaults.

Use Lucide icons consistently and keep interactive targets at least `44x44px`. Use `asChild` on `SheetTrigger`/`DialogTrigger` when wrapping custom trigger elements to avoid nested-button DOM issues.

## 8. Repository Structure & Naming

- Organize reusable business UI by feature with descriptive PascalCase folders under `components/`, for example `DigitalInvitation`, `EventPlanner`, `Guestbook`, `Dashboard`, `Payments`, and `Landing/Pintu`.
- Shared provider modules must be explicit: keep state/provider logic in `ThemeProvider.tsx` / `LanguageProvider.tsx` and UI controls such as `ThemeToggle.tsx` / `LanguageToggle.tsx` separate. Do not recombine provider, hook, and control UI into one context file.
- Reserve `components/Layout`, `components/Brand`, `components/Theme`, `components/I18n`, `components/Marketing`, and `components/ui` for shared/global concerns. Do not place feature-specific purchase, editor, or service components in `Layout`.
- Avoid ambiguous abbreviations or route-shaped names in component folders such as `D-Invitation` or suffixes such as `Page` when the folder already represents the feature.
- Active components must use stable semantic names. Do not keep `V2`, `V3`, `New`, `Old`, or similar version suffixes after a replacement becomes canonical; remove obsolete versions once repository references are verified absent.
- Static customer-facing content belongs under `data/<domain>/`: service content in `data/services/`, template showcase/catalog presentation data in `data/templates/`, and similar future domains in their own explicit folders. Route/page files should not own large static catalogs.
- Keep domain logic/helpers in `lib/`; do not move executable business logic into `data/`. Group focused helpers by domain (for example `lib/invitations`, `lib/security`, `lib/usher`, `lib/notifications`) instead of adding more unrelated files at the `lib/` root.
- Route folders under `app/` follow URL requirements and should not be renamed merely for code-style consistency.
- When moving a component/data file, update all imports in the same change and validate with the production build before merge.
- Split large feature components by responsibility when they mix orchestration/state, static configuration, domain types/helpers, and reusable presentation. Keep orchestration in the workspace/page component; move reusable panels, config, types, and pure helpers into adjacent feature files. Do not split purely to reduce line count.
- Do not split a component that already has a clear responsibility and manageable size. Prefer a stable cohesive file over artificial fragmentation.
- Event Panel structure is canonical: `EventPanel.tsx` owns event orchestration/API mutations and the tightly-coupled list/editor flow; `event-panel-types.ts` owns contracts; `event-panel-helpers.ts` owns pure form/date/time conversion and validation; `EventFields.tsx` owns reusable event editor field controls.
- Seating Chart structure is canonical: `SeatingChart.tsx` remains the cohesive canvas/editor orchestration layer; `seating-chart-types.ts` owns contracts and `seating-chart-geometry.ts` owns pure table/seat geometry. Do not split the canvas into many prop-heavy presentational components unless its responsibilities materially expand.
- Invitation Studio editor structure is canonical: `InvitationDesigner.tsx` owns orchestration/history/upload/save; `DesignerPanels.tsx` owns editor controls; `InvitationPreview.tsx` owns preview rendering; `designer-types.ts`, `designer-config.ts`, and `designer-state.ts` own model/config/state helpers.
- RSVP form structure is canonical: `RsvpForm.tsx` owns submit orchestration/state; `RsvpPanels.tsx` owns input/success presentation; `rsvp-helpers.ts` owns pure calendar/QR/ticket helpers; `rsvp-types.ts` owns the form/ticket contracts.

## 9. Code Quality

- TypeScript must remain type-safe.
- Prefer existing architecture and dependencies.
- Do not add a dependency when an installed package already solves the requirement.
- Keep components maintainable; avoid unnecessarily large files and duplicated logic.
- Follow existing Prettier/ESLint conventions and Tailwind class ordering.
- Avoid unused variables, invalid DOM nesting, stale hook dependencies, and client-only APIs in server components.

## 10. Data & Entitlement Rules

- Shared event data must be persisted and read from PostgreSQL/Prisma.
- Event identity is event-scoped. Couple-specific fields are required only for event categories that use a couple identity.
- Legacy fields such as `groomName`, `brideName`, `weddingHashtag`, `WEDDING`, and `ADAT_AKAD` may remain for backward compatibility but MUST NOT be treated as universal product semantics.
- No placeholder couple names or fake invitation records.
- Digital Invitation entitlement is event-scoped; payment for one invitation/event must not unlock another event.
- Creating/saving an event and editing/saving a template may happen before payment. Payment is enforced when publishing according to `prd.md`.
- A public invitation requires a configured event, a saved template, published state, and valid event-scoped entitlement.
- Server-side access checks are authoritative.
- Guest management and seating mutations must remain server-authoritative and collision-safe.

## 11. Documentation Rule

At the end of every material implementation change:

- Update the canonical body of `prd.md` when active product requirements change.
- Append the implementation change, rationale, affected files/area, commit(s), and validation status to Appendix A of the same `prd.md`.
- Do not create parallel/split PRD files for normal implementation history.
- Never claim build, lint, CI, migration, or deployment success without an actual observed result.
