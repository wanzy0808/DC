# DC Organizer 💒

A modern, high-performance wedding organizer, digital wedding invitation, and guest-management platform built with Next.js, Prisma, and Tailwind CSS v4.

## 🛠 Tech Stack

### Core & Framework
- Framework: Next.js (App Router, Turbopack)
- Runtime: Node.js (v22 LTS)
- Package Manager: pnpm (v11)
- Language: TypeScript

### Database & Infrastructure
- Database: PostgreSQL
- ORM: Prisma ORM
- Deployment: Hostinger VPS (Linux Server)
- CI/CD: GitHub Actions (Build Validation)

### UI & Styling
- CSS Engine: Tailwind CSS v4
- Component Library: shadcn/ui
- Iconography: Lucide React (lucide-react)
- Canvas Engine: Konva (react-konva)

### Image Processing & Upload
- Image Engine: Sharp (sharp) untuk optimasi, kompresi, dan cropping media/gambar

### Design System & Themes
- Brand: **DC Organizer**
- Typography: Cinzel — Display, Headings, Titles, & Branding
- Typography: Fauna One — Primary Body Text & Interface UI
- Typography: DM Mono — Technical Labels, Codes, & Metadata
- Light Theme: Deep Rose Wood `#8C4A56` + Dusty Pink `#E8B4B8` + Warm White `#FAFAFA` + Pale Blush `#F5EBEB` + Charcoal `#1E1B1C`
- Primary Hover: Dark Rose Wood `#6E3843`
- Dark Theme: Obsidian Black `#0F0E11` + Dark Charcoal `#1A181E` + Dusty Pink `#E8B4B8` + Soft White `#F8F9FA` + Pink Blush `#F4C2C7`

### Public Invitation Architecture
- Main invitation: `https://[nama-pasangan].dcwedding.com`
- Event invitation: `https://[nama-pasangan].dcwedding.com/[nama-event]`
- The event path is generated from the Event Khusus name stored in the database (currently the ADAT_AKAD invitation title).
- Example: `Akad & Sangjit` → `https://rio-lyvia.dcwedding.com/akad-sangjit`
- The old `/event-khusus` path remains only as a backward-compatible alias and redirects to the event-name path.
- Legacy `/invite/[slug]` routes remain only for internal routing and backward-compatible redirects.
- Invitation identity and event names remain database-first; browser cookies/localStorage are not used as a source of truth.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.0.0
- pnpm >= 11.0.0
- PostgreSQL database
