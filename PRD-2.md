# PRD Tambahan — Dashboard Redesign

## 2026-09-16 — Dashboard Workspace Editorial Redesign

### Tujuan
Menyelaraskan visual dashboard utama dengan bahasa visual yang sudah dipakai pada halaman `/dashboard/undangan-digital` sebelumnya: editorial, clean, neutral-first, garis border tipis, ruang putih yang lega, tipografi Cinzel/Fauna One/DM Mono, dan aksen Rose yang terukur.

### Keputusan UI
- Sidebar tidak didesain ulang dan behavior existing dipertahankan.
- Topbar dashboard diselaraskan dengan pola Digital Invitation Workspace: lebar responsif, border tipis, canvas netral, backdrop blur, dan metadata DM Mono.
- Setiap tab non-Beranda memiliki heading editorial konsisten.
- Beranda memakai hero pasangan, ringkasan paket/RSVP/tamu, quick access berbasis garis, dan next step.
- Statistik menggunakan pembagian kolom dan border tipis, bukan repeated colored cards.
- Quick action menggunakan text/action row ringan dengan arrow accent.
- Manajemen Tamu dan Usher memakai surface netral dan spacing workspace yang sama.
- Onboarding modal memakai hierarchy typography yang sama.
- Tidak ada mock data, perubahan API, schema, atau entitlement.

### 2026-09-16 — Event Panel Alignment
- `components/Dashboard/EventPanel.tsx` diselaraskan langsung dengan visual language `/dashboard/undangan-digital`.
- Surface beige/dark hard-coded di panel acara diganti dengan design tokens dashboard (`background`, `border`, `foreground`, `muted`, `primary`).
- Header panel memakai editorial eyebrow, title, description, dan status database.
- Selector jenis undangan tetap fungsional dengan row border dan Rose active state.
- Form dibagi menjadi `Identitas acara` dan `Lokasi & informasi`, dengan divider vertikal pada desktop.
- Footer save/status menggunakan border tipis dan spacing workspace yang sama.
- API, schema, validation flow, dan data behavior tetap dipertahankan.

### Affected files
- `app/[dashboard]/page.tsx`
- `components/Dashboard/EventPanel.tsx`

### Related design references
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `app/dashboard-theme.css`

### Commits
- `a1726f883b79f596daf7751664617cb76c08a30b`
- `96c2e06b364920a5d69fbb8e484416436ae677c9`
- `df21a61304de81ff83960f0a5308a389a7fc8625`

### Validation
- Belum diverifikasi dengan build/CI pada environment repository.
- Event Panel changes are presentational; API/data flow tetap dipertahankan.
