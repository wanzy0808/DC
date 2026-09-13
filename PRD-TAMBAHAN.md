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
- `cd3fb82656e49618278cbbd1351228184314f8fc` — footer localization.

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
- `ef86e40020e95558c014850e8683311aa65ca5b5` — restore theme control in navbar.

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
