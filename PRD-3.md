# PRD Tambahan — Dashboard Surface Refinement

## 2026-09-16 — Card Grouping & Divider Reduction

### Tujuan
Melanjutkan penyelarasan dashboard DC Organizer dengan referensi visual yang diberikan user: informasi harus cepat dipindai seperti panel/control dashboard, tetapi tetap mengikuti palette, typography, dan neutral-first design system DC Organizer. Tahap ini juga mengurangi garis pembatas horizontal atas/bawah yang terlalu sering muncul.

### Keputusan visual
- Tidak menyalin hot-pink surface dari referensi. Canonical Rose `#C07A84` tetap dipakai sebagai accent, sedangkan panel menggunakan neutral surface tipis.
- Pengelompokan informasi mengandalkan `background + border tipis + radius + spacing`, bukan repeated `border-y`, `border-t`, atau `border-b` panjang.
- Radius panel utama menggunakan sekitar `12px`; nested utility surface menggunakan sekitar `8–10px`.
- Form tetap memakai readable neutral fill dari dashboard form-readability pass sebelumnya.
- Tidak ada perubahan API, schema, entitlement, database flow, publish flow, password flow, atau data event.

### Event / Rangkaian Acara
- `components/Dashboard/EventPanel.tsx` diubah dari layout divider-heavy menjadi beberapa functional surface yang jelas.
- Selector `Pernikahan` dan `Akad & Sangjit` sekarang berada di satu rounded control surface.
- Form `Acara` dan `Lokasi` masing-masing menjadi neutral card terpisah dengan border tipis dan radius kecil sehingga field lebih mudah dipindai.
- Divider vertikal desktop antara form kiri/kanan dihapus.
- Footer status + tombol Simpan berubah menjadi compact rounded action surface tanpa garis horizontal panjang.
- Status sync tetap menampilkan state loading/saved tanpa mengubah data flow existing.

### Undangan Digital
- `components/Dashboard/InvitationManagementPanel.tsx` mengurangi divider horizontal pada header, summary, invitation cards, dan password section.
- Summary `Terbit`, `Akses`, dan `Paket` menjadi tiga compact cards dengan gap antar cell.
- `Pernikahan utama` dan `Event khusus` masing-masing menjadi rounded neutral card, bukan dua kolom yang dipisahkan garis tengah dan border atas/bawah panjang.
- URL publik ditempatkan dalam nested utility surface agar link/copy action lebih tegas dibaca.
- Status `Terbit/Draft` memakai compact Rose-tinted status surface.
- Password control sekarang berada dalam satu rounded functional card dengan status dan action yang sama seperti sebelumnya.

### Dashboard Separator Policy
- `app/globals.css` sekarang menurunkan prioritas divider horizontal pada level `section` dashboard.
- Direct child section di main dashboard tidak lagi otomatis memakai garis bawah panjang.
- Section dengan utility `border-y`, `border-t`, atau `border-b` tidak lagi mengandalkan garis horizontal sebagai primary grouping mechanism.
- Table-row outline tetap dipertahankan karena berfungsi sebagai individual rounded information bar, bukan page-level separator.
- Existing rounded table rows, neutral form surfaces, canonical Rose interactions, typography Cinzel/Fauna One/DM Mono, dan dark mode semantic colors tetap dipertahankan.

### Feature Gate
- `components/Dashboard/FeatureGate.tsx` diubah dari full-width divider panel menjadi rounded neutral card.
- Locked-state overlay dan access notice memakai surface/border/radius yang sama dengan dashboard panels sehingga tidak terlihat seperti halaman berbeda.
- Server-authoritative entitlement dan behavior `Manajemen Tamu` yang tetap dapat melihat workspace tidak diubah.

## 2026-09-16 — Single Rangkaian Acara Flow

### Tujuan
Menyederhanakan tab `Rangkaian Acara` agar dashboard tidak langsung membagi user ke dua jenis acara. Default workspace harus terasa seperti satu editor acara, dengan kemampuan menambah rangkaian berikutnya hanya ketika memang dibutuhkan.

### Keputusan UX & Data
- `components/Dashboard/EventPanel.tsx` tidak lagi menampilkan dua tab permanen `Pernikahan` dan `Akad & Sangjit`.
- Saat pertama dibuka, hanya satu rangkaian utama (`WEDDING`) yang ditampilkan dan diedit.
- Header editor menampilkan nomor rangkaian, nama acara aktif, status sinkronisasi, dan tombol canonical `Tambah rangkaian acara`.
- Tombol `Tambah rangkaian acara` mengaktifkan slot acara tambahan existing (`ADAT_AKAD`) tanpa membuat schema/API baru, sehingga URL event khusus dan flow lama tetap kompatibel.
- Setelah rangkaian tambahan aktif, pemilih `Rangkaian aktif` muncul sebagai compact select untuk berpindah antara rangkaian utama dan tambahan. User tidak melihat dua editor sekaligus.
- Jika slot `ADAT_AKAD` sudah memiliki data bermakna dari penggunaan sebelumnya (judul, venue, alamat, Maps, deskripsi, catatan, atau status publish), editor mendeteksinya dan menampilkan pemilih rangkaian agar data lama tetap dapat diakses.
- Couple name tetap read-only dan diwariskan dari `WEDDING` ketika rangkaian tambahan belum memiliki nama pasangan sendiri.
- Save tetap memakai `PUT /api/invitations`; tidak ada perubahan Prisma schema, entitlement, publish behavior, slug logic, atau event routing.
- Form grouping `Detail acara` dan `Lokasi` tetap menggunakan neutral rounded surface dan separator policy terbaru.

## 2026-09-16 — Seating, Roster, Usher & Beranda Final Surface Pass

### Tujuan
Menyelesaikan penyelarasan visual dashboard utama agar `Manajemen Tamu`, `Usher`, dan `Beranda` memakai bahasa surface yang sama dengan RSVP, Undangan Digital, dan Rangkaian Acara: panel fungsional yang cepat dipindai, border tipis, radius kecil, copy ringkas, dan divider horizontal minimum.

### SeatingChart & Manajemen Tamu
- `components/Dashboard/SeatingChart.tsx` tidak lagi memakai satu layout besar dengan `border-y`, sidebar divider, dan roster berbasis garis antar-item.
- Setup meja, roster tamu, dan seating canvas sekarang menjadi tiga functional surfaces dengan neutral background, border semantic, dan radius sekitar `12px`.
- Setup meja menampilkan jumlah meja, kursi total, serta kursi terisi dalam compact information cells; form dan endpoint pembuatan meja tetap sama.
- Roster `Belum ditempatkan` menampilkan jumlah tamu eligible dan setiap tamu sebagai draggable rounded row dengan border ringan serta hover Rose tipis.
- Empty state roster sekarang berada dalam neutral rounded surface, bukan sekadar teks di antara divider.
- Seating canvas memakai rounded frame dan light neutral canvas `#FBFAFA` / dark neutral existing agar meja Rose tetap mudah terlihat tanpa menjadikan panel pink.
- Status penyimpanan, swap confirmation, dan feedback hasil mutation menjadi compact rounded surfaces; garis bawah panjang di area canvas dihapus.
- Drag/drop seat assignment, atomic swap, manual guest creation, seating eligibility, dan API/database flow existing tidak berubah.

### Beranda & Usher
- `app/globals.css` menambahkan final utility-card pass untuk wrapper workspace yang masih memakai primitive `Card`, termasuk `Manajemen Tamu` dan `Usher`.
- Wrapper card sekarang memakai radius `12px`, neutral surface tipis, dan Rose-mixed border yang sama dengan panel lain.
- Header internal `Card` yang sebelumnya memakai `border-b` panjang tidak lagi bergantung pada garis horizontal; spacing menjadi pemisah utama.
- Greeting block pertama pada Beranda diperlakukan sebagai neutral rounded identity surface sehingga hierarchy Beranda konsisten dengan stats dan quick-action cards.
- Grid statistik existing tetap memakai individual rounded information cells; quick access tetap menjadi rounded action controls.
- Tidak ada perubahan API, entitlement, guest state, routing, atau dashboard data source pada pass Beranda/Usher ini.

## 2026-09-16 — Dashboard Button Semantic Hierarchy Pass

### Tujuan
Membuat seluruh tombol dashboard mempunyai arti tindakan yang langsung terbaca tanpa melanggar aturan canonical button DC Organizer yang hanya memiliki satu treatment warna Rose.

### Keputusan Button Semantics
- Warna tidak dipakai sebagai pembeda arti aksi. Seluruh action button tetap menggunakan `components/ui/button.tsx` dan canonical Rose treatment; tidak ditambahkan variant hijau, merah, abu-abu, atau page-specific color baru.
- Arti tombol sekarang ditentukan melalui kata kerja yang eksplisit, Lucide icon yang relevan, size hierarchy, placement, `title`, dan `aria-label` untuk utility/icon action.
- Label noun-only/generic diperjelas: `Paket` menjadi `Kelola paket`, `Refresh` menjadi `Muat ulang`, `CSV` menjadi `Export CSV`, dan save event menjadi `Simpan rangkaian`.
- Menu akun diperjelas menjadi `Lihat transaksi`, `Kelola paket`, `Buka FAQ`, `Buka bantuan`, dan `Keluar akun` agar setiap row terdengar sebagai tindakan.
- Quick Access Beranda sekarang memakai icon domain + arrow sehingga `Rangkaian Acara`, `Undangan Digital`, `RSVP`, dan `Manajemen Tamu` terbaca sebagai navigational actions tanpa menambah paragraf penjelasan.
- Onboarding action menjadi `Simpan data & masuk` dengan confirmation icon.
- FeatureGate memakai label `Lihat paket ...` daripada generic `Upgrade Paket`, sehingga tombol menjelaskan destination/action, sementara entitlement tetap server-authoritative.

### Undangan Digital
- CTA `Studio` menjadi `Buka Studio`.
- Publish action menjadi `Terbitkan`; published state action menjadi `Tarik dari publik`, dengan icon berbeda tetapi palette yang sama.
- Password action menjadi `Aktifkan proteksi`, `Perbarui password`, dan `Matikan proteksi` dengan security icon yang sesuai.
- Copy-link tetap icon-only karena konteksnya sangat lokal, tetapi mempertahankan `title` dan `aria-label` eksplisit.

### RSVP
- Sort direction tidak lagi icon-only; tombol menampilkan `Urutan naik` / `Urutan turun` bersama icon.
- Export menjadi `Export CSV`.
- Row action `QR` dan manual check-in tidak lagi hanya icon. Tombol sekarang menampilkan `Buat QR` dan `Check-in`; tamu yang sudah hadir menampilkan disabled label `Sudah check-in`.
- Tombol close QR tetap icon-only sebagai convention standard, dengan `title` dan `aria-label`.

### Manajemen Tamu / Seating
- Generator menjadi `Buat denah meja`; state existing menjadi `Denah meja tersimpan`.
- Manual guest action menjadi `Tambah tamu manual`.
- Swap confirmation memakai `Tukar posisi`; cancel menjadi `Batal tukar`, masing-masing dengan icon yang relevan.
- Tidak ada perubahan mutation/API pada create table, guest creation, seat assignment, swap, QR, check-in, invitation publish, password, atau package routing.

### Affected files
- `app/[dashboard]/page.tsx`
- `app/globals.css`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/FeatureGate.tsx`

### Commits
- `ab35a93d776c710b00dd478fd192eba0043c0521`
- `d9b879c015867d077dc79a44c4cc8c0cfbed640e`
- `1e26183f5322ed7f9f87a8f721a6d6964c1102f9`
- `9e7f5dc13698d93161d630055684445a54c656bd`
- `b29e6376f623810556510c0cd32c9144b0f04cbb`
- `7468628979c79559b42770aca67ae0a6613c9058`
- `6eac637ad0aad2c6f53a02f26a037e89117acd60`
- `8b1c099f9c38d04039e4fd2cc74bab18b8b41200`
- `cd607c46097d60100dfd0639c29919db51962fb1`
- `87a796d1eb1311966160abca9b2e5b98a7e9f53e`
- `76dd3f7be3f5330748632c1522acd0655135de2f`
- `e69c1c2b8e719923d6693592df9bcb3b8b8f3329`
- `a708a75ca80496e46dd9eaaecb20c956d9cabec5`
- `1c0cb5c4d22ba2f03805778324afd81bb03b3a51`

### Validation
- Build/lint/CI belum diverifikasi pada environment repository.
- Perubahan tahap ini mempertahankan API/data flow existing dan berfokus pada visual hierarchy, compact functional surfaces, roster readability, serta semantic clarity seluruh dashboard action.