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
  - Background: `#FFFFFF`
  - Headings, icons, buttons, links, help chat, menu, and accents: `#C07A84`
  - Primary text: `#111111`
  - Secondary text: black with opacity
  - Surfaces remain white; do not use pink as a page background or repeated card fill
- Dark Theme:
  - Background: `#0B0B0C`
  - Headings, icons, buttons, links, help chat, menu, and accents: `#C07A84`
  - Primary text: `#FFFFFF`
  - Secondary text: white with opacity
  - Surfaces remain near-black/dark neutral; do not use pink as a page background or repeated card fill
- Visual balance follows 60/30/10 as a guideline: keep the canvas dominant and concentrate Rose on meaningful brand elements.
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

## Automatic validation

GitHub Actions (`.github/workflows/build.yml`) validates every push to `main`
and every opened or updated pull request targeting `main`. Draft PRs also run.
The workflow can be started manually from **Actions > Build Validation > Run workflow**
after this workflow revision is merged into the default branch.

Two independent checks appear on each PR:
- **Prisma, TypeScript & Build**: frozen dependency install, schema validation,
  explicit Prisma Client generation, route/type generation, TypeScript, and production build.
- **ESLint**: repository-wide lint. A failed lint check remains visible even when build succeeds.

Use the failed step's log to find the first error, fix it, and push another commit;
the PR checks rerun automatically. Obsolete runs are cancelled. These checks do
not deploy, apply migrations, or use production credentials. The CI database URL
is a non-production placeholder for schema/client initialization; these checks
are not database integration tests.

Local equivalents (configure `DATABASE_URL` using `.env.example`):

```bash
pnpm install --frozen-lockfile
pnpm db:validate
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm build
```

Keep required checks green before merging. Automatic merge blocking additionally
requires a GitHub branch ruleset requiring the two checks above; the workflow
alone does not enable branch protection.
