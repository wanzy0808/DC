# PRD Tambahan — Dashboard Redesign

## 2026-09-16 — Dashboard Workspace Editorial Redesign

### Tujuan
Menyelaraskan visual dashboard utama dengan bahasa visual yang sudah dipakai pada halaman `/dashboard/undangan-digital` sebelumnya: editorial, clean, neutral-first, garis border tipis, ruang putih yang lega, tipografi Cinzel/Fauna One/DM Mono, dan aksen Rose yang terukur.

### Keputusan UI
- Sidebar **tidak didesain ulang** dan mempertahankan struktur, ukuran, warna, navigasi, serta behavior yang sudah ada.
- Topbar dashboard diselaraskan dengan pola Digital Invitation Workspace: `w-[min(92vw,1400px)]`, border tipis, background mengikuti canvas, backdrop blur, dan metadata section menggunakan DM Mono.
- Setiap tab non-Beran­da sekarang memiliki section heading editorial yang konsisten berisi eyebrow, judul, deskripsi, dan konteks pasangan.
- Beranda diubah dari kumpulan kartu beige menjadi komposisi editorial: hero pasangan, ringkasan paket/RSVP/tamu, quick access berbasis garis, dan next step.
- Stat tidak lagi menggunakan repeated card fill; statistik memakai pembagian kolom dan border tipis.
- Quick action menggunakan pola text/action row yang ringan dengan arrow accent, mengikuti bahasa visual halaman Digital Invitation.
- Manajemen Tamu dan Usher memakai surface netral, header operasional, roster statistics, dan spacing yang sama dengan workspace editorial.
- Onboarding modal menggunakan canvas netral dan hierarchy typography yang sama.
- Floating WhatsApp tetap dipertahankan sebagai akses bantuan, tetapi menggunakan primitive `Button` canonical tanpa visual custom tambahan.
- Tidak ada mock data, perubahan API, perubahan schema, atau perubahan entitlement.

### Affected files
- `app/[dashboard]/page.tsx`

### Related existing design reference
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `app/dashboard-theme.css`

### Commit
- `a1726f883b79f596daf7751664617cb76c08a30b`

### Validation
- Belum diverifikasi dengan build/CI pada environment repository.
- Perubahan dibatasi pada presentational layout dan class styling di dashboard; data flow/API yang sudah ada dipertahankan.
