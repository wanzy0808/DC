# DC Wedding — PRD Implementation Addendum

Dokumen ini mencatat implementasi yang sudah dikerjakan di repository `wanzy0808/DC` tanpa mengubah PRD utama.

## 2026-09-12

### Invitation Password Protection
- Menambahkan field password protection pada `Invitation`.
- Menambahkan migration database.
- Menambahkan bcrypt password hashing dan signed access cookie.
- Menambahkan owner settings API untuk enable, disable, create, dan change password.
- Menambahkan public password verification endpoint.
- Menambahkan password gate pada public invitation dan special event invitation.
- Menambahkan sanitasi agar `passwordHash` tidak keluar melalui API.
- Menambahkan dashboard UI untuk pengaturan password invitation.
- Menambahkan `INVITATION_PASSWORD_SECRET` ke environment example.

### RSVP Analytics
- Menambahkan 6 metric RSVP pada dashboard.
- Menambahkan tabel analitik tamu RSVP.
- Menambahkan pencarian berdasarkan nama/nomor telepon.
- Menambahkan sorting nama/status, pax, dan check-in.
- Menambahkan export CSV.
- Menghubungkan panel analytics ke tab RSVP dashboard.

### RSVP Guest Actions
- Menambahkan endpoint server-side owner-authorized manual check-in.
- Menggunakan atomic update untuk mencegah duplicate check-in.
- Menghubungkan tombol QR pada tabel RSVP dengan endpoint QR tamu yang sudah ada.
- Menambahkan modal QR guest ticket pada dashboard RSVP.
- Menghubungkan tombol Check In Manual ke endpoint baru.
- Metric check-in membaca status aktual dari data Guest.

### RSVP QR Entitlement Fix
- QR guest ticket pada dashboard RSVP sekarang dapat dibuat untuk pengguna dengan paket Digital Invitation maupun Guest Book.
- Endpoint tetap memvalidasi kepemilikan guest terhadap invitation milik user.
- Token QR tetap menggunakan signed opaque guest identifier dari helper QR existing.
- Check-in manual dan Usher App tetap berada di entitlement Guest Book sesuai PRD.

### Guest Management Entitlement Correction
- Memastikan Manajemen Tamu menggunakan entitlement **Digital Invitation**, bukan Guest Book.
- Edit dan hapus tamu pada `/api/guests/manage` sekarang tersedia untuk pengguna dengan paket Digital Invitation.
- Pengguna Guest Book tetap mewarisi akses tersebut karena Guest Book mencakup Digital Invitation.
- Dashboard `Manajemen Tamu` menggunakan gate `hasDigitalInvitation`, bukan `hasGuestbook`.
- Label dan deskripsi UI menegaskan bahwa manajemen tamu, nomor meja, dan seat assignment termasuk Digital Invitation.
- Usher App dan operasional check-in tetap khusus entitlement Guest Book.

### Guest Management UI Gate
- Menghapus blocking popup pada halaman **Manajemen Tamu**, sehingga workspace tamu dapat dibuka tanpa tertahan modal upgrade.
- Proteksi entitlement tetap berada di server/API untuk operasi yang mengubah data tamu.
- **Usher App tetap menggunakan FeatureGate dan tetap dibatasi entitlement Guest Book.**

### Dashboard Invitation Feature Restoration
- Mengembalikan menu **Galeri & Foto** dan **Musik Undangan** yang sempat hilang dari sidebar dashboard setelah refactor workspace.
- Kedua menu kembali menggunakan entitlement **Digital Invitation**.
- Memulihkan panel **Undangan Digital** agar tidak hanya menampilkan tombol preview, tetapi kembali menyediakan workspace untuk Undangan Pernikahan dan Undangan Event Khusus.
- Menambahkan akses **Edit Desain**, **Preview**, **Kelola Asset**, dan **Pengaturan** dari workspace Undangan Digital.
- Menampilkan status draft/published dan ringkasan entitlement edit template, publish, serta custom asset.
- Tidak menghapus atau mengganti route Beranda.
- Tidak mengubah API entitlement; perubahan ini berfokus pada pemulihan fitur UI dashboard yang sebelumnya terpotong saat refactor.

### Complete Digital Invitation Management
- Memindahkan pengelolaan Undangan Digital ke komponen khusus `InvitationManagementPanel` agar halaman dashboard utama tidak terus menambah logic invitation.
- Dashboard sekarang memuat dua invitation independen dari `/api/invitations`: `WEDDING` dan `ADAT_AKAD`.
- Masing-masing invitation memiliki preview, salin link, Edit Desain, dan Publish/Unpublish sendiri.
- Publish/Unpublish tetap menggunakan authorization server-side pada `/api/invitations` dan hanya aktif untuk entitlement Digital Invitation.
- Menambahkan kembali kontrol Password Protection pada workspace Undangan Digital menggunakan endpoint password existing.
- Studio tetap terbuka untuk pengguna tanpa paket; publish tetap terkunci sebelum Digital Invitation aktif.
- Link event khusus menggunakan pola `/invite/[slug]/event-khusus` yang sudah tersedia pada public invitation route.

### Invitation Studio Type Deep Link
- `InvitationDesigner` sekarang membaca query `?type=ADAT_AKAD` dari URL saat pertama kali dibuka.
- Link **Edit Desain** untuk Undangan Event Khusus dari dashboard sekarang dapat membuka Studio langsung pada invitation `ADAT_AKAD`.
- Default tanpa query tetap `WEDDING`, sehingga akses `/dashboard/editor` lama tidak berubah.
- Pergantian tab WEDDING/ADAT_AKAD di dalam Studio tetap menggunakan data invitation terpisah dan endpoint `/api/invitations?type=...`.
- Perubahan ini tidak mengubah entitlement publish/custom asset; kontrol server/API existing tetap menjadi sumber authorization.

### Invitation Studio Custom Asset Entitlement
- Endpoint `/api/invitations/assets/upload` sekarang memvalidasi entitlement **Digital Invitation** di server sebelum menerima custom asset.
- Pengguna tanpa paket tetap dapat memakai Studio dan built-in assets, tetapi upload foto/musik custom ditolak dengan status `402` sampai paket Digital Invitation aktif.
- Batas foto custom ditegakkan menjadi maksimal **30 foto per undangan**, sesuai PRD.
- Musik custom dibatasi **1 sumber musik per undangan** agar konsisten dengan Studio yang menyimpan satu `musicUrl` aktif.
- Batas file tetap: gambar maksimal 15 MB sebelum optimasi WebP, audio maksimal 10 MB.
- Check entitlement menggunakan helper terpusat `hasPaidDigitalInvitation`, sehingga aturan UI/API tetap konsisten.

### Centralized Event Data / Single Source of Truth
- Menambahkan `components/Dashboard/EventPanel.tsx` sebagai editor utama data rangkaian acara untuk `WEDDING` dan `ADAT_AKAD`.
- Data pasangan, tanggal, timezone, waktu acara, venue, alamat, Google Maps URL, deskripsi, dan catatan acara sekarang diinput melalui **Rangkaian Acara** dan disimpan pada record `Invitation` yang sama.
- Invitation Studio tidak lagi menyediakan input ulang untuk nama pasangan, tanggal, waktu, venue, Maps, atau deskripsi acara.
- Studio menampilkan ringkasan data acara yang tersinkron dan hanya meminta field yang memang bersifat invitation-specific seperti hashtag dan dress code.
- Saat data acara diubah, Studio membaca ulang data database sehingga preview menggunakan sumber data yang sama.
- Editor event mempertahankan status publish saat menyimpan perubahan dan tidak melakukan unpublish secara tidak sengaja.
- Dua tipe undangan tetap memiliki record database terpisah (`WEDDING` dan `ADAT_AKAD`).

### Dashboard Onboarding Fix
- Memperbaiki race condition saat `/api/dashboard/context` dan `/api/invitations` dipanggil bersamaan pada first load. Context sekarang memastikan invitation `WEDDING` tersedia sebelum mengembalikan data onboarding.
- Dashboard sekarang memuat invitation `WEDDING` terlebih dahulu, kemudian mengambil context dan guest data, sehingga `invitationId` tersedia ketika onboarding disimpan.
- Penyimpanan onboarding selalu mengirim `type: "WEDDING"` dan memvalidasi response API sebelum menutup modal, sehingga modal tidak hilang jika data gagal disimpan.
- Copy onboarding diubah menjadi **“Hi, sebelum masuk”** dan **“Mari kita berkenalan”**.
- Deskripsi onboarding menjelaskan bahwa data dipakai untuk **judul undangan dan sapaan di dashboard**.
- Data onboarding tetap menjadi sumber data yang sama untuk invitation dan dashboard; tidak membuat form data pasangan kedua di Studio.

### Dashboard Profile Single Source of Truth
- Nickname dashboard sekarang sepenuhnya dibaca dari `User.firstName` di database.
- Menghapus ketergantungan dashboard terhadap cookie nickname agar nilai sapaan tidak berbeda antara session/perangkat.
- `/api/profile` juga membaca dan mengembalikan nama langsung dari database.
- Dengan demikian nama panggilan tidak diminta atau disimpan pada sumber kedua; dashboard, profile, dan onboarding menggunakan data yang sama.

### Onboarding → Event Data Single Source of Truth
- Invitation baru tidak lagi dibuat dengan data contoh `Rio & Lyvia` atau venue contoh yang terlihat seperti data pengguna.
- Record baru dimulai sebagai draft kosong; `WEDDING` dan `ADAT_AKAD` tetap menggunakan record database masing-masing.
- Endpoint invitation sekarang mengizinkan penyimpanan awal nama pasangan dari onboarding sebelum detail acara seperti venue dan tanggal dilengkapi.
- Venue dan tanggal menjadi wajib saat pengguna mencoba **Publish**, sehingga draft kosong tetap aman untuk tahap setup.
- Alur menjadi: **Onboarding → simpan nama pasangan + nickname → Rangkaian Acara melengkapi detail event → Studio membaca database yang sama**, tanpa meminta data inti dua kali.

### CI / Build
- GitHub Actions menggunakan Node.js 22 untuk kompatibilitas pnpm 11.
- Build validation pada commit Studio deep-link `b76cb466` berhasil.
- Build validation pada dokumentasi deep-link `bef7624c` juga berhasil.
- Perubahan custom asset entitlement pada commit `eca7fe3ced6feab34bdacf3aadc3bc09f9334bb6` menunggu workflow validation GitHub Actions.

### Dashboard Onboarding Save Hardening
- Mengubah penyimpanan onboarding dari dua request paralel menjadi urutan deterministik: **simpan invitation WEDDING terlebih dahulu, lalu simpan nickname pada User**.
- Response dari masing-masing API sekarang diperiksa dan pesan error server diteruskan ke UI, sehingga kegagalan tidak lagi terlihat seperti form hanya “nyangkut”.
- Setelah kedua penyimpanan berhasil, state dashboard langsung diperbarui dari data yang baru disimpan sebelum melakukan refresh context.
- Modal hanya ditutup setelah kedua sumber database berhasil disimpan.
- Tidak menambahkan cookie/localStorage atau sumber data kedua; database tetap menjadi single source of truth.

## Implementation Notes

- `prd.md` tetap menjadi product source of truth.
- `README.md` menjadi pedoman technology stack.
- `AGENTS.md` menjadi pedoman coding dan design system.
- `PRD-TAMBAHAN.md` mencatat perubahan implementasi dari sesi pengerjaan.
- Fitur Angpao/Kado dan status pengiriman QR belum dianggap benar-benar tracked karena schema saat ini belum memiliki field tracking tersebut; UI menampilkan status yang jujur (`—` / `Not tracked`) daripada mengarang data.
- Brand tetap **DC Wedding**. Tidak diganti menjadi Citin.
- Menu dan route **Beranda** tetap dipertahankan.
