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

### Affected files
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `app/globals.css`

### Commits
- `ab35a93d776c710b00dd478fd192eba0043c0521`
- `d9b879c015867d077dc79a44c4cc8c0cfbed640e`
- `1e26183f5322ed7f9f87a8f721a6d6964c1102f9`
- `9e7f5dc13698d93161d630055684445a54c656bd`
- `b29e6376f623810556510c0cd32c9144b0f04cbb`
- `7468628979c79559b42770aca67ae0a6613c9058`

### Validation
- Build/lint/CI belum diverifikasi pada environment repository.
- Perubahan tahap ini mempertahankan API/data flow existing. Flow Rangkaian Acara sekarang menyederhanakan presentation layer dengan satu editor aktif dan optional additional-event selector.