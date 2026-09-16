# PRD3 — Dashboard SaaS Action Hierarchy & User-Facing Copy

**Project:** DC Organizer  
**Date:** 2026-09-16  
**Status:** Implementation log continuation after `PRD-TAMBAHAN.md`, `PRD1.md`, and `PRD2.md`

> This file records the next dashboard refinement pass. The goal is to make the dashboard behave and read like a mature SaaS product: primary actions must be obvious, event lifecycle actions must be ordered clearly, and internal implementation details must never leak into customer-facing copy.

---

## 2026-09-16 — Invitation Workspace Action Hierarchy

### Problem
The Invitation workspace already had a Studio link, but it was rendered as a small button inside a group of equally weighted actions. In practice the Studio entry was visually easy to miss, even though designing the invitation is a primary step in the product workflow.

### Current behavior
`components/Dashboard/InvitationWorkspacePanel.tsx` now gives each event a clear primary design action.

For a configured event:
- a dedicated `Desain undangan` surface is shown;
- `Buka Studio` is a full-width primary action;
- the link includes the exact `invitationId` so Studio opens the intended event;
- activation and publish actions remain separate from the design action.

For an event that is not yet configured:
- Studio is not presented as the next action;
- the card shows `Lengkapi acara` instead.

The intended event lifecycle is now visually clearer:

1. Lengkapi acara
2. Buka Studio
3. Aktifkan Rp150.000
4. Publish / Tarik publik
5. Buka publik

This does not introduce new button colors or visual variants. All actions continue to use the canonical `components/ui/button.tsx` primitive and the existing DC Organizer Rose system.

### Public status action
When an invitation has not been published yet, the secondary public slot shows a compact non-interactive `Belum dipublish` state instead of leaving the card visually ambiguous.

When published, the public action becomes a labeled `Buka publik` button rather than only an icon.

### Affected file
- `components/Dashboard/InvitationWorkspacePanel.tsx`

### Commit
- `d82598327429a0c8a86993c38bbab81d3d35930d` — make Invitation Studio the primary dashboard action

---

## 2026-09-16 — Remove Internal Implementation Copy from Dashboard

### Product copy rule
Dashboard copy must describe what the user can do or what state their event is in. It must not expose implementation details such as:
- database persistence;
- API behavior;
- internal row/record creation;
- technical database IDs;
- source-of-truth language;
- infrastructure or server mechanics.

Those details remain valid engineering documentation, but they do not belong in the customer-facing dashboard.

### Rangkaian Acara cleanup
`components/Dashboard/EventPanel.tsx` was cleaned accordingly.

Removed customer-facing copy included wording such as:
- `Draft acara langsung dibuat di database...`;
- `Membuat draft acara di database...`;
- explicit database event ID shown in the form header.

User-facing replacements are concise and action-oriented:
- `Tambah acara`;
- `Menyiapkan...`;
- `Acara baru siap dilengkapi.`;
- `Belum ada acara.`;
- `Lengkapi acara`;
- `Edit acara`;
- `Simpan acara`;
- `Buka Studio`.

### Important implementation behavior remains unchanged
The internal behavior is still database-first:
- clicking `Tambah acara` still persists a real Invitation draft immediately;
- PostgreSQL/Prisma remains the source of truth;
- event IDs continue to exist and are used internally;
- draft/configured state continues to be server-backed.

Only the customer-facing copy was simplified. No persistence behavior was removed.

### Affected file
- `components/Dashboard/EventPanel.tsx`

### Commit
- `8ef438c725a4c4f2098bd1486dccc0307485d892` — remove technical implementation copy from event dashboard

---

## Dashboard SaaS UX Principle Going Forward

Application surfaces should prioritize:
- clear next actions;
- current status;
- event context;
- concise labels;
- server-authoritative behavior behind the scenes.

Application surfaces should avoid:
- explaining backend architecture to end users;
- long instructional paragraphs where the control itself is self-explanatory;
- exposing database IDs unless a real support/diagnostic workflow explicitly requires them;
- giving equally strong visual weight to every button on a card.

This continues the earlier dashboard direction: tool/workspace first, explanatory landing-page copy last.

---

## Validation

GitHub Actions **Build Validation #807** for commit `8ef438c725a4c4f2098bd1486dccc0307485d892` completed with conclusion **success**.

Observed validation covers the source state containing both:
- the Invitation Workspace Studio hierarchy change from `d82598327429a0c8a86993c38bbab81d3d35930d`;
- the EventPanel customer-copy cleanup from `8ef438c725a4c4f2098bd1486dccc0307485d892`.

Observed result:
- production build: PASS;
- TypeScript validation: PASS;
- workflow conclusion: success.

No claim is made here about production deployment or database migration execution.

---

## Next Audit Target

The dashboard `Usher App` still needs the same event-context audit used by RSVP, Manajemen Tamu, and Personal Invitation. The current dashboard summary path still selects the first paid event automatically, so a future pass should make the active event explicit rather than implicit when an account owns multiple events.
