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
- Commit: `ae73a728be0610e8c1e6437a33bb7924d1588eed`
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

---

# 2026-09-13 — Landing Page & Navbar Canonical Light/Dark Refinement

## Problem
The landing page had been tuned toward the previous neutral-first interpretation, but the current canonical rule is more explicit: light mode uses a white canvas with Rose on headings, icons, buttons, links, menus, and accents; dark mode uses an almost-black canvas with the same Rose brand elements, while the majority of text stays black in light mode and white in dark mode. Navbar controls also needed one consistent button language.

## Implementation
- Updated the landing hero heading to the semantic `text-primary` Rose accent while keeping the eyebrow, body copy, and metadata in neutral/opacity-based text.
- Kept the landing canvas on `bg-background`, so the global light theme resolves to pure white and dark theme resolves to almost black.
- Preserved the canonical shared `buttonVariants({ variant: "default" })` CTA so the primary action remains Rose without introducing one-off button colors.
- Preserved the Pintu navigation surface, bilingual behavior, protected rose-petal background, motion, and existing routes.
- Refined the public navbar so the brand remains Rose, the subtitle uses neutral opacity, and all interactive controls follow the shared Button system.
- Reworked the theme toggle to use the shared `Button` `outline` variant with a Rose icon/focus treatment while preserving existing localStorage theme persistence and dark-mode behavior.
- Reworked the ID/EN selector to use shared `default` for the selected locale and `ghost` for the inactive locale, removing the previous pill-heavy treatment while keeping the explicit two-locale model.
- Simplified the menu trigger to the shared `default` button without an extra custom background, hover color, or rounded-pill treatment.
- Synchronized `README.md` with the canonical Light/Dark theme rules so documentation no longer describes the deprecated tinted background palette.
- No dependency, schema, API, route, invitation, or Pintu architecture changes.

## Affected Files
- `app/page.tsx`
- `components/Theme/ThemeContext.tsx`
- `components/I18n/LanguageToggle.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `README.md`

## Commits
- `4c963b15dc8d0a30c45ce8715f22c22114cc7f11` — apply canonical Rose/neutral hierarchy to the landing hero.
- `25b3f1cd3ba71c234fd443d36e9465d7b8aa23fd` — standardize theme toggle with shared Button variants.
- `1ef78a501d45dc007555bae0864263aebba4943d` — refine ID/EN navbar control.
- `610e7e169398f67c697743fb5fb0fdd274808611` — refine navbar button hierarchy and menu trigger.
- `c65ba223c470f18d71fcc2ccceb2ac2e05a38f41` — synchronize README theme documentation.

## Validation
Reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `PRD-TAMBAHAN.md`, `README.md`, existing i18n/theme architecture, shared Button variants, Pintu navigation, and protected background behavior. Build/CI not verified.

---

# 2026-09-13 — Landing Page Romantic Copywriting Refinement

## Problem
The landing page copy was functional and product-oriented but did not yet create the emotional pull expected from a premium wedding product. The wording needed to feel romantic, intimate, and memorable while still communicating the purpose of each DC Organizer workspace clearly.

## Implementation
- Rewrote the Indonesian landing-page hero copy with a warmer romantic narrative centered on the couple's journey, the meaning of the invitation, and the people who become part of the celebration.
- Rewrote the English copy as natural brand copy rather than literal translation, preserving the same emotional intent and product meaning.
- Refined capability labels so they sound polished while remaining short enough for the compact landing layout.
- Changed the primary landing CTA from a generic `Buka workspace` / `Open workspace` to a more emotional action: `Mulai merangkai` / `Begin your story`.
- Refined navbar/burger-menu supporting copy such as `Mulai perjalananmu` / `Begin your journey` and the service descriptions to make the overall landing experience feel more cohesive and invitation-like.
- Preserved the existing `id` / `en` locale model, Pintu navigation, routes, protected rose-petal background, motion behavior, and Button system.
- No dependency, schema, API, or route changes.

## Affected Files
- `lib/i18n.ts`

## Commit
- `0ce34bf201dac516e2109890f840c167e88a30f8` — elevate landing page romantic messaging.

## Validation
Reviewed the copy and affected locale structure against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, and the existing landing/Pintu implementation. Build/CI not verified.

---

# 2026-09-13 — Navbar Seamless Background & Control Color Harmony

## Problem
The public navbar controls still looked like separate visual systems: the menu trigger used a filled primary treatment while the theme toggle and language selector used outlined controls. The navbar also explicitly painted its own background, which could make the header feel visually detached from the landing-page canvas.

## Implementation
- Changed the navbar shell to `bg-transparent` so it inherits the exact light/dark canvas of the body instead of creating a visually separate panel.
- Kept the navbar brand Rose and subtitle neutral/opacity-based according to the canonical Light/Dark theme rules.
- Standardized the burger/menu trigger to the same Rose `outline` treatment as the theme control: `h-11`, transparent background, Rose border/icon, and subtle Rose hover state.
- Standardized the theme toggle to the same `outline` geometry and color treatment while preserving `Sun` / `Moon`, localStorage persistence, and dark-mode behavior.
- Reworked the ID/EN selector so its container and language buttons use the same transparent Rose-outline family; the active locale receives only a subtle Rose tint instead of a separate filled-button language style.
- Preserved the existing burger Sheet architecture, navigation, bilingual locale model, accessibility labels, routes, Pintu, rose petals, and no new dependencies.

## Affected Files
- `components/Layout/Navbar/Navbar.tsx`
- `components/Theme/ThemeContext.tsx`
- `components/I18n/LanguageToggle.tsx`

## Commits
- `a18ee63d3602bd4ab1493608f11d41a0018a2eb3` — make navbar background seamless and standardize menu trigger.
- `6b19a09ace4cedde986e7b7927afe8e1ccaaf472` — align dark/light mode toggle with navbar controls.
- `0eca5bb570506e8720100bd6961c9d17be01481e` — align language selector with navbar controls.

## Validation
Reviewed the changed source against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, existing Button/theme/i18n architecture, and the navbar Sheet implementation. Build/CI not verified.

---

# 2026-09-13 — Navbar Background Glow Continuity Fix

## Problem
After making the navbar transparent, the public header could still look visually separated on the right side because the page-level ambient pink glow continued underneath the navbar. The navbar itself was correct; the decorative layer behind it was creating the visible color break.

## Implementation
- Kept the navbar fully transparent and preserved the user's current restrained opacity treatment for the Theme, Language, and Burger controls.
- Constrained the non-protected ambient glow layer in `components/Layout/background.tsx` to begin below the navbar zone (`top-24`), so the transparent header inherits a clean canvas without a pink strip.
- Moved the secondary right-side blur glow to the same content zone using `top-[calc(6rem+8%)]`.
- Left the protected rose-petal layer completely unchanged: same count, animation, timing, shapes, gradients, and shadows.
- Added the navbar opacity/control-family rule to `AGENTS.md` and the navbar canvas-continuity rule to `prd.md` so future changes do not reintroduce a different control treatment or solid navbar workaround.
- No dependency, schema, API, route, Pintu, or invitation behavior changes.

## Affected Files
- `components/Layout/background.tsx`
- `AGENTS.md`
- `prd.md`

## Commits
- `7ea3d10eb11ace6b0e12d781539619774afcfb3a` — constrain ambient background glow below navbar.
- `ee3198ea98269b815e29a6b67eab6088f30afe62` — document navbar control opacity rule.
- `b87491362e61e4e148727aeba29e53a66c9b9da2` — document navbar canvas continuity.

## Validation
Reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, shared Button/theme/i18n architecture, and the protected rose-petal implementation. Build/CI not verified.

---

# 2026-09-14 — Landing Brand Gradient Button Trial

## Goal
Test a new premium button treatment on the landing page before applying it across the entire application.

## Implementation
- Added a reusable `brand-gradient` Button variant in `components/ui/button.tsx` instead of introducing page-specific button CSS.
- Gradient runs from the canonical Rose brand color toward white, with a restrained Rose glow, subtle hover lift, and accessible focus treatment.
- The trial CTA uses a fully rounded shape and keeps the existing Lucide arrow icon and landing navigation behavior.
- Applied only to the primary landing CTA for review; existing navbar control opacity and other button variants were left unchanged.
- No dependency, schema, API, route, Pintu, or content behavior changes.

## Affected Files
- `components/ui/button.tsx`
- `app/page.tsx`

## Commits
- `2f8c80e59d5401d818f630b63250205e43c1b746` — add reusable brand gradient button variant.
- `8c70c46ff2b12348828e22643c90ed26134197fb` — apply gradient round treatment to landing CTA.

## Validation
Reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, current Button conventions, landing-page structure, and the protected Pintu/rose-petal implementation. Build/CI not verified.

---

# 2026-09-14 — Landing Brand Gradient Button Shape Refinement

## Implementation
- Refined the reusable `brand-gradient` Button variant to use `rounded-3xl`, taking the requested shape language from the existing compact multi-line button element while keeping the Button system's existing size tokens unchanged.
- Kept the canonical DC Organizer Rose/Pink brand gradient toward white and retained the restrained Rose glow, hover lift, and focus treatment.
- Did not change navbar control opacity or other semantic Button variants.
- No dependency, schema, API, route, Pintu, or content behavior changes.

## Affected Files
- `components/ui/button.tsx`

## Commit
- `550b192dc20b48c255a8753a07d4046a8966b7ea` — refine brand gradient button shape to rounded-3xl.

## Validation
Reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, and the shared Button conventions. Build/CI not verified.

---

# 2026-09-14 — Landing CTA Size & Depth Refinement

## Problem
The landing CTA inherited an oversized treatment from an earlier reference: `h-14`, `px-12`, and `text-xl` made the button visually too large for the hero. The previous gradient treatment also lacked a subtle inset/depth detail, so the CTA could read as flat despite the shadow.

## Implementation
- Reduced the landing CTA to `h-11`, `min-w-[12rem]`, `px-7`, `text-base`, and `font-bold` while retaining readable uppercase tracking.
- Kept the CTA clearly rounded with `rounded-xl`.
- Added restrained layered depth to the shared `brand-gradient` variant: a soft inset highlight, a small lower Rose step/shadow, and a light outer Rose glow.
- Added a subtle pressed state with `active:translate-y-px` and preserved the existing hover lift/focus treatment.
- Kept the canonical DC Organizer Rose brand as the gradient origin; no navbar opacity changes and no other semantic variants were changed.

## Affected Files
- `components/ui/button.tsx`
- `app/page.tsx`

## Commits
- `037cc8f9bdb537b214031a6c854ad091c0b8575c` — refine brand-gradient depth and glow.
- `7315d0c94874638bc175a77e0f75b944ad021def` — compact landing primary CTA.

## Validation
Reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, existing shared Button conventions, landing layout, and protected Pintu/rose-petal behavior. Build/CI not verified.
