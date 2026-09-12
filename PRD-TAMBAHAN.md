# DC Wedding — PRD Implementation Addendum

Dokumen ini mencatat implementasi yang sudah dikerjakan di repository `wanzy0808/DC` tanpa mengubah PRD utama.

## 2026-09-12

### Invitation Password Protection
- Menambahkan field password protection pada `Invitation`.
- Menambahkan migration database, bcrypt password hashing, signed access cookie, owner settings API, public verification endpoint, password gate, dan sanitasi `passwordHash`.
- Menambahkan dashboard UI untuk pengaturan password invitation.

### RSVP Analytics & Guest Actions
- Menambahkan metric RSVP, tabel analytics, pencarian, sorting, CSV export, QR guest ticket modal, dan manual check-in server-side.
- Check-in menggunakan atomic update untuk mencegah duplicate check-in.
- QR guest ticket tersedia untuk Digital Invitation dan Guest Book; Usher App/check-in tetap khusus Guest Book.

### Guest Management Entitlement
- Manajemen Tamu menggunakan entitlement Digital Invitation.
- Edit/hapus tamu, nomor meja, dan seat assignment mengikuti Digital Invitation.
- Usher App tetap menggunakan entitlement Guest Book.
- Menghapus blocking popup lama yang menghalangi workspace Manajemen Tamu.

### Dashboard Invitation Feature Restoration
- Mengembalikan Galeri & Foto, Musik Undangan, dan workspace Undangan Digital.
- Dashboard menyediakan pengelolaan WEDDING dan ADAT_AKAD, Preview, Salin Link, Edit Desain, Publish/Unpublish, asset, dan Password Protection.
- Tidak menghapus atau mengganti route/menu Beranda.

### Invitation Studio Type Deep Link
- Studio membaca `?type=ADAT_AKAD`.
- Edit Desain Event Khusus membuka Studio pada tipe yang benar.
- Tanpa query tetap membuka WEDDING.

### Invitation Studio Custom Asset Entitlement
- Upload custom asset divalidasi server-side menggunakan entitlement Digital Invitation.
- Foto maksimal 30 per invitation, maksimal 15 MB sebelum optimasi WebP.
- Musik custom maksimal 1 track per invitation, maksimal 10 MB.

### Centralized Event Data / Single Source of Truth
- `EventPanel` menjadi editor utama data rangkaian acara untuk WEDDING dan ADAT_AKAD.
- Data pasangan, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan disimpan pada `Invitation`.
- Studio membaca data database yang sama dan tidak lagi menjadi tempat input ulang data inti event.
- Field invitation-specific seperti hashtag dan dress code tetap dikelola di Studio.

### Dashboard Onboarding Fix & Single Source of Truth
- Memperbaiki race condition onboarding dan memastikan invitation WEDDING tersedia sebelum penyimpanan onboarding.
- Onboarding menyimpan nama pasangan ke WEDDING dan nickname ke `User.firstName`.
- Modal hanya muncul ketika data wajib belum lengkap; setelah tersimpan tidak meminta onboarding lagi pada login berikutnya.
- Menghapus implementasi onboarding duplikat pada `DashboardGate`.

### Dashboard Profile Single Source of Truth
- Nickname dashboard sepenuhnya membaca `User.firstName`.
- Tidak menggunakan cookie/localStorage sebagai sumber nickname kedua.

### Onboarding → Event Data Reuse
- Invitation baru dimulai sebagai draft kosong, tanpa data contoh Rio & Lyvia atau venue contoh.
- Nama pasangan berasal dari onboarding.
- Rangkaian Acara hanya melengkapi data event.
- WEDDING dan ADAT_AKAD tetap memiliki record database masing-masing.

### Duplicate Dashboard Feature Guard Removal
- Menghapus wrapper `DashboardFeatureGuard` yang memiliki click interceptor lama dan dapat memblokir Manajemen Tamu.
- Entitlement UI sekarang mengikuti gate dashboard yang benar dan authorization API tetap server-side.

### Invitation Password UI Hardening
- Password protection aktif tidak dapat tidak sengaja dimatikan karena input password baru kosong.
- Tombol Matikan digunakan khusus untuk menonaktifkan protection.

### Event Data Reuse / No Duplicate Couple Input
- Nama pasangan pada WEDDING berasal dari onboarding dan dibuat read-only pada Rangkaian Acara.
- ADAT_AKAD mengambil nama pasangan dari WEDDING bila draft belum memilikinya.
- Data event-specific tetap dapat diedit tanpa membuat sumber data pasangan kedua.

### Public Invitation Subdomain Routing
- URL publik utama menggunakan `https://[nama-pasangan].dcwedding.com`.
- Event Khusus menggunakan subdomain yang sama dengan path `/event-khusus`.
- Slug WEDDING lama dengan pola `-moment-[id]` atau `-akad-[id]` dapat dimigrasikan ke slug pasangan saat data pasangan disimpan.
- Slug bentrok diberi suffix numerik agar tetap unik.
- `proxy.ts` melakukan tenant routing berdasarkan subdomain.
- Route `/invite/[slug]` tetap dipertahankan untuk internal rewrite dan backward compatibility, bukan sebagai URL publik utama.
- Tidak ditemukan route/path `invite2` pada audit repository.

### No Mock Invitation Defaults
- Menghapus default schema `Rio`, `Lyvia`, dan `Gedung Pernikahan` dari model `Invitation`.
- Invitation baru menggunakan nilai kosong untuk nama pasangan dan venue sehingga database tidak membuat data pengguna palsu.
- Menambahkan migration untuk mengubah default PostgreSQL menjadi string kosong.
- Flow onboarding tetap menjadi sumber pengisian nama pasangan pertama.

### Event Panel Couple Lock
- Field nama pasangan pada Rangkaian Acara sekarang read-only untuk **WEDDING maupun ADAT_AKAD**.
- Rangkaian Acara tidak lagi menjadi tempat kedua untuk mengubah identitas pasangan.
- Jika data ADAT_AKAD kosong, nama pasangan tetap diambil dari WEDDING.
- Data yang dapat diedit di panel ini hanya data event: nama acara, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan.

## Implementation Notes

- `prd.md` tetap menjadi product source of truth.
- `README.md` menjadi pedoman technology stack dan sekarang mendokumentasikan arsitektur subdomain.
- `AGENTS.md` menjadi pedoman coding dan design system.
- Database adalah single source of truth untuk data bersama; hindari duplicate forms dan browser storage sebagai sumber data.
- Fitur Angpao/Kado dan status pengiriman QR belum dianggap benar-benar tracked karena schema saat ini belum memiliki field tracking tersebut; UI menampilkan status yang jujur daripada mengarang data.
- Brand tetap **DC Wedding**. Tidak diganti menjadi Citin.
- Menu dan route **Beranda** tetap dipertahankan.
