# DC Organizer — PRD Implementation Addendum

Implementation log for material changes. `prd.md` remains the master source of truth.

---

# 2026-09-13 — Burger Menu Visual Refinement

- Refined burger navigation typography, semantic theme tokens, editorial numbering, motion, and reduced-motion behavior.
- Preserved existing routes, Pintu navigation, rose petals, registration dialog, and Sheet architecture.
- Affected: `components/Layout/Navbar/BurgerMenuContent.tsx`
- Commit: `77261e7fb04435b2414ecc18d0a4eb30d6f9b904`
- Validation: code review against AGENTS, PRD, README, SKILL. Build/CI not verified.

---

# 2026-09-13 — Guest Create API Validation Hardening

- `POST /api/guests` now validates that `tableId` belongs to the current invitation.
- Full tables return HTTP 409 instead of creating an over-capacity placement.
- `plusOnes` must be a non-negative integer.
- A guest may still be created without a table.
- Affected: `app/api/guests/route.ts`
- Commit: `e3f7d384f7480bd9bc885505a15a8a1f93d5d1`
- Validation: source reviewed against AGENTS, SKILL, PRD, README, and seating APIs. Build/CI not verified.

---

# 2026-09-13 — Seating Builder Limits Enforcement

- `POST /api/tables` enforces 1–50 seats per table.
- Maximum 100 tables per invitation is enforced server-side.
- Shape is restricted to `ROUND`, `RECTANGLE`, or `SQUARE`.
- Affected: `app/api/tables/route.ts`
- Commit: `ae73a728be0610e8e1c6437a33bb7924d1588eed`
- Validation: source reviewed against AGENTS, SKILL, PRD, README, and seating implementation. Build/CI not verified.

---

# 2026-09-13 — Seating Roster Eligibility Enforcement

## Problem
The PRD requires the Interactive Seating Builder roster to contain only MANUAL guests or RSVP guests whose status is ATTENDING. Placement and swap APIs previously checked invitation ownership but did not enforce this roster rule server-side.

## Implementation
- `PATCH /api/guests/[id]` rejects RSVP guests that are not `ATTENDING`.
- Capacity checks only count seating-eligible guests.
- Duplicate-seat checks only consider seating-eligible guests.
- `POST /api/guests/[id]/swap` validates both source and target guests as seating-eligible before the atomic swap.
- Existing atomic transaction behavior is preserved.
- No schema or dependency changes.

## Affected Files
- `app/api/guests/[id]/route.ts`
- `app/api/guests/[id]/swap/route.ts`

## Commits
- `e94d1523d796426b04ca592967b99b0797324459` — restrict placement to eligible roster guests.
- `8e1beb8a6e457870ac364dd6b5966b2af4d20f3f` — enforce eligible roster on atomic swap.

## Validation
Reviewed against the PRD seating-roster requirement and server-authoritative authorization principle. Build/CI not verified.

---

# 2026-09-13 — Bilingual UI Foundation (Bahasa Indonesia / English)

## Problem
The application currently presents customer-facing copy primarily in Indonesian, with no shared locale model or persistent language preference. Adding translation page-by-page without a central source would create duplicated strings and inconsistent terminology.

## Implementation
- Added a lightweight, dependency-free locale layer with `id` and `en` as the only supported locales.
- Language preference is persisted in the `dc_locale` cookie and initialized server-side in the root layout.
- Added a reusable `LanguageProvider` and `LanguageToggle` so the language switch does not require introducing a third-party i18n dependency.
- Updated `<html lang>` from the persisted locale.
- Localized the primary landing-page copy, global navigation/burger menu, and footer using centralized copy written for natural product-language rather than literal word-for-word translation.
- Preserved existing routes, Pintu navigation, protected rose-petal background, theme provider, and current application architecture.
- This foundation is intended for incremental migration of the remaining dashboard, studio, package, help, login, invitation, and guestbook pages using the same message source.

## Affected Files
- `lib/i18n.ts`
- `components/I18n/LanguageProvider.tsx`
- `components/I18n/LanguageToggle.tsx`
- `app/layout.tsx`
- `app/page.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Footer.tsx`

## Commits
- `6a126dc5f5af283cb9de78f9e109b94a75454b22` — bilingual message foundation.
- `fd5880c5132908af486d98a304175f4e9272dc84` — language provider.
- `4dc71862bc70f18667f86e0da19ed9c0a307520d` — language switcher.
- `b876ce5cd3a735fff167c77cd94bf9b179f3b9ee` — server-side locale initialization.
- `e318c07e35c0813e4381e2b71a50c49181aeb799` — navbar language switcher.
- `504a8f1aee3b0e212df9a4feaf2cb5aa467c5458` — landing-page localization.
- `7a1e7dc2eef3a62d0db0dae7742794e67544e385` — navigation localization.
- `cd3fb82656a49618278cbbd1351228184314f8fc` — footer localization.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, existing Next.js architecture, and dependency constraints. No new dependency was introduced. Build/CI not verified.

---

# 2026-09-13 — Package Selection Localization

## Problem
The `/packages` route was still Indonesian-only even after the shared locale foundation was introduced. Package names, descriptions, feature lists, form labels, status messages, and calls to action therefore remained inconsistent with the selected language.

## Implementation
- Converted the service-package catalog to structured `id` / `en` content while keeping package keys, prices, and API payloads unchanged.
- Localized `/packages` customer-facing copy and all package catalog content through the shared locale state.
- Improved English copy for sales clarity rather than literal translation, especially the Wedding-Day Coordination and Full-Service Planning descriptions.
- Replaced the legacy customer-facing `DC Wedding` label with the canonical **DC Organizer** brand.
- No dependency, database, route, or entitlement changes.

## Affected Files
- `lib/packages/catalog.ts`
- `components/Layout/PackageSelector.tsx`

## Commits
- `5f63df706578830fb098208d5ea26240c4e36065` — bilingual package catalog.
- `f06669425ee5c0c3cfd96585da78c91fb5344521` — bilingual package selector.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, existing package API contract, and canonical DC Organizer branding. Build/CI not verified.

---

# 2026-09-13 — Restore Theme Toggle & Clean Language Selector

## Problem
The bilingual navbar migration unintentionally removed the existing light/dark theme control. The language control also used the generic `Languages` icon, which visually introduced an Asian-language glyph and could be mistaken for a Mandarin/Chinese language option even though the supported locales are only Indonesian and English.

## Implementation
- Restored the existing theme control to the public navbar beside the language selector.
- Reworked `ThemeToggle` to use `Sun` / `Moon` Lucide icons with accessible labels and no emoji glyphs.
- Preserved the existing `localStorage` theme persistence and `dark` document class behavior.
- Simplified the language selector to explicit `ID` and `EN` buttons only; removed the ambiguous `Languages` icon.
- No new locale was added: supported locales remain exactly `id` and `en`.

## Affected Files
- `components/Theme/ThemeContext.tsx`
- `components/I18n/LanguageToggle.tsx`
- `components/Layout/Navbar/Navbar.tsx`

## Commits
- `9523a9b53a061f2a8ceb4e25d42063c3c54b7e85` — clean ID/EN language selector.
- `c4a7706c66b3fa222959d7ab64a189825443c816` — restore accessible light/dark theme toggle.
- `ef86ce40020e95558c014850e8683311aa65ca5b5` — restore theme control in navbar.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, and the existing theme/i18n architecture. Build/CI not verified.

---

# 2026-09-13 — Canonical Button Color Standardization

## Problem
Button colors were being defined inconsistently across reusable UI and page-level implementations, making primary actions look different between screens and between light/dark themes. The design system already defines Rose as the canonical action color, but the rule was not explicit enough at the shared button component level.

## Implementation
- Standardized `components/ui/button.tsx` as the canonical source for reusable application button variants.
- `default` is now explicitly the primary CTA using the theme's `primary` token.
- `secondary` remains the canonical soft-rose action.
- `outline`, `ghost`, `link`, and `destructive` retain semantic roles rather than receiving page-specific colors.
- Added an explicit agent rule requiring reusable buttons to use shared Button variants instead of arbitrary color classes.
- Kept light/dark colors token-driven so the same button semantics remain visually consistent across themes.

## Affected Files
- `components/ui/button.tsx`
- `AGENTS.md`

## Commits
- `8b8517bc0bbaea552e3d289fc9bae4fa05cb5309` — standardize shared button variants.
- `0f2096d6f3a52853be86a70bf5c0c80cde6bb723` — document canonical button color rules in AGENTS.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, existing Tailwind/shadcn architecture, and canonical Rose theme tokens. Build/CI not verified.

---

# 2026-09-13 — Button Consistency Audit: Auth & Dashboard Actions

## Problem
After establishing the canonical shared Button variants, several existing auth and dashboard actions still bypassed the standard and used page-specific background colors, including deprecated rose values. This caused visible CTA differences between login, registration, admin, and dashboard surfaces.

## Implementation
- Migrated the login primary submit action to the shared `Button` default variant.
- Migrated the login Google action to `buttonVariants({ variant: "outline" })` so the anchor keeps its navigation semantics while sharing the Button visual system.
- Replaced the admin logout custom rose button with the shared `outline` variant.
- Replaced the dashboard feature-upgrade close control with a shared `ghost` icon button.
- Replaced the dashboard upgrade CTA with the shared `default` button styling while keeping the existing `Link` navigation behavior through `buttonVariants`.
- Migrated registration actions to shared `Button` / `buttonVariants`: Google registration, submit CTA, login switches, and password visibility controls.
- Updated the Event Panel save action to use the shared `default` Button variant instead of an injected page-specific color class.
- Converted Event Panel event-type tabs from raw colored `<button>` elements to semantic `secondary` / `ghost` Button variants.
- Preserved existing routes, API behavior, entitlement logic, form behavior, and theme architecture.

## Affected Files
- `app/login/page.tsx`
- `components/Admin/AdminLogoutButton.tsx`
- `components/Dashboard/DashboardFeatureGuard.tsx`
- `components/Layout/Navbar/RegisterDialog.tsx`
- `components/Dashboard/EventPanel.tsx`

## Commits
- `4dfc735be924342639ff7981943600c1ef611232` — standardize login actions.
- `eb9e1eb9859e0d7cb0de763bb3df5d647b8ad3af` — standardize admin logout action.
- `08400776f3e340275c6ca2c93f0ca59a23cddd81` — standardize dashboard upgrade actions.
- `e1c32a1efc08239530c60806fae5f587e703f571` — standardize registration actions.
- `541824d7e8ed46d17890559a0566b6737ab2c2e8` — standardize Event Panel save action.
- `bf060b6c46c622cb7b4eab744b4c0f45c83a40bb` — standardize Event Panel tabs.

## Validation
Reviewed the changed source against AGENTS, SKILL, PRD, README, and the canonical Button implementation. GitHub combined status for the latest commit returned no status checks; build/CI therefore remains unverified.

---

# 2026-09-13 — Simplify Manual Registration

## Problem
Manual registration asked for first name and last name even though the dashboard onboarding flow already collects the information needed to personalize the workspace. This added unnecessary friction to account creation.

## Implementation
- Removed `Nama Depan` and `Nama Belakang` fields from `RegisterDialog`.
- Manual registration now asks only for email, password, password confirmation, terms/privacy consent, and optional marketing consent.
- Updated the registration request payload to send only `email` and `password`.
- Updated `POST /api/auth/register` so manual accounts can be created with an empty `firstName`; the existing dashboard onboarding flow can collect the name later.
- Kept Google registration unchanged; Google-provided profile names are still available when supplied by Google.
- Preserved email verification, duplicate-email protection, password validation, routes, and existing database schema.

## Affected Files
- `components/Layout/Navbar/RegisterDialog.tsx`
- `app/api/auth/register/route.ts`

## Commits
- `930acf2554fca988ec7cfc2aacaf64a0901e3fda` — remove manual registration name requirement from the API.
- `d796bb0300b57a99890a9429b0b8e9f6ba93ecbc` — remove manual registration name fields from the UI.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, existing dashboard onboarding behavior, Prisma schema, and current authentication flow. Build/CI not verified.

---

# 2026-09-13 — Fix Package Showcase Locale Runtime Error

## Problem
The package catalog was migrated from plain strings/arrays to localized objects. `PackageShowcase` still treated `item.name`, `item.description`, and especially `item.features` as non-localized values, causing the runtime error `item.features.map is not a function`.

## Implementation
- Converted `PackageShowcase` into a client component so it can consume the shared `useLanguage` locale state.
- Updated package rendering to read `item.name[locale]`, `item.description[locale]`, and `item.features[locale]` from the localized catalog.
- Kept the package keys, prices, routes, and catalog API unchanged.
- Localized the showcase CTA and featured-package label for both Indonesian and English.
- Replaced the stale customer-facing `DC Wedding` label with the canonical **DC Organizer** brand in this component.

## Affected Files
- `components/Marketing/PackageShowcase.tsx`

## Commit
- `ca0cfd9c15a703b04b3dd08440b00f65ea62664c` — fix localized package catalog access in PackageShowcase.

## Validation
Reviewed the component against the current `lib/packages/catalog.ts` localized type contract, shared language provider, AGENTS, SKILL, PRD, README, and package localization changes. Build/CI not verified.

---

# 2026-09-13 — Package Showcase CTA Standardization

## Problem
After fixing the localized package catalog access, the showcase CTA still used a page-specific Tailwind color implementation. This bypassed the canonical Button Color Standard and could cause visual drift from the rest of the application.

## Implementation
- Reused `buttonVariants` from `components/ui/button.tsx` for the package showcase navigation CTA.
- Featured package uses the shared `default` variant.
- Non-featured packages use the shared `outline` variant.
- Preserved the existing `Link` navigation behavior to `/packages`.
- Removed the one-off CTA background, border, hover, and text color definitions.
- No dependency, route, catalog, or API changes.

## Affected Files
- `components/Marketing/PackageShowcase.tsx`

## Commit
- `021db3b94c6b244b394a82c044fa4ac464c12643` — standardize PackageShowcase CTA variants.

## Validation
Reviewed against AGENTS button rules, SKILL, PRD, README, shared Button implementation, and the localized package catalog contract. Build/CI not verified.

---

# 2026-09-13 — Digital Invitation Workspace Shell Redesign

## Implementation
- Reworked `/dashboard/undangan-digital` into a premium editorial workspace rather than a generic SaaS card grid.
- Introduced a stronger hierarchy for invitation management, privacy/access, and Design Studio entry points.
- Kept bilingual customer-facing copy, existing invitation APIs, publish flow, password protection, preview, editor routing, and entitlement checks intact.
- No dependency, schema, API, or route changes.

## Affected Files
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`

## Commit
- `badec4a78c0a9b8ccfca917251454da9ac773e3c` — redesign Digital Invitation workspace shell.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, existing invitation APIs, and canonical Button variants. Build/CI not verified.

---

# 2026-09-13 — Digital Invitation Management Experience Redesign

## Implementation
- Refined the invitation workspace with editorial copywriting, clearer primary actions, invitation status treatment, public URL handling, Privacy & Access controls, and Design Studio entry points.
- Preserved server-authoritative invitation data and all existing invitation operations.
- Kept light/dark theme compatibility and bilingual ID/EN rendering.
- No dependency, schema, API, or route changes.

## Affected Files
- `components/Dashboard/InvitationManagementPanel.tsx`

## Commit
- `553464bb4699cba0f1e80e14f4985cd3049a4a41` — redesign Digital Invitation management experience.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, shared Button system, invitation APIs, and entitlement behavior. Build/CI not verified.

---

# 2026-09-13 — Invitation Workspace Palette Refinement

## Problem
The first Digital Invitation workspace redesign used too much tinted card treatment and soft rose surface fill, which made the page feel visually heavy and less premium than the DC Organizer editorial direction.

## Implementation
- Reworked the invitation workspace toward a quieter editorial palette: warm neutral surfaces, semantic borders, restrained Rose accents, and more deliberate negative space.
- Removed the large filled card treatment from invitation cards and changed them to border-led editorial sections.
- Reduced decorative Rose glow usage to a subtle radial accent rather than a dominant background color.
- Removed unnecessary tinted backgrounds from the privacy and Design Studio sections; hierarchy now comes primarily from typography, spacing, rules, and small semantic accents.
- Kept primary actions on the canonical shared `Button` variants and retained light/dark theme tokens.
- Preserved bilingual copy, invitation APIs, publish/unpublish behavior, password protection, preview, editor routing, and entitlement checks.
- No dependency, schema, API, or route changes.

## Affected Files
- `components/Dashboard/InvitationManagementPanel.tsx`

## Commit
- `88aca20f566fb15ee71d7276566b9cb65d0391d5` — refine Digital Invitation workspace palette and visual hierarchy.

## Validation
Reviewed the redesigned component against AGENTS, SKILL, PRD, README, canonical Button variants, and existing invitation API contracts. GitHub commit status was not rerun after this UI commit; build/CI remains unverified.

---

# 2026-09-13 — Invitation Workspace Responsive & Action Hierarchy Refinement

## Problem
The workspace still felt visually noisy: multiple pill-shaped actions competed with each other, the page leaned too heavily on Rose as a visual treatment, and narrow layouts could make long public URLs and action groups feel clipped or crowded.

## Implementation
- Removed the decorative Rose radial treatment from the hero and returned the page to a neutral editorial canvas.
- Reduced button noise by using semantic shared variants consistently: one clear primary action, outline for utility actions, and ghost for lower-priority navigation/edit actions.
- Removed unnecessary `rounded-full` overrides so buttons inherit the shared component geometry instead of becoming a separate visual language on this page.
- Rebuilt invitation action rows with responsive grid/flex behavior so controls stack cleanly on small screens instead of compressing or overflowing.
- Added `min-w-0`, `break-all`, and `overflow-x-clip` protections around the workspace and public URL blocks to prevent long invitation URLs from forcing horizontal overflow or clipping the layout.
- Reworked the access/password controls into a responsive grid with a fluid input column and intrinsic-width actions.
- Kept all invitation APIs, entitlement checks, publish/unpublish behavior, password protection, editor routing, and bilingual copy intact.
- No dependency, schema, API, or route changes.

## Affected Files
- `components/Dashboard/InvitationManagementPanel.tsx`
- `app/dashboard/undangan-digital/page.tsx`

## Commits
- `2d9bfd69282eb5845d548f086fc03028e708cd04` — refine invitation workspace actions and responsive layout.
- `07b1124f171cb1d4df6061dba82f0d5fa2d7b837` — standardize invitation workspace header action.

## Validation
Reviewed source against AGENTS, SKILL, PRD, README, canonical Button variants, responsive layout rules, and existing invitation API contracts. Build/CI not verified.

---

# 2026-09-13 — Neutral-First Invitation Palette

## Problem
The invitation workspace still carried too much visual color. The desired direction is a calm editorial interface where the page background and most content remain neutral, while Rose is concentrated in actions, outlines, and small visual accents.

## Implementation
- Removed remaining page-level Rose treatment from backgrounds and kept the workspace on the neutral theme background.
- Changed ordinary headings, body copy, URLs, metadata, and utility text to readable near-black/neutral text hierarchy rather than Rose text.
- Kept Rose intentionally limited to primary shared buttons, meaningful outlines/status states, and small security/action icons.
- Added a neutral-first 60 / 30 / 10 composition guideline to `AGENTS.md`: white/warm-white and whitespace dominate the canvas, Rose is concentrated in meaningful controls, and small accents complete the hierarchy.
- Preserved the existing bilingual content, invitation APIs, publish/unpublish flow, password protection, preview/editor routes, responsive overflow protections, and shared Button system.
- No dependency, schema, API, or route changes.

## Affected Files
- `components/Dashboard/InvitationManagementPanel.tsx`
- `AGENTS.md`

## Commits
- `70b2672e92e4b0d9a8f08cc30316a8bc94a4d1c4` — refine invitation palette to neutral surfaces with restrained rose accents.
- `3e2d87fb6ebebd8310c6e26e9a233028547e2f99` — document neutral-first 60 / 30 / 10 visual balance.

## Validation
Reviewed source against AGENTS, SKILL, PRD, README, canonical Button variants, and responsive layout rules. Build/CI not verified.

---

# 2026-09-13 — Landing Page Neutral-First Palette Refinement

## Problem
The landing page still used page-level Rose styling for the main CTA, eyebrow/capability text, and a decorative shadow. This made the hero feel more color-heavy than the newly established neutral-first 60 / 30 / 10 direction.

## Implementation
- Returned the landing-page canvas and primary text hierarchy to neutral semantic theme tokens.
- Replaced the landing CTA's one-off Rose background, shadow, hover, and motion styling with the canonical shared `buttonVariants({ variant: "default" })` implementation.
- Reduced accent usage in the hero copy: eyebrow and supporting metadata now stay neutral, while the capability check icon remains a small Rose accent.
- Preserved the Pintu navigation surface, existing landing copy, bilingual locale behavior, protected rose-petal background, motion, and responsive layout.
- No dependency, schema, API, route, or Pintu behavior changes.

## Affected Files
- `app/page.tsx`

## Commit
- `d7301f5e77e775681951550b293210ea066f738b` — refine landing page with neutral-first visual hierarchy.

## Validation
Reviewed against AGENTS, SKILL, PRD, README, canonical Button variants, existing landing-page i18n, Pintu navigation, and protected background behavior. Build/CI not verified.
