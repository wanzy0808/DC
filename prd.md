# DC Organizer — Master Product Requirements Document (PRD)
Document Status: Master Source of Truth (Single Consolidated Document — Post-Dashboard Refactor)
Repository: wanzy0808/DC
Brand Name: DC Organizer

## 1. Product Definition & Vision
DC Organizer is a SaaS wedding platform centered around a Digital Wedding Invitation and a connected, real-time guest-management workflow.

The product supports the complete wedding lifecycle:

Wedding Setup
↓
Invitation Creation (Studio Editor & Centralized Asset Manager)
↓
Invitation Publication (Subdomain & Event Path Routing)
↓
Invitation Distribution & Seta Tamu
↓
Guest RSVP & Gift Tracking
↓
Guest Management (Interactive Seating Chart & Table Assignment)
↓
Guest QR Ticket Generation
↓
Wedding-Day Check-in (Server-Authoritative)
↓
Usher App & Onsite Guest Book

Positioning Statement: DC Organizer is NOT merely a digital invitation generator. Its core positioning is an end-to-end digital wedding guest management platform with a Digital Invitation as the entry point.

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
Brand identity and product-facing references MUST use DC Organizer.
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

Dark Theme:
- Background Main: Obsidian Black `#0F0E11`.
- Surface Card: Dark Charcoal `#1A181E`.
- Primary Accent: Dusty Pink `#E8B4B8`.
- Text Primary: Pure White / Soft White `#F8F9FA`.
- Text Accent: Soft Pink Blush `#F4C2C7`.

Header & User Menu Contrast Rule: The Top-Right User Menu MUST strictly adhere to the high-contrast theme style guide. Standardize text color, avatar borders, visible drop-down chevron icons (minimum w-5 h-5), and high-contrast menu popovers to prevent illegibility on light/dark headers.

### 3.3 Layout, Spacing & Readability Rules
Anti-Blur & High Contrast: All text, UI menus, and button labels MUST use bold/semi-bold weights (font-medium / font-semibold) with high-contrast colors. Never use washed-out/muted grays that hinder readability.
Icon Sizing & Touch Targets: Icons MUST NOT be overly tiny. Standardize icons to at least w-5 h-5 or w-6 h-6 for primary menu items and actions. Ensure interactive elements have a minimum clickable area of 44x44px.
No Unnecessary Floating Widgets: Do NOT render floating support widgets (e.g., floating WhatsApp chat widget at bottom-right). All support channels must live cleanly within dedicated support pages or settings.

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
Right-bottom WhatsApp Chat Widget: Completely removed from the viewport interface.

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
