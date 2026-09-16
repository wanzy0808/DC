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

### Progressive Form Flow — Historical First Pass
The first implementation of `components/Dashboard/EventPanel.tsx` used this flow:

1. Page initially displayed the existing event list.
2. `Tambah acara` opened a clean new-event form.
3. No database draft record was created just by opening the form.
4. User chose event category.
5. Relevant name field(s) appeared.
6. User completed date/time/location.
7. `Buat acara` created the Invitation record and saved it as configured.
8. Existing event used `Edit acara` and `Simpan perubahan`.
9. `Tutup form` returned to the event list without adding another empty draft.

**This specific no-draft-on-click behavior is superseded by the Database Draft Creation pass below.** It remains documented here as implementation history only.

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
Each configured event card supports:
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

## 2026-09-16 — Database Draft Creation on `Tambah acara`

### Requirement correction
The product requirement was clarified: clicking `Tambah acara` must create a real event record immediately. The prior behavior where the button only opened a local form is no longer current behavior.

### Current behavior
`components/Dashboard/EventPanel.tsx` now:

1. User clicks `Tambah acara`.
2. UI immediately sends `POST /api/invitations`.
3. PostgreSQL/Prisma creates an `Invitation` draft row with:
   - unique event slug;
   - `eventConfigured = false`;
   - `eventCategory = OTHER` as storage default;
   - empty title/participant/location fields;
   - WA quota default 0.
4. Returned database `id` becomes the active editor record.
5. Form opens only after the database draft exists.
6. The editor displays the database event ID as technical metadata.
7. User selects the event category and completes the event data.
8. `Simpan acara` performs `PUT /api/invitations` against that existing draft ID and switches `eventConfigured` to true after validation succeeds.

### Draft visibility
Database drafts are no longer hidden from the Rangkaian Acara list.

A draft card shows:
- `Draft acara`;
- `Belum dilengkapi`;
- `Draft` status;
- `Lengkapi acara` action.

This makes it explicit that the event already exists in the database even before its required fields are completed.

Draft events do **not** enter event-scoped RSVP / Manajemen Tamu selectors because those workspaces continue filtering on `eventConfigured`.

### Rationale
The database is the source of truth. Creating the draft on the click event gives every user-created event a persistent ID immediately, which is useful for later payment, Studio, upload, invitation, and event-scoped operations.

---

## 2026-09-16 — Event-Centric Invitation Studio

### Goal
Remove the assumption that every Studio session is a wedding or Akad/Sangjit workflow. Studio must edit the selected event record and render its category correctly.

### Event-scoped loading
`components/InvitationStudio/InvitationDesigner.tsx` now prioritizes `invitationId` from the Studio URL.

Example:

`/dashboard/editor?type=WEDDING&invitationId=<event-id>`

The `type` query remains only as legacy fallback compatibility. When `invitationId` exists, the Studio loads the exact Invitation row rather than switching between global `WEDDING` and `ADAT_AKAD` tabs.

### Removed wedding-only type tabs
The old Studio tabs:
- `Undangan Pernikahan`;
- `Akad & Sangjit`;

are removed from the active Studio UI.

The Studio header instead shows:
- event category;
- event title;
- selected template.

### Preview identity by event category
Studio preview now uses `Invitation.eventCategory`:

- Pernikahan / Silver Wedding / Golden Wedding:
  - renders two participant names and `&`.
- Ulang Tahun:
  - renders one primary name.
- Baby Shower:
  - renders one family/baby label.
- Event Lainnya:
  - renders the event title.

Birthday, Baby Shower, and Event Lainnya no longer show `Nama Pria`, `Nama Wanita`, or `The Wedding`.

### Generic event timing
Preview timing now uses generic labels:
- `Mulai`;
- `Selesai`;
- WIB/WITA/WIT from the event timezone.

It no longer assumes `Akad` and `Resepsi` for every event category.

### Synced event content
Core event data is treated as read-only inside Studio and comes from Rangkaian Acara:
- event title;
- participant/name identity;
- date;
- time;
- venue;
- address;
- maps;
- description;
- notes.

Studio saves only invitation-design/content fields that belong in Studio, including:
- template design key;
- event tag/hashtag compatibility field;
- dress code;
- music.

The legacy database field `weddingHashtag` is temporarily retained as storage for the generic `Tag / hashtag acara` input until schema cleanup is defined.

### Studio visual/system cleanup
- obvious Studio actions now use the canonical `Button` primitive;
- event Studio shell uses semantic DC Organizer background/border/primary tokens instead of wedding-maroon shell colors;
- font sample text changed from `The wedding invitation` to `Digital invitation`;
- Studio top shell now says `Invitation Studio` and returns to `/dashboard`.

Invitation-template palettes remain dynamic because those colors belong to invitation content itself, not the application shell.

---

## Affected Files
- `lib/events/catalog.ts`
- `components/Dashboard/EventPanel.tsx`
- `app/api/invitations/route.ts`
- `components/InvitationStudio/InvitationDesigner.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `prisma/schema.prisma`
- `prisma/migrations/20260916190000_add_event_category/migration.sql`

---

## Commits
- `52a7f71700427e963cc23219e867c3be5875de1e` — add shared event category catalog
- `0b768dc836405d8d1374fa4e642b21c4dbf9079e` — add `Invitation.eventCategory`
- `ff272512707e83175db5c1db38d9b93e0ce1e5f7` — add event-category migration/backfill
- `f03a397d799e5ea70103ba19bfe2b4ac12acf15b` — add WIB/WITA/WIT catalog
- `52f1276a4f568dc4050d77472d345dc5ba60d0ff` — event-category API validation/title generation
- `be515327a78964e05717b320ae9778e1ef7251ee` — progressive interactive Rangkaian Acara editor first pass
- `83ef248c138c9a435982cd2a1e9ec5f9db0b356b` — persist event draft when `Tambah acara` is clicked
- `63a73da49ac033cf42eeb648686aa7fc6f914ea9` — generalize Invitation Studio for event categories
- `dfb2d54e42a617c222cf0d87bf7d53c5ead46fe9` — align Studio shell with event-based flow

---

## Validation Status
- Build: not yet observed.
- Lint: not yet observed.
- CI: not yet observed.
- Prisma generate: not yet observed.
- Migration execution: not yet observed.

Do not treat this stage as deployment-verified until the actual CI/build and database migration have succeeded.

---

## Remaining Compatibility Work
- Public renderer `FigmaClassicTemplate` and some legacy templates may still contain wedding-specific visual/content assumptions.
- Legacy schema names `groomName`, `brideName`, and `weddingHashtag` remain for backward compatibility and should be migrated only after a dedicated data migration plan exists.
- Invitation template catalog descriptions still contain some wedding-oriented copy even though Studio identity/preview behavior is now event-category aware.
