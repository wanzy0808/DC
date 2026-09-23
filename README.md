# DC Organizer

DC Organizer is an event-focused SaaS for Digital Invitation, RSVP, guest management, optional WA Blast distribution, and event-day guestbook/check-in operations. The product is not limited to weddings: each user can create as many event workspaces as needed and activate invitations per event.

## Approved Landing Page

As approved on 21 September 2026, `/` renders the unchanged `/pagecontoh` experience through `app/page.tsx` re-exporting `app/pagecontoh/page.tsx`. The preview route remains available for visual comparison. The current landing is the canonical reference for subsequent public marketing styling; **do not modify approved content, assets, interactions, layout, animations, controls, or other pages unless the owner explicitly requests that specific change**. Reuse existing components and dependencies before adding new ones.

The current scene consists of the continuous floral background and animated petals, rounded main frame, embedded Navbar/Footer, orbiting Three.js doors, two transparent cloud-copy elements with an outer Rose outline and puzzle/letter-reveal animation, bilingual text, theme controls, audio player, and Instagram link. The main implementation lives in `app/pagecontoh/page.tsx`; related pieces live in `components/Landing/`, `components/Layout/`, `components/Theme/`, and `components/I18n/`. Existing UI stack: Next.js, React, TypeScript, Tailwind CSS, Motion (`motion/react`), Three.js/React Three Fiber where already used, and shared UI components. Preserve the exact currently approved visual implementation rather than treating this description as a redesign specification.

Follow the scoped-change and validation contract in `AGENTS.md` and the canonical landing requirement in `prd.md`. The separate `/pintu-lab` GLB experiment is not the approved homepage door implementation.

## Landing door navigation: one door, then Rose light

The three/four existing selectable service doors remain unchanged on the approved landing. After a visitor presses `Masuk`, the existing camera zoom continues toward the selected open doorway, its inner service-image plane fades into plain Rose light, and the shared image-free Rose veil takes over during the zoom before the destination route is shown. The camera stops just before the flat portal plane instead of passing behind it and revealing other orbital doors; there is no second door asset or repeated door illustration in the transition. The `/d-invitation`, `/event-planner`, `/guestbook`, and `/undangan-fisik` destinations and the shared sound/reduced-motion behavior remain as before. This is limited to the active landing `SimpleDoorLab.tsx` navigation, not the GLB rebuild in `/pintu-lab`.

## Framed public template gallery

The public `/template-design` gallery uses the same frame and visual language as the approved landing and `/d-invitation`: centered 90vw Rose-bordered marketing shell, shared embedded Navbar and Footer, one public floral/petal atmosphere, and a scrollable inner catalog targeting 80vw on desktop. Root-layout Navbar/Footer, ambience and floating music/Instagram controls are suppressed on this framed route to avoid duplicate chrome; the footer inside the frame displays the existing persistent marketing audio controls and Instagram link. Interactive previews remain overlay dialogs outside the scroll-clipped frame. Light/dark and ID/EN follow the shared providers. This scoped gallery update does not alter the approved landing, Pintu or `/d-invitation` layouts.

## Digital Invitation marketing layout and Studio entry

`/d-invitation` uses one responsive content column (88% mobile, 80vw from `sm`, maximum 1100px) from Hero through FAQ, plus consistent section gaps (80px mobile / 96px desktop) without stacked Hero bottom padding. Its Design Studio text/CTA pair remains grouped closely around the center inside that shared column and the `Masuk Studio` / `Enter Studio` arrow CTA opens `/studio` rather than always landing on Dashboard home. `/studio` is an authenticated event-aware entry: with one configured event it enters that invitation's editor, with multiple events it prompts the user to choose, and with no event it offers event creation before Studio can open. A valid owned `invitationId` remains required. The package card on this marketing route uses a rounded Rose outline; the shared FAQ accordion uses rounded Rose-outlined cards and question triggers for all FAQ content. All marketing transitions, the approved landing/Pintu and invitation renderer behavior remain unchanged. `components/DigitalInvitation/MarketingTextReveal.tsx` observes headings/paragraphs/list text against the framed page\'s inner scroll panel and animates gentle opacity/vertical motion. Individual text replays when it leaves that visible panel and returns from either direction, rather than replaying while still visible; FAQ answers added by opening a row are supported. Buttons/phone previews are excluded and reduced-motion preferences are honored. The ID/EN strings and customer-facing copy are unchanged.

## Event Planner framed public page

The public `/event-planner` route now shares the approved framed marketing layout with `/d-invitation`: a Rose-outlined viewport frame, embedded navbar and footer, a single shared floral/petal atmosphere with gentle radial glow, and a scrolling middle panel. Public root layout/navigation/footer/floating-control guards treat Event Planner as a framed route, so no background/music/Instagram or navbar/footer layers are duplicated. The content column uses 88% mobile / 80vw from `sm`, capped at 1100px, with 80px/96px section spacing. Founder, services, portfolio, package, review, FAQ, and consultation content and links are unchanged; card styling follows rounded Rose outlines. Event Planner section reveals replay soft opacity/vertical motion after leaving the inner scroll panel and re-entering, complemented by the shared repeatable text reveal, with reduced motion respected. Its video dialog is portaled to `document.body` so it opens above the clipped frame without changing the video button behavior.

## Three featured invitation templates on /d-invitation

The marketing collection on `/d-invitation` displays up to three READY templates rather than the entire catalog. The public `/api/templates/featured` endpoint aggregates paid Digital Invitation entitlements per invitation and ranks templates by the event's currently selected `templateKey`, counting each paid event once. Empty spots are filled with randomized ready templates; with no sales (or if the aggregation endpoint is offline), three ready templates are selected randomly without making sales claims. Template assignment can change after purchase, so the current metric is paid-event adoption rather than an immutable historical template-at-purchase sales report. No user or order records are exposed. Each card uses a slim 9:19.5 smartphone frame with bezel, notch and a lazy-loaded real preview, matching the Hero's phone proportions. The "Lihat semua template" link still opens the entire shared `/template-design` catalog; no changes to catalog/Studio eligibility.

## Ten visually distinct invitation themes (5 with photos / 5 photo-free)

The shared catalog declares ten active built-ins. Five use event-scoped photo slots: Romantic Rose, Eternal Blossom, Modern Maroon, Garden Light and Midnight Romance. Five are entirely photo-free: Botanical Ivory, Classic Pearl, Golden Art Deco, Paper Cut Botanical and Celestial Ink. Seven original template keys remain stable for invitation compatibility; three new themes are added to the existing manifest. A photo-free theme is art-directed through real typography/illustration and does not render customer photos or expose unused photo-slot upload controls; previously uploaded images stay stored on the event if the customer changes themes.

Each template has its own recognizable folded digital envelope, Cover/Hero treatment and section ornaments/layout, while the same shared invitation data and 13 semantic section contract remain in force. `components/PublicInvitation/InvitationThemeScenes.tsx` supplies the nine distinctly designed non-Romantic Rose entry/cover compositions, and `UniversalInvitationTemplate.tsx` keeps shared functionality and themed section layouts in one place. Romantic Rose maintains its existing dedicated renderer. Public `/template-design` supports Dengan foto/Tanpa foto filters and actual lazy template-scene thumbnails; Studio's template selector uses those live scenes too. Do not revive Unsplash demo URLs or duplicate business logic for each theme.

## Universal invitation renderer and local demo assets

Every ready built-in template now opens with an interactive digital envelope ("Buka Undangan"), followed by 13 semantic sections: Cover/Hero, Introduction/Greeting, Identity/Host/Couple, Event Detail, Date & Time, Gallery/Media, Countdown, Location/Maps, RSVP, Wishes, Gift/E-Angpao, Closing and Footer. The themed `components/PublicInvitation/UniversalInvitationTemplate.tsx` supplies the actual public renderer for six built-in themes; `RomanticRoseTemplate.tsx` retains its own presentation. `InvitationPreview.tsx` uses those same components in Studio and in the public gallery. Public invitation routes (main/per-event/personal) share `PublicInvitationRenderer.tsx`, with no separate template-specific APIs or database tables.

RSVP is functional only for actual published invitations (preview is non-submitting); the Wishes section is an honest informational state until the shared persistence API exists. RSVP/Wishes/Gift toggles remain optional and unavailable media, Maps URL or bank details are not fabricated. Photo roles and bank/venue/event data come from the customer's own invitation. Example card images and isolated preview photos use pre-existing local `public/couple.jpg`, `public/couple2.jpg`, `public/couple3.jpg` rather than Unsplash. The local assets are demo-only and never substitute for missing customer media.

## Shared invitation template catalog

`lib/templates/catalog.ts` is the **single registry for render-ready built-in templates** (including the Studio preset and preview/category metadata). `/api/templates` publishes that registry alongside published designer submissions as `ready: false` image previews. `lib/templates/use-template-catalog.ts` feeds the public gallery at `/template-design`, the marketing collection inside `/d-invitation`, and the authenticated Studio selection. Studio lists uploaded designer previews as disabled items and allows selection only for `ready: true` templates, so uploaded HTML/ZIP/JSON design packages cannot be mistaken for working invitation renderers. When a newly implemented template is registered once in the master catalog, all three surfaces pick it up automatically after deployment/refresh. Published designer uploads appear as preview-only entries without a code change; they require renderer integration before becoming usable templates.

Public visitors can explore all previews without an account. Choosing a usable template goes through `/dashboard` to login and event creation; `/dashboard/editor` is protected by the server-side Dashboard layout and requires an actual `invitationId`. The preview fixture in `data/templates/preview-invitation.ts` is gallery-only and never reads/writes customer invitation content.

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
- Wedding events may optionally store father/mother names plus each partner’s child order. Renderers use `Putra` / `Putri` wording such as `Putra pertama dari Bapak Ahmad & Ibu Siti`; missing parent data is omitted instead of showing a placeholder.
- Planned (not yet implemented): same-day wedding sessions for Akad Nikah / Pemberkatan Pernikahan / Prosesi Pernikahan and Resepsi, with guest-specific session invitations through Personal Invitation. Different calendar days require independent events and independently paid invitation packages. Refer to `prd.md` §5.7; the existing timing fields are NOT two wedding sessions.
- End time remains optional. Rangkaian Acara can explicitly choose `Tampilkan “- end” di undangan`; this persists through the existing `receptionTime` compatibility field as the internal `END` sentinel and renders as `- end` in Studio/public invitation output.

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
- Global application controls use pill-rounded geometry and Rose outlines across Light/Dark, sourced from `app/globals.css` (`--dc-control-radius`, `--dc-control-menu-radius`, `--dc-control-outline`), `components/ui/button-variants.ts`, `components/ui/input.tsx`, and reusable field/filter/dropdown classes in `components/ui/control-styles.ts`. Use those shared primitives for new controls rather than local radius/border styling. Native select option popups are browser/OS-owned; use custom accessible dropdowns if their popup and individual options need a rounded look. Keep approved navbar/door, icon-only, invitation artwork, checkbox/radio and multi-line geometry where specialized.
- Primary desktop header/content/footer containers target **80vw**; do not reintroduce fixed `1400px` page wrappers that waste wide-screen space.
- Dashboard chrome can span the viewport, while its customer workspace is capped by the available main pane to avoid sidebar-driven overflow.
- Beranda defines the canonical customer-dashboard visual language. Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gates, and reusable dashboard components must use the same neutral surface/card/table hierarchy rather than page-specific styling.
- Dashboard screenshot revision (23 September 2026) supersedes the former neutral sidebar: customer rail and brand block use strong Rose with white navigation (deeper Rose in Dark Mode), distinct hover/active shades and selected-only curved-outside corners. The customer canvas is warm Rose-tinted with neutral cards. Public marketing/navbar/Pintu remain unchanged.
- Dashboard header controls follow the existing public landing-navbar control language instead of maintaining a Dashboard-only variant. Theme and language reuse the same shared components and styling as landing; the Dashboard burger mirrors the landing burger treatment, and the account trigger uses the same restrained transparent/bordered Rose-accented control language.
- Customer Dashboard supports Light + Dark mode through the shared theme provider and Indonesian + English through the shared language provider. Indonesian is the default when no locale preference exists; theme/language controls remain accessible in the Dashboard header.
- Digital Invitation payment does not hide RSVP, Guest Management, or Personal Invitation preparation pages. Users can explore and prepare those workspaces before Publish; Digital Invitation payment is enforced on Publish. WA Blast quota and Guestbook/Usher retain their separate entitlements.
- Dashboard page introductions reuse `DashboardPageHeader` from Beranda; mobile workspaces use 16px side gutters and desktop workspaces target 80vw capped by the available pane. Native checkbox/radio controls are excluded from text-field styling.
- WA Blast is nested under Acara/Events, labeled simply WA Blast; its separate quota purchase remains unchanged.
- Operational content uses `DashboardPanel` for Beranda-style separated card headers and consistent body spacing. Invitation and WhatsApp recipient lists use the same table language as Beranda.
- Shared dashboard presentation primitives live in `components/Dashboard/DashboardPrimitives.tsx`; extend them for new workspace UI. Real tables/graphs are welcome when backed by actual application data, never filler/mock metrics.
- Customer-facing UI copy avoids decorative sequence numbering; use descriptive labels instead. Real numeric product data (dates, time, price, counts, capacity, quota, child order, metrics) remains visible.
- Public burger navigation omits Beranda/Home because the brand logo already returns home. Indonesian service labels are `Perencana Acara`, `Undangan Digital`, and `Buku Tamu Digital`; `Layanan` retains its submenu, `Masuk` and `Daftar` stay present, and `Layanan`/`Paket` use distinct icons.
- Burger navigation retains its existing geometry/animation and neutral control surfaces with **Rose labels/icons** in both themes. Login/Register are locked to white popup surfaces with a slight pink/Rose glow and dark text in both themes, Rose outlines, shared pill controls, and matching typography. Registration keeps the close `X` unobstructed, with the `Masuk` switch below the form. Do not restyle the burger or auth dialogs as a side effect of unrelated content work.
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

## Repository Structure

The repository uses a feature-first component structure so files remain easy to locate as the product grows.

- `app/` — routes, layouts, and API endpoints; route names follow public/internal URL contracts.
- `components/DigitalInvitation/` — Digital Invitation marketing/product UI.
- `components/EventPlanner/` — Event Planner public UI.
- `components/Guestbook/` — Guestbook public UI.
- `components/Landing/Pintu/` — landing Pintu navigation components.
- `components/Dashboard/` — customer dashboard workspaces and shared dashboard primitives. Event editing uses `EventPanel.tsx` for orchestration/API mutations, with adjacent `event-panel-types.ts`, `event-panel-helpers.ts`, and `EventFields.tsx` for contracts, pure helpers, and field controls. Seating remains a cohesive `SeatingChart.tsx` editor with adjacent `seating-chart-types.ts` and `seating-chart-geometry.ts` for contracts and pure canvas geometry. Personal Invitation uses `PersonalInvitationPanel.tsx` for event-scoped orchestration, `PersonalInvitationPanels.tsx` for create/list presentation, and `personal-invitation-types.ts` / `personal-invitation-helpers.ts` for contracts and pure helpers. WA Blast uses `WhatsAppBlastPanel.tsx` for selection, quota and mutations, `WaBlastPanels.tsx` for recipient form/queue display, and `wa-blast-types.ts` for contracts.
- `components/Usher/` — day-of-event guest check-in feature. `UsherWorkspace.tsx` owns orchestration; `UsherPanels.tsx`, `config.ts`, `types.ts`, and `utils.ts` hold presentation, navigation config, domain types, and QR helpers.
- `components/InvitationStudio/` — active invitation editor/studio components. `InvitationDesigner.tsx` owns orchestration; `DesignerPanels.tsx` contains controls; `InvitationPreview.tsx` renders the canvas; adjacent `designer-*` modules hold types/config/state helpers. Guest management follows the same pattern with `GuestManagement.tsx` as orchestration and adjacent `GuestManagementPanels.tsx`, `guest-management-types.ts`, and `guest-management-client.ts`. RSVP follows the same boundary with `RsvpForm.tsx`, `RsvpPanels.tsx`, `rsvp-helpers.ts`, and `rsvp-types.ts`.
- `components/Payments/` — checkout/package-selection UI.
- `components/Layout/`, `Brand/`, `Theme/`, `I18n/`, `Marketing/`, `ui/` — shared/global presentation concerns. Theme state lives in `ThemeProvider.tsx`, while `ThemeToggle.tsx` is the canonical control.
- `data/services/` — static service-facing content/catalog copy only.
- `data/templates/` — static template showcase/presentation data used by template browsing UI.
- `lib/` — domain logic, server helpers, access rules, parsers, and infrastructure utilities. Focused helpers are grouped by domain, including `lib/auth/`, `lib/invitations/`, `lib/security/`, `lib/usher/`, and `lib/notifications/`. Conventional high-fanout entry points `lib/auth.ts` and `lib/prisma.ts` remain at the root.
- `prisma/` — schema and migrations.

Naming rule: use semantic names instead of temporary version suffixes. Once a replacement is canonical, keep one active component name such as `InvitationDesigner.tsx` rather than maintaining `V2`/`V3` files.

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

- `prd.md` is the single product-requirement source of truth and contains consolidated implementation history in Appendix A.
- `AGENTS.md` contains mandatory engineering/design rules for agent-made changes.
- Do not create or revive split PRD/changelog files for normal work. If the owner explicitly requests `prd-tambahan.md`, it may be maintained only as a supplemental non-canonical delta log; `prd.md` remains authoritative.

## Left-side mini-door navigation

The public marketing routes `/`, `/pagecontoh`, `/event-planner`, `/d-invitation`, `/guestbook`, `/undangan-fisik`, and `/template-design` share `components/Layout/MarketingDoorNavigator.tsx` through `app/layout.tsx`. A compact Rose mini-door at the left edge opens a descriptive, bilingual destination picker. The active page is marked, and Escape, outside click, or the close button dismisses the panel. On small screens it opens above the trigger and its list scrolls independently. Normal marketing route links reuse the existing image-free Rose `PortalTransition`. The widget does not render on Dashboard, Studio, customer invitation pages, or the separate `/jiplak` experiment; it does not alter the primary landing doors.


## Guestbook & Printed Invitation framed marketing pages

`/guestbook` and `/undangan-fisik` now share the approved public marketing viewport layout: 90vw Rose frame, embedded Navbar/footer, one floral/rose-petal background, fixed audio/Instagram controls in the compact frame footer, and a scrollable middle panel with a responsive centered content column capped at 1100px. Both reuse `EventPlanner/ScrollReveal` and `DigitalInvitation/MarketingTextReveal` with an inner-scroll root for repeatable section/text entrances; reduced-motion disables the reveal. Guestbook retains interactive feature tabs, package, reviews, and FAQ. Printed invitations retain the illustration, steps, in-panel process/consultation anchors and WhatsApp CTA. The global layout suppresses duplicate chrome/ambient effects on both framed routes. No changes were made to the approved landing Pintu or customer invitation renderer.


## Music on every invitation template

All ten render-ready invitation themes use a shared default-song registry in `lib/templates/music.ts`, pointing to MP3 files already present in `public/`. Each event's saved music URL or owned AUDIO upload takes precedence. Shared `components/PublicInvitation/InvitationMusic.tsx` mounts one looped audio element independently of the digital envelope and shows an accessible floating play/pause button after opening. On public invitations, opening the envelope is the user gesture that starts playback where the browser allows it; if playback is blocked, the visitor can tap Play. Gallery cards and Studio previews remain silent until the visitor explicitly plays a song. Opening/closing different previews stops other template tracks, and the marketing soundtrack is paused while invitation preview audio plays. The Music panel in Studio shows the current template's default and previews unsaved custom URLs/uploads. This behavior is shared by the Romantic Rose and Universal renderers; no new database field or extra audio upload is required. The bundled tracks' public/commercial usage rights must be confirmed before production distribution.


## Login and registration styling

`/login` uses a centered responsive Rose-outlined form matching the public site in both themes, with shared card/header/label/input/password-toggle/separator/link/submit tokens from `components/Auth/auth-styles.ts`, an accessible show/hide password control, and ID/EN labels through LanguageProvider. The navbar's existing Register dialog deliberately mirrors the same card header, spacing rhythm, Google action, fields, password toggles, CTA and secondary links, while retaining a scrollable mobile-friendly modal and Terms/Privacy consent. The marketing/public burger's Masuk and Daftar actions now open the same root-mounted dialog directly, without leaving the page; selecting Masuk ↔ Daftar switches dialog content without stacking modals. `app/login/page.tsx` preserves old `/login`, `/login?register=1`, protected-route redirect and OAuth-error links by redirecting to `/?auth=login|register&next=...` and letting the shared dialog host open the matching mode. Registration success switches to Login with a verification-email notice. The register dialog is vertically centered by removing the accidental `relative` override on the shared card (which previously beat `DialogContent`'s fixed position); compact desktop spacing and internal `dvh`-bounded scrolling keep the full form reachable. The auth backdrop and popup also use scoped higher layering so they cover the floating marketing mini-door while an auth modal is open; unrelated dialogs keep their existing stacking order. Auth APIs, existing Google route, redirect roles and invitation entitlements are unchanged. `PublicContent` only allows full responsive width for the /login route; marketing chrome and approved landing remain untouched.


### Burger visual restored, auth dialogs use landing ambience (22 September 2026)

The burger menu's original layout, icon sequence, item spacing, styles and motion are unchanged. Its item labels/icons now explicitly use Rose `text-primary` in both themes; the old `text-foreground`/`dark:text-foreground` classes were hiding this, and Daftar also inherited conflicting dark text from the shared button base. The Login entry keeps the same styled `Link` markup and intercepts activation to show the root login dialog; Daftar retains the shared `Button` component instead of a native button. The popup/dropdown itself and unrelated pages were not redesigned. The two shared auth dialogs use a **white surface in both Light and Dark modes** with only a very subtle Rose radial glow (not theme-dependent `bg-background/90`), plus a translucent Rose-tinted overlay that leaves the existing landing florals/petals visible behind the modal. Body copy, field inputs, helper text and Google button explicitly retain readable dark text on that white surface in Dark Mode. No second petal/flower background is mounted, and dark mode follows existing theme tokens. `components/Auth/auth-styles.ts` and the two auth dialog components own these surfaces; the core burger container in `Navbar.tsx` remains unchanged.


## Public privacy policy and approved UI freeze (22 September 2026)

The existing burger menu and Login/Daftar popup visual baseline is frozen at the owner's request. All burger labels/icons remain Rose without changing layout, behavior, or motion; both auth dialogs remain white with a subtle pink glow, dark readable form text, and existing accessibility in Light/Dark. Legal content changes must never accidentally alter `Navbar`, `BurgerMenuContent`, shared auth styles, or the login dialog.

`app/privacy-policy/page.tsx` serves the owner-provided DC Organizer Privacy Policy at `/privacy-policy` (Indonesian plus English translation via existing locale switch). The previous brand name in the supplied copy was replaced with DC Organizer. The Privacy Policy term in the registration consent is now a genuine link opening a new tab, keeping the form and checkbox state intact; existing standard public footer privacy labels link to the same page without redesigning the footer. The Terms & Conditions label now links to `/terms-and-conditions` in a new tab; both legal links preserve the registration form and checkbox state. Before production, confirm this supplied policy's operational and legal representations—including any automatic technical-data collection, data-processing vendors and their contract terms, non-sale/rental statement, and one-day change notice—match DC Organizer's actual systems and obligations. No legal compliance is implied by publication alone.


## Public Terms & Conditions (22 September 2026)

`app/terms-and-conditions/page.tsx` publishes an ID/EN DC Organizer terms draft at `/terms-and-conditions`, following the owner-supplied source document's topical sequence: general terms; definitions; account/use; user content; service fees; availability/warranties; liability; intellectual property; privacy; partner commissions where separately offered; and other provisions. The source document described another company's operations, so this is **not** a blind brand substitution. It deliberately excludes that company's identity/address/email/domain, broad perpetual IP and moral-rights waivers, an unverified exact minimum age, and the unconfirmed 1–3-business-day partner commission withdrawal promise. User-owned media remains theirs, with only the operational rights needed to deliver their configured service; paid packages and optional partner terms refer to the actual relevant offering or agreement. The document requires owner/legal review against actual DC Organizer operations before being used as a final commercial contract.

The pre-existing Terms & Conditions label inside the registration consent now opens the actual route in a new tab, matching Privacy Policy and preserving the form, and the existing public footer terms label now points to the route. These changes do not touch the locked burger/login/register styling, auth endpoints or landing doors; the terms page uses the same standalone legal-page layout as `/privacy-policy` and does not introduce duplicate marketing decoration.


## Landing image-loading failure guard (23 September 2026)

The four approved 3D marketing doors still reference their original local image assets: `/eventplanner.png`, `/Idigi.png`, `/guestbook.png`, and `/Ufisik.png`. `SimpleDoorLab.PortalWorld` now handles image-load failures without throwing into the Canvas, keeping the existing plain Rose interior as fallback instead of taking down the landing. It restores the original service picture and fade/zoom behavior whenever the PNG loads successfully. Both `flower.png` renderers in `LandingFloralGlow` use explicit Next/Image dimensions with the same full-container positioning to avoid `fill`-parent sizing warnings. Neither change alters the approved door geometry, ambient animation, burger menu, Login, or Daftar.

If a portal image is still unavailable in a local browser, check `Test-Path .\\public\\eventplanner.png` and open `http://localhost:3000/eventplanner.png` (should return the actual image, not an error or HTML). GitHub `main` already contains the PNG; that does not prove it is present/valid in an unsynced local checkout. A `THREE.Clock` deprecation message is nonfatal and may originate from React Three Fiber internals; it is separate from the image-loading error, and no speculative dependency upgrade is included in this fix.


## Three.js Canvas warnings (23 September 2026)

The approved landing `components/Landing/Pintu/SimpleDoorLab.tsx` now sets `shadows={{ type: THREE.PCFShadowMap }}` rather than passing the `shadows` boolean to React Three Fiber. The boolean default in Fiber 9 can still select the removed `PCFSoftShadowMap` constant and emit repeated Three.js warnings on Canvas creation; the explicit supported mode leaves shadows enabled without changing the door mesh, lighting parameters, image selection or Rose navigation. The separate `THREE.Clock` deprecation may be emitted by Fiber's internal Canvas initialization, even if application code only reads its `state.clock.elapsedTime` in a `useFrame` callback. Do not suppress warnings globally or upgrade Three/R3F without testing all approved doors; monitor upstream fixes and validate the absence of the soft-shadow warning in the local GPU browser after sync. Successful Next.js route/API HTTP 200 and CI build do not themselves verify browser warnings or visual fidelity.



## Google sign-in setup and diagnostics (23 September 2026)

The existing Google action on both Login and Daftar uses a server-side authorization-code flow: `/api/auth/google` → Google → `/api/auth/google/callback` → user/session database → the role-appropriate area. This feature **requires per-environment OAuth credentials**; a successful production build or the presence of the Google button does not prove that the local/private setup is complete. The tracked `.env.example` intentionally contains blank placeholder values, not the operator's local secrets.

For local development, use an OAuth Client ID/Client Secret for **Web application** in Google Auth Platform and place these in your private `.env.local` along with `APP_URL="http://localhost:3000"`. In that same Google client, add `http://localhost:3000/api/auth/google/callback` exactly as an Authorized redirect URI. Open the app in the browser as `http://localhost:3000` (not its advertised LAN address `http://192.168.x.x:3000` when APP_URL and redirect registration use localhost), and restart `pnpm dev` after changing server env. Keep credentials out of chat, screenshots, logs, NEXT_PUBLIC_* variables, and git commits. Production must register the exact HTTPS callback for its own public domain. The Google token exchange happens on the server, and a real account/session additionally requires the local PostgreSQL database and schema to be ready.

Troubleshooting: `google_config` indicates that client credentials are unavailable on the server; `redirect_uri_mismatch` is Google's own error when its registered redirect URI does not exactly match the authorization request; `google_state` indicates the short-lived CSRF cookie did not survive or did not match (check same browser/site origin, cookie settings, and elapsed time); `google_denied` means the Google authorization was cancelled; `google_token` indicates token exchange failure (check client ID/secret pairing and callback configuration); `google_profile` means the API could not supply a verified email; `google_database` indicates account/session persistence failed (check PostgreSQL/Prisma). The auth callback now uses non-sensitive codes in the existing Login popup rather than treating every failure as the same generic error. A provider-side access restriction may depend on the configured app Audience/publishing state; check the exact Google screen rather than assuming the same cause for every failure. Do not assert end-to-end sign-in until it has been verified with the operator's actual credentials and browser; avoid touching the approved auth/burger appearance while troubleshooting.


## Landing cloud copy hierarchy (23 September 2026)

The two existing `CloudCopy` areas on `/` and `/pagecontoh` now have a clearer editorial hierarchy without changing their messages or illustration. The top-left opening cloud is slightly wider and has larger primary heading, eyebrow and description. The lower-right continuation remains visually secondary and has been raised away from the footer for better visibility; both clouds retain their original silhouette, Rose outline, letter-by-letter reveal, enter/leave motion, ID/EN strings and theme colors. Only `components/Landing/CloudCopy.tsx` was changed; the approved 3D doors, page frame, navbar/footer, florals, sound and Login/Daftar are untouched. Check the visual balance at real desktop/mobile viewport dimensions in both languages after syncing, particularly any crowding near the orbiting doors.


## Unified brand wordmark (23 September 2026)

`components/Brand/BrandWordmark.tsx` is now the only owner of the DC Organizer visual wordmark (brand name, Cinzel heading font, Rose color, tagline text and responsive size tokens). The approved larger `public` default applies in the shared Navbar on **all** public pages, not just the landing: brand 24px mobile, 34px from `sm`, 36px from `lg`; the optional tagline is 8px/9px/10px across those breakpoints. All public Navbar instances share `py-5 sm:py-4` to retain the approximate original header height; navbar background and controls are not redesigned. The standard public footer uses this same component instead of its previously separate manually styled `D C / ORGANIZER` text. Dashboard header and Usher header also import the component, using its `dashboard` or `mobile` size so it fits their tighter header, without marketing tagline. Any later global wordmark typography, wording or color change belongs in this component, not per-page CSS or copy. Existing logo links, auth/burger menus, Pintu, clouds, media/ambient animations and invitation branding remain independent and untouched; verify desktop/mobile fit in the owner's browser.


## Landing door hover and front/back scale (23 September 2026)

The active four-door `SimpleDoorLab` marketing landing keeps the same Rose doors, geometry, materials, service pictures, orbit paths/speed, selection, opening, sound and image-free Rose transition. Only unselected orbital scale changes: it now interpolates from `0.62` at the rear to `0.85` at the front, making the back slightly smaller and the foreground slightly more prominent. Hovering one unselected door adds a `1.10` multiplier via the same existing damped scale easing; moving off restores its orbital size. Hover scale is disabled during selection/entry and for reduced-motion users; the existing selected 1.12/other 0.70 scales remain unchanged. No hover highlight or second animation system was introduced. The code change is limited to `components/Landing/Pintu/SimpleDoorLab.tsx` and should be reviewed visually after sync for overlap/clipping at real desktop/mobile resolutions.


## Seamless Rose veil during door-to-page navigation (23 September 2026)

The shared `components/Landing/Pintu/PortalTransition.tsx` now uses a single fixed, full-viewport Rose radial-gradient surface (Light/Dark variants) that fades in and out through opacity only. The previous second scaled fullscreen glow and separately expanding circular clip could expose rectangular compositing seams while the camera zoomed into the door. The `dc-marketing-veil-in`/`dc-marketing-veil-out` keyframes in `app/globals.css` therefore only animate opacity; the independently scaled glow keyframes are removed. Cover/reveal timing, audio, route navigation, `dc-marketing-reveal`, reduced-motion handling, the approved landing door model/orbit/hover/opening/camera zoom, and destination puzzle assembly are untouched. Check the actual browser on both themes and both door and regular marketing routes after syncing; CI build does not prove GPU/compositor appearance, and a separate cause of any remaining square artifact should be diagnosed with a screenshot or short recording before altering the approved doors.


## Seamless Rose transition: frame body edge (23 September 2026)

A second source of rectangular seams was the existing *page frame itself*: the landing and the five framed marketing destinations use a 90vw translucent background, Rose border, shadow, and backdrop blur that can show through a semi-opaque fullscreen glow. Each route-level frame now has a styling-only `data-dc-marketing-frame` attribute, and shared CSS temporarily fades its decorative background/border/shadow/blur away while `PortalTransition` sets the root `data-dc-marketing-transition` attribute, restoring the approved frame after the veil finishes. Its position, dimensions, radius, overflow, interactive contents, navbar, footer, and route-specific layout stay unchanged; the regular landing and marketing views look the same outside the transition. This complements, rather than replaces, the existing single full-viewport Rose veil: it does not change the 3D door, zoom, hover, music, transition duration, navigation, or destination assembly. After syncing, visually test an entire door-to-page transition in both themes (and normal marketing link navigation); if any box remains, capture the specific video frame where it appears so its actual layer can be isolated rather than changing approved Pintu animation speculatively.


## Customer dashboard redesign (in progress)

Follow `Dashboard-redesign.md` for completed code stages, remaining workspace audit, and validation status. The dashboard now has a shared desktop/mobile `DashboardSidebar` with Rose curved-outside active/hover states, concise Beranda metrics from the existing API, and shared neutral dashboard primitives. These changes do not alter the approved public landing or its door/animation. This is not yet a full-dashboard visual approval; the per-workspace pass and build/browser checks remain pending.

**Latest dashboard visual pass (23 September 2026):** Based on the owner screenshot, the customer rail/brand block use stronger Rose, Light Mode canvas is #fff5f7, dashboard utilities visually follow the existing landing navbar, and Beranda now shows compact real-event actions alongside factual RSVP/publication summaries rather than a stretched blank events table. Source commits are on main; per-workspace polish and browser QA remain tracked in `Dashboard-redesign.md`.


### WA Blast message templates (23 September 2026)

Customer Acara → WA Blast includes invitation, RSVP reminder, event-day reminder and thank-you draft templates saved per owned paid Digital Invitation (up to 30/event). Five placeholders personalize the editor preview; copy is enabled only for a real selected recipient and, when a public URL is used, a published invitation. This feature does not send WA messages, schedule deliveries or spend quotas; recipient selection and addon credits remain the existing functionality. After syncing, **run `pnpm db:deploy` against your database** for `20260923110000_add_wa_blast_message_templates`. See `Dashboard-redesign.md` for limitations and QA.


## Framed Beranda and account profile (23 September 2026)

The authenticated customer `/dashboard` now has one landing-inspired Rose-outlined mainframe: the shared customer sidebar, navbar controls, and all active panels sit within a continuous responsive shell. The approved public landing/Pintu is untouched. Beranda still reads real event, invitation, guest and RSVP data.

Navbar account menu provides My Profile, Account Settings (password), transactions, packages, FAQ and sign out. `DashboardAccountPanel` edits the existing user name, uploads and displays a separate account avatar through `/api/profile/avatar`, and changes a password via `/api/profile/password` after validating the current password. Uploads are Sharp-decoded to user-specific WebP files and persisted as `User.avatarUrl`. Changing a password revokes previous sessions and issues a fresh current session; email is read-only in this initial iteration. Avatar files use the same local-disk upload pattern as existing invitation media; production storage must be persistent.

**After syncing:** run `pnpm db:deploy` on the intended database to apply `20260923115000_user_avatar_url` (as well as any pending prior migrations), then run `pnpm db:generate` if needed before building. Review GitHub Actions before declaring the build validated. Authenticated browser QA for photos/password and mobile frame remains pending.


### Dashboard mainframe correction — inner scrolling and landing palette

The first dashboard frame was allowed to grow with the whole page. The current `/dashboard` shell now matches the framed marketing page's viewport scroll model: a bounded responsive Rose frame (90vw/90dvh mobile, 23–27px inset on larger screens), a fixed-in-frame sidebar and header, and `dc-dashboard-scroll` as the sole vertically scrolling customer content panel. Mobile drawer/scrim stay within the frame, and changing dashboard tabs resets inner scroll position. Light surfaces and sidebar are white; Dark surfaces and sidebar are near-black; Rose is visible in borders, text, focused/selected controls, hero accents and key buttons. Approved public landing/Pintu, actual event/guest/RSVP data and authenticated profile APIs are unchanged. Browser visual/CI confirmation still required.
