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
- Animation Engine: Motion / Framer Motion (motion.dev)

### Image Processing & Upload
- Image Engine: Sharp (sharp) untuk optimasi, kompresi, dan cropping media/gambar

### Code Quality & Formatting
- Code Formatter: Prettier (dengan Tailwind CSS plugin)
- Linter: ESLint

### Design System & Themes
- Brand: **DC Organizer**
- Logo / primary brand: Rose `#C07A84`
- Supporting rose: `#D9A3AA`
- Deep hover / pressed rose: `#A65E69`
- Typography: Cinzel — Display, Headings, Titles, & Branding
- Typography: Fauna One — Primary Body Text & Interface UI
- Typography: DM Mono — Technical Labels, Codes, & Metadata
- Light Theme:
  - Primary/action: `#C07A84`
  - Supporting accent: `#D9A3AA`
  - Hover/pressed: `#A65E69`
  - Background: `#FAF8F8`
  - Surface: `#F7ECEE`
  - Primary text: `#241D1F`
  - Muted text: `#7F4B55`
- Dark Theme:
  - Background: `#100D0F`
  - Surface: `#21181A`
  - Primary accent: `#D9A3AA`
  - Secondary brand accent: `#C07A84`
  - Highlight: `#F1C9CE`
  - Primary text: `#F8F3F4`
- Deprecated palette: `#8C4A56`, `#E8B4B8`, `#6E3843`, `#0F0E11`, `#1A181E`

## Public Invitation Architecture
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
