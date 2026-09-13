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
