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

### 2026-09-16 — RSVP & Analytics Alignment
- `components/Dashboard/RsvpAnalyticsPanel.tsx` direstrukturisasi agar konsisten dengan `/dashboard/undangan-digital` dan Event Panel.
- Surface beige, rounded-card berulang, dan warna hard-coded lama diganti dengan semantic `background`, `border`, `foreground`, `muted`, dan `primary`.
- Header RSVP sekarang memakai pola editorial dua kolom dengan metadata DM Mono, heading Cinzel, dan body Fauna One.
- Enam metrik RSVP diubah dari repeated filled cards menjadi grid statistik berbasis divider/border tipis agar lebih ringan dan konsisten dengan Beranda.
- Guest directory memiliki search, sort selector, toggle arah sorting, dan Export CSV dalam satu toolbar responsif.
- Tombol aksi QR, manual check-in, close modal, sort direction, dan Export CSV sekarang menggunakan primitive `components/ui/button.tsx` canonical.
- Tabel tamu memakai semantic borders, hover sangat ringan, typography yang konsisten, dan tetap horizontal-scroll safe pada layar sempit.
- Modal QR diselaraskan ke neutral canvas; alur pembuatan QR dan token tidak diubah.
- Search, sorting, export, QR generation, manual check-in, serta API/data flow tetap dipertahankan.
- Nama file CSV diperbarui dari legacy `dc-wedding-rsvp.csv` menjadi `dc-organizer-rsvp.csv` agar sesuai brand DC Organizer.

### 2026-09-16 — Digital Invitation Workspace Cleanup
- Screenshot review menunjukkan tab `Undangan Digital` memiliki dua level hero besar sekaligus: heading workspace dari shell dashboard dan hero tambahan di `InvitationManagementPanel`. Kombinasi ini membuat hierarchy berulang, area kosong terlalu besar, dan halaman terasa seperti landing page di dalam dashboard.
- `components/Dashboard/InvitationManagementPanel.tsx` direstrukturisasi menjadi control workspace yang lebih padat: heading internal dibuat sekunder, CTA Studio dipindahkan ke toolbar section, dan hero besar kedua dihapus.
- Ringkasan `halaman terbit`, `akses tamu`, dan `paket` ditempatkan sebagai strip metadata berbasis divider agar status utama terbaca tanpa repeated cards.
- Dua halaman undangan sekarang memakai satu grid border-based yang konsisten. URL publik menjadi elemen utama yang dapat dibuka langsung, sedangkan aksi copy dipadatkan menjadi icon button sehingga jumlah tombol visual berkurang.
- Aksi utama per halaman disederhanakan menjadi `Edit desain` dan `Publish/Unpublish`. Preview tidak lagi membutuhkan tombol terpisah karena URL publik dapat dibuka langsung.
- Bagian proteksi password dan Design Studio disusun sebagai dua kolom lanjutan dengan hierarchy yang sama, bukan dua blok hero terpisah.
- Seluruh aksi button tetap menggunakan primitive canonical `components/ui/button.tsx`; form password memakai `components/ui/input.tsx`.
- Props compatibility `accent` dan `button` tetap diterima secara optional agar integrasi existing pada shell dashboard tidak rusak, tetapi tidak lagi dipakai untuk styling.
- `app/globals.css` diperbaiki agar seluruh konten dashboard memakai lebar baca konsisten `min(calc(100% - 3rem), 1400px)` dan tidak lagi dipaksa melebar tanpa `max-width`. Perubahan ini berlaku ke header dan workspace dashboard secara konsisten tanpa mengubah sidebar.
- API invitation, publish state, password protection, URL generation, entitlement, dan database flow tetap dipertahankan.

### Affected files
- `app/[dashboard]/page.tsx`
- `app/globals.css`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`

### Related design references
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- Dashboard workspace rules currently live in `app/globals.css`.

### Commits
- `a1726f883b79f596daf7751664617cb76c08a30b`
- `96c2e06b364920a5d69fbb8e484416436ae677c9`
- `df21a61304de81ff83960f0a5308a389a7fc8625`
- `4c2986ad374b0d8115cfb25b4f2adac740881ea0`
- `b4b7d54a29abcbce3693d795e1adebd5dcf6ff60`
- `c38d3f92439ba8844f63d7766f9135648c02022f`

### Validation
- Belum diverifikasi dengan build/CI pada environment repository.
- Event Panel, RSVP, dan Digital Invitation changes mempertahankan API/data flow existing; perubahan tahap ini berfokus pada hierarchy, visual system, responsive layout, dan penggunaan canonical UI primitive.