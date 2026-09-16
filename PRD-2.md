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

### 2026-09-16 — Guest Placement & Seating Chart Alignment
- `components/Dashboard/SeatingChart.tsx` diselaraskan dengan design system dashboard yang sama agar tab Manajemen Tamu tidak kembali ke visual beige/rounded-card lama.
- Panel setup dan roster sekarang memakai struktur border-based dua kolom: control rail di kiri dan seating canvas di kanan. Filled beige surfaces dan repeated rounded cards dihapus.
- Form jumlah meja, kapasitas kursi, dan input tamu manual sekarang menggunakan `components/ui/input.tsx`; seluruh action button menggunakan `components/ui/button.tsx` canonical.
- Daftar tamu yang belum ditempatkan diubah menjadi roster berbasis divider, bukan chip/card beige berulang.
- Seating canvas Konva menggunakan neutral light/dark canvas dengan canonical Rose `#C07A84`, Supporting Rose `#D9A3AA`, serta foreground neutral sesuai theme. Canvas tidak lagi memakai palette maroon/beige lama.
- Empty state, saving state, swap confirmation, dan feedback message mengikuti typography dan border hierarchy dashboard.
- Drag/drop, pembuatan meja, penambahan tamu manual, seat assignment, atomic swap endpoint, eligibility roster, dan database flow tidak diubah.

### 2026-09-16 — Dashboard Button Color Consistency
- `components/ui/button.tsx` tetap menjadi satu-satunya visual source of truth untuk application action button.
- Seluruh canonical button memakai Rose `#C07A84` sebagai fill, Deep Rose `#A65E69` saat hover, dan treatment border/shadow yang sama tanpa visual variant warna per halaman.
- Disabled state tidak lagi menurunkan opacity menjadi pink pucat. Warna fill dan text tetap sama dengan button aktif agar action row pada Undangan Digital tidak terlihat seperti memakai beberapa palette berbeda; disabled state dibedakan lewat cursor dan hilangnya raised shadow/hover movement.
- Typography button dipastikan memakai Fauna One agar label action konsisten dengan UI dashboard lainnya.
- Perubahan ini berlaku global untuk seluruh komponen yang menggunakan canonical `Button`, termasuk aksi pada Undangan Digital, RSVP, Event Panel, Seating Chart, modal, dan workspace dashboard lain.

### 2026-09-16 — Dashboard Shell Brand, Sidebar & Profile Menu Polish
- Brand `DC Organizer` pada topbar dashboard sekarang menampilkan canonical Rose `#C07A84` secara eksplisit sehingga tidak lagi tertimpa rule header menjadi hitam.
- Sidebar diberi rose-tinted neutral surface yang sangat ringan (`primary` sekitar 4–5% pada light mode, sedikit lebih kuat pada dark mode) agar workspace terasa terpisah dari canvas utama tanpa menjadi blok pink besar.
- Jarak antar navigation item sidebar diperbesar sedikit dan active state memakai `aria-current="page"` agar treatment Rose active state konsisten serta accessible.
- Tombol profil kanan atas tidak lagi memakai fallback label `Dashboard`. Label sekarang memprioritaskan `profile.displayName`; jika nama belum tersedia, fallback menggunakan bagian lokal email, kemudian `Akun`.
- Dropdown akun dibuat sedikit lebih lebar dan memakai rounded outer container. Setiap action row memiliki jarak vertikal, border tipis, dan radius `10px` agar kotak tidak terlihat menempel satu sama lain.
- Header profile trigger mendapat padding horizontal dan hover Rose tint ringan agar tetap terasa sebagai utility control, bukan primary CTA.
- Tidak ada perubahan pada API profile, auth, routing, entitlement, atau data wedding.

### 2026-09-16 — Dashboard Functional Density Pass
- Sidebar tidak lagi menampilkan ikon gembok maupun teks `Upgrade`. Entitlement tetap diproses pada konten/FeatureGate; sidebar hanya berfungsi sebagai navigasi.
- Slot icon sidebar dibuat fixed-width dan `shrink-0`, termasuk untuk `Manajemen Tamu`, agar semua menu selalu memiliki icon alignment yang sama.
- Typography menu sidebar dipindahkan ke Fauna One dengan ukuran/weight yang lebih utilitarian; Cinzel tetap dipakai untuk brand dan heading.
- Header setiap tab dashboard dipadatkan: copy deskriptif panjang dihapus, menyisakan nomor workspace, judul tab, dan metadata wedding singkat.
- Beranda tidak lagi memakai hero copy dan paragraf `next step`. Isi dipadatkan menjadi identitas wedding, empat statistik operasional, dan akses cepat.
- Onboarding copy dipersingkat menjadi field yang diperlukan saja.
- `EventPanel` menghapus heading/penjelasan editorial berulang. Tab jenis acara, form, sync status, dan tombol `Simpan` menjadi fokus utama.
- `InvitationManagementPanel` menghapus deskripsi panjang per section/card serta panel Design Studio berulang. Workspace sekarang fokus pada status terbit, akses, paket, URL publik, Edit/Publish, dan password.
- `RsvpAnalyticsPanel` menghapus hero/penjelasan dan metrik hadiah placeholder. Ringkasan sekarang hanya RSVP, Hadir, Total Pax, dan Check-in.
- Tabel RSVP menghapus kolom placeholder `QR status`, `Acara`, dan `Hadiah`; kolom fungsional sekarang `Nama`, `RSVP`, `Pax`, `Check-in`, `Meja`, dan `Aksi`.
- Export CSV RSVP ikut diselaraskan ke data yang benar-benar tersedia: nama, telepon, RSVP, pax, check-in, dan meja.
- Manajemen Tamu dan Usher di shell dipadatkan menjadi statistik + kontrol utama tanpa paragraf penjelasan berulang.
- API, database flow, publish/password flow, QR generation, manual check-in, seating assignment, dan entitlement server tidak diubah.

### 2026-09-16 — Dashboard Form Readability Pass
- Seluruh `input`, `textarea`, dan `select` di dalam `.dc-dashboard` sekarang memakai surface netral tipis berbasis `foreground` sekitar 3.5%, bukan putih polos yang menyatu dengan canvas.
- Border control dinaikkan kontrasnya secara halus agar batas tiap field cepat terbaca tanpa membuat form terasa berat.
- Rose tetap dipakai hanya sebagai interaction accent: hover menguatkan border sedikit dan focus memakai canonical Rose border + ring tipis.
- Control height distandarkan minimal `44px`, radius `10px`, dan typography mengikuti Fauna One agar form konsisten dengan utility UI dashboard.
- Placeholder dibuat lebih redup daripada value, sedangkan label field menggunakan foreground sekitar 72% untuk hierarchy yang lebih jelas.
- State `readonly` dan `disabled` tidak lagi hanya mengandalkan opacity rendah. Keduanya memakai neutral surface yang lebih lembut, muted text, dan border lebih tipis sehingga data tetap mudah dibaca.
- Perubahan diterapkan dari `app/globals.css` pada scope `.dc-dashboard`, sehingga Event, RSVP, password Undangan Digital, Seating Chart, onboarding, serta control dashboard lainnya mendapat treatment yang sama tanpa page-specific color baru.
- Tidak ada perubahan data, API, validation, schema, atau entitlement.

### 2026-09-16 — Dashboard Data Surface & Rounded Table Rows
- Referensi visual dashboard yang diberikan dipakai pada level hierarchy, bukan disalin palet pink terangnya. Informasi padat dipisahkan menjadi surface/cell yang lebih tegas agar cepat dipindai.
- Grid statistik dashboard (`3–4` kolom yang sebelumnya berupa divider datar) sekarang dirender sebagai individual neutral cards dengan border Rose sangat tipis, radius `12px`, dan surface foreground sekitar `2.5%`.
- Hover statistik menaikkan Rose hanya sedikit agar tetap mengikuti prinsip neutral-first dan tidak berubah menjadi repeated pink cards.
- Quick-access controls pada Beranda mendapat border, surface netral, spacing, dan radius `10px` sehingga setiap action terbaca sebagai kontrol terpisah, serupa struktur visual pada referensi.
- Seluruh tabel dalam `.dc-dashboard` sekarang memakai `border-collapse: separate` dengan jarak antar row. Setiap row dibangun dari cell surface netral, border tipis, serta radius `10px` pada cell paling kiri/kanan sehingga row terasa seperti satu rounded information bar.
- Hover table row menguatkan border Rose dan memberi tint Rose sangat ringan; typography, iconography, dan canonical button tetap mengikuti sistem DC Organizer.
- Treatment ini otomatis berlaku ke RSVP dan tabel dashboard lain yang menggunakan native `<table>`, tanpa mengubah struktur data, sorting, export, check-in, atau API.
- Light dan dark mode menggunakan semantic `background`, `foreground`, `border`, dan `primary` melalui `color-mix`, sehingga tidak menambah palette baru.

### Affected files
- `app/[dashboard]/page.tsx`
- `app/globals.css`
- `components/ui/button.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`

### Related design references
- `app/dashboard/undangan-digital/page.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- Dashboard workspace rules currently live in `app/globals.css`.
- User-provided dashboard screenshot on 2026-09-16 used as hierarchy reference for rounded data cells and clearer table rows; its hot-pink palette was intentionally not copied.

### Commits
- `a1726f883b79f596daf7751664617cb76c08a30b`
- `96c2e06b364920a5d69fbb8e484416436ae677c9`
- `df21a61304de81ff83960f0a5308a389a7fc8625`
- `4c2986ad374b0d8115cfb25b4f2adac740881ea0`
- `b4b7d54a29abcbce3693d795e1adebd5dcf6ff60`
- `c38d3f92439ba8844f63d7766f9135648c02022f`
- `152dbbf99517a3ec449dfb116f6394792739bdb4`
- `190de1798fc0abbef46b1d980cc1b051d9f2014d`
- `b7eca517fa462f77f67ab649e8c12730e889e074`
- `30d6ef3b1f6ecfabde9a9597d43405cae42eaa70`
- `c8a97a5399ef8f385eb84c30ef281f644295dfda`
- `2e57cc663085d00a9fb179777a35cb1027cb6c5e`
- `27ca59b789573e0d291c19a1fb8a9b507ed3a6e9`
- `ca0517cc433c638ed73bedaf4000fcccc88b9718`
- `7afcecff5e7c1b250750681f6b9a55f390741467`

### Validation
- Belum diverifikasi dengan build/CI pada environment repository.
- Dashboard data-surface pass hanya mengubah visual grouping, border, radius, spacing, hover, dan table presentation pada scope `.dc-dashboard`; behavior serta data flow existing tidak diubah.