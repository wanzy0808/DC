<<<<<<< HEAD
DC Organizer — Master Product Requirements Document (PRD)Document Status: Master Source of Truth (Single Consolidated Document — Post-Rebranding & Refactor)  Repository: wanzy0808/DC  Brand Name: DC Organizer  CRITICAL RULE: Product branding is strictly DC Organizer (derived from @dc.organizer). Do NOT use legacy brand names (such as Citin or DC Wedding).  1. Product Definition & VisionDC Organizer is a SaaS wedding platform centered around a Digital Wedding Invitation and a connected, real-time guest-management workflow.  The product supports the complete wedding lifecycle:PlaintextWedding Setup
    ↓
=======
Berikut adalah pembaruan dokumen Master PRD (PRD Single Source of Truth) yang telah disesuaikan dan diperbaiki berdasarkan seluruh instruksi reparasi dashboard milikmu. Semua perubahan teknis dan aturan baru sudah langsung dimasukkan ke dalam struktur PRD.

# DC Wedding — Master Product Requirements Document (PRD)
Document Status: Master Source of Truth (Single Consolidated Document — Post-Dashboard Refactor)
Repository: wanzy0808/DC
Brand Name: DC Wedding
CRITICAL RULE: Do NOT rename this product to Citin. Citin is an entirely separate project.

## 1. Product Definition & Vision
DC Wedding is a SaaS wedding platform centered around a Digital Wedding Invitation and a connected, real-time guest-management workflow.

The product supports the complete wedding lifecycle:

Wedding Setup
↓
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a
Invitation Creation (Studio Editor & Centralized Asset Manager)
↓
Invitation Publication (Subdomain & Event Path Routing)
<<<<<<< HEAD
    ↓
Invitation Distribution & Guest Roster
    ↓
Guest RSVP & Gift Tracking
    ↓
Guest Management (Interactive Konva Seating Chart & Seat Assignment)
    ↓
=======
↓
Invitation Distribution & Seta Tamu
↓
Guest RSVP & Gift Tracking
↓
Guest Management (Interactive Seating Chart & Table Assignment)
↓
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a
Guest QR Ticket Generation
↓
Wedding-Day Check-in (Server-Authoritative)
↓
Usher App & Onsite Guest Book
<<<<<<< HEAD
Positioning Statement: DC Organizer is NOT merely a digital invitation generator. Its core positioning is an end-to-end digital wedding guest management platform with a Digital Invitation as the entry point.  2. Technical Stack & Architecture2.1 Technology StackFramework: Next.js (App Router, Turbopack)  Runtime: Node.js (>= 22.0.0 LTS)  Package Manager: pnpm (>= 11.0.0)  Language: TypeScript  Styling & Components: Tailwind CSS v4 & Shadcn UI  Animation & Motion: Framer Motion  Formatting & Quality: ESLint & Prettier (prettier-plugin-tailwindcss)  Database & ORM: PostgreSQL with Prisma ORM  Media Processing: Sharp (sharp) for image optimization, cropping, WebP conversion, and upload handling  Canvas Engine: Konva (react-konva) for interactive template customization & visual seating chart builder  Deployment & CI/CD: Hostinger VPS (Linux) & GitHub Actions  2.2 Core Development PrinciplesPreserve Existing Functionality (Extend Over Replace): Do NOT remove working routes, API endpoints, or UI features unless explicitly instructed. Do NOT remove Beranda or the /dashboard route.  Single Source of Truth (Database First): Shared data (such as couple names, event dates, and user profiles) MUST be saved to and read from the database. Couple names for both main wedding (WEDDING) and special events (EVENT_KHUSUS / legacy ADAT_AKAD) MUST be strictly identical and read-only across all modules once onboarded.  No Mock Invitation Data: New invitations start as empty drafts. Do not populate default fields with placeholder names like Rio or Lyvia.  Centralized Access Control: Authorization MUST be checked server-side. UI gates must reflect central server entitlements (hasPaidDigitalInvitation(), hasPaidGuestbook(), etc.).  Performance-First Animations: Framer Motion animations must target GPU-accelerated properties (opacity, transform) with cubic-bezier easings or spring physics. Directives ("use client";) are mandatory on animated files.  3. Design System & UI/UX Standards3.1 Typography HierarchyCinzel: Primary display, headings, titles, branding, section headings, and elegant editorial elements.  Fauna One: Primary body/UI font for readable paragraphs, navigation, forms, buttons, and general application text.  DM Mono: Utility & technical typography (metadata, QR identifiers, timestamps, status badges, uppercase labels).  3.2 Visual Theme TokensLight Theme (Dusty Pink & Rose Wood):Brand Accent (Logo Base): Dusty Pink (#E8B4B8)  Primary Action / Accent: Deep Rose Wood (#8C4A56)  Primary Hover: Dark Rose Wood (#6E3843)  Background Main: Soft Rose Neutral (#FAFAFA)  Surface Secondary: Pale Blush (#F5EBEB)  Text Primary: Charcoal Black (#1E1B1C) for maximum readability (Anti AI-Slop rule)  Deprecated: Maroon and Creamy tones are fully removed.  Dark Theme (Obsidian Black & Soft Pink):Background Main: Obsidian Black (#0F0E11)  Surface Card: Dark Charcoal (#1A181E)  Primary Accent: Dusty Pink (#E8B4B8)  Text Primary: Pure White / Soft White (#F8F9FA)  3.3 Layout & UI Contrast RulesHeader & User Menu: Top-Right User Menu MUST strictly adhere to the high-contrast style guide (avatar borders, visible drop-down chevron icons minimum w-5 h-5).  Touch Targets & Legibility: Interactive elements require a minimum clickable target of 44x44px. All action labels use strong font weights (font-medium or font-semibold).  Support Copy Cleanup: Dedicated support details live cleanly within dedicated settings pages. Unnecessary inline text in sidebar footer is removed.  4. Package Monetization & Entitlement ModelThe system operates on 3 primary Package States (NONE, DIGITAL_INVITATION, GUEST_BOOK) plus an Add-ons catalog.  Plaintext       ┌──────────────┐
       │     NONE     │ (Studio Free Trial / Draft)
       └──────┬───────┘
              │
       ┌──────┴───────────────┐
       │  DIGITAL_INVITATION  │ (Rp 300.000)
       └──────┬───────────────┘
              │ (Includes All Invitation & Guest Management Features)
       ┌──────┴───────────────┐
       │      GUEST_BOOK      │ (Rp 2.000.000 - Onsite Wedding Day)
       └──────────────────────┘
Feature / ScopeNONE (Free)DIGITAL_INVITATION (Rp 300k)GUEST_BOOK (Rp 2 Juta)Studio & Template SelectionOpen  Open  Open  Built-in Music & AssetsOpen  Open  Open  Publish InvitationLocked  Open  Open  Custom Assets (Photos/Music)Locked  Open (Max 30 Photos, 1 Track)  Open (Max 30 Photos, 1 Track)  Custom SubdomainLocked  Open ([namapasangan].dcorganizer.com)  Open ([namapasangan].dcorganizer.com)  Dual Invitations (WEDDING & EVENT_KHUSUS)Locked  Open  Open  Password ProtectionLocked  Open (bcrypt hash & signed cookie)  Open  RSVP Analytics & ExportRead-only  Full Access & Excel/CSV Export  Full Access & Excel/CSV Export  Guest Database & Interactive Seating ChartLocked  Full Access  Full Access  QR Ticket Generation for GuestsLocked  Open (Issue & View QR Tickets)  Open  Onsite Hardware (2 Tablets & Modem)Locked  Locked  Included  Usher App & Server Check-in ScannerLocked  Locked  Included (Server-authoritative check-in)  Onsite Tech Support Crew (4 Hours)Locked  Locked  Included  5. Onboarding & Core Data Architecture5.1 Onboarding Setup (Single Source of Truth)Required setup modal before accessing dashboard features for the first time:  Inputs Required: Groom's Name (groomName), Bride's Name (brideName), Dashboard Nickname (firstName).  System Execution:Creates/initializes default WEDDING and linked EVENT_KHUSUS invitation records.  Updates User.firstName in PostgreSQL database.  Generates default subdomain slug (e.g., rio-lyvia.dcorganizer.com).  Couple Name Enforcement: Couple names entered during onboarding propagate to both main WEDDING and EVENT_KHUSUS invitations and remain read-only on sub-event editors to prevent data divergence.  5.2 Public Canonical URL ArchitectureMain Wedding Canonical URL: https://[nama-pasangan][.dcorganizer.com/](https://.dcorganizer.com/)[cite: 8, 14]Event Khusus Canonical URL: https://[nama-pasangan][.dcorganizer.com/](https://.dcorganizer.com/)[nama-event][cite: 8, 14]Event Slug Routing: Derived dynamically via slugifyEvent(Invitation.title). proxy.ts routes tenant requests to /invite/[slug]/[eventSlug].  Password Scope: Setting a password on an invitation applies seamlessly across both root URL and sub-event paths.  6. Detailed Feature Specifications & Modules6.1 Streamlined NavigationGlobal Header: Branding (DC Organizer), subscription status, theme switch, high-contrast user dropdown menu.  Sidebar Menu Structure:Beranda: Overview, metrics, status.  Rangkaian Acara: Event details editor.  Undangan Digital Workspace (/dashboard/undangan-digital): Dual-card workspace (WEDDING & EVENT_KHUSUS) with Edit Design, Preview, Copy Link, and Password Protection.  RSVP: Analytics, filter (Semua, Hadir, Tidak Hadir, Ragu-Ragu), search ("Cari..."), CSV export.  Manajemen Tamu: Guest database, seating metrics, manual guest creation, and Konva 2D seating builder.  Guest Book & Usher App: Onsite check-in portal (GUEST_BOOK package only).  6.2 Event Details Editor (Rangkaian Acara)Read-Only Couple Names: Inherited directly from onboarding database record.  Time Standards:Indonesian Timezones: Strictly 24-hour format with abbreviations: WIB (UTC+7), WITA (UTC+8), or WIT (UTC+9). 12-hour AM/PM format is prohibited for Indonesian timezones.  International Locations: 12-hour AM/PM format permitted.  Form Mapping: "Nama Gedung" maps to venue, "Alamat" maps to address.  6.3 Interactive Konva Seating Builder & Guest PlacementPersistence Schema: Guest.seatNumber (Int?) with @@unique([tableId, seatNumber]) constraint to prevent seat collisions at database level.  Seating Roster Eligibility: Displays guests with source: MANUAL or RSVP status ATTENDING (source: RSVP).  Floor Plan Generator: Configurable setup modal (Jumlah meja 1–100, Bangku per meja 1–50) executing atomic creation via /api/wedding-tables.  Drag-and-Drop Operations:Dragging unseated roster badge to empty seat issues PATCH /api/guests/[id].  Dragging seated guest to another empty seat updates placement dynamically.  Dragging guest to an occupied seat triggers an explicit modal confirmation: Tukar Posisi (Swap) or Batal. Position swaps execute atomically via POST /api/guests/[id]/swap.  7. Implementation History LogDateScope / FeatureImplementation SummaryEntitlement / ImpactStatus / Commits2026-09-12Password ProtectionAdded bcrypt hash & signed cookie verification to Invitation.  DIGITAL_INVITATION / GUEST_BOOK  Commits: fc11e21, cc99458, cdba01f  2026-09-12Canonical Subdomain RoutingEvent Khusus mapped to /[nama-event] via slugifyEvent().  Public routing architecture  Commits: 46828c0, 663fc9c, 3f775e1  2026-09-12Guest Management AlignmentAligned guest endpoints /api/guests & /api/wedding-tables to DIGITAL_INVITATION.  DIGITAL_INVITATION entitlement unlocked  Commits: e72f8f7, a17a4b4, 25282fe  2026-09-12Undangan Digital WorkspaceDedicated route /dashboard/undangan-digital with Studio Back deep linking.  Workflow & UI structure  Commits: f8ad75f, 94e665b  2026-09-12Guest Seat PersistenceAdded seatNumber column & unique constraint [tableId, seatNumber] in Prisma.  Atomic guest placement  Commits: adeb575, 6bf1ee3, 2dfd0d2  2026-09-12Konva Seating ChartVisual 2D seating builder with drag-and-drop support.  DIGITAL_INVITATION / GUEST_BOOK  Commits: 58d8c48, bca7647, 8163483  2026-09-12Seating Roster & Manual GuestsAdded GuestSource (RSVP vs MANUAL); manual guest entry form in seating panel.  Guest roster management  Commits: ab9446c, 213c013, 927a289  2026-09-12Seating Floor Plan GeneratorDynamic grid generator creating tables via /api/wedding-tables.  Server-authoritative canvas setup  Commits: 522e53b, b39148d  2026-09-12Seated Guest Swap APITarget seat highlighting & atomic guest swap transaction via /api/guests/[id]/swap.  Conflict prevention  Commits: eed3db4, 38e058f, feb720a  2026-09-12WEDDING Invitation Resolution FixMutation endpoints restricted strictly to { ownerId, type: "WEDDING" }.  Resolves data association bugs  Commits: 3206aa4, 4c7b851, beaebcd  2026-09-13Brand & Rebranding AlignmentsUpdated brand references from DC Wedding to DC Organizer; integrated Framer Motion & Prettier rules.  Product identity alignment  Document Update8. Definition of Done (DoD)Dashboard & Studio Navigation DoD:User clicks Edit Design on Undangan Digital card $\rightarrow$ Studio opens with target ?type= query.  User clicks Back inside Studio $\rightarrow$ System returns to /dashboard/undangan-digital.  Event Details & Timezone Consistency DoD:Editing event details formats time strictly in 24-hour format accompanied by valid Indonesian timezone indicator (WIB/WITA/WIT).  Venue maps to "Nama Gedung" and address maps to "Alamat".  Couple names remain identical across all sub-events.  Interactive Seating Chart & Swap DoD:Dragging unseated guest to empty seat persists tableId and seatNumber atomically via server API.  Dragging guest to an occupied seat prompts confirmation dialog; choosing Swap executes atomic transaction without unique constraint errors.  RSVP Search & Filter DoD:User types text into "Cari..." search bar, applies status filter, and updates sort dropdown $\rightarrow$ Table updates instantly without full page reload.  
=======

Positioning Statement: DC Wedding is NOT merely a digital invitation generator. Its core positioning is an End-to-end digital wedding guest management platform with a Digital Invitation as the entry point.

## 2. Technical Stack & Development Principles
### 2.1 Technology Stack & Architecture
Framework: Next.js (App Router, Turbopack)
Runtime: Node.js (>= 22.0.0 LTS)
Package Manager: pnpm (>= 11.0.0)
Language: TypeScript
Database & ORM: PostgreSQL with Prisma ORM
Media Processing: Sharp (sharp) for image optimization, cropping, WebP conversion, and upload handling
Canvas Engine: Konva (react-konva) for interactive template customization & visual seating chart builder
Deployment & CI/CD: Hostinger VPS (Linux) & GitHub Actions (Node 22 validation)

### 2.2 Core Development Principles for Agents & Developers
Preserve Existing Functionality: Do NOT remove working routes, API endpoints, or UI features unless explicitly instructed.
Do NOT remove Beranda or the /dashboard route.
Do NOT rename the brand from DC Wedding.
Do NOT replace existing implementations with fake/mock data.
Single Source of Truth (Database First): Shared data (such as couple names, event dates, and user profiles) MUST be saved to and read from the database. Couple names for both main wedding and special events (Event Khusus) MUST be strictly identical and read-only across all modules once onboarded.
No Mock Invitation Data: New invitations start as empty drafts. Do not populate default fields with placeholder names like Rio or Lyvia.
Centralized Access Control: Authorization MUST be checked server-side. UI gates should reflect central server entitlements (hasPaidDigitalInvitation, hasGuestbook, etc.).
Extend Over Replace: Inspect current codebase/API/schema before adding new code. Extend existing patterns.

## 3. Design System & UI/UX Standards
### 3.1 Typography Hierarchy
Cinzel: Primary display, headings, titles, branding, and elegant editorial elements.
Fauna One: Primary body/UI font for readable paragraphs, navigation, forms, buttons, and general application text.
DM Mono: Utility & technical typography (metadata, QR identifiers, timestamps, status badges, uppercase labels).

### 3.2 Visual Themes & UI Contrast Fixing
Light Theme (Default):
- Primary Accent / Action: Deep Rose Wood `#8C4A56`.
- Brand Accent: Dusty Pink `#E8B4B8`.
- Primary Hover: Dark Rose Wood `#6E3843`.
- Background Utama: Soft Rose Neutral / Warm White `#FAFAFA`.
- Surface Secondary (Card/Input): Pale Blush `#F5EBEB`.
- Text Utama: Charcoal Black `#1E1B1C`.
- Do not use the previous maroon/burgundy + creamy/ivory palette for the light application theme.
- Body and functional text should default to `#1E1B1C`; Rose Wood is an accent, not a replacement for normal body text.

Dark Theme: Black / Near-Black background with Pink / Soft Rose primary accents and clean White / Light Neutral body text.
Header & User Menu Contrast Rule: The Top-Right User Menu MUST strictly adhere to the high-contrast theme style guide. Standardize text color, avatar borders, visible drop-down chevron icons (minimum w-5 h-5), and high-contrast menu popovers to prevent illegibility on light/dark headers.

### 3.3 Layout, Spacing & Readability Rules
Anti-Blur & High Contrast: All text, UI menus, and button labels MUST use bold/semi-bold weights (font-medium / font-semibold) with high-contrast colors. Never use washed-out/muted grays that hinder readability.
Icon Sizing & Touch Targets: Icons MUST NOT be overly tiny. Standardize icons to at least w-5 h-5 or w-6 h-6 for primary menu items and actions. Ensure interactive elements have a minimum clickable area of 44x44px.
No Unnecessary Floating Widgets: Do NOT render floating support widgets (e.g., floating WhatsApp "Butuh bantuan?" chat widget at bottom-right). All support channels must live cleanly within dedicated support pages or settings.

## 4. Code Base Rules & File Maintainability
To maintain a clean and modular Next.js codebase:
File Length Limit: Keep component and module files within 200–250 lines of code. Refactor long files (especially canvas editors or dashboard pages).
Sub-components & Custom Hooks: Extract UI blocks into smaller sub-components in components/ and isolate complex state/data logic into custom hooks (e.g., useCanvasEditor.ts, useInvitationData.ts, useSeatingChart.ts).
Constants & Utilities: Move validation schemas, dropdown options, and helper utilities to lib/ or constants/.

## 5. Package Monetization & Permission Model
The system operates on 3 primary Package States (NONE, DIGITAL_INVITATION, GUEST_BOOK) plus an Add-ons catalog.

NONE (Studio Free Trial / Draft)
↓
DIGITAL_INVITATION (Rp 300.000)
↓
GUEST_BOOK (Rp 2.000.000 - Onsite Wedding Day)

### 5.1 Package Entitlements
Feature / Scope | NONE (Free) | DIGITAL_INVITATION (Rp 300k) | GUEST_BOOK (Rp 2 Juta)
Studio & Template Selection | Open | Open | Open
Built-in Music & Assets | Open | Open | Open
Publish Invitation | Locked | Open | Open
Custom Assets (Photos/Music) | Locked | Open (Max 30 Photos, 1 Custom Track) | Open (Max 30 Photos, 1 Custom Track)
Custom Subdomain | Locked | Open ([namapasangan].dcwedding.com) | Open ([namapasangan].dcwedding.com)
Dual Invitations (Main & Event Khusus) | Locked | Open | Open
Password Protection | Locked | Open | Open
RSVP Analytics & Export | Read-only / Basic | Full Access & Excel/CSV Export | Full Access & Excel/CSV Export
Manajemen Tamu & Interactive Seating | Locked | Full Access | Full Access
QR Ticket Generation for Guests | Locked | Open (View & Issue QR Tickets) | Open (View & Issue QR Tickets)
Onsite Hardware (2 Tablets & Modem) | Locked | Locked | Included
Usher App & Server Check-in Scanner | Locked | Locked | Included
Onsite Tech Support Crew (4 Hours) | Locked | Locked | Included

## 6. Onboarding & Core Data Architecture
### 6.1 Onboarding Flow (Single Source of Truth)
Before accessing the main dashboard features for the first time, the user is presented with a required setup modal.

Inputs Required:
Groom's Name (groomName)
Bride's Name (brideName)
Dashboard Nickname (firstName)

System Execution Order:
Creates/initializes the default WEDDING and linked EVENT_KHUSUS invitation records with couple details.
Updates User.firstName in the database as the nickname single source of truth.
Generates the default canonical subdomain slug (e.g., rio-lyvia.dcwedding.com).

Strict Couple Name Enforcement: Couple names entered during onboarding automatically propagate to both main Wedding and Event Khusus invitations. The system prevents any divergence between couple names across different sub-events.

## 7. Detailed Feature Specifications & Modules
### 7.1 Dashboard Structure & Streamlined Navigation
Global Header: High-contrast layout containing branding, billing status, and Top-Right User Menu with compliant typography, visible icons, and contrast-matched dropdown triangles.

Main Sidebar Menu (Streamlined):
Beranda: Overview, metrics, status.
Rangkaian Acara: Master event details editor.
Undangan Digital: Dual-card workspace (Main Wedding & Event Khusus).
RSVP: Analytics, search, filter, and guest responses.
Manajemen Tamu: Guest database, seating counts, table capacity, and interactive visual floor chart builder.
Guest Book & Usher App: Onsite check-in portal.

REMOVED ITEMS:
Galeri Foto & Music Menu: Completely removed from the primary sidebar menu. Photos and music are now exclusively managed directly inside the Studio Editor asset panel.
Right-bottom WhatsApp Chat Widget ("Butuh bantuan?"): Completely removed from the viewport interface.

### 7.2 Rangkaian Acara (Event Details Editor)
Couple Name Integrity: Couple names for both main wedding and Event Khusus are read-only and inherited directly from the onboarding database record.

Time System Standards:
Indonesian Timezones: Displayed strictly using 24-hour format accompanied by standard Indonesian abbreviations: WIB (UTC+7 / GMT+7 Jakarta Bangkok Hanoi), WITA (UTC+8), or WIT (UTC+9). 12-hour AM/PM formatting is strictly forbidden for Indonesian timezones.
International Timezones: 12-hour AM/PM format is permitted exclusively for non-Indonesian event locations.
Terminology Alignment:
Field label "Nama Gedung" represents the event Venue Location (venue).
Field label "Alamat" maps directly to the database address field.
Sub-event naming: Renamed all legacy references of "Akad & Sangjit" to "Event Khusus".

### 7.3 Undangan Digital & Studio Navigation Fixes
Navigation Behavior (Back Button): Pressing the "Back" button inside the Studio Editor MUST navigate back to /dashboard/undangan-digital (Undangan Digital workspace) instead of redirecting to /dashboard (Beranda).
Workspace Cleanliness: Removed redundant "Studio & Asset" menus below cards. Editing is triggered strictly via the top Edit Design button.
Targeted Deep Links:
Clicking Edit Design on the Main Wedding card opens Studio with ?type=WEDDING.
Clicking Edit Design on the Event Khusus card opens Studio directly targeting ?type=EVENT_KHUSUS.
Subdomain Routing:
Main Wedding: https://[nama-pasangan].dcwedding.com
Event Khusus: https://[nama-pasangan].dcwedding.com/[nama-event]

### 7.4 RSVP Module Optimization
Search Input Placeholder: Updated search input placeholder text from "Cari nama tamu..." to a clean, generic "Cari...".
Advanced Filter System: Added quick status filter toggling between Semua, Hadir, Tidak Hadir, and Ragu-Ragu.
Standardized Sort Dropdown: Sorting options consolidated into a single dropdown control with options:
Nama (A - Z)
Nama (Z - A)
Waktu Response (Terbaru)
Waktu Response (Terlama)

### 7.5 Manajemen Tamu & Interactive Seating Builder
Master Guest Metrics Header:
Jumlah Total Tamu: Aggregate pax count.
Jumlah Meja: Total allocated table objects.
Jumlah Tamu per Meja: Target/average seat capacity per table.
Daftar Nama Tamu: Searchable guest roster.
Penempatan Meja & Bangku: Assigned table number and seat index per guest.
Interactive Drag-and-Drop Floor Plan (Konva Engine):
Provides a visual 2D canvas representing the event venue floor plan.
Users can drag unassigned guest badges directly from the side roster and drop them onto specific table seats (Table Canvas Component).
Instant visual feedback indicating table capacity limits and seat availability.

## 8. Definitions of Done (DoD)
Dashboard & Studio Navigation DoD:
User clicks Edit Design on Undangan Digital card → Studio opens with corresponding ?type= query → User edits assets/music in Studio → User clicks Back inside Studio → System reliably returns to /dashboard/undangan-digital.

Event & Timezone Consistency DoD:
User edits Rangkaian Acara → Time displays in 24-hour format with selected WIB / WITA / WIT offset → Venue name maps to "Nama Gedung" and address maps to "Alamat" → Couple names remain uniform across main and Event Khusus invitations.

Interactive Guest Seating DoD:
User opens Manajemen Tamu → Sees high-level summary metrics (Total Tamu, Jumlah Meja, Tamu per Meja) → Drags guest onto visual table canvas → Server updates guest tableId and seatNumber atomically → Seating chart and guest list sync in real-time.

RSVP Search & Filter DoD:
User enters text into "Cari..." search bar → Selects sorting from dropdown (Nama A-Z) → Applies status filter → Results update instantly without page reloads.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a
