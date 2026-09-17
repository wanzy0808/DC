# DC Organizer

DC Organizer is an event-focused SaaS for Digital Invitation, RSVP, guest management, optional WA Blast distribution, and event-day guestbook/check-in operations. The product is not limited to weddings: each user can create as many event workspaces as needed and activate invitations per event.

## Product Model

### Digital Invitation
- Price: **Rp150.000 per event / invitation**.
- One activated event includes:
  - 1 Digital Invitation.
  - 1 invitation template.
  - Publication.
  - RSVP.
  - Guest management, including table/seating workflow where supported by the workspace.
- Event creation is not capped at three. Additional events are created and activated independently.
- Payment/entitlement is event-scoped; buying one invitation must not unlock every event on the account.
- Event data and invitation design may be prepared before payment. The intended lifecycle is:
  1. `Tambah acara`.
  2. Complete event details.
  3. Save the event to PostgreSQL.
  4. `Buat undangan` for that saved event.
  5. Select and edit a template in Invitation Studio.
  6. Save the template/design.
  7. Publish.
- Before Publish, a user may edit or delete their Rangkaian Acara. After `isPublished = true`, event details are locked: customer APIs reject event-detail edits, unpublish attempts, and event deletion, while unrelated Studio capabilities remain governed separately.
- The Digital Invitation package is required at the **Publish** step, not when creating the event or entering Studio.
- Unpaid Studio sessions are preview-only and may be watermarked. Public rendering remains server-authoritative and requires a configured event, a saved template, a published state, and valid event-scoped Digital Invitation entitlement.
- Wedding events may optionally store father/mother names for each partner. When present, invitation renderers automatically show a parent line such as `Anak dari Bapak Ahmad & Ibu Siti`; missing parent data is omitted instead of showing a placeholder.

### WA Blast Add-on
- WA Blast is **not included** in Digital Invitation.
- **50 WA Blast credits = Rp75.000**.
- Credits are attached to the selected active event.
- The add-on may be purchased repeatedly when more quota is needed.

### Event Planner
- Public service page: `/event-planner`.
- Legacy `/wedding-planner` remains a compatibility route and redirects to Event Planner.
- Consultation service types:
  - Wedding Organizer.
  - Wedding Planner.
  - Silver / Golden Wedding.
  - Baby Shower.
- Planner packages intentionally do not show fixed pricing; consultation is directed to WhatsApp `+62 821-2478-6516`.

### Guestbook Digital
Guestbook Digital remains the onsite operational service for QR check-in, Usher App, devices, and event-day support.

## Tech Stack

### Core & Framework
- Framework: Next.js App Router / Turbopack.
- Runtime: Node.js >= 22 LTS.
- Package Manager: pnpm >= 11.
- Language: TypeScript.

### Database & Infrastructure
- Database: PostgreSQL.
- ORM: Prisma ORM.
- Deployment: Hostinger VPS (Linux Server).
- CI/CD: GitHub Actions build validation.

### UI & Styling
- CSS Engine: Tailwind CSS v4.
- Component Library: shadcn/ui.
- Iconography: Lucide React.
- Canvas Engine: Konva / react-konva.
- Animation Engine: Motion via `motion/react`.
- Image processing: Sharp.

## Design System

- Brand: **DC Organizer**.
- Canonical wordmark implementation: `components/Brand/BrandWordmark.tsx`; the wordmark uses `--font-dc-heading` / Cinzel and must not be reinterpreted per page.
- Public navbar may show the existing marketing tagline; **dashboard headers use the DC Organizer wordmark only and do not show the tagline**.
- Logo / primary brand: Rose `#C07A84`.
- Supporting Rose: `#D9A3AA`.
- Deep hover / pressed Rose: `#A65E69`.
- Cinzel: display, headings, titles, branding.
- Fauna One: body copy and application UI.
- DM Mono: metadata, status, technical labels.
- Light background: `#FFFFFF`; primary text: `#111111`.
- Dark background: `#0B0B0C`; primary text: `#FFFFFF`.
- Rose is concentrated on meaningful accents, controls, selected states, links, and headings; page surfaces stay neutral.
- Canonical application button primitive: `components/ui/button.tsx`.
- Primary desktop header/content/footer containers target **80vw**; do not reintroduce fixed `1400px` page wrappers that waste wide-screen space.
- Dashboard chrome can span the viewport, while its customer workspace is capped by the available main pane to avoid sidebar-driven overflow.
- Beranda defines the canonical customer-dashboard visual language. Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gates, and reusable dashboard components must use the same neutral surface/card/table hierarchy rather than page-specific styling.
- Shared dashboard presentation primitives live in `components/Dashboard/DashboardPrimitives.tsx`; extend them for new workspace UI. Real tables/graphs are welcome when backed by actual application data, never filler/mock metrics.
- Customer-facing UI copy avoids decorative sequence numbering; use descriptive labels instead. Real numeric product data (dates, time, price, counts, capacity, quota, child order, metrics) remains visible.
- Public burger navigation omits Beranda/Home because the brand logo already returns home. Indonesian service labels are `Perencana Acara`, `Undangan Digital`, and `Buku Tamu Digital`; `Layanan` retains its submenu, `Masuk` and `Daftar` stay present, and `Layanan`/`Paket` use distinct icons.
- Burger navigation and auth surfaces intentionally use white controls with black text and a subtle border in both themes; Rose remains the accent. Registration keeps the close `X` unobstructed, with the `Masuk` switch below the form. `/login` follows the same neutral visual language and general-event wording.
- Landing uses the 80vw width as one integrated copy + Pintu composition. The copy may widen and extend downward, with a quote/proof block above a subtle divider and capability checks below it.
- Customer testimonials must be sourced from real customer feedback. Never publish invented names, quotes, ratings, or customer claims; use non-attributed brand/service statements until verified testimonials are available.

## Public Invitation Architecture

Invitation identity remains database-first through PostgreSQL/Prisma. Browser cookies/localStorage are not used as the source of truth for event identity.

The invitation root domain is configurable through `NEXT_PUBLIC_INVITATION_ROOT_DOMAIN`. The existing `dcwedding.com` fallback remains for backward compatibility until a separate domain migration is defined; new customer-facing product copy uses the DC Organizer brand and event terminology.

Legacy `/invite/[slug]` routes remain for internal routing/backward-compatible behavior where required by the application architecture.

## Engineering Principles

- **Extend Over Replace:** preserve existing routes, APIs, components, and data flows unless a deliberate migration requires otherwise.
- PostgreSQL/Prisma is the product source of truth; do not introduce mock invitation records.
- Authorization and entitlement checks are server-authoritative.
- Event-scoped guest/RSVP data must not leak or mix across invitations.
- `/dashboard`, Beranda, Pintu navigation, and protected Rose petals remain part of the product foundation.

## Getting Started

### Prerequisites
- Node.js >= 22.0.0
- pnpm >= 11.0.0
- PostgreSQL database

### Database migrations

Development migration:

```bash
pnpm db:migrate
```

Production/VPS migration after pulling a version that contains new Prisma migrations:

```bash
pnpm db:deploy
```

`pnpm build` / GitHub Build Validation does **not** apply PostgreSQL migrations. A deployment that updates Prisma schema-dependent application code must run `pnpm db:deploy` against the target production `DATABASE_URL` before the updated app is relied on. If the application returns a database-schema synchronization error while saving/loading events, apply the pending migrations on the server first.


## Documentation Governance

- `prd.md` remains the active product-requirement source of truth.
- `prd1.md` remains the chronological implementation changelog.
- `AGENTS.md` contains mandatory engineering/design rules for agent-made changes.
- When explicitly requested by the user, `prd-tambahan.md` may be maintained as a supplemental non-canonical delta log; it must not override `prd.md` or replace the required `prd1.md` implementation entry.
