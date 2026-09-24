# DC Organizer — Master Product Requirements Document

**Document Status:** Single Source of Truth  
**Brand:** DC Organizer  
**Repository:** `wanzy0808/DC`  
**Last Consolidated:** 18 September 2026  
**Implementation History:** Appendix A (same file)

> Dokumen ini adalah **single source of truth** DC Organizer dan menggantikan requirement yang sebelumnya tersebar di `prd.md`, `prd1.md`, `prdnew.md`, `prd-tambahan.md`, serta PRD legacy lain. Requirement aktif berada di badan utama; histori implementasi disimpan di **Appendix A** pada file yang sama. Jika histori lama bertentangan dengan requirement canonical, **requirement canonical di badan utama yang berlaku**.

---

## 1. Product Vision & Scope

DC Organizer adalah **general-event digital invitation & event operations SaaS**, bukan wedding-only SaaS.

Platform mendukung lifecycle acara dari pembuatan event sampai distribusi undangan dan operasional onsite:

`Account → Event Setup → Invitation Design → Publish → Distribution → RSVP → Guest & Seating → QR / Onsite Check-in`

Jenis event yang didukung minimal:
- `WEDDING` — Pernikahan;
- `SILVER_WEDDING` — Silver Wedding;
- `GOLDEN_WEDDING` — Golden Wedding;
- `BIRTHDAY` — Ulang Tahun;
- `BABY_SHOWER` — Baby Shower;
- `OTHER` — Event Lainnya.

Platform harus dapat berkembang ke engagement, anniversary, corporate/private event, gathering, dan event lain tanpa memaksa data couple/wedding.

Customer-facing brand wajib **DC Organizer**. Nama lama seperti DC Wedding/Citin tidak boleh diperkenalkan kembali pada surface baru.

---

## 2. Canonical Product Lifecycle

### 2.1 Event → Invitation → Publish

Flow utama yang wajib dipertahankan:

1. User klik **`Tambah acara`**.
2. Form acara dibuka tanpa membuat blank database row baru hanya karena form dibuka.
3. User mengisi data acara.
4. User klik **`Simpan acara`**.
5. Server memvalidasi data minimum dan menyimpan event ke PostgreSQL/Prisma.
6. Event menjadi `eventConfigured = true`.
7. User klik **`Buat undangan`**.
8. Invitation Studio membuka event tersebut menggunakan `invitationId` yang tepat.
9. User memilih template.
10. User mengedit desain/konten Studio.
11. User klik **`Simpan desain`**.
12. `Invitation.templateKey` dan data desain tersimpan ke database.
13. User klik **`Publish`**.
14. Jika event belum memiliki Digital Invitation entitlement, user diarahkan ke paket Rp150.000 untuk `invitationId` tersebut.
15. Setelah entitlement aktif, server mengizinkan publish.
16. Public invitation dapat dibuka dan didistribusikan.
17. Selama `isPublished = false`, user boleh mengedit atau menghapus Rangkaian Acara miliknya.
18. Setelah `isPublished = true`, data Rangkaian Acara menjadi terkunci: user tidak dapat mengedit detail event, menghapus event, atau mengembalikannya menjadi draft/unpublished melalui flow customer biasa.
19. Lock setelah publish wajib ditegakkan server-side; menyembunyikan tombol Edit/Hapus di UI bukan security boundary.

Legacy blank draft dari implementasi lama boleh direuse oleh backend saat menyimpan event agar tidak menghasilkan orphan/duplicate record, tetapi blank draft **bukan** flow produk baru.

### 2.2 Server publish gate

Public invitation hanya boleh diterbitkan apabila seluruh kondisi berikut terpenuhi:
- event dimiliki user yang berhak;
- `eventConfigured = true`;
- data minimum event valid;
- `templateKey` tidak kosong;
- Digital Invitation entitlement untuk event tersebut aktif;
- request publish lolos validasi server.

UI bukan security boundary. Request API yang mencoba melewati urutan tersebut tetap harus ditolak server.

Setelah publish berhasil, Rangkaian Acara bersifat immutable untuk customer: event-detail mutation, unpublish, dan delete harus ditolak backend. Invitation Studio tetap dapat dibuka sesuai capability yang tersedia; lock ini khusus pada identitas/detail Rangkaian Acara dan lifecycle record event.

---

## 3. Technical Stack & Engineering Principles

### 3.1 Core stack

- Framework: Next.js App Router / Turbopack.
- Runtime: Node.js >= 22 LTS.
- Package manager: pnpm >= 11.
- Language: TypeScript.
- Database: PostgreSQL.
- ORM: Prisma ORM.
- CSS: Tailwind CSS v4.
- Components: shadcn/ui patterns.
- Icons: Lucide React.
- Animation: Motion via `motion/react`.
- Seating canvas: Konva / `react-konva`.
- Image processing: Sharp.
- Deployment target: Hostinger VPS / Linux.
- CI/CD: GitHub Actions build validation.

### 3.2 Architecture principles

- **Extend Over Replace:** pertahankan route, API, schema, dan data flow existing bila masih kompatibel.
- **PostgreSQL/Prisma is the source of truth:** jangan membuat mock/fake invitation sebagai data produk.
- **Server-authoritative:** authorization, payment entitlement, quota, capacity, seating collision, publish, dan sensitive mutation harus divalidasi backend.
- **Event-scoped isolation:** guest, RSVP, seating, Personal Invitation, WA Blast, check-in, dan entitlement tidak boleh bocor antar-event.
- **Backward compatibility:** route/field legacy yang masih diperlukan boleh dipertahankan sampai ada migration plan eksplisit.
- `/dashboard`, Beranda, Pintu, dan protected Rose petals adalah product foundation yang tidak boleh dihapus tanpa requirement eksplisit.
- `app/globals.css` dan semantic theme token adalah basis styling aplikasi.
- **Production schema synchronization:** deployment yang membawa Prisma migration baru wajib menjalankan `prisma migrate deploy` / `pnpm db:deploy` terhadap `DATABASE_URL` production. GitHub Build Validation / `pnpm build` tidak dianggap bukti bahwa migration production sudah diterapkan.

---

## 4. Account, Authentication & Roles

### 4.1 Registration & onboarding

Registration awal minimal meminta:
- email;
- password;
- konfirmasi password;
- Terms/Privacy consent.

Dashboard onboarding untuk user umum hanya membutuhkan profil workspace seperti `firstName` / nama panggilan. Data couple tidak boleh menjadi requirement universal.

Data event diisi ketika user membuat Rangkaian Acara.

### 4.1g Profil akun dan keamanan (23 September 2026)

Customer dashboard menyediakan Profil Saya untuk melihat/mengubah nama depan, nama belakang, foto profil pribadi (bukan foto event), dan menampilkan email akun sebagai read-only. Foto JPG/PNG/WebP maksimal 5 MB divalidasi dan ditranscode Sharp ke WebP sebelum disimpan dengan nama acak di folder per-user; URL disimpan di `User.avatarUrl`. Header menampilkan avatar tersimpan, fallback inisial jika belum ada foto. Pengaturan Akun menyediakan ganti password dengan verifikasi password saat ini, hash bcrypt baru dan pencabutan sesi sebelumnya, kemudian membentuk sesi aktif baru. Seluruh mutasi akun diperiksa server-side melalui sesi; user tidak boleh mengubah profil pengguna lain. Email change, provider OAuth password reset, dan pengelolaan notifikasi bukan bagian scope tahap pertama ini.


### 4.1a Konsistensi visual Login dan Daftar (22 September 2026)

Masuk (`/login`) dan Daftar (dialog yang dibuka dari menu navbar maupun tombol Daftar di login) memakai identitas UI publik DC Organizer yang sama: tipografi Cinzel untuk heading, Fauna One untuk label/form, warna Rose sebagai aksen, permukaan popup putih dengan glow pink tipis dalam kedua mode (bukan card gelap saat Dark Mode), outline Rose, CTA Rose, dan kolom input serta tombol berbentuk pill sesuai token global `--dc-control-radius`. Kartu login lebar baca sekitar 480px di tengah halaman yang responsif; dialog pendaftaran lebar sekitar 490px dengan scroll internal ketika tinggi layar terbatas agar kolom, checkbox dan tombol dapat dijangkau di mobile. Navbar, footer, latar/kelopak global dan brand `BrandWordmark` tetap milik layout bersama; jangan menduplikasi dekorasi/pemutar musik atau mengubah landing Pintu.

Kedua formulir memakai Google Icon dan kelas visual form yang sama melalui `components/Auth/`, mendukung ID sebagai bahasa default serta label EN lewat LanguageProvider, fokus keyboard yang terlihat, label input eksplisit, tombol lihat/sembunyikan kata sandi, serta pesan error `role="alert"`. Pendaftaran tetap meminta email, password minimal delapan karakter, konfirmasi password, Terms/Privacy consent dan pilihan newsletter seperti semula; layanan Google, respons API, verifikasi email, redirect `next` yang aman, dan role-based routing tetap dipertahankan. Masuk dan Daftar dari burger menu harus membuka dialog tanpa berpindah halaman. Tautan login/register lama (mis. `/login?register=1&next=...`) tetap berfungsi melalui redirect ke beranda dengan query `auth=register`/`auth=login` yang memunculkan dialog bersama; berpindah Masuk ↔ Daftar di dalam dialog tidak boleh membuat burger menu tertinggal. Jangan membuka Studio/area privat melalui perubahan visual ini.

### 4.1b Shared auth component styling refinement (22 September 2026)

Login dan Daftar harus terlihat sebagai satu keluarga komponen, bukan sekadar memakai warna yang sama. `components/Auth/auth-styles.ts` menjadi sumber kelas bersama untuk card surface, decorative Rose eyebrow, title, description, label, field, password-toggle, Google action, separator, error, submit, secondary link dan consent/choice box. Login dan Register memakai ritme spacing, tipografi, outline Rose, radius, shadow dan state Light/Dark yang sama. Dialog Daftar tetap dapat scroll di layar pendek dan close `X` tetap mendapat ruang. Perubahan visual tidak boleh mengubah endpoint auth, Google OAuth, safe `next` redirect, verifikasi email, validasi password/Terms, atau role routing.

### 4.1c Login/Daftar sebagai dialog terpusat (22 September 2026)

Tombol **Masuk** dan **Daftar** di burger menu marketing/public membuka modal bersama pada halaman yang sedang dilihat, bukan membuka halaman Login tersendiri. Dialog berada di global `components/Auth/AuthDialogHost.tsx` sekali dari root layout di luar subtree burger, sehingga menutup burger tidak me-unmount dialog. `LoginDialog.tsx` mempertahankan login email/password, Google OAuth, role-based redirect, error server dan toggle password; `RegisterDialog.tsx` tetap punya ketentuan password, consent dan registrasi asli. Aksi link silang Masuk ↔ Daftar berpindah isi dialog yang sama; setelah mendaftar berhasil, tampilkan pemberitahuan verifikasi email pada dialog Masuk. URL lama `/login`, `/login?register=1`, dan `/login?error=google_...` tetap menjadi entry point kompatibel: redirect ke `/?auth=login|register&next=...` untuk membuka popup; `next` harus disanitasi sebagai path internal sebelum dipakai. Jangan mengganti API/auth callback maupun memberikan akses private dari UI saja.

Popup mengikuti viewport, bukan koordinat parent navbar: kelas visual `authCardClass` TIDAK boleh menimpa `position:fixed` milik `DialogContent`. Pada desktop letakkan modal di pusat layar, gunakan padding dan gap yang lebih ringkas untuk Daftar dan `max-height` relatif terhadap `dvh` dengan scroll **di dalam dialog** jika layar pendek. Pada mobile sisakan ruang tepi dan pastikan tombol, consent, maupun close X tetap dapat diakses. Hindari dua popup atau overlay bertumpuk dengan menempatkan satu dialog owner di root layout. Backdrop/popup auth harus berada di atas widget navigasi marketing mengambang (z-index modal lebih tinggi daripada mini-door) dengan overlay override yang spesifik auth, bukan menaikkan semua dialog secara global.

### 4.1d Restore burger and align auth backgrounds to landing (22 September 2026)

Perubahan modal Masuk/Daftar **tidak boleh mengubah layout/animasi navigasi burger** yang sudah disetujui: posisi, dimensi, urutan item, animasi, submenu Layanan dan markup visual lama tetap dipakai. **Seluruh label dan ikon item burger berwarna Rose** (`text-primary`, `dark:text-primary`) dalam kondisi default; jangan membiarkan `text-foreground`/`dark:text-foreground` menimpa Rose atau membiarkan warna teks default Button menimpa teks Daftar. Item Masuk mempertahankan tampilan `Link` awal dan hanya membatalkan navigasi untuk membuka dialog pada halaman yang sedang terlihat; item Daftar tetap memakai `Button` bersama, bukan native button yang dapat berbeda stylenya. `Navbar.tsx` dan halaman landing/Pintu tidak dirombak untuk kebutuhan auth.

Background **kedua dialog auth** memakai permukaan **putih pada Light dan Dark Mode**, dengan hanya sedikit radial glow Rose (bukan `bg-background` yang menjadi hitam di Dark Mode). Semua label, field, helper text, Google button dan copy sekunder di panel putih harus memiliki warna teks gelap yang tetap terbaca di kedua mode. Overlay Rose transparan tidak boleh menggelapkan bunga/kelopak marketing sampai hilang. Jangan memasang lapisan bunga, kelopak, atau pemutar audio duplikat di dalam popup; gunakan ambience yang sudah dimount oleh halaman di belakangnya. Modal tetap di atas widget mengambang dan formulir tetap readable pada tema light/dark.

### 4.1e Kebijakan Privasi publik dan UI baseline terkunci (22 September 2026)

**Visual freeze:** Atas permintaan owner, gaya burger menu dan dialog Masuk/Daftar yang sekarang wajib dipertahankan pada pekerjaan legal/content mendatang: markup/layout, item/submenu, hover/animasi, ikon dan teks default Rose, serta kedua dialog putih dengan glow pink tipis dan form text gelap pada kedua mode. Tidak boleh merombak `BurgerMenuContent`, `Navbar`, `auth-styles`, `LoginDialog`, `RegisterDialog`, atau `ui/dialog` untuk perubahan konten seperti Privacy Policy tanpa permintaan eksplisit. Pernyataan aturan lama yang bertentangan (burger berteks hitam atau card auth dark) dinyatakan tidak berlaku.

**Kebijakan Privasi:** `/privacy-policy` menampilkan naskah Bahasa Indonesia yang diberikan owner dengan nama layanan lama “Viding” diganti “DC Organizer”; tersedia terjemahan EN sesuai language toggle existing. Struktur dan isi klaim inti naskah (data dari pendaftaran/form, pengumpulan data teknis otomatis, analisis anonim/agregat, pemrosesan internal, kemungkinan pihak ketiga dan pembatasan penggunaan mereka, tidak menjual/menyewakan data, notifikasi perubahan satu hari sebelumnya, pengakuan saat memakai layanan) dipertahankan. Link dari consent Daftar wajib membuka `/privacy-policy` dalam tab baru tanpa menutup popup/form pendaftaran atau mencentang checkbox secara otomatis; label Privacy Policy yang sudah ada di footer publik harus memiliki href menuju halaman tersebut tanpa mengubah desain footer. Link Syarat & Ketentuan hanya boleh ditambahkan jika halaman ketentuannya sudah tersedia; halaman `/terms-and-conditions` kini disediakan berdasarkan naskah yang dikirim owner, dengan penyuntingan untuk menghindari identitas dan janji operasional perusahaan lain.

**Pemeriksaan sebelum produksi:** Isi policy berasal dari materi owner, bukan audit pengumpulan data aplikasi yang diverifikasi. Klaim penggunaan analytics/geo-location, pihak ketiga, kontrak pembatasan, tidak menjual data, dan pemberitahuan satu hari harus disesuaikan dengan praktik nyata, provider yang dipakai dan kebutuhan hukum sebelum produksi. Jangan menjanjikan kepatuhan regulasi semata-mata karena halaman sudah ditambahkan.

### 4.1f Syarat & Ketentuan publik dari sumber owner (22 September 2026)

Halaman `app/terms-and-conditions/page.tsx` menyediakan route publik `/terms-and-conditions` dalam Bahasa Indonesia dan Inggris sesuai `LanguageProvider`. Sumber awal yang diberikan owner adalah teks ketentuan Viding, yang memuat ketentuan umum, definisi, penggunaan, konten pengguna, biaya, jaminan, pembatasan tanggung jawab, hak kekayaan intelektual, kebijakan privasi, komisi mitra, dan lain-lain; struktur topik tersebut dipertahankan dalam draft yang disesuaikan untuk DC Organizer.

**Koreksi wajib terhadap materi pihak ketiga:** Jangan mencantumkan PT Aku Bisa Ibadah sebagai badan hukum DC Organizer, alamat/domain/email Viding, angka minimum usia tanpa keputusan bisnis/legal dan enforcement, jadwal pencairan komisi 1–3 hari tanpa program mitra yang benar-benar tersedia, atau lisensi konten selamanya/irrevocable/sublicensable serta pelepasan hak moral secara sepihak. Draft menyatakan kepemilikan Konten Pengguna tetap pada pemegang hak dan izin pengolahan konten hanya sebatas pelaksanaan fitur/publikasi sesuai pilihan pengguna. Klausul garansi/tanggung jawab wajib tidak menyatakan penghapusan semua hak konsumen/kewajiban pelindungan data. Rincian biaya/paket mengikuti penawaran nyata; jadwal/aturan program mitra diatur terpisah jika ada.

**Navigasi dan consent:** Link Syarat & Ketentuan pada label consent di `RegisterDialog` membuka route baru di tab baru, di samping link Kebijakan Privasi yang sudah ada; kedua tautan tidak boleh memeriksa checkbox secara otomatis, menutup popup, mereset field, atau mengubah styling form. Footer publik memberi href `/terms-and-conditions` pada label Syarat & Ketentuan yang sudah ada tanpa mengubah layout/warna. Halaman terms mengikuti shell legal halaman privacy, bukan mengubah landing/Pintu. Semua aturan visual freeze di §4.1e dan `AGENTS.md` tetap berlaku.

**Pra-produksi:** Draft Terms ini belum disetujui penasihat hukum/owner sebagai kontrak operasional final. Konfirmasi data badan hukum serta kontak, pembelian/pembatalan/refund, hak penggunaan media, eligibilitas usia, praktik proteksi data, dan program mitra dengan sistem DC Organizer aktual sebelum dipakai secara komersial.

### 4.2 System roles

Role aplikasi yang tetap dapat digunakan untuk backoffice:
- `OWNER` → `/owner`;
- `ADMIN` → `/admin`;
- `FINANCE` → `/admin` untuk payment/financial operation;
- `DESIGNER` → `/designer`;
- `EDITOR` → legacy designer-compatible role;
- `USER` → `/dashboard`.

Authorization route dan mutation harus dilakukan server-side.

### 4.3 Planned event-team access — P1

Event harus mendukung multi-user/team access melalui model seperti `EventMember`:
- `eventId`;
- `userId`;
- `role`;
- `permissions`;
- `invitedAt`;
- `acceptedAt`.

Default event roles:
- **Owner:** full event access;
- **Admin:** hampir seluruh operasional event;
- **Wedding Organizer / Event Operator:** Guest List, RSVP, Seating, Usher, Guestbook; tanpa Billing, Subscription, Payment Account, atau Digital Gift configuration;
- **Usher:** guest search, QR scan, check-in, table information.

Permission harus diperiksa API/backend, bukan hanya hidden menu.

---

## 5. Event Data Model & Rangkaian Acara

### 5.1 Event identity

`Invitation` saat ini tetap menjadi aggregate utama untuk event + digital invitation demi backward compatibility.

Field penting:
- `id`;
- `ownerId`;
- `slug`;
- legacy `type`;
- `eventCategory`;
- `title`;
- legacy `groomName` / `brideName`;
- optional wedding identity `groomFatherName` / `groomMotherName` / `groomChildOrder` / `brideFatherName` / `brideMotherName` / `brideChildOrder`;
- `venue`;
- `address`;
- `mapUrl`;
- `timezone`;
- `eventDate`;
- `eventConfigured`;
- `ceremonyTime` / `receptionTime` sebagai compatibility timing fields;
- `description`;
- `eventNotes`;
- `templateKey`;
- `musicUrl`;
- `isPublished`;
- `viewCount`;
- `waBlastQuota`.

Legacy field names tidak boleh dianggap universal wedding semantics. `groomName`, `brideName`, `weddingHashtag`, `WEDDING`, dan `ADAT_AKAD` dipertahankan sementara sebagai compatibility storage/routing sampai migration strategy ditentukan. Field nama orang tua hanya berlaku pada `WEDDING` dan tidak boleh dipaksakan ke category event lain.

### 5.2 Unlimited event creation

Tidak ada business rule maksimal 3 event.

User dapat membuat event sesuai kebutuhan. Setiap event diaktifkan/dibayar secara independen.

### 5.3 Event category behavior

Dynamic name fields:
- Pernikahan → nama pengantin pria + wanita; secara opsional dapat menyimpan nama bapak dan ibu untuk masing-masing pengantin;
- Silver/Golden Wedding → nama pasangan 1 + pasangan 2;
- Birthday → satu nama utama;
- Baby Shower → nama keluarga/calon bayi;
- Event Lainnya → custom event title.

Untuk `WEDDING`:
- parent identity bersifat opsional;
- masing-masing pengantin memiliki field nama bapak dan nama ibu sendiri;
- jika salah satu atau kedua nama orang tua tersedia, Studio preview dan public invitation otomatis menampilkan parent line di bawah nama pengantin;
- user dapat mengisi `Anak keberapa` secara opsional untuk masing-masing pengantin;
- format canonical pengantin pria ketika urutan anak tersedia: **`Putra pertama dari Bapak <nama bapak> & Ibu <nama ibu>`**;
- urutan anak 1–10 menggunakan kata Indonesia (`pertama`, `kedua`, dan seterusnya), sedangkan nilai di atasnya menggunakan bentuk `ke-N`;
- format canonical pengantin wanita menggunakan **`Putri`** dengan aturan urutan yang sama;
- jika urutan anak kosong, renderer tetap menampilkan `Putra dari ...` / `Putri dari ...`;
- jika hanya satu parent yang diisi, renderer hanya menampilkan parent yang tersedia dan tidak membuat placeholder kosong;
- data parent tidak menjadi syarat `eventConfigured` maupun Publish.

Title predefined category dapat digenerate dari category + identity, misalnya:
- `Pernikahan Rio & Lyvia`;
- `Silver Wedding Budi & Ani`;
- `Ulang Tahun Olivia`;
- `Baby Shower Keluarga Wijaya`.

### 5.4 Required fields before configured

Server minimal memerlukan:
- event category/title;
- identity/name sesuai category;
- event date;
- start time;
- venue.

Optional:
- untuk WEDDING: nama bapak/ibu dan urutan anak masing-masing pengantin;
- end time;
- address;
- Maps URL;
- description;
- notes.

### 5.5 Date/time UX

Field **Tanggal acara** wajib menggunakan input user-facing eksplisit:

`dd/mm/yyyy`

Contoh: `17/09/2026`.

Frontend harus:
- mendukung manual input `dd/mm/yyyy`;
- menyediakan icon/tombol kalender interaktif yang membuka date picker;
- hasil pilihan dari kalender harus kembali tampil sebagai `dd/mm/yyyy`, bukan format locale/browser lain;
- membatasi format menjadi 10 karakter;
- menyisipkan `/` secara konsisten;
- memvalidasi tanggal kalender nyata;
- menolak tanggal invalid;
- mengubah `dd/mm/yyyy` ke `yyyy-mm-dd` sebelum API/database;
- mengubah value database kembali ke `dd/mm/yyyy` saat edit.

Native/internal date input boleh menggunakan ISO `yyyy-mm-dd` sebagai bridge ke calendar picker selama format yang terlihat user tetap `dd/mm/yyyy`.

Field **Waktu mulai** dan **Waktu selesai** wajib memakai format 24 jam eksplisit:

`HH:mm` dengan rentang `00:00` sampai `23:59`.

Frontend harus:
- mendukung input manual `HH:mm`;
- menyediakan icon/tombol jam interaktif seperti pola calendar picker;
- picker aplikasi memilih jam `00–23` dan menit `00–59`;
- tidak menampilkan atau menyimpan format AM/PM;
- memvalidasi waktu 24 jam sebelum event disimpan;
- mempertahankan value `HH:mm` saat dibaca ulang dari database/API;
- `Waktu selesai` tetap opsional; jika user memilih **`Tampilkan “- end” di undangan`**, UI menonaktifkan input waktu selesai dan menyimpan sentinel internal `END` pada compatibility field `receptionTime`;
- renderer Studio dan public wajib menampilkan `- end` untuk sentinel tersebut, sedangkan `receptionTime` kosong tetap berarti tidak ada label waktu selesai.

Zona waktu yang didukung:
- WIB — `Asia/Jakarta`;
- WITA — `Asia/Makassar`;
- WIT — `Asia/Jayapura`.

### 5.6 Event list actions

State/action yang harus jelas:
- event belum tersimpan → `Simpan acara`;
- event tersimpan, belum punya desain → `Buat undangan`;
- desain sudah tersimpan → `Edit undangan` / `Buka Studio`;
- event dapat tetap diedit melalui `Edit acara`;
- event terbit → status `Terbit` dan public action.

---

### 5.7 Sesi pernikahan pada hari yang sama — requirement disetujui (implementasi pending)

Scope khusus `eventCategory = WEDDING`; jangan mengubah form acara umum atau mengasumsikan semua pasangan melakukan akad/pemberkatan. Label Indonesia default untuk prosesi gereja adalah **Pemberkatan Pernikahan** (bukan Holy Matrimony atau Pengukuhan). Pilihan jenis prosesi: **Akad Nikah**, **Pemberkatan Pernikahan**, atau **Prosesi Pernikahan** (netral). Label `Resepsi` tetap terpisah. Label dapat disesuaikan untuk kebutuhan upacara/adat lain tanpa mengganti kategori utama acara.

**Aturan paket dan tanggal**
- Satu record event/invitation hanya memiliki **satu tanggal acara (`eventDate`)**. Pernikahan dengan prosesi dan resepsi **pada tanggal kalender yang sama di zona waktu acara** boleh memiliki dua sesi pada satu event, satu undangan, satu pembayaran Digital Invitation/event. Lokasi dan jam tiap sesi boleh berbeda.
- Jika prosesi dan resepsi **pada tanggal yang berbeda**, user harus membuat **dua Rangkaian Acara**, masing-masing mempunyai `invitationId`, satu tanggal, template, publish gate, dan **paket Undangan Digital berbayar tersendiri**. Jangan menerima atau menyimpan tanggal kedua ke dalam satu event sebagai jalan pintas. Tampilkan petunjuk ini di form sebelum user membayar/menerbitkan.
- Mengisi/mengedit detail acara dan memilih desain boleh sebelum bayar; entitlement tetap ditegakkan di saat Publish sesuai lifecycle canonical, bukan saat memilih sesi. Jangan otomatis membuat invoice, duplicate event, atau menyembunyikan workspace persiapan.

**Rangkaian Acara → Pernikahan**
- Sediakan pilihan sesi: **Prosesi Pernikahan** (jenis: Akad Nikah / Pemberkatan Pernikahan / Prosesi Pernikahan) dan **Resepsi**. Minimal satu sesi aktif; boleh keduanya.
- Setiap sesi aktif memiliki input wajib **waktu mulai** dan **nama lokasi**; input opsional **waktu selesai, alamat, dan tautan peta**. Seluruh sesi berbagi **tanggal acara** dan **zona waktu** milik event. Jangan menyamakan `receptionTime` legacy (waktu selesai acara) dengan **waktu mulai resepsi**.
- Jika kedua sesi dipilih, user boleh mengatur jam dan lokasi berbeda pada tanggal yang sama. Form tidak memaksa prosesi untuk pengguna yang hanya mengadakan resepsi.
- Pada event non-pernikahan, form/jadwal existing tetap dipakai tanpa muncul istilah prosesi pernikahan.

**Pilihan tamu dan rendering**
- Satu undangan per tamu memiliki pilihan cakupan **Prosesi saja**, **Resepsi saja**, atau **Keduanya** jika kedua sesi aktif; bila hanya satu sesi aktif, cakupan otomatis sesi tersebut. Penentuan dilakukan pada daftar/manajemen tamu dan pembuatan/pengeditan Personal Invitation, bukan pada field global event yang akan berlaku untuk semua tamu.
- Simpan cakupan per `Guest`, terikat pada `invitationId`. API validate bahwa pilihan bukan kosong, bukan sesi nonaktif, dan tidak bisa mengarah ke event lain. Saat memilih ulang tanggal/prosesi sebelum Publish, scope guest yang lama harus diperiksa/migrasi secara eksplisit; jangan diam-diam mengubah daftar undangan.
- **Tautan personal** hanya merender sesi yang diizinkan bagi tamu tersebut (waktu/lokasi/peta dan kalender), termasuk pada template alternatif dan preview personal. Filtering wajib dilakukan sebelum data masuk ke komponen publik; jangan hanya menyembunyikan blok via CSS. Tautan publik umum tidak dapat mewakili hak akses per tamu: untuk undangan bersesi terbatas gunakan tautan personal; UI admin diberi penjelasan agar tidak mengirim tautan generik sebagai undangan khusus.
- RSVP/QR dan check-in berikutnya perlu memiliki cakupan sesi yang konsisten: tamu yang mendapat dua sesi tidak boleh diasumsikan pasti hadir di keduanya hanya karena satu RSVP. Rancang data/migrasi dan skenario pengujian sesi sebelum mengaktifkan distribusi massal.
- Publikasi sebuah sesi **tidak berarti** semua tamu diundang ke sesi tersebut. Hak akses event-scoped, password, dan published state tetap berlaku.

**Compatibility dan urutan implementasi**
- Saat ini `Invitation.ceremonyTime` adalah **waktu mulai event**, sedangkan `Invitation.receptionTime` adalah **waktu selesai atau sentinel `END`**, bukan dua sesi. Jangan diam-diam menafsirkan data lama sebagai pemberkatan + resepsi.
- Implementasi harus mencakup perubahan model Prisma + migration, validasi create/update/publish di server, Rangkaian Acara UI, guest/personal invitation API + UI, seluruh renderer publik/preview, serta pengujian same-day/different-day, light/dark dan ID/EN sebelum dinyatakan selesai. Deploy dengan `pnpm db:deploy` untuk migration baru.
- **Status:** requirement/arsitektur tercatat; kode sesi, migrasi database, pilihan per tamu, dan filtering publik **belum diimplementasikan**. Jangan mengklaim fitur sudah tersedia dari perubahan dokumentasi ini.

## 6. Dashboard Information Architecture

### 6.0 Mainframe dashboard (pembaruan 23 September 2026)

Customer `/dashboard` menggunakan satu mainframe responsif ber-outline Rose yang membingkai sidebar, header, dan konten operasional sebagaimana komposisi landing, tanpa menyalin ilustrasi Pintu, bunga, music player atau animasi marketing. Sidebar Light putih dan Dark hitam dengan label Rose, hover Rose transparan dan menu aktif Rose solid dengan label putih; area konten Light putih dan Dark hitam, outline/pilihan/card penting memakai Rose seperti landing. Seluruh kartu kecil dan panel operasional di dalam dashboard memakai garis aksen kiri Rose yang **sama tebal, 0,3 cm**, dengan tiga sudut siku dan hanya kanan atas membulat; bentuk ini juga berlaku untuk daftar acara/undangan/tamu, RSVP, WA Blast, profil, check-in dan statistik. Lis tebal tidak berlaku untuk tombol, badge, input, modal, denah tempat duduk interaktif atau border mainframe luar. Frame memiliki tinggi tetap mengikuti viewport (mobile 90dvh/90vw, desktop inset 23–27px seperti marketing frame); hanya panel konten tengah yang scroll, sedangkan bingkai luar, navbar, dan sidebar menetap di dalam viewport. Navigasi drawer mobile dan backdrop juga berada di dalam frame, tidak menutupi area di luar bingkai. Brand memakai `BrandWordmark` sekali pada rail; header berisi judul page, kontrol tema/bahasa, serta menu pengguna. Seluruh konten dan interaksi dalam frame tetap berbasis data asli; layout mobile mempertahankan navigasi drawer. Ketentuan frame ini menggantikan deskripsi historis yang menempatkan header fixed melewati seluruh viewport. Beranda adalah contoh awal untuk audit panel lainnya.


Sidebar user:
- **Beranda**
- **Acara**
  - Rangkaian Acara
  - Undangan
  - Personal Invitation
  - WA Blast
- **RSVP**
- **Manajemen Tamu**
- **Usher App**

WA Blast ditampilkan sebagai submenu **Acara / Events**, sejajar dengan Rangkaian Acara, Undangan, dan Personal Invitation. Label navigasi dan heading cukup **WA Blast**, tanpa kata Add-on. Pembelian kuota tetap terpisah dari Undangan Digital; perubahan navigasi tidak mengubah entitlement atau harga.

Workspace yang menggunakan data event harus menyediakan explicit event scope. Tidak boleh diam-diam memilih event pertama jika user memiliki lebih dari satu event.

### 6.1 Dashboard access before Publish

Payment Digital Invitation **bukan gate untuk membuka isi dashboard**. Customer harus dapat masuk, melihat, dan menyiapkan workspace terkait invitation sebelum event dipublish atau sebelum Digital Invitation dibayar.

Canonical behavior:
- **Rangkaian Acara**, **Undangan/Studio**, **Personal Invitation**, **RSVP**, dan **Manajemen Tamu** tetap dapat dibuka sebelum Publish/payment;
- RSVP dan Manajemen Tamu tidak menampilkan activation/paywall overlay hanya karena `accessPaid = false`;
- Personal Invitation juga dapat dipersiapkan sebelum Publish; public delivery tetap bergantung pada lifecycle public invitation yang valid;
- apabila belum ada data karena undangan belum dibagikan, gunakan empty state normal agar user tetap dapat memahami fungsi halaman;
- payment gate Digital Invitation hanya ditegakkan ketika user menekan **Publish** di **Dashboard → Undangan Digital**; Studio hanya untuk menyusun dan menyimpan desain, tanpa tombol Publish atau pembayaran;
- public RSVP/personal invitation tidak dianggap usable untuk tamu sampai parent invitation memenuhi configured + saved template + published + entitlement gates;
- entitlement produk terpisah tetap berlaku: WA Blast tetap memakai quota/add-on sendiri dan Usher App tetap mengikuti Guestbook Digital bila diperlukan.

Tujuan UX: user dapat mengeksplorasi isi Dashboard dan menyiapkan operasional acara tanpa dipaksa membayar sebelum mencapai Publish.

### 6.2 Desktop dashboard shell

Pada desktop dashboard menggunakan **application workspace yang memanfaatkan layar lebar**, bukan centered legacy container yang berhenti di `1400px`.

Layout canonical:
- background/chrome header dashboard tetap membentang selebar viewport;
- primary header/content container menargetkan **80vw** sesuai desktop agent rule dan selalu dibatasi oleh lebar pane yang tersedia agar tidak overflow;
- logo **DC Organizer** menjadi anchor kiri header;
- sidebar dimulai tepat di bawah header/logo dan mempertahankan lebar navigasi yang stabil;
- main pane memakai seluruh sisa lebar viewport di sebelah sidebar, sementara page-level workspace di dalamnya tidak boleh kembali ke `max-width: 1400px`/`92vw`;
- pada viewport desktop yang sempit, available pane width mengalahkan target `80vw` sehingga sidebar tidak menyebabkan horizontal overflow;
- selector/form yang memang tidak membutuhkan full width boleh tetap compact agar mudah dibaca;
- tabel data tidak boleh dipaksa stretch memenuhi layar lebar: gunakan content-driven desktop width yang proporsional, row treatment yang jelas, dan horizontal overflow pada viewport yang lebih kecil;
- customer-facing page/component copy **tidak menggunakan decorative sequence numbering** seperti `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature label, atau numbered card. Gunakan label deskriptif; angka yang merupakan data nyata (tanggal, waktu, harga, jumlah, kapasitas, kuota, urutan anak, nomor telepon, metric) tetap ditampilkan.

### 6.3 Dashboard theme & language

Seluruh customer Dashboard dan nested workspace wajib mendukung **Light Mode + Dark Mode** melalui shared `ThemeProvider` dan semantic theme tokens. Tidak boleh membuat page-specific dark palette yang terpisah dari design system.

Canonical behavior:
- Light Mode tetap memakai canvas putih `#FFFFFF`, near-black text, dan Rose accent;
- Dark Mode memakai near-black `#0B0B0C`, white text, neutral dark surfaces, dan Rose accent yang sama;
- theme toggle harus tersedia dari Dashboard header pada desktop dan tetap dapat diakses pada mobile;
- surface/card/table/input/empty/loading/error state seluruh tab harus terbaca baik pada kedua mode;
- jangan memakai hardcoded light-only background/text bila semantic token tersedia.

Dashboard juga wajib mendukung **Bahasa Indonesia + English** menggunakan shared language state aplikasi:
- default locale adalah **Bahasa Indonesia (`id`)** ketika user belum memiliki preference tersimpan;
- language toggle harus tersedia di Dashboard;
- pilihan locale disimpan melalui mekanisme existing `dc_locale`;
- sidebar, header, Beranda, Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, form labels, empty state, status, dan dashboard-generated feedback harus mengikuti locale aktif;
- data milik user seperti nama acara, nama tamu, venue, notes, dan invitation content **tidak diterjemahkan otomatis**;
- value teknis/API/database tetap stabil; localization hanya mengubah presentation/copy.

---



## 7. Digital Invitation & Invitation Studio

### 7.1 Event-scoped Studio

Studio dibuka menggunakan exact `invitationId`:

`/dashboard/editor?type=<legacy-type>&invitationId=<event-id>`

`invitationId` adalah source event utama. Parameter `type` hanya compatibility fallback.

Studio tidak boleh kembali memakai global first-WEDDING assumption.

### 7.2 Event data inside Studio

Core event data berasal dari Rangkaian Acara dan dibaca sebagai synced event content:
- title / identity;
- optional wedding parent identity;
- date;
- time;
- timezone;
- venue;
- address;
- Maps;
- description;
- notes.

Studio fokus pada invitation-specific configuration:
- template;
- palette;
- typography template;
- decor/gallery;
- event tag/hashtag compatibility field;
- dress code;
- music;
- canvas undangan langsung sebagai pratinjau interaktif;
- save design. **Publikasi/pembayaran bukan kontrol Studio: hanya melalui Dashboard → Undangan Digital.**

### 7.2.1 Template-aware canvas & reusable sections

Invitation Studio wajib memperlakukan template sebagai **layout/composition**, bukan sekadar nama atau thumbnail katalog. Ketika user mengganti template, canvas harus langsung memperlihatkan struktur visual template yang dipilih tanpa perlu reload atau save terlebih dahulu.

Section invitation yang berulang harus dibangun sebagai reusable composition agar dapat dipakai lintas template tanpa menduplikasi business logic. Initial optional sections:
- **RSVP**;
- **Wishes**;
- **Gift / E-Angpao**.

Studio harus menyediakan kontrol on/off per section. Ketika dimatikan, section langsung hilang dari canvas; ketika dinyalakan kembali, section muncul lagi tanpa menghapus data event lain. Visibility section wajib tersimpan bersama saved design dan tetap event-scoped.

Core event identity/timing/location tetap tersinkron dari Rangkaian Acara. Section toggle tidak boleh membuat salinan kedua untuk data event tersebut.

`Botanical Ivory` menjadi reference/test template long-form mobile bernuansa ivory/botanical untuk menguji composition, section visibility, dan scrolling canvas. Reference visual tidak boleh menyebabkan aset desain pihak lain disalin langsung.

Pada tahap implementasi awal, visibility section dapat disimpan secara backward-compatible di `Invitation.templateKey` selama parser lama tetap aman. Final public renderer untuk setiap template harus pada akhirnya membaca visibility section yang sama; Wishes persistence sebagai data tamu merupakan capability terpisah dan tidak boleh dipalsukan dengan mock production data.


### 7.2.1a Studio: kanvas utama dan 15 kontrol (23 September 2026)

Studio mengikuti bahasa visual Dashboard/landing: eksterior Rose, satu frame viewport, interior putih/hitam, heading Cinzel, UI Fauna One, dan tombol canonical. Navigasi alat bersifat tenang dengan penanda aktif Rose; panel pengaturan dan kanvas scroll terpisah. Panel dapat disembunyikan pada desktop; HP memilih Pengaturan atau Undangan agar keduanya tetap terbaca. Brand tampil sekali melalui BrandWordmark, nama acara menjadi judul kerja, tanpa pengulangan judul/eyebrow/deskripsi. Canvas utama adalah pratinjau interaktif yang cukup; **tidak ada tombol atau modal Pratinjau kedua**. Watermark pembatasan konten prabayar yang sudah ada tetap mengikuti kontrak entitlement.

Kontrak terbaru terdiri dari **15 kontrol ON/OFF**: Amplop Digital, Sampul, Salam Pembuka, Identitas, Detail Acara, Tanggal & Waktu, Galeri/Media, Hitung Mundur, Lokasi, RSVP, Ucapan Tamu, Hadiah/E-Angpao, Penutup, Footer, Musik. Default seluruhnya ON; setiap template tetap mengimplementasikan semua bagian, sementara pelanggan boleh menyembunyikannya tanpa menghapus data. Ini menggantikan batas implementasi lama yang hanya menyediakan tiga toggle. Amplop OFF langsung membuka isi; musik OFF menghilangkan player dan audio. Tanpa amplop, musik mulai lewat tombol play manual agar sesuai pembatasan autoplay browser.

Simpan kompatibilitas `sections=` untuk RSVP/Wishes/Gift dan `hidden=` untuk bagian tambahan pada design key event yang sama; tidak membuat schema/API baru. Desain lama mempertahankan nilai tiga toggle dan seluruh bagian tambahan ON. Kedua renderer nyata membaca kontrak sama untuk Studio dan publik. Nama font heading/body ditulis dengan font masing-masing; font katalog dimuat saat diperlukan. Romantic Rose tetap mengunci palet/font dan menjelaskan alasan alih-alih menawarkan kontrol yang diabaikan renderer. Hashtag/dress code yang belum disimpan harus terlihat langsung di pratinjau. Studio **tidak menampilkan tombol Terbitkan**; publish tetap hanya melalui Dashboard → Undangan Digital, setelah desain tersimpan dan seluruh syarat pembayaran/konfigurasi terpenuhi. Simpan Desain tidak mengirim ulang status publikasi lama.

### 7.2.1b Kembalikan ke Default dan koleksi musik (23 September 2026)

Tombol **Kembalikan ke Default** mengembalikan palet, font, dan 15 visibility flag ke preset tema yang sedang dipilih (semua flag ON). Tidak mengganti tema atau menghapus foto, pilihan musik, maupun isi acara. Perubahan langsung terlihat, dapat di-Undo, dan baru persisten melalui Simpan Desain.

Unggahan musik dibatasi **2 aset AUDIO per undangan, masing-masing maksimal 3 MB (3 × 1024 × 1024 byte)**. Pemeriksaan jenis, ukuran, dan kuota berjalan pada client serta server; count+create diserialisasi melalui row lock Invitation agar request bersamaan tidak melewati kuota. Panel menampilkan pilihan lagu bawaan, daftar unggahan, jumlah slot, dan Hapus; lagu bawaan tidak memakai slot. Penghapusan aset membebaskan slot, membersihkan referensi musicUrl apabila file itu aktif, serta menghapus file lokal terverifikasi. Unggahan baru otomatis dipilih untuk pratinjau; pilihan disimpan lewat Simpan Desain. Aset lama tidak dihapus otomatis walaupun melampaui batas baru; pengguna dapat menghapusnya sendiri. Pembuatan aset baru melalui URL tidak diperbolehkan karena ukuran file tidak dapat diverifikasi; gunakan uploader binary. URL musik lama masih kompatibel. Ketentuan ini menggantikan batas audio sebelumnya (1 file/10 MB) dan penambahan URL di panel Musik.

Foto tetap melalui Sharp: decode, orientasi otomatis, resize maksimal 2000×2000 tanpa pembesaran, encode WebP quality 82, simpan event-scoped. Batas foto tetap 30 file dan input maksimal 15 MB. Fitur Wishes masih placeholder tanpa persistence; jangan mengklaim seluruh fungsi selesai hanya karena 15 toggle tersedia.

### 7.2.1d Studio: UI ringkas dan pemisahan Publish (24 September 2026)

**Aturan aktif terbaru (menggantikan arahan UI Studio yang bertentangan di riwayat lama):** Header Invitation Studio hanya berisi navigasi kembali, BrandWordmark, dan tombol shared **Light/Dark + ID/EN** dengan gaya outline Rose, radius serta hover yang sama seperti landing page; tombol ID/EN menggunakan state/cookie bahasa aplikasi yang sama dan mengubah copy utama Studio, bukan mengganti konten acara milik pelanggan. Hilangkan banner abu-abu **“Desain bisa disimpan sekarang. Paket diperlukan saat terbitkan.”** karena hak publikasi tetap diurus di Dashboard. Hilangkan **Terbitkan/Publish** dan **tombol/modal Pratinjau tambahan** dari Studio: canvas yang terlihat adalah pratinjau interaktif yang bisa mengubah Amplop/Cover. Tombol **Simpan Desain** tetap ada dan hanya menyimpan desain. Tombol Publish/paket beserta seluruh validasi dan pembayaran ada di **Dashboard → Undangan Digital** saja; penghapusan tombol Studio tidak mengubah backend, entitlement, atau proteksi tampilan prabayar.

Nama/judul di heading Studio ditampilkan memakai `invitationTitleCase` **hanya saat render**: `Pernikahan hendra & reni` terlihat sebagai **`Pernikahan Hendra & Reni`**, tanpa menimpa database atau mengubah judul user lain. Rail alat di kiri harus menyediakan jarak lega antara ikon dan label, ukuran teks terbaca, serta ruang kiri/kanan cukup; canvas utama dipersempit menjadi sekitar **340px** desktop dan maksimal lebar tersedia pada mobile, tetap dapat scroll dan menampilkan renderer template yang sama. Popup kedua tidak boleh digunakan hanya untuk melihat apa yang sudah tampak dalam canvas. Tombol mode Light/Dark dan ID/EN tetap dapat diakses pada viewport mobile. **Memilih Cover dari toolbar tidak boleh menyimpan toggle Amplop OFF**; saat Amplop dibuka, toolbar otomatis berpindah ke Cover tanpa me-remount player musik pada canvas (key renderer tidak mengikuti indikator stage).

**Kerapian tombol, filter, dan panel tema Studio (24 September 2026):** Semua tombol isian Rose yang terpilih (termasuk filter foto dan tombol Amplop/Cover di canvas) harus memakai **teks putih pada Light Mode dan hitam pada Dark Mode**, mengikuti `components/ui/button-variants.ts`; jangan memakai `text-black` tanpa scope dark. Tombol tidak terpilih tetap outline Rose dengan teks warna foreground/aksen, tanpa menambahkan variasi CTA baru. Dropdown pengurutan **Pilihan aktif / Nama A–Z / Nama Z–A** harus memiliki penanda panah custom yang berada sekitar 16px dari sisi kanan, teks punya padding kanan sekitar 44px agar tidak bertabrakan, lebar cukup untuk label, dan tinggi ringkas sekitar 36px. Panel inspector yang memuat pencarian/filter/list template dibuat lebih lebar ke arah kiri (kolom 360px desktop / 380px lebar besar, tidak memperbesar canvas undangan), tinggi item tool rail diringkas menjadi sekitar 74px dengan jarak ikon-label 10px; pada ponsel tetap satu kolom responsif tanpa overflow. Tidak mengubah sortir, pencarian, pilihan tersimpan, atau 15 section.

### 7.2.1c Konsistensi renderer dan kapitalisasi nama (24 September 2026)

Font pilihan pada sembilan tema customizable diteruskan ke nama amplop/sampul melalui token heading; Cinzel/Fauna One memakai CSS family next/font yang benar-benar dimuat. Palet custom memengaruhi permukaan utama, tinta dan aksen amplop/sampul, dengan warna teks terbaca pada permukaan terang/gelap; preset kembali ke artwork asli. Romantic Rose tetap terkunci. Semua nama host/pasangan dan judul acara pada amplop, sampul, identitas, detail dan penutup menggunakan `displayTitleCase` saat render, termasuk data lama. Nama penerima pada password gate juga diformat. Tidak mengubah isi database, pesan, deskripsi, URL, atau hashtag, dan tidak memaksakan uppercase penuh pada nama.

Studio menampilkan retry saat load gagal dan menjelaskan bahwa pengiriman ucapan belum tersedia. Penyimpanan desain mengunci row Invitation yang sama dengan upload/delete musik, memvalidasi bahwa URL upload yang dipilih masih menjadi aset event tersebut, serta tidak menimpa status sudah terbit dengan snapshot lama. Ini bukan implementasi persistence Wishes.

### 7.2.2 Scalable template architecture

DC Organizer harus mendukung katalog undangan dalam skala besar — puluhan hingga ratusan template — tanpa membuat aplikasi, backend, database flow, atau feature implementation terpisah untuk setiap template.

Prinsip canonical:

**Satu shared invitation engine + shared event/content data + shared feature logic + banyak presentation/template.**

Template adalah reusable design definition. Template master disimpan satu kali dan dapat digunakan oleh jumlah event/user yang tidak dibatasi. Per-event storage hanya menyimpan identity/configuration yang memang spesifik terhadap event, seperti `templateKey`, section configuration, customer media, dan customization yang diizinkan template.

Business logic dan data contract invitation dimiliki oleh DC Core dan reusable lintas-template, termasuk:
- event identity/content;
- date/time;
- venue/address/Maps;
- gallery/media;
- RSVP;
- Wishes;
- Gift / E-Angpao;
- countdown bila tersedia;
- closing/footer;
- validation, authorization, event isolation, entitlement, dan persistence.

Template baru tidak boleh menduplikasi API, database model/table, RSVP engine, Wishes engine, Gift engine, payment logic, guest logic, atau ownership logic hanya karena visualnya berbeda.

### 7.2.3 Section-based composition

Invitation disusun dari section reusable yang dapat dikomposisikan, misalnya:
- Cover / Hero;
- Introduction / Greeting;
- Identity / Host / Couple;
- Event Detail;
- Date & Time;
- Gallery;
- Countdown;
- Location / Maps;
- RSVP;
- Wishes;
- Gift / E-Angpao;
- Closing;
- Footer.

Daftar section dapat berkembang. Seluruh template undangan READY wajib mengikuti amplop + 13-section universal di §7.2.3a, dengan isi Identity disesuaikan event category serta toggles RSVP/Wishes/Gift tetap boleh OFF.

Optional section harus dapat diaktifkan/dinonaktifkan tanpa menghapus shared feature/data secara tidak sengaja. Public renderer hanya merender section yang aktif dan valid untuk invitation tersebut.

### 7.2.3a Universal envelope + 13-section contract (22 September 2026)

Setiap template undangan yang READY, termasuk sepuluh built-in dan semua template baru setelah renderer terintegrasi, WAJIB memiliki amplop digital interaktif dengan tombol **Buka Undangan** sebelum Cover; amplop bukan pengganti Cover, bukan pintu marketing landing. Seluruh renderer real di halaman publik, Invitation Studio, dan galeri template menampilkan section semantik berikut secara konsisten:

1. Cover / Hero
2. Introduction / Greeting
3. Identity / Host / Couple
4. Event Detail
5. Date & Time
6. Gallery / Media
7. Countdown
8. Location / Maps
9. RSVP / Konfirmasi Kehadiran
10. Wishes / Ucapan Tamu
11. Gift / E-Angpao
12. Closing
13. Footer

Tiga feature section RSVP/Wishes/Gift dapat dinonaktifkan oleh customer lewat toggle yang sudah ada; section OFF tidak menghapus datanya. Section dengan media, Maps, atau informasi bank yang belum diisi tidak boleh membuat foto, alamat, nomor rekening atau aksi palsu: tampilkan empty state jujur atau sembunyikan kontennya sambil mempertahankan slot struktural. Identity mengikuti jenis acara (couple, individual, host), bukan selalu wedding. Form RSVP aktif hanya pada undangan publik; preview tidak boleh menyimpan data customer. Wishes masih menunggu shared persistence API sehingga hanya boleh menampilkan keterangan transparan, bukan form yang berpura-pura aktif.

Template memiliki gaya sendiri untuk amplop, ornamen, frame foto, palette, fonts, animasi, layout dan (bila manifest mengizinkan) urutan section. Feature logic, photo role, countdown, audio, RSVP, keamanan dan data milik shared engine. Komponen publik dan Studio harus merender presentasi yang sama, bukan menampilkan mock section di Studio dan konten berbeda di URL publik. Ketiga jalur URL undangan tamu—utama, per acara, dan personal—wajib melewati satu shared renderer dispatcher. Key dari upload designer baru tetap preview gambar tidak aktif sampai renderer sesuai kontrak ini selesai dibuat dan terdaftar.

Semua contoh foto yang dipakai katalog, gallery fixture, dan Studio default harus mengambil asset yang SUDAH ADA di public/: /couple.jpg, /couple2.jpg, /couple3.jpg, /man.jpg, /female.jpg, bukan URL Unsplash. File tersebut hanya dummy/demo; foto undangan pelanggan selalu berasal dari InvitationAsset milik event sendiri, bukan fallback foto demo. Kode tema baru mengambil foto contoh dari manifest/shared fixture, tidak duplikasi file. Sharp WebP tetap wajib untuk semua upload image baru sesuai §7.2.7b.

### 7.2.3c Musik bawaan untuk seluruh template undangan (22 September 2026)

Semua template undangan READY wajib menyediakan **musik undangan bawaan** tanpa mengharuskan pengguna terlebih dahulu mengunggah MP3. Satu `lib/templates/music.ts` menyimpan pemetaan stable key ke audio yang sudah tersedia di `public/`; pilihan `Invitation.musicUrl` yang disimpan pemilik event menjadi prioritas, dilanjutkan aset `InvitationAsset` bertipe AUDIO pada event yang sama, baru kemudian musik tema bawaan. Tidak perlu menggandakan audio, menyimpan lagu per pelanggan atau mengubah skema database. Template baru harus mendaftarkan musik default pada manifest musik bersama; jangan memakai track template lain secara implisit dalam produksi.

Player berada di luar subtree amplop yang di-unmount dan digunakan bersama oleh semua renderer template siap (`RomanticRoseTemplate` dan `UniversalInvitationTemplate`), dengan tombol musik **play/pause yang tetap mudah dijangkau** setelah amplop dibuka; lagu di-loop dan pengguna selalu bisa menjedanya. Pada halaman undangan publik, pemutaran dicoba langsung pada gesture klik/tap `Buka Undangan`, bukan autoplay saat page load atau di `useEffect`; jika browser memblokir play, undangan tetap dapat dibuka dan tombol play manual harus tetap berfungsi. Satu undangan hanya memiliki satu elemen audio aktif: hapus player kedua yang sebelumnya berada di footer. Saat berganti ke undangan/preview lain atau meninggalkan komponen, hentikan player sebelumnya. Perhatikan tab tersembunyi dan keyboard accessibility. Preview katalog/Studio **tidak** mengaktifkan musik otomatis (banyak preview card dimount bersamaan); audio hanya bermain jika user menekan play secara eksplisit. Saat audio preview bermain pada route marketing, hentikan sementara musik ambience marketing lalu kembalikan sesuai pilihan mute pengguna setelah preview selesai, sehingga tidak ada dua lagu bertumpuk.

Menu Musik di Studio tetap membolehkan URL atau upload lagu per event, menunjukkan musik bawaan untuk tema yang dipilih, dan preview dapat mendengar lagu yang sedang diedit tanpa menunggu Save. Jangan pasang musik undangan pada halaman Dashboard, landing, guestbook, atau undangan belum terbit. Asset dan lisensi lagu yang digunakan untuk distribusi publik harus dipastikan sesuai hak penggunaan oleh pengelola sebelum rilis komersial.

### 7.2.3b Sebelas tema berbeda: enam dengan foto, lima tanpa foto (24 September 2026)

Setiap template READY harus punya komposisi nyata yang dapat dibedakan secara visual sebelum dan setelah membuka amplop, bukan hanya pergantian palette, font, stock photo dan border radius pada satu layout. Manifest tunggal `lib/templates/catalog.ts` menyatakan `usesPhotos: boolean`, `photoSlots`, nama dan preset. Katalog bawaan sejak 24 September 2026 memiliki **11 template (10 key existing dipertahankan + Zen Atelier), 6 dengan foto dan 5 tanpa foto**:

| Mode | Stable key | Identitas visual, bukan sekadar warna |
| --- | --- | --- |
| Foto | `romantic-rose` | Nuansa Rose, amplop cinta, portrait floral, galeri pasangan |
| Foto | `eternal-blossom` | Scrapbook/portrait miring dengan floral dan foto berbingkai lengkung |
| Foto | `modern-maroon` | Editorial maroon asimetris, foto dengan potongan diagonal dan teks vertikal |
| Foto | `garden-light` | Lengkungan taman botanical dengan cabang daun dan foto melengkung |
| Foto | `midnight-romance` | Latar gelap berbintang, portrait oval, ornamen bulan dan cahaya emas |
| Tanpa foto | `botanical-ivory` | Kartu botanical ivory simetris dengan ilustrasi daun |
| Tanpa foto | `classic-pearl` | Tipografi dan crest oval klasik dengan double ornamental lines |
| Tanpa foto | `golden-art-deco` | Hitam/emas, garis geometri Art Deco dan frame simetris |
| Tanpa foto | `paper-cut-botanical` | Ilustrasi lapisan kertas/cutout daun berwarna sage |
| Tanpa foto | `celestial-ink` | Galaksi tinta, orbit concentric dan konstelasi bulan-bintang tanpa portrait |
| Foto | `zen-atelier` | Amplop/sampul ilustrasi Jepang, potret pasangan editorial dan galeri foto milik event; ensō, sakura, dan pegunungan tinta |

Untuk setiap theme, amplop digital tetap punya lipatan/flap dan aksi "Buka Undangan" riil; visual envelope, Cover dan section decoration mengikuti identitas theme berbeda. Foto preview berbasis aset `public/` yang sudah ada, tanpa mengambil URL Unsplash. Tanpa-foto bukan sekadar menyembunyikan tag `img`: tutup, Hero, Identity, Gallery/Media dan dekorasi mengutamakan tipografi, ornamen/ilustrasi dan data event, tidak merender media customer walaupun sebelumnya pernah mengupload foto untuk theme lain. Studio tidak memunculkan input slot/upload untuk theme tanpa foto (koleksi event tetap tersimpan dan muncul bila customer beralih kembali ke theme foto). Gallery/media tanpa foto tetap section semantik ke-6 tetapi menjadi surface story/illustration tanpa menciptakan foto/memori personal palsu. Image-preview-only designer submissions tidak otomatis dipaksa masuk hitungan 6/5 dan tidak selectable hingga renderer asli tersedia.

Galeri publik dan pemilih template Studio menampilkan thumbnail scene visual yang benar-benar digunakan renderer, bukan image sama untuk sejumlah theme; identifikasi jelas melalui badge/filter "Dengan foto" dan "Tanpa foto". Tetap gunakan satu katalog untuk Studio, `/template-design`, `/d-invitation`, tanpa menggandakan API RSVP, assets/customer media, format penyimpanan atau bypass akses Studio. Semua theme tetap menjalankan kontrak 13 section/amplop di §7.2.3a dan integrasi Sharp WebP untuk media upload customer.

**Zen Atelier — pengelolaan aset (24 September 2026):** Aset PNG Zen/Jepang yang sudah ada di `public/templates/` menjadi ilustrasi utama amplop, sampul, dan ornamen 13 section. Komposisi visual berada pada `components/PublicInvitation/ZenAtelierScene.tsx` dan `assets/templates/zen-atelier/ZenArtwork.tsx` dengan dynamic import khusus tema. Kesesuaian pixel-per-pixel dengan gambar dalam shared chat **belum dapat diverifikasi** tanpa inspeksi visual referensinya; keberadaan nama berkas saja bukan bukti ekspor asli. Semua PNG pada web root bisa diakses publik, dan `.gitignore` tidak melindungi aset yang sudah ada dalam riwayat Git. Simpan master berlisensi privat hanya di storage privat di luar Git/web root dengan otorisasi server. Optimasi PNG yang sekarang masih besar menjadi derivative WebP menjadi tindak lanjut tersendiri; jangan menimpa aset master yang sudah dipakai. Foto customer tetap memakai Sharp/WebP/InvitationAsset; RSVP/Wishes/Gift dan database tidak digandakan.

**Zen Atelier — prompt reconstruction (24 September 2026):** Ikuti `template.md` dan prompt owner: satu amplop dengan aksi Buka Undangan, cover bunga kiri-atas/nama bertumpuk/gunung bawah, foto pasangan lebar via slot cover, galeri dua kolom dengan modal keyboard/swipe, form RSVP bersama berkulit ivory/charcoal, dan musik lokal Zen. Jangan memakai akhir acara sebagai jam resepsi, kategori foto palsu, atau mengklaim Wishes/pesan RSVP tersimpan sebelum backend tersedia. Inventaris aset, pemetaan, batas model, dan sisa verifikasi visual dicatat di `assets/templates/zen-atelier/README.md`. 15 key section existing dipertahankan; tidak membuat key cerita fiktif.


**Zen Atelier — Amplop Digital ala Jepang, revisi owner (24 September 2026):** Amplop Zen wajib berkarakter **surat seremonial Jepang berbahan washi**, berbeda dari fotografi amplop gaya Barat dengan segel lilin yang dipakai pada implementasi sebelumnya. Komposisi khusus amplop: lipatan kertas asimetris bertumpuk, ikatan seremonial merah/emas `mizuhiki`, cap merah seperti stempel tinta (bukan wax seal), tekstur ivory, aksen rangka `shoji`, cabang bunga, enso/matahari terakota, dan gunung sumi-e yang sudah disediakan sebagai SVG milik Zen. Nama/tanggal di slip dalam harus diambil dari data undangan aktif. Animasi pembuka mengikuti satu gestur `Buka Undangan` → simpul membuka → lipatan terangkat → surat naik → Cover, menghormati `prefers-reduced-motion`, timer parent dan tombol Amplop/Cover Studio; jangan menambah CTA kedua atau tulisan teknis. **Hanya Amplop Zen yang direvisi:** Cover/Hero, 13 bagian lainnya, katalog Cover-first, database, pembayaran, landing/Pintu dan tema lain tetap tidak berubah. PNG `amplop1.png` tidak lagi dipakai oleh renderer Zen saat ini, tetapi tetap ada sebagai aset referensi historis. Foto moodboard kanan menjadi inspirasi owner; klaim kemiripan visual eksak memerlukan screenshot browser untuk perbandingan.


**Representasi kartu template:** Kartu katalog lengkap `/template-design` dan kartu smartphone pilihan di `/d-invitation` menampilkan Cover / Hero sesungguhnya, **bukan** Amplop Digital. Render hanya komponen Cover pada kartu untuk menghindari mengunduh keseluruhan section yang tidak ditampilkan; ketika pengunjung membuka contoh interaktif atau tamu membuka URL undangan, alur tetap mulai dari Amplop Digital jika aktif. Aturan ini berlaku untuk seluruh template dan merupakan kontrak visual `template.md`, bukan perubahan 15 toggle atau data event.

**Popup katalog dan alur ke Studio (24 September 2026):** Selain kartu, dialog pilihan template `/template-design?template=<key>` langsung menampilkan **Cover/Hero** agar pengguna melihat isi tanpa melewati Amplop setiap kali menginspeksi template. Ini hanya override UI contoh, bukan toggle yang disimpan: undangan tamu tetap dimulai dari Amplop Digital saat ON. **Canvas Invitation Studio harus tetap dapat menampilkan Amplop**, memainkan animasi pembukanya dan mengulangnya; sediakan kontrol terpisah untuk memilih tampilan Amplop atau Cover tanpa mengubah pengaturan section event. CTA `Buat Undangan` mengarah ke gateway `/studio?template=<key>` yang memverifikasi login, lalu menuntut pemilihan/pembuatan acara terkonfigurasi sebelum editor. Pilihan tema hanya diterapkan ke state editor sebagai perubahan belum tersimpan; data dan desain pelanggan yang sudah tersimpan tidak ditimpa sampai Simpan Desain. **Pilihan tema tidak boleh hilang di tengah alur:** simpan slug tema non-sensitif secara sementara di localStorage dan cookie SameSite=Lax (maksimal tujuh hari) ketika CTA diklik, serta teruskan di URL melalui login, pemilihan acara atau pembuatan acara hingga Studio. Cookie/key harus divalidasi terhadap katalog; jangan simpan data pengguna maupun membuka editor anonim dari nilai browser. Pembuatan acara baru yang berhasil dapat membawa pengguna langsung ke editor dengan key tadi; pilihan belum mengganti template tersimpan sebelum Simpan Desain sukses, setelah itu pilihan sementara dihapus. Jika pengguna langsung membuka Studio biasa saat masih ada pilihan yang valid, gateway boleh melanjutkannya tanpa mengubah acara otomatis. **Panel Tema Studio wajib punya tombol/kolom cari, filter foto, pilihan urut A–Z dan Z–A, indikator tema terpilih, serta pagination/progressive listing untuk ratusan template.**

**Sinkronisasi tombol Amplop / Cover Studio (24 September 2026):** Saat pemilik memilih tombol **Amplop** di toolbar canvas, renderer asli tampil pada tahap Amplop Digital (jika section ON). Ketika tombol **Buka Undangan** di dalam kanvas ditekan, animasi tema diselesaikan terlebih dahulu (Zen Atelier menunggu animasi surat; tema lain mengikuti perilaku pembuka masing-masing); **secara otomatis tombol aktif berpindah menjadi Cover bersamaan dengan berpindahnya isi kanvas**. Tombol **Cover** dapat langsung membuka isi untuk pengeditan tanpa mengubah toggle Amplop tersimpan; menekan **Amplop** lagi atau tombol ulang memulai ulang dari amplop. Perilaku tombol ini hanya UI Studio, tidak menambah kontrol pada undangan tamu, tidak mengubah urutan section 15 komponen, dan tidak menulis data sampai Simpan Desain.


**Kontrak palet/font pada Amplop Studio (24 September 2026):** Setiap template baru yang menyediakan kontrol warna/font di Studio **wajib menerapkan nilai yang sama pada Amplop Digital**, bukan hanya Cover dan section isi. Renderer bersama menyuplai `--inv-scene-bg`, `--inv-scene-surface`, `--inv-scene-ink`, `--inv-scene-surface-ink`, `--inv-scene-accent`, `--inv-scene-soft` saat palet custom, plus `--inv-heading` dan font body; implementasi tema memetakannya ke lapis kertas, lipatan, tulisan, segel/ornamen, dan warna tombol yang memang dapat disesuaikan. Preset menggunakan fallback artwork/palet asli; `color-mix` untuk shading, teks kontras untuk palet gelap. Perubahan terlihat langsung pada canvas Amplop, disimpan melalui Simpan Desain lalu identik pada undangan tamu; jangan membuat cache Studio-only/PNG tetap yang tak dapat diwarnai tetapi menampilkan kontrol seolah aktif. Toggle Amplop, pembuka musik lewat gestur, restart/Amplop–Cover, reduced motion, dan slot foto bila didukung tetap memakai sistem bersama. Tema yang **secara jelas mengunci** warna/font (Romantic Rose) tidak perlu pura-pura menyediakan kontrol. Rincian checklist produksi ada di `template.md` bagian Studio. **Zen Atelier:** amplop washi/mizuhiki yang sebelumnya memiliki banyak warna hardcode telah diperbaiki memakai enam token `--jp-*` dengan fallback preset Zen, termasuk lapis kertas, bayangan/lipatan, tulisan surat, ornamen vektor dan warna simpul mizuhiki. Cover dan section lain tidak ikut dirombak.

### 7.2.3d — Standar produksi untuk semua template undangan (24 September 2026)

Owner menetapkan `template.md` sebagai panduan **UNIVERSAL** untuk membuat semua template baru lewat ChatGPT; desain khusus Zen Atelier hanya salah satu contoh dan **tidak** menjadi palet/komposisi baku untuk tema lain. Alur produksi setiap template adalah brief → moodboard dan contoh setiap layar → audit aset → blueprint semua 15 komponen (amplop + 13 section + musik global) → review visual → coding terintegrasi Studio → pengujian.

Seluruh tema wajib memiliki copy ringkas, animasi tipografi/scroll yang mendukung karakter tema, galeri yang paling ekspresif (misalnya masonry + hover/focus, carousel, parallax yang terukur), reduced-motion/accessibility, serta toggle yang tersimpan. Tombol pembuka berlabel **Buka Undangan** dengan kapitalisasi itu dan tanpa tombol **Lihat Undangan** redundan setelah amplop dibuka; **tidak** ada kata Pratinjau/Preview atau label data contoh di dalam renderer undangan. Katalog/Studio menghilangkan penjelasan filler seperti `Preview mengikuti renderer undangan publik` dan `Foto dan nama pada pratinjau merupakan data contoh. Untuk memakai foto sendiri, buat acara lalu unggah foto melalui Invitation Studio.` tanpa menyembunyikan status error, batasan upload, hak akses atau kesiapan fitur yang memang penting.

Kontrak bisnis §7.2.3a–c tetap berlaku; `template.md` adalah panduan desain/produksi lintas tema, **bukan** bukti implementasi semua efek galeri atau persetujuan mengubah landing/Pintu/template lain.

### 7.2.4 Template-owned presentation and default order

Reusable component tidak boleh membuat semua template terlihat sama. Reuse terutama berada pada behavior, validation, data flow, accessibility contract, dan backend interaction. Template memiliki ownership atas presentation.

Setiap template boleh memiliki:
- typography, palette, background, ornament, artwork, spacing, dan surface treatment berbeda;
- layout/composition section berbeda;
- RSVP/Wishes/Gift presentation yang benar-benar berbeda;
- template-specific animation;
- **default section order** sendiri.

Default section order adalah bagian dari design template. Section yang OFF dilewati tanpa merusak urutan section lain. Sampai ada requirement eksplisit untuk user-reordering, default order template bersifat authoritative.

Jika Studio kelak mengizinkan reorder section, kemampuan tersebut harus dideklarasikan melalui template capability dan tidak boleh memindahkan business logic ke template layer.

### 7.2.5 Section animation control

Template dapat menentukan decorative/template motion default per section.

Canonical behavior:
- jika suatu section tidak memiliki animation capability, Studio tidak perlu menampilkan animation control;
- jika template mendukung animasi pada section tersebut, default mengikuti template;
- user dapat memilih **Animasi ON / OFF**;
- `OFF` hanya mematikan decorative/template motion, section dan function tetap aktif;
- animation toggle terpisah dari section visibility toggle;
- Studio bukan general-purpose animation editor dan tidak memberikan daftar bebas efek yang dapat merusak karakter template;
- functional motion yang diperlukan untuk menjelaskan interaction/state tidak boleh dihilangkan jika membuat UX membingungkan;
- state animation disimpan event-scoped dan tidak mengubah template master untuk user lain;
- implementation menghormati reduced-motion/accessibility preference bila relevan.

### 7.2.6 Template-safe customization capabilities

Customer tidak otomatis dapat mengubah seluruh aspek visual template. Setiap template mendeklarasikan customization capabilities yang aman.

Capability yang dapat diizinkan antara lain:
- editable content/text yang memang relevan;
- customer photos/media;
- music/audio bila didukung;
- accent color atau limited palette bila designer mengizinkan;
- section ON/OFF;
- animation ON/OFF pada section yang mendukung;
- customization lain yang dinyatakan aman oleh template.

Template dapat mengunci:
- typography/font pairing;
- core layout;
- spacing system;
- ornament placement;
- composition;
- button/card treatment;
- structural visual decisions lain yang bila diubah dapat merusak desain.

Studio membaca capability template dan hanya menampilkan control yang valid untuk template aktif.

### 7.2.7 Reusable template contract

Setiap template wajib mengikuti contract yang konsisten, minimal mencakup:
- stable unique key;
- display name;
- description;
- preview/thumbnail;
- asset location;
- supported event/category compatibility bila diperlukan;
- supported sections;
- default section order;
- allowed customization capabilities;
- presentation implementation/theme definition;
- default section animation capability/configuration bila tersedia;
- version/migration strategy bila struktur template berubah material.

Template renderer menerima normalized invitation/event data dari shared engine dan tidak mengambil ownership atas authorization, entitlement, payment, ownership, RSVP persistence, Wishes persistence, Gift transaction, atau security rules.

### 7.2.7a Romantic Rose reference template (22 September 2026)

Template undangan pernikahan `romantic-rose` memakai satu file presentation `components/PublicInvitation/RomanticRoseTemplate.tsx`, dimulai dari amplop digital `Buka Undangan` sebelum Cover. Susunan visual default: Cover, Greeting, Identity, Event, Date & Time, Gallery (jika ada foto), Countdown, Location/Maps, RSVP, Wishes, Gift, Closing, Footer. Data pasangan, event, foto, audio, dan nomor rekening tetap berasal dari record undangan yang sama; tidak ada backend atau database per template.

Upload beberapa foto memakai API asset undangan yang sudah ada, namun assignment foto sekarang memakai shared photo slots (lihat §7.2.7b): cover, personOne, personTwo, dan pilihan galeri tidak lagi harus ditentukan dari urutan foto upload. Undangan lama tetap kompatibel dengan fallback cover/foto kedua/foto ketiga serta galeri seluruh foto bila assignment belum pernah disimpan. Preview Studio memakai presentation Romantic Rose yang sama dengan public renderer; section RSVP/Wishes/Gift mengikuti section visibility state. RSVP menggunakan `RsvpForm` bersama. Wishes belum memiliki shared persistence/API di repo, sehingga template hanya memberi placeholder transparan, tanpa form palsu/penyimpanan palsu. Gift hanya tampil jika aktif dan rekening tersedia. Palette dan typography khusus Romantic Rose terkunci agar kualitas visual terjaga; animation toggle per section dan full capability-aware Studio control masih tahap selanjutnya, tidak boleh diklaim sudah selesai.

### 7.2.7b Global photo library and template-owned photo slots (22 September 2026)

**Satu event, satu koleksi foto, banyak template:** `InvitationAsset` adalah master koleksi gambar milik undangan/event tersebut. Upload foto sekali melalui authenticated Studio dan reuse asetnya ketika template berganti. Template tidak menyimpan salinan foto dan tidak perlu endpoint, database/table, atau picker khusus per template. Galeri dan role selection tidak boleh membocorkan/menggunakan aset dari event lain. Pengguna dapat mengupload JPG, PNG, atau WebP (maksimal 15 MB/file, 30 gambar/event di jalur undangan saat ini). Server harus decode dan konversi *semua upload image biner baru* memakai Sharp menjadi file WebP nyata dengan resize maksimum 2000 × 2000 (tanpa upscaling) dan kualitas 82; gunakan UUID dan folder per event `public/uploads/images/<invitationId>/<uuid>.webp`. Validasi MIME, izin user dan kepemilikan event, jumlah/ukuran gambar harus tetap server-side. Upload preview gambar oleh designer juga dikonversi otomatis menjadi WebP sebelum file disimpan, tanpa mengubah file paket HTML/ZIP/JSON-nya. Endpoint lama untuk menambahkan image dari URL eksternal tidak boleh digunakan sebagai bypass konversi; item audio tidak terkena ketentuan image. Media lama tetap dapat dibaca, tanpa migrasi massal atau mengganti URL existing.

**Role/slot global, presentasi lokal:** role semantik yang reusable adalah `cover`, `personOne`, `personTwo`, `gallery`. Katalog tunggal `lib/templates/catalog.ts` menentukan role yang benar-benar dipakai oleh suatu renderer lewat `photoSlots`; Studio hanya memunculkan kontrol untuk role yang didukung. Data selection yang event-scoped disimpan dalam desain sebagai stable ID milik `InvitationAsset` serta array ID terpilih untuk galeri (`null` = seluruh koleksi; array kosong = galeri kosong). Fokus objek `top/center/bottom` dapat dipilih per gambar tunggal. Resolver bersama `lib/templates/photo-slots.ts` mengizinkan hanya ID aset image undangan saat ini, menolak ID asing/tidak dikenal, dan mengembalikan URL aktual ke template. Template tetap memiliki kebebasan bentuk bingkai, aspect ratio, lokasi penempatan, dekorasi, dan animasi; koordinat layout foto **tidak diglobalisasi**.

**Studio UX:** panel Foto terdiri dari `Koleksi Foto` (unggah multi-file/lihat aset event) dan `Penempatan Foto` (pilih role, pilih aset yang sudah ada, atur fokus, pilih beberapa foto galeri). Bila renderer mendukung, klik area foto di live canvas membawa pengguna langsung ke role Foto yang bersangkutan. State baru disimpan saat `Simpan desain` dan persisten di preview serta renderer publik; pergantian template tidak menghapus aset/assignment, tetapi role yang tidak dipakai oleh template baru tidak ditampilkan. Wedding-specific person roles tidak otomatis diaktifkan untuk acara non-couple. Manifest template yang hanya mendukung `cover` tidak boleh berpura-pura mendukung slot galeri/mempelai.

**Compatibility:** invitation lama tanpa `photos=` pada design key tetap memakai pemilihan decor/cover lama, foto urutan kedua/ketiga bila tersedia, dan semua gambar sebagai galeri. Seluruh media lama tetap dapat ditampilkan di URL existing. Tidak ada migration database untuk tahap ini; jika kolom desain bertambah di masa depan, buat migrasi semantik event-scoped tanpa memaksa tiap template memiliki schema berbeda.

### 7.2.8 Designer-friendly template intake

Designer tidak diwajibkan memahami React, Next.js, TypeScript, Prisma, API, atau backend logic untuk menyumbangkan desain template. Designer menyerahkan design package/reference; developer/AI menerjemahkannya menjadi presentation layer yang mengikuti Template Contract.

Design package idealnya mencakup:
- preview utama;
- font bila berlisensi untuk penggunaan tersebut;
- artwork/ornament/image assets;
- full-page reference atau section reference;
- state visual untuk section interaktif yang didukung.

Minimal reference yang dianjurkan:
- Cover;
- Identity / Introduction;
- Event Detail;
- Gallery bila didukung;
- Location;
- RSVP;
- Wishes;
- Gift;
- Closing.

Penambahan template baru idealnya tidak menyentuh Prisma schema, core RSVP/Wishes API, payment/entitlement, guest isolation, ownership, atau unrelated dashboard logic kecuali template tersebut memperkenalkan capability produk baru yang memang memerlukan perubahan shared engine.

### 7.2.9 Standard template preview and QA data

DC Organizer harus memiliki standard demo/dummy invitation data yang reusable untuk preview dan QA template baru. Demo data tidak boleh bercampur dengan production customer data.

Template baru minimal diuji terhadap variasi:
- identity pendek dan panjang;
- venue/address pendek dan panjang;
- content pendek dan panjang bila field mendukung;
- tanpa customer media;
- satu/sedikit media;
- banyak media sampai batas yang didukung;
- RSVP ON/OFF;
- Wishes ON/OFF;
- Gift ON/OFF;
- Location/Maps ON/OFF bila applicable;
- animation ON/OFF bila applicable;
- kombinasi beberapa optional section OFF.

Template belum siap masuk katalog production bila variasi umum menyebabkan overflow, layout rusak, section kosong yang janggal, atau core interaction tidak dapat digunakan.

### 7.2.9a Katalog visual /template-design

Halaman publik `/template-design` mengambil built-in template dari `lib/templates/catalog.ts`, bukan list contoh/nomor template palsu yang terpisah dari Studio. Kartu desain menampilkan **Cover/Hero** dari `InvitationPreview` yang lazy-load ketika masuk viewport. Popup juga menampilkan Cover terlebih dahulu; animasi Amplop tetap dapat dicoba pada canvas Studio dan menjadi pembuka undangan publik saat aktif. Toggle popup hanya untuk melihat contoh dan tidak menulis database. Preview memakai fixture `data/templates/preview-invitation.ts` yang terisolasi dari konten pelanggan, tanpa label `Pratinjau`/`data contoh` di dalam renderer undangan. Semua built-in READY kini memakai presentasi publik yang sama dengan Studio dan galeri, melalui renderer Romantic Rose atau Universal renderer. Hanya upload designer tanpa renderer yang tetap berupa pratinjau gambar.

Tombol dari katalog publik menuju **gateway `/studio?template=<key>`** yang memeriksa login terlebih dahulu, lalu memilih/membuat acara terkonfigurasi sebelum editor dibuka; key pilihan bertahan lewat URL dan cache browser sementara. Pemilihan/simpan template event dilakukan di Invitation Studio setelah `invitationId` valid; tidak ada bypass auth atau penulisan database dari katalog. Jangan menyebut berkas designer (HTML/ZIP) sebagai template built-in yang sudah dapat dirender tanpa proses integrasi. Permukaan marketing `/d-invitation` dan landing tidak otomatis ikut berubah saat katalog ini diperbaiki.

### 7.2.9b Satu sumber katalog untuk semua halaman (22 September 2026)

`lib/templates/catalog.ts` adalah manifest tunggal untuk template built-in yang **siap dirender**: key, identitas, kategori, thumbnail/preview mode, dan Studio preset milik template didaftarkan sekali. Halaman publik `/template-design`, koleksi `/d-invitation`, dan pilihan template di Invitation Studio wajib membaca API katalog yang sama (`/api/templates` via `lib/templates/use-template-catalog.ts`), tanpa array unggulan/showcase/preset terpisah. Ketika template kode baru terintegrasi dan sekali diregistrasikan ke manifest, tiga permukaan ikut berubah pada deployment/refresh tanpa mengedit tiga halaman.

Designer upload yang telah berstatus `PUBLISHED` di database muncul otomatis lewat API pada galeri publik `/template-design` sebagai `previewType: image`, `ready: false`; etalase ringkas `/d-invitation` hanya menampilkan tiga template READY sesuai §7.2.9d. File HTML/ZIP/JSON yang diunggah belum merupakan komponen React dan **tidak boleh** dapat dipilih sebagai template aktif di Studio/publish sampai developer mengintegrasikan renderer dan mengubah statusnya menjadi ready lewat registrasi master. Jangan menampilkan klaim bahwa foto preview sama dengan output undangan publik apabila belum ada renderer. Studio menampilkan semua entri katalog dengan item `ready:false` nonaktif dan hanya mengizinkan pemilihan `ready:true`. Fallback built-in tetap tersedia ketika query katalog upload tidak berhasil; publik tidak mendapat akses untuk download paket designer secara langsung dari endpoint katalog.

Preview undangan publik dapat dibuka tanpa login, tetapi tombol penggunaan dari `/template-design` atau `/d-invitation` harus melewati gateway `/studio` yang mengarahkan pengguna belum login ke login dan menuntut acara terkonfigurasi sebelum editor; key tema terbawa hingga Simpan Desain. `/dashboard/editor` dan semua turunannya harus tetap diproteksi oleh pengecekan sesi server-side dan editor membutuhkan `invitationId` valid; tidak ada akses anonim ke Studio melalui deep link maupun manipulasi URL.

### 7.2.9c Konsistensi visual galeri publik dengan main frame marketing (22 September 2026)

Halaman `/template-design` merupakan marketing page dengan visual baseline landing terverifikasi `/` dan `/d-invitation`, bukan halaman terpisah dengan full-page putih, navbar/footer tambahan atau dekorasi marketing ganda. Gunakan komponen bersama `Navbar embedded`, `PublicMarketingAtmosphere` dan `MarketingFrameFooter`; bingkai utama di desktop berukuran sesuai frame marketing yang disetujui (lebar ±90vw dengan margin luar), radius 18px, border Rose tipis, permukaan transparan, dan konten sekitar 80vw di dalam frame. Hanya main bagian tengah yang scroll; navbar dan footer tetap pada tempatnya. Di mobile frame tetap responsif tanpa menyebabkan scroll horizontal. `PublicAtmosphere`, `PublicContent`, Navbar/Footer global dan `MarketingFloatingControls` harus memperlakukan rute ini sebagai framed marketing page supaya tidak menduplikasi bunga/rose-petal animation, pemutar musik, Instagram, navbar atau footer. Musik tetap satu player dari marketing provider dan mengikuti pilihan mute/reduced motion. Jangan mengubah landing/Pintu atau desain `/d-invitation` ketika menyamakan shell galeri.

Area isi berbahasa Indonesia default dan responsif terhadap ID/EN navbar; memakai Cinzel untuk heading, Fauna One untuk isi/UI dan DM Mono untuk metadata. Copy ringkas dan tidak mengulang brand/undangan/galeri secara berlebihan. Gunakan palet Rose dan border/transparansi ringan yang sesuai marketing baseline. Kartu katalog harus tetap bersumber dari API/manifest tunggal dan thumbnail real yang lazy-load; filter/pencarian/sort serta preview modal tetap berfungsi tanpa login. Modal preview yang memanjang dibuka di atas bingkai, dapat scroll sendiri, dan tidak terpotong oleh overflow main frame. Tombol pemakaian template membawa pengguna ke Dashboard untuk login/buat event dahulu, tidak membuka Studio anonim. Mode terang/gelap, aksesibilitas keyboard dan interaksi mobile tetap berlaku.

**Kontrak global kontrol aplikasi (22 September 2026):** Semua kontrol UI aplikasi generik memakai satu design system: tombol CTA, input satu baris, chip filter, trigger dropdown dan setiap opsi menu berbentuk pill/rounded penuh dengan outline Rose yang jelas di Light/Dark; panel menu custom menggunakan radius kapsul dan border Rose. Token radius, radius menu, outline ada di `app/globals.css`; pakai `components/ui/button.tsx`, `components/ui/input.tsx` dan `components/ui/control-styles.ts` sebagai sumber bersama, bukan file style khusus halaman. `/template-design` menggunakan source yang sama untuk kolom Cari, chip filter dan Urutkan (Urutan katalog, Nama A–Z, Nama Z–A; ID/EN, Escape, klik di luar), tanpa duplikasi class shape/border. Popup native `<select>` dirender sistem operasi sehingga bentuk opsi tidak dapat dikendalikan penuh; ketika opsi menu harus rounded pakai dropdown custom yang aksesibel. Pengecualian geometry tetap berlaku untuk navbar/control icon khusus yang sudah disetujui, checkbox/radio, textarea multi-baris, dan artistik template undangan; token global tidak boleh mengubah layout/warna frame, Pintu, atau ilustrasi undangan.

### 7.2.9d Etalase ringkas template di /d-invitation (22 September 2026)

Marketing `/d-invitation` menampilkan maksimal **tiga** preview template READY dari manifest/katalog bersama, bukan keseluruhan katalog. Urutan utama diambil dari jumlah event/undangan yang sudah memiliki entitlement Digital Invitation berstatus `Payment.status = PAID` dan `packageKey` termasuk paket Digital Invitation, dikelompokkan menurut `Invitation.templateKey` yang **saat ini tersimpan**. Satu event dihitung sekali melalui relasi Payment unik per invitation; transaksi masih pending, failed/refunded, add-on WA Blast, dan Guestbook-only tidak dihitung. Pada jumlah template berbayar kurang dari tiga, sisa slot diisi pilihan acak dari template siap lain tanpa duplikasi; bila belum ada satu pun penjualan, tampilkan tiga pilihan acak. Jika database tidak dapat diakses, gunakan pilihan acak tanpa klaim peringkat/label best-seller palsu. Tidak ada identitas, data pelanggan, atau angka order pribadi dalam respons endpoint publik.

Keterbatasan data saat ini: template bisa diganti setelah pembayaran, dan tidak ada snapshot immutable template pada saat transaksi. Maka urutan didasarkan pada template yang sedang dipakai pada event berbayar, bukan histori pembelian template yang tak bisa diubah. Jika pelaporan penjualan per-template historis dibutuhkan kelak, perlu snapshot/ledger yang benar; jangan membuat angka atau data semu. Endpoint `/api/templates/featured` mengembalikan hanya kunci template READY untuk marketing. Semua template tetap tersedia di galeri penuh dan Studio melalui manifest dan `/api/templates`, tidak membuat daftar unggulan hardcoded per halaman. Setiap preview ringkas memakai frame smartphone dengan aspek sekitar **9:19.5**, bezel metal gelap, tombol samping dan notch sesuai mockup Hero `/d-invitation`; renderer preview tetap real dan lazy-load. Perubahan tidak memengaruhi hero, Pintu, landing atau pilihan Studio. Header Koleksi Template dan CTA Lihat Semua Template di sebelah kanan dikelompokkan lebih dekat ke tengah frame (wrapper konten bersama maksimal sekitar 1100px, jarak responsif); jangan letakkan keduanya di ujung berlawanan dari keseluruhan area konten. Susunan mobile tetap vertikal. Tombol Lihat semua template memakai kapitalisasi kalimat biasa (tanpa CSS uppercase atau tracking lebar) dalam kedua bahasa. Garis pemisah di bawah header koleksi membentang selebar area konten koleksi, meskipun isi header dan tombol kanan tetap dikelompokkan di wrapper konten bersama ±1100px. Beri jarak lebih lega dari garis ke ketiga preview smartphone (sekitar 56px mobile, 64px desktop). Klik pada HP membuka pratinjau; jangan render tombol Lihat pratinjau tambahan di bawah masing-masing HP.

### 7.2.10 Template performance, lazy loading, and asset isolation

Katalog dengan puluhan/ratusan template tidak boleh membuat setiap public invitation mengirim seluruh code dan asset semua template ke browser visitor.

Canonical performance goals:
- renderer template dapat dipisahkan/load secara independen bila practical;
- asset template lain tidak dimuat hanya karena terdaftar di katalog;
- pertumbuhan jumlah template tidak boleh secara linear memperbesar initial public invitation payload;
- shared runtime/components tetap boleh berada di common bundle bila memang efisien;
- hindari eager import seluruh renderer ke public client bundle bila menyebabkan semua template ikut terkirim;
- Studio/preview boleh memiliki loading strategy berbeda dari public invitation selama tetap terkontrol;
- master/shared assets tidak diduplikasi per customer;
- customer storage terutama bertambah dari uploaded/generated media milik customer, bukan copy template master.

Target architecture untuk shared template asset dapat menggunakan durable object storage/CDN. Premium/proprietary master assets mengikuti anti-copy strategy pada Section 7.4.

### 7.2.11 Separation of responsibilities

Canonical separation:

**DC Core** memiliki data contracts, database, authorization, event isolation, validation, RSVP/Wishes/Gift logic, Maps/location data, payment/entitlement, dan business rules lain.

**Template Layer** memiliki typography, colors, layout, artwork, ornament, animation, section composition/order, allowed customization capabilities, dan presentation RSVP/Wishes/Gift.

Template layer mengatur cara shared function ditampilkan, tetapi tidak menjadi source of truth untuk persistence, authorization, entitlement, payment, ownership, atau data-security rules.

### 7.3 Template save state

`Invitation.templateKey` adalah indikator bahwa desain/template pernah disimpan.

Configured event tanpa `templateKey` **tidak boleh publish**.

### 7.4 Unpaid template preview & anti-copy strategy

User **boleh** membuka Studio, memilih template, mengedit, preview, dan menyimpan desain sebelum membayar.

Untuk event yang belum memiliki Digital Invitation entitlement:
- preview Studio diberi watermark `PREVIEW • DC ORGANIZER`;
- fullscreen preview juga diberi watermark;
- image drag/select dan context-menu boleh dipersulit sebagai deterrent;
- UI harus menjelaskan bahwa template masih preview dan lisensi diperlukan pada Publish.

Client-side anti-copy bukan security boundary. HTML/CSS/JS yang sudah dikirim ke browser tidak dapat dijamin 100% anti-copy.

Untuk template premium/proprietary, target architecture yang lebih kuat:
- catalog hanya memakai thumbnail/low-resolution/watermarked asset;
- master asset berada di private object storage;
- server memverifikasi owner + entitlement event;
- master asset diberikan melalui short-lived signed URL/path;
- final asset tidak dimasukkan ke public frontend bundle sebelum entitlement valid.

### 7.5 Publish behavior

Saat user menekan Publish:
1. Studio membaca state terbaru dari server.
2. Jika event belum configured → publish ditolak.
3. Jika `templateKey` kosong → minta user menyimpan desain.
4. Jika entitlement belum aktif → redirect ke `/packages?package=INVITATION_BASIC&invitationId=<id>`.
5. Jika entitlement aktif → request publish.
6. API melakukan validasi ulang sebelum `isPublished = true`.

### 7.6 Public renderer

Public renderer wajib memeriksa:
- `eventConfigured`;
- saved `templateKey`;
- `isPublished`;
- valid event-scoped payment.

Jika salah satu tidak terpenuhi, renderer mengembalikan locked state dan tidak mengirim final invitation experience.

Renderer harus event-category aware:
- wedding/anniversary dapat memakai dua nama;
- WEDDING menampilkan parent line otomatis per pengantin bila parent identity tersedia;
- birthday memakai satu nama;
- baby shower memakai family/baby identity;
- Other memakai event title.

Timing public menggunakan generic `Mulai` / `Selesai`, bukan asumsi `Akad` / `Resepsi` untuk semua event.

Footer undangan tetap memiliki kontrol ON/OFF, tetapi **tidak boleh menampilkan atribusi promosi** seperti `Created with DC Organizer`, `Made with DC Organizer`, atau `Dibuat dengan DC Organizer` pada undangan yang dipublikasikan. Tampilan footer boleh berupa penutup dekoratif ringkas sesuai tema tanpa menambahkan copy filler. Identitas brand DC Organizer pada situs pemasaran, Dashboard, atau alur operasional tidak termasuk dalam perubahan footer undangan ini.

### 7.7 Public routing & password

Configured event routing tidak memiliki maximum-two business limit.

Public access tetap mendukung legacy routing/alias selama dibutuhkan.

Password protection:
- hash menggunakan bcrypt;
- password hash tidak dikirim ke client;
- access cookie/server gate tetap server-authoritative.

View counter bertambah setelah publish/payment/password gate berhasil dilewati.

Root domain berasal dari `NEXT_PUBLIC_INVITATION_ROOT_DOMAIN`; fallback `dcwedding.com` hanya compatibility sementara sampai migration domain ditetapkan.

---

## 8. Monetization & Entitlement

### 8.1 Digital Invitation

Package key: `INVITATION_BASIC`.

Harga aktif:

**Rp150.000 per event / invitation.**

Satu pembelian membuka **satu event** saja dan mencakup:
- 1 Digital Invitation;
- 1 saved template/design;
- publication;
- RSVP;
- guest management;
- seating/table workflow yang tersedia;
- event invitation media/gallery sesuai kapabilitas Studio.

Payment **tidak diperlukan** untuk:
- membuat event;
- menyimpan event;
- membuka Studio;
- memilih/edit template;
- menyimpan desain;
- internal preview.

Payment diperlukan ketika user ingin **Publish**.

Entitlement wajib event-scoped. Pembelian Event A tidak membuka Event B.

### 8.2 Checkout

`/packages` dan order flow Digital Invitation harus membawa `invitationId` agar payment menempel ke event yang benar.

`PaymentOrder` digunakan untuk checkout/order. `Payment` merepresentasikan entitlement aktif untuk invitation/event.

Manual payment verification/backoffice boleh tetap tersedia melalui role Admin/Finance sesuai implementation existing.

### 8.3 WA Blast add-on

WA Blast bukan bagian dari Rp150.000 Digital Invitation.

Paket aktif:
- `WA_BLAST_50`;
- **50 credits = Rp75.000**;
- dapat dibeli berulang;
- credit menempel pada event yang dipilih;
- `Invitation.waBlastQuota` default **0** untuk event baru.

WA Blast add-on hanya boleh dibeli/digunakan pada event yang memenuhi rule entitlement yang ditentukan server.

### 8.4 Guestbook Digital

Guestbook Digital tetap produk/service onsite terpisah untuk QR check-in, Usher App, device, dan event-day support.

Harga legacy yang pernah tertulis di PRD lama **bukan source of truth**. Jangan hardcode harga Guestbook hanya berdasarkan histori lama; package catalog/keputusan produk terbaru yang berlaku.

### 8.5 Event Planner

Event Planner adalah consultation service, bukan fixed-price SaaS package pada requirement saat ini.

Canonical route: `/event-planner`.

Legacy `/wedding-planner` tetap redirect compatibility.

Layanan konsultasi:
- Wedding Organizer;
- Wedding Planner;
- Silver / Golden Wedding;
- Baby Shower.

CTA: **Konsultasi** ke WhatsApp `+62 821-2478-6516`.

---

## 9. Guest Ecosystem, RSVP & Personal Invitation

### 9.1 Event-scoped guest data

Guest, RSVP, QR, check-in, table, seating, dan personal invitation harus terikat ke `Invitation.id` yang tepat.

Public RSVP menulis guest ke event yang sedang dibuka, bukan global/default event.

Jika belum ada configured event, workspace menampilkan pesan seperti:

**“Silakan buat rangkaian acara dulu.”**

### 9.2 RSVP

**Konfirmasi di halaman undangan — Gratis, aktif otomatis (24 September 2026):** Setiap RSVP yang berhasil disimpan ke canonical `Guest` otomatis mendapat konfirmasi, tanpa pengiriman WhatsApp atau biaya konfirmasi tambahan. Status hadir menampilkan “Terima kasih, [Nama Tamu]” (Title Case tampilan) dan “Kehadiran Anda telah berhasil dikonfirmasi. Kami menantikan kehadiran Anda di hari istimewa kami.” Tidak hadir dan tentatif menggunakan pesan sesuai status, tanpa tiket check-in. Tamu hadir mendapat tautan **Unduh QR Code** berupa PNG bertanda tangan yang berlaku untuk identitas tamu/acara yang sama; generator berjalan di server sendiri, tidak mengirim token ke layanan QR eksternal. Endpoint memverifikasi signature, acara terbit dengan entitlement valid, dan status hadir sebelum mengeluarkan gambar. RSVP yang sudah tersimpan tetap dikonfirmasi meski konfigurasi QR belum tersedia. Workspace RSVP pemilik memuat ulang data setiap 10 detik saat tab terlihat dan ketika kembali fokus; ini polling, bukan realtime WebSocket. Tidak mengubah toggle visibilitas bagian RSVP atau entitlement undangan existing.

Per event mendukung:
- RSVP status;
- attending/not attending/tentative;
- pax / plus one;
- check-in state;
- QR;
- table;
- CSV export.

CSV export dapat menggunakan nama `dc-organizer-rsvp.csv`.

### 9.3 Personal Invitation

Personal Invitation menggunakan `Guest` sebagai identity source.

Per event mendukung:
- pilih guest existing;
- buat guest baru;
- generate personal token;
- preview;
- edit name/phone;
- publish/unpublish personal link;
- enable/change/disable password;
- personal view count.

API Personal Invitation wajib menerima explicit `invitationId` dan memvalidasi:
- authenticated user;
- ownership/permission;
- configured event;
- entitlement yang diperlukan.

Tidak ada fallback ke first WEDDING event.

Personal public URL menggunakan event slug + personal token.

### 9.4 Guest Category & Tags — P1

Guest harus mendukung:
- category;
- multiple tags;
- custom category/tag;
- edit dan bulk assign;
- filtering di Guest List;
- filtering di Seating Chart;
- filtering saat Invitation Distribution / WA Blast.

Contoh category:
- VVIP;
- VIP;
- Family Groom;
- Family Bride;
- Friends;
- Office;
- Vendor;
- Other.

Acceptance:
- satu guest dapat memiliki category + beberapa tags;
- filter dan bulk update bekerja;
- category/tag tersedia lintas guest/seating/distribution workflow.

### 9.5 Public RSVP Rate Limiting — P0

`POST /api/invite/[slug]/rsvp` wajib memiliki server-side anti-spam/rate limiting.

Target policy awal:
- kombinasi IP + slug + guest/token bila tersedia;
- contoh maksimum 5 attempt/minute/IP;
- over-limit → HTTP `429`;
- optional honeypot / Turnstile / CAPTCHA;
- duplicate submission detection;
- spam/failure dapat dicatat untuk monitoring.

Redis/Upstash Redis/Vercel-KV-compatible storage dapat digunakan.

---

## 10. Seating & Guest Placement

Seating adalah event-scoped dan server-authoritative.

Requirements:
- table milik event aktif harus divalidasi;
- max 100 table per event;
- capacity 1–50 seat per table;
- shape minimal `ROUND`, `RECTANGLE`, `SQUARE`;
- `Guest.seatNumber` nullable;
- kombinasi table + seat harus collision-safe/unique;
- seat assignment dan swap harus atomic;
- target guest dan target table harus memiliki `invitationId` yang sama;
- table full mengembalikan conflict response (HTTP `409`);
- seating roster menerima guest manual atau RSVP eligible/attending sesuai rule produk.

Saat user mengganti event, local seating state harus di-reset agar data event lama tidak tercampur.

---

## 11. WA Blast

### 11.1 Existing product behavior

WA Blast bersifat event-scoped.

Workspace harus mendukung:
- memilih event aktif;
- memilih guest existing;
- input guest baru + WhatsApp number;
- recipient queue;
- selected / remaining quota;
- menghapus recipient dari queue;
- persistent queue/database state.

API key provider tidak boleh dikirim ke frontend.

### 11.2 Provider integration — P1

Delivery provider nyata masih menjadi integration requirement.

Target provider options:
- Fonnte;
- Wablas;
- Twilio / WhatsApp Business API sebagai alternatif.

Gunakan abstraction seperti `WhatsAppProvider`:
- `sendMessage()`;
- `sendTemplate()`;
- `checkStatus()`;
- `getBalance()`.

Delivery status minimal:
- queued;
- processing;
- sent;
- delivered;
- read;
- failed.

Failed delivery harus dapat diretry dan status disimpan.

### 11.3 WA Blast Top-Up — P2

Tambahan quota dapat dicatat melalui entity seperti `WhatsAppCreditTransaction`:
- `userId`;
- event/invitation context bila diperlukan;
- `quantity`;
- `amount`;
- `type`;
- `paymentId`;
- `status`.

Successful payment menambah quota secara server-authoritative.

---

## 12. Guestbook & Onsite Operations

### 12.1 Usher App

Usher/check-in harus selalu explicit event-scoped. Jangan menggunakan implicit “first paid event” ketika account memiliki beberapa event.

Current onsite capabilities dapat mencakup:
- guest search;
- QR scan;
- manual check-in;
- table information;
- server-authoritative check-in state.

### 12.2 Offline-First Usher — P1 / Critical Onsite

Gunakan IndexedDB untuk critical offline cache; LocalStorage hanya untuk non-critical state.

Local data minimal:
- guest ID;
- guest name;
- QR identifier;
- table assignment;
- check-in status.

Offline flow:
1. QR tetap dapat discan.
2. Guest dapat dicari dari local cache.
3. Check-in masuk pending queue.
4. UI menunjukkan `Offline`.
5. Queue otomatis sync saat online.
6. Conflict resolution mendeteksi duplicate check-in lintas device.

Suggested pending fields:
- `guestId`;
- `deviceId`;
- `checkedInAt`;
- `syncStatus`;
- `retryCount`.

### 12.3 Live Guestbook Wall — P2

Route target:

`/event/[slug]/guestbook-wall`

Wall menampilkan realtime:
- guest name;
- message;
- submitted time;
- optional avatar/photo;
- transition/animation.

Admin moderation:
- approve;
- hide;
- delete;
- optional `autoApproveGuestbook`.

Transport dapat menggunakan WebSocket, SSE, atau realtime provider.

### 12.4 Thermal Label / Wristband Printing — P3

Setelah check-in sukses, Usher dapat memiliki action `Print Label`.

Label dapat memuat:
- guest name;
- category;
- table number;
- QR/guest ID.

Target: Bluetooth/browser-compatible thermal printer.

Printer failure tidak boleh memblokir check-in berikutnya.

---

## 13. Digital Gift / Cashless Angpao — P2

Public Invitation dapat menyediakan optional `Digital Gift`.

Metode:
- bank transfer;
- QRIS;
- payment gateway.

Potential provider:
- Midtrans;
- Xendit.

Data transaksi gift harus terpisah dari billing DC Organizer.

Suggested `DigitalGiftTransaction`:
- `id`;
- `invitationId`;
- nullable `guestId`;
- `provider`;
- `paymentMethod`;
- `amount`;
- `status`;
- `externalTransactionId`;
- `createdAt`;
- `paidAt`.

Owner dapat enable/disable gift. Webhook/callback memperbarui status. Payment secret/sensitive info tidak boleh terekspos melalui unauthenticated API.

---

## 14. Security & Data Compliance

### 14.1 Authorization

Seluruh sensitive mutation memerlukan server-side authentication + ownership/permission checks.

Entitlement, role, guest/event scope, payment, publish, seating, dan check-in tidak boleh hanya bergantung pada UI state.

### 14.2 Sensitive data

- Password disimpan sebagai hash, bukan plaintext.
- Personal invitation password hash tidak boleh muncul dalam normal guest API response.
- Provider secret/API keys hanya server-side.
- Payment/gift callback harus divalidasi sesuai provider.

### 14.3 Data Retention — P2

Event menggunakan `eventDate` sebagai lifecycle anchor.

Baseline target:
- 0–12 bulan setelah event → event/asset tetap tersedia;
- setelah periode retention → event dapat menjadi `ARCHIVED`;
- cleanup dapat mencakup original unused media, temporary asset, dan generated cache.

Data penting seperti guest list, RSVP, guestbook, dan financial transaction tidak boleh blindly deleted bersama media.

Suggested fields:
- `archivedAt`;
- `scheduledDeletionAt`;
- `retentionStatus`.

User harus menerima warning sebelum permanent deletion. Financial record mengikuti retention policy terpisah. Premium package dapat menawarkan retention lebih panjang.

---

### 15.4.1b — Approved production landing baseline (21 September 2026)

Owner explicitly approved the existing `/pagecontoh` experience as the production landing page at `/`, **without any change to its contents**. `app/page.tsx` re-exports `app/pagecontoh/page.tsx`; `/pagecontoh` remains an accessible visual reference. This approval supersedes earlier instructions prohibiting promotion of the preview to `/` and applies only to this exact approved composition, **not** to the separate `/pintu-lab` GLB experiment.

The approved landing is a continuous botanical/rose-glow/petal scene with a rounded main frame, embedded navbar and footer, four orbiting 3D doors, two transparent cloud-copy regions with a single outer rose outline, puzzle-like in-place cloud assembly and letter-by-letter bilingual copy, audio controls, and Instagram link. The precise existing component code, layout, assets, animations, content, responsive states, light/dark modes, and ID/EN states are the visual/behavioral source of truth. Future related marketing surfaces must follow this established design language using existing components and installed libraries where appropriate; this does not authorize copying landing-specific decoration onto unrelated surfaces.

**Owner change-control requirement:** Never add, remove, replace, rearrange, restyle, or simplify anything the owner has not specifically requested. Keep each change narrowly scoped and preserve all other approved behavior. Ask before a necessary fix would visibly affect another approved element. Reuse existing dependencies/components rather than adding a new library or design system without a concrete need and approval. Preserve both `/` and `/pagecontoh` and prevent duplicate global navbar/footer on either route. Check affected responsive/theme/language states where possible; distinguish actual build/browser validation from unverified changes.

Canonical references: `app/page.tsx`, `app/pagecontoh/page.tsx`, `components/Landing/Pintu/SimpleDoorLab.tsx`, `components/Landing/CloudCopy.tsx`, `components/Landing/LandingFloralGlow.tsx`, `components/Landing/WindRosePetals.tsx`, `components/Layout/Navbar/Navbar.tsx`, `components/Layout/Footer.tsx`, `components/Layout/PublicAtmosphere.tsx`, `components/Theme/ThemeToggle.tsx`, `components/I18n/LanguageToggle.tsx`, and `components/ui/button.tsx`. Established stack: Next.js App Router, React, TypeScript, Tailwind CSS, Motion, Three.js/React Three Fiber where already used, and shared application providers/components.

## 15. Design System & UX Rules

### 15.1 Typography

Application UI hanya memakai:
- **Cinzel** — display/headings/branding;
- **Fauna One** — body/UI/navigation/form/button;
- **DM Mono** — metadata/status/code/timestamp/utility text.

**Brand wordmark contract:** seluruh wordmark customer-facing `DC Organizer` menggunakan implementasi canonical `components/Brand/BrandWordmark.tsx` dan token `--font-dc-heading` (Cinzel). Wording, font, tracking, dan Rose treatment wordmark tidak boleh diinterpretasi ulang per halaman tanpa requirement eksplisit. Public navbar boleh menampilkan tagline marketing existing; **header Dashboard tidak menampilkan tagline dan hanya memakai wordmark `DC Organizer`**.

Template typography boleh dinamis bila merupakan konten invitation, bukan shell aplikasi.

### 5.4a Pilihan Urutan Anak & Format Keterangan Orang Tua (23 September 2026)

- Pada form pernikahan, **masing-masing mempelai** memiliki pilihan tunggal berbentuk radio/bullet check: `Anak Tertua`, `Anak Termuda`, atau `Anak Keberapa`. Hanya pilihan ketiga memunculkan input angka urutan anak positif; angka wajib diisi bila dipilih. Pilihan awal boleh kosong agar data pernikahan lama yang tidak memiliki urutan anak tetap opsional. Nilai numerik lama dibuka kembali pada pilihan ketiga, bukan dianggap otomatis Sulung.
- Urutan anak disimpan tanpa menduplikasi nama/data keluarga: `Invitation.groomChildOrder` / `brideChildOrder` tetap `Int?` numerik; `Invitation.groomChildPosition` / `brideChildPosition` menyimpan pilihan `ELDEST`, `YOUNGEST`, `NUMBER` atau null. Anak termuda tidak bisa disimpulkan dari angka urutan anak tanpa mengetahui jumlah saudara. Saat memilih tertua/termuda, angka urutan sebelumnya dikosongkan; data undangan lama dipertahankan.
- Format tampilan terpusat di `lib/events/parents.ts`: `Putra/Putri Sulung Dari Bapak Chandra & Ibu Juni`, `Putra/Putri Bungsu Dari Bapak Chandra & Ibu Juni`, atau `Putra/Putri Kedua Dari Bapak Chandra & Ibu Juni` untuk urutan 2. Setiap kata pada keterangan keluarga dan nama orang tua yang ditampilkan diawali huruf kapital di Dashboard preview, Studio preview, dan undangan publik seluruh tema. Data nama asli di DB/API dan isi deskripsi tetap apa adanya. Jika parent kosong, jangan tampilkan placeholder.
- Perubahan membutuhkan migrasi DB kolom baru dan regenerasi Prisma sebelum build lokal; server tetap memvalidasi pilihan serta angka, dan kebijakan kunci acara terbit tetap berlaku.

### 15.1a Kapitalisasi Nama & Judul (23 September 2026)

- Nama yang **ditampilkan** dan seluruh judul UI yang berdiri sendiri wajib menggunakan **Title Case** (huruf kapital pada awal setiap kata), termasuk judul halaman, judul frame/panel besar, judul bagian, nama menu, judul metrik, serta nama tamu dan judul acara yang ditampilkan. Contoh: `Manajemen Tamu`, `Daftar Acara`, `Nama Di Amplop`, `Undangan Personal`.
- Terapkan pada locale ID/EN dengan tetap menjaga penulisan brand dan singkatan: `DC Organizer`, `RSVP`, `VIP`, `VVIP`, `WhatsApp`. Jangan jadikan semua huruf kapital atau mengubah identifier/kode internal.
- Kalimat naratif, deskripsi, instruksi, placeholder, isi pesan, dan konten pengguna yang bukan nama/judul tetap menggunakan kapitalisasi kalimat yang natural.
- Kapitalisasi nama tamu/judul acara dari input pengguna **hanya untuk tampilan**; nilai asli di database, API, pencarian, RSVP, undangan, dan WA Blast tidak boleh diubah secara diam-diam. Terapkan melalui gaya heading yang terlingkup pada Dashboard dan penanda `dc-ui-name` / `dc-ui-title` / `dc-ui-label` untuk teks UI yang bukan heading; jangan mengubah visual landing/Pintu atau artwork template undangan secara tidak sengaja.

### 15.1b Title Case Pada Dropdown & Form Operasional (23 September 2026)

- Aturan kapitalisasi pada §15.1a juga berlaku untuk teks pilihan pada dropdown/select Dashboard dan panel operasional, terutama RSVP, pemilihan acara, kategori/tag tamu, pilihan penerima Undangan Personal dan WA Blast, jenis acara, serta pilihan status kehadiran pada formulir RSVP undangan publik. Contoh: `Saya Akan Hadir`, `Saya Tidak Hadir`, `Saya Masih Tentatif`, `Pilih Jenis Acara`, `Semua Kategori`. Terapkan pada ID/EN, tanpa memaksa deskripsi dan isi pesan menjadi Title Case.
- Browser/OS dapat mengabaikan `text-transform: capitalize` di popup `<select>`: selain CSS terlingkup, format teks pilihan dinamis melalui utilitas presentasi `lib/text/display-title-case.ts` agar kapitalisasi tampak pada label opsi maupun nilai yang terpilih. Pertahankan singkatan/brand (`RSVP`, `VIP`, `VVIP`, `DC`, `WA`, `WhatsApp`). Jangan mengubah nilai `option.value`, status RSVP (`ATTENDING` dkk.), kunci kategori/tag, `Guest.name` atau `Invitation.title` di database, nomor telepon, email, URL, dan identifier zona waktu. Nama tamu/acara hanya dikapitalisasi saat ditampilkan di dropdown.
- Owner Panel wajib mempunyai tombol `Logout` yang terlihat dan dapat diakses pada desktop maupun mobile. Prosesnya menggunakan endpoint sesi yang sudah ada `POST /api/auth/logout` dan komponen bersama dengan Admin, lalu navigasi ke Login **hanya setelah respons sukses**; ketika gagal, tampilkan pesan dan jangan berpura-pura sesi berakhir. Tidak diperlukan perubahan database atau migrasi baru.

### 15.2 Color

Brand palette:
- Rose `#C07A84`;
- Supporting Rose `#D9A3AA`;
- Deep Rose `#A65E69`.

Light:
- background `#FFFFFF`;
- primary text `#111111`.

Dark:
- background `#0B0B0C`;
- primary text `#FFFFFF`.

Rose digunakan sebagai meaningful accent, bukan large page fill.

### 15.3 Buttons

`components/ui/button.tsx` adalah canonical application button primitive.

Tidak membuat visual button system baru per halaman.

Action hierarchy dibedakan melalui:
- verb/label;
- icon Lucide;
- size;
- placement;
- state.

Bukan melalui banyak warna/variant berbeda.

### 15.4 Surfaces/layout

- Hero halaman marketing `/d-invitation` menyeimbangkan dua kolom: teks mengambil bagian lebih lebar daripada mockup perangkat pada desktop, sementara mockup menggunakan rasio smartphone ramping/tinggi (sekitar 9:19.5), bukan menyerupai tablet. Judul dan deskripsi boleh melebar mengikuti kolom teks. **Keduanya dikelompokkan di tengah main frame** (maksimal lebar Hero mengikuti batas konten bersama sekitar 1100px di desktop, gap kolom sedang), bukan menempel di sisi luar frame. Responsif mobile tetap aman; isi dan animasi undangan, frame halaman, transisi Pintu, dan visual landing tidak diubah oleh penyesuaian proporsi ini.
- Semua halaman **marketing publik** memakai komponen dekorasi bersama: bunga `flower.png` pada kiri/kanan dan Rose glow dari `LandingFloralGlow`, serta animasi petal interaktif dari `WindRosePetals`. Landing `/` dan `/pagecontoh` serta frame `/d-invitation` merender layer di dalam scene masing-masing; halaman marketing lain merender melalui `PublicAtmosphere` agar tidak ada layer ganda. Reuse asset dan gerakan yang sudah disetujui, hormati reduced-motion. Dekorasi marketing ini tidak otomatis dipasang di Dashboard/Admin/Studio/checkout atau undangan publik milik pelanggan.
- Musik latar marketing adalah **satu audio player persisten** di root layout: track dan volume/mute tidak restart setiap navigasi antarhalaman marketing; autoplay hanya jika browser mengizinkan, user bisa mute/play dan atur volume secara manual. Kontrol berada di kiri bawah serta tautan Instagram resmi DC Organizer di kanan bawah pada setiap halaman marketing. Untuk main frame, kedua kontrol tertanam pada bar footer; halaman marketing tanpa frame memakai floating control di tepi bawah. Jangan menduplikasi player, petals, atau tombol Instagram dalam satu halaman.
- Halaman marketing `/d-invitation` memakai **main frame yang sama secara ukuran/proporsi visual dengan landing yang disetujui**: rounded Rose-border frame setinggi viewport dengan Navbar dan compact Footer di dalam frame, sedangkan semua section marketing berada dalam satu panel tengah yang scrollable mandiri (desktop dan mobile). Scroll halaman luar bukan penggerak utama konten; desain/copy, link, bahasa, tema, dan bagian yang sudah ada tetap dipertahankan. Section yang memasuki viewport panel scroll muncul lembut (opacity/translate, sekali per section); reduced-motion menampilkan konten tanpa gerakan. Perubahan ini khusus halaman `/d-invitation`, bukan perubahan landing `/` atau koreografi transisi Pintu yang sedang ditunda.
- **Ritme section marketing dan Studio entry (22 September 2026):** Pada `/d-invitation`, gunakan satu jarak antarsection yang konsisten di container utama (80px mobile, 96px desktop), jangan menumpuk gap parent ganda dan padding-bottom Hero. Heading-ke-isi tiap section tetap rapat/terukur; jarak divider-ke-smartphone pada Koleksi Template tetap 56px mobile/64px desktop sesuai §7.2.9d. Section Design Studio menempatkan naskah dan CTA berdampingan lebih dekat ke tengah dengan section lebar bersama ±1100px dengan pasangan teks+CTA tetap dikelompokkan rapat di tengah dan gap responsif. Tombol berlabel `Masuk Studio ↗` / `Enter Studio ↗` mengarah ke `/studio`, bukan langsung Beranda Dashboard. Route `/studio` melakukan auth dan memastikan event terkonfigurasi milik user sebelum masuk ke `/dashboard/editor?invitationId=...`; satu event bisa langsung masuk, beberapa event menampilkan pilihan, dan user tanpa event dituntun membuat acara terlebih dahulu (tanpa mengarang invitationId atau melewati proteksi editor). Pada halaman ini, outline kartu Paket diperhalus menjadi sudut rounded besar 40–48px dengan border Rose tanpa merombak kartu paket layanan lain; seluruh item FAQ pada komponen FAQ bersama memiliki wrapper/trigger rounded dengan outline Rose dan tetap bisa dibuka-tutup melalui keyboard.
- **Satu lebar konten & animasi teks yang bisa berulang (22 September 2026):** Semua section `/d-invitation` — Hero, Fitur, Koleksi Template, Design Studio, Paket, Ulasan, FAQ — mengikuti satu container responsif yang dipusatkan di main frame: lebar 88% pada mobile, 80vw sejak `sm`, batas maksimal 1100px di desktop. Garis section, header, dan area grid/FAQ merujuk batas yang sama; paragraf untuk keterbacaan, pasangan teks+CTA Studio, dan kartu paket/HP boleh tetap lebih ringkas di dalamnya. Tidak mengubah konten, identitas brand, link maupun perilaku template. Gunakan `MarketingTextReveal` khusus di main scroll frame untuk animasi halus opacity + translateY sekitar 14px/720ms pada heading, paragraf dan teks list: trigger oleh IntersectionObserver dengan `root` panel tengah (bukan window). Saat teks benar-benar keluar dari viewport panel, status animasi direset dan baru dimainkan lagi saat masuk kembali, termasuk scroll ke atas; jangan reset ketika scrolling berhenti tetapi teks masih terlihat. Elemen interactive, ilustrasi/layar HP dan text di dalam preview tidak dianimasikan ulang; PuzzleAssemble untuk penyusunan section dan aksesibilitas reduced-motion dipertahankan.
- **Event Planner masuk main frame marketing (22 September 2026):** Route publik `/event-planner` mengikuti frame visual `/d-invitation` yang telah disetujui: bingkai viewport radius 18px dengan border Rose tipis, navbar/footer tertanam tetap dalam bingkai, hanya panel tengah yang scroll, satu latar bunga/glow/kelopak dari komponen marketing bersama (Light/Dark) dan pemutar musik/Instagram yang persisten tanpa lapisan ganda dari layout global. Konten dari header hingga CTA akhir mengikuti satu lebar terpusat responsif (88% mobile, 80vw sejak `sm`, maksimum 1100px) dan gap antarseksi 80px/96px; copy, data portfolio, founder, layanan, nama paket, ulasan, FAQ, harga yang tidak ditampilkan, dan target konsultasi WhatsApp tetap. Gunakan Cinzel/Fauna/DM Mono, heading Rose, permukaan kartu rounded dengan border Rose lembut, button canonical. Setiap section memakai opacity/translateY lembut yang boleh berulang hanya setelah keluar dari panel scroll (`EventPlanner/ScrollReveal.tsx` dengan viewport `root` panel, `once:false`); teks memakai `MarketingTextReveal.tsx` dan aturan reduced-motion, tanpa animasi ulang pada elemen interaktif atau video. Video portfolio yang dibuka melalui portal ke body supaya modal tidak terpotong bingkai scroll. Tidak mengubah landing/Pintu maupun visual undangan publik.
- **Fitur Undangan Digital tanpa nomor dekoratif (22 September 2026):** Di `/d-invitation`, section `Yang kamu dapatkan` / `What you get` menghilangkan label urutan `01`, `02`, `03` pada ketiga kartu. Heading dan grid fitur berada dalam satu wrapper terpusat dengan lebar maksimal konten bersama sekitar 1100px, tetap responsif satu kolom di layar kecil dan tiga kolom di desktop, sehingga isi tidak terpencar di ujung kiri-kanan area konten 80vw. Pertahankan icon, naskah, garis pemisah, dan ritme section di luar area ini.
- Main panel radius sekitar 12px.
- Nested utility surface sekitar 8–10px.
- Input target minimum sekitar 44px.
- Grouping menggunakan spacing + subtle surface + border, bukan divider horizontal panjang berlebihan.
- Primary public desktop header/content/footer menggunakan **80vw**; jangan mengembalikan fixed `1400px` / `92vw` page wrapper sebagai standard utama. Compact inner content boleh memiliki max-width khusus bila readability membutuhkannya.
- Landing root header dan compact footer harus memakai canvas/background yang sama dengan body landing agar tidak terbaca sebagai kotak surface terpisah. Pada Landing Dark Mode, locale ID/EN yang aktif memakai Rose opaque dengan near-black copy, dan theme toggle memakai Rose opaque dengan near-black icon/text. Requirement ini landing-specific dan tidak boleh mengubah Dashboard/shared control behavior di luar landing.
- Dashboard workspace mengikuti full-width application shell pada Section 6.2; jangan mengembalikan centered public-content cap ke workspace utama.
- **Beranda adalah reference visual language untuk seluruh customer Dashboard.** Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gate, empty/loading/error states, dan reusable dashboard components wajib memakai hierarchy surface/card/table/icon yang konsisten: canvas netral putih/near-black, border/shadow halus, Rose sebagai accent, bukan page-specific theme.
- Dashboard memiliki ruang desktop yang besar, sehingga typography operasional **tidak boleh dibuat terlalu kecil**. Body/form/table copy ditargetkan sekitar 14–16px; metadata/mono kecil tetap readable sekitar 11–12px; section heading sekitar 20–24px; metric value sekitar 24px. Hindari 8–10px untuk copy yang perlu dibaca rutin.
- Revisi visual sidebar Dashboard berdasar screenshot owner (23 September 2026) **menggantikan ketentuan rail netral sebelumnya**: Light Mode memakai rail dan blok logo Rose dengan ikon/teks putih; Dark Mode memakai rail Deep Rose dengan ikon/teks putih. Hover dan active memakai shade berbeda; lengkungan luar hanya pada menu aktif agar tidak bertabrakan dengan hover tetangga. Canvas Light Mode Rose sangat pucat (#fff5f7), card tetap putih, Dark Mode near-black Rose-tinted.
- Ukuran copy sidebar utama sekitar 15–16px agar nyaman dipindai; nested item tetap sedikit lebih kecil tetapi tidak terasa mikro.
- Header control Dashboard — burger, theme toggle, ID/EN, dan account trigger — wajib mengikuti **visual language navbar landing yang sudah established**, bukan memiliki Dashboard-only control system. ThemeToggle dan LanguageToggle memakai shared component/style yang sama seperti landing. Burger Dashboard meniru treatment burger landing (transparent surface, restrained Rose border/foreground, subtle Rose hover), sedangkan account trigger mengikuti treatment navbar yang sama. Jangan menambahkan CSS override khusus Dashboard yang mengubah shared navbar controls menjadi visual system berbeda.
- Shared dashboard primitives berada di `components/Dashboard/DashboardPrimitives.tsx` dan harus di-extend untuk surface/metric/notice baru agar workspace tidak kembali belang antar-tab.
- Dashboard boleh memakai table/graph ketika datanya berasal dari database/API atau derived metric yang dapat dijelaskan; jangan membuat angka/mock chart untuk dekorasi.
- Pintu tetap core public navigation surface.
- Widget navigasi Pintu mini bersifat pelengkap pada halaman marketing publik (`/`, `/pagecontoh`, `/event-planner`, `/d-invitation`, `/guestbook`, `/undangan-fisik`, `/template-design`), bukan pengganti Pintu utama, burger atau navbar. Widget tetap di sisi kiri, tertutup secara default, dibuka lewat klik/tap/keyboard, dan menampilkan tujuan sebagai miniatur pintu, judul, deskripsi pendek serta indikator halaman aktif. Tujuan diambil dari rute nyata, copy mengikuti locale ID/EN, panel dapat ditutup dengan tombol, Escape, klik di luar, atau setelah navigasi. Pada mobile panel dapat discroll tanpa menutup konten utama; tidak muncul di Dashboard, Studio, atau undangan pelanggan. Tautan antarmarketing memakai `PortalTransition` Rose existing tanpa gambar pintu kedua dan menghormati reduced motion.
- Ornamen/bunga dekoratif di bagian atas setiap Pintu merupakan bagian dari closed-door surface: saat Pintu aktif/terbuka ornamen harus ikut fade/keluar, lalu kembali saat Pintu tertutup. Behavior mengikuti state Pintu yang sama dan tetap menghormati reduced motion.
- Landing 80vw harus memperlakukan copy + Pintu sebagai satu komposisi: orbit dapat melebar dan carousel dapat masuk ke arah copy selama responsive clipping tetap aman.
- Copy kiri landing boleh diperlebar dan sedikit dibesarkan secara vertikal agar mengisi 80vw secara proporsional tanpa mengalahkan Pintu.
- Area quote/proof ditempatkan setelah CTA dan sebelum separator tipis; capability checklist berada di bawah separator dengan jarak yang cukup agar hierarchy terasa ringan.
- Quote pelanggan hanya boleh ditampilkan sebagai testimonial bila sumber/ucapan pelanggan benar-benar tersedia dan dapat dipertanggungjawabkan. Jangan mengarang nama, kutipan, rating, atau klaim pelanggan. Jika belum ada testimonial terverifikasi, gunakan brand/service statement tanpa customer attribution sampai data nyata tersedia.
- Public burger menu tidak menampilkan `Beranda`; home tetap dapat dicapai melalui brand/logo. Untuk locale Indonesia, submenu layanan memakai label `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`. `Layanan` tetap menjadi parent dengan submenu tersebut, `Masuk` dan `Daftar` wajib tersedia, dan icon `Layanan` harus berbeda dari icon `Paket`; decorative numbering tidak digunakan.
- Burger navigation mempertahankan surface netral dan label/ikon Rose di Light/Dark, bukan teks hitam/putih. Login/Daftar menggunakan popup putih, teks isi gelap, dan glow Rose tipis di kedua mode, dengan shared pill input dan CTA Rose. Style burger dan kedua dialog saat ini dikunci sampai owner meminta perubahan spesifik.
- Registration dialog tidak boleh menempatkan action `Masuk` di header kanan bila bertabrakan dengan tombol close `X`; switch ke `Masuk` ditempatkan di bawah form. Login/register copy harus general-event oriented, bukan wedding-only.
- Rose petals di `components/Layout/background.tsx` adalah protected visual element.

### 15.4.1 Pintu 3D — visual review bertahap (approved 20 September 2026)

- Pintu 1 harus disempurnakan sendirian sebelum geometri/visualnya direplikasi ke Pintu 2/3 dan sebelum seluruhnya diintegrasikan kembali dengan orbital Motion. Ada 15 tahap terukur pada `pintu3d.md` (tracker visual khusus, bukan PRD pengganti). Setiap tahap wajib menghasilkan perubahan visual yang dapat diperiksa pengguna.
- Saat Pintu membuka, **seluruh daun kiri/kanan** beserta panel, ukiran, dan dekorasi yang menempel padanya berputar di pivot/engsel masing-masing; hanya kusen, ambang, dan ruang interior yang tetap diam. Beri ketebalan, muka/belakang, dan sudut bukaan lengkap (>90°), tanpa panel/facade tersisa di tengah atau gambar kusen yang ikut berputar.
- Siluet monumental, material matte Rose canonical, engsel masuk akal, relief/list/bunga terintegrasi, interior bervolume, dan cahaya ivory–Rose keluar hanya saat buka. Hindari kotak/tanduk/balok abu-abu, panel datar, plastik mengilap, foto melar, atau giant pink glow.
- Gunakan preview terisolasi `/pintu-lab` untuk Pintu 1 agar existing navigation/orbit pada landing utama `/` tidak berubah sebelum visual direview/di-approve owner. Eksperimen `/jiplak` tetap independen; tiga Pintu serta orbital baru disatukan kembali setelah persetujuan Pintu 1. Patuhi reduced motion dan evaluasi desktop/mobile.

### 15.4.1a Rebuild V2 Three.js — referensi dikunci (20 September 2026)

- Owner meminta mengulang Tahap 1 karena percobaan CSS 3D + SVG sebelumnya belum mencapai kualitas arsitektural yang terlihat realistis. **`public/pintu1.png` adalah referensi bentuk tetap, bukan inspirasi untuk diinterpretasikan ulang.** Kunci hierarki kusen klasik dengan pilaster, cornice berlapis, crown acanthus simetris dan medali oval di lintel; daun kiri/kanan dengan panel atas tinggi, panel horizontal kecil, panel bawah, ukiran klasik kecil serta sepasang pegangan panjang dan engsel samping. Jangan membuat rose crest bunga besar atau motif daun/bunga generik sebagai pengganti bentuk referensi. Warna Rose pada daun, ivory–blush pada kusen dan aksen rose-gold/champagne mengikuti **detail gambar**, tidak memaksakan emas dominan atau tekstur berkilau seperti plastik.
- Geometri akhir dibangun sebagai mesh nyata di Three.js (dependency sudah tersedia). Kusen, crown dan ruang di belakang berdiri diam. Dua daun utuh dengan tebal, muka, belakang, panel, dan ornament 3D masing-masing menjadi anak satu pivot pada engsel luar sehingga ketika dibuka seluruh daun berputar, bukan foto facade dibelah dua dan digerakkan. Boleh menggunakan asset 3D sculpt/glTF teroptimasi untuk ukiran detail bila primitif tidak mencapai fidelity; jangan menyatakan ikon SVG atau gambar planar sebagai relief 3D. Foto referensi boleh dipajang **di samping** preview untuk perbandingan, bukan menjadi satu gambar facade yang ikut berputar.
- `/pintu-lab` menjadi tempat rebuild Three.js; eksperimen CSS lama tetap di `/pintu-lab/css` sebagai arsip/pembanding dan `/jiplak` tetap eksperimen terpisah. **Landing utama `/` dan orbital tiga pintu tidak diubah** sebelum Pintu 1 mendapat approval visual. Engine harus lazy-load di route lab, memperhatikan viewport/reduced motion, membersihkan WebGL resources, dan menyediakan fallback saat WebGL tidak tersedia.
- Pelaksanaan berurutan **15 tahap V2** dalam `pintu3d.md`. Tahap 1 hanya membuktikan volume kusen dan dua daun ber-engsel benar-benar mesh: belum memodelkan crown/ukiran/hardware akhir. Tahap 2–8 menyamakan siluet, panel, sculpt/relief dan material sedekat referensi; Tahap 9–10 interior volumetrik serta cahaya natural; Tahap 11–13 fidelity screenshots, responsive dan performa; Tahap 14 reuse pintu; Tahap 15 integrasi orbital + zoom-in melewati bukaan → navigasi route nyata → zoom-out halaman tujuan ke skala 1 sesuai §15.4.2. **Tahap 1–10 pada tracker V1 bukan bukti approval V2**. Tiap tahap harus menunjukkan perubahan visual dan status CI serta review owner secara terpisah.
- Referensi interaksi [Hubtown](https://hubtown.co.in/) dipakai hanya untuk rasa **scene/box WebGL utama**: Pintu final harus terbaca sebagai objek spasial dominan dengan perspektif, kedalaman dan gerak kamera, bukan kartu/gambar 2D. Jangan menyalin branding, arsitektur, copy atau asset Hubtown. Catatan ini berlaku pada composition/camera work Tahap 11–15 dan tidak memperluas scope Tahap 2.

### 15.4.2 Transisi navigasi Pintu — masuk ke halaman tujuan (keputusan 20 September 2026)

- Saat pengunjung **mengaktifkan** Pintu pada landing (klik/tap atau keyboard Enter/Space pada tautan/tombol yang sesuai), pilihan dunia/layanan menentukan route tujuan yang sudah canonical: Event Planner `/event-planner`, Digital Invitation `/d-invitation`, Guestbook `/guestbook`. Hover dan rotasi orbital **tidak** boleh otomatis menavigasi. Begitu navigasi dimulai, orbital berhenti sementara dan Pintu terpilih menjadi fokus.
- Koreografi target: **(1)** Pintu terpilih maju/terfokus dan seluruh kedua daun terbuka pada engselnya, kusen tetap; **(2)** kamera/pandangan bergerak maju (zoom-in) menuju **bukaan kosong di tengah kusen**, melewati kusen, bukan membesarkan daun/kusen sebagai kotak hingga memenuhi layar; **(3)** adegan interior menjadi jembatan visual singkat ke halaman yang dipilih, tanpa black flash/blank screen; **(4)** halaman tujuan yang sesungguhnya mulai sedikit lebih dekat/besar (contoh skala sekitar 1.08–1.15, diuji secara visual), lalu **zoom-out lembut ke skala 1**, sampai layout tujuan **pas satu viewport pada layar awal**. Yang di-zoom adalah adegan/overlay transisi atau container konten halaman, **bukan mengubah browser zoom**. Halaman tujuan setelah animasi tetap bisa discroll sesuai kontennya; jangan mengecilkan semua konten halaman panjang menjadi satu layar atau menjadikan typography terlalu kecil. Jangan memaksa header global/brand membesar terpisah dari konten atau meninggalkan elemen terklip.
- Perpindahan rute harus sungguhan (URL, browser history, direct-link, back/forward, auth/navigation semantics tetap benar). Prefetch/siapkan halaman tujuan secara wajar, tampilkan fallback bila proses lambat, dan hentikan transition overlay setelah destination siap; tidak boleh muncul dua halaman aktif yang bertumpuk, stuck overlay, atau kehilangan fokus keyboard. Saat page destination selesai muncul, fokus/scroll terkelola dan kontrol bekerja normal.
- Gunakan satu orkestrator/shared transition state untuk tiga Pintu dan tiap route, sehingga timing, masking/portal interior, responsive viewport, reduced motion, touch/keyboard, serta cancel/error handling konsisten. Aset interior 2.5D `/pintu-lab` **belum** otomatis menjadi ruang 3D yang benar-benar dapat diterbangi kamera; uji close-up/scale, dan gunakan scene/overlay yang mendukung ilusi transisi tanpa memperbesar ilustrasi hingga tampak datar/pixelated.
- **Transisi landing aktif tanpa pintu kedua (22 September 2026):** Saat pengguna menekan `Masuk` pada Pintu layanan di landing, pertahankan pemilihan/orbital, bukaan daun asli dan zoom kamera masuk menuju bukaan; **jangan** memunculkan pintu kedua, gambar pintu layanan lagi, atau pintu orbital lain setelah zoom. Gambar layanan pada permukaan `PortalWorld` hanya terlihat pada saat memilih/membuka pintu, kemudian memudar menjadi bidang cahaya Rose polos selama fase masuk. Untuk renderer landing saat ini yang masih memiliki backdrop datar, kamera harus berhenti di depan bidang portal agar tidak menembusnya dan memperlihatkan pintu orbital lain; kesan masuk diteruskan oleh veil Rose yang dimulai saat zoom berlangsung, sebelum route tujuan muncul. Tidak ada asset pintu baru atau render pintu dalam veil `PortalTransition.tsx`. Sinkronkan navigasi setelah zoom dan veil menutup pintu asli; pertahankan aksesibilitas/reduced-motion, navigasi route, sound, serta visual pilihan pintu sebelum menekan Masuk. Eksperimen V2 `/pintu-lab`/`/jiplak` bukan bagian perubahan ini.
- Untuk `prefers-reduced-motion`: langsung navigasi dengan fade singkat atau tanpa zoom. Jangan memblokir akses bila animasi tidak didukung, ketika halaman destination belum siap, atau saat koneksi lambat. Timing akhir disetel lewat review screenshot/video browser, bukan angka tetap yang diasumsikan selesai.
- Implementasikan pengujian interaksi transisi **setelah Pintu 1 disetujui visualnya**: Tahap 10 lighting menyiapkan titik terang di bukaan; Tahap 11–13 memverifikasi clipping/responsivitas/performa; Tahap 14 membuat komponen Pintu reusable; **Tahap 15** menggabungkan tiga Pintu + orbital + zoom-in lintas route + zoom-out halaman. Landing utama `/` tidak diubah selama preview `/pintu-lab` belum disetujui.

### 15.5 User-facing copy

Dashboard harus menjelaskan:
- current state;
- next action;
- event context;
- seluruh copy navigasi/operasional mengikuti locale aktif `id` / `en`, dengan `id` sebagai default.

Microcopy Dashboard wajib singkat, natural, dan context-aware:
- jangan mengulang noun/konteks yang sudah jelas hanya untuk mengisi eyebrow, title, description, selector, metric, card, atau action;
- hindari pola repetitif seperti `Workspace → Acara → pilih acara → acara aktif` dalam satu view;
- bila konteks sudah terbentuk oleh page/title, label boleh dipersingkat menjadi `Total`, `Terbaru`, `Lihat semua`, `Detail`, atau label fungsi lain yang lebih informatif;
- generic filler seperti `Workspace` tidak digunakan sebagai decorative label; gunakan konteks nyata seperti `Persiapan`, `Publikasi`, `Distribusi`, `Kehadiran`, atau hilangkan label bila tidak menambah informasi;
- utamakan menghapus copy redundan daripada menggantinya dengan sinonim;
- jangan mengulang metric/context yang sama pada header card dan metric grid yang berdekatan.

Dashboard tidak boleh menampilkan internal implementation details seperti database row, raw DB ID, source-of-truth explanation, atau API mechanics kecuali diagnostic/support workflow memang membutuhkan.

---

## 16. Public Marketing & Product Terminology

Digital Invitation marketing harus memakai general-event language, bukan wedding-only language.

Marketing minimum menjelaskan:
- Rp150.000 per event;
- 1 event = 1 digital invitation = 1 saved template/design;
- event dapat dibuat tanpa limit 3;
- payment event-scoped;
- payment diperlukan pada Publish;
- RSVP + guest management termasuk Digital Invitation sesuai feature set;
- WA Blast adalah add-on terpisah.

Guestbook marketing juga harus event-oriented.

### 16.1 Guestbook dan Undangan Fisik — main frame marketing

Halaman `/guestbook` dan `/undangan-fisik` menggunakan komposisi frame viewport yang sudah disetujui pada `/d-invitation` dan `/event-planner`: bingkai Rose responsif ±90vw; navbar embedded tetap di atas, footer compact embedded berisi player musik persisten serta Instagram tetap di bawah, hanya `main` di tengah yang scroll. Dekorasi bunga, kelopak dan Rose glow memakai **satu** `PublicMarketingAtmosphere` per route di dalam scene, bukan overlay dekorasi global tambahan. Semua konten memakai satu lebar tengah 88% mobile / 80vw mulai sm, `max-w-[1100px]`, dengan gap antarsection 80px mobile / 96px desktop. Global `PublicAtmosphere`, `PublicContent`, Navbar, Footer serta `MarketingFloatingControls` harus mengecualikan kedua framed route ini agar tidak menumpuk background, footer, navbar atau kontrol audio/Instagram.

Pakai `ScrollReveal` berbasis panel scroll internal untuk opacity/translateY per section (`once:false`) dan `MarketingTextReveal` untuk animasi ulang teks hanya setelah keluar dari viewport panel lalu masuk kembali, dari arah scroll mana pun; kendali interaktif, animasi `prefers-reduced-motion` dan keyboard tetap berfungsi. Visual kartu mengikuti Rose outline/radius dan tipografi Cinzel/Fauna One/DM Mono marketing. Pertahankan data fitur/check-in, review/FAQ/paket dan tautan pada Guestbook; pada Undangan Fisik pertahankan ilustrasi cetak, proses pemesanan, target anchor `#proses` / `#konsultasi` di dalam scroll panel serta tautan WhatsApp dan Digital Invitation. Kedua route tetap bisa dikunjungi dari widget Pintu kiri. Jangan mengubah konten, pintu landing, Dashboard atau undangan tamu.


---

## 17. Key API / Server Contracts

### Invitation/Event API

`POST /api/invitations`
- membuat configured event ketika form valid;
- dapat reuse legacy blank draft yang aman;
- tidak membuat event kosong hanya karena user membuka form;
- untuk WEDDING dapat menerima empat optional parent identity fields dan menyimpannya event-scoped.

`PUT /api/invitations`
- update event/design;
- mempertahankan/update optional wedding parent identity;
- publish guard memeriksa configured state, template, data minimum, dan payment entitlement.

Jika Prisma mendeteksi table/column production belum sinkron (`P2021`/`P2022`), API invitation harus mengembalikan error operasional yang dapat ditindaklanjuti, bukan hanya generic save error. Raw database detail tetap tidak boleh diekspos ke user.

### Guest/RSVP

Guest read/write harus menerima event scope yang jelas dan memverifikasi ownership/permission.

### Personal Invitation

GET/POST/PATCH membutuhkan explicit `invitationId`.

### Seating

Table/seat mutation harus memverifikasi event ownership/scope dan collision.

### Usher

QR/manual check-in harus resolve guest + invitation secara konsisten dan tidak cross-event.

### Public renderer

Tidak merender final invitation tanpa configured + saved template + published + paid state.

---

## 18. Implementation Priority

### P0 — Security Foundation
- Public RSVP rate limiting / anti-spam.

### P1 — Core Operational
- Guest Category & Tags.
- Offline-First Usher.
- WhatsApp gateway/provider integration.
- Multi-user / Event Organizer access.
- Explicit event selector/context untuk seluruh Usher flow.

### P2 — Product Expansion
- Digital Gift / QRIS.
- Live Guestbook Wall.
- WA Blast top-up transaction layer.
- Data Retention Policy.
- private/signed premium template asset delivery.

### P3 — Advanced Onsite Hardware
- Bluetooth thermal name label / wristband printing.

---

## 19. Compatibility & Known Technical Debt

Current compatibility debt yang boleh dipertahankan sementara tetapi tidak boleh menjadi arah produk baru:
- `InvitationType.WEDDING` / `ADAT_AKAD`;
- `groomName` / `brideName`;
- `weddingHashtag`;
- `ceremonyTime` / `receptionTime` naming;
- fallback root domain `dcwedding.com`;
- historical blank invitation draft rows;
- some legacy route aliases.

Target migration harus dilakukan terencana agar existing invitation tidak rusak.

Additional known work:
- final domain migration belum ditetapkan;
- WA provider nyata belum dianggap delivered sampai integration + delivery status benar-benar tervalidasi;
- premium template master-asset privacy perlu private storage bila ingin proteksi lebih kuat;
- production migration execution harus diverifikasi per deployment; source migration file dan successful `pnpm build` saja tidak membuktikan DB production sudah migrated;
- seluruh template renderer baru wajib membaca section visibility/configuration yang sama dengan Studio; renderer legacy yang belum mengikuti contract ini harus dimigrasikan sebelum dianggap production-ready.

---

## 20. Definition of Done

Sebuah feature dianggap selesai hanya jika, sesuai scope feature tersebut:
- requirement product terpenuhi tanpa menghidupkan kembali rule yang sudah superseded;
- data disimpan di PostgreSQL/Prisma bila persistent;
- event isolation terjaga;
- server-side authorization/entitlement diterapkan;
- UI menggunakan design system/canonical Button;
- empty/loading/error/success state tersedia;
- tidak ada mock production data;
- accessibility dasar dan responsive behavior tetap terjaga;
- relevant build/type validation dijalankan/diamati sebelum diklaim PASS;
- perubahan material dicatat di `prd1.md` dengan affected files, commit, dan validation status.

### Critical end-to-end acceptance

Minimal canonical Digital Invitation journey harus bekerja:

`Tambah acara → input acara (WEDDING dapat mengisi parent identity opsional) → dd/mm/yyyy date dengan calendar picker + waktu 24 jam HH:mm → Simpan acara → database event configured → Buat undangan → parent line otomatis tersedia di preview/template jika diisi → pilih template → canvas berubah mengikuti template → atur section RSVP/Wishes/Gift sesuai kebutuhan → edit → Simpan desain → Publish → unpaid diarahkan ke paket event → payment aktif → Publish sukses → public invitation dapat dibuka.`

Public route harus tetap menolak event yang belum configured, belum menyimpan template, belum published, atau belum memiliki valid event-scoped entitlement.

Untuk deployment yang membawa migration baru, end-to-end persistence baru dianggap siap di environment target setelah `prisma migrate deploy` / `pnpm db:deploy` berhasil diterapkan pada database target. Build CI tidak menggantikan langkah ini.

---

## 21. Documentation Governance

Mulai dari hasil merge ini, **hanya satu dokumen PRD aktif yang digunakan: `prd.md`**.

Aturan:
- `prd.md` adalah single source of truth untuk requirement aktif sekaligus menyimpan implementation history ringkas pada appendix;
- jangan membuat `prd1.md`, `prdnew.md`, `PRD2.md`, dan file PRD paralel lain untuk requirement baru;
- apabila owner **secara eksplisit meminta `prd-tambahan.md`**, file tersebut boleh dipakai hanya sebagai supplemental delta log non-canonical; requirement aktif tetap wajib disinkronkan ke body `prd.md` dan histori material tetap masuk Appendix A;
- jika requirement berubah, edit section canonical di badan utama terlebih dahulu;
- catat implementasi material pada **Appendix A — Implementation History** di dokumen yang sama;
- requirement superseded diganti/dihapus dari body canonical, sementara histori perubahan tetap dipertahankan secara ringkas di appendix;
- draft ide yang belum disetujui dapat dicatat sementara di issue/task/work notes, bukan sebagai PRD kedua;
- jangan mengklaim build, lint, CI, migration, atau deployment PASS tanpa hasil aktual yang diamati.

---

# Appendix A — Implementation History

Appendix ini menggabungkan histori yang sebelumnya berada di `prd1.md` dan delta implementation yang sebelumnya berada di `prd-tambahan.md`. Isi appendix bersifat historis; jika ada konflik dengan requirement canonical di bagian utama, **bagian utama PRD yang berlaku**.

## 2026-09-17 — PRD Consolidation & Documentation Reset

### Summary
Seluruh requirement yang sebelumnya tersebar di:
- `prd.md` lama;
- `PRD-TAMBAHAN.md`;
- `PRD1.md`;
- `PRD2.md`;
- `PRD3.md`;
- `PRD4.md`;
- `PRD5.md`;

dikonsolidasikan menjadi satu master `prd.md` tanpa mempertahankan requirement yang sudah superseded.

### Conflict resolution applied
Keputusan terbaru yang dijadikan canonical antara lain:
- DC Organizer adalah general-event SaaS, bukan wedding-only;
- jumlah event tidak dibatasi 3;
- Digital Invitation = Rp150.000 per event;
- entitlement/payment bersifat event-scoped;
- WA Blast default quota = 0;
- WA Blast 50 credits = Rp75.000 sebagai add-on;
- event creation flow = `Tambah acara → input → Simpan acara`;
- database row baru dibuat pada save valid, bukan hanya karena form dibuka;
- `Buat undangan` hanya tersedia setelah event tersimpan;
- user boleh masuk Studio dan menyimpan desain sebelum membayar;
- template wajib tersimpan (`templateKey`) sebelum Publish;
- payment gate berada pada Publish;
- unpaid Studio memakai preview/watermark strategy;
- public rendering memerlukan configured + saved template + published + paid;
- event date user-facing menggunakan `dd/mm/yyyy`;
- Personal Invitation, RSVP, seating, WA Blast, dan onsite flow harus event-scoped;
- `Appendix A — Implementation History` menjadi satu-satunya implementation changelog setelah consolidation.

### Removed contradictory legacy rules
Rule berikut tidak lagi dianggap aktif:
- wedding-only product vision;
- onboarding universal groom/bride;
- max 3 event;
- Digital Invitation Rp300.000;
- free WA Blast quota 100;
- account-level Digital Invitation unlock untuk event lain;
- additional event maksimal 2;
- `Tambah acara → langsung Studio`;
- blank event row sebagai mandatory first step;
- publish tanpa saved template.

### Documentation structure after consolidation
Final documentation model:
- `prd.md` → requirement produk aktif / source of truth;
- `Appendix A — Implementation History` → implementation changelog;
- `README.md` → project/product overview & setup;
- `AGENTS.md` → agent/engineering rules.

Legacy PRD split files dihapus setelah isi relevan dipindahkan ke master.

### Consolidation commits
- `8b7356b748ff534ba4a945eb67b56e2c4809fef6` — consolidate DC Organizer product requirements into single master PRD;
- `bf556d0941830baf008fed39118492ccbd0a070a` — remove superseded `PRD-TAMBAHAN.md`;
- `d3bf85d3552394bd6d7494781e9761b73d4f54e4` — remove superseded `PRD2.md`;
- `d0ba3d07de9938f4e31ea4e5431bfff4e130d0b4` — remove superseded `PRD3.md`;
- `7022f3b7f0481045b774e58b3e7a5bc0e99224bc` — remove superseded `PRD4.md`;
- `f0cdaea4313b44f7738055cc3c708d075f827d58` — remove superseded `PRD5.md`;
- `5a462f6b2346ec9b7298ea52f009ea5f02b0527e` — remove legacy uppercase `PRD1.md`;
- `27a65c2de4f0825d4f3429866a65ec578fc7e72a` — create lowercase `Appendix A — Implementation History` unified changelog;
- `752d313935399107814257067f2db62f17a717a4` — align `AGENTS.md` with `prd.md` + `Appendix A — Implementation History` governance.

### Removed files
- `PRD-TAMBAHAN.md`;
- `PRD1.md`;
- `PRD2.md`;
- `PRD3.md`;
- `PRD4.md`;
- `PRD5.md`.

### Agent rule synchronization
`AGENTS.md` was updated so future coding sessions must read:
1. `AGENTS.md`;
2. `SKILL.md` / applicable skill;
3. `prd.md`;
4. `README.md`;
5. `Appendix A — Implementation History`;
6. relevant implementation files.

Every material implementation change is now appended to `Appendix A — Implementation History`. A product requirement change must update `prd.md` first. Agent rules also no longer treat couple fields as universal semantics and no longer instruct creation of `PRD-TAMBAHAN.md`.

### Validation
Perubahan consolidation ini adalah documentation/governance change. Tidak ada runtime application logic yang diubah oleh PRD cleanup atau AGENTS synchronization.

Build validation terbaru sebelum consolidation yang telah diamati:
- GitHub Actions **Build Validation #826**;
- head commit `01172c45eea5365df104ccdb667367a7f5f4f796`;
- conclusion: **success**.

Hasil tersebut memvalidasi source state aplikasi sampai perubahan `dd/mm/yyyy` sebelum documentation consolidation. Hasil tersebut tidak otomatis membuktikan production deployment atau database migration execution.

---

## Consolidated Historical Implementation Milestones

Bagian ini hanya mempertahankan histori teknis penting dari PRD lama agar jejak implementasi tidak hilang. Requirement aktif tetap dibaca dari `prd.md`.

### 2026-09-16 — General Event Category & Event-Centric Studio

Implemented:
- shared event category catalog;
- `Invitation.eventCategory`;
- category-aware names/title generation;
- WIB/WITA/WIT normalization;
- event-centric Studio using exact `invitationId`;
- removal of active wedding-only Studio tabs;
- generic event timing;
- event-category-aware preview;
- `AuditLog` Prisma model restoration;
- related TypeScript fixes.

Key commits retained from historical log:
- `52a7f71700427e963cc23219e867c3be5875de1e`;
- `0b768dc836405d8d1374fa4e642b21c4dbf9079e`;
- `ff272512707e83175db5c1db38d9b93e0ce1e5f7`;
- `f03a397d799e5ea70103ba19bfe2b4ac12acf15b`;
- `52f1276a4f568dc4050d77472d345dc5ba60d0ff`;
- `63a73da49ac033cf42eeb648686aa7fc6f914ea9`;
- `dfb2d54e42a617c222cf0d87bf7d53c5ead46fe9`;
- `8cc8b89fb2eaebad1dd7d26f1b32a64e9cf8c10a`;
- `1f869d8943342501bb8084c42eac69aca177e744`;
- `72e20968f8f664bb24d4100045f563d8dbbb785d`.

Observed validation at that phase:
- Build Validation #783 → success.

### 2026-09-16 — Public Generalization & Personal Invitation Event Scope

Implemented:
- category-aware public renderer;
- generalized Eternal Blossom/Figma Classic renderer;
- unlimited configured-event public routing;
- event-scoped Digital Invitation access;
- public password gate design-system alignment;
- Guestbook public copy generalization;
- Personal Invitation API requires explicit `invitationId`;
- event-scoped Personal Invitation selector/data isolation;
- non-wedding Personal Invitation preview support.

Notable historical fix:
- build #799 failed due obsolete `eventKind` prop;
- commit `7dda95824c872ed6c3bff81ba6ab13ce637f4354` removed the incompatible prop.

Observed validation:
- Build Validation #804 → success.

### 2026-09-16 — Dashboard SaaS Action Hierarchy

Implemented:
- Invitation Workspace makes Studio/design the primary action;
- clearer event lifecycle action hierarchy;
- removal of technical/database implementation copy from customer dashboard;
- application copy focuses on state + next action.

Key commits:
- `d82598327429a0c8a86993c38bbab81d3d35930d`;
- `8ef438c725a4c4f2098bd1486dccc0307485d892`.

Observed validation:
- Build Validation #807 → success.

### 2026-09-17 — Final Event-First Invitation Lifecycle

Implemented flow:

`Tambah acara → input data → Simpan acara → Buat undangan → pilih template → edit → Simpan desain → Publish → payment gate jika unpaid`.

Implementation changes:
- event record persistence moved back to successful Save flow;
- backend may reuse historical blank draft safely;
- `templateKey` required before publish;
- publish remains server-authoritative;
- Digital Invitation package only required at Publish;
- unpaid Studio remains usable for preview/design;
- public renderer requires configured + template + published + payment state;
- Studio preview receives `PREVIEW • DC ORGANIZER` watermark when unpaid;
- context-menu/drag/select deterrence added to unpaid preview;
- recommendation recorded for private master template assets + signed URLs.

Key commits:
- `4effd9da8c4429c44b48bcfb3403b70bf1532cd3`;
- `29c40c9883650b6aa3c266d490a621914ed93d08`;
- `c5bb4df32037903911f9ef48dbb2136fd91f8a90`;
- `bf4d5fa01361b07b57ff8db8d6b4d4c369221f61`;
- `01f2859668b308124bb59c35e6054fc045b2a67f`;
- `d730e00e4c55c621ec9b714f6bc3b75effa879ad`;
- `56e00c714c76110208ef8ecd43c60dffc06bf396`.

### 2026-09-17 — `dd/mm/yyyy` Event Date Input

Implemented:
- `Tanggal acara` displays `dd/mm/yyyy`;
- slash auto-formatting;
- calendar-validity checking;
- conversion to ISO before API/database;
- ISO-to-display conversion on edit.

Key commits:
- `c44a8c19797d55e94b18c834ded33ac46a474eae`;
- `01172c45eea5365df104ccdb667367a7f5f4f796` documentation follow-up.

Observed validation:
- Build Validation #826 → **success**.

---

## 2026-09-17 — Interactive Schedule Controls & Full-Width Dashboard Shell

### Requirement / Intent
Dashboard desktop harus memanfaatkan lebar aplikasi secara penuh, header berada selebar viewport dengan sidebar dimulai di bawah anchor logo DC Organizer, tabel tidak terlihat dipaksa stretch, dan field jadwal harus tetap nyaman dipilih secara interaktif tanpa kehilangan format canonical.

### Implementation
- dashboard customer memakai full-width application shell alih-alih centered `92vw / 1400px` workspace;
- header menjadi global full-width top bar;
- sidebar desktop dimulai di bawah header/logo dan memakai sisa tinggi viewport;
- main workspace memakai sisa lebar desktop dengan responsive gutter;
- tabel dashboard memakai content-driven width + horizontal overflow pada viewport kecil agar kolom tidak terdistorsi;
- `Tanggal acara` tetap menampilkan `dd/mm/yyyy` tetapi icon kalender kembali tersedia dan membuka picker interaktif;
- `Waktu mulai` dan `Waktu selesai` sekarang memakai komponen 24-hour interaktif dengan icon jam;
- user dapat mengetik `HH:mm` manual atau memilih jam `00–23` dan menit `00–59` dari picker;
- tidak ada opsi AM/PM pada picker aplikasi;
- validasi frontend menolak waktu di luar `00:00–23:59`;
- tidak ada perubahan schema/database.

### Affected Files
- `app/dashboard/layout.tsx`
- `components/Dashboard/EventPanel.tsx`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `bbd6effabb8fda94d0eff25449428e04e1e13d3a` — full-width dashboard shell styling;
- `aa32a6aedcb1683732518352c4d0675f9f1b945c` — restore calendar picker while retaining `dd/mm/yyyy`;
- `325a9fc0ac2fb7024eef4b0dd82dc1c2d8731dac` — document interactive date + full-width dashboard requirements;
- `5d6f1f4051961bdf476801a0910ead3e4ece3118` — add interactive 24-hour time pickers;
- `3df42e612f8cb499157d841ab6f2c8784a3e8fce` — specify interactive 24-hour event time controls in master PRD.

### Validation
- Build Validation #839 for dashboard/calendar requirement state: **PASS**.
- Build Validation #840 for 24-hour time-picker source state: **PASS**.
- Database migration: N/A.

---

## 2026-09-17 — Optional Wedding Parent Identity & Save-Path Migration Diagnostics

### Requirement / Intent
Untuk event `WEDDING`, Rangkaian Acara perlu menyimpan data nama bapak dan ibu masing-masing pengantin secara opsional. Data tersebut otomatis dipakai oleh preview/undangan sebagai parent line `Anak dari Bapak … & Ibu …`. Pada saat yang sama, kegagalan `Simpan acara` perlu ditelusuri karena build sebelumnya sukses tetapi runtime save masih dilaporkan gagal.

### Implementation
- menambahkan field nullable `groomFatherName`, `groomMotherName`, `brideFatherName`, dan `brideMotherName` pada `Invitation`;
- menambahkan migration PostgreSQL khusus empat kolom parent identity;
- form `Rangkaian Acara` menampilkan dua panel orang tua opsional hanya ketika category `WEDDING` dipilih;
- parent fields ikut POST/PUT event dan dibaca kembali saat Edit acara;
- ketika category berubah dari `WEDDING`, parent identity tidak dipaksakan ke category lain;
- helper parent-line menghasilkan `Anak dari Bapak <nama> & Ibu <nama>` dan aman untuk partial data;
- Studio preview, synced content summary, generic public invitation, dan Figma Classic template membaca parent identity secara otomatis;
- format waktu yang tampil pada event/preview dipertahankan sebagai `HH:mm` dengan tanda `:`;
- API invitation menambah server-side validation format waktu 24 jam;
- API GET/POST/PUT sekarang mengenali Prisma `P2021`/`P2022` dan mengembalikan status `503` dengan pesan bahwa database server belum sinkron, tanpa membocorkan raw database detail;
- menambahkan script `pnpm db:deploy` (`prisma migrate deploy`);
- README menjelaskan bahwa `pnpm build`/GitHub Actions tidak menjalankan migration production.

### Save failure diagnosis
Evidence repository menunjukkan migration `eventCategory` sudah ada di source, tetapi workflow `.github/workflows/build.yml` hanya menjalankan install + `pnpm build` dan tidak menjalankan `prisma migrate deploy`. Karena API runtime sudah membaca kolom Prisma baru, database production yang belum menjalankan migration dapat menghasilkan missing-table/missing-column Prisma error sementara CI Build tetap PASS.

Ini adalah penyebab paling kuat yang dapat diverifikasi dari repository untuk laporan “masih belum bisa simpan”, tetapi production database/log tidak tersedia pada connector ini sehingga migration production **belum dapat diklaim sudah diterapkan**. Deployment target harus menjalankan `pnpm db:deploy` terhadap `DATABASE_URL` production sebelum persistence schema baru dapat dianggap aktif.

### Affected Files
- `prisma/schema.prisma`
- `prisma/migrations/20260917094500_add_wedding_parent_names/migration.sql`
- `app/api/invitations/route.ts`
- `components/Dashboard/EventPanel.tsx`
- `components/InvitationStudio/InvitationDesigner.tsx`
- `components/PublicInvitation/PublicInvitation.tsx`
- `components/PublicInvitation/FigmaClassicTemplate.tsx`
- `lib/events/parents.ts`
- `package.json`
- `README.md`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `f600e5ec8b6d717478a8cdd32554b2fa238fa447` — add optional wedding parent names to Prisma schema;
- `09f646270278a08c242002105627949fabcc107a` — add wedding parent-name migration;
- `5a1c3c05ea2f6d1bcf384435b390b8e8f8f474d8` — persist wedding parent names and expose migration errors;
- `cd64f54e0840bda46192a088103815fcc0778c2d` — add optional wedding parent fields to event form;
- `3039e559c237615d4f9b0bec3504268ee6aaf423` — render wedding parent identity in generic public invitation;
- `c2db820d1bdd5febc838b3abbdeabc184e439c29` — show wedding parent lines in Figma Classic template;
- `cacaa3043859d8e7bb58912bbfbfe4efb21f10b4` — add shared wedding parent-line formatter;
- `6e504de829b7e4103e6f3a80ebd4bae8e461fbaf` — show wedding parent identity in Studio preview;
- `a5d9454d85bb8ddfa235cf87af5c276198eb5c23` — add production Prisma migration command;
- `ebeba17af3ab0e4bb4eae53fec94c9554a6e9e01` — document production database migration step;
- `8c80742fff0337b1fc357035c799e0ebf7aa76c7` — define wedding parent identity and production migration requirements.

### Validation
- GitHub Actions **Build Validation #851** on source head `6e504de829b7e4103e6f3a80ebd4bae8e461fbaf`: **PASS**; Build step completed successfully.
- Prisma migration source file: **CREATED**.
- Production/VPS migration execution: **NOT APPLIED / NOT VERIFIED from this environment**.
- No production save success is claimed until target database runs pending migrations.

---

## 2026-09-17 — Repository Hygiene, Canonical Dashboard Route & Prisma 7 Cleanup

### Requirement / Intent
Audit repository dilakukan dengan `prd.md` sebagai source of truth untuk mengurangi sisa vibe-code, duplicate tooling, route legacy yang membingungkan, dan konfigurasi yang sudah tidak sesuai stack canonical tanpa menghapus fitur P1/P2 yang masih direncanakan.

### Implementation
- menghapus `package-lock.json` karena project secara resmi memakai pnpm dan `pnpm-lock.yaml` sebagai lockfile canonical;
- menambahkan `package-lock.json` ke `.gitignore` agar lockfile npm tidak masuk kembali;
- memindahkan implementasi dashboard aktual dari dynamic folder `app/[dashboard]/page.tsx` menjadi `app/dashboard/page.tsx` sehingga `/dashboard` tidak lagi mengimpor halaman dari catch-all legacy;
- menghapus `app/[dashboard]/page.tsx` dan `app/[dashboard]/layout.tsx`, sehingga unknown one-segment routes tidak lagi diam-diam diarahkan ke `/` oleh dynamic catch-all;
- mempertahankan `/dashboard/undangan-digital` sebagai compatibility route, tetapi sekarang redirect ke canonical `/dashboard` dan tidak lagi memilih `WEDDING` pertama secara global;
- menyelaraskan `components.json` dari Hugeicons ke Lucide sesuai stack canonical di PRD/AGENTS;
- mengganti close icon Hugeicons pada primitive Dialog dan Sheet menjadi Lucide `X`;
- menyelesaikan sisa migrasi Prisma 7 pada `app/api/invitations/route.ts` dengan memakai namespace Prisma dari generated client;
- memperbarui `prisma/seed.ts` agar memakai generated Prisma Client + PostgreSQL adapter, konsisten dengan runtime Prisma 7;
- package Hugeicons belum dihapus dari `package.json`/`pnpm-lock.yaml` pada audit ini karena perubahan dependency harus menjaga lockfile tetap sinkron; source/config tidak lagi bergantung pada Hugeicons setelah perubahan ini.

### Affected Files
- `.gitignore`
- `app/dashboard/page.tsx`
- `app/[dashboard]/page.tsx` (removed)
- `app/[dashboard]/layout.tsx` (removed)
- `app/dashboard/undangan-digital/page.tsx`
- `package-lock.json` (removed)
- `components.json`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`
- `app/api/invitations/route.ts`
- `prisma/seed.ts`
- `Appendix A — Implementation History`

### Commits
- `5805a6dd55fbce29fbc509002090de8c3a17fc55` — canonicalize dashboard routes and package manager;
- `cd13c80223216c7cc5ad68a8019a6e292fbcede8` — standardize UI icons on Lucide;
- `ce452bf9cbdc95b99d1684e5b08d1b7c7b0f0ea1` — finish Prisma 7 generated-client migration.

### Validation
- Build Validation #867 exposed pre-existing Prisma 7 import/type drift and therefore **FAILED**; failure was investigated rather than ignored.
- Build Validation #869 on head `ce452bf9cbdc95b99d1684e5b08d1b7c7b0f0ea1`: **PASS**.
- Dependency install with `pnpm install --frozen-lockfile`: **PASS** in Build Validation #869.
- Database migration: N/A for this cleanup.
- Production deployment: not performed by this audit.

---

## 2026-09-17 — Repository Hygiene Follow-up: Dependency Trim, Agent Flow & Build Tracing

### Requirement / Intent
Melanjutkan audit repository dengan `prd.md` sebagai acuan agar sisa scaffolding, dependency runtime yang sudah tidak dipakai, instruksi agent yang tumpang tindih, dan warning build tidak terus menambah kebingungan pada alur vibe coding. Compatibility route dan dependency yang masih mendukung requirement aktif tetap dipertahankan.

### Implementation
- menghapus legacy `DashboardFeatureGuard`, `InvitationManagementPanel`, dan endpoint `/api/dashboard/access` yang masih memakai pola first-invitation/global dan tidak lagi menjadi bagian flow event-scoped canonical;
- menghapus root `SKILL.md` generic yang besar dan bertentangan dengan kebutuhan dashboard serta aturan Lucide project;
- menyederhanakan urutan kerja `AGENTS.md` menjadi `AGENTS.md → prd.md → README.md → Appendix A → implementation files` dan melarang generic project-wide prompt/skill yang menduplikasi atau berkonflik dengan governance tersebut;
- menghapus lima aset SVG bawaan starter Next (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) yang tidak direferensikan aplikasi;
- memperbaiki path upload image/audio agar statically scoped ke `public/uploads/images` atau `public/uploads/music`, sehingga Turbopack tidak lagi men-trace seluruh repository ke server output;
- memperbarui workflow build dari `actions/checkout@v4`, `actions/setup-node@v4`, dan `pnpm/action-setup@v4` ke major current yang digunakan audit (`v7`, `v7`, `v6`) agar warning runtime Node lama dari GitHub Actions hilang;
- menghapus dependency runtime yang sudah tidak memiliki pemakai: `@hugeicons/core-free-icons`, `@hugeicons/react`, dan `class-variance-authority`;
- memindahkan `dotenv` dan `shadcn` dari runtime `dependencies` ke `devDependencies`, karena keduanya hanya dibutuhkan untuk config/tooling;
- menjaga `@radix-ui/react-slot`, `tw-animate-css`, Konva/react-konva, Sharp, Motion, Prisma/PostgreSQL, dan dependency lain yang masih memiliki penggunaan nyata atau requirement aktif;
- sinkronisasi `package.json` dan `pnpm-lock.yaml` dilakukan melalui pnpm, bukan edit lockfile manual;
- workflow dependency-hygiene sementara hanya digunakan untuk menghasilkan lockfile canonical di runner, lalu dihapus kembali dari repository.

### Affected Files
- `components/Dashboard/DashboardFeatureGuard.tsx` (removed)
- `components/Dashboard/InvitationManagementPanel.tsx` (removed)
- `app/api/dashboard/access/route.ts` (removed)
- `AGENTS.md`
- `SKILL.md` (removed)
- `public/file.svg` (removed)
- `public/globe.svg` (removed)
- `public/next.svg` (removed)
- `public/vercel.svg` (removed)
- `public/window.svg` (removed)
- `app/api/invitations/assets/upload/route.ts`
- `.github/workflows/build.yml`
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/dependency-hygiene.yml` (temporary, removed)
- `Appendix A — Implementation History`

### Commits
- `e5681f696abf8101598033dfef170d83d92ea5a2` — remove legacy dashboard access flow;
- `4276d0ef5e9b044a78a674952ade4c246675ac0c` — trim repository scaffolding and tighten upload tracing;
- `ec55f5510493ca3adc60d6dd520880c89dd78a95` — update GitHub Actions runtime;
- `142138baab19593f5d2c67b32f6fef1f42ae9470` — add temporary one-shot dependency hygiene workflow;
- `267b43f391702502f2dcf5d2d2f1c4eae0be6063` — pnpm-generated dependency trim and synchronized lockfile;
- `ad0cfa324df4985e9dab419633b85ba11d2422fe` — remove temporary dependency hygiene workflow.

### Validation
- Build Validation #871 after legacy dashboard flow removal: **PASS**.
- Build Validation #872 after scaffolding cleanup and upload-path change: **PASS**; previous Turbopack whole-project filesystem tracing warning no longer appeared.
- Build Validation #875 on final dependency-clean state: **PASS**.
- `pnpm install --frozen-lockfile` on Build Validation #875: **PASS**; lockfile reported up to date and supply-chain policy verification passed.
- TypeScript / Next production build on #875: **PASS**.
- GitHub Actions Node-20 deprecation warning seen on older action majors no longer appeared after workflow upgrade.
- Database migration: N/A.
- Production deployment: not performed by this audit.

---

## 2026-09-17 — Desktop Workspace Width & Decorative Number Cleanup

### Requirement / Intent
Mengikuti koreksi terbaru user dan desktop agent rule: halaman desktop tidak boleh kembali ke container lama yang hanya memakai sebagian kecil layar, primary desktop container menargetkan 80vw tanpa fixed `1400px` ceiling, dan customer-facing page/component copy tidak memakai nomor urutan dekoratif. Angka yang merupakan data nyata tetap dipertahankan.

### Implementation
- mengganti wrapper dashboard `92vw / 1400px` dengan workspace desktop 80vw yang tetap dibatasi available main-pane width;
- menjaga dashboard chrome/background selebar viewport sambil mencegah sidebar menyebabkan horizontal overflow;
- menyelaraskan Beranda, header tab, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu, Usher, dan feature gate ke aturan width yang sama;
- menghapus label dekoratif seperti `Workspace / 01`, `Acara / 02`, nomor urutan card undangan/acara, serta fallback title berbasis index;
- mempertahankan angka bermakna seperti tanggal, waktu, harga, jumlah tamu, quota, kapasitas, child order, nomor telepon, dan metrics;
- menyinkronkan requirement ke `AGENTS.md`, `prd.md`, `README.md`, dan supplemental `prd.md` sesuai permintaan user.

### Affected Files
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- dashboard components yang masih memakai legacy `92vw / 1400px` wrapper
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `AGENTS.md`
- `prd.md`
- `README.md`
- `Appendix A — Implementation History`

### Commit
- `1bd605c96295a4ff788c55367a8384c9c1e7757f` — restore wide dashboard workspace and remove decorative sequence numbering.

### Validation
- `pnpm install --frozen-lockfile`: **PASS** in one-shot GitHub Actions workspace-polish job before implementation commit.
- `pnpm build`: **PASS** in the same job against the corrected source before implementation commit.
- Targeted decorative numbering guard across `app/**/*.tsx` and `components/**/*.tsx`: **PASS** for the prohibited patterns covered by this change.
- Database migration: N/A.

---

## 2026-09-17 — Global Desktop Width Follow-up

### Requirement / Intent
Audit setelah dashboard cleanup masih menemukan page-level wrapper lama di luar tab dashboard. Sesuai desktop agent rule, wrapper aplikasi yang menjadi primary page/header workspace tidak boleh berhenti pada fixed `1400px`/`max-w-7xl` ketika layar masih memiliki ruang besar. Compact text blocks, modal, phone mockup, dan invitation renderer tetap boleh memiliki max-width khusus karena bukan primary page container.

### Implementation
- menghapus sisa `w-[min(92vw,1400px)]` dari application/page chrome dan menggantinya dengan target `80vw` + `max-w-full`;
- memperlebar homepage, Event Planner, Digital Invitation, Guestbook, Package selector, Navbar, Invitation Studio header, Transactions, Checkout, dan standalone Usher workspace;
- memperlebar page-level Admin, Owner, dan Designer workspace ke target 80vw;
- menghapus nested `max-w-6xl/7xl` yang masih membatasi Admin Operations, Usher App, dan Guest Management di dalam workspace lebar;
- mempertahankan max-width yang memang berfungsi untuk readability/modal/device/template preview.

### Commit
- `3cea5baf0b33ddc9192fb4c010ed653d15532b01` — widen remaining desktop application workspaces.

### Validation
- `pnpm install --frozen-lockfile`: **PASS** in one-shot GitHub Actions follow-up job.
- `pnpm build`: **PASS** in the same job against follow-up source.
- Legacy fixed `w-[min(92vw,1400px)]` and dashboard `1400px` wrapper guard: **PASS**.
- Database migration: N/A.

---

## 2026-09-17 — Decorative Content Numbering Follow-up

### Requirement / Intent
Final audit menemukan beberapa sequence number presentasional yang masih tersisa di page/component non-dashboard. Sesuai arahan user, nomor urutan dekoratif tidak dipakai sebagai content UI. Nomor fungsional/data nyata tetap dipertahankan.

### Implementation
- menghapus `Paket 01/02/...` pada Event Planner;
- menghapus nomor urut card pada planner services;
- menghapus nomor urut tab fitur Guestbook;
- menghapus nomor urut menu pada burger navigation;
- menghapus kolom nomor urut `#` dari RSVP table dan CSV export;
- tidak mengubah seat number, time picker, price, quota, metric, date/time, child order, phone, atau template identifier.

### Commit
- `20856c6606e31c743a1688e5374ed2c72852297e` — remove remaining decorative sequence numbering.

### Validation
- targeted decorative-number guard: **PASS**.
- `pnpm install --frozen-lockfile`: **PASS**.
- `pnpm build`: **PASS**.
- Database migration: N/A.

---

## 2026-09-17 — Landing Pintu Proportion & Event Planner Header Polish

### Requirement / Intent
Landing page Pintu perlu diseimbangkan dengan hero typography agar visual utama tetap dominan tetapi isi pintu terbaca jelas. Event Planner tidak memerlukan CTA `Client Login` khusus di hero karena halaman tersebut berfungsi sebagai public consultation/service page.

### Implementation
- sedikit memperbesar proporsi Pintu tanpa membuat carousel terlalu besar untuk right-side landing workspace;
- menaikkan ukuran title, tag, description, dan action text di Pintu aktif;
- menaikkan title pada Pintu tertutup dan menghapus slot decorative number yang sudah tidak dipakai;
- menambah vertical room Pintu carousel agar card yang lebih besar tidak terasa sempit;
- membuat heading landing lebih gradual antara desktop breakpoint agar tidak mengalahkan Pintu;
- mengarahkan CTA Event Planner landing langsung ke canonical `/event-planner`;
- menghapus button `Client Login` dari hero Event Planner beserta icon/import yang tidak lagi dipakai;
- mencatat requirement delta pada `prd.md`.

### Affected Files
- `components/Pintu/PintuCard.tsx`
- `components/Pintu/PintuSection.tsx`
- `app/page.tsx`
- `app/event-planner/page.tsx`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `aeb9ffe3246f9b526c700769d77a175e777f8159` — polish landing page Pintu proportions;
- `eaca8da1138348bc9cd7b518aa8f021c7ac2a184` — align Pintu carousel with updated card;
- `3b09f21e04edf4f4cfd7bab0e1ab1400ac7e421e` — balance landing hero typography and canonical planner link;
- `03af4bd39599fff096e386a57f9669cb9984d0ae` — remove Event Planner client login action;
- `6c7751e5e2c236696e37c8411f248c44a4bca9ca` — record supplemental requirement in `prd.md`.

### Validation
- GitHub Actions Build Validation #893: **PASS** (install dependency step and production Build step observed successful).
- TypeScript/Next production build: **PASS** through Build Validation #893.
- Database migration: N/A.

---
## 2026-09-17 — Landing Hero Copy & Burger Navigation Simplification

### Requirement / Intent
Menyeimbangkan teks di kiri Pintu agar tidak lebih dominan dari visual Pintu, membuat CTA landing lebih natural, dan menyederhanakan burger navigation agar fokus untuk berpindah halaman tanpa nomor atau penjelasan panjang.

### Implementation
- memperpendek headline, description, dan capability copy landing untuk tiga Pintu;
- mengecilkan sedikit desktop hero heading, membatasi lebar copy, dan merapikan spacing kiri Pintu;
- mengubah tombol `Lihat Detail` / `View Details` dari forced uppercase menjadi title case normal;
- menghapus sequence number, product description, helper copy, register promo, dan nested service accordion dari burger menu;
- mengganti burger menu menjadi flat page-navigation list dengan icon, label singkat, dan arrow;
- menambahkan direct Home/Beranda link;
- menyederhanakan label navigasi seperti `Masuk`, `Paket`, `Template`, dan `Bantuan`;
- tidak mengubah route login atau authentication backend.

### Affected Files
- `app/page.tsx`
- `lib/i18n.ts`
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `9eabbf6c0eac7effbc6d7bff650787184e4b0fe2` — rebalance landing hero copy layout;
- `9ff9ad399484a88f83b0d6173fee3e4866d5dce3` — simplify landing and navigation copy;
- `e1d1c239df2d4473e398da8734e8515e86c10834` — simplify burger navigation;
- `232b11fbc52c00ed76bd17f3a12f3844918f7943` — align navbar with simplified burger menu;
- `e076cb490ae705348480cea8ad3fd14f55c4ddef` — record supplemental UI requirements.

### Validation
- GitHub Actions Build Validation #900: **PASS**.
- Dependency install: **PASS** through Build Validation #900.
- TypeScript / Next production build: **PASS** through Build Validation #900.
- Database migration: N/A.

---

## 2026-09-17 — Integrated Landing Composition & Sidebar-Style Burger Navigation

### Requirement / Intent
Koreksi terbaru mengembalikan burger menu ke pola navigation button seperti sidebar Dashboard, mempertahankan parent menu `Layanan` dengan submenu, serta memastikan `Masuk` dan `Daftar` tetap tersedia. Landing 80vw juga perlu memakai ruang lebar sebagai satu komposisi hero, bukan dua blok yang terasa berjauhan.

### Implementation
- burger menu kembali memakai navigation button treatment yang konsisten dengan sidebar Dashboard;
- `Layanan` kembali menjadi collapsible parent dengan submenu Event Planner, Digital Invitation, dan Guestbook Digital;
- Beranda, Paket, Template, Bantuan, Masuk, dan Daftar tetap tersedia;
- `Daftar` menggunakan registration dialog existing dan theme state existing;
- nomor dekoratif dan description panjang per menu tetap tidak digunakan;
- landing desktop memakai grid yang lebih seimbang dan blok copy kiri lebih lebar;
- CTA `Lihat Detail` tetap normal case dan mendapat directional line halus menuju area Pintu;
- Pintu carousel digeser ke arah copy pada desktop untuk menghilangkan dead space di tengah;
- horizontal orbit diperlebar, depth ditambah, loop sedikit diperlambat, dan active Pintu diperbesar secara restrained;
- standard desktop memakai scale sedikit lebih kecil sebelum wide desktop untuk mengurangi risiko clipping;
- landing descriptions dibuat sedikit lebih lengkap tanpa kembali menjadi blok marketing panjang;
- canonical PRD public desktop width diselaraskan ke 80vw agar tidak bertentangan dengan AGENTS/README.

### Affected Files
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `app/page.tsx`
- `components/Pintu/PintuSection.tsx`
- `components/Pintu/PintuCard.tsx`
- `lib/i18n.ts`
- `prd.md`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `42b69f706a4cbaf6eb61d4adc378989b2f678242` — restore sidebar-style burger navigation;
- `32cafd1553816d04cab619e3f0d72866f4268a14` — pass theme state to burger registration;
- `bc4276227d81dfce6dd72ad617ea675a19433e83` — connect landing copy with Pintu carousel;
- `b7ef63e32922da16a0d916549c5e6d3b821deafe` — widen Pintu orbit for wide landing;
- `accabee5574cdf53f8705cdb69fb0688952b473f` — enlarge Pintu cards on wide desktop;
- `20fbec55e90a8d93a84ec1dc0afc06bd676f66f5` — enrich landing hero descriptions;
- `f856d59998d10d8727f97033d72728be11f4db3c` — refine supplemental landing and burger requirements.

### Validation
- Build: pending final GitHub Actions result at time of changelog preparation.
- TypeScript: pending final GitHub Actions result at time of changelog preparation.
- Database migration: N/A.

### Validation follow-up — Integrated Landing
- GitHub Actions Build Validation #913 on source head `4200e2683b5c94ac0eefeac1c142688f5a1cd045`: **PASS**.
- Dependency install: **PASS**.
- TypeScript / Next production build: **PASS**.
- Final commit after the validated source only updates documentation/removes the one-shot recorder; application source is unchanged.

---

## 2026-09-17 — Uniform Burger Buttons & Landing Proof Hierarchy

### Requirement / Intent
Menyeragamkan burger menu ke treatment button `Daftar`, menghapus Beranda dari panel burger, menjaga submenu `Layanan`, membedakan icon `Layanan` dan `Paket`, serta membuat landing 80vw lebih berisi melalui hierarchy copy, quote/proof, separator, dan capability row yang lebih proporsional.

### Implementation
- menghapus item Beranda dari burger menu; logo/brand navbar tetap menjadi jalur kembali ke `/`;
- seluruh main burger action memakai canonical Rose `Button` treatment seperti `Daftar`;
- mempertahankan `Layanan` sebagai collapsible parent dengan submenu Event Planner, Digital Invitation, dan Guestbook Digital;
- mengganti icon `Layanan` menjadi `Layers` sehingga tidak bentrok dengan icon `Package` pada Paket;
- mempertahankan `Masuk` dan `Daftar` di burger menu;
- memperlebar blok copy landing dan menaikkan sedikit display scale agar sisi kiri mengisi workspace 80vw secara lebih proporsional;
- menambahkan quote-style proof block di bawah CTA, garis separator halus di bawah proof, dan menurunkan capability checklist ke bawah separator;
- karena repository tidak menyediakan testimonial customer terverifikasi, proof copy saat ini adalah brand/service statement tanpa customer attribution; struktur siap diganti dengan testimonial nyata ketika sumber diberikan;
- menyinkronkan rule terbaru ke `prd.md`, `AGENTS.md`, `README.md`, dan `prd.md`.

### Affected Files
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `app/page.tsx`
- `lib/i18n.ts`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `5efd72a37fe8efe60c5b0e7eb251b202edc042ad` — refine burger menu button hierarchy;
- `fb131c7c64ffed5b65c9c9960a20c861cb90cd8e` — add landing proof copy;
- `38474f6ae2f89828a2ad72685b3d4406b169bd84` — refine landing editorial composition.

### Validation
- GitHub Actions Build Validation #917 on source head `38474f6ae2f89828a2ad72685b3d4406b169bd84`: **PASS**.
- Dependency install: **PASS**.
- TypeScript / Next production build: **PASS**.
- Database migration: N/A.

---

## 2026-09-17 — Indonesian Burger Labels & Neutral Auth Surfaces

### Requirement / Intent
Mengembalikan burger menu ke treatment putih dengan teks hitam, melokalkan submenu layanan ke Bahasa Indonesia, menghilangkan overlap action `Masuk` dengan tombol close pada dialog Daftar, dan menyamakan visual/copy halaman Masuk dengan aturan produk general-event.

### Implementation
- label locale Indonesia di burger diubah menjadi `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`;
- seluruh button burger memakai background putih, teks hitam, border tipis, dan Rose hanya sebagai accent/ring;
- `Layanan` tetap memiliki submenu dan icon `Layers`, sementara Paket memakai `Package`;
- dialog Daftar memakai surface putih/teks hitam, termasuk Google, password visibility, dan submit controls;
- action `Masuk` pada header dialog Daftar dihapus agar tidak menutupi tombol close `X`; switch Masuk tetap tersedia di bawah form;
- copy vendor pada Daftar digeneralisasi dari konteks wedding menjadi konteks acara;
- halaman `/login` disederhanakan menjadi general-event workspace copy dan memakai visual putih/teks hitam yang konsisten dengan Daftar/burger;
- theme prop lama pada burger/register dibuang karena auth surface sekarang sengaja netral di kedua theme;
- requirement aktif disinkronkan ke `prd.md`, `AGENTS.md`, dan `README.md`.

### Affected Files
- `lib/i18n.ts`
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Navbar/RegisterDialog.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `app/login/page.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `Appendix A — Implementation History`

### Commits
- `cc0a8498c5b345a5b34773b56f57a2164ca463c8` — localize Indonesian burger service labels;
- `704b9fe59825e87c5935e76d7267648940f7255a` — restore neutral burger button styling;
- `0a5b7b1bffa8361b6f7019b546af052212d5d70e` — fix registration dialog actions and neutral styling;
- `4598cc30a408153839ea8d7cddf3e6ef12c1063a` — remove obsolete burger theme prop;
- `2d9c2711778be9fff1aab2fc6aff54f45035a599` — remove obsolete navbar theme plumbing;
- `0f3a6476e46fdd00cec9746a7b7e8b91a4806e80` — align login page with neutral auth styling.

### Validation
- GitHub Actions Build Validation #927 on source head `0f3a6476e46fdd00cec9746a7b7e8b91a4806e80`: pending observation at changelog script creation time.
- Database migration: N/A.

---

## 2026-09-17 — RSVP Protection & Guest Segmentation Foundation

### Requirement / Intent
Mulai mengimplementasikan backlog prioritas dari PRD: proteksi public RSVP dari spam dan fondasi kategori/label tamu yang dapat dipakai lintas Guest List, Seating, dan distribusi undangan.

### Implementation
- menambahkan rate limiter public RSVP dengan baseline 5 request/menit per kombinasi slug + client IP;
- response over-limit memakai HTTP `429`, `Retry-After`, dan rate-limit headers;
- limiter disimpan pada process-global memory sebagai baseline aman tanpa dependency baru; untuk horizontal/multi-instance deployment tetap diarahkan ke Redis-compatible store sesuai PRD;
- menambahkan `Guest.category` nullable dan `Guest.tags` string array dengan index event + category;
- menambahkan migration PostgreSQL untuk category/tags;
- `/api/guests` sekarang mengembalikan category/tags dan menerima keduanya saat membuat guest manual;
- menambahkan `PATCH /api/guests/[id]/labels` dengan auth + ownership check untuk mengubah category/tags tanpa mencampur logic seating;
- tags dinormalisasi, deduplicated, dan dibatasi maksimal 20 label per guest.

### Affected Files
- `lib/public-rate-limit.ts`
- `app/api/invite/[slug]/rsvp/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260917081500_add_guest_category_tags/migration.sql`
- `app/api/guests/route.ts`
- `app/api/guests/[id]/labels/route.ts`
- `Appendix A — Implementation History`

### Commits
- `2e8ed2546667a50d41e3699a25a2f8d9a3806ec9` — add public RSVP rate limiter helper;
- `3c1b962c7ad347472387cbe83821b461049d9384` — enforce rate limit on public RSVP.

### Validation
- Build/type validation pending final source HEAD.
- Database migration created; production requires `pnpm db:deploy` before category/tag fields are used against production DB.

### Validation follow-up — RSVP Protection & Guest Segmentation
- GitHub Actions Build Validation #937 on source head `30ce990de258a4b5556efe90387be11c35106dca`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production compile + TypeScript: **PASS**.
- Migration `20260917081500_add_guest_category_tags` is committed but still requires `pnpm db:deploy` on the target VPS/production database before category/tag persistence is used there.

---

## 2026-09-17 — Rangkaian Acara Delete & Published Lock

### Requirement / Intent
Rangkaian Acara boleh diedit dan dihapus sebelum Publish. Karena Publish hanya dapat berhasil setelah entitlement Digital Invitation aktif, event yang sudah terbit harus menjadi record customer yang terkunci dan tidak boleh diedit, dihapus, atau di-unpublish melalui request manual.

### Implementation
- menambahkan `DELETE /api/invitations?id=<invitationId>` dengan ownership check server-side;
- delete hanya diizinkan ketika `isPublished = false`;
- `PUT /api/invitations` menolak event-detail mutation setelah publish;
- published event juga tidak dapat di-unpublish (`isPublished=false`) untuk menghindari bypass lock;
- dashboard Rangkaian Acara menampilkan `Hapus` hanya untuk event yang belum publish;
- `Edit` dan `Hapus` tidak lagi tersedia pada event berstatus `Terbit`;
- delete meminta konfirmasi karena record event beserta data relasi yang cascade akan ikut dihapus;
- Invitation Studio tidak di-lock secara global oleh perubahan ini; requirement ini khusus detail/lifecycle Rangkaian Acara.

### Affected Files
- `app/api/invitations/route.ts`
- `components/Dashboard/EventPanel.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `Appendix A — Implementation History`

### Validation
- GitHub Actions Build Validation **#942** on validation head `262484247cc2993a88b8a440fe49a2ec4d6b2dfe`: **PASS**.
- Install dependencies: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Validated application source includes implementation commit `3c9971ad74bf78b1818dbc64b7556d6a88569b18`; the validation head only adds a temporary trigger marker.
- Database migration: N/A.

---

## 2026-09-17 — Dashboard Visual Hierarchy & Header Realignment

### Summary
Dashboard customer workspace dirombak mengikuti arah visual yang disetujui user tanpa mengubah brand/product rules: neutral white/near-black surfaces, Rose `#C07A84` sebagai accent, Cinzel/Fauna One/DM Mono tetap dipakai, dan tidak ada decorative hero image atau fake activity/testimonial.

### Implemented
- header dashboard menjadi full-width chrome dengan kolom brand sejajar tepat di atas sidebar;
- workspace header memakai sisa pane dan tetap mengikuti target 80vw tanpa overflow sidebar;
- dynamic page title hanya tampil di header, sehingga title strip kedua di bawah header dihapus;
- sidebar dikembalikan ke neutral surface dan Rose dipakai pada active/selected emphasis;
- Beranda memakai hierarchy baru: welcome block, metric cards ber-icon, tabel acara terbaru, quick access, dan status workspace;
- tabel Beranda memakai data acara asli dari PostgreSQL/API, bukan mock data;
- tidak ada gambar dekoratif baru, perubahan logo/brand, atau perubahan product flow/entitlement;
- global table CSS yang memaksa semua tabel menjadi `max-content`/minimum 940px dihapus agar overview table dan workspace tables dapat mengatur lebar sesuai konteks.

### Affected files
- `app/dashboard/page.tsx`;
- `app/dashboard/layout.tsx`;
- `Appendix A — Implementation History`.

### Validation
- Build Validation #946: **FAILED** pada TypeScript karena helper `Stat` ikut terhapus saat overview diganti; compile aplikasi sudah lolos sebelum type-check.
- Commit `a88f1b474f3cf6e384d4cf315e1cceea00f4522b` memulihkan helper `Stat`.
- Build Validation #949 pada state source setelah fix: **PASS**. Dependency install, Prisma Client generation, Next.js production compile, dan TypeScript semuanya berhasil.

### Data-oriented dashboard follow-up
Atas arahan user, Beranda dashboard diperkuat dengan visualisasi data nyata tanpa menambah library chart atau mock dataset:
- donut chart cakupan RSVP = jumlah guest dengan status RSVP non-PENDING dibanding total guest;
- breakdown sudah/belum merespons dan total tamu;
- progress bar publikasi acara berdasarkan event `isPublished`;
- total kunjungan undangan tetap diambil dari agregasi `viewCount`;
- seluruh visual tetap neutral white/black + Rose brand dan tidak mengubah product flow.

Validation: Build Validation #954 pada dashboard analytics state **PASS** — dependency install, Prisma Client generation, Next.js production compile, dan TypeScript berhasil.

---

## 2026-09-17 — Dashboard Brand Lockup Restore

### Summary
Dashboard redesign sempat menyederhanakan brand lockup menjadi teks `DC Organizer` saja. Perubahan itu dikoreksi agar header dashboard kembali mengikuti canonical public navbar brand treatment tanpa mengubah layout/data-oriented dashboard yang baru.

### Implementation
- desktop dashboard header menggunakan kembali font token brand `--font-dc-heading`;
- tagline canonical `Your best consultant for wedding & event` dipulihkan;
- mobile header memakai brand treatment yang sama dalam skala responsif;
- tidak ada perubahan pada brand color, logo wording, public navbar, product flow, database, atau entitlement.

### Affected file
- `app/dashboard/page.tsx`

### Validation
Workflow **Restore Dashboard Brand** menjalankan dependency install, Prisma Client generation, dan Next.js production build + TypeScript sebelum commit final dibuat. Hasil workflow wajib PASS.

---

## 2026-09-17 — Protected Brand Contract & Unified Dashboard Visual System

### Requirement / Intent
User menegaskan bahwa brand/font tidak boleh berubah antar iterasi, tagline marketing tidak diperlukan di Dashboard, dan seluruh customer Dashboard beserta nested component harus memakai visual language yang sama seperti Beranda agar tidak terlihat belang.

### Implementation
- menambahkan `components/Brand/BrandWordmark.tsx` sebagai canonical DC Organizer wordmark; font dikunci ke `--font-dc-heading` / Cinzel;
- public Navbar menggunakan shared wordmark dan tetap boleh menampilkan tagline existing;
- Dashboard desktop/mobile menggunakan shared wordmark **tanpa tagline**;
- menambahkan `components/Dashboard/DashboardPrimitives.tsx` sebagai reusable surface/metric/notice/section foundation;
- local Dashboard card primitive sekarang mendelegasikan surface ke shared dashboard primitive;
- Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Seating/Manajemen Tamu, Event Scope, dan Feature Gate diselaraskan ke neutral white/near-black surface + subtle border/shadow + Rose accent seperti Beranda;
- Rangkaian Acara mendapat grouped toolbar, list surface, dan editor surface agar tidak lagi terasa seperti halaman berbeda;
- stale global Dashboard width cap `1400px` dihapus dan canonical `80vw`/available-pane behavior dipulihkan;
- fixed Dashboard header/sidebar geometry disamakan pada tinggi 72px;
- `prd.md`, `AGENTS.md`, dan `README.md` sekarang memiliki protected brand contract, dashboard no-tagline rule, dan visual-consistency rule yang eksplisit.

### Affected Files
- `components/Brand/BrandWordmark.tsx`
- `components/Dashboard/DashboardPrimitives.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/layout.tsx`
- `app/globals.css`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `Appendix A — Implementation History`

### Validation
- One-shot workflow **Unify Dashboard Brand And UI**: **PASS**.
- `pnpm install --frozen-lockfile`: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.

---

## 2026-09-17 — Dashboard Visual Consistency Phase 2

### Requirement / Intent
Melanjutkan redesign seluruh customer dashboard agar semua tab/component mengikuti visual language Beranda, mengunci typography/brand token agar tidak berubah antar-page, dan mencatat delta pekerjaan ke `prd.md` atas permintaan eksplisit user.

### Implementation
- memperluas `DashboardPrimitives.tsx` menjadi shared page/surface/metric/notice/section-header/status/empty-state system;
- menormalkan font dashboard ke canonical `--font-dc-heading`, `--font-dc-sans`, dan `--font-dc-mono`;
- merapikan surface hierarchy di Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Event Scope, Feature Gate, Seating, dan reusable dashboard component;
- mengubah daftar Rangkaian Acara menjadi data table agar lebih mudah dipindai;
- menghapus action `Tarik publik` dari Undangan yang sudah published dan menggantinya dengan status locked, konsisten dengan immutable published-event rule;
- membuat `prd.md` kembali hanya karena user meminta secara eksplisit, dengan status supplemental non-canonical;
- menyinkronkan governance exception ke `prd.md`, `AGENTS.md`, dan `README.md`.

### Affected Files
- `app/dashboard/page.tsx`
- `components/Dashboard/DashboardPrimitives.tsx`
- `components/Dashboard/DashboardAccessNotice.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `Appendix A — Implementation History`

### Validation
- Build workflow: Dashboard Consistency Phase 2 #2 (run 35213218973): PASS
- Prisma Client generation: Dashboard Consistency Phase 2 #2 (run 35213218973): PASS
- TypeScript / Next production build: Dashboard Consistency Phase 2 #2 (run 35213218973): PASS
- Database migration: N/A.

---

## 2026-09-17 — Invitation Studio Template Sections & Live Canvas

### Requirement / Intent
Mempermudah update template undangan dengan komponen section reusable, memberi kontrol on/off untuk RSVP, Wishes, dan Gift/E-Angpao, serta memperbaiki masalah pemilihan template yang sebelumnya tidak mengubah komposisi canvas Studio secara nyata. User juga meminta satu template test yang mendekati struktur long-form invitation pada referensi visual.

### Implementation
- menambahkan `lib/templates/sections.ts` untuk shared visibility state `rsvp`, `wishes`, dan `gift`;
- visibility section disimpan backward-compatible pada `Invitation.templateKey` melalui segment `sections=...`, sehingga tidak memerlukan migration schema;
- menambahkan template test `Botanical Ivory` pada catalog;
- membuat `InvitationDesignerV2` dengan panel Template, Section, Warna, Font, Isi, Foto, dan Musik;
- menambahkan toggle on/off RSVP, Wishes, dan Gift/E-Angpao yang langsung memengaruhi canvas;
- undo/redo design ikut merekam perubahan section;
- template selection sekarang memengaruhi renderer canvas, bukan hanya selected card/name;
- `Botanical Ivory` memakai long-form mobile composition dengan hero/identity, waktu & lokasi, optional RSVP, optional Wishes, optional Gift, dan footer;
- template lain memakai adaptive canvas sehingga variasi utama mulai terlihat ketika template diganti;
- `InvitationEditorPage` sekarang memakai Studio renderer baru;
- requirement canonical disinkronkan ke `prd.md` dan delta user-requested dicatat di `prd.md`.

### Affected Files
- `lib/templates/sections.ts`
- `lib/templates/catalog.ts`
- `components/InvitationStudio/InvitationDesignerV2.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `prd.md`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `f78956b117a8654860ce91cdf1c5195160b22326` — add reusable invitation section settings;
- `111a1364d78aa0f7ebadb52760de7119f9c5a501` — add Botanical Ivory invitation template;
- `f6981ad7103f94a596ee2672d290d370d46507f3` — add reusable studio template system with section toggles;
- `bc26914061be20c826fd0f8819d329cc6bf2e773` — use section-aware invitation studio canvas;
- `f82798367d3c0f833179ee1ad44b27c3aa3ca374` — document supplemental Studio section delta;
- `ef743e6dcca5d6fd5f52705f5875a23a89174e53` — define reusable Studio sections and live template canvas in master PRD.

### Validation
- GitHub Actions **Build Validation #970** on application source head `bc26914061be20c826fd0f8819d329cc6bf2e773`: **PASS**.
- Previous Build Validation #969 for the main `InvitationDesignerV2` implementation: **PASS**.
- Database migration: N/A.
- Final public-template renderer parity for section visibility remains follow-up work; Studio/design persistence is implemented. Wishes persistence as guest data is not introduced in this change and no mock guest messages are used.

---

## 2026-09-17 — Invitation Studio Distinct Template Canvas Follow-up

### Requirement / Intent
Menjawab koreksi user bahwa pergantian template di Studio masih terasa tidak mengubah canvas. Template harus memiliki komposisi visual yang benar-benar berbeda, section reusable harus tetap dapat di-toggle, dan template test long-form mengikuti struktur referensi visual user tanpa menyalin aset pihak lain.

### Implementation
- menambahkan `InvitationDesignerV3` dan menjadikannya renderer aktif pada `InvitationEditorPage`;
- membuat enam layout canvas yang berbeda secara struktur: Botanical, Editorial, Maroon, Garden, Midnight, dan Classic;
- pemilihan template sekarang menerapkan starter palette serta font pairing template, namun user tetap dapat mengubah Warna/Font setelahnya;
- `Botanical Ivory` tetap menjadi test template long-form dengan hero, identitas, parent line opsional, waktu/lokasi, RSVP, Wishes, Gift/E-Angpao, dan footer;
- toggle RSVP, Wishes, dan Gift/E-Angpao tetap reusable, live di canvas, masuk undo/redo, dan tersimpan event-scoped pada `Invitation.templateKey`;
- menambahkan palette/font preset yang diperlukan V3 pada `lib/templates/design.ts`;
- generic public invitation sekarang membaca section visibility tersimpan dan hanya merender RSVP/Gift ketika section aktif; Gift juga mensyaratkan data rekening nyata;
- Wishes tetap hanya layout preview di Studio karena persistence pesan tamu belum tersedia; tidak ada mock guest message production yang ditambahkan;
- delta user-requested dicatat di `prd.md`; requirement canonical di `prd.md` sudah mencakup behavior ini sehingga tidak perlu duplikasi requirement baru.

### Affected Files
- `components/InvitationStudio/InvitationDesignerV3.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `lib/templates/design.ts`
- `components/PublicInvitation/PublicInvitation.tsx`
- `prd.md`
- `Appendix A — Implementation History`

### Commits
- `c981c3f5d51765993bed6617b2e0a1a11883a15a` — improve invitation studio live template canvas;
- `58232fd3891a471cabc309fb9290f10bded5a3c6` — activate improved invitation studio renderer;
- `87df4ef49aa2cc9063905128cbdd3e633ce7d284` — add template-specific invitation presets;
- `239135d46df57181b834f50a6631c72ed462d3af` — respect saved invitation section visibility;
- `7301f5cf9bbb63cf79ef1c4f4e7b0f1f3c91f93d` — document invitation studio canvas follow-up.

### Validation
- Build Validation #975: **FAIL** pada TypeScript karena preset V3 awal merujuk palette/font key yang belum tersedia; failure ditelusuri dan bukan diabaikan.
- Commit `87df4ef49aa2cc9063905128cbdd3e633ce7d284` menambahkan preset keys yang diperlukan.
- Build Validation #976 pada head `87df4ef49aa2cc9063905128cbdd3e633ce7d284`: **PASS** untuk dependency install, Prisma Client generation, Next.js production compile, dan TypeScript.
- Perubahan generic public renderer dan dokumentasi setelah #976 menunggu validation run terbaru; belum dinyatakan PASS pada entry ini.
- Database migration: N/A.

---

## 2026-09-17 — Wedding Family Wording & Open-ended End Time

### Requirement / Intent
Rangkaian Acara perlu menampilkan wording keluarga wedding yang natural berdasarkan urutan anak, serta menyediakan pilihan eksplisit untuk undangan yang tidak memiliki jam selesai tetap namun tetap ingin menampilkan `- end`.

### Implementation
- `groomChildOrder` / `brideChildOrder` dipakai oleh Studio/public renderer untuk membentuk `Putra pertama ...` / `Putri pertama ...`;
- Rangkaian Acara menampilkan preview family line langsung di form wedding;
- opsi `Tampilkan “- end” di undangan` menyimpan sentinel internal `END` di `receptionTime` dan menonaktifkan picker waktu selesai;
- API membatasi `END` hanya untuk waktu selesai; waktu mulai tetap wajib format 24 jam `HH:mm`;
- Invitation Studio V3, generic public invitation, dan Figma Classic menerapkan family wording dan `- end` secara konsisten;
- requirement aktif disinkronkan ke `prd.md`, overview ke `README.md`, dan delta ke `prd.md`.

### Affected Files
- `lib/events/parents.ts`
- `components/Dashboard/EventPanel.tsx`
- `app/api/invitations/route.ts`
- `components/InvitationStudio/InvitationDesignerV3.tsx`
- `components/PublicInvitation/PublicInvitation.tsx`
- `components/PublicInvitation/FigmaClassicTemplate.tsx`
- `prd.md`
- `README.md`
- `Appendix A — Implementation History`

### Commit
- `0068cd7c40a8e06ac076bec20dff10026f1a5421` — add open-ended invitation time and family wording.

### Validation
- `pnpm install --frozen-lockfile`: **PASS**.
- Prisma Client generation (`pnpm db:generate`): **PASS**.
- TypeScript / Next production build (`pnpm build`): **PASS**.
- Database migration: **N/A**.
- Production deployment: not performed by this implementation workflow.

---

## 2026-09-18 — RSVP Submit Repair (Incremental Delivery)

### Implementation / Rationale
- Added explicit `type="submit"` to the public RSVP confirmation button. The shared Button defaults to `button`, so clicking the previous control did not submit the form.
- Added an accessible attendance selector name and a status announcement for submission feedback.
- Updated downloaded ticket branding/filename to DC Organizer and calendar/ticket fallback titles to general-event wording (`Acara`).
- Scope is limited to the existing RSVP UI; event-scoped API authorization, persistence, and QR generation are unchanged.

### Affected Files / Commit
- `components/InvitationStudio/RsvpForm.tsx`
- `prd.md` (this appendix, following the consolidated governance in section 21; `prd1.md` is absent)
- Commit: `fix: restore public RSVP form submission` (same change set as this entry).

### Validation
- Prisma Client generation: PASS.
- TypeScript (`tsc --noEmit`): PASS.
- ESLint on the changed component: PASS.
- React server-render regression check: PASS; rendered confirmation button is `type="submit"` and attendance selector has an accessible name.
- `git diff --check`: PASS.
- Production build, live database RSVP submission, and deployment: not run; no claim of end-to-end validation.

### Remaining work
- Continue the operational backlog in section 18 in separate small increments; no claim that offline Usher, WhatsApp provider integration, team permissions, or complete template parity is delivered here.


---

## 2026-09-18 — Seating Roster Category / Tag Filters

### Implementation / Rationale
- Continued section 9.4 in a small scope: the unassigned Seating roster now supports combined category and tag filters using persisted guest labels from the existing API.
- Options come from the selected event's actual guests, including custom labels. Added visible labels on roster cards, result counts, reset, and distinct filtered/empty states.
- Kept the complete guest list for canvas occupancy, totals, drag targets, and swap/collision behavior; filtering the roster must never make an occupied seat appear available.
- Existing event-keyed SeatingChart remount resets filter state when the selected event changes.
- Legacy guests without category/tags remain visible when filters are cleared.

### Affected Files / Commit
- `components/Dashboard/SeatingChart.tsx`
- `app/dashboard/page.tsx` (guest label typing)
- `lib/guests/filters.ts`
- `tests/guest-filters.test.mjs`
- `prd.md` (this appendix)
- Commit: `feat: filter seating roster by guest category and tag` (same change set).

### Validation
- TypeScript `tsc --noEmit`: PASS.
- ESLint for SeatingChart, filter helper, and test: PASS.
- `node --test tests/guest-filters.test.mjs`: PASS, 3 tests covering legacy data, combined/exact matching, custom labels, reset, and preservation of source seating records.
- `git diff --check`: PASS.
- Production build, browser visual/drag interaction, live database integration, and deployment: not run.
- No schema change; existing category/tag migration must already be applied to the target database.

### Remaining Scope
- Category/tag editing and bulk assignment, Guest List and distribution filtering remain separate increments.
- This does not claim completion of all section 9.4 acceptance criteria.
---

## 2026-09-18 — Dashboard Visual Consistency Phase 3, Pre-Publish Access & Bilingual Theme

### Requirement / Intent
Beranda tetap menjadi reference visual untuk seluruh customer Dashboard. Koreksi product access: RSVP, Manajemen Tamu, dan workspace persiapan invitation tidak boleh dipaywall hanya karena Undangan Digital belum dibayar/publish; payment Digital Invitation hanya menjadi gate pada Publish. Seluruh Dashboard juga harus mendukung Light/Dark serta Bahasa Indonesia/English, dengan Bahasa Indonesia sebagai default.

### Implementation
- Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, dan Usher diselaraskan ke shared Dashboard primitives;
- RSVP dan Manajemen Tamu tidak lagi menampilkan activation gate ketika event belum berbayar;
- Personal Invitation tetap dapat dibuka/dipersiapkan sebelum Publish;
- payment Digital Invitation tetap ditegakkan pada aksi Publish;
- WA Blast dan Usher tetap mengikuti entitlement produk terpisah;
- Dashboard header menyediakan shared theme toggle serta ID/EN language toggle, termasuk akses mobile;
- copy operasional Dashboard, form, table, status, empty state, dan feedback mengikuti locale aktif tanpa menerjemahkan data milik user;
- semantic theme tokens existing dipakai untuk Light/Dark agar tidak membuat page-specific dark palette;
- `AGENTS.md` dan `README.md` disinkronkan dengan governance satu `prd.md`.

### Validation
- GitHub Actions Build Validation #1014 pada application source head `20e1d677044d32c7e7cc70cc57934cc37a5e4a46`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit setelah validation ini hanya memperbarui dokumentasi hasil validasi; application source yang divalidasi tidak berubah.
---

## 2026-09-18 — Dashboard Typography & Rose Sidebar Contrast

### Requirement / Intent
Owner meminta Dashboard memanfaatkan ruang yang tersedia dengan typography lebih besar, memperbaiki icon/control kanan atas yang tidak terbaca pada Dark Mode, dan mengubah sidebar menjadi satu bidang Rose yang lebih rapi.

### Implementation
- shared Dashboard metric, section header, notice, compact stat, status, dan empty-state typography diperbesar;
- global Dashboard copy floor dinaikkan untuk body, table, form, dan legacy 8–11px utility copy;
- sidebar Light Mode memakai Rose background + white text/icon;
- sidebar Dark Mode memakai Rose background + near-black text/icon;
- active/hover sidebar memakai neutral translucent overlay agar tidak terlihat terlalu banyak variasi pink;
- profile avatar Dark Mode memakai Rose + near-black initials dan header theme/language controls memakai high-contrast neutral foreground.

### Validation
- GitHub Actions Build Validation #1018 pada application source head `84e3ff5fa482feaab2f88c974c2692d8a56887f6`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit setelah validation ini hanya memperbarui dokumentasi hasil validasi; application source yang divalidasi tidak berubah.
---

## 2026-09-18 — Dashboard Sidebar Neutral Shell Revision

### Requirement / Intent
Owner menolak full-Rose sidebar dan meminta sidebar kembali menyatu dengan canvas Dashboard. Light Mode harus terasa putih/netral, sedangkan Dark Mode mengikuti body near-black. Warna Rose dipusatkan pada navigation button state agar lebih rapi dan mudah dibaca.

### Canonical visual behavior
- Light Mode sidebar: background putih; default label/icon near-black; hover/active memakai Rose dengan teks/icon putih;
- Dark Mode sidebar: background sama dengan body near-black; default navigation transparent dengan teks/icon putih; hover/active memakai Rose dengan teks/icon putih;
- container grup Acara tetap transparan/netral sehingga tidak terlihat sebagai card tambahan;
- font sidebar dinaikkan lagi: main navigation sekitar 16px, nested navigation sekitar 15px, section metadata sekitar 11px;
- aturan sebelumnya yang menjadikan seluruh sidebar sebagai Rose rail dinyatakan superseded.

### Implementation area
- `app/dashboard/page.tsx`;
- `app/globals.css`;
- `AGENTS.md`;
- `README.md`;
- `prd.md`;
- `prd-tambahan.md` sebagai supplemental delta log atas permintaan eksplisit owner.

### Validation
- GitHub Actions Build Validation #1025 pada application source head `bc26869ebfa8454d294f412479445f25d949224b`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit setelah validation ini hanya memperbarui dokumentasi hasil validasi; application source yang divalidasi tidak berubah.

### Dark header utility follow-up
- ID/EN Dark Mode tidak memakai opacity/fill Rose saat idle; selected locale memakai neutral white emphasis dan Rose hanya saat hover.
- Account trigger, avatar, serta dropdown items Dark Mode memakai near-black background dengan white copy saat idle dan Rose + white copy saat hover.
- GitHub Actions Build Validation #1030 pada application source head `0af685723e2178d52c735a8890026d5ce87d90ff`: **PASS** untuk dependency install, Prisma Client generation, Next.js production build, dan TypeScript.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.


---

## 2026-09-18 — Unified Dashboard Header Controls

### Requirement / Intent
Owner meminta ID/EN, burger, theme toggle, dan tombol user berhenti memakai visual treatment yang berbeda-beda. Keempat control harus terlihat sebagai satu keluarga pada Light dan Dark Mode.

### Implementation
- menambahkan shared class `dc-dashboard-header-control` untuk burger, theme toggle, language option, dan account trigger;
- Light Mode memakai white/neutral idle surface, restrained Rose border/foreground, lalu Rose + white saat hover;
- Dark Mode memakai near-black idle surface, white foreground, lalu Rose + white saat hover;
- locale aktif memakai border/underline emphasis tanpa filled state khusus;
- avatar account mengikuti palette trigger agar tidak terlihat seperti button system kedua;
- behavior ThemeToggle/LanguageToggle di luar Dashboard dipertahankan agar public navbar tidak ikut berubah.

### Affected Files
- `app/dashboard/page.tsx`
- `app/globals.css`
- `components/Theme/ThemeContext.tsx`
- `components/I18n/LanguageToggle.tsx`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `prd-tambahan.md`

### Validation
- GitHub Actions Build Validation #1033 pada application source head `872b7a4d4e493ab279ae05bfea129bc1ef5d51dd`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit setelah validation ini hanya memperbarui dokumentasi hasil validasi; application source yang divalidasi tidak berubah.


---

## 2026-09-18 — Dashboard Header Follows Landing Navbar

### Requirement / Intent
Owner meminta header Dashboard berhenti memiliki style control sendiri dan langsung mengikuti style navbar landing yang sudah disetujui.

### Implementation
- menghapus Dashboard-only override `dc-dashboard-header-control` dari global CSS;
- `ThemeToggle` kembali memakai treatment shared/public navbar tanpa Dashboard hook;
- `LanguageToggle` kembali ke styling navbar landing existing, termasuk behavior Light/Dark yang sudah berjalan di landing;
- burger Dashboard memakai class/treatment yang sama dengan burger landing;
- account trigger memakai restrained transparent + Rose-border navbar treatment, dengan avatar tetap subtle dan tidak menjadi visual button system kedua;
- navbar landing sendiri tidak diubah.

### Affected Files
- `app/dashboard/page.tsx`
- `app/globals.css`
- `components/Theme/ThemeContext.tsx`
- `components/I18n/LanguageToggle.tsx`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `prd-tambahan.md`

### Validation
- GitHub Actions Build Validation #1036 pada application source head `ade7de7accb38ae4ab55d83df7662109bafca6ff`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit setelah validation ini hanya memperbarui dokumentasi hasil validasi; application source yang divalidasi tidak berubah.


---

## 2026-09-18 — Beranda Visual Language Across Dashboard Workspaces

### Implementation / Rationale
- Extracted Beranda's neutral introduction card with its Rose left accent into `DashboardPageHeader`; applied it to Beranda, Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu, and Usher workspace headings.
- Unified status badges, metric presentation, access notices, and operational metadata sizes. Shared primitives merge Tailwind classes correctly so caller grid sizing overrides take effect.
- Standardized page gutters: 80vw capped by the available desktop pane, with 16px mobile gutters. Personal Invitation/WA and Seating columns stack before they compress the main content.
- Removed obsolete structural CSS overrides that changed card borders/fills based on incidental class names. Removed header color overrides that competed with shared landing controls.
- Excluded checkbox/radio/range/color/hidden inputs from text-field styling; native selection controls keep their geometry and Rose focus state.
- Updated Usher's old hot-pink/light-only workspace to semantic neutral/Rose tokens, canonical wordmark, Button, dashboard headings/metrics/status badges, theme control, and readable dark semantic feedback. QR quiet zones and camera preview remain purpose-specific.
- Raised Studio control typography and made its toolbar wrap on small screens; invitation artwork remains template-driven. Personal preview chrome uses canonical typography tokens.
- No API, entitlement, database, event data, or protected background changes.

### Affected Areas / Commit
- `app/dashboard/`, `app/globals.css`, `components/Dashboard/`, `components/UsherApp/UsherApp.tsx`, active Invitation Studio controls, `README.md`, `prd.md`.
- Commit: `style: align dashboard workspaces with Beranda` (same change set).

### Validation
- Prisma generation: PASS using a local placeholder connection string; no database mutation.
- TypeScript: PASS.
- Next.js production build (`next build --webpack`): PASS.
- Lint comparison against original HEAD: same 11 pre-existing errors (10 set-state-in-effect, one no-explicit-any); full lint is not clean.
- Shared-component server rendering and Tailwind CSS compilation: PASS. Browser visual checks could not run: Chromium is absent and its download timed out. Production deployment and database/QR scanner end-to-end testing were not performed.
- GitHub push was blocked by automatic approval review; changes are committed locally.


---

## 2026-09-18 — Complete Beranda Panel Hierarchy & Event Navigation Follow-up

### Requirement / Implementation
- Owner requested the full dashboard content hierarchy to follow Beranda, beyond page introductions. WA Blast moves into Acara/Events without an Add-on navigation label; active requirement updated in section 6.
- Added `DashboardPanel`: the same neutral rounded surface, separated header, roomy content, and restrained border used by Beranda. Adopted across invitation lists, Personal Invitation forms/list, WhatsApp forms/queue, RSVP controls/table, and all Seating panels.
- Undangan now uses a scannable event table with venue, state, actual visits, Studio/Publish/public actions; keeps configured/design/payment/published behavior intact.
- WhatsApp recipients use matching table rows; forms, quota feedback and empty states follow the common panel hierarchy.
- Personal Invitation, RSVP and Guest Management selectors are inside their introductions; seating metrics are no longer nested inside an extra enclosing card.
- Usher overview includes real guest check-in rows and a direct link to the existing scanner workspace.
- Unavailable Usher capability is shown as a readable introduction and access card instead of blurred nested dashboard content. Access remains controlled by the existing entitlement and server APIs.
- WA Blast navigation, active parent state, page heading, and quick access all use the short label. Price, separate quota purchase and API identifiers are unchanged.

### Affected Files / Commit
- `app/dashboard/page.tsx`, `components/Dashboard/{DashboardPrimitives,EventScopePicker,FeatureGate,InvitationWorkspacePanel,PersonalInvitationPanel,WhatsAppBlastPanel,RsvpAnalyticsPanel,SeatingChart,useDashboardI18n}.tsx`, `README.md`, `prd.md`.
- Commit: `style: complete Beranda panel hierarchy and group WA Blast under events` (same change set).

### Validation
- TypeScript: PASS.
- Next.js production build (`next build --webpack`): PASS.
- Lint comparison of dashboard files: same 10 pre-existing errors as the base (9 set-state-in-effect and one no-explicit-any). Full lint is not clean.
- `git diff --check`: PASS. Browser verification unavailable (Chromium download timed out in this environment). No database migration or production deployment performed.


---

## 2026-09-18 — Dashboard Microcopy Cleanup & Anti-Repetition Rule

### Requirement / Intent
Owner meminta Dashboard berhenti mengulang istilah seperti `workspace`, `acara`, dan `undangan` pada eyebrow, title, description, selector, metric, card, dan action ketika konteks halaman sudah jelas. Tujuannya menghilangkan kesan AI-generated/AI-slop tanpa mengurangi kejelasan fungsi.

### Canonical behavior
- microcopy Dashboard singkat, natural, dan context-aware;
- generic `Workspace` tidak digunakan sebagai filler label;
- context eyebrow memakai fungsi nyata seperti Persiapan, Publikasi, Distribusi, Kehadiran, Tamu, atau Hari-H;
- copy redundan dihapus, bukan sekadar diganti sinonim;
- adjacent duplicate context/metric dihindari;
- istilah produk tetap digunakan bila diperlukan untuk scope, state, atau next action;
- aturan ini berlaku sebagai convention untuk perubahan kecil berikutnya dan dicatat di `AGENTS.md`.

### Implementation
- membersihkan header/sidebar Beranda dan menghapus header card jumlah acara yang menduplikasi metric grid;
- mengganti label umum/repetitif pada Rangkaian Acara, Undangan Digital, Personal Invitation, WA Blast, RSVP, Manajemen Tamu, Feature Gate, dan Usher;
- memperpendek deskripsi operasional yang sebelumnya mengulang `acara`/`workspace`;
- memperbaiki beberapa label menjadi lebih context-aware seperti `Total`, `Terbaru`, `Lihat semua`, `Detail`, `Daftar`, dan `Undangan aktif`;
- menambah terjemahan ID/EN untuk microcopy baru.

### Affected Files
- `app/dashboard/page.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `components/Dashboard/useDashboardI18n.ts`
- `components/UsherApp/UsherApp.tsx`
- `AGENTS.md`
- `prd.md`
- `prd-tambahan.md`

### Validation
- GitHub Actions Build Validation #1043 pada application source head `22b5c929b59acaf68ae66ddacc28fc69e7b81658`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.


---

## 2026-09-18 — Repository Feature Structure Cleanup (Pass 1)

### Requirement / Intent
Owner meminta susunan item, folder, components, dan data dirapikan serta diberi nama yang mudah dipahami/dirawat ke depan, tanpa mengubah behavior produk atau URL route.

### Implementation
- component folder naming dinormalisasi:
  - `components/D-Invitation` → `components/DigitalInvitation`;
  - `components/GuestbookPage` → `components/Guestbook`;
  - `components/WeddingPlanner` → `components/EventPlanner`;
  - `components/Pintu` → `components/Landing/Pintu`;
- `PackageSelector` dipindahkan dari generic `components/Layout` ke `components/Payments`;
- service-facing static data dipusatkan di `data/services/`:
  - `digital-invitation.ts`;
  - `guestbook.ts`;
  - `event-planner.ts` (menggantikan naming wedding-only `wedding-planner.ts`);
- Invitation Studio dirapikan menjadi satu active `InvitationDesigner.tsx`; legacy `InvitationDesigner.tsx` lama dan `InvitationDesignerV2.tsx` dihapus setelah entrypoint aktif diverifikasi memakai V3;
- duplicate standalone `components/Theme/ThemeToggle.tsx` dihapus; canonical toggle tetap named export dari `ThemeContext.tsx`;
- import paths pada route/component aktif diperbarui;
- `AGENTS.md` dan `README.md` diberi repository naming/structure convention agar perubahan berikutnya tetap konsisten;
- route `app/*` tidak diubah sehingga URL behavior tidak berubah.

### Validation
- Build Validation #1067: **FAIL** karena dua internal Event Planner components masih mengimpor path data lama `@/data/wedding-planner`; import diperbaiki ke `@/data/services/event-planner`.
- Build Validation #1068 pada application source head `ef5a1ba30de5b21eb5e0095ee45fac776ce4ef3c`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Pass 2 merapikan helper `lib/` menjadi domain/server folders setelah seluruh API import dipetakan, agar perubahan backend tidak dicampur dengan component/data cleanup ini.


---

## 2026-09-18 — Repository Library Structure Cleanup (Pass 2)

### Requirement / Intent
Lanjutan cleanup repository untuk mengurangi file helper campur-aduk di root `lib/` dan membuat lokasi utilitas backend lebih mudah ditemukan tanpa mengubah API behavior.

### Implementation
- `lib/invitation-password.ts` → `lib/invitations/password.ts`;
- `lib/invitation-slug.ts` → `lib/invitations/slug.ts`;
- `lib/public-rate-limit.ts` → `lib/security/public-rate-limit.ts`;
- `lib/usher-qr.ts` → `lib/usher/qr.ts`;
- `lib/email.ts` → `lib/notifications/email.ts`;
- import path pada public invitation routes, invitation API, RSVP, Usher QR/check-in, Orders, dan Owner Users diperbarui;
- tidak memakai compatibility shim untuk path lama agar struktur baru benar-benar canonical;
- `auth.ts` dan `prisma.ts` sengaja belum dipindah pada pass ini karena fan-out sangat tinggi dan akan dipetakan terpisah sebelum refactor berikutnya.

### Validation
- Build Validation #1071: **FAIL** karena beberapa route masih mengimpor path helper lama setelah folder domain dipindahkan.
- Remaining imports pada Admin Operations, Personal Invitations, legacy event-khusus page, dan Usher route diperbaiki.
- Build Validation #1074 pada application source head `91dc24fbf4f5a7dc549d5cea0e1a438e2539670d`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Pass berikutnya memetakan dan merapikan high-fanout infrastructure modules seperti `auth.ts`, `google-auth.ts`, dan `prisma.ts`, serta shared provider naming yang masih bercampur.


---

## 2026-09-18 — Repository Infrastructure & Shared Provider Cleanup (Pass 3)

### Requirement / Intent
Lanjutan cleanup repository untuk menghilangkan nama file implementasi sementara/ambigu dan memisahkan shared provider state dari control UI, tanpa mengubah behavior produk.

### Implementation
- `lib/google-auth.ts` → `lib/auth/google.ts`;
- `components/Theme/ThemeContext.tsx` dipecah menjadi:
  - `components/Theme/ThemeProvider.tsx` untuk provider + `useTheme`;
  - `components/Theme/ThemeToggle.tsx` untuk canonical UI control;
- `components/Layout/background.tsx` → `components/Layout/RosePetalBackground.tsx`, dengan behavior protected Rose petals tetap sama;
- `components/PublicInvitation/FigmaClassicTemplate.tsx` → `ClassicInvitationTemplate.tsx` agar nama file tidak bergantung pada tool desain;
- Google OAuth route, root layout, Dashboard, Navbar, Pintu, public atmosphere, landing, dan public invitation imports diperbarui;
- `lib/auth.ts` dan `lib/prisma.ts` sengaja tetap menjadi conventional high-fanout root entry points karena pemindahan tidak memberi manfaat maintainability yang sebanding dengan churn;
- repository conventions diperbarui agar provider state dan UI controls tidak digabung kembali.

### Validation
- Build Validation #1077: **FAIL** karena masih ada import `ThemeContext`, `FigmaClassicTemplate`, dan satu literal newline pada import Dashboard setelah split provider.
- Build Validation #1081: **FAIL** karena `SeatingChart.tsx` masih memakai import `ThemeContext` lama.
- Seluruh sisa import diperbarui ke `ThemeProvider`, `ThemeToggle`, dan `ClassicInvitationTemplate`.
- Build Validation #1082 pada application source head `3aa154e22c9893b8c85fe711df35208254d512d9`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Cleanup berikutnya fokus pada route-local static data dan folder/component yang masih implementation-specific atau terlalu generik, tanpa memindahkan high-fanout entry points hanya demi estetika struktur.


---

## 2026-09-18 — Repository Feature/Data Cleanup (Pass 4)

### Requirement / Intent
Lanjutan cleanup repository untuk menormalkan feature naming yang masih legacy dan memisahkan large static catalog dari route component, tanpa mengubah URL atau behavior.

### Implementation
- `components/UsherApp/UsherApp.tsx` → `components/Usher/UsherWorkspace.tsx`;
- Dashboard Usher route sekarang memakai canonical `UsherWorkspace`;
- static template showcase catalog dipindahkan dari `app/template-design/page.tsx` ke `data/templates/showcase.ts`;
- template showcase data diubah dari positional tuples menjadi typed objects (`id`, `name`, `category`, `status`, `image`) sehingga tidak lagi bergantung pada index `[0]...[4]`;
- categories showcase diturunkan dari data source canonical;
- `app/template-design/page.tsx` sekarang fokus pada state/filter/rendering;
- repository structure docs diperbarui untuk `components/Usher/` dan `data/templates/`;
- audit tree dilakukan dan folder `Admin`, `Owner`, `Designer`, `PublicInvitation`, serta `InvitationStudio` dipertahankan karena sudah memiliki boundary/tanggung jawab yang jelas.

### Validation
- Build Validation #1085 pada application source head `a2abca888e2804bc47c21a9996e976404ff0c85c`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Cleanup berikutnya fokus pada kualitas internal file besar, terutama memecah `UsherWorkspace` yang masih monolitik, daripada terus memindahkan folder yang sudah semantik.


---

## 2026-09-18 — Usher Workspace Internal Cleanup (Pass 5)

### Requirement / Intent
Setelah folder/domain structure stabil, cleanup berlanjut pada kualitas internal komponen besar agar state/orchestration tidak bercampur dengan static config, domain types, helper murni, dan reusable presentation.

### Implementation
- `components/Usher/UsherWorkspace.tsx` tetap menjadi orchestration layer untuk:
  - loading/polling guest data;
  - scanner lifecycle;
  - check-in mutation;
  - issuing guest QR;
  - active tab state dan derived attendance data;
- domain types dipindahkan ke `components/Usher/types.ts`;
- tab/navigation config dipindahkan ke `components/Usher/config.ts`;
- QR parsing/image URL helpers dipindahkan ke `components/Usher/utils.ts`;
- check-in panel, metric wrapper, RSVP badge, guest table, dan generic feature panel dipindahkan ke `components/Usher/UsherPanels.tsx`;
- import dan naming diperbarui ke `UsherGuest`, `UsherTab`, `IssuedGuestQr`, `usherTabs`, `parseUsherQrToken`, dan `usherQrImageUrl`;
- behavior/API endpoints tidak diubah.

### Validation
- Build Validation #1088 pada application source head `5f62f4252c3dd3c9c30da988cf0735ab6a572bdc`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit komponen monolitik berikutnya dilakukan berdasarkan tanggung jawab nyata, dengan prioritas pada file yang mencampur data fetching/orchestration, navigation config, dan banyak presentation sections seperti Dashboard root.


---

## 2026-09-18 — Dashboard Root Internal Cleanup (Pass 6)

### Requirement / Intent
Melanjutkan cleanup internal dengan memecah `app/dashboard/page.tsx` yang terlalu besar berdasarkan tanggung jawab nyata, tanpa mengubah UI, route, atau behavior.

### Implementation
- domain types dipindahkan ke `components/Dashboard/dashboard-types.ts`;
- navigation/tab metadata dipindahkan ke `components/Dashboard/dashboard-navigation.ts`;
- client-side data helpers dipindahkan ke `components/Dashboard/dashboard-client.ts`;
- reusable account/onboarding controls dipindahkan ke `components/Dashboard/DashboardControls.tsx`;
- workspace presentation untuk Overview, RSVP, Placement, dan Usher summary dipindahkan ke `components/Dashboard/DashboardWorkspaces.tsx`;
- `app/dashboard/page.tsx` sekarang fokus pada state/orchestration, entitlements, profile/onboarding state, tab selection, serta composition;
- ukuran route utama turun kira-kira dari 46k karakter menjadi 23k karakter;
- behavior/API/URL tidak diubah.

### Validation
- Build Validation #1091 pada application source head `87e1998180af209a60487bf7890957a69705a0ea`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.

### Next
Setelah Pass 6 merge, audit berikutnya fokus pada internal Invitation Studio/editor, terutama file `InvitationDesigner.tsx` bila masih mencampur editor state, catalog/config, controls, dan preview presentation.


---

## 2026-09-18 — Invitation Designer Internal Cleanup (Pass 7)

### Requirement / Intent
Melanjutkan cleanup internal pada Invitation Studio dengan memisahkan editor orchestration dari configuration, state serialization, tool panels, dan preview canvas tanpa mengubah editor behavior.

### Implementation
- `InvitationDesigner.tsx` tetap menjadi orchestration layer untuk:
  - loading invitation;
  - active tool panel;
  - undo/redo history;
  - asset upload;
  - save/publish-related design persistence;
  - composing controls + canvas;
- legacy runtime component name `InvitationDesignerV3` dibersihkan menjadi canonical `InvitationDesigner`;
- domain/editor types dipindahkan ke `designer-types.ts`;
- template preset, decor options, palette/font option lists dipindahkan ke `designer-config.ts`;
- event identity/date formatting serta design-state serialize/parse helper dipindahkan ke `designer-state.ts`;
- editor sidebar/tool panels dipindahkan ke `DesignerPanels.tsx`;
- full invitation preview canvas dipindahkan ke `InvitationPreview.tsx`;
- `InvitationDesigner.tsx` turun kira-kira dari 36k karakter menjadi 12k karakter;
- API endpoints, route, persistence format, template key format, dan UI intent tidak diubah.

### Validation
- Build Validation #1094 pada application source head `9aa248c1085b8b275e811cbf8d2c043124049684`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit berikutnya fokus pada `InvitationEditorPage.tsx` dan komponen studio lain hanya jika masih mencampur orchestration, data fetching, dan presentation secara berlebihan.


---

## 2026-09-18 — Invitation Studio Guest Management Cleanup (Pass 8)

### Requirement / Intent
Melanjutkan cleanup Invitation Studio hanya pada file yang benar-benar mencampur banyak tanggung jawab, sambil menghindari over-refactor pada file yang sudah cohesive.

### Implementation
- `InvitationEditorPage.tsx` diaudit dan dipertahankan sebagai satu file karena sudah memiliki boundary yang jelas sebagai editor shell + publish gate;
- import/runtime naming lama `InvitationDesignerV3` pada editor shell dibersihkan menjadi canonical `InvitationDesigner`;
- `GuestManagement.tsx` tetap menjadi orchestration layer untuk:
  - load guest/table data;
  - locked entitlement state;
  - add table mutation;
  - add guest mutation;
  - composition;
- guest/table/form model dipindahkan ke `guest-management-types.ts`;
- response parsing helper dipindahkan ke `guest-management-client.ts`;
- locked state, table form, guest form, dan guest list table dipindahkan ke `GuestManagementPanels.tsx`;
- `GuestManagement.tsx` turun kira-kira dari 11k karakter menjadi 4.6k karakter;
- API endpoints, request payload, entitlement behavior, dan UI intent tidak diubah.

### Validation
- Build Validation #1097 pada application source head `78a6cc2951beec9ebfcd8721952987caff6ff4f2`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit berikutnya hanya menargetkan file yang benar-benar monolitik; `InvitationEditorPage.tsx` tidak perlu dipecah lagi kecuali tanggung jawabnya bertambah. Kandidat berikutnya: `RsvpForm.tsx`.


---

## 2026-09-18 — RSVP Form Internal Cleanup (Pass 9)

### Requirement / Intent
Melanjutkan cleanup Invitation Studio pada komponen RSVP yang masih mencampur submit orchestration, calendar helper, QR ticket generation/download, dan presentation.

### Implementation
- `RsvpForm.tsx` tetap menjadi orchestration layer untuk:
  - RSVP form state;
  - submit mutation ke public RSVP endpoint;
  - ticket/QR state;
  - composition input/success state;
- form/ticket contracts dipindahkan ke `rsvp-types.ts`;
- Google Calendar URL, QR image URL, HTML ticket escape/download helper dipindahkan ke `rsvp-helpers.ts`;
- RSVP input form dan success/digital-ticket presentation dipindahkan ke `RsvpPanels.tsx`;
- `RsvpForm.tsx` turun kira-kira dari 10.7k karakter menjadi 3k karakter;
- endpoint, request payload, ticket content, QR provider URL, calendar behavior, dan UI intent tidak diubah.

### Validation
- Build Validation #1100 pada application source head `95ea039e574c11dd808126c943afea056ed3dfb1`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit berikutnya diarahkan ke file besar di luar Invitation Studio hanya bila boundary tanggung jawabnya masih bercampur; hindari refactor tambahan pada file yang sudah cohesive.


---

## 2026-09-19 — Event Panel Internal Cleanup (Pass 10)

### Requirement / Intent
Melanjutkan repository cleanup pada Dashboard Event Panel yang masih mencampur event model, form/date helpers, validation, reusable field controls, API mutation, dan presentation dalam satu file.

### Implementation
- `EventPanel.tsx` tetap menjadi orchestration layer untuk:
  - event loading;
  - active/new/edit mode;
  - category selection;
  - save/delete mutations;
  - list/editor flow yang saling terkait;
- event/invitation/form contracts dipindahkan ke `event-panel-types.ts`;
- empty form, draft/sort helpers, date conversion/formatting, time validation, child-order validation, dan invitation→form conversion dipindahkan ke `event-panel-helpers.ts`;
- wedding family fields, date picker field, time picker field, generic input, dan textarea dipindahkan ke `EventFields.tsx`;
- `EventPanel.tsx` turun kira-kira dari 35.9k karakter menjadi 25.2k karakter;
- list/editor presentation sengaja tidak dipecah lagi pada pass ini karena flow, notice state, callbacks, dan editor mode masih sangat tightly coupled;
- API endpoint, request payload, URL behavior, event category behavior, dan UI intent tidak diubah.

### Validation
- Build Validation #1103: **FAIL** karena beberapa JSX multiline masih memakai nama lokal lama `Field` / `TimeField` setelah extraction.
- Sisa JSX diperbarui ke `EventField` / `EventTimeField`.
- Build Validation #1104 pada application source head `a66dd6c79bc8a9105b046621cdb2a15e94083d84`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit berikutnya mengevaluasi `SeatingChart.tsx`: pecah hanya bila file benar-benar mencampur canvas/layout orchestration, domain helpers, dan reusable presentation; jika cohesive sebagai satu seating editor, pertahankan.


---

## 2026-09-19 — Seating Chart Internal Cleanup (Pass 11)

### Requirement / Intent
Merapikan Seating Chart tanpa memecah canvas editor secara berlebihan. Fokus hanya pada domain contracts dan pure geometry yang tidak perlu tinggal di komponen UI.

### Implementation
- `SeatingChart.tsx` tetap menjadi cohesive seating editor untuk:
  - local/remote guest & table orchestration;
  - drag/drop;
  - seat assignment & swap;
  - table generation;
  - manual guest input;
  - Konva canvas interaction;
- guest/table/point/seat-target contracts dipindahkan ke `seating-chart-types.ts`;
- stage constants, table positioning, seat positioning, dan nearest seat target calculation dipindahkan ke `seating-chart-geometry.ts`;
- canvas/editor presentation sengaja tidak dipecah menjadi banyak komponen karena akan menambah prop-drilling tanpa boundary domain yang lebih jelas;
- API endpoint, seat numbering, drag/drop behavior, swap behavior, geometry result, dan UI intent tidak diubah.

### Validation
- Build Validation #1109 pada application source head `93165a31a5434ecaa193ab72a7621a9f7e4c6084`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.

### Next
Audit berikutnya fokus pada Dashboard feature panel besar yang benar-benar mencampur fetching, domain state, mutation, filtering, dan presentation—prioritas kandidat: `PersonalInvitationPanel.tsx`.


---

## 2026-09-19 — Landing Chrome & Dark Utility Repair

### Requirement / Intent
Repair visual kecil pada landing: header/footer harus menyatu dengan body, sementara utility control Dark Mode tetap memakai brand Rose dengan kontras near-black yang jelas.

### Implementation
- landing navbar diberi landing-only hook dan background `var(--background)`;
- compact landing footer memakai `bg-background`;
- selected ID/EN pada landing Dark Mode memakai opaque `var(--primary)` + near-black text;
- landing theme toggle pada Dark Mode memakai opaque `var(--primary)` + near-black icon/text;
- shared ThemeToggle/LanguageToggle hanya mendapat semantic hook; override warna dibatasi pada `.dc-navbar--landing` agar Dashboard tidak ikut berubah.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Pintu Ornament Open-State Repair

### Requirement / Intent
Menyatukan ornamen atas Pintu dengan state buka/tutup supaya ornamen tidak mengambang di atas opening ketika panel Pintu sudah terbuka.

### Implementation
- wrapper ornamen SVG diubah menjadi `motion.div`;
- state `isActive` yang sudah mengontrol panel kiri/kanan juga mengontrol opacity, y, dan scale ornamen;
- saat aktif/open: ornament opacity menjadi 0 dan sedikit bergeser ke atas;
- saat inactive/closed: ornament kembali ke opacity existing 0.8;
- reduced-motion memakai opacity-only transition yang sangat singkat.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Temporary `/jiplak` Landing Clone

### Requirement / Intent
Owner meminta workspace sementara untuk eksperimen landing tanpa mengubah landing production di `/`.

### Implementation
- menambahkan `app/jiplak/jiplak.tsx` sebagai copy independen dari landing saat ini;
- menambahkan `app/jiplak/page.tsx` sebagai route adapter sehingga clone dapat dibuka di `/jiplak`;
- navbar, compact footer, PublicContent, dan PublicAtmosphere memperlakukan `/jiplak` sebagai landing-like route agar visual/header/footer/background sama seperti `/`;
- `app/page.tsx` tidak diubah;
- clone sengaja independen agar perubahan berikutnya pada `jiplak.tsx` tidak memengaruhi landing utama;
- seluruh folder `app/jiplak/` serta conditional `/jiplak` pada shared layout dapat dihapus ketika eksperimen selesai.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Isolated 3D Pintu + Sweet Background Experiment on `/jiplak`

### Requirement / Intent
Owner ingin mencoba Pintu yang terasa lebih 3D dan background yang lebih manis daripada rose-petal drop, tetapi landing canonical di `/` tidak boleh berubah selama eksperimen.

### Implementation
- menambahkan `components/Landing/Pintu/PintuSecBaru.tsx` sebagai eksperimen Pintu terpisah;
- Pintu baru memakai CSS 3D + Motion: perspective, depth/translateZ, frame extrusion, ground shadow, light spill, dan dua daun pintu yang benar-benar berputar dengan `rotateY` dari sisi engsel;
- ornamen closed-door tetap mengikuti open state dan menghilang saat daun pintu terbuka;
- menambahkan `components/Layout/JiplakSweetBackground.tsx` dengan ambient Rose light, soft bokeh/motes, light beam, dan botanical line-art; tidak memakai falling petals;
- hanya `app/jiplak/jiplak.tsx` yang diarahkan ke dua komponen eksperimen tersebut;
- `app/page.tsx`, `PintuSection.tsx`, `PintuCard.tsx`, dan `RosePetalBackground.tsx` tidak diubah;
- Three.js belum ditambahkan pada pass ini; eksperimen memakai stack existing agar ringan dan mudah dibandingkan sebelum menambah WebGL dependency.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Jiplak Dream-World Portal Redesign (Pass 2)

### Requirement / Intent
Screenshot review menunjukkan eksperimen Pintu sebelumnya masih terasa seperti tiga card UI dengan shadow: hierarchy lemah, overlap kurang natural, area kiri terlalu kosong, dan background botanical terlihat sebagai dekorasi tempel. Owner meminta eksplorasi frontend yang lebih jauh dengan konsep tetap tiga Pintu + brand Rose, tetapi terasa seperti memasuki tiga dunia berbeda yang dreamy.

### Implementation
- `/jiplak` direcompose menjadi satu cinematic hero, bukan carousel card biasa;
- menambahkan `DreamPortalScene.tsx`:
  - satu portal aktif menjadi focal point besar;
  - dua portal lain mundur simetris sebagai alternate worlds;
  - perpindahan active portal memakai spring depth/scale/rotateY;
  - daun pintu aktif berputar dari engsel menggunakan CSS 3D `rotateY`;
  - frame memiliki extrusion/depth, inner image world, ground shadow, halo, dan light path/threshold ke arah viewer;
  - hover/focus portal lain memindahkan focus world; click portal aktif membuka route produk;
- menambahkan `DreamWorldBackground.tsx`:
  - ambience Rose berubah halus sesuai portal aktif;
  - layered radial light, soft veils, concentric dream rings, horizon glow, dust particles, dan abstract botanical horizon menggantikan falling petals khusus eksperimen;
  - Light/Dark mode tetap tersedia dan semua warna tetap berada dalam Rose + neutral family;
- `app/jiplak/jiplak.tsx` ditata ulang agar copy kembali terbaca jelas dan berfungsi sebagai editorial anchor di kiri, sementara portal scene menjadi visual anchor di kanan;
- selector kecil tiga dunia ditambahkan untuk explicit switching tanpa mengandalkan hover;
- tidak ada perubahan pada `app/page.tsx`, `PintuSection.tsx`, `PintuCard.tsx`, atau `RosePetalBackground.tsx` canonical.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Jiplak Asset-Driven Dream World (Pass 3)

### Requirement / Intent
Owner meminta eksperimen `/jiplak` berhenti mengandalkan line-art/background geometry generik dan memakai image assets supaya scene terasa lebih hidup. Rose-petal effect tetap dipertahankan sebagai secondary ambient layer.

### Implementation
- menambahkan `AssetDreamPortalScene.tsx` sebagai scene portal khusus eksperimen;
- crest PNG ditempatkan di atas portal aktif sehingga topper generik/"tanduk" dihapus dari visual language baru;
- portal memakai Motion untuk active-world spring transition, hinged `rotateY` door opening, hover/focus movement, pointer-driven scene parallax, halo, light path, dan content reveal;
- menambahkan `AssetDreamBackdrop.tsx` untuk memakai mist overlay serta botanical ornament PNG sebagai ambience utama;
- mist dan botanical assets dianimasikan dengan slow drift/float menggunakan `motion/react`;
- `RosePetalBackground` existing tetap dirender pada `/jiplak` sebagai layer ambient tambahan tanpa mengubah implementasi protected rose petals;
- abstract ring/line background dari eksperimen sebelumnya tidak lagi dipakai oleh `/jiplak`;
- landing canonical di `/` tetap tidak disentuh.

### Asset contract sementara
`/jiplak` mengharapkan asset berikut berada di `public/`:
- `tiara.png`;
- `flower.png`;
- `cloud.png`.

### Validation
- GitHub Actions observation: pending.


### Follow-up — Jiplak Chrome Continuity & Actual Asset Names
- Header dan compact footer `/jiplak` dibuat transparan agar ambience/asset backdrop menyatu sampai chrome atas-bawah; landing canonical `/` tetap memakai canvas background existing.
- Asset remote yang sudah tersedia dipakai dengan nama aktual `/tiara.png` dan `/flower.png`.
- `/cloud.png` saat ini memiliki blob SHA yang sama dengan `/tiara.png`, sehingga belum dipakai sebagai mist layer agar tidak menampilkan crest yang sama sebagai background. Mist sementara tetap dibangun dari soft animated Rose gradients + rose petals sampai asset cloud diperbaiki.


---

## 2026-09-19 — Promote Floral + Rose Glow to Canonical Landing

### Requirement / Intent
Owner approved exactly two visual elements from the `/jiplak` experiment for the canonical landing: the botanical flower asset and soft pink/Rose glow. All other landing composition and behavior must remain unchanged.

### Implementation
- added `components/Landing/LandingFloralGlow.tsx` as an isolated decorative layer;
- uses committed `/flower.png` on the lower left and a softer mirrored instance on the lower right;
- adds a restrained animated Rose radial glow near the Pintu side;
- respects `useReducedMotion()`;
- `app/page.tsx` only adds this layer before the existing `RosePetalBackground`;
- existing `PintuSection`, copy, spacing/layout, header/footer, and protected rose-petal implementation are unchanged.

### Validation
- GitHub Actions observation: pending.


---

## 2026-09-19 — Personal Invitation Internal Cleanup (Pass 12)

### Requirement / Intent
Melanjutkan cleanup repository pada Personal Invitation tanpa mengubah hak akses, status publish, password, request API, atau navigasi. Pisahkan presentation dari event-scoped orchestration/mutation.

### Implementation
- `PersonalInvitationPanel.tsx` tetap mengelola event selection, loading invitations/guests, create/patch, password, dan publish state.
- `PersonalInvitationPanels.tsx` memisahkan create form serta list/item editor/password UI; `personal-invitation-types.ts` menyimpan kontrak event/guest; `personal-invitation-helpers.ts` menyimpan sorting events dan pembentukan public URL.
- `PersonalInvitationPanel.tsx` turun kira-kira dari 22.4k menjadi 12.5k karakter; endpoint, payload, URL, dan UI intent dipertahankan.
- Affected: `components/Dashboard/PersonalInvitationPanel.tsx`, `PersonalInvitationPanels.tsx`, `personal-invitation-types.ts`, `personal-invitation-helpers.ts`, `AGENTS.md`, `README.md`, `prd.md`. PR #34 baseline conflict with newer landing changes; re-applied on current `main` in branch `refactor/personal-invitation-main-sync` to preserve new landing work.

### Validation
- Original PR #34 source Build Validation #1116: **PASS** (dependency install, Prisma generation, Next production build dan TypeScript).
- Current-main branch Build Validation #1136 on head `cfb2d11bdd9029369e0056c1ee1469c63764e1fc`: **PASS** (dependency install, Prisma generation, Next production build and TypeScript). Documentation-only validation update follows; production database migration: N/A.

### Next
Audit dan uji flow Personal Invitation secara browser/integrasi bila tersedia; build tidak membuktikan interaksi runtime. Hindari refactor folder tanpa manfaat maintainability nyata.


---

## 2026-09-19 — WA Blast Panel Internal Cleanup (Pass 13)

### Requirement / Intent
Merapikan panel WA Blast yang mencampur event/guest contracts, quota/event fetching, order/recipient mutations, dan recipient form/queue presentation. Jangan ubah akses event-scoped, kuota, harga, endpoint, atau tampilan dashboard.

### Implementation
- `WhatsAppBlastPanel.tsx` tetap menangani pemilihan acara, loading guest/queue/quota, pembuatan order add-on, create/delete penerima, state, dan composition.
- `WaBlastPanels.tsx` menampung reusable `WaBlastAddRecipients` dan `WaBlastRecipientQueue` dengan UI/copy/class serta disabled behavior tetap.
- `wa-blast-types.ts` menampung kontrak event/guest/selected recipient.
- File utama turun kira-kira dari 14.9k menjadi 10.8k karakter. Affected: `components/Dashboard/WhatsAppBlastPanel.tsx`, `WaBlastPanels.tsx`, `wa-blast-types.ts`, dan dokumen governance.
- No database migration; API routes dan payload tetap.

### Validation
- Build Validation #1139 on application source + documentation head `8277f98a869f9595c969bb6d35797dcb213120f5`: **PASS** (dependency install, Prisma Client generation, Next production build + TypeScript).
- Commit setelah validasi ini hanya memperbarui hasil validation di PRD dan tidak mengubah source aplikasi.
- Database migration: N/A.

### Next
Jangan melanjutkan pemecahan komponen tanpa alasan jelas. Prioritaskan pengujian runtime event-scoped mutation, quota, serta Personal Invitation dan WA Blast, bukan sekadar mengurangi ukuran file.


---

## 2026-09-19 — Spesifikasi Sesi Pernikahan Satu Hari (docs-only)

### Requirement / Intent
Owner meminta opsi mengundang tamu hanya ke prosesi pernikahan, hanya ke resepsi, atau ke keduanya untuk pernikahan **pada tanggal yang sama**. Jika tanggal berbeda, wajib membuat event dan paket Undangan Digital baru. Label Holy Matrimony diganti bahasa Indonesia; `Pengukuhan` bukan label canonical.

### Decision / Changes
- Tambah section 5.7 untuk nama sesi, dua jadwal/tempat pada satu tanggal, entitlement per event/tanggal, undangan personal per tamu, server-side filtering, RSVP/QR, compatibility legacy, dan keperluan migrasi.
- `AGENTS.md` dan `README.md` menegaskan batasan agar implementasi parsial tidak dipromosikan ke publik sebagai fitur selesai.
- Tidak ada perubahan schema, route, komponen, API, atau behavior pada commit dokumentasi ini.

### Validation
- Documentation-only change; implementasi/DB migration/functional testing: **not started**. Production build bukan bukti fitur sesi sudah tersedia.

### Next
Implementasikan keseluruhan flow secara bertahap pada branch kode terpisah. Jangan merge UI input tanpa persistence, scope tamu, rendering/filtering dan server validation yang sesuai.


---

## 2026-09-20 — Landing image warning cleanup

### Intent
Rapikan warning Next.js pada gambar Pintu `/hp-digital.png` dan `/bukutamu.png` (parent `fill` terdeteksi `position: static`) serta warning LCP pada `/wo.png` dan `/flower.png`. Jangan mengubah desain, konten, ukuran, layout, animasi, maupun perilaku landing utama dan `/jiplak`.

### Implementation
- `PintuCard.tsx` dan `AssetDreamPortalScene.tsx`: beri setiap `Image fill` wrapper `relative h-full w-full` di dalam elemen absolute/animated yang sudah ada, sehingga containing block selalu eksplisit tanpa mengubah geometry atau Motion.
- Gambar Pintu yang langsung terlihat diberi `loading="eager"`; active image memakai `fetchPriority="high"`, yang lain `auto`.
- `LandingFloralGlow.tsx` dan `AssetDreamBackdrop.tsx`: bunga dengan `fill` memakai wrapper relative yang eksplisit dan `loading="eager"` karena berada pada initial viewport.
- Tidak menyentuh `app/page.tsx`, `app/jiplak/jiplak.tsx`, `RosePetalBackground.tsx`, komposisi visual, stylesheet, atau aset gambar.

### Validation
- GitHub Build Validation: pending.
- Runtime browser warning confirmation: pending local browser verification.


---

## 2026-09-20 — Copy canonical landing Pintu into temporary `/jiplak`

### Requirement / Intent
Owner meminta kode Pintu dari landing `/` dicopy secara independen ke `/jiplak`, bukan dipindahkan atau diimport sebagai komponen bersama. Tujuan: eksperimen Pintu nanti tidak mengubah landing canonical.

### Implementation
- snapshot `components/Landing/Pintu/PintuCard.tsx` disalin ke `app/jiplak/PintuCardJiplak.tsx`, termasuk gambar, ornament, tombol masuk, dan animasi buka/tutup;
- snapshot `components/Landing/Pintu/PintuSection.tsx` disalin ke `app/jiplak/PintuSectionJiplak.tsx`, termasuk data ketiga pintu, Motion loop, scale/depth, hover pause, dan reduced motion;
- import di section copy hanya menunjuk `./PintuCardJiplak`, bukan PintuCard canonical;
- `app/jiplak/jiplak.tsx` memakai `PintuSectionJiplak` dan menyesuaikan active-door state nullable sesuai kontrak Pintu asli; konten, backdrop, rose petals, header/footer, dan route tetap;
- `app/page.tsx`, `PintuSection.tsx`, `PintuCard.tsx`, dan `RosePetalBackground.tsx` canonical **tidak diubah**;
- salinan tetap independen: perubahan berikutnya pada Pintu di `/jiplak` tidak otomatis memengaruhi landing utama.

### Validation
- GitHub Build Validation: pending.
- Local visual/browser check: pending.


---

## 2026-09-20 — Isolated Three.js dream portals for `/jiplak`

### Requirement / Intent
Owner installed Three.js and requested an ambitious, visibly three-dimensional/dreamy rendering of **the copied Pintu on `/jiplak` only**. Preserve canonical landing `/` and the existing dreamy flower/Rose glow, rose petals, copy, header/footer and links.

### Implementation
- Added `app/jiplak/three-portal-engine.js` as a separate imperative Three.js/WebGL2 scene, loaded dynamically only when `/jiplak` mounts; package `three` was already in dependencies, so no new framework/dependency is added.
- Added `app/jiplak/three-portal-engine.d.ts` as a typed interface to keep route-level React/TypeScript boundaries explicit without adding an uncommitted TypeScript type package to the lockfile.
- Added `app/jiplak/ThreePortalScene.tsx` to mount/dispose WebGL, synchronize active door and theme with existing `/jiplak` UI, route active-door clicks, respect reduced motion, and render the previously copied `PintuSectionJiplak` as a functional fallback if initialization/WebGL2 fails.
- Three scene: **three independently modeled archways**, extruded bevelled frames, real hinged split doors/handles, photos set on arched world planes, chamber depth, physical material/trim, illuminated thresholds and floor, dynamic interior point lights, shadow casting/receiving lights, procedural halo and floor light spill, floating instanced motes, animated portal position/depth and camera parallax.
- Kept original service links and accessible DOM world selector / CTA on `/jiplak`. The fallback includes the copied PintuCard and Motion loop. WebGL resources/listeners/observers/render loop are torn down on unmount, rendering pauses while offscreen/backgrounded, and device pixel ratio is capped.
- Only `app/jiplak/jiplak.tsx` switches to `ThreePortalScene`. `app/page.tsx`, canonical Pintu files, shared RosePetalBackground, existing floral/glow background and shared header/footer remain unchanged.

### Validation
- GitHub Actions Build Validation run `35480379163` on source + documentation head `341e25b0a88e08c85de8fe1ee7ef13e4c4b9b915`: **PASS** (install dependencies, Prisma Client generation, Next.js production build + TypeScript).
- Visual GPU/browser behavior: **pending local `http://localhost:3000/jiplak` verification on target device**. Production build does not prove WebGL appearance or GPU performance.
- Subsequent documentation-only commit records the observed build result without changing application code.


---

## 2026-09-20 — Jiplak orbital / realistic material repair

### Owner feedback / scope
Three.js pass pertama terlihat seperti Pintu plastik dengan gambar yang melar; Motion orbital asli hilang. Owner menyukai contact/ground shadow, meminta perpindahan tiga Pintu kembali mengorbit seperti landing, memakai Rose brand tanpa pink glow berlebihan, dan menjaga landing canonical `/` tetap apa adanya.

### Implementation
- `app/jiplak/ThreePortalScene.tsx` mengembalikan timing orbital asli melalui Motion `animate(useMotionValue)`: tiga fase merata, 10 detik per putaran, ease `[0.42,0,0.58,1]`, repeat delay 0.8 detik, hover pause/resume, perubahan active-door mengikuti Pintu yang paling depan. Explicit selector dipertahankan dan mengarahkan kembali orbit ke dunia yang dipilih.
- `app/jiplak/three-portal-engine.js` kini memetakan Motion progress ke ellipse x/y/z + depth scale, bukan menahan satu pintu di tengah dan dua pintu statis di sisi. Pintu memakai matte Rose `#C07A84`, panel inset, proper jamb hinge/pivot, stepped threshold, gentle natural studio lighting dan shadow lantai yang tetap ada.
- Texture UV world foto memakai aspect-ratio-aware *cover* crop dari intrinsic image size. Tidak ada stretch; crop diperlukan mengikuti aspect aperture melengkung.
- Menghapus shader glow/halo/saturated pink light-spill dan extraneous shine. `components/Layout/AssetDreamBackdrop.tsx` menghapus pink radial background glow khusus eksperimen, tetapi `flower.png` kiri/kanan dan protected `RosePetalBackground` tidak diubah. Soft contact shadow tetap.
- `app/page.tsx`, Pintu canonical, `LandingFloralGlow.tsx`, shared header/footer dan protected rose-petal implementation tidak diubah.

### Validation
- GitHub Actions Build Validation run `35480935118` on application + documentation head `e6816880e20c3fbefdb9ab582838105b8ac803b8`: **PASS** (dependency installation, Prisma Client generation, Next.js production build and TypeScript).
- Local WebGL appearance, orbital timing, hover, image crop and responsive composition: **pending owner browser review**. Production build does not verify visual rendering or actual GPU performance.
- This documentation-only validation update does not alter the validated application source.


---

## 2026-09-20 — Jiplak Pintu silhouette cleanup, stage 1

Owner meminta revisi bertahap agar bisa memeriksa tiap tahap di `/jiplak` sebelum melanjutkan dekorasi. Tahap pertama hanya memperbaiki bentuk: mengganti backing kotak dengan geometri arch yang tetap di dalam frame, menghapus inner trim yang terlihat seperti tanduk, serta menghapus threshold/edge berbentuk balok abu-abu. Kontak shadow lembut di lantai tetap. Tidak menambahkan sinar atau dekorasi bunga/list pada tahap ini; tunggu pemeriksaan visual owner. Orbital Motion, crop gambar, material Rose dan konten tidak diubah. Scope: hanya `app/jiplak/three-portal-engine.js`; landing utama `/` dan shared components tetap.

Validation: GitHub Build Validation pending; visual WebGL lokal perlu diperiksa sebelum tahap 2.


---

## 2026-09-20 — Jiplak Pintu stage 2: ivory light on open door

Setelah cleanup bentuk Pintu tahap 1, tahap 2 hanya menambahkan projected floor light berwarna ivory hangat pada setiap Pintu ketika terbuka. Procedural alpha texture memudar ke depan dan ke samping, opacity dibatasi hingga 0.42 dan mengikuti openness daun pintu; lampu mati saat pintu tertutup. Shadow lantai, orbital Motion, material Rose matte, foto, bunga, rose petals, header/footer, dan seluruh landing utama `/` tetap. Scope kode: `app/jiplak/three-portal-engine.js`. Detail list/bunga pada Pintu belum ditambahkan—menunggu pemeriksaan visual owner sebelum tahap 3.

Validation: GitHub Actions pending; visual WebGL lokal perlu diperiksa.


---

## 2026-09-20 — Jiplak Pintu stage 3: list dan bunga kecil pada frame

Setelah tahap 1 menghapus backing kotak/tanduk/balok dan tahap 2 menambah sinar ivory saat pintu terbuka, tahap 3 menambahkan hanya list tipis matte Rose di jamb kiri/kanan serta relief roset empat kelopak ukuran kecil pada sisi frame, di bawah lengkungan. Ornamen benar-benar menempel pada frame (bukan dekorasi melayang di atas), tidak mengubah siluet arch, gambar, atau mekanisme engsel. Orbital Motion, shadow lantai, sinar ivory, material brand, bunga latar, rose petals dan landing utama `/` tidak diubah. Scope kode: hanya `app/jiplak/three-portal-engine.js`.

Validation: GitHub Actions pending; pemeriksaan visual di localhost `/jiplak` diperlukan.


---

## 2026-09-20 — Jiplak grand ornate doors using uploaded assets

Owner uploaded `public/pintu1.png` to `pintu4.png` and requested much larger, ornate, photographic doors rather than procedural blocks. `/jiplak` now loads `pintu1.png`, `pintu2.png`, `pintu3.png` independently for three service portals; each photographic facade is split into two UV-cropped halves attached to separate 3D hinge pivots, with the photographed ornamentation preserved instead of rebuilt as blocks. `pintu4.png` remains available for a later variation. Camera distance and front-door scale increase while the existing three-door Motion orbital timing and interactions remain; original floor shadow and opening-only ivory light remain. The old procedural arch/frame/mini-rosettes are removed from this experimental scene. Photo worlds behind the opening, flowers and petals remain. Canonical landing `/` is unchanged.

Validation: GitHub Actions pending; owner visual review needed to check alpha edges, photo/hinge alignment and mobile composition.

---

## 2026-09-20 — Pintu 3D Pintu 1 visual tracker + isolated stage-one preview

Owner meminta satu tracker `pintu3d.md` untuk tiga fase/15 tahap dan menegaskan seluruh daun pintu harus ikut membuka sampai kusen saja yang diam. Perubahan tahap satu menambahkan `/pintu-lab` dengan komponen `Pintu3DPreview`: dua daun bergerak pada pivot jamb masing-masing, muka/belakang/rusuk dan panel permulaan mengikuti transform daun, kusen/ruang belakang independen, serta kontrol buka/tutup. Versi ini adalah baseline bentuk/mekanisme, **bukan** hasil akhir ukiran atau validasi visual. `/`, `/jiplak`, rose petals, orbital tiga Pintu, brand dan backend tidak diubah. Material lanjutan, ukiran, bunga dan lighting final dilakukan setelah owner meninjau tahap satu.

Affected files: `pintu3d.md`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `prd.md`, `AGENTS.md` (tautan tracker). Initial GitHub commits: `3a805b53`, `bdf9ed52`, `e67a7da1`. Validation: GitHub Build Validation run `35497267847` pada application source head `e67a7da17b9a14dc68ff563413600703d73dd3f5` **PASS** (komponen + route sudah masuk). Commit dokumentasi setelahnya tidak mengubah application source. Screenshot, tampilan 3D aktual, klik buka/tutup, dan desktop/mobile di browser target **pending owner review**. Tidak ada klaim WebGL / browser telah diuji.

---

## 2026-09-20 — Pintu 1, tahap 2: proporsi dan ketebalan daun

Setelah baseline `/pintu-lab`, pemilik meminta melanjutkan penyempurnaan Pintu 1. Pada eksperimen terisolasi ini, dimensi pintu dibuat lebih tinggi (rasio lebar:tinggi 0,65), batas ukuran mengikuti viewport, profil kusen dan celah pertemuan dua daun disesuaikan; muka dan belakang masing-masing daun diposisikan pada z ±10 px dan empat rusuk menghubungkan keduanya menjadi daun dengan volume 20 px. Semua bidang tetap merupakan anak dari pivot daun dan ikut membuka/menutup; frame dan ruang belakang tetap diam. Tersedia mode tampak miring -17° untuk memeriksa bentuk serta ketebalan saat pintu terbuka. Desain material, engsel detail, ukiran dan pencahayaan final masih tahap berikutnya. `/`, `/jiplak`, orbital, global brand dan protected background tidak diubah.

Affected files: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits: `6f9fb541acd2b2a5d5762fe84386ce4830db18cf`, `271b634e47faedd423e47cbc2e7a46d1dcedaf3c`. Validation: GitHub Build Validation **pending observation**; render/screenshot desktop-mobile and actual full-open appearance **pending owner review**.

---

## 2026-09-20 — Pintu 1 stages 1–2 approved; stage 3 matte Rose material

Owner mengirim dua screenshot browser `/pintu-lab` (tertutup dan terbuka) dan menyatakan Tahap 1 dan Tahap 2 sudah OK. Posisi dua daun dan kusen menjadi baseline visual yang harus dipertahankan. Screenshot masih memuat heading/kontrol versi awal sehingga status tombol tampak miring pada source Tahap 2 belum terbukti dari screenshot tersebut; tidak diklaim sudah diuji terpisah.

Tahap 3 menambahkan layered CSS gradients sebagai simulasi serat halus pada muka daun, belakang daun, dan seluruh rusuk ketebalan; muka dan belakang kini menggunakan shade Rose berbeda, panel muka mendapat bayangan inset matte yang lebih terbaca. Texture/gradients selalu melekat pada node daun existing, bukan lembaran/ornamen diam di depan bukaan. Tidak ada perubahan geometri, mekanisme engsel, route, orbital, backend, asset, brand fonts, ataupun protected global landing. Header/instruksi `/pintu-lab` memberi konteks pemeriksaan material. Detail ukiran/molding/bunga belum dikerjakan; belum menganggap kualitas visual Tahap 3 sudah disetujui.

Affected files: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits: `48c31bace7fff7250447f4f78c78e415354279e4`, `4c13211787c924fcd0185330d153cc9cd8695e20`. Validation: GitHub CI **pending observation**; visual material/facing on owner browser **pending screenshot and approval**.

---

## 2026-09-20 — Pintu 1 tahap 4: realistic hinge axis, stationary jamb depth and side-angle review

Owner menilai tampak miring Pintu 1 masih seperti **lembaran yang dimiringkan** lalu meminta lanjut Tahap 4. Jangan menafsirkan komentar ini sebagai persetujuan material/depth Tahap 3. Kelemahan source sebelumnya: daun sudah dipisahkan menjadi front/back + four edges tetapi frame hanya empat strip pada z=0; tampak miring mengubah seluruh scene `rotateY(-17°)`, tidak menampilkan sisi/depth kusen yang semestinya.

Dalam preview terisolasi `/pintu-lab`, tambahkan sisi tetap pada jamb kiri/kanan, lintel, ambang dan bingkai belakang pada z=-44 px; sisi kusen tidak menjadi anak transform daun. Bidang interior juga ditarik ke z=-44 px agar permukaan return kusen terlihat dan tidak ditutupi oleh background datar di mulut pintu. Masing-masing sisi diberi 3 set engsel: barrel atas/bawah terikat di frame, sleeve tengah + mounting plate terikat di daun masing-masing. Transform-origin daun sekarang pada tepi luarnya dengan offset kedalaman z=16 px, sama dengan axis barrel, sementara panjang/posisi daun dan bukaan dua daun tetap. Titik engsel statis dihitung dengan offset top 3,5% dan tinggi daun 93,7% supaya sejajar dengan knuckle yang ikut berputar. Kontrol pemeriksaan sudut menjadi depan, kiri -30°, kanan +30°; rotasi scene sendiri tidak dianggap sebagai geometri 3D, tetapi menyingkap return dan bidang samping yang sekarang memang memiliki volume. CSS 3D merupakan aproksimasi visual, belum mencapai full mesh realism. Belum memasang ukiran/bunga/interior final atau menggandakan tiga pintu.

Affected: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits `51990eed35accc71e7117700470aed0f8b3e933b`, `294b1b7e2b09e8562dae38a72c697af6a5ffbdce`, `4b14d7538acaae8484f18be140be5dcfc2c6c9f8`, `a43c5c92670e06e82d9169f241f47a90c967ecd7` (recess portal), `25e04cf52c1440874bdbbfcb1b2dfa72beeceaeb` (hapus translasi hinge ganda: Tailwind v4 `translate` property tidak ditimpa inline `transform`). Tahap 3 build previously observed PASS run `35498336075` on source head `4c13211787c924fcd0185330d153cc9cd8695e20`; tahap 4 CI **pending observation** dan screenshot browser depan/kiri/kanan tertutup/terbuka **pending owner review**. `/`, `/jiplak`, orbital, logo/fonts, backend dan protected background tidak berubah.

---

## 2026-09-20 — Pintu 1 tahap 5: controllable opening angles and animated ground shadows

Owner meminta lanjut tahap berikutnya setelah koreksi kedalaman kusen/engsel di `/pintu-lab`. Preview sekarang memiliki kontrol bukaan 0°, 45°, 90°, dan 110° untuk kedua daun sekaligus serta tombol buka-penuh/tutup. Gerak masing-masing daun menggunakan target sudut sama dan arah rotasi berlawanan dengan easing 1,1 detik terkontrol yang berhenti pada target tanpa spring overshoot; reduced motion memperpendek durasi. Dua bayangan projected/blurred berbentuk elips bertumpu di kaki jamb kiri dan kanan, diputar/diubah opacity/scale sejalan dengan sudut bukaan, tanpa membuat dekorasi atau bayangan sebagai anak dari daun yang bergerak; shadow dasar kusen existing dipertahankan. Eksposur halus ruang di balik pintu mengikuti fraksi bukaan 0–110°, bukan light beam final tahap 10. Ini adalah simulasi CSS 3D, bukan collision engine atau pencahayaan fisik sepenuhnya. Bentuk, material matte Rose, engsel/jamb, routing, UI landing `/`, `/jiplak`, tiga pintu orbital dan protected rose-petal background tidak diganti. Tahap 3/4 belum disetujui visual secara eksplisit; tahap 5 juga membutuhkan review browser.

Affected files: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits: `93d5854adcbb4eeb7f9a48c6880eec1f77baf93b`, `41e81f8e92f0f9ca561ef48b0302a116dda98d6b`. Validation: GitHub Build Validation run `35499021097` on stage-five application source head `41e81f8e92f0f9ca561ef48b0302a116dda98d6b` **PASS** (build/test pipeline); tampak depan/kiri/kanan pada empat sudut bukaan + tutup balik **pending owner visual review**. Dokumentasi pasca build tidak mengubah kode aplikasi. Tahap 4 previously validated via GitHub Build Validation run `35498805698` **PASS** on preceding head `8af2b54126a763680dd1793c5b734c7f88e9b718`; that check does not cover stage-five source changes.

---

## 2026-09-20 — Pintu 1 tahap 6: carved relief attached to both opening leaves

Owner mengirim screenshot preview `/pintu-lab` miring dengan daun tertutup dan terbuka, lalu meminta lanjut. Screenshot memperlihatkan daun kiri-kanan utuh, engsel samping dan kedalaman jamb; latar bukaan masih gelap (penyempurnaan ruang dilakukan pada tahap 9). Bagian atas pintu sedang berada di luar viewport screenshot saat halaman terscroll; periksa komposisi responsif lebih lanjut pada Tahap 11–12, jangan mengganti proporsi/bukaan yang telah disetujui sebelumnya. Owner belum memberi persetujuan final terpisah bagi Tahap 3–5.

Tahap 6 mengimplementasikan `components/Landing/Pintu/DoorRelief.tsx`: pola ukiran panel atas/bawah menggunakan SVG berkontur acanthus dan sulur, dengan tiga lapisan stroke (bayangan cekungan, ridge, highlight), panel ornamental medali kecil, dan varian mirrored kanan/kiri. `Pintu3DPreview.tsx` menempatkan `<DoorRelief side={side} />` **di dalam bidang muka `HingedLeaf` masing-masing**, di atas latar panel yang sudah dipasang; karena seluruh node muka merupakan anak pivot engsel, relief pada kedua daun ikut berputar pada 0°/45°/90°/110° dan tidak tertinggal pada kusen. Pola motif ini adalah efek pahatan visual 2.5D, belum mesh sculpt; crest/bunga besar ditunda hingga Tahap 8 dan molding hingga Tahap 7. Route `/pintu-lab` memperbarui petunjuk review ukiran. Tidak ada perubahan geometri, engsel, animasi, light scene, material Rose, route canon `/`, eksperimen `/jiplak`, protected rose petals atau orbital tiga pintu.

Affected: `components/Landing/Pintu/DoorRelief.tsx`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits `38e4c888de4a77e1cfae88acc65464846576334f`, `6065d48c79160166353dcc4108a3fc12d5f939c1`, `30f67cbcf230923ef5e5519cea0f747c8d9731e5`. GitHub Build Validation run `35499261849` on stage-six source head `30f67cbcf230923ef5e5519cea0f747c8d9731e5` **PASS**; actual carving contrast, readability and attachment under rotation **pending screenshot and owner visual review**. Update dokumentasi berikutnya tidak mengubah source yang divalidasi.

---

## 2026-09-20 — Pintu 1 tahap 7: stepped panel molding and fixed jamb trim

Owner meminta lanjut setelah implementasi ukiran Tahap 6. Eksperimen terisolasi `/pintu-lab` mendapat komponen `components/Landing/Pintu/DoorMolding.tsx` yang dipisah karena kompleksitas relief, material dan geometri preview. Masing-masing daun mendapatkan border perimeter berlapis, dua panel dengan tiga tingkat lis/ridge-recess dan empat aksen sambungan sudut, serta stile tipis pada sisi pertemuan di tengah. Lis **menjadi anak elemen muka daun di dalam `HingedLeaf`**, sehingga ikut berputar bersama relief saat pintu dibuka 0°/45°/90°/110°. `FrameMolding` dipasang pada kusen yang diam dan tidak menyeberangi celah bukaan, sehingga saat terbuka hanya trim struktural yang tersisa. Shading dan highlight tetap matte dalam Rose family, bukan material metal gold atau efek plastik/glow. Route `/pintu-lab` memperbarui judul dan instruksi review posisi lis. Jangan menilai visual selesai tanpa screenshot/approval owner; efek relief CSS 2.5D dan belum true bevel mesh. Tidak ada ornamen bunga/crest besar, gambar tambahan atau perubahan indoor world, bukaan, shadow, ukuran, router, landing utama `/`, eksperimen `/jiplak`, orbital ataupun protected rose petals.

Affected files: `components/Landing/Pintu/DoorMolding.tsx`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits `ed5110d10659998907edb420b146fa2cef728695`, `52d5b348f3746783b9c58124c5e4d2205cbdf0bb`, `5e2ac0c0c6f11e205588f1cadc40ff92968be9df`. Validation: GitHub Build Validation run `35499429090` on stage-seven source head `5e2ac0c0c6f11e205588f1cadc40ff92968be9df` **PASS**; visual molding and absence of stray trim from multiple angles **pending owner browser review**. Subsequent docs-only updates do not change validated source.

---

## 2026-09-20 — Pintu 1 tahap 8: floral crest rooted in the hinged leaves and fixed lintel

Owner meminta lanjut tahap bunga setelah Tahap 7. Tambahkan `components/Landing/Pintu/DoorFlorals.tsx` berisi crest mawar Rose: lapisan kelopak, bayangan relief, lingkar dudukan oval berlis, sulur dan daun acanthus. Komponen `DoorFlorals` berada **di dalam node muka masing-masing `HingedLeaf`**, bertempat di panel atas, sehingga kedua crest benar-benar mengikuti daun ketika dibuka 0°, 45°, 90°, 110°. Crest tidak melewati celah tengah, tidak membentuk tanduk/tiang yang mencuat di luar siluet kusen, dan tidak menggantikan geometri daun, material, engsel, gerakan, atau molding. `FrameFloralAccents` menambahkan sepasang roset kecil yang duduk sepenuhnya di dalam balok atas kusen (lintel) dan terpisah dari pivot daun, sehingga tetap diam saat daun terbuka. Bunga adalah relief SVG/CSS visual 2.5D, bukan geometri sculpt fisik yang telah disetujui; background rose petals yang dilindungi tidak disentuh. `/pintu-lab` memperbarui judul/instruksi agar user menilai crest saat tertutup dan terbuka dari sisi kiri/kanan. Ruang gelap di balik bukaan dijadwalkan khusus Tahap 9 dan sorotan cahaya Tahap 10; jangan mengklaim kedua tahap tersebut sudah selesai.

Affected files: `components/Landing/Pintu/DoorFlorals.tsx`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits: `a405fcae88018894b7084dd8378a288323517388`, `8c646973f144019934df2bd5ae8630bcc31e579b`, `a2efa0307303506a567d4e2f67f485f3e7cae0a5`. Validation: GitHub Build Validation run `35499730420` on stage-eight application source head `a2efa0307303506a567d4e2f67f485f3e7cae0a5` **PASS**; bloom contrast, no floating remnants, leaf attachment at 110°, and frame-lintel integration **pending owner screenshot/browser review**. Documentation commits do not change the source head validated by CI. Landing canon `/`, `/jiplak`, orbital, background, and product behavior remain unchanged.

---

## 2026-09-20 — Pintu 1 tahap 9: interior foyer in perspective behind the fixed jamb

Owner mengirim screenshot `/pintu-lab` Tahap 8 saat pintu tertutup; crest Rose pada dua panel atas dan relief/molding bawah terlihat menempel pada masing-masing daun. Owner meminta melanjutkan tanpa menyatakan persetujuan final pada tahap 8; pengecekan crest pada sudut 110° dan mode miring tetap diperlukan.

Tahap 9 mengganti bidang latar gelap datar di balik pintu dengan komponen `components/Landing/Pintu/DoorInterior.tsx`. Foyer interior memakai ilustrasi perspektif SVG (2.5D) yang menyatu: bidang dinding samping kiri/kanan, plafon bercoffer, lantai dengan sambungan perspektif, dinding belakang/pilaster, dan portal arch kedua yang lebih jauh/kecil. Warna interior netral Rose–ivory dengan ambient lembut, vignette kontak moderat, dan detail arsitektur yang sesuai untuk segala acara. Interior berada di `DoorFrame` pada z=-44px di belakang jamb yang tetap; daun/engsel/ornamen bergerak tetap terpisah. Tidak ada kotak abu-abu/gelap kosong atau ornamen melayang, tidak ada penyinaran volumetrik/proyeksi dari bukaan (disimpan untuk Tahap 10), dan tidak mengklaim ini navigable 3D/WebGL mesh. `app/pintu-lab/page.tsx` mengarahkan owner mengecek bukaan 110° dari tampak depan, kiri, kanan. Proporsi Pintu 1, ukiran, floral, molding, motion, bayangan dasar, landing utama `/`, `/jiplak`, orbital tiga pintu, background protected, navbar/brand dan backend tidak diubah.

Affected files: `components/Landing/Pintu/DoorInterior.tsx`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits: `2944ed4a0525a425876a282bd26c0756c7a625c7`, `81cb9c10e26812c394d624341e496dca265d8583`, `11b6d11faa05893038e2176bd281f6a8ca5a00dd`. GitHub Build Validation run `35500038249` pada stage-nine application source head `11b6d11faa05893038e2176bd281f6a8ca5a00dd` **PASS**; visual depth, room contour continuity and side-angle appearance **pending owner screenshot/browser review**. Subsequent documentation commits do not change the validated application source.

---

## 2026-09-20 — Pintu landing navigation: enter through portal, then reveal destination

Owner menetapkan koreografi navigasi yang menghubungkan Pintu dengan halaman sebenarnya. Contoh Digital Invitation: pilih Pintu pada landing → pause orbital dan fokus Pintu pilihan → buka dua daun utuh pada engselnya sementara kusen diam → kamera zoom-in melalui celah menuju interior → URL berganti ke route canonical `/d-invitation` → halaman tujuan muncul sedikit lebih dekat lalu zoom-out lembut sampai skala 1 dan layout awal pas viewport. Terapkan alur identik pada Event Planner `/event-planner` dan Guestbook `/guestbook`; tidak ada navigasi otomatis hanya karena hover/orbit. Zoom out tidak mengubah browser zoom atau memampatkan halaman panjang ke satu layar; page tetap dapat discroll seperti biasa. Rencanakan shared transition overlay/route orchestration yang tidak berkedip, tetap bekerja pada koneksi lambat, back/forward, keyboard/touch, mobile dan prefers-reduced-motion; visual close-up dari foyer 2.5D memerlukan pengujian sebelum mengklaim transisi ruang 3D. Keputusan requirement ditambahkan pada canonical PRD §15.4.2 dan tracker tahap 15 di `pintu3d.md`.

Affected documentation: `prd.md` (requirement dan history), `pintu3d.md` (target UX dan acceptance tahap 15). Commits: `838fac14b844945238ef954e0630c42710e07c57` (canonical requirement), `d3c4ae9418a7a7185cce50a8c82db5beed7d4107` (stage tracker). Validation: dokumentasi saja, belum ada perubahan application source dan tidak mengklaim CI/animasi visual sudah diuji. `/`, `/pintu-lab`, `/jiplak`, destination routes, orbital aktif dan backend tidak diubah. Implementasi transisi navigasi dijadwalkan untuk integrasi Tahap 15 setelah Pintu 1 mendapat review/approval; lighting dan interior diuji lebih dulu pada Tahap 10–13.

---

## 2026-09-20 — Pintu 1 tahap 10: opening-bound ivory–Rose light

Owner meminta melanjutkan implementasi setelah keputusan animasi navigasi Pintu (buka daun → zoom-in melewati kusen → route tujuan → zoom-out halaman). Prioritas visual sekarang tetap Tahap 10 pada preview Pintu 1 terisolasi, bukan perubahan transisi lintas halaman sebelum persetujuan owner.

Tambahkan `components/Landing/Pintu/DoorLighting.tsx` sebagai komponen pencahayaan fixed-scene terpisah. (1) Interior glow hangat ivory–Rose transparan berada di dalam area bukaan pada bidang z=-42 px, tepat di depan foyer z=-44 px, agar interior tetap terbaca dan cahaya terhalang oleh daun yang menutup. (2) Proyeksi lantai singkat di bawah ambang dengan masking trapezoid dan radial fade, tidak berbentuk kotak/balok, menguat sejalan sudut buka dan tidak menggantikan shadow kontak dua daun sebelumnya. Kedua efek harus berada pada opacity 0 saat pintu tertutup 0°, lalu bertambah sesuai bukaan 45°/90°/110°, transisi 1,1 detik dengan easing terkendali; `prefers-reduced-motion` mempersingkatnya. Pisahkan wrapper transform 3D untuk floor tilt dari elemen Motion yang mengubah skala/opacity agar transform lantai tidak ditimpa animasi. `DoorFrame` di `Pintu3DPreview.tsx` meneruskan angleDegrees/reducedMotion ke `DoorLighting` tanpa mengubah engsel, ukuran, ukiran, ornamen, material ataupun mekanisme bukaan existing. Instruksi lab menekankan perbandingan tutup, setengah dan bukaan penuh sambil memeriksa bayangan dan interior. Ini efek lighting CSS 2.5D untuk inspeksi visual, belum hasil rendering volumetrik fisik atau animasi kamera masuk final.

Affected source: `components/Landing/Pintu/DoorLighting.tsx`, `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`; docs: `pintu3d.md`, `prd.md`. Source commits `e26056121d0b5853038c9f6f196cc9c084b42934`, `a6b2699fcf593457d337cdcc9122e0212da46fd5`, `ddc5a503cf09e4f0c4eab75b14aa0afba095e03d`, `204993597d5a2e859c82a055042d641e71efdff7`. GitHub Build Validation run `35500680915` pada stage-ten source head `204993597d5a2e859c82a055042d641e71efdff7` **PASS**; screenshot/video appearance of opening-bound illumination and preserved floor shadow **pending owner review**. Subsequent documentation changes do not modify validated application source. Canonical landing `/`, `/jiplak`, existing orbital, background Rose petals, brand/header and destination routes are not modified; camera zoom and route-transition work still scheduled for Tahap 15.

---

## 2026-09-20 — Pintu 1 ornament direction reset to uploaded reference

Owner mengunggah ulang referensi `pintu1.png` dan menegaskan bahwa kualitas yang dicari terutama ada pada **kusen klasiknya** dan ukiran sederhana/rapi, bukan rose crest besar. Versi sebelumnya dinilai terlalu jauh dari referensi dan masih terasa robotic/kaku. Keputusan desain baru: pertahankan bentuk Pintu, mekanisme buka, engsel, ketebalan daun dan frame 3D yang sudah dianggap OK; revisi hanya bahasa dekoratif menuju crown acanthus di lintel, ornament block kecil pada jamb, tiga hierarki panel daun (tinggi + horizontal kecil + bawah), serta line/ukiran acanthus tipis dengan metal accent rose-gold/champagne. Rose crest besar dihapus dari render.

Implementasi source: `components/Landing/Pintu/DoorClassicOrnament.tsx` baru untuk crown/frame accents dan motif daun sederhana; `DoorMolding.tsx` dirombak agar panel hierarchy lebih dekat referensi; `Pintu3DPreview.tsx` berhenti mengimport/render `DoorRelief` dan `DoorFlorals`, mengganti dengan `LeafPanelOrnaments` + `FrameClassicOrnament`, serta merapikan tiga bidang panel pada daun tanpa menyentuh pivot/engsel/sudut bukaan; `app/pintu-lab/page.tsx` diperbarui untuk meminta review arah baru. File lama `DoorFlorals.tsx` dan `DoorRelief.tsx` masih tersimpan tetapi tidak dirender agar rollback visual tetap mudah sampai owner menyetujui versi baru. Landing canonical `/`, `/jiplak`, orbital, destination routes, rose-petal background dan backend tidak diubah.

Affected commits: `0ba2589516ed153a2c0102a30b5331621bf92077`, `97dcf48b1f5228dadd8d31a784830d54cb871460`, `9103e5c82963881d3a1fdbd75df314c41a6286c9`, `1533fddd82eec2227eaaabf7659687d2fa32e08b`. Validation: GitHub CI **pending observation**; visual match against uploaded `pintu1.png`, perceived liveliness, trim balance and crown proportion **pending owner browser screenshot/review**.

---

## 2026-09-20 — Rebuild V2 Pintu 1 di Three.js: memulai lagi dari mesh yang nyata

Setelah owner membandingkan hasil CSS/SVG dengan referensi `pintu1.png`, owner meminta membuat dari Tahap 1 lagi, memprioritaskan fidelity terhadap gambar asli di atas improvisasi dekorasi, dan mencatat tujuan/proses setiap tahap. PRD canonical §15.4.1a kini mengunci referensi, implementasi Three.js nyata dan 15 tahap V2 di `pintu3d.md`. Eksperimen lama V1 tetap tercatat sebagai riwayat tetapi status persetujuannya tidak diwariskan ke V2.

Implementasi Tahap 1 V2: `components/Landing/Pintu/reference-door-engine.js` membuat fixed frame dan masing-masing daun dengan mesh volumetrik BoxGeometry berketebalan, pivot `THREE.Group` di jamb luar, baseline panel tiga tingkat, engsel/handle awal dan lantai yang menerima shadow; `reference-door-engine.d.ts` mengetik API setAngle/setView/dispose; `ReferenceDoorPreview.tsx` lazy-load engine di client dengan kontrol bukaan 0°/45°/90°/110°, sudut depan/kiri/kanan, fallback jika WebGL2 tidak ada, serta foto `/pintu1.png` sebagai pembanding tersendiri; `app/pintu-lab/page.tsx` mengaktifkan V2 dan `app/pintu-lab/css/page.tsx` menyimpan V1. Detail crown/pilaster sculpt dan akurasi ukiran belum diselesaikan pada baseline Tahap 1; tidak mengklaim preview geometri awal sudah tampak identik dengan foto. Landing `/`, `/jiplak`, protected rose petals, brand wordmark, route produk, dan backend tidak diubah.

Affected files: `reference-door-engine.js`, `reference-door-engine.d.ts`, `ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`, `app/pintu-lab/css/page.tsx`, `pintu3d.md`, `prd.md`, `AGENTS.md`. Source commits: `937f64807634e92354bba2d018a56bdc71494cf7`, `171a24539bcdfee4bd1f2d245f277b03553d361d`, `f1f0f211dbdcf231de64d4732aedbb6f38502395`, `f3fa64d6085f468482f15e093c179992e379f607`, `2cd3317f37c7a47e3614dc12f12827001bc24335`. Validation: GitHub Build Validation run `35510014386` on initial application-source head `2cd3317f37c7a47e3614dc12f12827001bc24335` **PASS**; direct WebGL runtime screenshots, actual 0°–110° opening and comparison to uploaded reference **pending owner browser review**. Subsequent source patch `43fe7b4583f4715922fac2bf0f861dd5b8c53d9b` removes the flat back wall and leaves the doorway genuinely open until an actual room is built in V2 stage 9; GitHub Build Validation run `35510120080` for that patch **PASS**.

---

## 2026-09-20 — Rebuild V2 Pintu 1 Tahap 2: siluet kusen referensi

Owner memberi [Hubtown](https://hubtown.co.in/) sebagai acuan rasa untuk box/scene utama dan animasi spasial Pintu pada hasil akhir, lalu meminta melanjutkan Tahap 2. Referensi itu dicatat sebagai arah Tahap 11–15: Pintu harus menjadi objek WebGL utama dengan perspektif, kedalaman dan pergerakan kamera, bukan kartu/gambar 2D; branding, asset, arsitektur dan copy Hubtown tidak disalin. Inspeksi mengonfirmasi runtime Three.js/WebGL pada situs referensi, tetapi kanvas tidak dapat dirender oleh browser inspeksi sehingga detail timing animasinya masih memerlukan penilaian dari browser owner.

Tahap 2 mengganti frame blok awal di `components/Landing/Pintu/reference-door-engine.js` dengan geometri tetap ber-bevel: pilaster mempunyai shaft cekung, reed, plinth dan capital bertingkat; lintel menjadi cornice lima lapis; crown mempunyai siluet kurva berketebalan, oval cembung, ring, scroll dasar dan pendant. Semua detail frame tetap berada di `root`, bukan pivot daun, sehingga tidak ikut terbuka. Framing kamera menampung crown yang lebih tinggi sekaligus dua daun pada bukaan 110°. Copy `ReferenceDoorPreview.tsx` dan `app/pintu-lab/page.tsx` diperbarui untuk review Tahap 2. Detail pahatan acanthus tetap dijadwalkan pada Tahap 7; Tahap 2 tidak mengubah daun/panel, pivot, handle, material final, interior, landing `/`, `/jiplak`, orbital, Rose petals, route produk atau backend.

Affected source: `components/Landing/Pintu/reference-door-engine.js`, `components/Landing/Pintu/ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`; docs: `pintu3d.md`, `prd.md`. Source commit: `41d19feaa55c15377efae3fb226cacbda708410e`; merged to `main` via PR #53. Validation observed locally: engine syntax check **PASS**; targeted ESLint **PASS**; Next.js production build **PASS** (54 static pages generated). GitHub Build Validation run `35511261204` pada branch head `6ad7a004d38485239a8159b040066e80a1be5a52` **PASS**. Owner WebGL screenshot/review tetap **pending**; build bukan visual approval.

---

## 2026-09-20 — Rebuild V2 Pintu 1 Tahap 3: bentuk dan profil dua daun

Tahap 3 menyempurnakan daun pintu tanpa mengubah kusen/crown Tahap 2. Slab tiap daun sekarang memakai `ExtrudeGeometry` ber-bevel dan ketebalan 0,22 unit. Lebar/posisi daun dikoreksi untuk menghasilkan celah tengah sempit tanpa intersection; meeting stile dan hinge-edge profile tetap terlihat dari sudut miring. Hierarki referensi diterapkan sebagai panel tinggi atas, panel horizontal kecil dan panel bawah. Masing-masing memiliki recessed field serta dua tingkat molding ber-bevel. Versi profil yang lebih tenang juga dipasang pada sisi belakang agar daun tetap terbaca sebagai volume ketika dibuka sampai 110°. Seluruh geometri daun dan panel tetap menjadi anak satu pivot per jamb; frame, crown, mekanisme sudut, landing `/`, `/jiplak`, orbital, Rose petals, route produk dan backend tidak berubah.

Tahap ini belum menambahkan acanthus/corner carving, hardware presisi atau material final: engsel/handle diselesaikan pada Tahap 4, material pada Tahap 5 dan relief pada Tahap 6. Copy `ReferenceDoorPreview.tsx` serta `app/pintu-lab/page.tsx` diperbarui untuk meninjau celah, bevel, tiga panel, ketebalan dan sisi belakang.

Affected source: `components/Landing/Pintu/reference-door-engine.js`, `components/Landing/Pintu/ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`; docs: `pintu3d.md`, `prd.md`. Source commit GitHub: `e6ab1491453b02f0e8703e114fb77a7df2358393`. Validation observed locally: engine syntax check **PASS**; targeted ESLint **PASS**; Next.js production build **PASS** (54 static pages generated). GitHub Build Validation run `35511726454` pada branch head `c3d6a553ae7762a398cb40fec80ecdb8647cf12c` **PASS**; PR #54 merged ke `main` sebagai `905134d93ae1df4991001fd1a964e3a1fbfd135d`. Setelah owner melaporkan deprecation warning browser `THREE.PCFSoftShadowMap`, renderer diubah ke `THREE.PCFShadowMap` yang masih didukung pada fix `626d71a7fb13c44dd3e80ecff52ce923daf90cd4`; syntax check, targeted ESLint dan production build 54 halaman kembali **PASS**. Owner visual review tetap **pending**; jangan menganggap build sebagai fidelity approval.


---

## 2026-09-20 — Rebuild V2 Pintu 1 Tahap 4: engsel terartikulasi dan pegangan panjang

Tahap 4 dipecah menjadi sub-pekerjaan mekanik agar mudah diperiksa tanpa mengubah tahap desain: (a) pin, dua knuckle luar serta pelat jamb pada kusen diam, (b) knuckle tengah, bridge dan pelat daun yang bergerak utuh pada pivot, (c) sepasang backplate dan pegangan panjang ber-volume dari `LatheGeometry` lengkap dudukan/collar/finial, (d) uji build serta screenshot bukaan 0°/45°/90°/110° dari depan/kiri/kanan. Sumbu barrel berada pada sumbu pivot sesungguhnya `x=±2.30, z=0.34`, sehingga engsel daun tidak lagi ikut membawa seluruh barrel menjauh dari jamb seperti baseline Tahap 3. Perangkat keras dibuat dengan mesh Three.js, tidak memakai SVG/box placeholder sebagai pegangan final.

Berkas: `components/Landing/Pintu/reference-door-hardware.js` (baru), `reference-door-engine.js`, `ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Source commits `de755ca3`, `bcc8e0cc`, `517dde85`, `48b7f59c`, `38690fb6`. Bentuk kusen/crown, panel daun, kamera, pencahayaan, logo/brand, landing utama `/`, CSS lab legacy, orbital, Rose petals, route produk dan backend tidak diubah. Warna metal masih material sementara sampai Tahap 5; motif ukiran rinci pada hardware di Tahap 8 dan bukan diklaim selesai pada Tahap 4.

**Validation teramati:** GitHub Build Validation run `35513144853` pada PR source head `768a3ba1e37ac0cb26984afce707eb7890962ab6` **PASS** (termasuk Next.js build). PR #56 merged ke `main` dengan squash commit `bc940b7557c00fe685cf84ed1de83a389c683383`. Fidelity visual dan bukaan nyata di browser masih menunggu screenshot/review owner; build bukan persetujuan bentuk.


---

## 2026-09-20 — Pintu 1 V2 Tahap 5–10: satin paint, sculpt geometry, actual foyer and opening light

Setelah Tahap 4 merged, lanjut pengerjaan terisolasi di `/pintu-lab` secara sub-tahap. Stage 5: cat pintu satin Rose/ivory-blush (`MeshStandardMaterial`, roughness tinggi), metal champagne terbatas pada hardware dan accent relief. Stage 6: ornamen acanthus bersifat volume nyata (`ExtrudeGeometry`/beveled dan `TubeGeometry`) pada panel tinggi, strip tengah dan panel bawah, semuanya melekat pada pivot daun masing-masing; tidak menggunakan rose flower crest/SVG facade. Stage 7: detail crown acanthus kiri/kanan di `root` tetap, aksen pilaster kecil, medali oval sebelumnya tetap. Stage 8 parsial: collar dan rivet pegangan; micro-carving/fidelity masih butuh review visual. Stage 9: lorong foyer 3D dari dinding/atap coffered/lantai/sambungan/pilaster jauh sehingga belakang pintu bukan persegi hitam. Stage 10: fill/key natural dan spot ambang yang intensitasnya mengikuti sudut buka dan mati saat tertutup, tanpa glow plane. Stage 12–13: penataan lab lebih mudah diperiksa di mobile, pixel ratio adaptif, satu context canvas, dan pembenahan pemulihan RAF setelah tab tersembunyi. Tidak ada kamera terbang/route transition atau publikasi Pintu ke landing: dua hal itu tetap di tahap 14–15 setelah visual approval.

Affected source: `components/Landing/Pintu/reference-door-engine.js`, `reference-door-hardware.js`, `reference-door-ornaments.js` (baru), `reference-door-interior.js` (baru), `reference-door-lighting.js` (baru), `ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`; docs: `pintu3d.md`, `prd.md`. Source changes in branch `feat/pintu-v2-stage5-10-sculpt-scene`. **Validation teramati:** GitHub Build Validation run `35513693995` pada source head `9aea4735d189e2c4dfd7bf99c773601324dafce8` **PASS**; PR #57 merged ke `main` sebagai `5e7727ca0866922015ee28e5e789cc2e4928d9b9`. Browser visual fidelity, clipping dan performance masih pending owner. Perubahan teknis bukan klaim 100% identik dengan foto.


---

## 2026-09-20 — Pintu V2: eksperimen kamera mendekat (khusus lab)

Tambahkan `setApproach` ke engine Three.js dan kontrol `Uji masuk ruang`/`Kembali ke depan` pada `/pintu-lab`. Dua daun menuju 110° dan kamera bergerak melalui bukaan hanya setelah sudut tersebut hampir tercapai; pengujian mengukur perspektif foyer volumetrik dan clipping pada posisi dekat. Posisi kamera akhir `z=-4.2` relatif ke `root`, kembali ke komposisi responsif awal. Kontrol sudut terkunci selama kamera bergerak/berada dalam foyer. `prefers-reduced-motion` didukung; status perubahan dapat diakses keyboard/screen reader.

Affected: `components/Landing/Pintu/reference-door-engine.js`, `reference-door-engine.d.ts`, `ReferenceDoorPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`. Branch `feat/pintu-v2-portal-lab-audit`. Lab proof ini **bukan** implementasi stage 15 final, tidak mengubah navigasi `/`/orbital, dan tidak berarti owner telah menyetujui bentuk Pintu 1. GitHub Build Validation run `35513915374` pada PR #58 source head `5bc70d12c82cfd110c2d0e3922a055c194b81925` **PASS**; PR #58 merged sebagai `c5691e53e5033ecdd0ba7716293ddd17c3e0f7e5`. Browser/WebGL visual review tetap **pending**.


---

## 2026-09-20 — Pintu V2 Tahap 11/13: ekspor screenshot dan pulihkan WebGL (lab)

Lab menyediakan tombol ekspor satu frame WebGL PNG dengan label sudut bukaan, kamera, dan posisi masuk untuk dibandingkan dengan referensi `public/pintu1.png`. Engine mendengar `webglcontextlost`, menghentikan rAF dan mengirim status pemulihan; ketika `webglcontextrestored` terjadi, mempertahankan sudut/posisi dan meminta render baru, serta membersihkan listener saat unmount. Ekspor dilakukan hanya saat user mengklik, sehingga tidak menyalakan `preserveDrawingBuffer` terus-menerus. UI menunjukkan fallback screenshot perangkat ketika ekspor tidak tersedia. Affected: `reference-door-engine.js`, `reference-door-engine.d.ts`, `ReferenceDoorPreview.tsx`, `pintu3d.md`, `prd.md`. Branch `feat/pintu-v2-stage13-context-audit`. **CI dan uji context-loss/mobile nyata pending saat catatan dibuat; screenshot owner dan fidelity visual juga pending.** Landing utama, orbital dan route produk tetap tidak berubah.

---

## 2026-09-20 — Pintu V2 prototipe Tahap 14–15 (lab terpisah, belum promosi landing)

Owner meminta melanjutkan sampai alur tiga pintu dapat dicoba sebelum review visual akhir. Ekstrak geometri Pintu 1 dari engine lama ke `reference-door-model.js` agar preview satu pintu tetap memakai model dan detail yang sama. Implementasikan tiga instance mesh di **satu** Three.js scene dengan satu renderer dan kamera di route baru `/pintu-lab/orbital` (bukan tiga CSS facade atau tiga konteks WebGL). Variasi layanan hanya mengubah palet Rose dan menggunakan geometri dasar sama; ketepatan Pintu 2/3 masih perlu review visual. Orbit bergerak, pause saat hover/pilih, dan keyboard/touch bisa memilih pintu. Tombol Masuk memusatkan pintu, membuka dua daun lalu kamera melintas melewati kusen; callback masuk memicu navigasi Next Router ke `/event-planner`, `/d-invitation` atau `/guestbook`. Penanda sessionStorage satu kali pakai membuat container halaman tujuan zoom-out ke skala 1; direct links dan Back tidak replay. Reduced motion dan fallback normal links disediakan. Percobaan ini **tidak** mengubah landing canonical `/`, `/jiplak`, rose petals, dashboard atau backend; promosi ke landing tetap menunggu fidelity `public/pintu1.png` yang disetujui owner.

Changed files: `components/Landing/Pintu/reference-door-model.js` (baru), `reference-door-engine.js` (refactor), `reference-door-orbital-engine.js` (baru), `reference-door-engine.d.ts`, `ReferenceDoorOrbitalPreview.tsx` (baru), `app/pintu-lab/orbital/page.tsx` (baru), `app/pintu-lab/page.tsx`, `components/Layout/PublicAtmosphere.tsx`, `app/globals.css`, `pintu3d.md`, `prd.md`. Branch `feat/pintu-v2-orbital-portal-navigation`; GitHub Build Validation run `35515658674` pada PR #60 head `4274991f9f1def959af4332f48b36c0a3dca48ee` **PASS** dan squash-merge `main` `4c9530f207c058fd6610e5236abbbe8644b1227f` teramati. Screenshot WebGL perangkat nyata, visual fidelity owner, clipping, dan audit performa desktop/mobile **belum terverifikasi**; landing `/` tidak dipromosikan.


---

## 2026-09-21 — Pintu V2: relief surface contact and pinned orbital choice

Physical geometry correction: `reference-door-ornaments.js` re-seats the procedural panel/crown acanthus, vines and small raised details so their backs intersect the leaf inset/crown/capital/base mesh faces rather than float visibly in front of the structure. Contact depths are relative to each solid's actual front surface; outer shape, three-panel hierarchy and pivots remain unchanged. Orbital interaction fix: choosing a service pins its selected door when pointer leaves the canvas; `Putar lagi` explicitly resumes rotation. `reference-door-orbital-engine.js` caps GPU redraw target at 30 fps desktop / 24 fps mobile while retaining browser RAF input and reduced-motion behavior; no measured performance numbers claimed. `ReferenceDoorOrbitalPreview.tsx` shows the explicit action. Docs updated in `pintu3d.md` and Appendix A of `prd.md`. Branch `fix/pintu-v2-relief-contact-orbital-frame-budget`. Build/CI and actual screenshot visual review pending at initial documentation; retain isolated `/pintu-lab` and `/pintu-lab/orbital` — main landing stays unchanged until visual approval.


**Validation setelah merge (21 September 2026):** GitHub Build Validation run `35548795364` pada source head `251e838bdf5640773aa01ad6d18a9886e5e1a2b1` **PASS** (Next.js TypeScript/build). Dua run awal untuk PR #62 gagal TypeScript karena `OrbitalDoorControls` belum memuat method `resume`; kontrak `reference-door-orbital-engine.d.ts` disinkronkan sebelum run lulus. PR #62 merged ke `main` sebagai `98cede6f51220106b72c85522555516b1ffffd34`, dokumentasi status diperbarui commit `360438f1ecf8b9354ca1647cf39978299eec653c`. **Screenshot browser, visual fidelity terhadap `pintu1.png`, FPS aktual dan uji perangkat nyata masih pending; CI bukan bukti persetujuan visual.**


---

## 2026-09-21 — Pintu V2: screenshot owner menyatakan bentuk belum sesuai referensi

Owner memperlihatkan screenshot nyata `/pintu-lab` dengan Pintu 1 tertutup tampak depan. Model menunjukkan mahkota torus/loop besar, ornamen leaf yang tampak seperti tempelan/kelopak terang, frame/panel terkesan mainan, pencahayaan terlalu terang sehingga shading hilang, dan foto asli berukuran tidak sebanding dengan viewport 3D. Screenshot **membuktikan visual Pintu 1 belum approved**, bukan sekadar screenshot pending. Tugas tahap 11 perlu koreksi bentuk sebelum replikasi atau promosi landing dianggap siap; gambar 45°–110° dan orbital belum diuji visual.

Perbaikan di branch `fix/pintu-v2-reference-screenshot-crown-lighting`: buat `reference-door-crown.js` crest acanthus kecil ber-volume yang menyatu dengan cornice, mengganti oval ring serta torus loop besar dengan bead oval klasik kecil; sederhanakan flourish `reference-door-ornaments.js` menjadi ukiran tipis terikat pada panel/pilaster; set ulang material Rose/ivory yang lebih kalem pada `reference-door-model.js` (cornice lima shelf tebal dikompresi menjadi tiga profil ramping), penurunan intensitas key/fill/spill/foyer melalui `reference-door-lighting.js`, `reference-door-interior.js`, dan exposure renderer di `reference-door-engine.js`/`reference-door-orbital-engine.js`; komposisi `ReferenceDoorPreview.tsx` mengukur foto asli dan 3D pada viewport setara. Dokumentasi status visual di `pintu3d.md`. Semua perubahan di lab dan shared model; tidak mengubah landing utama `/`, `/jiplak`, protected rose petals, produk, atau database. **CI dan hasil screenshot browser setelah patch belum diamati pada saat entry ditulis**; jangan menganggap perbaikan geometris ini sebagai persetujuan visual.


**Validation hasil revisi (21 September 2026):** GitHub Build Validation run `35549463327` pada PR #63 head `e36fc8c3a7dabaec37f365559096023bf983fadc` **PASS**, termasuk production build Next.js; PR #63 squash-merged ke `main` sebagai `da8aa8b973caa8b9527a3568410320daec8e7b8f`. `pintu3d.md` status validation diperbarui commit `e471ca939238f3b3bb2325aafea05900653faaa8`. Screenshot owner pada versi **sebelum** patch membuktikan fidelity visual gagal; screenshot setelah patch belum teramati. **Jangan menyatakan bentuk final/approved hanya dari CI.**


---

## 2026-09-21 — Pintu 1: GLB asset-first, cat Rose–ivory dan cahaya di kaki pintu

Owner memilih mengutamakan model GLB AI yang telah dibuat daripada terus mengukir Pintu 1 secara procedural. Pemeriksaan GitHub `main` hanya menemukan `public/white_mesh.glb` (360.788 byte), belum ada `public/mesh.glb` yang disebut owner sebagai asset lokal; jangan mengklaim file itu telah di-push ke repo. Untuk pratinjau **khusus** `/pintu-lab`, viewer `asset-door-engine.js` mengutamakan `/mesh.glb` jika tersedia di komputer/deployment, dan memuat `/white_mesh.glb` sebagai fallback yang sudah ada di repo. `GLTFLoader` dimuat secara lazy di route lab; ukuran/aset dinormalisasi ke lantai, material asli di-clone untuk mempertahankan texture/normal map bila ada, warna menamai frame/leaf/hardware jika mesh terpisah dan tint blush umum bila semuanya menyatu. Lantai menggunakan material penerima bayangan, sorot hangat pendek dan tekstur radial alpha berukuran kecil hanya di kaki pintu. Kamera depan/kiri/kanan dan PNG capture tersedia. Tidak mengklaim satu mesh fused bisa diwarnai terpisah atau dianimasikan sebagai daun kiri/kanan; tombol bukaan/masuk tidak ditawarkan di mode GLB sampai pivot benar tersedia.

`app/pintu-lab/page.tsx` memakai `AssetDoorPreview.tsx` baru; implementasi procedural semula dipindah tanpa menghapus ke `/pintu-lab/procedural`. `/pintu-lab/orbital`, landing utama `/`, `/jiplak`, font/branding, protected rose petals, layanan, dan backend tetap tidak berubah. Affected code: `components/Landing/Pintu/asset-door-engine.js`, `asset-door-engine.d.ts`, `AssetDoorPreview.tsx`, `app/pintu-lab/page.tsx`, `app/pintu-lab/procedural/page.tsx`; docs: `pintu3d.md`, `prd.md`. Branch `feat/pintu-lab-asset-first-glb-lighting`; **validasi CI dan screenshot GLB setelah perubahan masih pending saat entry dibuat**, jangan menyatakan fidelity visual final.


**Validation observed after merge:** PR #64 source head `c3087d2b550a1684b587bb3b198f3142dac5cef7` passed GitHub Build Validation run `35552089003` (Next.js production build and TypeScript). First run `35552019109` failed typecheck due to a nullable mounting element in `AssetDoorPreview.tsx`; fixed before successful run. Squash merge into `main`: `b57d108121f67337191a0089f75cbb477b4de5d1`. The subsequent `pintu3d.md` validation log was committed separately. Browser screenshot of actual GLB, whether the owner's local `mesh.glb` has been pushed, and visual fidelity remain **unverified**.


---

## 2026-09-21 — Pintu lab: 40k GLB acuan Pintu 1 dengan dua daun yang dibuka dari mesh gabungan

Atas instruksi owner, seluruh implementasi dilakukan langsung di GitHub, tanpa meminta pemilik menempel kode. Inspeksi binary glTF pada sumber GitHub mengonfirmasi `public/40k.glb` berisi 20.000 vertex, 40.000 bidang segitiga, **hanya satu mesh** tanpa nama daun/kusen/handle/rig/animation; `public/20k.glb` juga hanya satu mesh. Ukuran file masing-masing 720.888/360.788 byte. Sebelum revisi renderer belum mengutamakan `40k.glb`. Versi baru memilih `/40k.glb` dahulu dan menyediakan fallbacks 40k bernama lain/`20k.glb`, tanpa menimpa atau meminta owner copy-paste ulang asset yang sudah ada.

`asset-door-segmentation.js` (baru) membagi triangle asli melalui clipping bidang XY menjadi bagian crown+jamb tetap dan dua daun bergerak yang melekat ke engsel `THREE.Group` pada sisi luar. Fragmen potongan di luar area daun tetap disimpan agar model tidak hilang sebagian. `asset-door-engine.js` menggunakan model sumber dari GLTFLoader, menggerakkan pivot daun 0°/45°/90°/110°, memberi material `MeshPhysicalMaterial` dusty Rose/ivory-blush reference-oriented dengan cat satin dan highlight relief terkendali tanpa menambah ikon ornament procedural, serta studio `RoomEnvironment` dan spotlight/glow sempit tepat di kaki pintu. `asset-door-engine.d.ts` dan `AssetDoorPreview.tsx` mengaktifkan kembali kontrol bukaan dan menampilkan sumber GLB aktif. Jalur procedural tetap di `/pintu-lab/procedural`; landing `/`, `/jiplak`, `/pintu-lab/orbital`, dan backend tidak diubah.

**Batasan dan risiko yang diketahui:** split otomatis melalui geometri tunggal dapat melintas pahatan, trim, dan handle serta meninggalkan bukaan tepi belum memiliki cap sidewall; ini bukan rig presisi hasil Blender. Kenaikan budget dari 20k ke 40k hanya membuktikan detail mesh lebih banyak, bukan secara otomatis fidelity foto lebih tinggi. Evaluasi kemiripan warna/ukiran/bukaan nyata dari screenshot owner dari tiga sudut masih diperlukan. Pada saat catatan dibuat, GitHub CI dan visual WebGL hasil revisi **belum diamati**; jangan klaim siap landing atau 100% cocok dengan `public/pintu1.png`. Files: `components/Landing/Pintu/asset-door-segmentation.js` (baru), `asset-door-engine.js`, `asset-door-engine.d.ts`, `AssetDoorPreview.tsx`, `pintu3d.md`, `prd.md`. Branch `feat/pintu-40k-reference-surface-hinged-leaves`.


**Validation observed after implementation (21 September 2026):** GitHub Build Validation run `35553230862` on PR #65 head `d0c6e2263ca29d2fb602fa166975f283bf6de11d` **PASS** including Next.js build/TypeScript; PR #65 squash-merged into `main` as `7c6f5a979d72dc2070c80bc553f62d6fcd89c1bc`. Screenshot/WebGL runtime showing actual geometry clipping along jamb, appearance of paint and threshold light, and fidelity to reference are **pending review**; do not call the 40k GLB approved solely from CI.


---

## 2026-09-21 — Pintu 1: koreksi palet frame/daun dan normal pahatan pada GLB 40k

Owner meminta bentuk/ukiran/warna tetap mengikuti referensi `public/pintu1.png`, melakukan coding tanpa copy-paste manual, dan memakai library existing seperlunya. Audit repo memastikan `components/Landing/Pintu/Door40k.tsx` sudah ada sebagai output `gltfjsx` (bukan `40k.jsx`), tetapi hanya merender satu mesh statis `tmp_i7lm6mfply`, bukan tiga part/pivot. Komponen lama mengimpor `@react-three/drei` dan `three-stdlib`, sementara dependensi yang benar-benar tersedia adalah `@react-three/fiber` dan `three`. Komponen JSX dibenahi agar bisa merender model statis via `useLoader(GLTFLoader)` pada Fiber tanpa dependensi tambahan. `/pintu-lab` tetap memakai engine GLTFLoader + `asset-door-segmentation.js` agar animasi dua daun eksperimen yang sudah ada tidak hilang; tidak perlu mengganti seluruh runtime Three.js ke Fiber semata-mata karena JSX generated tersedia.

Perbaikan terbatas pada `asset-door-segmentation.js`: ganti cat frame mauve menjadi ivory–blush, cat daun satu tonal Rose satin, highlight molding kecil hanya pada geometri yang menonjol, dan manfaatkan utilitas Three `toCreasedNormals` untuk menjaga sudut pahatan pada mesh hasil split, bukan menambah ornamen generik. `asset-door-engine.js` mengurangi ambient/fill wash, menajamkan definisi key shadow dan mengecilkan spill cahaya di kaki pintu. `app/pintu-lab/page.tsx` menghapus copy lama yang mengatakan pintu belum dipisah meskipun uji buka–tutup 0–110° sudah tersedia. `pintu3d.md` mencatat batasan sumber GLB: satu mesh tanpa material/rangka daun terpisah, geometri hanya sebanyak yang terdapat pada `40k.glb`, seam clipping bisa memotong ukiran. Ini **koreksi shading dan usability**, bukan klaim setara 1:1 dengan foto atau rig profesional; screenshot depan, kiri/kanan dan bukaan sesudah perubahan masih harus dilihat sebelum approval. Branch `fix/pintu-40k-reference-palette-relief-review`; CI/merge/status screenshot **belum tersedia pada saat entry ditulis**. Landing `/`, `/jiplak`, orbital, rose petals, brand dan backend tidak berubah.


**Validation setelah implementasi (21 September 2026):** GitHub Build Validation run `35556148699` terhadap PR #66 head `3939af7f748bc8cbca9012179486c88ace9b80e9` **PASS**, termasuk Next.js production build/TypeScript. PR #66 squash-merged ke `main` sebagai `e7cad99f26f7dc8cb62462fa29915de1c34291c4`; `pintu3d.md` diperbarui dengan status validasi setelah merge. Bentuk ornamen dalam GLB 40k bersifat tetap dari asset asli, bukan hasil transformasi JSX atau library; silhouette/ukiran 1:1 terhadap foto, shading visual pada browser, serta seam clipping saat daun terbuka tetap perlu dinilai melalui screenshot dari browser owner. Tidak ada klaim fidelity final atau promosi ke landing.


---

## 2026-09-21 — Pintu 1 screenshot regression: model GLB hampir transparan/putih

Screenshot nyata owner di `/pintu-lab` pada 0° menunjukkan foto `pintu1.png` jelas di kiri, tetapi model `40k.glb` kanan hampir tidak terlihat (hanya garis pastel pucat) di atas latar putih; preview tetap melaporkan 3D aktif dan buka–tutup aktif. Ini membuktikan implementasi sebelumnya belum layak dinilai fidelity visualnya, terlepas dari GitHub CI yang sukses. Branch `fix/pintu-40k-invisible-canvas-contrast` menghapus proses pencampuran warna per-vertex dan pass normal `toCreasedNormals` dari geometri hasil clip; sebagai gantinya mesh frame diberi material ivory–blush cukup kontras dan kedua daun dusty Rose satin dengan satu material masing-masing, mempertahankan normals GLB dan tidak menambahkan ukiran palsu. `asset-door-engine.js` memakai latar studio hangat `#ece4e0` hanya di canvas lab dan menurunkan intensitas key/exposure supaya kontras bentuk dapat dinilai terhadap foto referensi. Tidak mengubah GLB asli, pivot 0–110°, landing `/`, `/jiplak`, orbital, layanan atau backend. Tujuan tahap ini membuat geometri benar-benar terbaca lagi, **bukan klaim ukiran/warna sudah identik 1:1**; screenshot baru desktop/mobile dan inspection seam saat dibuka diperlukan. Affected: `asset-door-segmentation.js`, `asset-door-engine.js`, `pintu3d.md`, `prd.md`. **CI/merge/screenshot setelah patch belum diamati saat entry dibuat.**


**Validasi sesudah revisi:** GitHub Build Validation run `35557109796` terhadap PR #67 source head `c7a4bcc4003dadf66edfcea1fa6a41435b99b581` **PASS**, termasuk Next.js production build/TypeScript; PR #67 squash-merged ke `main` commit `039089bc22c7cce9b26be1bc07f0ed5f23ac2f4d`. Status tracker `pintu3d.md` diperbarui setelah merge. Screenshot user sebelum fix memperlihatkan model nyaris tak terlihat; screenshot *sesudah* fix belum diamati dan kesamaan terhadap `pintu1.png` belum approved.


---

## 2026-09-21 — Approved landing baseline and documentation lock

Owner confirmed that the final `/pagecontoh` is complete and must be used at `/` unchanged. Homepage promotion commits: `684d50d9f9136086df473f10c09b0f2354b94cbe` (route), `15354ebc44e42fef8f7d599369b22a6254db025d` (avoid duplicate navbar), `fba879a804aee30486d8cc4081c659ef833b39c7` (avoid duplicate footer), `dbd8014d554bbac66bc4c3ba4a34b12ceec38cb7` (full-width layout). Documentation commits: `7c49c3240c274ce5a2a5f4bdb8d78a5760b91241` (AGENTS.md), `f9c1612092acc62be72fdae4560a5f65ac0b1dad` (README.md), plus this PRD update. Rationale: preserve the owner's approved appearance and interactions and prevent unsolicited additions/removals or parallel visual systems. Affected: `app/page.tsx`, shared landing layout/chrome, `AGENTS.md`, `README.md`, `prd.md`. Validation: GitHub write operations confirmed; production build, CI, browser visual check, and cross-theme/responsive testing were **not performed** during this documentation update.


---

## 2026-09-22 — Digital Invitation marketing page: framed internal scroll and section reveal

**Owner request:** Tunda revisi transisi Pintu; ubah hanya pengalaman halaman `/d-invitation` agar seluruh konten berada di main frame seperti landing, scroll terjadi di dalam frame, dan section muncul lembut saat di-scroll turun.

**Implementation:** `app/d-invitation/page.tsx` membungkus Hero, fitur, template, Studio CTA, paket, review, dan FAQ dalam frame viewport dengan inner scroll panel dan Motion `whileInView` ber-root panel scroll (`once`, reduced motion supported). Navbar dan compact Footer ditanam di atas/bawah panel frame agar tidak ikut scroll; `components/Layout/Navbar/Navbar.tsx` dan `components/Layout/Footer.tsx` mencegah global chrome ganda hanya pada route ini. Landing `/`, komponen Pintu, dataset/produk, dan API tidak diubah. Keputusan tata letak tercatat pada §15.4 di atas.

**Commits:** `d0bc8bca38005fab5c590d7314f59ee152a5ec5e` (frame, inner scroll, reveals), `187ac2c04b4cd60a2f187ac26e169e1546107253` (embedded navbar tanpa duplikasi), `c26510ce476f85be98104242ac45f662409c6bbf` (embedded footer ringkas tanpa duplikasi), `d272e50152a14f83e08da6c1f87fb5650ee69815` (aturan scroll frame di AGENTS). File: `app/d-invitation/page.tsx`, `components/Layout/Navbar/Navbar.tsx`, `components/Layout/Footer.tsx`, `AGENTS.md`, `prd.md`.

**Validation:** GitHub write berhasil. Build, CI, preview browser, responsive dan screenshot owner **belum dijalankan/diamati** untuk perubahan ini.


---

## 2026-09-22 — Shared marketing music, flowers, wind petals and Instagram

**Permintaan:** Ekstrak musik landing menjadi komponen yang dipakai lintas halaman; gunakan kembali bunga kiri/kanan dan animasi kelopak Rose, serta hadirkan tautan Instagram di kanan bawah pada setiap halaman. Perubahan ditujukan ke surface marketing publik; dashboard/admin, editor, checkout, dan undangan tamu dipisahkan dari dekorasi/audio agar alur kerja serta pengalaman tamu tidak berubah. Landing baseline harus mempertahankan asset/animasi asli, dan pekerjaan transisi Pintu tidak dilanjutkan dalam perubahan ini.

**Implementasi:** Tambah `MarketingAudioProvider` (satu `Audio` persisten melalui navigasi client, play/pause/volume, browser autoplay fallback pada gesture, pause di luar marketing dan manual mute dihormati), `MarketingAudioControls`, `MarketingInstagramLink`, `MarketingFrameFooter`, `MarketingFloatingControls`, `PublicMarketingAtmosphere`, serta route predicate `isMarketingPath`. `app/pagecontoh/page.tsx` memakai komponen bersama sebagai pengganti blok audio/Instagram inline tanpa mengubah Pintu, gambar bunga, kelopak, posisi frame atau copy. `app/d-invitation/page.tsx` memakai bunga, kelopak dan frame footer sama. `PublicAtmosphere` menampilkan layer yang sama hanya sekali pada marketing page lain; versi `RosePetalBackground` lama tetap tidak diubah bagi route unrelated. Root layout meng-host player sekali dan floating controls pada halaman marketing tanpa main frame.

**File:** `lib/marketing-paths.ts`, `components/Layout/PublicMarketingAtmosphere.tsx`, `components/Layout/MarketingAudio.tsx`, `components/Layout/MarketingFrameFooter.tsx`, `components/Layout/MarketingFloatingControls.tsx`, `app/layout.tsx`, `app/pagecontoh/page.tsx`, `app/d-invitation/page.tsx`, `components/Layout/PublicAtmosphere.tsx`, `AGENTS.md`, `prd.md`.

**Commits:** `e62d10156a3588104898b5d92cfd377bb7dbebb6`, `82e6d8e9a12367858b63ef4acedd6de7b45f24fd`, `4e5611287a5f8e892e82f8222918d9cf0f0a2e96`, `05558464820ceba8a29bddb9646b8cad326fe164`, `c612a848e0fad66e931aee372f410dc6ee8a597d`, `c6bd8ee820837d0dd27864433fe8a7432b9a8804`, `d68363d81a996217394703b281e58c4a3f7b4a0d`, `a0fdfb4c97a97d96ec75938a1e4cd0d7aa84213d`, `ff3d10fbe88562d945629827c9bfc4f5b551de4e`, `9179e7afadc1fd63f51d9449ac3488af2ab07200`, `807631bfd7a72431f84638e0848ffde1434801e1`.

**Validasi:** Penulisan ke GitHub berhasil; build, CI, browser preview, screenshot/penilaian visual dan tes cross-route sesudah perubahan belum dijalankan/diamati. Browser dapat menolak autoplay sampai interaksi pertama; ini tidak boleh dipresentasikan sebagai bug player atau klaim autoplay selalu berhasil.


---

## 2026-09-22 — Digital Invitation hero: tall phone and wider text composition

**Intent:** Owner melihat mockup smartphone pada Hero `/d-invitation` terlalu lebar seperti tablet, sementara kolom tulisan terasa sempit. Pertahankan isi undangan, animasi scroll dan arrival, serta main frame; ubah hanya rasio dan komposisi hero.

**Implementation:** Pada `components/DigitalInvitation/HeroSection.tsx`, mockup dari max-width 430px / aspect-ratio 0.68 menjadi max-width 340px / aspect-ratio 9:19.5 agar lebih tinggi dan ramping; kolom desktop dari 0.92fr:1.08fr menjadi 1.18fr:0.82fr, menghapus batas sempit text wrapper dan memperlebar max-width heading/description. Responsive width tetap dibatasi oleh container; Pintu, landing, section lain, dataset dan API tidak disentuh. Keputusan proporsi dicatat di §15.4 dan `AGENTS.md`.

**Commits:** `0fff90d0bb1fb4353f0927475754e9cfa48d6ec8` (hero proportions), `1f151eeb14849b36e211135e3b41ca47ef00d14c` (agent rules). Files: `components/DigitalInvitation/HeroSection.tsx`, `AGENTS.md`, `prd.md`.

**Validation:** GitHub update berhasil; build, CI, browser preview, screenshot mobile/desktop **belum dijalankan atau diamati** untuk perubahan ini.


---

## 2026-09-22 — Digital Invitation hero: center the copy and phone together

**Request / rationale:** Owner ingin tulisan dan mockup HP lebih saling mendekat ke tengah pada Hero `/d-invitation`, tanpa mengubah rasio smartphone maupun konten/animasi yang sudah ada.

**Implementation:** Batasi lebar grid hero desktop ke `max-w-[1080px]`, pusatkan dengan `mx-auto`, dan rapatkan gap antar-kolom dari `lg:gap-12` menjadi `lg:gap-8`. Grid tetap 1.18fr:0.82fr, phone tetap 340px/9:19.5, dan layout mobile tetap satu kolom. File: `components/DigitalInvitation/HeroSection.tsx`, `AGENTS.md`, `prd.md`. Landing `/`, transisi Pintu, mockup content, audio, footer, dan section lain tidak diubah.

**Commits:** `31855c90a5252587188c119c84c88cc23a0a801a` (hero alignment); `3cefddecfc2b40f547e28815043ea5b0f465e9fb` (agent convention).

**Validation:** GitHub update confirmed; build, CI, browser rendering, responsive screenshot belum dijalankan/diamati untuk edit ini.


---

## 2026-09-22 — Digital Invitation hero: loosen over-centered columns

**Owner feedback:** Penempatan copy dan HP setelah perubahan 1080px/32px terlalu rapat ke tengah. Lebarkan area hero menjadi max-width 1200px dan naikkan gap desktop dari 32px ke 40px; pertahankan grid 1.18fr:0.82fr, rasio HP 9:19.5 dan lebar maksimum HP 340px, serta perilaku mobile. Hanya `components/DigitalInvitation/HeroSection.tsx` yang diubah secara visual; aturan terkait diperbarui di `AGENTS.md` dan canonical §15.4 `prd.md`. Landing, Pintu, frame, dan section lain tidak disentuh.

**Commits:** `48d5b3041e222c6ab94354288d9e4952ec1f1eaa` (hero spacing), `fca5d7b2508e814d43f84c9e60860e6d10fa44a7` (agent note).

**Validation:** GitHub write berhasil; build/CI/preview visual belum dijalankan atau diamati untuk perubahan ini.


---

## 2026-09-22 — Hero minor position nudge only

**Owner request:** Geser teks Hero `/d-invitation` sedikit ke kiri dan mockup HP sedikit ke kanan tanpa mengubah hal lain.

**Implementation:** Hanya `components/DigitalInvitation/HeroSection.tsx` diubah secara visual: tambahkan `lg:-translate-x-4` ke wrapper copy dan `lg:translate-x-4` ke wrapper HP (masing-masing 16px, desktop saja). Ukuran grid, gap, font, rasio HP, konten, animasi kedatangan HP, frame, serta perilaku mobile tetap sama. Commit: `e7a30f5fda7b3c6cd0001991c36e03a43a2ee53e`.

**Validation:** GitHub write berhasil; build/CI/browser preview belum dijalankan.


---

## 2026-09-22 — Digital Invitation: one divider below Hero

**Owner feedback:** Dua garis horizontal terlihat antara Hero dan section Fitur di `/d-invitation`. Hero memakai `border-b`, sementara Fitur memakai `border-y`, sehingga dua border terlihat terpisah karena spacing section.

**Change:** Hapus hanya `border-b border-border/70` dari section Hero di `components/DigitalInvitation/HeroSection.tsx`. Pertahankan border atas Fitur sebagai satu-satunya garis pemisah, border bawah Fitur, spacing, tata letak, HP, animasi, dan semua section lain. Commit: `12d6fef5218d4b9ab179a755ab50e49d6cec31fd`.

**Validation:** GitHub write berhasil; build/CI/preview browser belum dijalankan.


---

## 2026-09-22 — Romantic Rose photo-driven invitation template

**Request:** Satu template undangan wedding lengkap dengan amplop digital sebelum Cover, 13 bagian section, personal wedding photos, dan satu data/feature engine yang reuse untuk setiap event.

**Implementation:** Menambah satu template presentation `components/PublicInvitation/RomanticRoseTemplate.tsx` dengan manifest/capabilities dan amplop pembuka; galeri dari `InvitationAsset`, cover dapat dipilih dari aset milik event di Studio, foto kedua/ketiga sebagai foto mempelai, countdown, Maps, shared RSVP form, Gift berbasis data event, dan optional-section visibility yang sama di Studio/public. Registrasi katalog, preset Studio, live canvas, dan route publik/route personal invitation disambungkan tanpa backend/database baru. Wishes sengaja tidak mengirim/mengarang data karena shared Wishes API belum tersedia. File yang berubah: `components/PublicInvitation/RomanticRoseTemplate.tsx`, `lib/templates/catalog.ts`, `components/InvitationStudio/designer-config.ts`, `components/InvitationStudio/InvitationPreview.tsx`, `components/InvitationStudio/DesignerPanels.tsx`, `components/InvitationStudio/InvitationDesigner.tsx`, `app/invite/[slug]/page.tsx`, `app/invite/[slug]/[eventSlug]/page.tsx`, `app/invite/[slug]/p/[token]/page.tsx`, dan `prd.md`. Tidak mengubah marketing `/d-invitation`, halaman utama, maupun Pintu.

**Commits:** `9182dd2100e011f5cf843ae0a18d0a76ac839492` (template), `b2d129caa3734436af244bda02a327223efeb880` (catalog), `dc0b3dbde93429d96e82af3520683aeaec56008f` (preset), `0e322d20e1af17f2af9967b7fb32f125bd55fa3a` / `c97d1765431f125d31b850d62077062f46ecbe58` / `4022c0a82cd7892c97a12d964d719c0a2b3d932e` (public routes), `8eca305e26fcfa59cf4febabe60b02ed9849368e` (canvas), `485f9fdeae944134a8f2d30f97012108a56d3d0e` / `fd1436a289516e29ec3d08298a246d1423fb7027` (photo picker and wiring).

**Validation:** GitHub writes confirmed; CI build was in progress at documentation time. Browser/device visual QA and shared Wishes implementation not completed.


---

## 2026-09-22 — /template-design menampilkan template yang benar-benar ada

**Permintaan:** Galeri di `http://localhost:3000/template-design` harus memperlihatkan desain undangan yang sudah dibuat, bukan delapan kartu mock `Tema 167` dan sejenisnya.

**Implementasi:** `data/templates/showcase.ts` sekarang menurunkan item dari katalog bawaan `lib/templates/catalog.ts` (7 entri pada perubahan ini). `data/templates/preview-invitation.ts` menyediakan fixture demo terpisah dan tidak menulis/membaca data event pelanggan. `app/template-design/page.tsx` menggantikan kartu gambar stok/tampilan pasangan palsu dengan actual `InvitationPreview` yang lazy-mount berdasarkan IntersectionObserver; modal membuka preview yang bisa discroll, membuka amplop Romantic Rose, dan mencoba toggle RSVP/Wishes/Gift secara lokal. Filter, pencarian, dan pengurutan sekarang menggunakan item katalog nyata. Brand memakai `BrandWordmark`; tombol beralih ke Dashboard untuk membuat acara lebih dulu, bukan membuka Editor tanpa invitationId yang valid. Renderer publik lain yang masih berbeda dengan Studio preview diberi label sebagai preview Studio. Tidak mengubah marketing `/d-invitation`, Pintu atau route undangan publik.

**Files:** `data/templates/showcase.ts`, `data/templates/preview-invitation.ts`, `app/template-design/page.tsx`, `prd.md`.

**Commits:** `2143e800d6d39dc5f8d7135a2056d06b580b3f45` (katalog), `aac8aae2ed5b9698a3e8e7eaa1526ee96017b71e` (demo fixture), `4b02db304f95ca12454761b42e3904ed6649b1a4` (galeri interaktif).

**Validation:** Intermediate commits setelah perubahan tipe katalog gagal pada TypeScript karena page lama masih memakai field `id/status/image`; setelah page diubah, build final perlu diperiksa dari GitHub Actions. Belum ada browser/visual QA di localhost oleh agent ini.


---

## 2026-09-22 — Unified public/Studio invitation template catalog

**Owner request:** Galeri `/template-design`, koleksi di `/d-invitation`, dan pilihan di Invitation Studio harus sinkron tanpa mengulang hard-coded daftar; pengunjung tanpa login dapat preview tetapi tidak bisa masuk Studio.

**Implementation:** Satu manifest built-in `lib/templates/catalog.ts` sekarang memegang kategori, tipe preview, serta Studio preset. `data/templates/showcase.ts` dan `components/InvitationStudio/designer-config.ts` menurunkan data tersebut dari manifest, bukan menyalin daftar per halaman. Endpoint `/api/templates` menyatukan ready built-ins dengan entri designer `PUBLISHED` yang ditandai `ready:false` sebagai image-preview-only (tidak mengirim path/ZIP template). Shared client hook `lib/templates/use-template-catalog.ts` memberi daftar yang sama ke `/template-design`, `components/DigitalInvitation/TemplateSection.tsx`, dan Studio. Marketing menampilkan lazy real template thumbnails dari `components/Templates/TemplateGalleryCanvas.tsx` serta deep link ke galeri publik `?template=...`; galeri membuka preview pilihan. Upload designer dipamerkan otomatis setelah publish, termasuk pada daftar Studio sebagai item nonaktif, namun tidak bisa dipilih sampai memiliki renderer yang sudah terdaftar. `components/DigitalInvitation/StudioSection.tsx` diarahkan ke `/dashboard` (bukan editor tanpa event), dan existing `app/dashboard/layout.tsx` serta `app/dashboard/editor/page.tsx` tetap menjadi otorisasi sesi server-side. Pintu, landing, sistem pembayaran/DB undangan, dan halaman undangan tamu tidak berubah.

**Files:** `lib/templates/catalog.ts`, `components/InvitationStudio/designer-config.ts`, `data/templates/showcase.ts`, `app/api/templates/route.ts`, `lib/templates/use-template-catalog.ts`, `components/InvitationStudio/DesignerPanels.tsx`, `components/InvitationStudio/InvitationDesigner.tsx`, `app/template-design/page.tsx`, `components/Templates/TemplateGalleryCanvas.tsx`, `components/DigitalInvitation/TemplateSection.tsx`, `components/DigitalInvitation/StudioSection.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Key code commits:** `7c7f75e1ff91d9928e0e2d57da689fdfe576c9aa` (manifest), `a63f226f999c76f56ce8ac18d05f2e258010dbbb` (API), `739ee5e7bf0a757f1f797d88e80d64d3f161eb0b` (hook), `65bf92813f9141d74e1450bd39fe69525d7fdf99` (Studio), `41149a31c7653cdb7b48741ddd3c98673ac60098` (public gallery), `2c92cff8b2c0010e5fe02810719aec29638001c6` (shared thumbnails), `9c45787cf1847c4aaf9fc437e962188bc02ea46e` (marketing), `aedf6d0315e040d6c3e9fd86c89e6722394f5b07` (deep link), `9febfe93e691acea4204f55ef65b13354d22916e` (auth-first CTA).

**Validation:** Intermediate partial commits may fail while consumers migrate to the new catalog shape; check GitHub Actions result for the latest combined commit. No local browser visual QA was run by this agent.


**Follow-up in this implementation:** `components/InvitationStudio/DesignerPanels.tsx` now displays published designer submissions as disabled preview-only entries, and `InvitationDesigner.tsx` feeds the full catalog to that panel while selecting only ready entries. The thumbnail on public gallery and marketing uses an inert, non-interactive mini canvas with an external overlay click target, avoiding nested interactive controls. Commits: `303c36c2b27db8f779fdefeec0fadb4a8b3635e4`, `1ef1ffa55c3cdf42c339b35afe29b755834fbafd`, `da50a8a99e51865a9c67a4d9fdd812002833a624`, `f96e2c761803deab80840f16045fcefe95470cea`, `acb44e45cc573b025d93e000e1edf660bd34ee00`.


---

## 2026-09-22 — Shared Studio photo library, reusable photo slots and automatic WebP

**Owner request:** Terapkan upload foto sekali + penempatan cover/mempelai/galeri yang reusable antartemplate dengan klik foto di canvas, tanpa memaksakan layout yang sama ke semua desain. Semua image baru dikonversi menjadi WebP memakai Sharp. Catat aturan agar penambahan template berikutnya tidak membangun ulang UI/upload/business logic.

**Implementation:** `lib/templates/photo-slots.ts` menjadi satu resolver/serializer pilihan aset berdasarkan ID, dengan `cover`, `personOne`, `personTwo`, `gallery`, dan fokus foto top/center/bottom. `InvitationDesignState` menyertakan data assignment persisten di `Invitation.templateKey::photos=` (URI-encoded JSON) tanpa database baru; serializer tetap kompatibel dengan `decor=` dan `sections=` lama. Katalog `lib/templates/catalog.ts` menyatakan dukungan slot per renderer (Romantic Rose mendukung 4 slot; renderer preview generik hanya cover). `PhotoPanel.tsx` menampilkan koleksi + penempatan yang menggunakan `InvitationAsset` event; `InvitationDesigner.tsx` menghubungkan upload, pemilihan aset, pilihan galeri, fokus foto, dan klik canvas untuk buka panel Foto. `InvitationPreview.tsx` dan `RomanticRoseTemplate.tsx` memakai resolver yang sama; `ClassicInvitationTemplate.tsx` memakai cover yang terpilih saat publikasi. Foto per-role Romantic Rose tidak lagi wajib foto pertama/kedua/ketiga, dengan fallback layout lama untuk undangan existing. Server `app/api/invitations/assets/upload/route.ts` tetap memakai Sharp dan kini membatasi input image 40 MP, menyimpan hasil resize/WebP di folder event-specific `/uploads/images/<invitationId>/<uuid>.webp` (tanpa memindahkan file legacy). Designer preview upload `app/api/designer/templates/route.ts` juga dioptimalkan menjadi WebP dengan Sharp. `app/api/invitations/assets/route.ts` menolak pembuatan image URL baru yang tidak melalui konversi server (endpoint audio URL lama tetap). Paket designer, sistem login/payment, marketing/landing, Pintu, dan audio tidak diubah.

**Key code commits:** `bc46a1265f5d488f23f70e2de0a7a49e826bc26e` (photo resolver); `b52fcd32bdfb5a2f5ac5d5c1d3404c9310dc618e` / `54339c4d841e52671a19f3d43ace7a7a77d1c799` (design state); `1212dbf62e56a4d40d43744831d65c22720eadfa` (slot capabilities in catalog); `7b39f23a97fc312c57bf7d0fb370fa9ed626488e` (PhotoPanel); `d19c9e6a61770506f3a03c1a80fcd0869e0ed993` / `c0226c4db12fd09085a5b6616a86cbca3fc126f8` / `84959600862218591a67675ad40dd4e228ec0dc1` (renderers/preview); `a28757c04c8f166d4ebe5a12ad4d1c55db462a20` (Studio wiring); `3cd50d991dff6a6faaef26467adeaa49c7631df8` (invitation photo WebP/event folders); `f8f71e85ffc5cfdb14107a991dcb50f9258fce7f` (designer WebP); `e054b23c7d4a8938460355cba46c2f22f4f0fc07` (disallow remote unconverted new image record).

**Validation:** GitHub Actions build completed successfully on combined code + PRD commit `22f6de7eb2de17241b8f473e8c92dc9e0b73939c`, confirming the shared photo-slot Studio/preview/public renderer and Sharp upload code compile. Later cleanup changes require their own latest CI check. No manual local-device visual QA performed by the agent.

**Follow-up cleanup:** Removed obsolete `DecorPanel` cover-only picker from `components/InvitationStudio/DesignerPanels.tsx` after shared `PhotoPanel` became the canonical panel (`3efe58b70bb98d6a59291ae8c97b92150ca385e1`), removed an unused Romantic Rose binding (`e35ad7ac25c3800406fc006b2c26b571b610daf7`). New event-scoped WebP files are also deleted from disk when their owned asset is deleted; legacy and external URLs are not unlinked by this new cleanup path (`1c0138b080ece163ed347ebd300f606b6da5813f`, `00e62047500385eb42efe62f88e522a8a995960c`).


---

## 2026-09-22 — Galeri template mengikuti main frame landing dan /d-invitation

**Permintaan:** Menyesuaikan `http://localhost:3000/template-design` dengan gaya visual landing/`/d-invitation`, khususnya konten ditempatkan di dalam main frame, sembari mengikuti aturan AGENTS/PRD/README dan menjaga katalog/preview/login.

**Implementasi:** `app/template-design/page.tsx` menggunakan shell dengan frame Rose 90vw, `Navbar embedded`, `MarketingFrameFooter`, dan satu `PublicMarketingAtmosphere`. Main tengah saja yang scroll dengan konten 80vw desktop; style copy, input, filter, kartu dan tipografi mengikuti tema marketing Cinzel/Fauna One/DM Mono dan ID/EN; katalog tetap data-driven, viewer preview di atas frame, dan deep-link hanya sekali diproses agar dialog tidak membuka ulang setelah ditutup. `components/Layout/PublicAtmosphere.tsx`, `Navbar/Navbar.tsx`, `Footer.tsx`, dan `MarketingFloatingControls.tsx` mengenali `/template-design` sebagai framed page sehingga tidak menggandakan global navbar/footer/audio/Instagram/floral. Tidak mengubah landing, Pintu, atau desain halaman `/d-invitation` sendiri.

**Files:** `app/template-design/page.tsx`, `components/Layout/PublicAtmosphere.tsx`, `components/Layout/Navbar/Navbar.tsx`, `components/Layout/Footer.tsx`, `components/Layout/MarketingFloatingControls.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Code commits:** `dbf530233e3972141ceda197ba74e19c419269f4` (ambient/global wrapper), `ea7a66a2e173ea594588c20d131a8ce0f2c2781f` (navbar), `7988ddfd8dc37e5f9690e6107deaede090c64d3c` / `cd849ee713e5e1462ce41599084f840207dcaf51` (footer), `eca75b40032c96a25e44964aa26c1ac00186e2ab` (floating controls), `b04123152ab7782235ebd00b2dc819afa33c4afe` (gallery frame and visual redesign).

**Validation:** UI change committed via GitHub. Latest combined GitHub Actions build to be verified; no direct browser/localhost screenshot check performed by this agent.


---

## 2026-09-22 — Semua template: amplop digital, 13 sections dan asset demo lokal

**Permintaan:** Amplop Buka Undangan sebelum Cover untuk semua template READY, diikuti Cover/Hero, Greeting, Identity, Event, DateTime, Gallery, Countdown, Location, RSVP, Wishes, Gift, Closing, Footer. Foto contoh memakai aset di public/ daripada Unsplash.

**Implementasi:** `components/PublicInvitation/UniversalInvitationTemplate.tsx` adalah renderer 13-section + amplop real untuk enam built-in selain Romantic Rose; desain tetap berbeda menurut preset dalam manifest tunggal. `components/InvitationStudio/InvitationPreview.tsx` menggunakan renderer publik yang sama, bukan mock section. `InvitationDesigner.tsx` mengoper draft designKey agar tema dan pilihan Studio terlihat langsung. `components/PublicInvitation/PublicInvitationRenderer.tsx` menjadi dispatcher bersama untuk route undangan utama, per-acara dan personal; key tidak diintegrasikan mendapat locked state. Romantic Rose tetap punya amplop khas dan 13 section, dengan gallery/gift empty state jujur bila data tidak ada. Catalog sekarang menyatakan renderer public dan role foto yang didukung untuk tujuh built-ins, thumbnail dan fixture menggunakan public/couple.jpg, couple2.jpg, couple3.jpg. Default image Studio juga memakai asset lokal. Preview RSVP non-submitting, public RSVP menggunakan shared form real, Wishes belum menyimpan ucapan karena shared Wishes API belum tersedia.

**Affected files:** `components/PublicInvitation/UniversalInvitationTemplate.tsx`, `components/PublicInvitation/PublicInvitationRenderer.tsx`, `components/PublicInvitation/RomanticRoseTemplate.tsx`, `components/InvitationStudio/InvitationPreview.tsx`, `components/InvitationStudio/InvitationDesigner.tsx`, ketiga route `app/invite/[slug]/`, `lib/templates/catalog.ts`, `data/templates/preview-invitation.ts`, `components/InvitationStudio/designer-config.ts`, `prd.md`, `AGENTS.md`, `README.md`.

**Commits:** `c1c02879` renderer; `f00d5723` draft template; `caa6af4b` Studio renderer; `d7cd54b5` Studio draft key; `822c5701`, `a61f212c` dispatcher; `f8c3e08b`, `2f51c1d2`, `9df9615a` public routes; `228a67f1` shared catalog; `65e3ee46` demo fixture; `f69ba7de` Studio local sample; `078f450e` Romantic Rose empty state.

**Validasi:** Build GitHub Actions untuk implementasi penuh dan dokumentasi hingga `c3a0e611d23d794402c0f27883b91551e0a5fb77` berhasil. Commit tambahan fixture dan filtering slot event category masih diperiksa oleh GitHub Actions. Belum dilakukan pemeriksaan visual langsung di localhost pengguna.\n\n**Follow-up:** Fixture galeri juga memakai `public/man.jpg` dan `public/female.jpg` untuk foto individu dan `couple2.jpg`/`couple3.jpg` untuk galeri (commit `d759226c39e7f3d2126601fadbb6227b1057299e`). Studio sekarang memfilter slot foto individu agar hanya ditawarkan pada event dengan identitas pasangan; host tunggal/noncouple tidak lagi diminta memilih foto mempelai (`cdbc3df9ab15a23c0dee658cb84586a019b16592`).


---

## 2026-09-22 — Sepuluh tema dengan identitas visual terpisah; lima dengan foto dan lima tanpa foto

**Owner feedback:** Katalog sebelumnya terlihat seperti satu template dengan pergantian warna. Owner meminta 10 tema yang benar-benar berbeda; 5 memanfaatkan foto pengguna, 5 benar-benar tanpa foto. Pertahankan amplop interaktif dan 13 section, katalog/Studio/public renderer tunggal, aset local public dan PRD/AGENTS/README.

**Perubahan requirement dan arsitektur:** §7.2.3b merinci stable key dan visual direction masing-masing mode 5/5. Tujuh key legacy tetap ada untuk kompatibilitas invitation yang sudah disimpan, tiga key tambahan adalah `golden-art-deco`, `paper-cut-botanical`, `celestial-ink`. Manifest `lib/templates/catalog.ts` kini menjadi satu sumber `usesPhotos` dan `photoSlots` untuk 10 built-in. Theme tanpa foto tidak memakai uploaded customer photo meski acara memiliki foto dari theme sebelumnya; Studio panel Foto menjelaskan bahwa theme itu tidak memerlukan unggah dan seluruh aset lama tetap tersimpan.

**Implementasi:** `components/PublicInvitation/InvitationThemeScenes.tsx` berisi sembilan art-directed entry envelope (folded flap/seal), Hero berbeda dan ornament per theme selain Romantic Rose (yang sudah memiliki sendiri); `components/PublicInvitation/UniversalInvitationTemplate.tsx` meneruskan shared normalized event data, section logic/RSVP/wishes/gift/countdown dan foto hanya pada theme yang mendukung, dengan section/divider/gallery layout responsif sesuai identitas theme. `components/Templates/TemplateGalleryCanvas.tsx` menampilkan bagian tengah amplop saat thumbnail di-load sehingga perbedaan theme terlihat di list. `components/InvitationStudio/DesignerPanels.tsx` memakai thumbnail live renderer serta label Dengan foto/Tanpa foto; `components/InvitationStudio/InvitationDesigner.tsx` tidak menampilkan photo-slot picker pada 5 theme nonfoto. `app/template-design/page.tsx` punya filter foto/nonfoto beserta badge card ID/EN. Semua public invite routes tetap memakai `PublicInvitationRenderer.tsx`. No change to marketing Pintu, landing, auth, Sharp upload, tenant isolation, DB model.

**Code commits:** `e081c83dfafcbc7ea493641556b3b24172fc8f5e` (10-theme catalog), `c0d8c3b9e924f713352a183dfc0d9f2bf8be56a2` (theme scenes), `6d61c03391fc3c83b4c12b3a6d6f4fcf74cd8278` (section and photo-mode layouts), `80704dfda75bbd9314b317099a7584d5d3c6725c` (true folded envelope variants), `f649821049e6051a71b397a3fb36cc16c877826e` (thumbnail viewport), `3b9e77c381bad4efc80268225991bc36bab51116` (Studio photo-free mode), `fc789ee57863796e4da9a06c2342672dd1550753` (Studio live thumbnails), `77ac7d1f00ec0f88d0d9730818564ed7e2cdfbdf` (public photo filter/badges).

**Validation:** GitHub Actions successful for theme scenes, shared section renderer, folded envelopes, thumbnail viewport and Studio photo-mode changes; verify the latest combined run before claiming final PASS. No screenshot/browser QA on owner's localhost available via connector in this task.


---

## 2026-09-22 — Perapian kontrol pencarian dan urutan pada galeri template

**Permintaan owner:** Fokus pada `/template-design?template=romantic-rose`: tombol Lihat Undangan dan kolom cari berbentuk pill/rounded penuh dengan outline Rose, pilihan Urutkan memiliki menu rounded ber-outline Rose serta dua arah A–Z dan Z–A.

**Implementasi:** Hanya `app/template-design/page.tsx` yang diubah: tombol CTA kartu menjadi `rounded-full` + border Rose; kolom pencarian `rounded-full`, border Rose dan fokus Rose; native select diganti dropdown berbasis button/menu rounded dengan border Rose (kontrol dan panel), opsi urutan katalog/Nama A–Z/Nama Z–A (ID/EN); sorting `localeCompare` naik dan turun; menu menutup saat memilih, klik di luar, atau Escape. Shared template catalog, renderer Romantic Rose, deep-link preview, dan landing/Pintu tidak disentuh.

**Code commit:** `78a54870799e170aca620974755e66c9fa264205`.

**Validasi:** Penggantian kode dan keberadaan tiga opsi sort, kedua comparator, rounded CTA/input, dan dropdown diverifikasi secara statis sebelum commit. GitHub Actions/build dan inspeksi visual browser belum dijalankan pada perubahan ini; tidak diklaim PASS.


---

## 2026-09-22 — Menyatukan pill controls dan dropdown Urutkan pada galeri template

**Feedback:** Trigger Urutkan sudah pill, tetapi panel dropdown masih `rounded-2xl` dan item `rounded-xl`, sehingga outline Rose dan bentuk kurang konsisten. Owner meminta gaya round + outline pink dibuat standar, tanpa merombak halaman lain.

**Implementasi:** Pada iterasi sebelumnya, `components/Templates/gallery-control-styles.ts` dibuat sebagai sumber class lokal untuk search, filter, sort trigger, panel menu, opsi menu dan CTA katalog; sumber tersebut telah dipindah ke `components/ui/control-styles.ts` pada perubahan design system global berikutnya. `/template-design` memakai token ini; panel dibulatkan menjadi 32px dengan outline Rose, opsi menu dan filter memakai `rounded-full` + Rose border; tombol CTA tetap render dari `Button` dengan override bentuk pill yang hanya berlaku di katalog. Pilihan A–Z dan Z–A, deep link Romantic Rose, modal, ID/EN, theme dan fitur undangan tidak diubah.

**Affected files:** `components/Templates/gallery-control-styles.ts`, `app/template-design/page.tsx`, `AGENTS.md`, `prd.md`.

**Code commits:** `e2978288a3b96a31f2e79e86e86b2511877a4434`, `8972117b3e0c020ac331ba9ed9c35f2e9ad8728d`; AGENTS rule commit `707f7889dc235f0aacb2031ef80ca501b2b9af60`.

**Validation:** Source changes, shared-class consumption and sort behavior checked statically. Tidak ada klaim CI/build/visual PASS sebelum workflow/browser menjalankan pemeriksaan aktual.


---

## 2026-09-22 — Standar kontrol Rose pill dipindah ke design system global

**Feedback owner:** Jangan membuat file style yang hanya berlaku untuk `/template-design`; bentuk pill/round dan outline Rose perlu konsisten dari global UI system supaya setiap halaman/komponen baru tidak perlu dipoles ulang secara manual.

**Implementasi:** `app/globals.css` mendefinisikan `--dc-control-radius`, `--dc-control-menu-radius`, dan `--dc-control-outline`, serta baseline input/select dan form field Dashboard. `components/ui/control-styles.ts` menjadi class source global untuk input, chip filter, trigger/menu/option dropdown, dan CTA. `components/ui/button-variants.ts` mengubah delapan size Button menjadi radius global dengan border Rose; `components/ui/input.tsx` memakai token radius dan Rose border/focus. `/template-design` sekarang mengimpor global controlStyles, tidak lagi memiliki konstanta gallery khusus. Pola ini berlaku pada seluruh aplikasi melalui shared primitives dan native form baseline; elemen artwork, navigasi terproteksi, checkbox/radio, dan textarea multi-baris tetap mempertahankan geometry khusus. Kebutuhan rounded pada popup opsi harus dipenuhi melalui menu custom, bukan mengandalkan opsi popup native select.

**Affected files:** `app/globals.css`, `components/ui/control-styles.ts`, `components/ui/button-variants.ts`, `components/ui/input.tsx`, `app/template-design/page.tsx`, `components/Templates/gallery-control-styles.ts` (dihapus setelah migrasi), `AGENTS.md`, `prd.md`, `README.md`.

**Commits:** `2c713b448245083ab63abcf2f5acc12c5f322856`, `a21e21d903849d41dd2642de4815e9ed2da3fb56`, `59c88405778118079ed30ef5717f4530e606e296`, `36391e9397195238b59cd2576f3a68fd344eab65`, `242ee86911d3b72668cd65dbb61774b892a01573`, `7d92b59108178cd42934ad66c134483a36293729`.

**Validasi:** Kode dan kontrak global diverifikasi statis pada GitHub. CI/build serta pemeriksaan visual pada localhost tidak diklaim PASS tanpa hasil aktual.


---

## 2026-09-22 — Etalase tiga template terjual dan preview smartphone di /d-invitation

**Permintaan:** Owner ingin koleksi template `/d-invitation` hanya memperlihatkan tiga yang terbanyak terjual, diacak sebelum ada penjualan, dan kotak preview menyerupai mockup smartphone tinggi/kurus di Hero.

**Implementasi:** `app/api/templates/featured/route.ts` menghitung pemakaian template dari event dengan Payment berstatus PAID untuk paket Digital Invitation melalui groupBy; mengembalikan tiga key teratas dan mengisi slot kosong dengan random tanpa data penjualan fiktif. `components/DigitalInvitation/TemplateSection.tsx` mengambil kunci dari endpoint saat mount dan hanya merender maksimal tiga template READY yang tersedia di shared `useTemplateCatalog`, fallback random jika API tidak tersedia, dan frame 9:19.5 menyalin proporsi bezel/notch/mockup hero tanpa mengedit hero. `components/Templates/TemplateGalleryCanvas.tsx` menerima mode thumbnail phone opsional yang mengisi layar HP; mode normal katalog tetap semula. Akses ke katalog lengkap melalui tombol Lihat Semua Template dan deep-link preview tidak berubah.

**Batasan:** Perhitungan saat ini menautkan Payment PAID ke templateKey yang dipilih event sekarang, bukan histori snapshot template saat pembayaran; keterbatasan itu dijelaskan di §7.2.9d. Upload designer belum READY tidak dimasukkan ke etalase ini; tetap tersedia di katalog penuh sebagai preview saja.

**Files:** `app/api/templates/featured/route.ts`, `components/DigitalInvitation/TemplateSection.tsx`, `components/Templates/TemplateGalleryCanvas.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Code commits:** `acbfeeab7875cdae75e60a45c97779d94588e4cf` (featured API), `ca0a679f716bf7c4719c880f25031aae5bcfe1a3` (phone thumbnail), `323ff91fad92c140c17134f42654b2a48c236d2f` (marketing section).

**Validasi:** Pemeriksaan sumber dan kontrak API/limit/card dilakukan di GitHub; production build, pengujian database nyata, dan screenshot browser tidak dinyatakan PASS tanpa hasil aktual.


---

## 2026-09-22 — Header Koleksi Template lebih dekat ke tengah

**Permintaan:** Pada `/d-invitation`, judul/keterangan Koleksi Template dan tombol di kanan didekatkan ke tengah, tetap dengan jarak yang nyaman.

**Implementasi:** `components/DigitalInvitation/TemplateSection.tsx` memberi header wrapper `mx-auto w-full max-w-[980px]` dan jarak dua kolom responsif `sm:gap-12`. Tiga kartu smartphone, urutan terjual/acak, hero, dan seksi lain tidak berubah. Aturan posisi ini juga dicatat di `AGENTS.md` serta §7.2.9d.

**Code commit:** `92b1e69cd625137f438393d6c96bf21cff480f37`; **AGENTS commit:** `e3a3afed2db6e5735a07e2e13abdc43368e19c20`.

**Validasi:** Pemeriksaan statis pada perubahan class; screenshot localhost dan build/CI belum diverifikasi.


---

## 2026-09-22 — CTA Lihat semua template tanpa uppercase

**Permintaan:** Tombol Lihat semua template di bagian Koleksi Template `/d-invitation` tidak memakai all-caps.

**Implementasi:** Menghapus `uppercase` dan tracking lebar pada CTA di `components/DigitalInvitation/TemplateSection.tsx`, diganti `normal-case tracking-normal`. Teks, link, tombol lain, dan posisi header tidak diubah.

**Commit:** `037119a19497903a898e0c65992ac1cf3ac40693`.

**Validasi:** Perubahan sumber tercatat di GitHub; build dan preview visual lokal belum dijalankan.


---

## 2026-09-22 — Garis koleksi penuh, jarak smartphone, dan CTA pratinjau tunggal

**Permintaan:** Perpanjang border bawah header Koleksi Template di `/d-invitation`, perbesar jeda antara garis dan gambar smartphone, dan hilangkan tombol Lihat pratinjau di bawah kartu karena frame HP sudah dapat diklik.

**Implementasi:** `components/DigitalInvitation/TemplateSection.tsx` memindahkan border-b ke header wrapper `w-full`, mempertahankan header copy/tombol kanan di wrapper `mx-auto max-w-[980px]`, menaikkan section gap ke `space-y-14 md:space-y-16`, dan menghapus satu CTA preview dari setiap kartu. Overlay `Link` pada tiap frame smartphone dipertahankan sebagai satu-satunya aksi preview kartu. Katalog penuh, tiga pilihan template, dan layout hero tidak diubah.

**Code commit:** `38c565db6b04240dc3be418de46452eee746ec47`; **AGENTS:** `3afa9f29a9ff7df96bee2058fc67e7788711e878`.

**Validasi:** Perubahan diperiksa pada source GitHub; build/CI dan screenshot localhost belum diverifikasi.


---

## 2026-09-22 — Merapikan ritme section, akses Studio, outline Paket dan FAQ

**Permintaan:** Rapikan margin/padding antarseksi pada halaman `/d-invitation`, dekatkan teks Design Studio dan tombol, ganti CTA Dashboard menjadi `Masuk Studio ↗`, buat outline kartu Paket lebih rounded, dan bulatkan semua item FAQ.

**Implementasi:** Container konten dan wrapper section pada `app/d-invitation/page.tsx` menggunakan flex-column dengan `gap-20` mobile / `gap-24` desktop alih-alih nested `space-y-28` dan `space-y-36`; Hero menghapus bottom padding ganda tanpa mengubah komposisi smartphone/copy. Feature, Studio, Package, Reviews, FAQ menyesuaikan padding/header-to-content space agar konsisten. Studio section memakai inner wrapper `max-w-[960px]`, gap dua kolom lebih kecil, dan CTA ID/EN `Masuk Studio` / `Enter Studio` plus arrow, menuju `/studio`. Route gateway `app/studio/page.tsx` memeriksa user dan event terkonfigurasi miliknya; satu event menuju editor dengan invitationId, lebih dari satu memakai `components/DigitalInvitation/StudioEntrySection.tsx` untuk pilihan ID/EN, tanpa event menampilkan CTA buat acara melalui Dashboard. Tidak bypass auth atau mencoba membuka editor tanpa invitationId. `PackageShowcase` menambah prop `roundedCard` khusus `/d-invitation`, radius 40–48px dan border Rose. `FaqSection` bersama membulatkan semua wrapper/trigger item FAQ dan memberi outline Rose; jawaban dan interaksi accordion dipertahankan.

**Files:** `app/d-invitation/page.tsx`, `components/DigitalInvitation/HeroSection.tsx`, `components/DigitalInvitation/FeatureSection.tsx`, `components/DigitalInvitation/StudioSection.tsx`, `components/DigitalInvitation/ReviewsSection.tsx`, `components/Marketing/PackageShowcase.tsx`, `components/Marketing/FaqSection.tsx`, `app/studio/page.tsx`, `components/DigitalInvitation/StudioEntrySection.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Commits (code):** `8271bb47324409195b640cad0fc9031b8a0ba248`, `164dda0db8d0dd372d2fb8009dfba33e97ebcc4b`, `01ef8c601c57a735893a436cb53de1f7d2fd4b26`, `c1c611bf4245c396aadd0db8e27e674edc66e0b1`, `b4c2d2a665bd8d88fecef622ffebb91fbf83ba4b`, `446d11e4f037c86014a93a8d6b4847d9c79e7b98`, `eb81fbeeb9503b61f1a3cbfabd47e7f3fd99d61c`, `32a7273e5862db7d9bf50e626c157a6035ba866f`, `a6e505682d6b16707932f7d49afc1fb542eefd20`, `b9191082a9a7796d6ca898ed5ad631b42c6e1a4e`; AGENTS `afa1741ada02b1a7d78f81d36a6d14817c14ca05`.

**Validasi:** Inspeksi sumber di GitHub; runtime localhost, database asli, screenshot visual, dan build/CI belum diverifikasi, sehingga tidak diklaim PASS.


---

## 2026-09-22 — Fitur tanpa angka dekoratif dan lebih terpusat

**Permintaan:** Hilangkan nomor-nomor pada kartu di section `Yang kamu dapatkan / Undangan adalah awal dari alur acara yang lebih rapi` di `/d-invitation`, dan rapatkan ketiga fitur ke arah tengah agar tidak terlihat menyebar.

**Implementasi:** `components/DigitalInvitation/FeatureSection.tsx` menghapus seluruh enam label konfigurasi `01/02/03` pada locale ID/EN, menghapus field label dari tuple dan badge urutan di JSX, serta mengelompokkan heading dan tiga kartu dalam wrapper `mx-auto w-full max-w-[960px]` dengan padding desktop kolom yang lebih kecil (`md:px-6`). Konten, ikon, perilaku responsif dan section lain dipertahankan. Aturan desain turut dicatat di `AGENTS.md`.

**Commits:** `fd92926d8825b6a2efea77957213d03fdc21ed6a` (implementasi), `e5fc73858dedf8fff4eb3b00d9f4cc73dde09e9e` (rapikan JSX), `b5bffa931ad4f274ca724fc7bb473f0aab1e8a83` (AGENTS).

**Validasi:** Source diperiksa pada GitHub (nomor dekoratif tidak lagi tersisa, label tuple tidak digunakan, heading dan grid memakai wrapper yang sama). Build/CI dan browser localhost belum dijalankan.


---

## 2026-09-22 — Lebar seragam 1100px dan animasi teks berulang mengikuti viewport

**Permintaan:** Tanpa mengubah copy dan content, owner meminta seluruh section `/d-invitation` mempunyai lebar konsisten dari atas hingga bawah. Teks diberi animasi scroll yang halus, dan animasinya boleh terulang hanya setelah teks keluar dari bagian frame yang terlihat lalu masuk kembali, termasuk ketika scroll ke atas.

**Implementasi:** Main column `app/d-invitation/page.tsx` memakai 88% mobile/80vw sejak `sm` dengan `max-w-[1100px]`; batas Hero, wrapper Fitur, header Koleksi Template, section Studio, paket dan FAQ mengikuti container bersama. Lebar paragraf, satu kartu paket, tiga kartu HP, dan jarak antarsection tetap proporsional. `components/DigitalInvitation/MarketingTextReveal.tsx` mengamati teks secara independen menggunakan IntersectionObserver dengan `root` pada `<main>` yang scroll di dalam frame, reset setelah keluar sepenuhnya dan re-enter dalam dua arah. MutationObserver memasukkan teks FAQ yang baru terbuka/kartu katalog yang baru ter-render; elemen interaktif dan isi preview HP dikecualikan. Animasi hanya opacity/translateY, mengikuti reduced motion tanpa animasi paksa. String ID/EN, konten lain, data/template dan pintu landing tidak diubah.

**Files:** `app/d-invitation/page.tsx`, `components/DigitalInvitation/MarketingTextReveal.tsx`, `components/DigitalInvitation/HeroSection.tsx`, `components/DigitalInvitation/FeatureSection.tsx`, `components/DigitalInvitation/TemplateSection.tsx`, `components/DigitalInvitation/StudioSection.tsx`, `components/Marketing/PackageShowcase.tsx`, `components/Marketing/FaqSection.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Commits:** `1d1906d38e89fd1cf4eb150be8b2d0d69258b4de`, `872d24941592a292268eab674470bfad75328c3f`, `ec51dca6645471828dc2dbc4d9b9161306ab4f77`, `ad8d4abc0c8ef875b6076edc81cf864f917f419b`, `08999ba9db8e47bb77a417f1ffe7cf5c685eeff6`, `b66c66ca5b552a7e98e4add2662f87c6a1adefbc`, `ec7fe619c48744a4327d850987ffa1bd71b658a3`, `607d6a8ef06d357cbfd5f400c0e1d9f1ffb37c61`; AGENTS `3052c0e09b88f6077d66e2dc2f7319cef7322563`.

**Validasi:** Sumber dicek setelah push; build, screenshot localhost dan pengujian nyata di browser/perangkat belum dinyatakan PASS.


---

## 2026-09-22 — Event Planner menggunakan frame marketing dan animasi scroll

**Permintaan:** Samakan desain halaman Event Planner dengan aturan marketing yang telah disetujui untuk Undangan Digital: seluruh konten di main frame, latar/dekorasi lengkap, margin/padding dan lebar konsisten, animasi lembut ketika scroll tanpa mengubah isi/tautan.

**Implementasi:** `app/event-planner/page.tsx` sekarang mempunyai PublicMarketingAtmosphere, Rose radial glow, frame desktop/mobile persis proporsi `/d-invitation`, `Navbar embedded`, `MarketingFrameFooter` dan `<main>` yang scroll internal; halaman membatasi lebar di 1100px dan gap 80/96px. `PublicAtmosphere`/`PublicContent`, Navbar, Footer, dan `MarketingFloatingControls` menambahkan route `/event-planner` ke pengecualian framed supaya tidak ada dekorasi/chrome/musik ganda. `components/EventPlanner/ScrollReveal.tsx` memberi animasi masuk tiap section dengan `once:false`, memakai ref panel scroll dan reduced-motion; `components/DigitalInvitation/MarketingTextReveal.tsx` dipakai ulang untuk teks yang replay setelah tak terlihat. Cards Founder/Services/Portfolio/Paket/CTA akhir diberi radius yang lebih halus dan border Rose; review menggunakan opsi `framed` di komponen bersama, FAQ memakai opsi `wide` yang sudah tersedia. Modal video portfolio ditampilkan lewat portal ke body agar tetap berada di atas clip frame. Content, teks, data, dan URL CTA tetap dipertahankan.

**Files:** `app/event-planner/page.tsx`, `components/EventPlanner/ScrollReveal.tsx`, `components/EventPlanner/FounderSection.tsx`, `components/EventPlanner/ServicesSection.tsx`, `components/EventPlanner/PortfolioSection.tsx`, `components/Marketing/ReviewsGrid.tsx`, `components/Layout/PublicAtmosphere.tsx`, `components/Layout/Navbar/Navbar.tsx`, `components/Layout/Footer.tsx`, `components/Layout/MarketingFloatingControls.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Code commits:** `3478225fa528fc02f60a0f7408689ab7afc4a336`, `5525b627cb0dc9ed34be254cb1e862291e605d11`, `bd94aa3c87ec1cf98b72da0dd5bf8958b6617be5`, `f5b68644c21433ac8768763a8620d64ea043dba0`, `fb56b148dbde8fb6602a8d7e3a2df1e8a06007e6`, `22e3191b1eece72d110de6c0eccb94f92755d481`, `2bd67783ed10e9214b1d526ec89c6915e6edf213`, `492966626adc7056da3e1748357f4e8bb67ca70d`, `42b65454bdca85ad6dd391f7bcdebe4d24cf3b5b`, `4cb904d6d934a23a92b74485e88e2efd7257695e`, `542c86aea2faf959b21601bc582d00ab56f38e87`, `c706e7d6e35f048b84566c2664822a784fbcc207`, `c264c7e670dc69da9ae83324d9b08142a602c336`, `bc0453cfa84ba82aeb36528dd7a09106b16d24bf`; AGENTS `a9149ff9e10e990e1cb54348aed360322c0a2359`.

**Validasi:** Source GitHub diperiksa untuk penjagaan framed route, satu lapis background/footer/navbar, semua section, jalur konsultasi, portal video dan animasi viewport root. Build/CI, uji interaktif browser, data production, dan screenshot localhost belum diverifikasi sehingga tidak diklaim PASS.


---

## 2026-09-22 — Transisi pintu landing: hilangkan pintu kedua setelah zoom

**Permintaan:** Pada navigasi lewat Pintu landing, setelah kamera zoom ke pintu pertama masih terlihat lagi gambar/objek pintu sebelum masuk halaman lain. Hilangkan pintu kedua saja, tanpa menghapus tiga Pintu utama.

**Implementasi:** `components/Landing/Pintu/SimpleDoorLab.tsx` menjaga foto layanan di `PortalWorld` saat pintu dipilih lalu memudarkannya menjadi bidang Rose tanpa gambar hanya setelah `entering` dimulai; kamera tidak lagi melintasi bidang gambar 2D menuju orbital belakang (akhir posisi z≈1.9 dari 11.7, bukan 0.6). Event shared `dc-portal-start` kini dijalankan sewaktu zoom mendekati 70%, menutup komposisi pintu dengan veil Rose tanpa asset baru; perpindahan Next Router dipicu setelah kamera mencapai akhir dan memberi waktu pada veil menutup. `PortalTransition.tsx` sudah berupa Rose veil/glow tanpa gambar pintu sehingga tidak perlu diganti. Semua target layanan, musik/SFX, selection/opening Pintu, brand scene, dan reduced-motion tetap menggunakan jalur existing. Tidak mengubah arsitektur GLB di `/pintu-lab` atau halaman tujuan.

**File kode:** `components/Landing/Pintu/SimpleDoorLab.tsx`. **Commit kode:** `2047cde503d5e6be7a303845c5fcb8bed508f20a`. **AGENTS commit:** `ae723d5e362414bb1aec8b2af575447432e7fd31`.

**Validasi:** Inspeksi kode pada GitHub; build/CI, timing pada perangkat nyata dan screenshot browser masih pending. Tidak mengklaim pemeriksaan visual telah PASS.


---

## 2026-09-22 — Widget navigasi Pintu mini di sisi kiri halaman marketing

**Permintaan:** Tambahkan widget di kiri untuk berpindah ke halaman lain, berbentuk pintu dan menjelaskan tujuan setiap halaman.

**Implementasi:** Komponen `MarketingDoorNavigator` di-host sekali oleh root layout dan hanya terlihat di tujuh halaman marketing yang relevan. Trigger Pintu mini Rose membuka panel berisi Beranda, Event Planner, Digital Invitation, Guestbook, Undangan Fisik, dan Koleksi Desain; setiap item menampilkan Pintu mini, judul serta microcopy tujuan, dengan halaman aktif ditandai. Panel responsif, tertutup secara default, mendukung ID/EN, keyboard/Escape, klik di luar, close button dan reduced-motion. Tautan menggunakan Link existing sehingga `PortalTransition` menangani navigasi cross-route tanpa gambar Pintu kedua. Pintu 3D utama, frame halaman, navbar, footer, Dashboard dan invitation renderer pelanggan tidak diubah.

**Files:** `components/Layout/MarketingDoorNavigator.tsx`, `app/layout.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Code commits:** `48a3164e50e3d51786db8ca0ba381726d06fa8b1`, `645183f1ec86f40b45c6a0b786379e3a97f123f6`, `32b7912ea10da5120baf03f33873fa45e2ba319b`.

**Validasi:** Inspeksi source GitHub; lint/build/CI dan pengujian visual di browser/perangkat belum diverifikasi.


---

## 2026-09-22 — Guestbook dan Undangan Fisik mengikuti frame marketing

**Permintaan:** Benahi kedua halaman layanan agar styling dan interaksi sejalan dengan baseline landing serta halaman Digital Invitation/Event Planner yang telah ber-frame, tanpa mengganti konten atau komponen utama.

**Implementasi:** `app/guestbook/page.tsx` dan `app/undangan-fisik/page.tsx` memakai embedded Navbar/Footer, satu ambience bunga/kelopak dan Rose glow, satu scroll panel di tengah frame 90vw serta kolom responsif max 1100px. Section diberi ScrollReveal dan text replay via MarketingTextReveal ber-root pada panel. Guestbook mempertahankan Hero/Feature/Process/Paket/Reviews/FAQ, dengan opsi rounded Rose pada paket/review dan FAQ wide. Kartu Hero, panel pemilihan fitur dan grid proses memakai border/radius Rose serta font canonical tanpa mengubah teks maupun perilaku tab. Undangan Fisik mempertahankan ilustrasi, feature cards, urutan proses serta anchor konsultasi dan WhatsApp, dengan kartu/border Rose dan pengaturan jarak lebih konsisten. Pemeriksaan empat route-global (PublicAtmosphere/PublicContent, Navbar, Footer, MarketingFloatingControls) menonaktifkan chrome/dekorasi ganda pada dua halaman baru; player musik dan kontrol lain tetap memakai komponen bersama. Landing Pintu dan konten/katalog/undangan pelanggan tidak diubah.

**Code commits:** `bcf99d5d7f8d966d9e498bf980b1192bb9befe41`, `8b20029f162944bf5540f2d2934ec81e75f1ed92`, `23ab3849b7a2334d93a7bebb382436e13d8f941e`, `3f761572ea4b8b6e883fedaff01a02c033c30752`, `e926b9e06a246ed6dea8db57a66a107c5075f7b4`, `785053d5a10edb375b747b5790e4d21e99a301e8`, `c9d024ef870efa8cd356500b163e70de9425a085`, `c099eb9d36cbfd789877b157023e5918550e80b2`, `ab7f8fbdc6f978be2391e0a86676146fe76ef39d`.

**Files:** `app/guestbook/page.tsx`, `app/undangan-fisik/page.tsx`, `components/Layout/PublicAtmosphere.tsx`, `components/Layout/Navbar/Navbar.tsx`, `components/Layout/Footer.tsx`, `components/Layout/MarketingFloatingControls.tsx`, `components/Guestbook/HeroSection.tsx`, `components/Guestbook/FeatureSection.tsx`, `components/Guestbook/ProcessSection.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Validasi:** Build Validation GitHub Actions **PASS** pada commit shell/dua halaman `785053d5a10edb375b747b5790e4d21e99a301e8` ([run 35730049634](https://github.com/wanzy0808/DC/actions/runs/35730049634)); validasi commit styling Guestbook terakhir dan pemeriksaan visual localhost/perangkat masih pending.


---

## 2026-09-22 — Musik bawaan untuk semua sepuluh template undangan

**Permintaan:** Semua tema undangan memiliki musik yang bisa didengar tamu, tidak terbatas pada template yang kebetulan sudah mengunggah audio.

**Implementasi:** `lib/templates/music.ts` memetakan 10 stable key template READY ke berkas MP3 yang sudah tersedia di folder `public/`; musik URL khusus per event dan aset AUDIO tetap prioritas terhadap default. `components/PublicInvitation/InvitationMusic.tsx` menyediakan satu player bersama yang dimount sebelum amplop, mulai pada gesture Buka Undangan publik, loop, tombol pause/play mengambang setelah amplop, penghentian saat tab tersembunyi/unmount serta koordinasi agar dua preview tidak bermain bersamaan. Footer audio lama di `RomanticRoseTemplate` dan `UniversalInvitationTemplate` dihilangkan. Preview Studio/galeri tidak autoplay, namun dapat menyalakan lagu manual; `MarketingAudio` menghindari background marketing dan lagu undangan bersuara bersamaan. `InvitationPreview`, `InvitationDesigner`, dan `DesignerPanels.MusicPanel` mengizinkan pratinjau perubahan URL musik sebelum save sekaligus menampilkan judul musik default dari tema. Renderer undangan lain melalui dispatcher otomatis mengikuti kedua renderer ready. Tidak mengubah data event, fitur RSVP, konten template atau 3D Pintu landing.

**Files:** `lib/templates/music.ts`, `components/PublicInvitation/InvitationMusic.tsx`, `components/PublicInvitation/RomanticRoseTemplate.tsx`, `components/PublicInvitation/UniversalInvitationTemplate.tsx`, `components/Layout/MarketingAudio.tsx`, `components/InvitationStudio/InvitationPreview.tsx`, `components/InvitationStudio/InvitationDesigner.tsx`, `components/InvitationStudio/DesignerPanels.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Code commits:** `5b90d96477fbcba89174ca5588049eb5b544da45`, `b0871868ae1361e7a62102951036e3975ae00926`, `19ea5bf98fa2f753b26aff4d8a18b241e8816f9f`, `fb4cc6825d183a80f2152ed10993279980a7f874`, `082db9970b91b5da658ac8040190cc360cb7362d`, `e535773dd256ea85449191d9f5ab1340df817b20`, `05a0b0e331256310109d475fbe0feeb497e9ea05`, `0aedb8aea6fc8cbd2abbd52bfb9e1c741204b0ad`, `ef8b69403d103b0af9f2c9c526afe4901e4f3877`, `901edd28756a0d0cae8f58ecfb7d04345c9bfd6b`.

**Validasi:** GitHub Actions Build Validation **PASS** untuk penerapan musik di 10 tema dan integrasi Studio/marketing audio pada commit `167c5557813a5287dda9da598b119d2a47d9081c` ([run 35731068483](https://github.com/wanzy0808/DC/actions/runs/35731068483)). Perbaikan terakhir pada microcopy panel Musik (`a8ef28322be5ddbb711b59d066438cf60c619181`) menunggu run-nya; pengujian playback/autoplay/mobile di browser nyata dan status lisensi audio untuk distribusi komersial belum diverifikasi.


---

## 2026-09-22 — Login dan Daftar menyatu dengan gaya Rose publik

**Permintaan:** Rapikan Login dan Daftar pada menu supaya tidak lagi terlihat berbeda dari style DC Organizer.

**Temuan:** Halaman Login dan RegisterDialog sebelumnya memaksa `bg-white/text-black`, tombol Google dan submit netral bersudut kotak, border input netral sehingga dark mode tidak konsisten. Tautan Daftar pada login sebelumnya mengarah ke `/?register=1` tanpa handler landing yang sesuai; tombol Masuk pada dialog menu hanya menutup dialog tanpa menavigasi ke login.

**Perubahan:** `components/Auth/GoogleIcon.tsx` dan `components/Auth/auth-styles.ts` dipakai bersama oleh Login dan RegisterDialog agar tombol, pill input, error dan pilihan provider seragam; form mengikuti token theme Light/Dark, font Cinzel/Fauna/DM Mono, Rose border dan CTA. Halaman login memiliki kartu responsif dengan glow ringan, tombol lihat/sembunyikan password dan entrance halus yang menghormati reduced motion. RegisterDialog menjadi dialog Rose responsif dengan max-height/scroll, label input, show/hide password/konfirmasi, consent, Google Sign-In dan link yang tetap bekerja. BurgerMenuContent memakai pill navigation dan menavigasi ke /login saat pengguna menekan Masuk dari dialog, termasuk mempertahankan `next` yang aman. `PublicContent` hanya melepas batas 75vw pada route /login agar kartu tidak menyempit di ponsel. Login + dialog membaca ID/EN dari LanguageProvider; API login/register, role, password validation, email verification, entitlement, Pintu dan halaman marketing lain tidak diubah.

**File utama:** `app/login/page.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `components/Layout/Navbar/BurgerMenuContent.tsx`, `components/Layout/PublicAtmosphere.tsx`, `components/Auth/GoogleIcon.tsx`, `components/Auth/auth-styles.ts`, `AGENTS.md`, `README.md`, `prd.md`.

**Commits implementasi:** `f7475d7801d75bc400a657024fb598a95d429178`, `437b7b3b10354b25551089b3dd8554798cfd844c`, `4aba83b5f17ab3f65bf4db210fcc7080cfbbdbd0`, `ad2eb60727cc2836de97a51375bc9d79e7254f4f`, `f2056ef076ffcfe595ccfbb4fda4b15a19a0a448`, `af58cc7addb95710d5f0530c41c2a4179b049be0`.

**Validasi:** Build GitHub Actions pada commit `ad2eb60727cc2836de97a51375bc9d79e7254f4f` selesai PASS. Pada commit login yang lebih awal (`4aba83b5...`) CI sempat gagal karena properti `onRegistered` belum disertakan pada dialog; properti tersebut ditambahkan pada commit berikutnya dan build PASS. Build Validation GitHub Actions untuk keseluruhan kode Login, RegisterDialog, BurgerMenuContent dan lebar responsif route /login **PASS** pada commit `af58cc7addb95710d5f0530c41c2a4179b049be0` ([run 35732600720](https://github.com/wanzy0808/DC/actions/runs/35732600720)). Uji visual-browser/handset dan uji login/registrasi end-to-end dengan server/database masih perlu dilakukan.


---

## 2026-09-22 — Login dan Daftar diseragamkan

**Permintaan:** Rapikan menu Masuk/Login dan Daftar agar terlihat memakai style yang sama.

**Implementasi:** `components/Auth/auth-styles.ts` kini menyediakan token kelas visual bersama untuk card, header, accent bar, title/description, label/input, password toggle, Google button, separator, CTA, error, secondary link dan consent surface. `app/login/page.tsx` memakai seluruh token tersebut. `components/Layout/Navbar/RegisterDialog.tsx` diselaraskan dengan struktur visual Login: header terpusat, Rose accent bar, field/password control/Google action/CTA/link yang sama, sementara Terms/Privacy, promo opt-in, scroll modal mobile dan logic submit tetap dipertahankan. Dokumentasi lama yang menyebut auth harus putih/hitam netral diperbaiki agar pengecualian itu hanya berlaku pada burger navigation; auth mengikuti canonical Rose system.

**Files:** `components/Auth/auth-styles.ts`, `app/login/page.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Validasi:** GitHub Actions diperiksa setelah perubahan; pengujian visual localhost pada ukuran desktop/mobile belum dilakukan dari sesi ini.


---

## 2026-09-22 — Login dan Daftar sebagai dialog yang dipusatkan

**Permintaan:** Login tidak perlu lagi menjadi page sendiri seperti sebelumnya; menu Masuk harus tampil seperti dialog Daftar, dan popup Daftar di desktop jangan jatuh terlalu ke bawah.

**Implementasi:** `components/Auth/LoginDialog.tsx` memindahkan UI/form login ke popup tanpa mengubah endpoint atau login Google, dan `components/Auth/AuthDialogHost.tsx` menjadi satu pengelola dialog persistent dari `app/layout.tsx`. `BurgerMenuContent.tsx` membuka Login/Daftar melalui interaksi lokal yang menutup burger tetapi tidak mengganti route. `app/login/page.tsx` menjadi redirect kompatibilitas ke beranda dengan `?auth=login|register`, `next` yang aman dan error Google agar semua link existing tetap membuka dialog, bukan halaman terpisah. Switching dua mode dan pesan verifikasi registrasi kini tampil dalam dialog yang sama. `RegisterDialog.tsx` menerima prop `next` dari host dan mengurangi spacing/padding desktop sambil mempertahankan scroll internal pada layar pendek. Penyebab popup Daftar turun, yaitu `relative` di `authCardClass` yang meng-override `DialogContent.fixed`, dihapus. Pintu landing, section dan autentikasi server tidak diubah.

**Files:** `components/Auth/auth-styles.ts`, `components/Auth/LoginDialog.tsx`, `components/Auth/AuthDialogHost.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `components/Layout/Navbar/BurgerMenuContent.tsx`, `components/ui/dialog.tsx`, `app/layout.tsx`, `app/login/page.tsx`, `prd.md`, `AGENTS.md`, `README.md`.

**Validasi:** Build Validation GitHub Actions **PASS** untuk perubahan inti modal login/register, redirect `/login`, dan check sesi existing pada commit `da136c39a6d361326180b36914ce8126b83d8f82` ([run 35735189420](https://github.com/wanzy0808/DC/actions/runs/35735189420)). Penyesuaian overlay di atas widget navigasi mengambang diperiksa pada commit setelahnya; uji visual/klik/keyboard pada browser localhost desktop/mobile belum dilakukan.


---

## 2026-09-22 — Pemulihan visual burger dan background auth sesuai landing

**Permintaan:** Pulihkan menu burger ke style sebelumnya setelah perubahan Login/Daftar dan samakan background kedua modal auth dengan landing page.

**Implementasi:** `BurgerMenuContent.tsx` dipulihkan dari markup/kode sebelum refactor modal (commit `2ddb8cf7b787c0fef037fe00956cb9763602a3c6`) dengan satu-satunya adaptasi pada aksi Masuk dan Daftar: `Link` asli Masuk mencegah navigasi saat klik dan membuka `AuthDialogHost`; Daftar kembali menggunakan komponen `Button` asli dengan event untuk membuka dialog yang sama. Kelas `itemClass`, dropdown Navbar, urutan layanan, ikon, submenu, spacing dan animasi tetap seperti semula. `auth-styles.ts` menggunakan `background` light/dark serta radial Rose glow seperti landing untuk card kedua auth, sementara `LoginDialog.tsx` dan `RegisterDialog.tsx` memiliki backdrop Rose ringan alih-alih hitam hampir opak, sehingga layer bunga/kelopak marketing existing tetap terlihat tanpa menambah dekorasi ganda. Tidak ada perubahan pada Pintu, auth API, URL kompatibilitas, atau dashboard.

**Files:** `components/Layout/Navbar/BurgerMenuContent.tsx`, `components/Auth/auth-styles.ts`, `components/Auth/LoginDialog.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Validasi:** GitHub Build Validation diperiksa setelah kode di-push. Uji visual pada browser nyata desktop/mobile masih diperlukan.


---

## 2026-09-22 — Warna teks burger Rose dan popup auth putih

**Permintaan:** Cek CSS yang menyebabkan seluruh isi burger tidak pink; Login dan Daftar memakai background putih dengan glow pink tipis, bukan background tema yang menjadi gelap/terlalu pink.

**Akar masalah:** `BurgerMenuContent.itemClass` memiliki `text-foreground` dan `dark:text-foreground` yang menimpa Rose; Daftar juga mewarisi warna teks dari `Button` global. Popup menggunakan `bg-background/90` dan `dark:bg-background/90`, sehingga Dark Mode memakai permukaan gelap; beberapa helper/form mengikuti `text-muted-foreground` tema gelap walau permukaan popup diubah putih.

**Perubahan:** `BurgerMenuContent.tsx` sekarang memakai `text-primary` dan `dark:text-primary` untuk seluruh item tanpa mengubah posisi, struktur, urutan, ikon, ukuran, atau motion burger. `auth-styles.ts` memakai permukaan putih di kedua tema dengan radial glow Rose hanya 10%, shadow lembut, label/input/Google button/helper gelap terbaca pada putih dan tetap konsisten dengan palet Rose. `LoginDialog.tsx` dan `RegisterDialog.tsx` menyesuaikan teks helper dan status inline untuk panel putih pada Dark Mode. Tidak ada perubahan endpoint autentikasi, Pintu landing maupun mekanisme dialog/modal.

**Files:** `components/Layout/Navbar/BurgerMenuContent.tsx`, `components/Auth/auth-styles.ts`, `components/Auth/LoginDialog.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `AGENTS.md`, `README.md`, `prd.md`.

**Validasi:** GitHub Actions Build Validation dipantau setelah update kode; verifikasi visual browser desktop/mobile dan pengujian alur login/registrasi berbasis database tetap diperlukan setelah sync.


---

## 2026-09-22 — Kebijakan Privasi dan pembekuan visual auth/burger

**Permintaan:** Jangan mengubah lagi style burger, Login dan Daftar yang terakhir disetujui. Publikasikan naskah Kebijakan Privasi yang diberikan owner; teks asli menyebut Viding, harus menjadi DC Organizer.

**Implementasi:** Halaman publik `app/privacy-policy/page.tsx` ditambahkan dengan enam paragraf naskah owner (nama “Viding” diganti “DC Organizer”) serta terjemahan EN untuk language toggle; halaman tidak menambah/menyentuh Pintu landing maupun style burger/auth. Teks Kebijakan Privasi pada checkbox persetujuan `RegisterDialog` sekarang `Link` aktif menuju `/privacy-policy` (tab baru, tidak mencentang checkbox secara otomatis), sedangkan label Privacy Policy yang sudah ada di footer juga ditautkan ke halaman yang sama. Aturan tidak mengubah style existing diperkuat di `AGENTS.md` dan aturan yang kontradiktif tentang label burger hitam atau card auth dark diperbaiki di dokumen. `Syarat & Ketentuan` tetap bukan link karena belum ada naskahnya.

**File:** `app/privacy-policy/page.tsx`, `components/Layout/Navbar/RegisterDialog.tsx` (hanya perubahan label menjadi link), `components/Layout/Footer.tsx` (hanya link existing), `AGENTS.md`, `README.md`, `prd.md`.

**Sebelum produksi:** Dokumen privasi berbasis teks dari owner; kontrak vendor pemroses data, praktik pengumpulan/analytics aktual, larangan penjualan data, masa pemberitahuan satu hari dan persyaratan hukum masih perlu diverifikasi. Pengujian interaksi browser/HP dan registrasi end-to-end belum dilakukan dari sesi ini.


---

## 2026-09-22 — Halaman Syarat & Ketentuan dan link consent

**Permintaan:** Isi Syarat & Ketentuan berdasarkan naskah yang diserahkan owner, tanpa mengubah tampilan burger, Login maupun Daftar yang sudah disetujui.

**Implementasi:** `app/terms-and-conditions/page.tsx` menyediakan draft isi ID/EN yang mempertahankan urutan topik dokumen sumber namun memakai nama DC Organizer dan menghilangkan identitas perusahaan lain, alamat/domain/email Viding, lisensi konten tak terbatas, klaim minimum usia tak terverifikasi, angka pembayaran komisi mitra yang belum dikonfirmasi, dan pelepasan absolut seluruh tanggung jawab. Ketentuan biaya dan program mitra dirujuk ke penawaran/perjanjian nyata; user mempertahankan hak atas kontennya dengan lisensi terbatas untuk penyediaan layanan. `RegisterDialog` menghubungkan label existing “Syarat & Ketentuan” ke `/terms-and-conditions` (tab baru; checkbox/form tetap). `Footer` menautkan label terms yang sudah ada. Rule visual frozen dan kebutuhan review sebelum produksi dicatat dalam `AGENTS.md` dan `README.md`.

**Files:** `app/terms-and-conditions/page.tsx`, `components/Layout/Navbar/RegisterDialog.tsx` (markup tautan saja), `components/Layout/Footer.tsx` (href saja), `AGENTS.md`, `README.md`, `prd.md`.

**Validasi:** GitHub Actions build diperiksa setelah perubahan dan pengujian visual/form pada browser localhost masih harus dilakukan setelah sync. Sumber terms merupakan contoh pihak ketiga; isi hasil adaptasi harus disahkan sesuai aturan bisnis dan hukum DC Organizer sebelum produksi.


---

## 2026-09-23 — Perbaikan pemuatan PNG Pintu dan warning bunga landing

**Laporan pengguna:** Saat `pnpm dev` dengan Next.js 16.3.3/Turbopack, browser melaporkan `Could not load /eventplanner.png: undefined` dari `PortalWorld` pada landing; Next/Image mengeluh `/flower.png` memiliki parent `position: static`/tinggi 0 saat `fill`; Three.js juga mengeluarkan peringatan nonfatal `THREE.Clock` deprecated.

**Temuan:** GitHub `main` memuat `public/eventplanner.png` (ukuran 2.142.034 byte) beserta `Idigi.png`, `guestbook.png`, dan `Ufisik.png`. Keberadaan di remote **tidak membuktikan file bisa diambil dari localhost pengguna**: cek kesesuaian file lokal, huruf besar/kecil, status HTTP dan format PNG jika error masih muncul. Sebelumnya `PortalWorld` memakai `useLoader(THREE.TextureLoader, image)`, yang melempar ketika request atau decode texture gagal dan menjatuhkan seluruh `Canvas`.

**Perubahan terbatas:** `components/Landing/Pintu/SimpleDoorLab.tsx` mengganti loader suspending/throwing khusus gambar portal dengan `THREE.TextureLoader.load` dalam `useEffect`, callback sukses/error dan disposal ketika unmount. Saat loading/gagal, mesh gambar saja tidak dirender sehingga bidang Rose yang **sudah ada** di bawahnya tetap terlihat; berhasil load menampilkan aset asli yang sama, dengan warna sRGB, clamp, anisotropy, UV dan fade `entering` existing. Tidak ada penggantian foto ke stock image, perubahan geometri/frame Pintu, interaksi, portal zoom, audio atau route. `components/Landing/LandingFloralGlow.tsx` mengganti properti `fill` pada dua Next/Image `flower.png` dengan dimensi eksplisit dan kelas absolute/inset/h-full/w-full/object-contain, mempertahankan posisi dan animasi parent existing. Tidak ada perubahan pada `AssetDreamBackdrop`/eksperimen `/jiplak` atau warna/menu auth.

**Peringatan clock:** `THREE.Clock` deprecated tidak menyebabkan error image; scene masih memakai React Three Fiber, yang dapat memunculkan peringatan melalui internal library. Jangan mengklaim peringatan pasti hilang atau menaikkan major/minor dependency hanya untuk menekannya tanpa pengujian kompatibilitas.

**Validasi:** Build Validation GitHub Actions untuk code perubahan texture loader selesai PASS pada commit `3e5709d7927132cc5c5aaccdf31d60fd4f2b71b5` (run `35802656323`). Perubahan bunga, dokumentasi dan status CI terakhir dicek setelah push; status langsung HTTP localhost, rendering di GPU, dan apakah file remote telah tersinkron ke Windows pengguna belum bisa diperiksa lewat GitHub CI.


---

## 2026-09-23 — Three.js shadow-map warning on marketing Canvas

**Laporan:** `pnpm dev` menghasilkan pengulangan `THREE.WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.` dan `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` pada navigasi dari landing ke `/d-invitation`. Route dan endpoint `/api/templates`, `/api/templates/featured` mengembalikan 200; pada cuplikan ini tidak ada lagi exception memuat `eventplanner.png`.

**Diagnosis:** Pintu landing aktif `SimpleDoorLab` masih memberi `<Canvas shadows>` pada React Three Fiber 9; opsi boolean dapat menyetel `PCFSoftShadowMap` bawaan library meskipun source app tidak menyebut konstanta tersebut. Three.js yang sekarang menghapus mode lama dan secara internal memakai `PCFShadowMap`. Clock dapat dibuat pada inisialisasi root/Canvas internal React Three Fiber, bukan hanya akibat komponen `Fireflies` membaca `state.clock.elapsedTime`.

**Perbaikan minimal:** `components/Landing/Pintu/SimpleDoorLab.tsx` menetapkan `shadows={{ type: THREE.PCFShadowMap }}` sehingga shadow tetap aktif dan pilihan mode yang kompatibel tidak bergantung pada default lama. Geometri Pintu, directional/point light, material, kamera, animasi zoom dan transisi Rose, aset portal, ketukan sound dan layout tetap. Tidak menambahkan `console.warn` filter, mengubah semua renderer Three.js atau memperbarui dependency mayor/minor; peringatan `THREE.Clock` yang berasal dari library mungkin tetap muncul hingga ada perubahan upstream yang teruji kompatibel.

**Validasi:** Periksa GitHub Actions pada commit `c4778b6fa7a3bde27013055bbed38a3c11de1bb0` dan commit dokumentasi berikutnya; CI build tidak memverifikasi konsol browser/GPU pada perangkat pengguna. Browser lokal perlu diuji setelah sync untuk memastikan warning soft-shadow berhenti tanpa regresi visual.


---

## 2026-09-23 — Diagnostik Google Login tanpa perubahan visual

**Laporan user:** Google Login belum berfungsi di local dev Next.js `http://localhost:3000`. Pemeriksaan source `app/api/auth/google/route.ts`, `app/api/auth/google/callback/route.ts` dan `lib/auth/google.ts` menemukan implementasi OAuth redirect + kode tukar token/userinfo + penyimpanan user/session; `.env.example` sengaja menyimpan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` kosong dan ini **bukan bukti bahwa `.env.local` milik pengguna juga kosong**. Belum ada bukti akses Google Cloud Console, credential, konfigurasi private localhost, maupun hasil login end-to-end pada browser pengguna.

**Perbaikan aplikasi:** `getGoogleAuthorizationUrl` memvalidasi kedua env (ID **dan** Secret) di awal agar tidak memulai OAuth yang pasti gagal; `app/api/auth/google/route.ts` menghitung authorization URL sebelum menyimpan cookie `state` dan `next`. `GoogleOAuthError` mengklasifikasikan error tanpa menyimpan/mengirim token atau secret dalam URL: `google_config`, `google_token`, `google_profile`, dan `google_database`. Callback mempertahankan CSRF state-cookie check, safe next + role routing, membedakan pembatalan izin Google `google_denied` dari `google_state`, dan meneruskan kode error yang aman melalui `/login?error=...` ke root `AuthDialogHost`. `LoginDialog` menampilkan copy ringkas ID/EN yang sesuai kode error menggunakan form, warna, jarak, tombol dan overlay existing tanpa merombaknya. Gagal membuat akun/sesi tetap merupakan error database yang harus diperiksa pada server dan tidak dianggap problem Google Cloud secara otomatis.

**Konfigurasi operasional lokal:** `APP_URL="http://localhost:3000"`, `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di private `.env.local` (jangan dikirim ke chat/push ke Git), OAuth Google Cloud tipe **Web application** dengan redirect URI resmi persis `http://localhost:3000/api/auth/google/callback`; jalankan browser dari host `localhost` agar cookie state sesuai, jangan `192.168.x.x` jika APP_URL masih localhost. Perubahan env memerlukan restart `pnpm dev`, dan penyimpanan akun/sesi memerlukan database aktif/schema siap. Domain produksi memakai domain dan HTTPS callback resmi yang terdaftar terpisah. Pengaturan consent/audience/testing dapat memengaruhi akses akun Google tergantung scopes dan policy; jangan menganggap setiap mode Testing memerlukan penambahan test user untuk basic `openid email profile` tanpa memeriksa setting aktual Google.

**Pengujian:** CI build lulus hanya memverifikasi struktur/build kode, bukan kredensial operator dan alur jaringan Google/OAuth di localhost; status real login tetap perlu diverifikasi setelah setup privat dilakukan. Tidak menyentuh `BurgerMenuContent`, `Navbar`, `auth-styles`, `RegisterDialog`, landing, atau pintu/animasi.


---

## 2026-09-23 — Hierarki editorial dua awan pada landing

**Permintaan:** Revisi khusus kritik nomor 3: kedua ornamen awan pada landing saling bersaing tetapi teks di dalamnya terlalu kecil; awan kiri harus menjadi pembuka cerita yang lebih terbaca/dominan, sedangkan awan kanan menjadi lanjutan yang lebih tenang dan tidak terlalu dekat ke bawah. Tidak ada persetujuan untuk mengubah pintu, bunga, navbar, font brand, copy ataupun animasi.

**Implementasi:** `components/Landing/CloudCopy.tsx` saja: awan kiri sedikit lebih lebar pada desktop/mobile, judul serta deskripsi diperbesar dan ruang internal disesuaikan agar narasi pembuka menjadi fokus; awan kanan dirapikan tipografinya secara lebih ringan dan dinaikkan beberapa persen dari footer supaya tidak terlewat. Konten Indonesia/Inggris, SVG cloud outline/fill, keluarga font Cinzel/Fauna/DM Mono, reveal huruf, leave/return interaction, background, Pintu 3D/orbit/camera/portal, serta seluruh layout komponen lain tidak diubah. `AGENTS.md` menyimpan batas revisi ini.

**Validasi:** GitHub Actions memeriksa build setelah commit `97d285f613b6bc2061557f9c42ae6ba9c387373e`; screenshot nyata pada lebar/tinggi desktop dan mobile serta mode ID/EN perlu diperiksa owner setelah sync sebelum menyatakan overlap/komposisi final. Jangan memperluas scope ke kritik desain lain sebelum diminta.


---

## 2026-09-23 — Ukuran branding landing diperjelas tanpa menambah tinggi navbar

**Permintaan:** Branding DC Organizer dan tagline di kiri navbar landing `/` dan `/pagecontoh` lebih terbaca dibanding ilustrasi Pintu pada desktop; jangan menambah tinggi navbar atau background dan jangan mengubah area lain yang sudah disetujui.

**Perubahan:** Tambah varian `landing` ke `BrandWordmark` (nama Cinzel dari sebelumnya `text-3xl`/30px menjadi 34px mulai `sm` dan 36px mulai `lg`; tagline mono sebelumnya 8px menjadi 9px/10px mulai `sm`/`lg`). Ukuran mobile tetap semula untuk mengurangi risiko bertabrakan dengan kontrol kanan. `Navbar` memilih varian ini **hanya** pada `embedded` landing pathname `/` atau `/pagecontoh`, mempertahankan varian `public` untuk halaman lain, serta mengganti padding vertikal wrapper hanya pada landing dari `py-5` menjadi `py-5 sm:py-4` agar tinggi navbar desktop tidak bertambah. Nama, tagline, typography, warna Rose, posisi, interaksi dan navbar background lama dipertahankan. Dashboard wordmark serta pintu, awan, bunga, footer, popup auth dan kontrol kanan tidak diubah.

**Files:** `components/Brand/BrandWordmark.tsx`, `components/Layout/Navbar/Navbar.tsx`, `AGENTS.md`, `README.md`, `prd.md`. **Validasi:** Build Validation GitHub Actions diperiksa setelah push; screenshot desktop/mobile nyata perlu dilihat setelah sinkronisasi untuk memastikan ukuran baru tetap pas di navbar.


---

## 2026-09-23 — BrandWordmark satu komponen untuk seluruh halaman

**Koreksi owner:** Setelah ukuran logo di landing ditingkatkan, owner menegaskan brand tidak boleh berbeda antarlaman: `BrandWordmark` harus menjadi satu komponen yang digunakan bersama, bukan varian `landing` yang hanya dipakai di beranda. Catatan historis pada entri “Ukuran branding landing diperjelas” di atas menggambarkan implementasi sementara yang **digantikan oleh keputusan ini**.

**Kontrak sekarang:** `components/Brand/BrandWordmark.tsx` adalah sumber tunggal teks logo `DC Organizer`, font Cinzel, warna Rose, copy tagline, dan token ukuran responsif. Ukuran default `public` sekarang **24px mobile / 34px sm / 36px lg** untuk semua navbar publik (termasuk embedded halaman marketing), tagline opsional menjadi **8px mobile / 9px sm / 10px lg**. Varian `landing` dihapus karena membuat ukuran brand tidak sinkron. `components/Layout/Navbar/Navbar.tsx` memakai `<BrandWordmark showTagline />` yang sama di seluruh page, dengan wrapper `py-5 sm:py-4` agar tinggi navbar tidak bertambah secara berarti. `components/Layout/Footer.tsx` mengganti visual teks logo manual `D C / ORGANIZER` dengan komponen `BrandWordmark` yang sama. Logo Dashboard (`app/dashboard/page.tsx`) dan Usher (`components/Usher/UsherWorkspace.tsx`) sudah memakai komponen bersama dengan `size="dashboard"` atau `size="mobile"` yang lebih ringkas untuk header sempit; Dashboard tidak menampilkan tagline marketing. Semua penyesuaian brand mendatang wajib melalui komponen bersama, bukan per-page custom markup/font/color.

**Scope:** Perubahan visual yang disengaja hanya penyatuan ukuran brand publik dan teks logo footer ke wordmark kanonik. Jangan mengubah desain pintu, dua awan, navbar background/ikon/kontrol, hamburger, auth, audio dan layout laman lainnya. **Validasi:** GitHub Build Validation pertama pada commit `02669057c772e5b20558db7a511991a4d55ff605` gagal sementara karena navbar lama masih mereferensikan varian `landing` yang telah dihapus; masalah tersebut diperbaiki oleh commit navbar `ef5c985e6052949c8c1984ede61d24d3a546ac7c`, dengan CI kembali PASS, demikian pula commit footer `dd28c949cf6284d21a7e41d2dbf8fd2eeb550c37`. Perlu inspeksi aktual desktop dan mobile setelah sync untuk memastikan logo tidak memakan ruang kontrol di halaman publik.


---

## 2026-09-23 — Hover scale dan perspektif ukuran empat Pintu landing

**Permintaan owner:** Tanpa mengganti desain maupun animasi Pintu yang disetujui, saat pointer hover pintu terkait tampak lebih besar; saat empat Pintu berputar, Pintu yang di belakang sedikit lebih kecil agar Pintu yang di depan terasa lebih dominan.

**Perubahan hanya di `components/Landing/Pintu/SimpleDoorLab.tsx`:** `OrbitalDoors` mempertahankan posisi orbit (`x = sin(theta) * 2.85`, `z = cos(theta) * 1.25`), kecepatan orbit (`delta * 0.18`), arah pandang, animasi membuka daun, transisi dan metode easing skala (`MathUtils.damp` dengan parameter `3.8`). Skala pintu yang tidak dipilih kini terinterpolasi linear dari **0.62 pada belakang** hingga **0.85 pada depan** (sebelumnya 0.69–0.81). Hover ketika tidak ada pintu terpilih memberi multiplier skala **1.10** pada pintu yang ditunjuk saja, meluruh lembut melalui easing skala existing setelah pointer keluar. Saat sudah memilih pintu dan selama masuk, hover dimatikan dan skala existing **1.12 pada pintu terpilih/0.70 pada pintu lain** tetap. `prefers-reduced-motion` tidak mendapat animasi tambahan hover. Tidak menambah glow, tidak menghentikan orbit, dan tidak mengubah mesh, kusen, material, foto, kamera, objek, cahaya, tombol, route, awan atau komponen UI lain.

**Validasi:** Build Validation GitHub Actions diperiksa pada commit kode `657cec8e275a5733e39c3c6b711ef2779aaea513` dan head dokumentasi berikutnya. Kesesuaian skala/clip visual pada browser owner masih perlu ditinjau setelah sync, terutama saat pintu mengorbit di dekat awan pada lebar layar kecil. Aturan scope dicatat pada `AGENTS.md`.


---

## 2026-09-23 — Transisi glow Rose tanpa seam/kotak

**Laporan:** Selama zoom masuk Pintu dari landing ke halaman marketing, cahaya pink tampak mempunyai bentuk kotak/ubin. Pengguna meminta glow menyatu lebih halus **tanpa mengubah desain dan animasi Pintu**.

**Audit source:** `PortalTransition.tsx` memakai dua lapisan terpisah: solid Rose yang membesar dengan `clip-path: circle(0%→155%)` selama `cover`, dan radial gradient transparan pada elemen rectangular fullscreen yang dianimasikan dengan `transform: scale(0.7→1)` / `scale(1→1.25)` saat uncover, dengan durasi berbeda. Perbedaan bidang/timing dan tepi layer yang di-scale adalah kemungkinan penyebab seam rectangular; belum ada rekaman browser lokal yang memastikan asal setiap kotak secara definitif.

**Fix terbatas:** `components/Landing/Pintu/PortalTransition.tsx` kini hanya merender **satu elemen `fixed inset-0` berlatar Rose radial gradient yang tetap memenuhi seluruh viewport**, dengan gradient warna menyatu hingga batas viewport untuk Light dan Dark mode; hanya opacity elemen yang bergerak dari 0→1 dan 1→0. `app/globals.css` menghapus animasi clip-path/scale dan keyframe glow lapis kedua yang tidak lagi dipakai. Ketika hold, satu layer opacity penuh menutupi scene sehingga navigasi tetap terjadi di balik veil. **Tetap persis:** durasi link 780ms, cover dari Pintu 950ms, reveal 900ms; `dc-portal-start` dan `dc-marketing-reveal`, event/sound, flag transisi, pemilihan route, kontrol kesalahan navigasi, `prefers-reduced-motion`, kamera/zoom 3D, orbit dan ukuran hover, bentuk/material/bukaan pintu, serta puzzle assembly halaman tujuan. Tidak menambahkan aset gambar pintu ataupun lapisan baru saat transisi.

**Validasi:** Lint/build TypeScript dicek via GitHub Actions setelah commit kode `75a8aefa18bfc3813f9a1c163e825ef106d10a45` dan CSS `175c2849e0b4a7cb8d10fe2eae99c6820fd322cc`. Kualitas kompositing pada browser/GPU lokal, terutama Light/Dark dan navigasi normal vs Pintu, tetap memerlukan inspeksi owner setelah sync; hasil build bukan bukti bahwa seam sudah pasti hilang pada perangkat tersebut. Batas implementasi dicatat di `AGENTS.md`.


---

## 2026-09-23 — Menghilangkan kotak badan/frame saat transisi Rose

**Laporan lanjutan:** Sesudah glow kedua yang di-scale serta clip-path veil dihapus, owner masih melihat bentuk kotak pada bagian body saat kamera menuju halaman lain. Audit source memperlihatkan sumber segi empat yang berbeda: landing dan lima halaman marketing memakai frame 90vw dengan background translucent, border Rose, box-shadow dan `backdrop-blur`, sehingga outline frame tersebut tetap dapat terlihat melalui penutup Rose yang sedang fade meskipun penutup fullscreen tidak mempunyai batas kotak internal. Belum ada rekaman GPU yang membuktikan apakah ini satu-satunya penyebab visual.

**Perbaikan scoped:** Tambahkan hook atribut `data-dc-marketing-frame` hanya pada frame utama di `app/pagecontoh/page.tsx`, `app/d-invitation/page.tsx`, `app/event-planner/page.tsx`, `app/guestbook/page.tsx`, `app/undangan-fisik/page.tsx`, dan `app/template-design/page.tsx`. `app/page.tsx` mengekspor pagecontoh dan otomatis tercakup. Di `app/globals.css`, selama `html[data-dc-marketing-transition]` yang sudah diatur oleh `PortalTransition` aktif, buat **hanya chrome dekoratif frame** `background-color`, `border-color`, `box-shadow`, dan `backdrop-filter` menjadi transparan/tanpa shadow/blur dengan transisi sekitar 420ms; kembalikan ke desain semula setelah status transisi di-reset. Ukuran, radius, posisi, clipping/overflow, isi frame, navbar/footer, scrolI, bunga, pintu, kamera, waktu transisi, sound, routing dan efek puzzle tidak berubah. Di luar transisi, semua frame tampil persis seperti sebelumnya.

**Uji dan batas kepastian:** Periksa GitHub Build Validation sesudah commit CSS `fa84dba553ead62214de531d3c9b2337f5168c30`. Build tidak bisa mengonfirmasi artefak kompositing WebGL di komputer pengguna. Jika kotak masih muncul setelah sync, minta screenshot/rekaman singkat **pada frame video tepat saat kotak tampak** agar sumber (misalnya lapisan canvas, navbar/footer, atau background berbeda) diidentifikasi sebelum mengubah animasi Pintu yang sudah disetujui.


### Dashboard navigation and operational content (23 September 2026)

- Customer sidebar hover/active uses curved-outside Rose geometry inspired by the approved screenshot; keep neutral Light/Dark page/rail backgrounds, DC Organizer branding and existing functionality. Scope this style to the customer dashboard, not the approved landing or public navbar.
- Dashboard content prioritizes actionable controls, event-specific operational tables and factual metrics over repetitive explanatory labels. Show charts only where real persisted or derived data exists; do not invent demo figures. Preserve accessible menu states, mobile behavior, locale/theme controls and product access gates.


### Customer dashboard redesign (23 September 2026 — in progress)

`Dashboard-redesign.md` tracks staged implementation. Per screenshot owner terbaru, customer mobile/desktop sidebar menggunakan satu komponen dengan rail Rose (Deep Rose pada Dark Mode), navigasi putih, hover berbeda dari active, dan lengkungan luar khusus menu aktif. Canvas dashboard lebih hangat dengan Rose pucat dan panel netral. Beranda menampilkan daftar acara ringkas dengan aksi yang nyata, ditambah metrik dan visualisasi RSVP/publikasi dari data asli, bukan tabel panjang kosong. Akses, event scoping, ID/EN, Light/Dark, dan perilaku server tetap; audit tiap halaman dan visual QA masih terbuka.


### 2026-09-23 — Revisi dashboard berdasarkan screenshot terbaru

Owner meminta Rose lebih terasa, sidebar bersatu dengan desain brand, tombol konsisten dengan landing, serta konten yang mengutamakan fungsi dan data aktual. Ketentuan rail netral sebelumnya menjadi histori, bukan lagi visual baseline aktif. Scope hanya customer `/dashboard`: sidebar Rose dengan label putih, active lebih gelap, lengkungan luar hanya pada active, dan jarak menu mencegah tabrakan warna; main canvas Rose pucat dengan card netral pada Light Mode, serta near-black Rose-tinted pada Dark Mode. Beranda memakai hero Rose dengan CTA Tambah acara, daftar ringkas acara nyata, metrik nyata, ringkasan RSVP dan progres publikasi. Button biasa tetap memakai shared Button; CTA putih di hero Rose adalah pengecualian kontras lokal. Seluruh workspace mengikuti DashboardPrimitives yang sama. Tidak mengubah landing/Pintu, hak akses, atau data bisnis. Validasi visual dan audit halaman lain tetap dicatat di `Dashboard-redesign.md`.


### 2026-09-23 — Template pesan WA Blast

Sebagai referensi fungsi saja, Acara → WA Blast menambahkan template pesan Undangan, Pengingat RSVP, Pengingat hari acara, dan Ucapan terima kasih. Pengguna bisa menyimpan beberapa template per acara (maksimal 30), mengubah nama/judul/isi/kategori, pratinjau personalisasi berdasarkan penerima dan data acara, menyalin teks, serta menghapus template. Template tersimpan di database melalui model `WaBlastTemplate` terikat acara dan dilindungi auth/ownership serta akses Undangan Digital berbayar. Placeholder diizinkan: `{nama}`, `{acara}`, `{tanggal}`, `{lokasi}`, `{link}`; penyisipan tautan publik memerlukan undangan terbit sebelum teks bisa disalin. Template dapat dibuat tanpa membeli kuota WA Blast tambahan; kuota/penerima tetap mengikuti fitur existing. **Belum ada pengiriman massal atau penjadwalan; tombol salin tidak dianggap mengirim ataupun mengurangi kuota.** Harus ada integrasi provider dan pencatatan kuota sebelum pengiriman massal. Migrasi `20260923110000_add_wa_blast_message_templates` wajib dijalankan di lingkungan target melalui `pnpm db:deploy`. Desain mengikuti Rose dashboard DC Organizer, bukan UI situs referensi.


### 2026-09-23 — Mainframe Beranda dan pengaturan akun

Beranda customer menggunakan satu mainframe ber-outline Rose seperti bahasa visual landing, dengan brand `BrandWordmark` pada rail, navbar dan isi dashboard tetap dalam satu bingkai; background Light tetap netral/putih dengan Rose hangat, Dark near-black dengan Rose accent. Frame terpasang di shared `/dashboard` agar perpindahan menu tidak mematahkan layout. Konten panel operasional lain belum didesain ulang dan data metrik/event/RSVP asli tidak diubah. Landing Pintu, dekorasi marketing, login, dan hak akses tidak terpengaruh.

Menu pengguna pada navbar membuka **Profil Saya** (foto akun JPG/PNG/WebP sampai 5 MB, nama depan/belakang, email read-only), **Pengaturan akun** (perubahan password memerlukan password lama, password baru minimal 8 karakter, konfirmasi di UI), Transaksi, Beli layanan, FAQ, dan Keluar. Avatar akun bukan foto event/invitation; file tervalidasi/didekode Sharp, diubah ke WebP, disimpan dalam folder per-user dengan nama acak dan URL tercatat pada `User.avatarUrl`. Menu header memakai foto yang tersimpan atau inisial sebagai fallback. Endpoint `/api/profile/avatar` dan `/api/profile/password` memeriksa sesi server; setelah password berubah seluruh sesi lama dicabut dan sesi perangkat aktif diterbitkan ulang. Email dan pembayaran tidak diubah dari halaman profil.

**Affected:** `app/dashboard/{page,layout}.tsx`, `components/Dashboard/{DashboardSidebar,DashboardAccountPanel,dashboard-types,dashboard-navigation,useDashboardI18n}.tsx`, `app/globals.css`, `app/api/{profile,profile/avatar,profile/password,dashboard/context}/route.ts`, `prisma/schema.prisma`, `prisma/migrations/20260923115000_user_avatar_url/migration.sql`, `README.md`, `AGENTS.md`, `Dashboard-redesign.md`, `prd.md`.

**Commits:** implementasi bertahap langsung ke `main`: `a08c4c4` (schema), `315c0bb` (migrasi), `fbca130` (avatar API), `3f96cea` (password API), `cb3c56d` (panel akun), `50d32b1` (integrasi Beranda/menu), `528fd88` (layout), `ce8f16c` (brand rail), `36bac74` (mainframe CSS), `de0a685` (i18n), `5e64f19` (dismiss dropdown via klik luar/Escape), dan dokumentasi lanjutannya. **Validasi:** build/CI belum dikonfirmasi pada saat penulisan; browser desktop/mobile dan akses database produksi belum diuji. Sesudah sync jalankan `pnpm db:deploy` terhadap database target, kemudian `pnpm db:generate` (jika client belum dibangun ulang). Uji unggah foto, update nama, password salah/benar, login ulang perangkat lain, Light/Dark dan dropdown mobile. Penyimpanan avatar ke disk VPS mengikuti pola upload existing; deployment dengan filesystem ephemeral perlu media storage persisten sebelum produksi.


### 2026-09-23 — Koreksi mainframe Beranda: inner scroll + warna landing

**Alasan:** Frame iterasi sebelumnya memakai `min-height` sehingga ketika konten panjang, halaman browser dan frame ikut memanjang; warna rail Rose penuh dan canvas #fff5f7 juga masih mengabaikan permintaan owner untuk putih/hitam ber-outline Rose.

**Implementasi:** `app/dashboard/page.tsx` sekarang memakai frame tinggi viewport dengan flex-column workspace, navbar tetap dan `main.dc-dashboard-scroll` sebagai satu scrollport internal, reset posisi scroll ketika pindah menu. `DashboardSidebar` memakai mobile drawer/scrim yang dibatasi frame. `app/globals.css` mengganti aturan frame lama dengan model landing (90vw/90dvh mobile, inset 23px tablet/27px desktop), body scroll terkunci hanya ketika dashboard terpasang, dan prioritas CSS baru untuk Light putih / Dark hitam, sidebar/nav/heading/outlines Rose, hero putih/hitam ber-outline Rose, serta tombol primer mengikuti warna global. Semua event/RSVP/profile APIs, landing/Pintu dan aset marketing tetap.

**Commits:** `267ae839` (frame/scrollport dashboard), `d09c230f` (drawer mobile dalam bingkai), `7543b6ef` (CSS frame serta warna landing), kemudian pencatatan dokumentasi ini. **Validasi:** pengecekan statis sumber telah dilakukan; build GitHub Actions dan visual scroll pada browser belum diverifikasi. Uji Beranda panjang, menu lain, dropdown user, drawer mobile, kedua mode dan scrolling di berbagai ukuran sebelum menyatakan hasil visual disetujui.


### 2026-09-23 — Backdrop Rose solid dan garis aksen kartu Beranda

Owner memilih bidang luar mainframe berwarna pink brand yang tebal/solid, bukan radial glow pucat atau white/black kosong. `/dashboard` menggunakan background luar `var(--primary)` (`#C07A84`) pada Light dan Dark; mainframe tetap berpermukaan putih atau hitam di dalam, border frame dibuat terang agar kontras dari Rose luar. Ukuran frame, inner scrolling, sidebar, navbar, data asli dan landing/Pintu tidak berubah. Shared dashboard surfaces memiliki border Rose halus dengan garis sisi kiri 3px; panel ringkasan acara dan RSVP/publikasi memakai garis kiri 4px; metric cards kini juga memakai garis kiri Rose 3px, bukan garis atas. Seluruh kartu kecil hanya membulat pada sudut kanan atas; ketiga sudut lainnya siku. Tidak ada seluruh kartu yang diberi fill pink.

**Affected:** `app/globals.css`, `prd.md`, `AGENTS.md`, `README.md`, `Dashboard-redesign.md`. **Commit aplikasi:** `0b2415e`. **Validasi:** perubahan CSS terpasang di `main`; browser visual dan build CI terbaru belum diverifikasi.


### 2026-09-23 — Geometri kartu dashboard: siku dengan round hanya kanan atas

Pembaruan pilihan owner: kartu-kartu kecil dashboard (statistik, panel informasi/acara/RSVP, compact stat, notifikasi dan empty state) memakai tiga sudut siku dan hanya sudut **kanan atas** membulat. Semua garis aksen Rose diposisikan **vertikal di kiri**, bukan di atas; ketebalan standar 3px dan panel utama Beranda/hero 4px. Kartu tetap putih pada Light Mode dan near-black pada Dark Mode. Perubahan berlaku pada komponen bersama (`DashboardPrimitives`) dan kartu Beranda (`DashboardWorkspaces`) dengan CSS khusus `dc-dashboard-scroll`; mainframe luar, radius tombol/badge, sidebar, scroll internal, WhatsApp dan data asli tidak diubah.

**Affected:** `components/Dashboard/DashboardPrimitives.tsx`, `components/Dashboard/DashboardWorkspaces.tsx`, `app/globals.css`, dokumentasi. **Commits aplikasi:** `f1ef401c`, `35d2a89b`, `c50ef71f`. QA visual desktop/mobile dan CI setelah perubahan ini belum diverifikasi.


### 2026-09-23 — Finalisasi lis kartu seragam 0,3 cm pada seluruh dashboard

Instruksi owner terbaru **menggantikan aturan historis 3px/4px** pada kartu: semua panel/kartu di dalam `/dashboard` memakai **satu token `--dc-dashboard-card-stripe: 0.3cm`**, dengan lis vertikal Rose di kiri setebal token itu. Sisi atas, kanan dan bawah tetap outline tipis. Sudut kiri atas, kiri bawah dan kanan bawah siku; **hanya kanan atas** yang membulat dengan radius mengikuti skala komponen. Bidang luar mainframe tetap Rose solid, ruang kerja Light putih dan Dark near-black.

Cakupan: shared `DashboardSurface`, `DashboardMetricCard`, `DashboardCompactStat`, `DashboardNotice`, `DashboardEmptyState`, Beranda hero, profil, panel Acara, Undangan, Personal Invitation, WA Blast template/penerima, RSVP, Manajemen Tamu dan ringkasan Usher. Kartu khusus diberi class eksplisit `dc-dashboard-detail-card` yang memakai token dan radius sama; daftar template WA Blast mempertahankan hover/selected; drag tamu tetap punya interaksi. Area denah interaktif, form controls, tombol, badge, modal, navbar, sidebar dan bingkai utama tidak memakai lis tersebut. API/data sesungguhnya, sesi, publikasi, WhatsApp help dan landing/Pintu tetap.

**Affected:** `app/globals.css`, `components/Dashboard/{DashboardAccountPanel,DashboardWorkspaces,EventPanel,InvitationWorkspacePanel,RsvpAnalyticsPanel,PersonalInvitationPanels,WaBlastPanels,WaBlastTemplateStudio,SeatingChart}.tsx`, `prd.md`, `AGENTS.md`, `README.md`, `Dashboard-redesign.md`. **Commits:** `88421462` (token/aturan semua kartu), `9074f5d` (padding), `524e6d4` hingga `1412bac` (kartu setiap fitur), `3947dfc` (hover/selected), `c60188e` (profil). **QA:** perlu browser desktop/mobile, mode terang/gelap, flow tombol, list panjang dan drag/drop; build CI harus diperiksa sebelum dinyatakan lolos.


### 2026-09-23 — Redesign halaman dashboard tanpa frame di dalam frame

Perintah owner terbaru: **jangan menumpuk panel berkotak di luar kartu-kartu kecil**. `DashboardPanel` menjadi semantic section datar: judul/tombol aksi langsung di canvas area konten, dengan pemisah bawah yang ringan, tanpa border, background kartu, padding kotak, ataupun lis tebal pada wrapper. Seluruh daftar Undangan, Personal Invitation, WA Blast template/penerima, RSVP, Manajemen Tamu dan Usher yang menggunakan komponen ini langsung menampilkan kartu kecil di bawah judul; data dan aksi masing-masing kartu tidak berubah. Daftar Acara yang sebelumnya dibungkus `DashboardSurface` juga menjadi section datar dengan kartu acara satu lapisan; empty state dan empty EventScopePicker tidak lagi dibungkus kartu lain. Pengaturan password di dalam kartu Personal Invitation sekarang inline di belakang pemisah, bukan kartu anak.

Komposisi Beranda tetap: hero, statistik dan panel informasi merupakan kartu-kartu **sejajar**, bukan kartu yang membungkus kartu lain; ringkasan acara dalam panel berupa baris tanpa border kartu tersendiri. `DashboardSurface` untuk foto profil, informasi pribadi dan security merupakan masing-masing kartu mandiri yang berisi field; area stage denah merupakan satu surface fungsional. Tidak menghapus batas field/input, tombol, badge atau konfirmasi yang penting untuk usability. Lis Rose seragam `0.3cm` hanya untuk kartu sungguhan, tidak untuk section/wrapper datar; radius hanya di kanan atas. Mainframe pelanggan, Rose luar, scroll dalam, light/dark, WhatsApp, data nyata, endpoint, dan landing/Pintu tetap.

**Affected:** `components/Dashboard/{DashboardPrimitives,EventPanel,EventScopePicker,PersonalInvitationPanels}.tsx`, `prd.md`, `AGENTS.md`, `README.md`, `Dashboard-redesign.md`. **Commits aplikasi:** `934f6032` (section bersama unboxed), `2dbf3a23` (daftar acara tanpa wrapper), `7010c3d4` (empty event picker tidak nested), `77912eaa` (pengaturan password inline). **QA belum terverifikasi:** browser viewport desktop/mobile dan kedua tema, nested grids, scrolling, layout daftar dan editor WA/RSVP/Seating Chart serta build CI.


### 2026-09-23 — Koreksi terbaru: hanya frame besar, isi berupa baris tanpa kartu

Owner menegaskan iterasi sebelumnya (section datar + banyak kartu kecil) justru terlihat ramai. **Aturan TERBARU ini menggantikan instruksi sebelumnya agar seluruh `DashboardPanel` datar:** setiap kelompok fungsi mempunyai **satu frame besar** yang menampung judul, tombol aksi, filter dan isi. Di dalam frame besar **tidak boleh ada frame/kartu kecil terpisah**: item acara, undangan, template WA, penerima, data tamu, RSVP dan daftar Usher cukup menjadi baris dengan pemisah halus. Empat statistik/metrik yang sebelumnya menjadi empat kartu kecil kini digabung ke **satu panel statistik besar** dengan nilai ditata dalam kolom responsif tanpa outline, shadow atau lis masing-masing. Kartu utama Beranda (sambutan tanpa lingkaran dekoratif, panel statistik, daftar terbaru, ringkasan RSVP/publikasi) tetap beberapa frame besar setara, **tidak bertumpuk**. Form profil memakai panel besar mandiri. Area denah tetap fungsional namun border frame ekstra di dalam panel dihilangkan.

Lis Rose konsisten `--dc-dashboard-card-stripe: 0.3cm`, border halus sisi lain dan hanya sudut kanan atas yang membulat **pada frame besar bagian terluar saja**. `DashboardPanel` kembali memakai `DashboardSurface` sebagai satu frame besar; `DashboardMetricGrid` menjadi `dc-dashboard-metric-group` satu frame besar, sementara metrik anak tanpa fill/border/shadow/radius. `dc-dashboard-detail-card` yang menjadi baris di dalam `dc-dashboard-panel` secara scoped di-reset: tanpa lis, border kartu atau sudut melengkung, pemisah horizontal tipis dan jarak antarbaris rapat. WA template terpilih dan hover tetap terlihat. Status/empty/compact stat di dalam panel tidak membentuk kartu baru. List acara sekarang berada dalam `DashboardPanel` besar, bukan section datar dengan kartu kecil. Hanya saat suatu komponen benar-benar berdiri sendiri di luar panel besar, permukaan kartu standalone boleh mempertahankan frame. Tidak mengubah tombol, input, badge, data/event API, publish, permission, profile, WA Blast, mainframe luar, warna Light/Dark, scroll, WhatsApp Help atau landing/Pintu.

**Affected:** `components/Dashboard/{DashboardPrimitives,EventPanel,SeatingChart}.tsx`, scoped `app/globals.css`, `prd.md`, `AGENTS.md`, `README.md`, `Dashboard-redesign.md`. **Commits aplikasi:** `5cd96a41` (panel dan metrik disatukan), `11c2f963` (style group, reset nested rows), `cdc162ca` (list Acara kembali dalam satu panel), `e3b2e472` (rapikan sela baris), `99621037` (hapus border tambahan denah). **QA:** static review dilakukan; tampilan browser desktop/mobile kedua tema, klik template dan drag-and-drop serta build CI masih memerlukan verifikasi aktual.


### 2026-09-23 — Manajemen Tamu menjadi dropdown 2 submenu

Sidebar dashboard sekarang menempatkan **Manajemen Tamu** sebagai grup menu yang dapat dibuka/tutup, berisi tepat dua submenu berurutan: **Undangan Personal** (tab `personalInvitation`, halaman Personal Invitation lama dipindahkan dari grup **Acara**) dan **Pengaturan Meja** (tab `placement`, menggantikan link Manajemen Tamu yang dahulu berdiri sendiri). Grup **Acara** tetap Rangkaian Acara, Undangan dan WA Blast; RSVP dan Usher App tetap link mandiri. Pindah menu mempertahankan ID tab, data/endpoint, logika publikasi personal, state RSVP, penempatan meja dan aksi masing-masing halaman. Menu yang dipilih membuka grupnya otomatis, item aktif tetap jelas, state `aria-expanded`/`aria-current` tersedia, dan memilih submenu pada HP menutup drawer seperti sebelumnya. Header/submenu memakai nama Indonesia yang konsisten dengan terjemahan Inggris (`Personal Invitation` / `Table Setup`); bahasa default tetap Indonesia.

**Affected:** `components/Dashboard/{dashboard-navigation,DashboardSidebar,PersonalInvitationPanel,DashboardWorkspaces,useDashboardI18n}.ts(x)`, `app/dashboard/page.tsx`, dokumentasi. **App commits:** `f9719552`, `533a3b74`, `3435b03e`, `39e1b503`, `f6efbb60`, `da508730`. Tidak mengubah design mainframe, frame besar dashboard, permission, data tamu, WhatsApp atau public landing/Pintu. QA browser mobile/desktop dan build CI terbaru belum diverifikasi.


### 2026-09-23 — Input Undangan Personal terpadu pada satu Guest (implementasi)

**Model data tunggal:** Undangan Personal bukan record tamu baru dan tidak memiliki tabel khusus yang menduplikasi nama, nomor, kelompok, kategori atau RSVP. Gunakan `Guest.id` + `invitationId` yang sudah dipakai RSVP, WA Blast, Pengaturan Meja dan Usher. `Guest.name` dan `phone` merupakan data tamu utama, `Guest.category` digunakan untuk Reguler/VIP/VVIP (data kategori khusus lama tetap dijaga), `Guest.tags` menyimpan kelompok. Penambahan di tabel `Guest` hanya `personalAddressee` (nama tampilan amplop), `recipientType` (perorangan/pasangan/keluarga/rombongan), `invitedPax` (kuota 1–30 orang), `personalGreeting` (pesan khusus), dan `personalSharedAt` (kapan operator **menandai secara manual** bahwa tautan dibagikan). `personalToken`, `personalPublished`, `personalViewCount`, `rsvpStatus`, `plusOnes`, `checkedIn`, `tableId` serta `waBlastSelected` sudah ada dan **tidak diduplikasi**. `invitedPax` adalah orang yang *diundang*, sedangkan `plusOnes + 1` hanya orang yang *konfirmasi hadir*, dan tidak boleh ditimpa angka kuota.

**UX input:** Pengguna memilih tamu yang sudah ada atau menambahkan nama + WhatsApp opsional pada form yang sama. Form utama menampilkan jenis penerima, kuota dan kategori dengan default Reguler; pengaturan tambahan (nama di amplop, kelompok dipisah koma, pesan khusus) dapat dibuka bila perlu. Form edit pada daftar menggunakan field identik. Backend memvalidasi data di satu helper, menghindari duplikat tamu baru yang sama nama + nomor dalam satu acara (409, pengguna diminta memilih dari daftar), menjaga tamu existing pada acara terkait dan menolak kuota yang lebih kecil dari RSVP hadir yang telah tersimpan. Menandai dibagikan merupakan tindakan manual tersendiri, bukan akibat copy tautan, dan tidak boleh dianggap status pengiriman/penerimaan WA.

**Integrasi antarhalaman:** `/api/guests` mengekspos atribut baru dari `Guest` yang sama sehingga RSVP, WA Blast, Pengaturan Meja dan Usher membaca kategori, kelompok, nomor serta kuota tanpa input kedua; daftar Undangan Personal menampilkan status publish/buka/bagikan/RSVP/check-in dan nama meja dari relasi yang sama. Di publik, nama amplop dan pesan khusus tampil dari `Guest`. Personal RSVP wajib membawa `Guest.id` beserta token unik dan `invitedPax` ke form dan API. Server memverifikasi token/status publikasi lalu memperbarui **Guest yang sudah ada**, bukan membuat tamu baru; RSVP hadir menolak jumlah di atas kuota. Ringkasan pax hadir menghitung hanya `rsvpStatus=ATTENDING`. Preview pemilik menampilkan nama amplop/pesan yang sama. Status kategori tidak otomatis menentukan tempat duduk atau akses tambahan.

**Batasan saat ini:** Satu `Guest` dapat mewakili penerima perorangan, pasangan, atau rombongan dengan satu tautan dan satu record RSVP/QR. Denah meja saat ini menempatkan satu **record Guest** ke satu kursi, bukan otomatis membuat kursi tersendiri untuk setiap pendamping; hal ini harus dikembangkan dengan struktur peserta/seat tersendiri apabila kelak dibutuhkan, bukan duplikasi Guest. Import CSV/Excel, pengiriman WhatsApp sesungguhnya dan fasilitas khusus per kategori bukan bagian dari implementasi ini.

**Migrasi WAJIB setelah git pull:** `pnpm db:deploy` pada database tujuan, lalu `pnpm db:generate` sebelum `pnpm build`/`pnpm dev`. Dua migrasi: `20260923124000_guest_personal_invitation_details` menambah kolom ke tabel Guest, `20260923124500_backfill_personal_invitation_quota` mempertahankan kuota minimal untuk tamu personal yang sudah RSVP hadir bersama pendamping. Tidak perlu menyalin/migrasikan tamu ke tabel lain, data lama tetap ada. Browser end-to-end (RSVP, mobile, Light/Dark, DB koneksi nyata) perlu diuji. GitHub Actions build menjalankan Prisma generate sebelum build.


### 2026-09-23 — Title Case Nama Dan Judul UI, Termasuk Judul Frame Dashboard

**Requirement:** Seluruh nama dan judul UI yang berdiri sendiri memakai huruf kapital pada awal setiap kata (Title Case), termasuk header frame/panel besar, judul halaman, nama navigasi, judul metrik, dan nama orang/acara saat ditampilkan. Singkatan/brand tetap pada ejaan resmi. Deskripsi kalimat, pesan, teks bantuan, identifier kode, dan data asli pengguna tidak diubah.

**Implementasi:** `app/globals.css` menerapkan kapitalisasi khusus Dashboard untuk heading, menu dan kelas nama/judul/label eksplisit, tanpa menyentuh landing dan artwork undangan. `components/Dashboard/DashboardPrimitives.tsx` menandai label metrik dan judul empty state; `DashboardWorkspaces.tsx`, `PersonalInvitationPanels.tsx`, dan `InvitationWorkspacePanel.tsx` menandai nama tamu/penerima serta judul acara yang tampil. Dropdown tamu tetap memakai isi `option` berupa teks biasa. Penambahan aturan lintas halaman dicatat di `AGENTS.md` dan `README.md`; requirement aktif pada §15.1a.

**Commits aplikasi:** `568b5d77`, `7f494d52`, `9d4590a3`, `91fb6727`, `c8c76d67`, `71c7f4d4`. **Validasi:** perubahan source diperiksa pada file terkait; build, CI, browser Light/Dark, ID/EN dan mobile belum dijalankan/diverifikasi dalam sesi ini. Tidak ada perubahan skema atau migrasi data.


### 2026-09-23 — Teks Orang Tua Title Case Dan Pilihan Anak Tertua/Termuda/Numerik

**Requirement/hasil:** Keterangan keluarga pada form dan undangan memakai Title Case, termasuk `Dari` dan nama orang tua. Setiap mempelai dapat memilih Anak Tertua / Anak Termuda / Anak Keberapa (radio eksklusif); input angka hanya tersedia untuk mode numerik. Preview Dashboard dan renderer publik menggunakan formatter terpusat; tema Romantic Rose dan sembilan tema Universal kini menampilkan keterangan orang tua di bagian identitas/mempelai, bukan hanya renderer Classic/legacy.

**Penyimpanan & kompatibilitas:** Dua kolom mode nullable ditambahkan pada model `Invitation` dengan migrasi `20260923152000_wedding_child_position`; urutan anak numerik lama tidak dimigrasikan maupun ditafsir ulang. API membuat, memperbarui, memvalidasi, dan mengembalikan data yang sama; publish lock tetap berlaku. Tidak ada duplikasi parent atau child order pada tabel Guest, dan tidak ada perubahan desain Pintu/landing. Dibutuhkan `pnpm db:deploy`, `pnpm db:generate` setelah pull sebelum menjalankan aplikasi dengan DB yang dituju.

**Affected:** `lib/events/parents.ts`, `components/Dashboard/{EventFields,EventPanel,event-panel-helpers,event-panel-types,useDashboardI18n}.ts(x)`, `app/api/invitations/route.ts`, `components/PublicInvitation/{PublicInvitation,ClassicInvitationTemplate,RomanticRoseTemplate,UniversalInvitationTemplate}.tsx`, `prisma/schema.prisma`, migrasi terkait, `tests/wedding-parents.test.mjs`, `.github/workflows/build.yml`, `AGENTS.md` dan `README.md`. **Validasi:** GitHub Actions pada commit aplikasi `4c545c47` sukses (`https://github.com/wanzy0808/DC/actions/runs/35837213786`): Prisma generate, regression tests (guest filters + wedding parent formatter), dan production build. Integrasi database tujuan/migrasi nyata serta pemeriksaan visual browser/mobile belum dijalankan dalam sesi ini. **Commits utama:** `3977e4e6`, `b8f1402e`, `bfbdce9a`, `8341f7bf`, `c49d8cbf`, `6aeed1df`, `41c3b666`, `4a4a8115`, `8f297589`, `e0e7ce4c`, `8dc80b41`, `353cfeb1`, `4c545c47`. 


### 2026-09-23 — Title Case Opsi Dropdown & Logout Owner Panel

**Requirement/implementasi:** Dropdown Dashboard/RSVP yang sebelumnya tampil sentence case menggunakan Title Case secara konsisten, termasuk pilihan dinamis acara, tamu, kategori/tag, pengurutan RSVP dan template WA Blast; pilihan status pada formulir RSVP undangan publik ditulis `Saya Akan Hadir`, `Saya Tidak Hadir`, `Saya Masih Tentatif`. `lib/text/display-title-case.ts` memberikan transformasi tampilan dengan mempertahankan singkatan/brand; `app/globals.css` menerapkan gaya scoped untuk native select, tetapi teks opsi dinamis juga diformat di JSX agar tidak bergantung pada dukungan browser. ID internal, data asli, filter, penyimpanan, isi pesan, landing dan template artwork tetap apa adanya.

**Owner Panel:** Header `components/Owner/OwnerDashboard.tsx` sekarang berisi `SessionLogoutButton` yang memanggil endpoint sesi existing dan membuka Login hanya setelah keberhasilan server, dengan loading/retryable error. `components/Admin/AdminLogoutButton.tsx` menggunakan komponen shared yang sama; tidak ada duplikasi endpoint atau autentikasi baru.

**Area/berkas:** `components/Dashboard/{EventScopePicker,EventPanel,RsvpAnalyticsPanel,PersonalInvitationPanels,PersonalInvitationGuestFields,SeatingChart,WaBlastPanels,WaBlastTemplateStudio,WhatsAppBlastPanel}.tsx`, `components/InvitationStudio/RsvpPanels.tsx`, `components/{Owner/OwnerDashboard,Admin/AdminLogoutButton,Auth/SessionLogoutButton}.tsx`, `lib/text/display-title-case.ts`, `app/globals.css`, `tests/display-title-case.test.mjs`, `AGENTS.md`, `README.md`. **Database:** tidak ada perubahan skema ataupun migrasi tambahan; migrasi wedding child position dilaporkan owner sudah dijalankan secara lokal. **Validasi:** GitHub Actions pada commit `310ca5af` sukses (`https://github.com/wanzy0808/DC/actions/runs/35840955348`): Prisma generate, semua `node --test tests/*.test.mjs` termasuk tes Title Case dropdown, dan production build. Interaksi native popup lintas browser serta sesi Logout Owner secara end-to-end masih memerlukan uji browser login nyata.


### 2026-09-23 — Jarak Panah Dropdown Pada Input Data

**Permintaan:** Panah pada field dropdown data/form terlalu menempel pada sisi kanan, sementara panah menu navigasi sudah sesuai dan tidak perlu berubah.

**Implementasi:** `app/globals.css` menargetkan hanya native `select` di dalam `main` area `dc-dashboard`/`dc-usher`: panah bawaan browser diganti dengan ikon SVG Rose 15px berjarak sekitar 18px dari batas kanan; ruang teks diberikan 3rem agar tidak bertabrakan. Gambar panah dipertahankan ketika kontrol hover/focus/disabled. `components/Dashboard/EventScopePicker.tsx` (memiliki ikon sendiri) serta dua dropdown jam/menit compact di `EventFields.tsx` mengecualikan styling baru melalui `data-dc-native-chevron="true"`. Panah menu/sidebar/navbar, layout field, label/nilai pilihan, database, dan template undangan tidak diubah.

**Validasi:** Kode telah dikirim ke branch `main`; hasil CI/build dan pemeriksaan visual lintas browser dicatat terpisah setelah pemeriksaan. Tidak ada migrasi DB.


### 2026-09-23 — Judul Frame Rose & Keseragaman Tombol Dashboard

**Permintaan:** Semua judul frame/panel Dashboard memiliki warna pink Rose yang konsisten dan Title Case; tombol aksi yang masih putih dengan tulisan Rose di berbagai halaman diselaraskan dengan tombol baku aplikasi. Jangan mengubah menu navigasi dan teks naratif/data tamu.

**Implementasi:** `DashboardSectionHeader` kini menggunakan kelas `dc-ui-title` serta `text-primary`. Aturan scoped dalam `app/globals.css` memastikan header dari frame besar `DashboardPanel`, Beranda, serta panel akun/Owner menggunakan Rose dan display-only Title Case, tanpa mewarnai semua baris, isi RSVP, nama tamu, pesan dan deskripsi. Aksi `Undangan` dalam daftar acara Beranda yang sebelumnya berupa `Link` putih berteks Rose diubah menjadi `Button asChild` dengan `Link` dan URL asli. Tombol untuk menyisipkan placeholder WA Blast yang sebelumnya memiliki `bg-primary/10 text-primary` diubah menjadi `Button size="xs"` tanpa mengubah event, nilai atau validasinya. CSS lama yang menimpa semua tombol aksi justify-start di grid menjadi latar putih/neutral dengan `!important` dihapus; tombol yang sudah menggunakan `Button` kembali memperoleh fill Rose `#C07A84`, teks putih pada Light dan hitam pada Dark, serta perilaku hover/focus standar.

**Perluasan audit halaman Studio/Guestbook:** `components/InvitationStudio/GuestManagement.tsx` memakai `Button asChild` untuk ekspor CSV RSVP; `GuestManagementPanels.tsx` memakai `Button asChild` untuk Upgrade Guestbook dan `Button type="submit"` untuk aksi Tambah Meja/Simpan Data Tamu. `PhotoPanel.tsx` memakai gaya `buttonVariants` pada label upload foto yang harus tetap membungkus input file dan memakai `Button` untuk aksi galeri/opsi foto; `DesignerPanels.tsx` memakai gaya yang sama pada label upload musik. Aksi dan nilai semula tetap sama. Kontrol pemilihan template/foto/palet, navigation/account menu, icon-only, filter, dan input biasa tetap memakai treatment fungsi khusus, bukan diubah menjadi tombol CTA.

**Pengecualian dan validasi:** Kontrol menu, pemilih daftar/foto, data RSVP, serta artwork undangan/landing/Pintu tidak diubah. Tidak ada migrasi database. CI sukses untuk perubahan Dashboard pada commit `e7f17727` (`https://github.com/wanzy0808/DC/actions/runs/35846550241`), dan CI setelah perluasan Studio pada commit dokumentasi `c7160430` sukses (`https://github.com/wanzy0808/DC/actions/runs/35847518126`): Prisma client generate, seluruh tes dan production build lulus. Pemeriksaan visual browser nyata Light/Dark dan seluler belum dilakukan.


### 2026-09-23 — Keseragaman Judul Frame & Tombol Dashboard

- Seluruh judul frame/section operasional Dashboard menggunakan warna brand Rose/pink dan Title Case untuk tampilan. Judul baris/data biasa tetap netral agar hierarki visual tidak terlalu ramai.
- Semua CTA/action button di area konten Dashboard dan Usher menggunakan primitive `components/ui/button.tsx` dengan visual DC Organizer yang sama: background Rose `#C07A84`, teks putih pada Light Mode, teks hitam pada Dark Mode, serta hover Rose lebih dalam/lebih terang sesuai theme. Override lama berupa background putih + teks Rose tidak boleh mengubah tampilan tombol operasional.
- Primitive Button diberi marker `dc-app-button`; aturan scoped di `app/globals.css` menormalkan tampilannya hanya di dalam `<main>`, sehingga navbar/header/account controls yang memang punya treatment khusus tidak ikut berubah. Tombol ikon kecil seperti close/X, badge/status, link teks biasa, landing page, serta artwork undangan bukan bagian dari aturan CTA ini.
- Kapitalisasi judul bersifat display-only dan tidak mengubah data di database/API. Tidak ada migrasi database.


### 2026-09-23 — Menu Masuk/Daftar Menjadi Dashboard Setelah Login

**Kebutuhan:** Ketika pengguna sudah berhasil login dan kembali ke Home atau halaman publik DC Organizer, burger navbar tidak lagi menampilkan Masuk dan Daftar. Slot Masuk berubah menjadi tautan **Dashboard**, sementara Daftar disembunyikan. Setelah logout, kedua opsi tamu muncul kembali. Gaya, warna, posisi, animasi, menu layanan, tombol bahasa/tema, Pintu dan dialog autentikasi tidak boleh berubah.

**Implementasi:** `components/Layout/Navbar/BurgerMenuContent.tsx` membaca sesi dari endpoint `GET /api/auth/session` menggunakan `cache: "no-store"` setiap menu dibuka; saat pemeriksaan, slot autentikasi berisi placeholder nonaktif untuk menghindari flash Masuk/Daftar yang salah. Jika autentikasi valid, hanya satu `Link` Dashboard dengan gaya Rose yang sudah disetujui yang tampil. Jika tidak login (401), markup Masuk (`Link` yang membuka popup Login) dan Daftar (`Button` yang membuka popup Register) tetap sama. Tidak memakai localStorage untuk menebak login. `lib/i18n.ts` menyediakan label Dashboard di ID/EN. `lib/auth/dashboard-route.ts` merupakan sumber bersama tautan sesuai peran: USER → `/dashboard`, OWNER → `/owner`, ADMIN/FINANCE → `/admin`, DESIGNER/EDITOR → `/designer`; `components/Auth/LoginDialog.tsx` kini memakai helper yang sama tanpa mengubah redirect `next` valid untuk USER. `tests/dashboard-route.test.mjs` memeriksa rute setiap role.

**Scope:** Semua instance burger navbar yang sudah memakai `BurgerMenuContent` (Home embedded dan halaman marketing/publik lainnya), bukan dashboard sidebar. Tidak mengubah sesi/database/API login/logout, entitlement, gambar pintu atau styling public navbar; tidak perlu migrasi DB. GitHub Actions untuk commit `ac6d85c2` berhasil (`https://github.com/wanzy0808/DC/actions/runs/35849876788`): Prisma generate, semua tes termasuk rute role Dashboard, dan production build lulus. Pemeriksaan browser dengan sesi pengguna nyata serta logout tetap diperlukan untuk validasi end-to-end.


### 2026-09-23 — Satu QR Undangan per Event Berbayar + Download PNG

**Kebutuhan:** Setiap pemesan boleh membuat **satu QR untuk setiap undangan/event yang telah dibayar**, bukan satu QR untuk seluruh akun. Dashboard → Undangan Digital mempunyai tombol `Buat QR` pada baris undangan berbayar, menampilkan QR dan `Download QR PNG` tanpa membuat kartu tambahan di dalam frame besar. QR undangan ini untuk membagikan tautan undangan publik, **bukan** QR check-in individual per tamu di Usher.

**Model & keamanan:** Tidak menambahkan kolom QR atau tabel duplikat: `Invitation.id` yang unik dan tetap menjadi kunci tunggal untuk QR undangan. `lib/invitations/qr.ts` membentuk target permanen `APP_URL/q/<invitationId>`. Endpoint owner-only `GET /api/invitations/qr?invitationId=...` memeriksa sesi, `ownerId`, relasi `Payment` milik event, `status=PAID`, dan paket yang memberikan Digital Invitation; unpaid, event lain, dan guestbook-only ditolak pada server. API memproksi gambar PNG QR QuickChart (yang sudah digunakan di fitur QR Usher) dari URL redirect publik saja, tanpa mengirim data tamu, token check-in atau identitas akun ke provider. `download=1` mengirim `Content-Disposition: attachment` dengan nama berkas per ID undangan. Respons privat tidak di-cache.

**Saat dipindai:** `GET /q/[invitationId]` merupakan redirect sementara tanpa cache ke `https://<slug-terbaru>.<INVITATION_ROOT_DOMAIN>/`. Kelayakan dibaca ulang dari database: event lengkap, punya template, sudah di-Publish dan tetap mempunyai pembayaran paket Undangan Digital PAID; selain itu mengembalikan unavailable/404. Karena QR menyimpan ID bukan slug, penggantian slug saat draft tidak mengubah QR yang sudah diunduh. QR bisa digenerate setelah membayar meskipun acara belum di-Publish, tetapi undangan belum dapat dibuka sebelum Publish. Privasi/password undangan tetap ditangani oleh halaman publik yang sudah ada. Satu pembayaran event tidak membuka QR event lain.

**UI & kompatibilitas:** `components/Dashboard/InvitationWorkspacePanel.tsx` menambahkan tombol `Buat QR / Tutup QR`, QR pratinjau, penjelasan draft, dan tombol unduh pada baris yang sama; `useDashboardI18n.ts` menyediakan ID/EN. Tes `tests/invitation-qr.test.mjs` memvalidasi URL stabil per ID, perbedaan antar undangan, localhost, dan penolakan ID/path injection. `APP_URL` harus diisi domain aplikasi publik pada deployment produksi; localhost QR hanya untuk pengujian setempat. Tidak ada migrasi database, perubahan QR check-in tamu, tombol Publish, status payment, maupun desain landing/Pintu. **Validasi:** GitHub Actions commit `9bb8caed` sukses (`https://github.com/wanzy0808/DC/actions/runs/35851482250`): Prisma client generate, semua tes (termasuk URL QR stabil), dan production build lulus. Pengujian unduh/scan QR pada perangkat nyata, domain deployment, serta sesi pembayaran riil masih diperlukan.


### 2026-09-23 — Finalisasi satu sumber data tamu (Undangan Personal, RSVP, Meja, WA Blast, Usher)

**Satu sumber data:** `Guest` milik satu `Invitation` menjadi identitas tamu/penerima/rombongan yang dipakai semua menu. Tidak ada tabel Undangan Personal atau penerima WA Blast kedua. Model `Guest` dan migration SQL **sudah ada**: `20260923124000_guest_personal_invitation_details` menambah `personalAddressee`, `recipientType`, `invitedPax`, `personalGreeting`, `personalSharedAt` ke model Guest; `20260923124500_backfill_personal_invitation_quota` menaikkan kuota undangan lama yang sudah punya RSVP pendamping. Kategori `category` (Reguler/VIP/VVIP) dan kelompok `tags` sudah field Guest. Form Undangan Personal tetap satu panel besar dengan sumber penerima (pilih tamu lama atau tambah baru), nama, WhatsApp opsional, jenis penerima, kuota, kategori, dan field opsional nama amplop/kelompok/pesan. `invitedPax` adalah batas izin RSVP, sedangkan `plusOnes` jumlah pendamping *yang mengonfirmasi hadir*; tidak disalin menjadi tamu kedua.

**Konsistensi endpoint:** `/api/personal-invitations`, `/api/guests` POST/`manage`/`[id]/labels`, WA Blast, RSVP, dan Usher merujuk Guest.id dan memvalidasi profil dengan parser yang sama. Fungsi `findGuestsByContact` mendeteksi duplikat dalam acara yang sama termasuk WhatsApp `08`/`+62` tanpa mengubah nomor asli. Bila pemilik menambahkan penerima WA yang sudah ada, sistem memilih record yang sama; apabila cocok lebih dari satu, minta pengguna memilih dari daftar. Tautan RSVP umum **tidak boleh mengubah** RSVP yang sudah ada bermodal nama+nomor karena itu bukan bukti identitas: balas 409, arahkan ke tautan personal bertoken atau admin. Form RSVP personal memakai token penerima dan menyimpan `rsvpStatus`/`plusOnes` pada Guest yang sama, menghormati `invitedPax`, tidak mengubah data check-in yang sudah sah, dan respons publik hanya memuat field tiket nonrahasia. Perubahan admin pada `/api/guests/manage` divalidasi terhadap pemilik, event **asal Guest.id** (bukan event pertama), kuota dan tabel di event yang tepat; entri bertoken personal/bercatatan check-in dilindungi dari penghapusan generik.

**Satu konteks acara dashboard:** memilih acara dari Undangan Personal, WA Blast, RSVP, Pengaturan Meja ataupun Usher menyinkronkan `activeEventId` di `app/dashboard/page.tsx`. Membuka ulang tab me-refresh data tamu canonical sehingga perubahan dari tab lain terlihat tanpa membuat data salinan. Scanner Usher dibuka dengan event yang terpilih melalui query `invitationId`, daftar tamu Usher memuat event itu, check-in QR menolak QR milik event lain dan hanya memperbarui satu Guest.id secara atomic (`checkedIn`, `checkedInAt`, `checkedInById`). Endpoint Usher legacy juga diubah agar tidak mengedit acara pertama secara diam-diam.

**Catatan penyelesaian:** File migration SQL tersedia di repo, bukan bukti bahwa database pengguna/deploy sudah dimigrasikan. Perlu menjalankan `pnpm db:deploy` sesuai proses deploy database dan memeriksa status migration sebelum pengujian runtime. Build GitHub Actions memvalidasi kompilasi, tetapi pengujian langsung dengan data tamu dan alur browser tetap diperlukan, khususnya benturan nama/nomor identik, undangan personal berkode, RSVP publik tanpa token, pemilihan event berbeda, QR lintas acara, WA Blast quota, dan peserta rombongan. Penempatan kursi masih satu slot per `Guest`/undangan; belum memodelkan setiap anggota rombongan sebagai kursi tersendiri. Jangan klaim `invitedPax` otomatis menghasilkan kursi fisik tambahan.

### 2026-09-23 — Studio: kanvas utama, panel ringkas, 15 kontrol

**Alasan:** Studio memakai dua judul yang berulang, rail penuh tombol CTA, panel besar dan halaman yang memanjang; sebagian kontrol belum mencerminkan fungsi renderer. Owner meminta prioritas perbaikan tampilan dengan referensi Dashboard/landing serta 15 kontrol termasuk amplop/musik.

**Perubahan:** satu mainframe Rose dengan brand canonical, title acara dan status perubahan, tool rail dengan hover/active terpisah, inspector yang bisa disembunyikan, canvas scroll mandiri, mode Pengaturan/Undangan pada HP, dan modal pratinjau dengan fokus/Escape serta watermark. Katalog tema dibuat ringkas dua kolom; font picker menampilkan nama heading/body dalam font aslinya dan pencarian. Romantic Rose menginformasikan palet/font terkunci. Switch 15 bagian memakai parser kompatibel desain lama dan kedua renderer real; OFF tidak menghapus isi. Preview menerima hashtag/dress code belum disimpan. Tombol terbitkan menunggu perubahan disimpan; save desain tidak mengirim status publish lama. Landing, database schema, auth dan payment gate tidak diubah.

**Area:** `components/InvitationStudio/{InvitationDesigner,InvitationEditorPage,DesignerPanels,InvitationPreview}.tsx`, `studio.css`, kedua renderer `components/PublicInvitation/`, `InvitationFonts.tsx`, `lib/templates/{sections,design}.ts`, `tests/invitation-sections.test.mjs`, AGENTS/README/PRD.

**Commit:** commit implementasi berjudul `Refine Studio canvas and add all 15 invitation visibility controls` (entry ini disertakan dalam commit yang sama).

**Validasi:** TypeScript dan production `pnpm build` berhasil; seluruh 17 tes lulus, termasuk tiga tes baru untuk kompatibilitas legacy dan round-trip 15 switch. `git diff --check` bersih. Build masih memberi warning tracing filesystem dari endpoint upload yang sudah ada. Pemeriksaan lint terbatas menemukan pola effect/state lama pada orchestration Studio dan warning lama; tidak diklaim lint global lulus. Browser visual/klik Light, Dark, HP belum berhasil dilakukan: runtime Chromium tidak terpasang dan unduhannya gagal (arsip invalid). Route sementara untuk QA sudah dihapus. Simpan/publish terhadap database pelanggan dan audio perangkat nyata belum diuji; jangan menyamakan build dengan verifikasi tersebut. Tidak ada migrasi database.

### 2026-09-23 — Kembalikan ke Default, musik 2 × 3 MB dan hapus unggahan

**Alasan/implementasi:** Owner meminta reset tampilan serta dua musik masing-masing 3 MB dengan slot yang dapat digunakan ulang setelah dihapus. Studio kini mereset warna/font/15 toggle tema aktif lewat history Undo tanpa menghapus isi/media; Simpan Desain tetap diperlukan. Panel Musik menampilkan radio lagu bawaan/unggahan, kuota, hapus dan upload dengan status proses. Batas file diterapkan client/server, termasuk pemeriksaan ulang count+create di transaksi dengan row lock Invitation. Delete memakai lock sama dan membersihkan musicUrl aktif serta file lokal yang cocok pola generated filename; URL-only asset creation ditolak agar tidak melewati validasi ukuran. Legacy saved music URL/aset lama dipertahankan. Sharp foto tetap pipeline sebelumnya.

**Area:** `components/InvitationStudio/{InvitationDesigner,DesignerPanels}.tsx`, `app/api/invitations/assets/{route,upload/route,[assetId]/route}.ts`, `lib/invitations/audio-limits.ts`, `tests/audio-limits.test.mjs`, AGENTS/README/PRD. Tidak ada migrasi database.

**Commit:** `Add Studio default reset and enforce two 3 MB music uploads` (entry disertakan dalam commit implementasi yang sama).

**Validasi:** `pnpm exec tsc --noEmit`, seluruh 20 tes, production build, dan `git diff --check` lulus. Tiga tes tambahan mencakup batas tepat 3 MiB/1 byte lebih, file kedua/ketiga/slot kembali, empty MIME tidak sesuai. Smoke check Sharp dengan byte PNG nyata 2400×1200 menghasilkan WebP 2000×1000. Build tetap memiliki warning tracing filesystem upload yang sudah ada. Database concurrency, upload/hapus melalui akun nyata, preview audio, dan visual browser belum diuji end-to-end. Wishes tetap belum mempunyai persistence; toggle tersedia tidak berarti semua layanan produk selesai.


### 2026-09-24 — Finalisasi renderer Studio dan kapitalisasi nama undangan

**Temuan/perbaikan:** Nama amplop/sampul sebelumnya tetap memakai font UI dan warna pembuka hardcoded, sehingga pilihan Studio terlihat hanya memengaruhi sebagian isi. Sembilan tema customizable kini mengonsumsi selected font dan custom scene palette dengan fallback artwork preset; teks memakai kontras yang terbaca, termasuk token Cinzel/Fauna One yang benar. Nama host/pasangan dan judul acara di seluruh renderer nyata/legacy serta personal password gate memakai kapital awal kata saat render; data asli tidak dimodifikasi. Dua scene tidak lagi memaksakan uppercase pada nama. Studio gagal load menampilkan retry, status belum tersimpan lebih jujur, Wishes diberi keterangan belum tersedia. Save musik memakai transaksi/lock bersama uploader/delete dan menolak URL upload lokal yang sudah hilang.

**Area:** `components/PublicInvitation/{UniversalInvitationTemplate,RomanticRoseTemplate,InvitationThemeScenes,ClassicInvitationTemplate,PublicInvitation,PersonalInvitationPasswordGate}.tsx`, `components/InvitationStudio/{DesignerPanels,InvitationDesigner}.tsx`, `lib/templates/presentation.ts`, `tests/template-presentation.test.mjs`, `app/api/invitations/route.ts`, AGENTS/README/PRD.

**Commit:** `Fix Studio renderer customization and capitalize invitation names` (entry berada pada commit implementasi yang sama).

**Validasi:** 22 unit tests lulus; uji render React menghasilkan 18 amplop/sampul + 9 preset default lulus untuk sembilan tema customizable. Nama lowercase diuji pada amplop/isi seluruh 10 tema dan keluar dengan kapital awal tiap kata. Ini pemeriksaan markup renderer, bukan screenshot/pemuatan font jaringan/interaksi browser. TypeScript dan production build final setelah koreksi kapitalisasi lulus. Warning tracing filesystem uploader yang sudah ada tetap muncul. Browser mobile/desktop, audio playback dan transaksi database nyata masih belum diuji. Tidak ada migrasi.


### 24 September 2026 — Free RSVP confirmation and downloadable guest QR

- Fixed success rendering for attending, declining and tentative replies; thank-you names use display-only Title Case.
- Replaced external QR image/HTML-ticket download with same-origin signed PNG endpoint, event/status checks, no-store response and attachment download.
- Missing QR signing configuration no longer reports a failed RSVP after database persistence. No schema migration, WA message or credits charged.
- Added visible-tab 10-second RSVP dashboard refresh with cleanup and preserved snapshot on polling failure.
- Validation: 24 Node tests, TypeScript and production build pass; SSR checked all three statuses, missing QR and hidden invalid calendar link. Existing upload filesystem tracing warning remains. QR route smoke with a stubbed repository verifies PNG attachment, forged token, cross-event, declined and unpublished-event rejection. Live DB submission/check-in and browser download were not tested in this environment; deployment requires QR_SIGNING_SECRET and existing DB configuration.


### 24 September 2026 — Zen Atelier photo-free invitation and asset boundary

- Added ready theme `zen-atelier` as the eleventh built-in (6 photo + 5 no-photo). Existing keys, public routes, shared 15 toggles, real RSVP form, gift, honest Wishes empty-state and music engine retained. The theme supplies its own lazy-loaded envelope/cover, vector sakura/ensō/ink landscapes and editable event-owned couple/gallery photo slots with honest illustrated empty state, new palette/font preset and a lightweight public thumbnail.
- Area: `assets/templates/zen-atelier/`, `components/PublicInvitation/{ZenAtelierScene,InvitationThemeScenes,UniversalInvitationTemplate}.tsx`, `lib/templates/{catalog,design,music}.ts`, `app/api/template-preview/zen-atelier/route.ts`, `.gitignore`, `AGENTS.md`, `README.md`, `prd.md`. No schema migration. Original linked image binaries could not be identified in public repo main and were NOT moved.
- Private master image policy: do not store in public Git or public web root; original binaries require separate private storage/authorization. Rendered vectors and web derivatives remain publicly copyable. Existing customer photo/music upload path remains unchanged.
- Validation: integration committed to feature branch; CI/build/browser screenshot checks pending when this entry was authored. Do not claim original images were installed or secure because artwork source lives outside public.


### 24 September 2026 — Zen Atelier: implementasi artwork dari `public/templates/`

**Alasan:** Owner meminta visual Zen Atelier dari shared ChatGPT dan gambar contoh yang telah dimasukkan ke repo. Setelah inspeksi ditemukan `public/templates/` (bukan `public/template/`), sementara renderer Zen sebelumnya masih menampilkan SVG pengganti.

**Implementasi:** Amplop memakai `amplop1.png`; cover mengomposisikan `japanroom1.png`, `redsun1.png`, `inkmountain.png` beserta bambu/bunga; bagian undangan menggunakan bunga, ensō, pegunungan, dan teh/ruang Jepang sebagai ornamen maupun empty state galeri. Label "The Wedding of" hanya dipakai pada kategori WEDDING. Foto mempelai/galeri tetap menggunakan satu library milik event melalui renderer bersama, palet/font/toggle tetap dipilih Studio; musik tetap dipicu secara sinkron saat klik buka, agar kebijakan autoplay tidak memblokir percobaan play. Foto dekoratif tidak menjadi pengganti foto pelanggan.

**Area/commit:** `components/PublicInvitation/{ZenAtelierScene,InvitationThemeScenes,UniversalInvitationTemplate}.tsx`, `assets/templates/zen-atelier/{ZenArtwork.tsx,README.md}`, `tests/zen-atelier-assets.test.mjs`, AGENTS, README, PRD. Commits implementasi: `cf01b632`, `c235afa6`, `879a1c65`, `4002bffc`, `0df4bb81`, `d1370c92`, `e739c74e` (beserta commit dokumentasi). Tidak ada migrasi database dan tidak mengubah landing/Pintu.

**Validasi saat entry awal:** Inspeksi source dan nama berkas repo terkonfirmasi; uji statis path aset ditambahkan. Tautan berbagi ChatGPT hanya mengekspos judul pada akses anonim. Moodboard asli dari Library kemudian berhasil dibaca dalam revisi berikutnya; penyesuaian visual dan validasi lanjutan dicatat di bawah. PNG publik berukuran besar masih perlu optimasi display WebP; hak penggunaan aset tetap perlu dipastikan.


### 24 September 2026 — Zen Atelier: pencocokan dengan moodboard asli dan preview contoh

**Referensi visual:** `Zen Atelier Wedding Moodboard UI.png` berhasil dibaca dari Library percakapan sebelumnya setelah akses anonim URL berbagi hanya menampilkan judul. Contoh referensi menampilkan 01 cover krem dengan ranting sakura/pegunungan tinta dan judul pasangan di tengah, 02 amplop kertas bersegel lilin, 03 pasangan editorial, 04 rincian Akad Nikah dan Resepsi, 05 RSVP sederhana, 06 galeri foto asimetris, dan contoh Ucapan/Hadiah/Penutup. Gambar di `public/templates/` dipakai sebagai dekorasi nyata untuk mendekati art direction, tetapi pixel-identical **belum** diklaim tanpa screenshot hasil browser per ukuran perangkat.

**Perubahan:** `ZenAtelierScene.tsx` mencocokkan cover berlatar kertas krem dengan bunga kiri-atas/kanan-bawah, pegunungan tinta di bawah, nama pasangan di tengah, tanggal, hashtag dari data event (bukan string contoh pelanggan), amplop dan ketukan buka yang menjalankan gesture audio langsung. `InvitationThemeScenes.tsx` dan `UniversalInvitationTemplate.tsx` meneruskan hashtag nyata serta kategori wedding, mengganti heading Zen ke tampilan Indonesia minimal, menata detail Upacara Nikah dan Resepsi memakai data waktu yang memang tersedia, galeri editorial dengan satu foto utama tinggi dan foto lain di kanan, dan closing dengan pegunungan tinta. Data bersama tetap menjadi satu sumber dan RSVP publik memakai form bersama. `TemplateGalleryCanvas.tsx` menggunakan Aruna & Kaito dan hashtag contoh **hanya untuk fixture katalog**, tidak menimpa undangan pelanggan.

**Berkas dan commit:** `components/PublicInvitation/{ZenAtelierScene,InvitationThemeScenes,UniversalInvitationTemplate}.tsx`, `components/Templates/TemplateGalleryCanvas.tsx`, `assets/templates/zen-atelier/ZenArtwork.tsx`, PRD. Komit implementasi utama `9ca2e7d1`, `6ed50217`, `d7c01c2d`, `83a22381`, `d7e1b9ca`, `cada8478`, `d15a0808`, `78c45b3f`, `94a57a56`. Tidak ada migrasi database, perubahan landing/Pintu, atau pemindahan media pelanggan.

**Validasi:** GitHub Actions build tercatat sukses hingga commit `d15a0808` ketika catatan disusun; perubahan setelah commit tersebut memerlukan CI/head verification terbaru dan visual perbandingan layar mobile/desktop dari owner. Aset PNG publik asli dipertahankan as-is dan belum dioptimalkan menjadi derivative WebP; tidak ada klaim identik secara piksel.


### 24 September 2026 — Brief 15 komponen dan visual Zen Atelier (`template.md`)

Owner meminta **spesifikasi file dahulu, tanpa implementasi aplikasi pada tahap ini**. Ditambahkan `template.md` dengan acuan sembilan contoh moodboard, daftar lengkap 15 kontrol dari Amplop Digital sampai Musik, teks Indonesia yang ringkas, tombol masuk `Buka Undangan`, larangan label preview di dalam undangan dan tombol redundant `Lihat Undangan`, galeri masonry/hover/carousel/parallax sesuai jumlah foto, animasi tipografi yang menghormati reduced motion, integrasi data/Studio/RSVP satu sistem, serta checklist verifikasi visual dan fungsi. PRD §7.2.3d mencatat kontrak ringkasnya. **Commit spesifikasi:** `fe2a4198cd63d42208e11c95b0416fc645fa7f5d`; perubahan PRD dicatat dalam commit dokumentasi ini. **Validasi:** isi dokumen dan registry 15 kontrol diinspeksi; aplikasi tidak dimodifikasi, sehingga animasi, desain, screenshot mobile/desktop, test dan build untuk spesifikasi tersebut belum dijalankan atau diklaim selesai.


### 24 September 2026 — Koreksi ruang lingkup template.md dan bersihkan copy katalog

**Klarifikasi owner:** `template.md` adalah panduan **seluruh template yang dirancang dengan ChatGPT**, bukan spesifikasi khusus Zen Atelier. Brief visual tiap tema mengacu moodboard masing-masing; kontrak 15 komponen, standar tulisan, tombol **Buka Undangan**, animasi teks dan galeri yang kaya, kualitas mobile/reduced-motion, serta integrasi Studio berlaku lintas tema. Catatan sebelumnya tentang brief khusus Zen Atelier adalah riwayat awal, **digantikan** oleh standar universal dalam PRD §7.2.3d. Dokumen `template.md` ditulis ulang dengan ruang lingkup ini.

**Perbaikan kode saat ini:** `app/template-design/page.tsx` menghapus paragraf data contoh di bawah katalog (`Foto dan nama pada pratinjau merupakan data contoh...` / terjemahan Inggris), baris microcopy teknis setiap kartu (`Preview mengikuti renderer undangan publik` / `Pratinjau desain Invitation Studio`), label preview demo di header dialog, penjelasan mode/CTA yang berlebihan, dan paragraf teknis yang tertanam dalam gambar preview designer. Indikator **Belum Tersedia** untuk item yang belum terintegrasi tetap berada di luar gambar undangan. **Data contoh, izin akses dan perilaku memilih template tidak diubah.** Pembersihan isi renderer lain dan efek motion seluruh template tetap pekerjaan lanjutan menurut checklist, bukan klaim sudah selesai.

**Berkas:** `template.md`, `app/template-design/page.tsx`, `prd.md`, `AGENTS.md` (aturan lintas tema). **Commit utama:** `49b0d873a2101cf7b925a8933a935af6dca585a2`, `c03323761e625ce19faa34e3f85f3f21cab0fd47`, `e70373884bbec9c7770151824845c361b6617fae` dan commit dokumentasi berikutnya. **Validasi:** source diperiksa; CI/build dan perbandingan screenshot untuk perubahan terbaru diperiksa terpisah, jangan klaim semua template sudah menerapkan template.md.


### 24 September 2026 — Perbaikan path aset Zen Atelier setelah folder dipindah

Saat memeriksa kegagalan GitHub Actions setelah revisi copy katalog, ditemukan uji aset Zen gagal karena PNG Zen Atelier kini berada di `public/templates/Zen Atelier/`, sementara scene/artwork/test masih mencari di `public/templates/`. Path yang dipakai browser diperbarui menjadi `/templates/Zen%20Atelier/` dalam `components/PublicInvitation/ZenAtelierScene.tsx` dan `assets/templates/zen-atelier/ZenArtwork.tsx`; assertion keberadaan berkas di `tests/zen-atelier-assets.test.mjs` diarahkan ke folder nyata. Tidak ada gambar yang dipindahkan/dihapus dalam perbaikan ini, tidak menyentuh konten pengguna atau template lain. Commit: `fd912b0f`, `65ce6ceb`, `3534e909`. **Validasi:** sumber penyebab failure dari log Actions terdahulu teridentifikasi; workflow head setelah perbaikan perlu diverifikasi terpisah sebelum menyebut build lulus.


### 24 September 2026 — Perpustakaan animasi untuk semua template (`template.md`)

**Permintaan owner:** Dokumentasikan kemampuan animasi yang sudah dimiliki repo agar setiap tema undangan baru hasil kolaborasi ChatGPT dapat menggunakan koreografi dan interaksi yang berbeda, bukan sekadar mengganti warna/font atau membatasi diri pada fade sederhana. `template.md` kini berisi tabel library terverifikasi dari `package.json`: `motion/react`, `gsap`, `three` + `@react-three/fiber`, `konva` + `react-konva`, Tailwind CSS + `tw-animate-css` + CSS native, `lucide-react`, Next.js/React untuk lazy load, serta Sharp untuk optimasi gambar (bukan mesin animasi). Memuat contoh per komponen, pilihan engine menurut jenis efek, galeri ekspresif, reduced motion, fallback 2D, aksesibilitas dan performa mobile. `@react-three/drei` tidak diasumsikan terpasang karena tidak terdapat pada manifest yang diperiksa.

**Area dan status:** Hanya `template.md` dan entri riwayat `prd.md`; tidak ada perubahan runtime, dependency, database atau template lain. Commit dokumen `1ee449154a07371f1fdd00f5f2cc893fef60f3ce`; commit riwayat mengikuti. Validasi: dependency dan dokumen diperiksa dari source, sedangkan implementasi dan pengujian efek baru **belum dilakukan**; pencantuman library tidak berarti semua animasi sudah tersedia pada semua template.


### 24 September 2026 — Zen Atelier prompt-driven visual repair

- Rationale: existing Zen duplicated opening copy, cropped decorations indiscriminately, lacked gallery interactions and used dashboard-like sections. Inspected owner prompt, universal template.md and actual asset contact sheet before editing.
- Changes: layered photo-envelope opening with direct-gesture audio; clean sakura/mountain cover; shared cover-slot couple portrait, quieter date/countdown/location and gift; masonry/lightbox with keyboard/swipe/focus return; themed shared RSVP radio form with preview submission guard; local Zen music and preserved custom font/palette/15 flags. Main decorative PNGs use Next/Image derivatives; originals unchanged. Removed invented reception interpretation of the end-time field.
- Areas: Zen scene/gallery/CSS/artwork, shared Universal renderer and optional RSVP presentation, catalog/photo slots, demo hashtag, music registry, asset documentation and asset tests. No DB migration or landing/dashboard design edits.
- Validation: production build and TypeScript passed; 26 Node tests passed. SSR verifies single correct CTA, no preview/duplicate opener copy, capitalized names, three RSVP radio statuses and disabled preview submit. Existing upload tracing warning persists. No browser screenshot or live DB check in this environment; exact moodboard equivalence unverified. Missing separate paper/seal and original couple reference assets, Wishes/message/story/category/independent schedule model gaps remain explicitly documented.


### 24 September 2026 — Zen Atelier tahap 1: rekontruksi Amplop Digital dari screenshot owner

**Permintaan:** Owner mengirim gambar moodboard nyata dan meminta hanya satu langkah **coding Amplop Digital**, bukan menghasilkan gambar referensi baru. Aplikasi yang diubah terbatas pada tampilan awal Zen Atelier, sedangkan Cover, 13 section lain, Studio, data pelanggan, landing dan template lain tidak diubah. Acuan khusus amplop adalah panel nomor 02 pada gambar: kertas krem memenuhi viewport ponsel, sapaan di bagian atas, lipatan amplop dan segel lilin terakota di tengah, serta tombol bawah berlabel **Buka Undangan**.

**Implementasi:** `components/PublicInvitation/ZenAtelierScene.tsx` menyusun gambar amplop asli `/templates/Zen%20Atelier/amplop1.png` sebagai lapis kertas, lipatan atas/bawah serta surat yang muncul setelah membuka; tulisan pengantar dan tombol bawah dibuat sebagai HTML hidup, tanpa copy teknis / tombol kedua. `components/PublicInvitation/zen-atelier.css` mengatur komposisi amplop memenuhi tinggi viewport mobile, tekstur dari PNG, font/warna tinta, garis pemisah, ikon Lucide, dan transisi lipatan perspektif → surat terangkat → cover melalui mekanisme pembuka bersama yang sudah tersedia. Music tetap dimulai dari klik asli `Buka Undangan`; fallback reduced motion tidak menahan alur. `tests/zen-atelier-assets.test.mjs` mendapat assertion spesifik untuk area amplop, sumber PNG, trigger animasi, caption dan interaksi bersama. Tidak ada aset master yang diubah dan tidak ada library baru.

**Berkas:** `components/PublicInvitation/ZenAtelierScene.tsx`, `components/PublicInvitation/zen-atelier.css`, `tests/zen-atelier-assets.test.mjs`, `prd.md`. **Commit coding:** `ac6a86568df454ed61b67d528dbec1f13c631789`, `cb4a73b3f2b49645b9699d28260816fc143284b4`, `3d945da9ec1ad3fb2606333a5415f6268ed40a7d`, `a23504b98d538f75c578f2b5c716782041109e3f`. **Validasi:** Source, test, dan Actions head diperiksa. Belum ada screenshot browser dari runtime untuk perbandingan pixel/proporsi dengan moodboard: **jangan mengklaim tampilan sama persis sebelum owner meninjau hasil aktual di mobile**. Penggunaan PNG asli yang sudah ada tidak berarti geometri lipatan dari foto datar setara objek amplop tiga dimensi yang benar-benar terpisah.


### 24 September 2026 — Hapus atribusi DC Organizer dari footer undangan

**Permintaan owner:** Pada template undangan yang akan dipublikasikan, tulisan `Created with DC Organizer` dihapus. Kontrak canonical §7.6 diperbarui: footer undangan tetap dapat diaktifkan/dinonaktifkan sesuai registry 15 section, namun tidak boleh mewajibkan copy brand atau atribusi promosi. Penghilangan ini juga berlaku untuk konten visual yang sama dalam Studio/katalog, agar hasil contoh mencerminkan undangan yang diterima tamu. Brand pada marketing/dashboard tetap tidak berubah.

**Perubahan kode:** `components/PublicInvitation/UniversalInvitationTemplate.tsx` (termasuk Zen Atelier dan tema lain yang memakai renderer universal) serta `components/PublicInvitation/RomanticRoseTemplate.tsx` menghapus satu-satunya paragraf `Created with DC Organizer` pada footer dan menggantinya dengan garis dekoratif pendek tanpa teks. Tidak mengubah backend, publikasi, pembayaran, URL tamu, musik, maupun data undangan. **Commit:** `fdb33bfff31e246f7714a54a40bf44a1149d221e`, `fa06cd708176707609b1b7f9c4ba20e401ecea8e` dan commit dokumentasi berikutnya. **Validasi:** perubahan source diperiksa; hasil CI/head diperlukan sebelum mengklaim production build lulus.


### 24 September 2026 — Kartu template menampilkan Cover/Hero, bukan Amplop

Owner meminta visual pemilihan template di katalog memakai **Cover/Hero** untuk menunjukkan identitas tiap tema, sementara alur undangan tamu tetap dimulai dari Amplop. `components/Templates/TemplateGalleryCanvas.tsx` mengirim konfigurasi `catalogCoverSections` (hanya `cover` true; `envelope`, `music` dan bagian lain false) **khusus** kanvas kartu bersama. Ini memengaruhi kartu siap-render pada `/template-design` dan tiga kartu smartphone `/d-invitation`, bukan dialog contoh interaktif, Studio, data undangan, atau renderer URL publik. Copy loading yang mengulang kata pratinjau dihapus dari kartu; komposisi hero tetap milik masing-masing tema. `tests/template-card-cover.test.mjs` menegaskan pemisahan kartu Cover dan contoh interaktif penuh. `template.md` memuat aturan universal untuk template baru. Commit: `3a26d1a194c028b6536b9bbbab4c887504ae58b7`, `b74412ae4f9954950b211a1a0db6e01111be4192`, `966e481e260b5c3131f7adb942abcbfdce1abd00` dan commit PRD ini. **Validasi:** source diperiksa, hasil GitHub Actions terbaru harus dilihat sebelum menyatakan tes/build lulus; preview mobile/desktop tetap memerlukan pemeriksaan visual pengguna.


### 24 September 2026 — Popup katalog Cover-first, CTA Studio, dan canvas Amplop

**Masukan owner (screenshot langsung):** Perubahan kartu katalog sebelumnya belum menyentuh popup pemilihan: di popup masih terlihat gambar Amplop padahal owner ingin melihat **Cover/Hero**. Owner meminta CTA **Buat Undangan** menuju Studio secara langsung ketika sudah login (belum login melalui autentikasi terlebih dahulu), serta **Amplop Digital tetap dapat dilihat dan dicoba pada canvas Studio**.

**Implementasi:** `app/template-design/page.tsx` menerapkan override `envelope:false` **hanya** pada `TemplateCanvas` popup untuk menampilkan Cover, tanpa menyimpan toggle; CTA menuju `/studio?template=<key>`. `app/studio/page.tsx` memvalidasi key terhadap katalog resmi dan mempertahankannya melewati login serta pilihan satu/lebih event terkonfigurasi; tanpa event gateway tetap meminta pengguna membuat acara melalui Dashboard (editor tidak pernah dibuat tanpa event). `components/DigitalInvitation/StudioEntrySection.tsx` meneruskan key ke editor event yang dipilih. `components/InvitationStudio/InvitationDesigner.tsx` menawarkan tombol canvas **Amplop** (dapat memutar ulang animasi dari awal) dan **Cover** (melihat isi tanpa membuka Amplop lagi). Pilihan Cover pada canvas bersifat sementara; toggle Amplop tersimpan dan dialog preview Studio tetap memakai undangan lengkap. Jika tema dari katalog berbeda dengan tema event, editor menampilkan pilihan baru sebagai perubahan **belum tersimpan** dan perlu klik Simpan Desain; bila sama, font/palet custom event dipertahankan. `template.md` diselaraskan; `tests/template-card-cover.test.mjs` memeriksa pemisahan kanvas Cover/Amplop serta forwarding login dan tema.

**Berkas:** `app/template-design/page.tsx`, `app/studio/page.tsx`, `components/DigitalInvitation/StudioEntrySection.tsx`, `components/InvitationStudio/InvitationDesigner.tsx`, `tests/template-card-cover.test.mjs`, `template.md`, `prd.md`. **Commit terpilih:** `39c288ba`, `263269de`, `177c2568`, `65211fb2`, `ec6ffcb2`, `bf435d15`, `d78e8328`, `852566b5` dan commit PRD saat ini. **Validasi:** workflow GitHub Actions untuk `bf435d15` berhasil setelah assertion test diselaraskan; commit berikutnya perlu hasil workflow terbaru. Perbandingan screenshot popup/Studio dalam browser owner belum dilakukan; perubahan source tidak boleh disebut pixel-perfect.


### 24 September 2026 — Pertahankan template terpilih dan pencarian di Studio

Owner meminta tema yang sudah dipilih lewat tombol **Buat Undangan** tidak hilang setelah login/buat acara, serta daftar pilihan Studio memiliki pencarian, filter dan urut saat katalog membesar. Implementasi: `lib/templates/template-intent.ts` menyimpan **hanya slug tema terverifikasi** selama maksimal tujuh hari pada localStorage dan cookie SameSite=Lax (HTTPS→Secure), URL tetap membawa key sebagai jalur utama, dan `app/studio/page.tsx` memulihkan cookie ketika query tema tidak tersedia. `components/DigitalInvitation/StudioEntrySection.tsx` mengarahkan pengguna tanpa acara ke `/dashboard?tab=events&from=template&template=<key>`. `app/dashboard/page.tsx` membukakan menu Acara dalam alur itu serta meneruskan event baru atau pilihan existing ke `/dashboard/editor?invitationId=<id>&type=<type>&template=<key>` via `components/Dashboard/EventPanel.tsx` dan kontrak `event-panel-types.ts`. `components/InvitationStudio/InvitationDesigner.tsx` menampilkan tema pilihan sebagai perubahan belum tersimpan, dan hanya menghapus cache browser setelah respons **Simpan Desain berhasil**. Tidak ada event/customer/guest content dalam cookie, dan cache tidak mengalahkan perizinan server atau menimpa DB otomatis. `components/InvitationStudio/DesignerPanels.tsx` menambahkan tombol ikon pencarian yang memfokuskan input live, filter Semua/Dengan foto/Tanpa foto, sort Pilihan aktif/Nama A–Z/Z–A, jumlah hasil, dan 18 kartu awal + Tampilkan Lagi. `tests/template-card-cover.test.mjs` mencakup alur dan UI ini; `template.md` telah ditambahkan aturan universal. **Pemeriksaan:** Build/tes melalui GitHub Actions commit terkait, visual browser/perangkat owner tetap perlu diperiksa sebelum klaim final.


### 24 September 2026 — Sinkronisasi Amplop ke Cover otomatis di canvas Studio

**Permintaan owner:** Ketika membuka Amplop Digital langsung di canvas Studio melalui tombol **Buka Undangan**, penanda tombol Amplop/Cover di toolbar juga otomatis berpindah ke **Cover** (tanpa perlu klik ulang). Tekan Amplop lagi untuk mencoba ulang, dan Cover untuk melihat isi langsung.

**Implementasi kode:** `components/InvitationStudio/InvitationPreview.tsx` meneruskan callback opsional `onEnvelopeOpened` hanya dari canvas Studio ke renderer bersama; `components/PublicInvitation/UniversalInvitationTemplate.tsx` memanggil callback sesudah animasi pembukaan Zen Atelier selesai (atau langsung setelah membuka pada tema universal lain), sedangkan `components/PublicInvitation/RomanticRoseTemplate.tsx` memanggil callback setelah status opened disetel. `components/InvitationStudio/InvitationDesigner.tsx` memakai callback stabil `useCallback(() => setCanvasStage("cover"), [])` untuk memperbarui kontrol dan canvas serentak; tombol Amplop tetap bisa dipakai untuk restart. Dialog preview penuh tetap independen dari tombol canvas, dan renderer publik tidak menggunakan callback Studio. `tests/template-card-cover.test.mjs` mendapat regression test lintas kedua renderer. **Berkas:** empat komponen + test + `prd.md`. **Commit kode:** `3668ca6515c94a77690575ddbda05270572b91f5`, `bef53d766e3ae7c9d1d4ebc611c9b54ae0c9bbd5`, `57bd024798f3d6a04656dbcdffd99ae6b5150c0c`, `68363aa3e20642214bcdae888719de773bf7551e`, `3aec9a0938a5303361f336d9095f4648f7de75af`. **Validasi:** source dan GitHub Actions perlu diverifikasi pada commit head; sinkronisasi visual di browser owner belum dibandingkan langsung.


### 24 September 2026 — Perapian header/canvas Invitation Studio dan pindahkan Publish ke Dashboard

**Permintaan owner:** Hapus banner `Desain bisa disimpan sekarang. Paket diperlukan saat terbitkan.`, tombol Terbitkan dan tombol/modal Pratinjau tambahan dari Studio; Publish cukup melalui Undangan Digital Dashboard. Judul `Pernikahan hendra & reni` harus tampak `Pernikahan Hendra & Reni` di heading Studio (display-only). Menu ikon+font kiri lebih lega, canvas dikurangi ukuran, tombol Light/Dark mengikuti landing, dan tambahkan pilihan bahasa ID/EN di header.

**Implementasi:** `components/InvitationStudio/InvitationEditorPage.tsx` menghapus banner, metode publish dan CTA terkait; mempertahankan pembacaan accessPaid serta guard visual pembayaran sebelumnya dan tombol kembali; memakai komponen shared `ThemeToggle` dan `LanguageToggle`. `components/InvitationStudio/InvitationDesigner.tsx` menampilkan heading melalui `invitationTitleCase` tanpa update DB, menghapus tombol dan modal Preview duplikat, menerjemahkan navigasi/toolbar utama melalui `useLanguage`, serta menjaga satu canvas selalu ter-render. Saat amplop selesai terbuka, callback mengaktifkan Cover tetapi **tidak me-remount canvas** hanya karena stage berubah, sehingga musik/interaksi tidak ter-reset. `components/InvitationStudio/studio.css` menyamakan kontrol header Studio dengan perilaku outline/hover landing pada kedua tema; memberi ruang ekstra rail 98–108px dan ikon-label 12px, mengurangi lebar canvas 390→340px, mengatur ukuran tombol mobile. `components/InvitationStudio/DesignerPanels.tsx` menambahkan terjemahan header panel dan kontrol pencarian/filter/urut tema pada toggle EN. `tests/template-card-cover.test.mjs` menyesuaikan kontrak satu canvas; `tests/studio-ui-cleanup.test.mjs` menjaga tidak adanya CTA publish/preview kedua, heading display-only, ukuran canvas serta keberadaan kontrol ID/EN dan Light/Dark. Tidak mengubah layout landing/Pintu, data acara, 15 toggle, database, atau API.

**Source of truth:** ketentuan baru §7.2.1d dan §6.1 menggantikan ketentuan lama yang meletakkan Publish atau modal Preview di Studio. Tampilan masih perlu pemeriksaan visual nyata HP/desktop; hasil CI direkap berdasarkan head commit terakhir, bukan otomatis dianggap lulus hanya karena push.


### 24 September 2026 — Redesign Amplop Zen Atelier ala Jepang (referensi owner sisi kanan)

Owner meminta amplop Zen Atelier lebih kuat karakter Jepangnya mengikuti contoh pada **gambar sebelah kanan**, dengan gaya yang harmonis dengan isi Zen, bukan membuat gambar baru. `components/PublicInvitation/ZenAtelierScene.tsx` kini merender amplop seremonial dari lapis washi/origami nyata (HTML/CSS), ikatan `mizuhiki` merah-emas vektor, cap merah non-wax dan slip berisi nama/tanggal data acara, bersama `BlossomBranch`, `EnsoSun`, `InkMountains` dari `assets/templates/zen-atelier/ZenArtwork.tsx`. `components/PublicInvitation/zen-atelier.css` mengatur komposisi responsif, bayangan shoji, pergantian lapis saat buka dan animasi selesai sebelum timer parent Zen 1.350ms (reduced motion langsung masuk). Tombol `Buka Undangan`, data music gesture, sinkronisasi tahap Amplop/Cover Studio dan semua section/renderer bersama tetap memakai mekanisme yang sudah ada. PNG `public/templates/Zen Atelier/amplop1.png` tetap utuh sebagai aset historis tetapi tidak lagi dirender pada amplop Zen; tidak ada aset eksternal/dependency baru. `tests/zen-atelier-assets.test.mjs` diperbarui menguji struktur Jepang dan tahap pembuka; `assets/templates/zen-atelier/README.md` memisahkan arah baru dari inventaris/implementasi lama.

**File:** `components/PublicInvitation/ZenAtelierScene.tsx`, `components/PublicInvitation/zen-atelier.css`, `tests/zen-atelier-assets.test.mjs`, `assets/templates/zen-atelier/README.md`, `prd.md`. **Commit kode:** `ff51d7e6f3ed8cd6a3931a0c5c2ada5978af1b4c`, `02e9988a4e7c61204c87c570aacee0fe9d2b8aa6`, `ae82bcb83a20ebc6c64b9b8aac4487e54fd034f9`, `dceb2339ee5caba5cd3d99c83a7919f1635a205c`, dan commit PRD ini. **Validasi:** source dan regression test diperiksa; CI head serta inspeksi visual screenshot mobile/desktop harus diperiksa terpisah. Jangan menyatakan visual pixel-identical dengan gambar kanan tanpa verifikasi browser.


### 24 September 2026 — Warna/font Studio berlaku untuk Amplop Zen dan seluruh tema baru

**Permintaan owner:** Warna Amplop Digital Zen Atelier sebelumnya tidak mengikuti pilihan warna Studio. Owner menetapkan kontrak bahwa pada template mendatang semua fitur Studio yang relevan **harus benar-benar bekerja di amplop**, bukan hanya di isi undangan. Audit: renderer universal telah mengirim token tema dan font saat nilai palet/font diganti, tetapi `components/PublicInvitation/zen-atelier.css` mengunci permukaan/lipatan/segel/kertas dengan warna literal; simpul `ZenAtelierScene.tsx` juga memiliki empat stroke literal. 

**Implementasi:** Dalam `components/PublicInvitation/zen-atelier.css` enam token `--jp-washi`, `--jp-paper`, `--jp-ink`, `--jp-paper-ink`, `--jp-accent`, `--jp-soft` kini mengambil `--inv-scene-*` yang diteruskan dari `UniversalInvitationTemplate.tsx` dengan fallback warna default Zen; seluruh background, fold, strip, seal, teks/kicker, tombol, shoji, sun/blossom/mountain vector menggunakan token dan shading `color-mix`. Pada `ZenAtelierScene.tsx` tali mizuhiki mengambil palet accent/soft via SVG stroke; nama surat tetap mengikuti `--inv-heading`, teks body mewarisi font terpilih, dan sumber nama/tanggal tetap data event. Tidak membuat palet tersimpan baru, mengubah aset PNG, merombak Cover, mengedit template lain, atau menyentuh backend/entitlement. `tests/zen-atelier-assets.test.mjs` menambah regression test token/panel Studio. `template.md` menambah kontrak universal bahwa kontrol palet/font/section/music di amplop template baru harus sesuai capability registry, default tema tetap asli, dan PNG statis bukan recolor per bagian. `AGENTS.md` ikut diselaraskan.

**File:** `components/PublicInvitation/zen-atelier.css`, `components/PublicInvitation/ZenAtelierScene.tsx`, `tests/zen-atelier-assets.test.mjs`, `template.md`, `AGENTS.md`, `prd.md`. **Commit implementasi:** `da9d55dbb257bd74dfa8dce60d2c9c6e677c02bc`, `1b28e917c7baf4b4137f657f6a9f6a6d069ff898`, `eeee13ea06e855b1d2a46c3e59bcb70bb80cc837`, `198f7630c4ffc652e8875ac65f2a23b43e4e2405` dan commit dokumentasi berikutnya. **Validasi:** perubahan sumber dan tes otomatis diaudit; hasil CI pada head terakhir harus dicek sebelum menyatakan lulus, dan inspeksi browser nyata palet terang/gelap + mobile perlu dilakukan untuk memastikan kontras dan komposisi.


### 24 September 2026 — Rapikan warna teks tombol dan dropdown sort di Studio

**Permintaan owner:** Beberapa tombol memiliki tulisan hitam pada mode terang padahal kontrak tombol DC Organizer menggunakan teks putih pada Light Mode dan hitam pada Dark Mode. Filter urutan `Pilihan aktif` memiliki panah terlalu mepet kanan, area panel kiri sesak, serta tinggi kontrol/alat terlalu besar.

**Implementasi:** `components/InvitationStudio/DesignerPanels.tsx` memperbaiki state filter foto terpilih menjadi Rose solid + `text-white dark:text-black`, mengecilkan tinggi filter ke 36px, mengubah dropdown urutan menjadi kontrol `appearance-none` selebar 204px dengan `ChevronDown` terpisah berjarak 16px dari kanan, padding kanan teks 44px, serta tinggi 36px, tanpa mengubah state pencarian/filter/sort. `components/InvitationStudio/InvitationDesigner.tsx` menyamakan warna teks dan hover tombol Amplop/Cover aktif dengan aturan Rose shared, dengan tombol tidak aktif tetap outline. `components/InvitationStudio/studio.css` memperluas inspector tema dari 300→360px di desktop dan 330→380px pada layar besar **tanpa memperlebar canvas 340px**, merapikan padding inspektor, serta mempersingkat item menu kiri 82→74px dan jarak ikon-label 12→10px. `tests/studio-ui-cleanup.test.mjs` memperbarui assertion dimensi dan menambahkan regresi warna tombol/panah dropdown. Berlaku hanya untuk Studio; tidak mengubah landing/Pintu atau desain amplop/isi template.

**Commit kode:** `44645cae2addf460585bd73727b15068b7098df9`, `efb10ffdf3c9af847a36659e77403d004d548188`, `853faff04b2b1335f5d118a1b365692cd3d6d433`, `675e0bc47c4e7813c56de87ee48fea0b71be649d` dan commit dokumentasi ini. **Validasi:** pemeriksaan kode dan workflow GitHub Actions pada HEAD harus selesai sebelum dinyatakan PASS; screenshot browser pada desktop/mobile tetap diperlukan untuk mengonfirmasi spacing.
