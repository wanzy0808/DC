# PRD Tambahan — Dashboard Redesign

## 2026-09-16 — Dashboard Workspace Editorial Redesign

### Tujuan
Menyelaraskan visual dashboard utama dengan bahasa visual yang sudah dipakai pada halaman `/dashboard/undangan-digital` sebelumnya: editorial, clean, neutral-first, garis border tipis, ruang putih yang lega, tipografi Cinzel/Fauna One/DM Mono, dan aksen Rose yang terukur.

### Keputusan UI
- Sidebar **tidak didesain ulang** dan mempertahankan struktur, ukuran, warna, navigasi, serta behavior yang sudah ada.
- Topbar dashboard diselaraskan dengan pola Digital Invitation Workspace: `w-[min(92vw,1400px)]`, border tipis, background mengikuti canvas, backdrop blur, dan metadata section menggunakan DM Mono.
- Setiap tab non-Beranda memiliki section heading editorial yang konsisten berisi eyebrow, judul, deskripsi, dan konteks pasangan.
- Beranda diubah dari kumpulan kartu beige menjadi komposisi editorial: hero pasangan, ringkasan paket/RSVP/tamu, quick access berbasis garis, dan next step.
- Stat tidak lagi menggunakan repeated card fill; statistik memakai pembagian kolom dan border tipis.
- Quick action menggunakan pola text/action row yang ringan dengan arrow accent, mengikuti bahasa visual halaman Digital Invitation.
- Manajemen Tamu dan Usher memakai surface netral, header operasional, roster statistics, dan spacing yang sama dengan workspace editorial.
- Onboarding modal menggunakan canvas netral dan hierarchy typography yang sama.
- Floating WhatsApp tetap dipertahankan sebagai akses bantuan.
- Tidak ada mock data, perubahan API, schema, atau entitlement.

### Refinement lanjutan
- Existing Event Editor dan RSVP Analytics yang sebelumnya masih memakai surface beige/card-heavy sekarang dinetralkan melalui dashboard theme sehingga mengikuti canvas workspace yang sama.
- Form input dan textarea mempertahankan behavior tetapi menggunakan border, focus ring, radius, dan background yang konsisten dengan Digital Invitation workspace.
- RSVP table mempertahankan fitur search, sorting, export, QR, dan manual check-in; visual table/header/hover dibuat lebih ringan dan editorial.
- Panel guest management dan usher mengikuti lebar canvas dashboard yang sama, sehingga tidak terlihat sebagai halaman terpisah.
- Responsive spacing dipertahankan untuk mobile/tablet/desktop.

### Affected files
- `app/[dashboard]/page.tsx`
- `app/dashboard-theme.css`

### Related existing design reference
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`

### Commits
- `a1726f883b79f596daf7751664617cb76c08a30b` — dashboard workspace redesign
- `68ae961dded4419c20b0e92d2e426ac1ff83e393` — component visual refinement

### Validation
- Belum diverifikasi dengan build/CI pada environment repository.
- Perubahan tetap berada pada layer presentational/layout; API, database, entitlement, dan fitur existing tidak diubah.
