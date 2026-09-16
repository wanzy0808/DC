# PRD1 — Event Category & Progressive Event Editor

**Project:** DC Organizer  
**Date:** 2026-09-16  
**Status:** Implementation log continuation after `PRD-TAMBAHAN.md`

> `PRD-TAMBAHAN.md` already contains the consolidated implementation snapshot and is intentionally left intact. This file continues the implementation changelog for newer work, following the user's instruction to continue as `PRD1.md`, `PRD2.md`, and so on when the main additional PRD becomes too large.

---

## 2026-09-16 — Interactive Rangkaian Acara Creation

### Goal
Make `Rangkaian Acara` easier and faster to complete for a general event SaaS. The form should not appear as a large always-open editor. Users first see their event list, then open the form only when they click `Tambah acara` or `Edit acara`.

The form uses progressive disclosure: choose the event category first, then only show fields relevant to that category.

### Event Category Taxonomy
A new shared event catalog was added in `lib/events/catalog.ts`.

Supported categories:
- `WEDDING` — Pernikahan
- `SILVER_WEDDING` — Silver Wedding
- `GOLDEN_WEDDING` — Golden Wedding
- `BIRTHDAY` — Ulang Tahun
- `BABY_SHOWER` — Baby Shower
- `OTHER` — Event Lainnya

The same catalog is used by dashboard UI and the invitation API so labels/behavior do not drift between client and server.

### Dynamic Name Fields
After the user chooses `Nama acara`, name fields appear according to the category:

- Pernikahan:
  - Nama pengantin pria
  - Nama pengantin wanita
- Silver Wedding / Golden Wedding:
  - Nama pasangan 1
  - Nama pasangan 2
- Ulang Tahun:
  - one field: Nama yang berulang tahun
- Baby Shower:
  - one field: Nama keluarga / calon bayi
- Event Lainnya:
  - custom `Nama event`

Legacy database fields `groomName` and `brideName` are temporarily reused as compatibility storage for primary/secondary names. They are not treated as universal wedding semantics in the new event form.

### Generated Event Titles
For predefined categories the server/client build a readable event title automatically, for example:
- `Pernikahan Rio & Lyvia`
- `Silver Wedding Budi & Ani`
- `Ulang Tahun Olivia`
- `Baby Shower Keluarga Wijaya`

`Event Lainnya` keeps the custom event name entered by the user.

### Progressive Form Flow
`components/Dashboard/EventPanel.tsx` now behaves as follows:

1. Page initially displays the existing event list.
2. `Tambah acara` opens a clean new-event form.
3. No database draft record is created just by opening the form.
4. User chooses event category.
5. Relevant name field(s) appear.
6. User completes date/time/location.
7. `Buat acara` creates the Invitation record and saves it as configured.
8. Existing event uses `Edit acara` and `Simpan perubahan`.
9. `Tutup form` returns to the event list without adding another empty draft.

This avoids abandoned empty Invitation rows from repeated clicks on `Tambah acara`.

### Indonesian Date & Time UX
The event form uses Indonesian conventions:

- native date input plus a readable Indonesian summary such as `Rabu, 16 September 2026`;
- 24-hour time input;
- visual time summary uses dot notation, e.g. `18.00–21.00 WIB`;
- timezone selector is limited to Indonesian zones:
  - WIB — `Asia/Jakarta`
  - WITA — `Asia/Makassar`
  - WIT — `Asia/Jayapura`

Timezone values are normalized server-side and do not accept arbitrary strings from the client.

### Required Data Before Event Becomes Configured
When saving a newly configured event, server validation requires:
- event category / event name;
- dynamic participant name(s) when required by category;
- event date;
- start time;
- venue name.

Address, Google Maps URL, end time, description, and notes may remain optional.

### Simple Form Structure
The editor is grouped into compact functional surfaces:

- `1 · Acara`
  - category
  - relevant name fields
- `2 · Waktu & tempat`
  - date
  - start/end time
  - WIB/WITA/WIT
  - venue
  - address
  - Google Maps
- `Tambahan opsional`
  - collapsed by default using native details/summary
  - description
  - notes

This keeps the most common flow visible without making the dashboard feel like a long landing-page form.

### Event List Actions
Each saved event card supports:
- `Edit acara`;
- `Buat undangan` when Digital Invitation has not been activated;
- `Studio` when the event already has active Digital Invitation access.

Canonical `Button` remains the only application button primitive.

---

## Data Model

### `Invitation.eventCategory`
Added:

```prisma
eventCategory String @default("OTHER")
```

A String is intentionally used for the first migration rather than replacing the legacy `InvitationType` enum. `InvitationType` remains for backward compatibility with existing routes/Studio while the product is being generalized.

### Migration
New migration:

`prisma/migrations/20260916190000_add_event_category/migration.sql`

The migration:
- adds `eventCategory` with default `OTHER`;
- backfills obvious existing Silver Wedding, Golden Wedding, Birthday, Baby Shower, and Wedding records based on current title/name data;
- keeps uncertain legacy events as `OTHER` instead of guessing their category.

Migration execution and Prisma Client regeneration are still required in deployment.

---

## API Changes

`app/api/invitations/route.ts` now:
- writes `eventCategory` for new Invitation rows;
- validates category through the shared event catalog;
- normalizes Indonesia timezone values;
- generates canonical display title based on category + names;
- validates couple vs single-name requirements server-side;
- requires date, start time, and venue when `eventConfigured: true`;
- keeps existing publish/payment authorization behavior;
- keeps legacy type and couple-slug compatibility behavior.

PostgreSQL/Prisma remains the source of truth.

---

## Affected Files
- `lib/events/catalog.ts`
- `components/Dashboard/EventPanel.tsx`
- `app/api/invitations/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260916190000_add_event_category/migration.sql`

---

## Commits
- `52a7f71700427e963cc23219e867c3be5875de1e` — add shared event category catalog
- `0b768dc836405d8d1374fa4e642b21c4dbf9079e` — add `Invitation.eventCategory`
- `ff272512707e83175db5c1db38d9b93e0ce1e5f7` — add event-category migration/backfill
- `f03a397d799e5ea70103ba19bfe2b4ac12acf15b` — add WIB/WITA/WIT catalog
- `52f1276a4f568dc4050d77472d345dc5ba60d0ff` — event-category API validation/title generation
- `be515327a78964e05717b320ae9778e1ef7251ee` — progressive interactive Rangkaian Acara editor

---

## Validation Status
- Build: not yet observed.
- Lint: not yet observed.
- CI: not yet observed.
- Prisma generate: not yet observed.
- Migration execution: not yet observed.

Do not treat this stage as deployment-verified until the actual CI/build and database migration have succeeded.

---

## Next Compatibility Work
The Invitation Studio still has wedding-specific content controls and preview assumptions. The new event taxonomy is now available as the source for the next Studio-generalization pass, but Studio was intentionally not rewritten in this change to keep this stage focused on Rangkaian Acara creation and data integrity.
