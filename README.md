# DC Organizer 💒

A modern, high-performance wedding organizer, digital wedding invitation, and guest-management platform built with Next.js, Prisma, and Tailwind CSS v4.

## 🛠 Tech Stack

### Core & Framework
- Framework: Next.js (App Router, Turbopack)
- Runtime: Node.js (v22 LTS)[cite: 5]
- Package Manager: pnpm (v11)[cite: 5]
- Language: TypeScript[cite: 5]

### Database & Infrastructure
- Database: PostgreSQL[cite: 5]
- ORM: Prisma ORM[cite: 5]
- Deployment: Hostinger VPS (Linux Server)[cite: 5]
- CI/CD: GitHub Actions (Build Validation)[cite: 5]

### UI & Styling
- CSS Engine: Tailwind CSS v4[cite: 5]
- Component Library: shadcn/ui[cite: 5]
- Iconography: Lucide React (lucide-react)[cite: 5]
- Canvas Engine: Konva (react-konva)[cite: 5]
- Animation Engine: Motion / Framer Motion (motion.dev)

### Image Processing & Upload
- Image Engine: Sharp (sharp) untuk optimasi, kompresi, dan cropping media/gambar[cite: 5]

### Code Quality & Formatting
- Code Formatter: Prettier (dengan Tailwind CSS plugin)
- Linter: ESLint

### Design System & Themes
<<<<<<< HEAD
- Brand: **DC Organizer**[cite: 5]
- Typography: Cinzel — Display, Headings, Titles, & Branding[cite: 5]
- Typography: Fauna One — Primary Body Text & Interface UI[cite: 5]
- Typography: DM Mono — Technical Labels, Codes, & Metadata[cite: 5]
- Light Theme: Deep Rose Wood `#8C4A56` + Dusty Pink `#E8B4B8` + Warm White `#FAFAFA` + Pale Blush `#F5EBEB` + Charcoal `#1E1B1C`[cite: 5]
- Primary Hover: Dark Rose Wood `#6E3843`[cite: 5]
- Dark Theme: Pure Black `#000000` + Dark Charcoal `#121214` + Dusty Pink `#E8B4B8` + Pure White `#FFFFFF` + Pink Blush `#F4C2C7`
=======
- Brand: **DC Organizer**
- Brand color: Rose `#C07A84`
- Supporting rose: `#D9A3AA`
- Deep hover rose: `#A65E69`
- Typography: Cinzel — Display, Headings, Titles, & Branding
- Typography: Fauna One — Primary Body Text & Interface UI
- Typography: DM Mono — Technical Labels, Codes, & Metadata
- Light Theme: `#C07A84` + `#D9A3AA` + `#FAF8F8` + `#F7ECEE` + `#241D1F`
- Dark Theme: `#100D0F` + `#21181A` + `#D9A3AA` + `#C07A84` + `#F1C9CE` + `#F8F3F4`
- Deprecated palette: `#8C4A56`, `#E8B4B8`, `#6E3843`, `#0F0E11`, `#1A181E`
>>>>>>> 74081b29f9fa46a0e0c3733b2d69ae2cced8366e

### Public Invitation Architecture
- Main invitation: `https://[nama-pasangan].dcwedding.com`[cite: 5]
- Event invitation: `https://[nama-pasangan].dcwedding.com/[nama-event]`[cite: 5]
- The event path is generated from the Event Khusus name stored in the database (currently the ADAT_AKAD invitation title).[cite: 5]
- Example: `Akad & Sangjit` → `https://rio-lyvia.dcwedding.com/akad-sangjit`[cite: 5]
- The old `/event-khusus` path remains only as a backward-compatible alias and redirects to the event-name path.[cite: 5]
- Legacy `/invite/[slug]` routes remain only for internal routing and backward-compatible redirects.[cite: 5]
- Invitation identity and event names remain database-first; browser cookies/localStorage are not used as a source of truth.[cite: 5]

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.0.0[cite: 5]
- pnpm >= 11.0.0[cite: 5]
- PostgreSQL database[cite: 5]
