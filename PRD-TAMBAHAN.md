# DC Wedding — PRD Implementation Addendum

Dokumen ini mencatat implementasi yang sudah dikerjakan di repository `wanzy0808/DC` tanpa menghilangkan keputusan implementasi sebelumnya. `prd.md` tetap menjadi Master Product Requirements Document.

## 2026-09-12

### Invitation Password Protection
- Menambahkan password protection pada `Invitation`, migration, bcrypt hashing, signed access cookie, owner settings API, public verification endpoint, password gate, dan sanitasi `passwordHash`.
- Dashboard menyediakan pengaturan password invitation.
- Satu password melindungi root invitation dan event path pada subdomain yang sama.

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
- Dashboard menyediakan WEDDING dan ADAT_AKAD, Preview, Salin Link, Edit Desain, Publish/Unpublish, asset, dan Password Protection.
- Route/menu **Beranda** dan `/dashboard` tetap dipertahankan.

### Invitation Studio
- Studio mendukung deep link `?type=ADAT_AKAD`.
- Upload custom asset divalidasi server-side menggunakan entitlement Digital Invitation.
- Maksimal 30 foto per invitation dan 1 musik custom.
- Menghapus initial state contoh Rio, Lyvia, venue, tanggal, dan deskripsi.
- Studio membaca data event dari database dan tidak menjadi sumber input ulang untuk data inti.
- Preview mendukung alamat dan Maps, aman ketika tanggal belum tersedia, serta Undo/Redo ikut memulihkan dekorasi.

### Centralized Event Data / Single Source of Truth
- `EventPanel` menjadi editor utama data rangkaian acara WEDDING dan ADAT_AKAD.
- Data pasangan, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan disimpan pada `Invitation`.
- Nama pasangan berasal dari onboarding dan read-only pada Rangkaian Acara.
- ADAT_AKAD menggunakan data pasangan WEDDING bila draft belum memiliki data tersebut.
- Tidak membuat duplicate form untuk data yang sudah tersimpan di database.

### Dashboard Onboarding Fix
- Memperbaiki race condition onboarding dan memastikan invitation WEDDING tersedia sebelum penyimpanan.
- Onboarding menyimpan nama pasangan ke WEDDING dan nickname ke `User.firstName`.
- Modal hanya muncul ketika data wajib belum lengkap; setelah tersimpan tidak meminta onboarding lagi pada login berikutnya.
- Menghapus implementasi onboarding duplikat pada `DashboardGate`.
- Nickname dashboard membaca `User.firstName`, bukan cookie/localStorage.

### Dashboard Guard Cleanup
- Menghapus wrapper `DashboardFeatureGuard` yang memiliki click interceptor lama dan dapat memblokir Manajemen Tamu.
- Authorization API tetap server-side dan entitlement UI mengikuti gate yang benar.

### No Mock Invitation Defaults
- Menghapus default schema `Rio`, `Lyvia`, dan `Gedung Pernikahan` dari model `Invitation`.
- Invitation baru menggunakan nilai kosong sehingga database tidak membuat data pengguna palsu.
- Menambahkan migration PostgreSQL untuk default string kosong.

### Event Panel Couple Lock
- Nama pasangan pada Rangkaian Acara read-only untuk **WEDDING maupun ADAT_AKAD**.
- Data yang dapat diedit pada panel ini hanya data event: nama acara, tanggal, timezone, waktu, venue, alamat, Maps, deskripsi, dan catatan.

### Canonical Public Invitation URL — Event Name Path
- URL publik utama: `https://[nama-pasangan].dcwedding.com/`.
- URL event: `https://[nama-pasangan].dcwedding.com/[nama-event]`.
- `[nama-pasangan]` berasal dari slug pasangan pada invitation WEDDING.
- `[nama-event]` berasal dari nama event database, saat ini `Invitation.title` pada record `ADAT_AKAD`, melalui helper `slugifyEvent()`.
- Tidak membuat field/input event name kedua hanya untuk URL.
- `proxy.ts` melakukan tenant routing berdasarkan subdomain dan meneruskan path event ke `/invite/[slug]/[eventSlug]`.
- Route event memvalidasi `eventSlug` terhadap nama event database sebelum menampilkan invitation.
- `/event-khusus` lama tetap sebagai compatibility alias, bukan canonical public URL.
- `/invite/[slug]` tetap untuk internal routing/backward compatibility.

### Dashboard Canonical URL Fix
- `InvitationManagementPanel` sekarang membentuk URL dari subdomain pasangan yang sebenarnya: `https://[nama-pasangan].dcwedding.com`.
- Link event khusus menggunakan slug nama event dari database.
- Jika nama event belum diatur, dashboard tidak membuat URL dengan placeholder palsu dan menampilkan `Nama event belum diatur`.
- Preview dan Salin Link menggunakan URL canonical yang sama.

## Implementation Notes

- `prd.md` adalah Master Product Requirements Document / source of truth produk.
- `README.md` adalah pedoman technology stack dan arsitektur teknis publik.
- `AGENTS.md` adalah pedoman coding dan design system.
- Database adalah single source of truth untuk data bersama; hindari duplicate forms dan browser storage sebagai sumber data.
- Fitur Angpao/Kado dan status pengiriman QR belum dianggap benar-benar tracked karena schema saat ini belum memiliki field tracking tersebut; UI menampilkan status yang jujur daripada mengarang data.
- Brand tetap **DC Wedding**. Tidak diganti menjadi Citin.
- Menu dan route **Beranda** tetap dipertahankan.
- Jangan menghapus route legacy selama masih dibutuhkan untuk backward compatibility tanpa migrasi yang aman.
