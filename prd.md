# DC Organizer — Master Product Requirements Document (PRD)

**Document Status:** Master Source of Truth  
**Repository:** `wanzy0808/DC`  
**Brand:** DC Organizer

## 1. Product Definition & Vision

DC Organizer is a SaaS wedding platform centered around a Digital Wedding Invitation and a connected, real-time guest-management workflow.

Core lifecycle:

Wedding Setup → Invitation Creation → Publication → Distribution & Guest Roster → RSVP & Gift Tracking → Guest Management & Seating → QR Ticket → Wedding-Day Check-in → Usher App / Onsite Guest Book

**Positioning:** DC Organizer is not merely a digital invitation generator. It is an end-to-end digital wedding guest-management platform with Digital Invitation as the entry point.

## 2. Technical Stack & Development Principles

### 2.1 Stack
- Next.js App Router / Turbopack
- Node.js >= 22 LTS
- pnpm >= 11
- TypeScript
- Tailwind CSS v4 + Shadcn UI
- Motion via the existing `motion/react` package
- PostgreSQL + Prisma
- Sharp for image processing
- Konva / react-konva for interactive visual editing and seating
- Hostinger VPS + GitHub Actions

### 2.2 Core Principles
- **Extend Over Replace:** preserve working routes, APIs, UI, and data flows unless explicitly instructed.
- `/dashboard` and Beranda must remain.
- Brand-facing UI must use **DC Organizer**.
- Database is the single source of truth.
- New invitations must start empty; no fake/default couple data.
- Authorization is server-side and UI gates reflect server entitlements.
- Existing compatibility routes remain where required.
- Every material AI implementation change is recorded in `PRD-TAMBAHAN.md`.
- Never claim build/CI PASS without actual verification.

## 3. Design System & UI/UX

### 3.1 Typography
- **Cinzel:** display, headings, titles, branding, editorial elements.
- **Fauna One:** body/UI copy, navigation, forms, buttons.
- **DM Mono:** metadata, codes, timestamps, status and technical labels.

### 3.2 Light Theme
- Primary/action: Deep Rose Wood `#8C4A56`
- Brand accent: Dusty Pink `#E8B4B8`
- Hover: Dark Rose Wood `#6E3843`
- Main background: Warm White `#FAFAFA`
- Secondary surface: Pale Blush `#F5EBEB`
- Primary text: Charcoal `#1E1B1C`

### 3.3 Dark Theme
- Background: Obsidian Black `#0F0E11`
- Surface: Dark Charcoal `#1A181E`
- Accent: Dusty Pink `#E8B4B8`
- Primary text: `#F8F9FA`
- Secondary accent: `#F4C2C7`

Maroon, heavy cream/ivory backgrounds, and unrelated accent systems are deprecated. Readability has priority over color matching.

### 3.4 Layout & Accessibility
- Minimum interactive target: `44x44px`.
- Functional text remains primarily charcoal/light neutral according to theme.
- Rose Wood/Pink is selective accent only.
- Avoid decorative divider-heavy layouts and excessive glass/blur effects.
- Prefer hierarchy through typography, spacing, composition, and contrast.

### 3.5 Motion
- Use existing `motion/react`; no unnecessary animation dependency.
- Animate transform/opacity rather than layout properties.
- Natural easing: `[0.22, 1, 0.36, 1]`.
- Interactive spring: `stiffness: 400`, `damping: 25`.
- Use `whileInView` with `viewport.once` for section reveals.
- Use `useReducedMotion()` for accessibility.
- Motion must remain subtle, performance-first, and never obstruct usability.

### 3.6 Landing Navigation
The landing page uses the existing **Pintu** interaction as the visual navigation surface for:
1. Wedding Planner → `/wedding-planner`
2. Digital Invitation → `/d-invitation`
3. Guestbook → `/guestbook`

Pintu is a deliberate product-navigation interaction and must not be removed or bypassed without explicit instruction.

Rose-petal animation in `components/Layout/background.tsx` is a protected visual element and must not be altered without explicit instruction. Background ambience may be refined around it without changing the petals.

## 4. Package Monetization & Entitlements

Primary package states:
- `NONE`
- `DIGITAL_INVITATION` — Rp 300.000
- `GUEST_BOOK` — Rp 2.000.000

Digital Invitation includes invitation publishing, custom assets within limits, RSVP analytics/export, guest database, interactive seating, and QR ticket functionality. Guest Book adds onsite hardware/support and server-authoritative Usher check-in.

## 5. Onboarding & Core Data Architecture

### 5.1 Onboarding
Required inputs:
- `groomName`
- `brideName`
- `firstName`

System creates/ensures WEDDING and linked EVENT_KHUSUS records and stores the dashboard nickname in `User.firstName`.

Couple names are canonical onboarding data and remain consistent across WEDDING and special events. Couple names are read-only in downstream event editors where required by the PRD.

No mock names such as Rio/Lyvia and no mock venue defaults are permitted.

### 5.2 Public Canonical URL
- Main Wedding: `https://[nama-pasangan].dcwedding.com/`
- Event Khusus: `https://[nama-pasangan].dcwedding.com/[nama-event]`
- Event path is derived from `Invitation.title` using `slugifyEvent()`.
- `proxy.ts` routes tenant/event requests to the internal invitation route.
- `/event-khusus` remains a compatibility alias when needed.
- `/invite/[slug]` remains an internal/backward-compatible route.

Password protection applies consistently to the root invitation and event paths for the same tenant.

## 6. Feature Specifications

### 6.1 Global Navigation
- Brand: DC Organizer.
- Subscription status and theme switch.
- User menu with accessible, high-contrast controls.
- Dashboard sidebar preserves existing product modules.

### 6.2 Dashboard Modules
- Beranda
- Rangkaian Acara
- Undangan Digital workspace at `/dashboard/undangan-digital`
- RSVP analytics
- Manajemen Tamu
- Guest Book / Usher App
- Studio at `/dashboard/editor`

### 6.3 Invitation Studio
- WEDDING and ADAT_AKAD / Event Khusus deep links.
- Database-backed event data.
- Server-side custom asset entitlement.
- Maximum 30 photos + 1 custom music track where package permits.
- Preview, Maps/address, decoration editing, undo/redo.
- Studio is not the source of truth for core event data.

### 6.4 RSVP & Guest Management
- RSVP metrics, filters, search/sort, CSV export.
- Guest management follows DIGITAL_INVITATION entitlement.
- Manual guests and RSVP guests are distinguished with `GuestSource`.
- Seating roster contains manual guests or RSVP guests with `ATTENDING` status.
- QR ticket generation and server-authoritative check-in are retained.

### 6.5 Seating Builder
- Konva-based interactive 2D seating chart.
- `Guest.seatNumber Int?` with `@@unique([tableId, seatNumber])`.
- Floor-plan generator: 1–100 tables, 1–50 seats per table.
- Drag unseated guest to empty seat → server PATCH.
- Move seated guest → server PATCH.
- Occupied seat → explicit Swap/Cancel confirmation.
- Swap → atomic Prisma transaction through `/api/guests/[id]/swap`.
- Guest/seating mutation always resolves the owner's WEDDING invitation.

### 6.6 Event Details
- Couple names are read-only from canonical onboarding data.
- Editable: event name, date, timezone, time, venue, address, Maps, description, notes.
- Indonesian timezones use 24-hour time with WIB/WITA/WIT.
- International locations may use AM/PM.

## 7. Implementation History

### 2026-09-12
- Invitation password protection: `fc11e21`, `cc99458`, `cdba01f`.
- Canonical event-name routing: `46828c0`, `663fc9c`, `3f775e1`, `22e0dc9`.
- Guest-management entitlement alignment: `e72f8f7`, `a17a4b4`, `25282fe`.
- Digital Invitation workspace: `f8ad75f`, `94e665b`.
- Guest seat persistence/API: `adeb575`, `6bf1ee3`, `2dfd0d2`.
- Konva seating: `58d8c48`, `bca7647`, `8163483`.
- Seating roster/manual guests: `ab9446c`, `213c013`, `927a289`.
- Seating floor-plan generator: `522e53b`, `b39148d`.
- Seat swap: `eed3db4`, `38e058f`, `feb720a`.
- WEDDING invitation resolution: `3206aa4`, `4c7b851`, `beaebcd`.

### 2026-09-13
- Brand/rebranding alignment and visual system refresh.
- Dashboard visual override layer and root layout loading.
- Landing page, public navbar, and submenu redesign.
- Landing motion uses existing `motion/react` and reduced-motion support.
- Pintu remains the landing navigation interaction.
- Ambient landing background refined to reduce blurry pink-circle treatment while keeping rose petals unchanged.

Detailed implementation rationale and validation remain in `PRD-TAMBAHAN.md`.

## 8. Definition of Done

### Dashboard & Studio
- Edit Design opens Studio with correct `?type=` context.
- Studio Back returns to `/dashboard/undangan-digital`.
- Existing entitlement and server-side authorization remain authoritative.

### Event Details
- Indonesian time displays in 24-hour format with WIB/WITA/WIT.
- Couple names remain identical across WEDDING and Event Khusus.

### Seating
- Empty-seat placement persists `tableId` + `seatNumber` server-side.
- Occupied-seat drop requires explicit Swap/Cancel.
- Swap is atomic and collision-safe.

### RSVP
- Search, status filters, and sorting update guest data without requiring a full page reload.

### Documentation
- Every material implementation change is recorded in `PRD-TAMBAHAN.md`.
- Build/CI status is only marked verified when an actual run/result exists.
