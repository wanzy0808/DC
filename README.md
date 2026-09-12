# DC Wedding 💒

A modern, high-performance digital wedding invitation and management platform built with Next.js, Prisma, and Tailwind CSS v4.

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
- Typography: Cinzel — Display, Headings, Titles, & Branding
- Typography: Fauna One — Primary Body Text & Interface UI
- Typography: DM Mono — Technical Labels, Codes, & Metadata
- Light Theme: Maroon + Creamy Visual System
- Dark Theme: Black + Pink Accent Palette

### Public Invitation Architecture
- Main invitation: `https://[nama-pasangan].dcwedding.com`
- Special event: `https://[nama-pasangan].dcwedding.com/event-khusus`
- Invitation slug is generated from the couple names stored in the database.
- The database remains the source of truth; browser cookies/localStorage are not used for invitation identity.
- Legacy `/invite/[slug]` routes remain only for internal routing and backward-compatible redirects.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.0.0
- pnpm >= 11.0.0
- PostgreSQL database
