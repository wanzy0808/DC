# Undara — Master Product Requirements Document

**Document Status:** Single Source of Truth  
**Brand:** Undara  
**Repository:** `wanzy0808/Undara`  
**Last Consolidated:** 30 September 2026  
**Documentation Audit:** 30 September 2026 — canonical rules cleaned; obsolete visual history retired  
**Implementation History:** Appendix A (same file)

> Dokumen ini adalah **single source of truth** Undara dan menggantikan requirement yang sebelumnya tersebar di `prd.md`, `prd1.md`, `prdnew.md`, `prd-tambahan.md`, serta PRD legacy lain. Requirement aktif berada di badan utama; histori implementasi disimpan di **Appendix A** pada file yang sama. Jika histori lama bertentangan dengan requirement canonical, **requirement canonical di badan utama yang berlaku**.

---

## 1. Product Vision & Scope

Undara adalah **general-event digital invitation & event operations SaaS**, bukan wedding-only SaaS.

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

Customer-facing brand wajib **Undara**. Nama brand lama hanya boleh muncul pada histori Git atau exact compatibility identifier internal yang masih diperlukan; tidak boleh diperkenalkan kembali pada surface baru.

### 1.1 Identitas Brand Undara

- Customer-facing brand adalah **Undara**. Nama brand lama tidak boleh muncul kembali pada UI, copy marketing, email, dokumen baru, atau asset baru.
- Exact legacy identifier yang masih hidup di source/database (misalnya token/class/cookie lama) boleh dipertahankan sementara **hanya untuk kompatibilitas teknis** sampai migrasinya aman. Identifier tersebut bukan identitas visual dan tidak boleh ditampilkan sebagai brand.
- `components/Brand/BrandWordmark.tsx` dan asset brand aktif di `public/assets/brand/undara/` menjadi sumber brand lockup customer-facing.
- PRD **tidak mengunci hex color atau nama font**. Nilai implementasi aktif mengikuti semantic tokens di `app/globals.css`, komponen brand bersama, dan keputusan desain terbaru di source. Ini mencegah PRD menyimpan beberapa palet/font lama yang saling bertentangan.
- Invitation template adalah artwork mandiri. Palet, font, ornament, dan mood template boleh berbeda dari application/marketing shell selama tetap memenuhi kontrak aksesibilitas dan Studio.
- Nama badan hukum, rekening, domain, email, dan social handle hanya ditulis apabila data operasional aktual sudah dikonfirmasi.

### 1.2 Arah visual publik Undara

Arah visual utama Undara adalah **woodland / forest editorial**: hangat, tenang, organik, premium, dan tidak terasa seperti wedding clip-art.

- Motif utama: siluet hutan, canopy, ranting, daun, sulur/ukiran organik, kabut/fog lembut, cahaya halus, dan ruang kosong yang cukup.
- Ornamen floral besar, bunga tempel, legacy petal ambience, kelopak beterbangan, dan dekorasi romantis generik **bukan bahasa visual global Undara**.
- Bila membutuhkan dekorasi sudut marketing, prioritaskan **sulur/ukiran organik tipis** atau branch/canopy yang terasa menyatu dengan komposisi, bukan bunga besar.
- Background harus mendukung hierarki konten. Dekorasi tidak boleh menabrak brand, navbar, heading, CTA, form, atau mengurangi keterbacaan.
- Landing/Pintu boleh memiliki treatment atmosfer lebih kuat; halaman marketing lain memakai versi lebih restrained dari sistem woodland yang sama.
- Dark/Light mode harus mempertahankan karakter woodland yang sama, bukan berubah menjadi dua brand visual yang berbeda.
- **Dark woodland boleh memakai lampion kecil di kedalaman hutan** sebagai ambience khusus malam: jumlah sedikit, ukuran kecil, cahaya hangat/redup, tersebar natural, dan selalu background-only. Lampion tidak boleh terasa seperti festival, tidak boleh memenuhi frame, dan tidak boleh bersaing dengan heading, CTA, Pintu, atau navigasi.
- Light mode tidak wajib menampilkan lampion; karakter siangnya mengandalkan canopy, daun, kabut, cahaya alami, dan ruang kosong.
- Aturan ini berlaku untuk **application/marketing shell**. Template undangan tetap boleh mempunyai tema floral, minimal, Jepang, hitam-putih, atau tema lain sesuai desain template.

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
- `/dashboard`, Beranda, Pintu, dan shared public ambience adalah product foundation. legacy petal ambience telah dipensiunkan atas instruksi owner 28 September 2026 dan diganti `components/Layout/FallingLeaves.tsx`.
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

Masuk (`/login`) dan Daftar (dialog yang dibuka dari menu navbar maupun tombol Daftar di login) memakai identitas UI publik Undara yang sama: shared typography token, semantic primary accent, permukaan popup yang kontras pada kedua mode, shared control geometry, dan focus state yang accessible. Kartu login lebar baca sekitar 480px di tengah halaman yang responsif; dialog pendaftaran lebar sekitar 490px dengan scroll internal ketika tinggi layar terbatas agar kolom, checkbox dan tombol dapat dijangkau di mobile. Navbar, footer, atmosphere woodland global, dan brand `BrandWordmark` tetap milik layout bersama; jangan menduplikasi dekorasi/pemutar musik atau mengubah landing Pintu.

Kedua formulir memakai Google Icon dan kelas visual form yang sama melalui `components/Auth/`, mendukung ID sebagai bahasa default serta label EN lewat LanguageProvider, fokus keyboard yang terlihat, label input eksplisit, tombol lihat/sembunyikan kata sandi, serta pesan error `role="alert"`. Pendaftaran tetap meminta email, password minimal delapan karakter, konfirmasi password, Terms/Privacy consent dan pilihan newsletter seperti semula; layanan Google, respons API, verifikasi email, redirect `next` yang aman, dan role-based routing tetap dipertahankan. Masuk dan Daftar dari burger menu harus membuka dialog tanpa berpindah halaman. Tautan login/register lama (mis. `/login?register=1&next=...`) tetap berfungsi melalui redirect ke beranda dengan query `auth=register`/`auth=login` yang memunculkan dialog bersama; berpindah Masuk ↔ Daftar di dalam dialog tidak boleh membuat burger menu tertinggal. Jangan membuka Studio/area privat melalui perubahan visual ini.

### 4.1b Shared auth component styling refinement (22 September 2026)

Login dan Daftar harus terlihat sebagai satu keluarga komponen, bukan sekadar memakai warna yang sama. `components/Auth/auth-styles.ts` menjadi sumber kelas bersama untuk card surface, decorative brand eyebrow, title, description, label, field, password-toggle, Google action, separator, error, submit, secondary link dan consent/choice box. Login dan Register memakai ritme spacing, tipografi, outline brand, radius, shadow dan state Light/Dark yang sama. Dialog Daftar tetap dapat scroll di layar pendek dan close `X` tetap mendapat ruang. Perubahan visual tidak boleh mengubah endpoint auth, Google OAuth, safe `next` redirect, verifikasi email, validasi password/Terms, atau role routing.

### 4.1c Login/Daftar sebagai dialog terpusat (22 September 2026)

Tombol **Masuk** dan **Daftar** di burger menu marketing/public membuka modal bersama pada halaman yang sedang dilihat, bukan membuka halaman Login tersendiri. Dialog berada di global `components/Auth/AuthDialogHost.tsx` sekali dari root layout di luar subtree burger, sehingga menutup burger tidak me-unmount dialog. `LoginDialog.tsx` mempertahankan login email/password, Google OAuth, role-based redirect, error server dan toggle password; `RegisterDialog.tsx` tetap punya ketentuan password, consent dan registrasi asli. Aksi link silang Masuk ↔ Daftar berpindah isi dialog yang sama; setelah mendaftar berhasil, tampilkan pemberitahuan verifikasi email pada dialog Masuk. URL lama `/login`, `/login?register=1`, dan `/login?error=google_...` tetap menjadi entry point kompatibel: redirect ke `/?auth=login|register&next=...` untuk membuka popup; `next` harus disanitasi sebagai path internal sebelum dipakai. Jangan mengganti API/auth callback maupun memberikan akses private dari UI saja.

Popup mengikuti viewport, bukan koordinat parent navbar: kelas visual `authCardClass` TIDAK boleh menimpa `position:fixed` milik `DialogContent`. Pada desktop letakkan modal di pusat layar, gunakan padding dan gap yang lebih ringkas untuk Daftar dan `max-height` relatif terhadap `dvh` dengan scroll **di dalam dialog** jika layar pendek. Pada mobile sisakan ruang tepi dan pastikan tombol, consent, maupun close X tetap dapat diakses. Hindari dua popup atau overlay bertumpuk dengan menempatkan satu dialog owner di root layout. Backdrop/popup auth harus berada di atas widget navigasi marketing mengambang (z-index modal lebih tinggi daripada mini-door) dengan overlay override yang spesifik auth, bukan menaikkan semua dialog secara global.

### 4.1d Restore burger and align auth backgrounds to landing (22 September 2026)

Perubahan modal Masuk/Daftar **tidak boleh mengubah layout/animasi navigasi burger** yang sudah disetujui: posisi, dimensi, urutan item, animasi, submenu Layanan dan markup visual lama tetap dipakai. **Seluruh label dan ikon item burger berwarna primary** (`text-primary`, `dark:text-primary`) dalam kondisi default; jangan membiarkan `text-foreground`/`dark:text-foreground` menimpa semantic primary atau membiarkan warna teks default Button menimpa teks Daftar. Item Masuk mempertahankan tampilan `Link` awal dan hanya membatalkan navigasi untuk membuka dialog pada halaman yang sedang terlihat; item Daftar tetap memakai `Button` bersama, bukan native button yang dapat berbeda stylenya. `Navbar.tsx` dan halaman landing/Pintu tidak dirombak untuk kebutuhan auth.

Background **kedua dialog auth** memakai surface yang konsisten dan terbaca pada Light/Dark, dengan glow brand yang sangat tipis bila diperlukan. Semua label, field, helper text, Google button dan copy sekunder di panel putih harus memiliki warna teks gelap yang tetap terbaca di kedua mode. Overlay dialog tidak boleh merusak keterbacaan atmosphere marketing di belakangnya. Jangan memasang lapisan ornament legacy, atau pemutar audio duplikat di dalam popup; gunakan ambience yang sudah dimount oleh halaman di belakangnya. Modal tetap di atas widget mengambang dan formulir tetap readable pada tema light/dark.

### 4.1e Kebijakan Privasi publik dan UI baseline terkunci (22 September 2026)

**Visual freeze:** Atas permintaan owner, gaya burger menu dan dialog Masuk/Daftar yang sekarang wajib dipertahankan pada pekerjaan legal/content mendatang: markup/layout, item/submenu, hover/animasi, ikon dan teks default primary, serta kedua dialog putih dengan glow brand tipis dan form text gelap pada kedua mode. Tidak boleh merombak `BurgerMenuContent`, `Navbar`, `auth-styles`, `LoginDialog`, `RegisterDialog`, atau `ui/dialog` untuk perubahan konten seperti Privacy Policy tanpa permintaan eksplisit. Pernyataan aturan lama yang bertentangan (burger berteks hitam atau card auth dark) dinyatakan tidak berlaku.

**Kebijakan Privasi:** `/privacy-policy` menampilkan naskah Bahasa Indonesia yang diberikan owner dengan nama layanan lama “Viding” diganti “Undara”; tersedia terjemahan EN sesuai language toggle existing. Struktur dan isi klaim inti naskah (data dari pendaftaran/form, pengumpulan data teknis otomatis, analisis anonim/agregat, pemrosesan internal, kemungkinan pihak ketiga dan pembatasan penggunaan mereka, tidak menjual/menyewakan data, notifikasi perubahan satu hari sebelumnya, pengakuan saat memakai layanan) dipertahankan. Link dari consent Daftar wajib membuka `/privacy-policy` dalam tab baru tanpa menutup popup/form pendaftaran atau mencentang checkbox secara otomatis; label Privacy Policy yang sudah ada di footer publik harus memiliki href menuju halaman tersebut tanpa mengubah desain footer. Link Syarat & Ketentuan hanya boleh ditambahkan jika halaman ketentuannya sudah tersedia; halaman `/terms-and-conditions` kini disediakan berdasarkan naskah yang dikirim owner, dengan penyuntingan untuk menghindari identitas dan janji operasional perusahaan lain.

**Pemeriksaan sebelum produksi:** Isi policy berasal dari materi owner, bukan audit pengumpulan data aplikasi yang diverifikasi. Klaim penggunaan analytics/geo-location, pihak ketiga, kontrak pembatasan, tidak menjual data, dan pemberitahuan satu hari harus disesuaikan dengan praktik nyata, provider yang dipakai dan kebutuhan hukum sebelum produksi. Jangan menjanjikan kepatuhan regulasi semata-mata karena halaman sudah ditambahkan.

### 4.1f Syarat & Ketentuan publik dari sumber owner (22 September 2026)

Halaman `app/terms-and-conditions/page.tsx` menyediakan route publik `/terms-and-conditions` dalam Bahasa Indonesia dan Inggris sesuai `LanguageProvider`. Sumber awal yang diberikan owner adalah teks ketentuan Viding, yang memuat ketentuan umum, definisi, penggunaan, konten pengguna, biaya, jaminan, pembatasan tanggung jawab, hak kekayaan intelektual, kebijakan privasi, komisi mitra, dan lain-lain; struktur topik tersebut dipertahankan dalam draft yang disesuaikan untuk Undara.

**Koreksi wajib terhadap materi pihak ketiga:** Jangan mencantumkan PT Aku Bisa Ibadah sebagai badan hukum Undara, alamat/domain/email Viding, angka minimum usia tanpa keputusan bisnis/legal dan enforcement, jadwal pencairan komisi 1–3 hari tanpa program mitra yang benar-benar tersedia, atau lisensi konten selamanya/irrevocable/sublicensable serta pelepasan hak moral secara sepihak. Draft menyatakan kepemilikan Konten Pengguna tetap pada pemegang hak dan izin pengolahan konten hanya sebatas pelaksanaan fitur/publikasi sesuai pilihan pengguna. Klausul garansi/tanggung jawab wajib tidak menyatakan penghapusan semua hak konsumen/kewajiban pelindungan data. Rincian biaya/paket mengikuti penawaran nyata; jadwal/aturan program mitra diatur terpisah jika ada.

**Navigasi dan consent:** Link Syarat & Ketentuan pada label consent di `RegisterDialog` membuka route baru di tab baru, di samping link Kebijakan Privasi yang sudah ada; kedua tautan tidak boleh memeriksa checkbox secara otomatis, menutup popup, mereset field, atau mengubah styling form. Footer publik memberi href `/terms-and-conditions` pada label Syarat & Ketentuan yang sudah ada tanpa mengubah layout/warna. Halaman terms mengikuti shell legal halaman privacy, bukan mengubah landing/Pintu. Semua aturan visual freeze di §4.1e dan `AGENTS.md` tetap berlaku.

**Pra-produksi:** Draft Terms ini belum disetujui penasihat hukum/owner sebagai kontrak operasional final. Konfirmasi data badan hukum serta kontak, pembelian/pembatalan/refund, hak penggunaan media, eligibilitas usia, praktik proteksi data, dan program mitra dengan sistem Undara aktual sebelum dipakai secara komersial.

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
- untuk masing-masing pengantin tersedia pilihan opsional **Anak Tertua / Anak Termuda / Anak Keberapa**; hanya pilihan Anak Keberapa memerlukan input angka positif (lihat §5.4a);
- parent line hanya diturunkan oleh fungsi bersama `weddingParentLine` di `lib/events/parents.ts`: Tertua = `Putra/Putri Sulung`, Termuda = `Putra/Putri Bungsu`, Anak Keberapa = `Putra/Putri Kedua` untuk urutan 2 (dan bentuk angka lain menurut formatter); data asli tidak diubah saat render;
- keterangan keluarga ditampilkan dalam Title Case sesuai §5.4a;
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

### 5.4a Pilihan Urutan Anak & Format Keterangan Orang Tua (23 September 2026)

- Pada form pernikahan, **masing-masing mempelai** memiliki pilihan tunggal berbentuk radio/bullet check: `Anak Tertua`, `Anak Termuda`, atau `Anak Keberapa`. Hanya pilihan ketiga memunculkan input angka urutan anak positif; angka wajib diisi bila dipilih. Pilihan awal boleh kosong agar data pernikahan lama yang tidak memiliki urutan anak tetap opsional. Nilai numerik lama dibuka kembali pada pilihan ketiga, bukan dianggap otomatis Sulung.
- Urutan anak disimpan tanpa menduplikasi nama/data keluarga: `Invitation.groomChildOrder` / `brideChildOrder` tetap `Int?` numerik; `Invitation.groomChildPosition` / `brideChildPosition` menyimpan pilihan `ELDEST`, `YOUNGEST`, `NUMBER` atau null. Anak termuda tidak bisa disimpulkan dari angka urutan anak tanpa mengetahui jumlah saudara. Saat memilih tertua/termuda, angka urutan sebelumnya dikosongkan; data undangan lama dipertahankan.
- Format tampilan terpusat di `lib/events/parents.ts`: `Putra/Putri Sulung Dari Bapak Chandra & Ibu Juni`, `Putra/Putri Bungsu Dari Bapak Chandra & Ibu Juni`, atau `Putra/Putri Kedua Dari Bapak Chandra & Ibu Juni` untuk urutan 2. Setiap kata pada keterangan keluarga dan nama orang tua yang ditampilkan diawali huruf kapital di Dashboard preview, Studio preview, dan undangan publik seluruh tema. Data nama asli di DB/API dan isi deskripsi tetap apa adanya. Jika parent kosong, jangan tampilkan placeholder.
- Perubahan membutuhkan migrasi DB kolom baru dan regenerasi Prisma sebelum build lokal; server tetap memvalidasi pilihan serta angka, dan kebijakan kunci acara terbit tetap berlaku.

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

Customer `/dashboard` menggunakan **satu mainframe responsif dengan outline brand** yang membingkai sidebar, header, dan konten operasional seperti komposisi landing, tanpa menyalin Pintu, atmosphere woodland, pemutar musik, atau animasi marketing. Sidebar dan konten Light putih, Dark hitam; Primary brand token digunakan pada teks/ikon aksen, outline, hover, dan menu aktif sesuai semantic token dashboard. Brand `BrandWordmark` tampil sekali di sidebar; header menampilkan judul halaman, kontrol tema/bahasa, dan menu pengguna. Frame memiliki tinggi terbatas mengikuti viewport; hanya area konten `dc-dashboard-scroll` yang dapat menggulir, sedangkan sidebar, header, dan drawer mobile tetap berada di dalam frame. Ketentuan ini menggantikan deskripsi header/body yang menggulir bebas atau membentang di luar frame.

**Hierarki final:** hanya panel section besar dan peer-level Beranda yang memiliki frame/garis aksen brand `0,3 cm` di sisi kiri, tiga sudut siku dan hanya sudut kanan atas membulat. Satu `DashboardPanel` memuat judul, aksi, dan isinya; `DashboardMetricGrid` mengelompokkan angka dalam satu frame besar. Baris detail acara, undangan, tamu, RSVP, WA Blast, dan statistik di dalamnya **tidak** diberi frame mini/garis tebal terpisah; gunakan pemisah tipis dan penanda hover/selected hanya bila ada interaksi. Form akun yang berdiri sendiri boleh memakai satu panel besar; input, tombol, badge, modal, denah interaktif, dan mainframe luar memiliki geometri masing-masing. Data nyata dan navigasi mobile harus tetap berfungsi.

Sidebar user:
- **Beranda**
- **Acara**
  - Rangkaian Acara
  - Undangan
  - WA Blast
- **RSVP**
- **Manajemen Tamu**
  - Undangan Personal
  - Pengaturan Meja
- **Usher App**

WA Blast ditampilkan sebagai submenu **Acara / Events**, sejajar dengan Rangkaian Acara dan Undangan. **Undangan Personal** berada hanya di submenu **Manajemen Tamu**, bersama **Pengaturan Meja**. Label navigasi dan heading cukup **WA Blast**, tanpa kata Add-on. Pembelian kuota tetap terpisah dari Undangan Digital; perubahan navigasi tidak mengubah entitlement atau harga.

Workspace yang menggunakan data event harus menyediakan explicit event scope. Tidak boleh diam-diam memilih event pertama jika user memiliki lebih dari satu event.

### 6.1 Dashboard access before Publish

Payment Digital Invitation **bukan gate untuk membuka isi dashboard**. Customer harus dapat masuk, melihat, dan menyiapkan workspace terkait invitation sebelum event dipublish atau sebelum Digital Invitation dibayar.

Canonical behavior:
- **Rangkaian Acara**, **Undangan/Studio**, **Personal Invitation**, **RSVP**, dan **Manajemen Tamu** tetap dapat dibuka sebelum Publish/payment;
- RSVP dan Manajemen Tamu tidak menampilkan activation/paywall overlay hanya karena `accessPaid = false`;
- Personal Invitation juga dapat dipersiapkan sebelum Publish; public delivery tetap bergantung pada lifecycle public invitation yang valid;
- Personal Invitation memiliki personalisasi Amplop per Guest yang dapat ON/OFF dari Dashboard. Saat ON, nama berasal dari `personalAddressee` atau fallback `Guest.name`, ditampilkan Title Case tanpa menimpa data sumber. Bahasa sapaan disimpan per Guest sebagai ID/EN; pasangan dengan dua nama yang dipisahkan `&`/“dan”/“and” dirender **“Kepada Yth : Bapak [Nama] dan Ibu [Nama]”** atau **“Dear : Mr [Name] and Mrs [Name]”**. Saat OFF, Amplop kembali generik tetapi token personal, RSVP, WA Blast, seating dan data Guest tetap sama.
- Form Dashboard menampilkan pratinjau sapaan yang berubah bersama nama, jenis penerima, bahasa, dan toggle. Canvas Amplop di Studio menampilkan contoh ID/EN untuk membantu penataan semua tema; contoh tersebut hanya milik pratinjau, tidak disimpan pada undangan dan tidak pernah menjadi nama tamu publik. Tautan personal memakai pengaturan Guest yang nyata; pratinjau katalog umum tetap tanpa contoh nama personal.
- Bahasa personal per Guest juga memilih bahasa awal seluruh undangan yang terbit (Amplop, label/narasi bawaan tiap bagian, tanggal, hitung mundur, RSVP, Ucapan, dan tombol). Undangan publik umum mulai dalam bahasa Indonesia. Tamu dapat mengganti ID/EN melalui kontrol pada undangan terbit; pilihan itu mengubah tampilan saja dan tidak menulis ulang profil Guest. Canvas Studio memiliki kontrol ID/EN di dekat Amplop/Isi untuk memeriksa kedua versi sebelum Publish. Narasi bawaan diterjemahkan otomatis; tulisan bebas pemilik acara, nama, alamat, venue, catatan, dan judul custom harus dipertahankan sesuai input sumber. Untuk narasi template yang ditulis sendiri, Studio menyimpan versi Inggris terpisah (`copyEn`) agar pemilik dapat memeriksa/melengkapinya tanpa mengubah versi Indonesia. Tidak menjanjikan terjemahan mesin untuk tulisan bebas yang belum diberi versi Inggris.
- apabila belum ada data karena undangan belum dibagikan, gunakan empty state normal agar user tetap dapat memahami fungsi halaman;
- payment gate Digital Invitation hanya ditegakkan ketika user menekan **Publish** di **Dashboard → Undangan Digital**; Studio hanya untuk menyusun dan menyimpan desain, tanpa tombol Publish atau pembayaran;
- public RSVP/personal invitation tidak dianggap usable untuk tamu sampai parent invitation memenuhi configured + saved template + published + entitlement gates;
- entitlement produk terpisah tetap berlaku: WA Blast tetap memakai quota/add-on sendiri dan Usher App tetap mengikuti Guestbook Digital bila diperlukan.

Tujuan UX: user dapat mengeksplorasi isi Dashboard dan menyiapkan operasional acara tanpa dipaksa membayar sebelum mencapai Publish.

### 6.2 Desktop dashboard shell

Pada desktop, `/dashboard` memakai **mainframe yang dibatasi viewport**, bukan legacy full-width header/body atau kontainer `max-width: 1400px` yang terpisah. Sidebar dan header tetap di dalam mainframe; hanya pane konten di sebelah sidebar yang scroll. Satu `BrandWordmark` menjadi anchor di sidebar, bukan logo kedua pada header.

Layout canonical:
- mainframe memakai inset desktop sesuai frame marketing yang telah disetujui; tidak memperpanjang body saat isi dashboard tinggi;
- konten di dalam pane menargetkan `80vw` tetapi dibatasi `max-w-full` dan lebar ruang yang benar-benar tersedia setelah sidebar;
- sidebar tetap stabil, dan pada layar sempit gunakan drawer di dalam frame tanpa horizontal overflow;
- panel besar memuat satu section utuh; detail di dalamnya adalah baris tanpa frame mini, dengan pemisah tipis dan kontrol berukuran nyaman;
- selector dan form yang tidak perlu lebar penuh boleh tetap compact; daftar panjang harus responsif tanpa memaksa isi keluar dari frame;
- copy tidak memakai decorative sequence numbering seperti `Workspace / 01`; angka yang merupakan data asli (tanggal, harga, pax, kapasitas, kuota, urutan anak, metrik) tetap ditampilkan.

### 6.3 Dashboard theme & language

Seluruh customer Dashboard dan nested workspace wajib mendukung **Light Mode + Dark Mode** melalui shared `ThemeProvider` dan semantic theme tokens. Tidak boleh membuat page-specific dark palette yang terpisah dari design system.

Canonical behavior:
- Light/Dark Mode mengikuti semantic theme tokens aktif di `app/globals.css`; jangan hardcode palet lama di halaman Dashboard;
- seluruh surface, text, border, selected state, dan CTA harus tetap terbaca pada kedua mode;
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

### 7.2.0a Studio template chooser — full portrait preview (24 September 2026)

Daftar pemilihan tema pada panel kiri Studio menampilkan masing-masing Cover/Hero sebagai kartu portrait **utuh dan proporsional** (satu kolom per tema, dengan nama dan kategori foto di bawah gambar), bukan thumbnail landscape terpotong dua kolom. Pilihan terbaru owner: dua kartu berjajar per baris, masing-masing maksimum 152px (~4 cm dalam ukuran CSS standar) dengan rasio portrait 9:19.5 (tinggi sekitar 329px/~9 cm pada lebar maksimum). Kartu mengecil mengikuti lebar inspector bila dua kolom tidak cukup untuk mencapai 152px; template tetap ditampilkan utuh dengan renderer Cover dan lazy loading. Ukuran renderer asli menyesuaikan lebar panel secara responsif; panel sendiri tetap dapat digulir dan lazy render hanya dilakukan saat kartu mendekati area terlihat. Pratinjau Studio di sebelah kanan tetap renderer undangan interaktif, termasuk Amplop Digital. Katalog publik dan kartu ponsel featured tidak ikut berubah. Pilihan tema yang diklik, penyimpanan desain, filter, dan pemisahan data demo/pelanggan tetap menggunakan alur sebelumnya.

### 7.2.0d Kontrol layer di sisi canvas dan shortcut keyboard (24 September 2026)

Saat ilustrasi Cover dipilih, Studio menampilkan panel kecil di sisi **kanan canvas**, tidak hanya di panel Aset kiri. Panel berisi slider Opasitas, tombol maju/mundur urutan layer, Salin, Hapus, dan Tempel jika ada layer yang tersalin. Pada layar sempit panel jatuh ke bawah preview agar tidak memotong canvas. **Delete/Backspace** menghapus layer ilustrasi terpilih, **Ctrl/Cmd+C** menyalin propertinya ke clipboard internal Studio, **Ctrl/Cmd+V** menambahkan duplikat dengan ID baru serta offset posisi 5% agar terlihat, dan **Escape** membatalkan pilihan. Shortcut berlaku hanya selama Studio dibuka dengan Cover aktif; tidak boleh memotong shortcut native pada input, textarea, select, elemen contenteditable atau ketika pengguna menyeleksi teks. Clipboard internal ini bukan clipboard OS, tidak menyalin foto/gambar ke aplikasi lain dan tidak membaca data clipboard sistem. Batas 12 layer, Undo/Redo dan penyimpanan desain yang sudah ada tetap berlaku; pengguna tetap dapat menghapus/menyalin lewat tombol di samping canvas tanpa keyboard. Panel Aset kiri dan renderer undangan publik tetap mempertahankan perilaku yang sudah ada.

### 7.2.0b Objek dekoratif Aset dan Teks lintas section pada Customer Studio (24 September 2026)

Menu **Aset** mengambil gambar raster turunan publik dari `public/template/` dan `public/templates/` dan tidak pernah mengekspos master privat. Menu **Teks** membuat **objek teks dekoratif baru** (maksimal 180 karakter), bukan mengganti nama, jadwal, nama orang tua, detail tempat, label komponen sistem, narasi tetap template, atau data RSVP. Komponen wajib dan fitur bisnis tetap memakai data bersama serta toggle/izin template yang sudah ada. Ini adalah editor override dekoratif pada **undangan event-scoped**, bukan Designer Studio yang menghasilkan/menjual master baru dan bukan izin memodifikasi sembarang struktur komponen.

Setiap undangan dapat menyimpan maksimal 12 objek dekoratif gabungan (gambar + teks) yang terikat section aktif, dengan koordinat persen relatif pada section, ukuran/lebar, rotasi terbatas, opasitas, dan susunan layer. Teks juga menyimpan string aman (render sebagai teks biasa), ukuran font, warna hex valid, dan pilihan keluarga font heading/body tema; HTML, style arbitrer, URL eksternal, dan perubahan nilai data core tidak diizinkan. Kartu Aset dapat diklik untuk menempel ke Cover, atau diseret lalu dilepas di section yang terlihat untuk memakai koordinat lokasi drop; teks dibuat di section aktif lewat pemilih di menu Teks. Objek yang sudah ditempel dapat digeser dengan pointer/touch lintas section yang terlihat atau dipindah lewat dropdown bagian pada inspector kanan; handle pada objek terpilih mengubah ukuran dan rotasi langsung, tanpa outline putih permanen pada artwork. Section OFF menyembunyikan objeknya tanpa menghapus data. Area utama dan tombol RSVP/Wishes/Gift, lokasi, dan amplop tetap wajib fungsional pada desktop/mobile.

Inspector kanan menyediakan teks/tipe font/warna/ukuran teks bagi objek teks, serta bagian, lebar, rotasi, opasitas, urutan, salin-tempel internal, dan hapus. Delete/Backspace serta Ctrl/Cmd+C/V dan Escape bekerja untuk objek terpilih di Studio tanpa mencuri shortcut pengetikan input, textarea, contenteditable atau teks yang diseleksi. Satu gesture selesai menjadi satu titik perubahan Undo/Redo; desain disimpan saat pemilik menekan **Simpan Desain**, bukan Publish, melalui design key event tersendiri agar preview dan renderer publik menampilkan hasil yang sama. File raster tidak diunggah ulang, tidak ada tabel database/foto/event baru, dan mengganti template mengosongkan override dekoratif tema sebelumnya (Undo dapat mengembalikannya).

**Batas teknis bertahap:** serializer `::layers=` di `Invitation.templateKey` tetap digunakan untuk override dekoratif event demi kompatibilitas fitur sebelumnya, tetapi **bukan** skema proyek master multi-section yang dipersyaratkan `studio.md`. Renderer dan UI wajib tetap menolak section/key/URL/teks/properti yang tidak valid; audit izin role/template, tabrakan objek dengan tombol bisnis, performa, dan hasil CI/browser masih menjadi syarat sebelum mengklaim fitur siap produksi. Master editor Designer, versi template, dan pesanan custom tetap scope terpisah.


### 7.2.0c Designer Studio: protected visual editor untuk template jual dan custom (24 September 2026)

**Tujuan aktif:** desainer berizin dapat login dan membuat/mengedit/menyimpan *master template* di Undara langsung, baik untuk katalog jual maupun pesanan custom event pelanggan, tanpa wajib berpindah ke platform desain lain. **Designer Studio** mengatur komposisi, layer, visual, animasi dan capability lintas section; **Customer Studio** hanya mengganti konten/properti yang diizinkan master. Kedua mode menggunakan renderer/komponen nyata yang sama. Semua komponen bisnis (amplop, identitas/jadwal, RSVP, Ucapan Tamu, hadiah, lokasi, countdown, foto, musik) dilindungi: desain/varian presentasi boleh diubah melalui properti yang di-whitelist, tetapi data wajib, perilaku form, validasi, API, database, aksesibilitas dan otorisasi tetap ditentukan engine bersama. Objek dekoratif boleh diubah bebas jika aman; komponen inti bukan node bebas yang bisa dihancurkan atau diganti dengan kode arbitrer.

**Kanvas Studio (26 September 2026):** Amplop dan Isi tetap halaman desain yang dapat dipilih; interaksi objek dekoratif memakai engine transform bersama lintas section. Canvas Kosong hanya dapat dibuat oleh role OWNER dan DESIGNER, diperiksa lagi pada API penulisan master; pelanggan dan EDITOR tidak dapat memulai master kosong. Footer kecil di bawah canvas menampilkan posisi/jumlah halaman desain aktif, nama section, serta slider zoom 10–500% di kanan bawah. Zoom hanya memperbesar tampilan editor dengan transform viewport, tanpa mengubah lebar layout, reflow, ukuran/koordinat tersimpan, atau hasil publik. Pada semua tingkat zoom, area kosong canvas dapat diseret kiri/kanan/atas/bawah untuk pan; Space+drag tetap tersedia. Angka dihitung dari section yang benar-benar tampil, termasuk duplikasi; kontrak yang sudah ada tetap 15 kontrol visibilitas (14 halaman visual dan satu Musik global), sehingga angka `16/16` hanya muncul bila desain memang memiliki 16 halaman. Elemen bawaan yang saat ini memakai transform visual tersimpan mencakup judul Amplop/Sampul, heading/kicker/divider section, teks naratif berpenanda, tombol visual Location/Gift, elemen RSVP berpenanda, frame foto Cover/Identitas dan foto Galeri per ID aset, dekorasi utama Amplop/Cover/section per tema, serta node tampilan data yang aman seperti nama, venue/alamat, tanggal/waktu, kartu countdown, rekening, ikon, nama/hashtag penutup dan rule dekoratif. Target pada section duplikat memakai `data-section-instance-id` agar transform tiap instance tersimpan terpisah. Struktur internal protected component—misalnya child icon/label dalam satu tombol atau divider, angka/label di dalam satu kartu countdown, field dan perilaku RSVP/Wishes, status runtime, serta helper preview—tetap diperlakukan sebagai bagian komponen/grup dan tidak otomatis menjadi node bebas. Elemen lain yang belum mendukung seleksi/transform langsung wajib dipindahkan bertahap ke capability editor bersama tanpa mengubah fungsi protected component. Status editor penuh belum boleh dinyatakan selesai hanya karena cakupan target visual sudah jauh lebih luas.

**Lifecycle:** simpan master sebagai draft → validasi/review → terbitkan versi render-ready ke katalog. Undangan pelanggan menggunakan versi master yang ditetapkan plus override event-scoped; perubahan master tidak mengubah undangan yang telah terbit diam-diam. Proyek custom hanya untuk event dan desainer yang ditugaskan secara terotorisasi, melalui preview/revisi/persetujuan; tidak otomatis masuk katalog. Desain visual dari ZIP/HTML/JSON unggahan tidak otomatis siap dieksekusi. Model/format proyek versi baru, migrasi kompatibilitas dengan `DesignerTemplate`/`Invitation.templateKey`, UI editor penuh, dan workflow custom **masih merupakan requirement, bukan fitur yang sudah dikirim**. Aturan operasional/acceptance criteria yang spesifik ada dalam `studio.md`, sedangkan `prd.md` ini tetap menjadi sumber persyaratan produk kanonik. Batas Cover-only §7.2.0b menjelaskan implementasi awal **Customer Studio saat ini**, bukan batas desain akhir Designer Studio.

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

Studio mengikuti bahasa visual Dashboard/landing melalui shared semantic tokens, satu frame viewport, hierarchy yang tenang, dan tombol canonical. Navigasi alat memakai penanda aktif primary; panel pengaturan dan kanvas scroll terpisah. Panel dapat disembunyikan pada desktop; HP memilih Pengaturan atau Undangan agar keduanya tetap terbaca. Brand tampil sekali melalui BrandWordmark, nama acara menjadi judul kerja, tanpa pengulangan judul/eyebrow/deskripsi. Canvas utama adalah workspace edit interaktif. **Keputusan terbaru 27 September 2026 menambahkan Preview hasil undangan terpisah sebelum Save**: Preview memakai draft saat ini termasuk perubahan yang belum disimpan, renderer yang sama dengan undangan, dan tidak menampilkan selection box, rail section, guides, inspector, atau kontrol transform. Preview default pada viewport HP/mobile sebagai target utama; opsi Desktop hanya merupakan responsive safety check dan tidak mempunyai design state terpisah. Watermark pembatasan konten prabayar yang sudah ada tetap mengikuti kontrak entitlement.

Kontrak terbaru terdiri dari **15 kontrol ON/OFF**: Amplop Digital, Sampul, Salam Pembuka, Identitas, Detail Acara, Tanggal & Waktu, Galeri/Media, Hitung Mundur, Lokasi, RSVP, Ucapan Tamu, Hadiah/E-Angpao, Penutup, Footer, Musik. Default seluruhnya ON; setiap template tetap mengimplementasikan semua bagian, sementara pelanggan boleh menyembunyikannya tanpa menghapus data. Ini menggantikan batas implementasi lama yang hanya menyediakan tiga toggle. Amplop OFF langsung membuka isi; musik OFF menghilangkan player dan audio. Tanpa amplop, musik mulai lewat tombol play manual agar sesuai pembatasan autoplay browser.

Simpan kompatibilitas `sections=` untuk RSVP/Wishes/Gift dan `hidden=` untuk bagian tambahan pada design key event yang sama; tidak membuat schema/API baru. Desain lama mempertahankan nilai tiga toggle dan seluruh bagian tambahan ON. Kedua renderer nyata membaca kontrak sama untuk Studio dan publik. Nama font heading/body ditulis dengan font masing-masing; font katalog dimuat saat diperlukan. Romantic Rose tetap mengunci palet/font dan menjelaskan alasan alih-alih menawarkan kontrol yang diabaikan renderer. Hashtag/dress code yang sudah tersimpan tetap dibaca dari data event dan tampil pada renderer; menu Isi hanya mengubah copy naratif sebagaimana §7.2.1e, bukan menulis ulang kolom event. Studio **tidak menampilkan tombol Terbitkan**; publish tetap hanya melalui Dashboard → Undangan Digital, setelah desain tersimpan dan seluruh syarat pembayaran/konfigurasi terpenuhi. Simpan Desain tidak mengirim ulang status publikasi lama.

### 7.2.1a Template Studio: reusable artwork library (27 September 2026)

Designer/Owner bekerja terutama dengan artwork/sticker yang ditempel dan diolah di canvas. Template Mode menyediakan **Library Saya** lintas draft berbasis model `DesignerAsset`, terpisah dari `InvitationAsset` customer. Upload raster baru menerima JPEG/PNG/WebP maksimal 15 MiB, diverifikasi/di-decode Sharp, auto-orient, resize maksimum 2000×2000 tanpa upscaling, lalu disimpan sebagai derivative WebP quality 82 dengan UUID di `/uploads/designer-assets/<userId>/`. Library hanya dienumerasi oleh akun staff pemilik; Customer Studio tidak mempunyai browser Library Designer. Karena URL derivative berada di web root agar template published dapat merendernya, file tersebut bukan tempat penyimpanan master berlisensi privat.

Library artwork dapat dipakai berulang pada draft template berikutnya melalui drag-and-drop. Customer Studio tetap memakai batas 10 objek tambahan agar editor sederhana, sedangkan Template Mode dapat menyimpan hingga 120 layer visual sebagai batas performa authoring. Foto customer tetap satu koleksi `InvitationAsset` per event. Template Mode memakai dataset demo untuk menguji slot foto dan tidak mengunggah foto/audio ke synthetic invitation; upload foto dan audio customer tetap melalui API event-scoped.

### 7.2.1a Template Studio: Draft → Review → Publish (27 September 2026)

Template Mode staff memakai lifecycle katalog yang terpisah dari publish undangan customer. Tombol utama adalah **Simpan Draft**. Save pertama membuat `DesignerTemplate` status `DRAFT`; Save berikutnya memperbarui record draft yang sama, dan draft dapat dibuka kembali dari Designer Dashboard. Draft tidak tampil pada katalog publik. Designer/Editor mengirim draft melalui **Kirim Review** sehingga status menjadi `REVIEW`; pada status ini penyimpanan desain biasa dikunci sampai Owner/Admin mengembalikannya ke Draft. Owner/Admin mempunyai antrean review dan dapat **Publish ke Katalog** atau **Kembalikan Draft**. Hanya status `PUBLISHED` yang dibaca katalog publik. Default database untuk record `DesignerTemplate` baru adalah `DRAFT`.

### 7.2.1a Draft Studio hanya bertahan selama refresh (25 September 2026)

Selama pengguna tetap mengedit satu undangan di satu tab Studio, perubahan desain yang belum ditekan **Simpan Desain** wajib dipertahankan ketika tab itu di-refresh (F5 / Ctrl+R / Cmd+R). Ini adalah pemulihan sementara dari `sessionStorage` tab itu, **bukan autosave server dan bukan draft lintas sesi**. Yang dipulihkan adalah pilihan template, properti/objek desain, bagian, foto yang dipilih, teks dekoratif, musik yang dipilih, hashtag dan dress code sebagaimana state editor yang belum disimpan. Snapshot harus diikat ke ID undangan, state yang terakhir benar-benar disimpan di server (bukan fallback aset pada renderer yang dapat berubah setelah unggah foto), dan penanda entri navigasi Studio pada browser agar tidak bisa diterapkan ke event lain, kunjungan SPA yang baru, atau menimpa perubahan server yang lebih baru.

**Batas sesi yang eksplisit:** saat pengguna keluar dari halaman Studio menuju halaman lain, berpindah undangan, melakukan logout, menutup tab, atau kembali ke Studio lewat navigasi biasa/Back/Forward, perubahan yang belum tersimpan **tidak dipulihkan**; Studio membaca desain terakhir yang benar-benar disimpan. Snapshot dibersihkan sesudah Simpan Desain berhasil, dan tidak boleh terbawa ke user/event lain. Refresh saat tetap di Studio boleh mengembalikan pekerjaan terakhir dari tab yang sama, termasuk jika pengguna belum menekan Simpan. Jika browser memblokir storage, Studio tetap dapat diedit dan disimpan secara manual, tetapi pemulihan refresh tidak bisa dijamin. Jangan menganggap cache ini sebagai penyimpanan resmi atau menulis draft ke database tanpa tindakan Simpan.

### 7.2.1b Kembalikan ke Default dan koleksi musik (23 September 2026)

Aksi **Ulang dari awal** (sebelumnya berlabel “Kembalikan ke Default”) terletak di rail alat Studio tepat **di bawah menu Isi**, menggunakan ikon putar ulang, bukan menambah tombol di toolbar atas. Aksi ini mengembalikan palet, font, dan 15 visibility flag ke preset tema yang sedang dipilih (semua flag ON). Tidak mengganti tema atau menghapus foto, pilihan musik, maupun isi acara. Tooltip harus menjelaskan batas pemulihannya; kontrol hanya aktif ketika undangan siap diedit. Perubahan langsung terlihat, dapat di-Undo, dan baru persisten melalui Simpan Desain. Tombol putar ulang preview Amplop yang sudah ada tetap terpisah dan hanya mengulang animasi pratinjau.

Unggahan musik dibatasi **2 aset AUDIO per undangan, masing-masing maksimal 3 MB (3 × 1024 × 1024 byte)**. Pemeriksaan jenis, ukuran, dan kuota berjalan pada client serta server; count+create diserialisasi melalui row lock Invitation agar request bersamaan tidak melewati kuota. Panel menampilkan pilihan lagu bawaan, daftar unggahan, jumlah slot, dan Hapus; lagu bawaan tidak memakai slot. Penghapusan aset membebaskan slot, membersihkan referensi musicUrl apabila file itu aktif, serta menghapus file lokal terverifikasi. Unggahan baru otomatis dipilih untuk pratinjau; pilihan disimpan lewat Simpan Desain. Aset lama tidak dihapus otomatis walaupun melampaui batas baru; pengguna dapat menghapusnya sendiri. Pembuatan aset baru melalui URL tidak diperbolehkan karena ukuran file tidak dapat diverifikasi; gunakan uploader binary. URL musik lama masih kompatibel. Ketentuan ini menggantikan batas audio sebelumnya (1 file/10 MB) dan penambahan URL di panel Musik.

Foto tetap melalui Sharp: decode, orientasi otomatis, resize maksimal 2000×2000 tanpa pembesaran, encode WebP quality 82, simpan event-scoped. Batas foto tetap 30 file dan input maksimal 15 MB. **Wishes sekarang memakai shared API dan model GuestWish event-scoped**, bukan placeholder; tetap jangan mengklaim fitur berfungsi pada database target sebelum migrasi GuestWish telah diterapkan dan alur submit publik diuji.

### 7.2.1f Ucapan Tamu aktif di undangan publik, bukan placeholder (24 September 2026)

**Perbaikan owner:** label toggle Studio cukup `Ucapan Tamu`, tanpa keterangan menempel `Pengiriman ucapan belum tersedia.` yang membuat label sulit dibaca dan tidak sesuai kondisi fitur. Bagian `wishes` di `UniversalInvitationTemplate.tsx` (termasuk Zen Atelier) dan `RomanticRoseTemplate.tsx` menampilkan satu komponen reusable `GuestWishes.tsx`, bukan teks placeholder. Tamu pada undangan publik yang aktif dapat menulis nama (maksimum 80 karakter) dan ucapan/doa (maksimum 600 karakter), mengirim melalui `POST /api/invite/[slug]/wishes` dan melihat maksimal 30 pesan terbaru dari `GET`. Pesan baru ditampilkan sebagai teks biasa, bukan HTML atau dummy. Identitas penulis pesan adalah **nama yang ditulisnya sendiri**, bukan bukti bahwa ia pemilik suatu record Guest atau sudah RSVP.

**Sumber data dan keamanan:** `GuestWish` di Prisma dimiliki satu `Invitation.id`, dihapus secara cascade bersama event, dan tidak membuat/menimpa `Guest`, RSVP, kuota atau daftar penerima. GET/POST memeriksa eventConfigured, status publish, entitlement Digital Invitation **milik event tersebut**, toggle Wishes, serta akses password menggunakan cookie bertanda tangan ketika diperlukan; POST membatasi ukuran payload/nama/pesan dan memakai public rate limit. Mode Studio/katalog (`preview=true`) hanya menampilkan form nonaktif: tidak GET, tidak POST dan tidak memalsukan kiriman yang tersimpan. Toggle OFF menyembunyikan form/list tetapi **tidak menghapus record ucapan**. Komposisi tiap template boleh berbeda; bukan membuat endpoint atau tabel baru per tema.

**Operasional:** Migrasi `prisma/migrations/20260924183000_guest_wishes/migration.sql` wajib dijalankan di target database melalui `pnpm db:deploy`, lalu `pnpm db:generate` untuk client lokal; CI generate/build berhasil **tidak berarti migrasi produksi diterapkan**. Uji manual setelah deploy: kirim dan refresh pada undangan yang diterbitkan dan dibayar, cek data terisolasi antarevent, uji password, preview tidak mengirim, dan tombol Wishes OFF/ON mempertahankan pesan. Public rate limit saat ini in-memory per instance; untuk produksi dengan trafik tinggi perlu mempertimbangkan rate limiter shared storage dan moderasi/penanganan spam secara terpisah. Jangan mengklaim moderasi/anti-spam lintas-instance sudah tersedia.

### 7.2.1e Studio → Isi: hanya narasi yang didukung template, bukan input acara kedua (24 September 2026)

**Kontrak menu Isi dan kelengkapan setiap template baru:** ikon **Isi** di rail kiri hanya mengubah narasi milik template, bukan data acara. Setiap template **baru** wajib menyiapkan komponen teks naratif nyata untuk **Salam/Pengantar (`greeting`), Permohonan Kehadiran (`attendanceRequest`), Doa atau Harapan (`prayerWish`), dan Ucapan Penutup (`closing`)** di dalam section yang sesuai dari 15 section yang sudah ada, dengan default/capability/batas karakter dan koneksi ke menu Isi, canvas Studio, Simpan Desain, dan undangan publik/personal. Empat slot ini **bukan empat section/toggle baru**; tiap template bebas menentukan komposisi, bahasa doa/harapan yang relevan dan tata letak. Kalimat penjelasan tambahan/kutipan hanya mempunyai field tersendiri bila teks itu nyata di renderer (contoh existing `zenQuote` pada Zen Atelier untuk event berformat pasangan). **Dilarang membuat input Isi yang tidak terlihat pada undangan sungguhan**, dan pengguna tidak diberi input untuk judul/label komponen yang memang terkunci. Kontrak wajib bagi template baru ini tidak berarti semua template lama sudah memenuhi empat slot: implementasi awal Universal/Romantic Rose saat ini baru mempunyai `greeting` dan `closing`, sedangkan Zen Atelier juga mempunyai `zenQuote`. Slot baru pada tema lama harus ditambahkan ke registry `lib/templates/editable-copy.ts` dan renderer terlebih dahulu sebelum tampil di Studio. Checklist implementasi lengkap ada di `template.md` bagian Menu Isi.

**Bukan tanggung jawab menu Isi:** input ulang nama pasangan/host/orang tua, gelar dan urutan anak, judul acara, tanggal/jam, lokasi/alamat, rekening, data tamu/RSVP, serta copy label/form/section bawaan komponen yang terkunci. Itu tetap dibaca dari data acara atau fitur bersama dan hanya diedit pada pemilik data yang berwenang (misalnya Dashboard → Rangkaian Acara), bukan sumber kedua di Studio. Hashtag/dress code dan deskripsi event yang sudah tersimpan tetap dapat dirender seperti sebelumnya, tetapi panel Isi **tidak lagi mengubah kolom-kolom DB tersebut**; `Invitation.description` hanya boleh menjadi fallback salam pembuka untuk undangan lama, bukan tujuan tulis editor baru.

**Our Story / Tentang Kami (24 September 2026):** Tema yang mendukung acara berformat pasangan memiliki satu segmen narasi pasangan **setelah Identity dan sebelum Event Detail**, dengan judul artistik milik tema dan isi cerita yang benar-benar ditulis pemilik undangan melalui menu **Isi** (`ourStory`; maksimum 1.600 karakter, mendukung baris baru). Segmen ini **subbagian Identity**, sehingga mengikuti toggle Identitas pada kontrak 15 komponen yang sudah ada: tidak menciptakan section ke-16, toggle tambahan, atau tabel baru. Isi cerita bersifat **opsional**; jika belum ditulis, renderer dan undangan tamu tidak menampilkan segmen, placeholder, atau kisah fiktif. Nama pasangan tetap berasal dari data event. Hanya event dengan kategori `nameMode: "couple"` yang menampilkan editor dan segmennya; non-pasangan tetap memakai tampilan identity normal. Pengubahan isi cerita mengikuti alur design key `::copy=`, Undo/Redo, Simpan Desain, dan preview/public renderer yang sama. Semua tema yang sudah menggunakan UniversalInvitationTemplate atau RomanticRoseTemplate kini dapat menampilkan segmen ini; layout dan art direction per-tema tidak harus sama. Panduan `template.md` mewajibkan template pasangan baru menyediakan slot Our Story nyata, tetapi tidak memaksa pemilik mengarang cerita hanya untuk mengisi undangan.

**Penyimpanan dan kompatibilitas:** teks naratif milik tema disimpan terikat `Invitation.id` bersama design state melalui segmen `::copy=<URL-encoded JSON whitelist>` di `Invitation.templateKey`, dengan parser/normalizer `lib/templates/editable-copy.ts`, tanpa migrasi DB atau tabel konten kedua. Undo/Redo, dirty state, dan **Simpan Desain** bekerja lewat design key yang sama. Studio mengirim `designKey` belum tersimpan ke renderer untuk feedback langsung; setelah simpan, renderer URL publik/personal membaca override yang sama. Ketika belum ada override, tampilkan copy tema sebelumnya atau event `description` persis seperti perilaku lama. Saat pengguna mengganti tema, teks naratif khusus tema lama tidak boleh otomatis terbawa. Teks di-render sebagai React text biasa (bukan HTML dari user), dibatasi maksimum dan tidak boleh mengubah data acara, label tombol `Buka Undangan` atau aturan section. Isian tidak relevan untuk non-wedding tidak ditampilkan. Tombol ID/EN hanya menerjemahkan label editor, **bukan** mengubah copy yang ditulis pemilik event.

### 7.2.1d Studio: UI ringkas dan pemisahan Publish (24 September 2026)

**Bentuk tombol terbaru:** Landing, Studio dan Dashboard memakai satu bentuk CTA: **persegi panjang bersudut bulat 16px**, tidak memakai pill/rounded-full. Semua komponen reusable mengambil `--undara-control-radius` dari `app/globals.css`; Studio tidak boleh membuat radius khusus untuk Amplop/Cover, filter foto, dropdown urutan atau tombol pencarian. Foreground tombol mengikuti semantic `primary-foreground`; tombol outlined tetap terbaca pada kedua mode. Kecuali kontrol artistik/checkbox/radio/navbar yang memang memiliki geometri berbeda, tidak ada aturan bentuk tombol lain.



**Aturan aktif terbaru (menggantikan arahan UI Studio yang bertentangan di riwayat lama):** Header Invitation Studio hanya berisi navigasi kembali, BrandWordmark, dan tombol shared **Light/Dark + ID/EN** dengan gaya outline brand, radius serta hover yang sama seperti landing page; tombol ID/EN menggunakan state/cookie bahasa aplikasi yang sama dan mengubah copy utama Studio, bukan mengganti konten acara milik pelanggan. Hilangkan banner abu-abu **“Desain bisa disimpan sekarang. Paket diperlukan saat terbitkan.”** karena hak publikasi tetap diurus di Dashboard. Hilangkan **Terbitkan/Publish** dan **tombol/modal Pratinjau tambahan** dari Studio: canvas yang terlihat adalah pratinjau interaktif yang bisa mengubah Amplop/Cover. Tombol **Simpan Desain** tetap ada dan hanya menyimpan desain. Tombol Publish/paket beserta seluruh validasi dan pembayaran ada di **Dashboard → Undangan Digital** saja; penghapusan tombol Studio tidak mengubah backend, entitlement, atau proteksi tampilan prabayar.

Nama/judul di heading Studio ditampilkan memakai `invitationTitleCase` **hanya saat render**: `Pernikahan hendra & reni` terlihat sebagai **`Pernikahan Hendra & Reni`**, tanpa menimpa database atau mengubah judul user lain. Rail alat di kiri harus menyediakan jarak lega antara ikon dan label, ukuran teks terbaca, serta ruang kiri/kanan cukup; canvas utama dipersempit menjadi sekitar **340px** desktop dan maksimal lebar tersedia pada mobile, tetap dapat scroll dan menampilkan renderer template yang sama. Popup kedua tidak boleh digunakan hanya untuk melihat apa yang sudah tampak dalam canvas. Tombol mode Light/Dark dan ID/EN tetap dapat diakses pada viewport mobile. **Memilih Cover dari toolbar tidak boleh menyimpan toggle Amplop OFF**; saat Amplop dibuka, toolbar otomatis berpindah ke Cover tanpa me-remount player musik pada canvas (key renderer tidak mengikuti indikator stage).

**Kerapian tombol, filter, dan panel tema Studio:** Semua tombol terpilih (termasuk filter foto dan tombol Amplop/Isi di canvas) mengikuti semantic Undara `bg-primary text-primary-foreground` pada kedua mode. Jangan mengembalikan hardcoded legacy palette atau `text-black` tanpa semantic foreground. Tombol tidak terpilih tetap outline brand dengan teks warna foreground/aksen, tanpa menambahkan variasi CTA baru. Dropdown pengurutan **Pilihan aktif / Nama A–Z / Nama Z–A** harus memiliki penanda panah custom yang berada sekitar 16px dari sisi kanan, teks punya padding kanan sekitar 44px agar tidak bertabrakan, lebar cukup untuk label, dan tinggi ringkas sekitar 36px. Panel inspector yang memuat pencarian/filter/list template dibuat lebih lebar ke arah kiri (kolom 360px desktop / 380px lebar besar, tidak memperbesar canvas undangan), tinggi item tool rail diringkas menjadi sekitar 74px dengan jarak ikon-label 10px; pada ponsel tetap satu kolom responsif tanpa overflow. Tidak mengubah sortir, pencarian, pilihan tersimpan, atau 15 section.

### 7.2.1c Konsistensi renderer dan kapitalisasi nama (24 September 2026)

Font pilihan pada seluruh tema yang mengizinkan kustomisasi font diteruskan ke nama amplop/sampul melalui token heading/body yang benar-benar dimuat oleh aplikasi. Palet custom memengaruhi permukaan utama, tinta dan aksen amplop/sampul, dengan warna teks terbaca pada permukaan terang/gelap; preset kembali ke artwork asli. Romantic Rose tetap terkunci. Semua nama host/pasangan dan judul acara pada amplop, sampul, identitas, detail dan penutup menggunakan `displayTitleCase` saat render, termasuk data lama. Nama penerima pada password gate juga diformat. Tidak mengubah isi database, pesan, deskripsi, URL, atau hashtag, dan tidak memaksakan uppercase penuh pada nama.

Studio menampilkan retry saat load gagal. Nama toggle **Ucapan Tamu** tidak lagi ditempeli keterangan unavailable; canvas menampilkan form ucapan non-submitting, sementara endpoint shared memproses ucapan pada undangan publik yang sah. Penyimpanan desain mengunci row Invitation yang sama dengan upload/delete musik, memvalidasi bahwa URL upload yang dipilih masih menjadi aset event tersebut, serta tidak menimpa status sudah terbit dengan snapshot lama. Persistence Wishes adalah model GuestWish terpisah dari penyimpanan desain dan RSVP.

### 7.2.2 Scalable template architecture

Undara harus mendukung katalog undangan dalam skala besar — puluhan hingga ratusan template — tanpa membuat aplikasi, backend, database flow, atau feature implementation terpisah untuk setiap template.

Prinsip canonical:

**Satu shared invitation engine + shared event/content data + shared feature logic + banyak presentation/template.**

Template adalah reusable design definition. Template master disimpan satu kali dan dapat digunakan oleh jumlah event/user yang tidak dibatasi. Per-event storage hanya menyimpan identity/configuration yang memang spesifik terhadap event, seperti `templateKey`, section configuration, customer media, dan customization yang diizinkan template.

Business logic dan data contract invitation dimiliki oleh Undara Core dan reusable lintas-template, termasuk:
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

Setiap template undangan yang READY, termasuk seluruh built-in yang tercatat dalam registry aktif dan semua template baru setelah renderer terintegrasi, WAJIB memiliki amplop digital interaktif dengan tombol **Buka Undangan** sebelum Cover; amplop bukan pengganti Cover, bukan pintu marketing landing. Seluruh renderer real di halaman publik, Invitation Studio, dan galeri template menampilkan section semantik berikut secara konsisten:

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

Tiga feature section RSVP/Wishes/Gift dapat dinonaktifkan oleh customer lewat toggle yang sudah ada; section OFF tidak menghapus datanya. Section dengan media, Maps, atau informasi bank yang belum diisi tidak boleh membuat foto, alamat, nomor rekening atau aksi palsu: tampilkan empty state jujur atau sembunyikan kontennya sambil mempertahankan slot struktural. Identity mengikuti jenis acara (couple, individual, host), bukan selalu wedding. Form RSVP aktif hanya pada undangan publik; preview tidak boleh menyimpan data customer. **Wishes sudah menggunakan shared persistence API:** pada undangan tamu yang aktif, form benar-benar menyimpan pesan dan daftar menampilkan ucapan terbaru; canvas Studio/katalog memakai form visual non-submitting dan tidak pernah menulis database. Model GuestWish event-scoped terpisah dari Guest (identitas penerima/RSVP); toggle Wishes OFF menyembunyikan komponen tanpa menghapus ucapan. Deploy migrasi GuestWish wajib sebelum fitur dipakai di database target.

Template memiliki gaya sendiri untuk amplop, ornamen, frame foto, palette, fonts, animasi, layout dan (bila manifest mengizinkan) urutan section. Feature logic, photo role, countdown, audio, RSVP, keamanan dan data milik shared engine. Komponen publik dan Studio harus merender presentasi yang sama, bukan menampilkan mock section di Studio dan konten berbeda di URL publik. Ketiga jalur URL undangan tamu—utama, per acara, dan personal—wajib melewati satu shared renderer dispatcher. Key dari upload designer baru tetap preview gambar tidak aktif sampai renderer sesuai kontrak ini selesai dibuat dan terdaftar.

Semua contoh foto yang dipakai katalog, gallery fixture, dan Studio default harus mengambil asset yang SUDAH ADA di public/: /couple.jpg, /couple2.jpg, /couple3.jpg, /man.jpg, /female.jpg, bukan URL Unsplash. File tersebut hanya dummy/demo; foto undangan pelanggan selalu berasal dari InvitationAsset milik event sendiri, bukan fallback foto demo. Kode tema baru mengambil foto contoh dari manifest/shared fixture, tidak duplikasi file. Sharp WebP tetap wajib untuk semua upload image baru sesuai §7.2.7b.

### 7.2.3c Musik bawaan untuk seluruh template undangan (22 September 2026)

Semua template undangan READY wajib menyediakan **musik undangan bawaan** tanpa mengharuskan pengguna terlebih dahulu mengunggah MP3. Satu `lib/templates/music.ts` menyimpan pemetaan stable key ke audio yang sudah tersedia di `public/`; pilihan `Invitation.musicUrl` yang disimpan pemilik event menjadi prioritas, dilanjutkan aset `InvitationAsset` bertipe AUDIO pada event yang sama, baru kemudian musik tema bawaan. Tidak perlu menggandakan audio, menyimpan lagu per pelanggan atau mengubah skema database. Template baru harus mendaftarkan musik default pada manifest musik bersama; jangan memakai track template lain secara implisit dalam produksi.

Player berada di luar subtree amplop yang di-unmount dan digunakan bersama oleh semua renderer template siap (`RomanticRoseTemplate` dan `UniversalInvitationTemplate`), dengan tombol musik **play/pause yang tetap mudah dijangkau** setelah amplop dibuka; lagu di-loop dan pengguna selalu bisa menjedanya. Pada halaman undangan publik, pemutaran dicoba langsung pada gesture klik/tap `Buka Undangan`, bukan autoplay saat page load atau di `useEffect`; jika browser memblokir play, undangan tetap dapat dibuka dan tombol play manual harus tetap berfungsi. Satu undangan hanya memiliki satu elemen audio aktif: hapus player kedua yang sebelumnya berada di footer. Saat berganti ke undangan/preview lain atau meninggalkan komponen, hentikan player sebelumnya. Perhatikan tab tersembunyi dan keyboard accessibility. Preview katalog/Studio **tidak** mengaktifkan musik otomatis (banyak preview card dimount bersamaan); audio hanya bermain jika user menekan play secara eksplisit. Saat audio preview bermain pada route marketing, hentikan sementara musik ambience marketing lalu kembalikan sesuai pilihan mute pengguna setelah preview selesai, sehingga tidak ada dua lagu bertumpuk.

Menu Musik di Studio menampilkan pilihan lagu bawaan dan upload audio per event; URL musik warisan yang telah tersimpan tetap dibaca demi kompatibilitas, tetapi pembuatan aset/audio baru hanya dari URL tanpa binary tidak diperbolehkan sesuai batas upload §7.2.1b. Panel menunjukkan musik bawaan untuk tema yang dipilih, dan preview dapat mendengar lagu yang sedang diedit tanpa menunggu Save. Jangan pasang musik undangan pada halaman Dashboard, landing, guestbook, atau undangan belum terbit. Asset dan lisensi lagu yang digunakan untuk distribusi publik harus dipastikan sesuai hak penggunaan oleh pengelola sebelum rilis komersial.

### 7.2.3b Dua belas tema bawaan: enam dengan foto, enam tanpa foto (audit 24 September 2026)

Setiap template READY harus punya komposisi nyata yang dapat dibedakan secara visual sebelum dan setelah membuka amplop, bukan hanya pergantian palette, font, stock photo dan border radius pada satu layout. Manifest tunggal `lib/templates/catalog.ts` menyatakan `usesPhotos: boolean`, `photoSlots`, nama dan preset. Katalog bawaan yang diverifikasi dari `lib/templates/catalog.ts` pada audit 24 September 2026 memiliki **12 template, 6 dengan foto dan 6 tanpa foto** (10 tema awal + Zen Atelier + Pencil Reverie). Jumlah aktual dan daftar key diperiksa terhadap registry, bukan disalin dari riwayat versi lama:

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
| Tanpa foto | `pencil-reverie` | Sketsa pensil dan kolase ilustratif vintage, bukan foto pengguna |
| Foto | `zen-atelier` | Amplop/sampul ilustrasi Jepang, potret pasangan editorial dan galeri foto milik event; ensō, sakura, dan pegunungan tinta |

Untuk setiap theme, amplop digital tetap punya lipatan/flap dan aksi "Buka Undangan" riil; visual envelope, Cover dan section decoration mengikuti identitas theme berbeda. Foto preview berbasis aset `public/` yang sudah ada, tanpa mengambil URL Unsplash. Tanpa-foto bukan sekadar menyembunyikan tag `img`: tutup, Hero, Identity, Gallery/Media dan dekorasi mengutamakan tipografi, ornamen/ilustrasi dan data event, tidak merender media customer walaupun sebelumnya pernah mengupload foto untuk theme lain. Studio tidak memunculkan input slot/upload untuk theme tanpa foto (koleksi event tetap tersimpan dan muncul bila customer beralih kembali ke theme foto). Gallery/media tanpa foto tetap section semantik ke-6 tetapi menjadi surface story/illustration tanpa menciptakan foto/memori personal palsu. Image-preview-only designer submissions tidak otomatis dipaksa masuk hitungan 6/5 dan tidak selectable hingga renderer asli tersedia.

Galeri publik dan pemilih template Studio menampilkan thumbnail scene visual yang benar-benar digunakan renderer, bukan image sama untuk sejumlah theme; identifikasi jelas melalui badge/filter "Dengan foto" dan "Tanpa foto". Tetap gunakan satu katalog untuk Studio, `/template-design`, `/d-invitation`, tanpa menggandakan API RSVP, assets/customer media, format penyimpanan atau bypass akses Studio. Semua theme tetap menjalankan kontrak 13 section/amplop di §7.2.3a dan integrasi Sharp WebP untuk media upload customer.

**Zen Atelier — pengelolaan aset (24 September 2026):** Aset PNG Zen/Jepang yang sudah ada di `public/templates/` menjadi ilustrasi utama amplop, sampul, dan ornamen 13 section. Komposisi visual berada pada `components/PublicInvitation/ZenAtelierScene.tsx` dan `components/PublicInvitation/ZenAtelierArtwork.tsx` dengan dynamic import khusus tema. Kesesuaian pixel-per-pixel dengan gambar dalam shared chat **belum dapat diverifikasi** tanpa inspeksi visual referensinya; keberadaan nama berkas saja bukan bukti ekspor asli. Semua PNG pada web root bisa diakses publik, dan `.gitignore` tidak melindungi aset yang sudah ada dalam riwayat Git. Simpan master berlisensi privat hanya di storage privat di luar Git/web root dengan otorisasi server. Optimasi PNG yang sekarang masih besar menjadi derivative WebP menjadi tindak lanjut tersendiri; jangan menimpa aset master yang sudah dipakai. Foto customer tetap memakai Sharp/WebP/InvitationAsset; RSVP/Wishes/Gift dan database tidak digandakan.

**Zen Atelier — prompt reconstruction (24 September 2026):** Ikuti `template.md` dan prompt owner: satu amplop dengan aksi Buka Undangan, cover bunga kiri-atas/nama bertumpuk/gunung bawah, foto pasangan lebar via slot cover, galeri dua kolom dengan modal keyboard/swipe, form RSVP bersama berkulit ivory/charcoal, dan musik lokal Zen. Jangan memakai akhir acara sebagai jam resepsi atau kategori foto palsu. RSVP dan Wishes menggunakan layanan bersama yang sudah ada di source; kemampuan produksi pada database target tetap bergantung pada migrasi dan pengujian alur publik yang relevan. Inventaris aset, pemetaan, batas model, dan sisa verifikasi visual dicatat di `assets/templates/zen-atelier/README.md`. 15 key section existing dipertahankan; tidak membuat key cerita fiktif.


**Zen Atelier — Amplop Digital ala Jepang, revisi owner (24 September 2026):** Amplop Zen wajib berkarakter **surat seremonial Jepang berbahan washi**, berbeda dari fotografi amplop gaya Barat dengan segel lilin yang dipakai pada implementasi sebelumnya. Komposisi khusus amplop: lipatan kertas asimetris bertumpuk, ikatan seremonial merah/emas `mizuhiki`, cap merah seperti stempel tinta (bukan wax seal), tekstur ivory, aksen rangka `shoji`, cabang bunga, enso/matahari terakota, dan gunung sumi-e yang sudah disediakan sebagai SVG milik Zen. Nama/tanggal di slip dalam harus diambil dari data undangan aktif. Animasi pembuka mengikuti satu gestur `Buka Undangan` → simpul membuka → lipatan terangkat → surat naik → Cover, menghormati `prefers-reduced-motion`, timer parent dan tombol Amplop/Cover Studio; jangan menambah CTA kedua atau tulisan teknis. **Hanya Amplop Zen yang direvisi:** Cover/Hero, 13 bagian lainnya, katalog Cover-first, database, pembayaran, landing/Pintu dan tema lain tetap tidak berubah. PNG `amplop1.webp` tidak lagi dipakai oleh renderer Zen saat ini, tetapi tetap ada sebagai aset referensi historis. Foto moodboard kanan menjadi inspirasi owner; klaim kemiripan visual eksak memerlukan screenshot browser untuk perbandingan.


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

Upload beberapa foto memakai API asset undangan yang sudah ada, namun assignment foto sekarang memakai shared photo slots (lihat §7.2.7b): cover, personOne, personTwo, dan pilihan galeri tidak lagi harus ditentukan dari urutan foto upload. Undangan lama tetap kompatibel dengan fallback cover/foto kedua/foto ketiga serta galeri seluruh foto bila assignment belum pernah disimpan. Preview Studio memakai presentation Romantic Rose yang sama dengan public renderer; section RSVP/Wishes/Gift mengikuti section visibility state. RSVP menggunakan `RsvpForm` bersama. Wishes memakai komponen GuestWishes dan endpoint shared yang sama dengan tema lain; form nyata hanya aktif pada undangan publik, sedangkan preview Studio tidak boleh mengirim pesan ke event asli. Gift hanya tampil jika aktif dan rekening tersedia. Palette dan typography khusus Romantic Rose terkunci agar kualitas visual terjaga; animation toggle per section dan full capability-aware Studio control masih tahap selanjutnya, tidak boleh diklaim sudah selesai.

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

Undara harus memiliki standard demo/dummy invitation data yang reusable untuk preview dan QA template baru. Demo data tidak boleh bercampur dengan production customer data.

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

Halaman `/template-design` merupakan marketing page dengan visual baseline landing terverifikasi `/` dan `/d-invitation`, bukan halaman terpisah dengan full-page putih, navbar/footer tambahan atau dekorasi marketing ganda. Gunakan komponen bersama `Navbar embedded`, `PublicMarketingAtmosphere` dan `MarketingFrameFooter`; bingkai utama di desktop mengikuti shared marketing frame aktif, dengan semantic border/surface dan ruang konten yang responsif. Hanya main bagian tengah yang scroll; navbar dan footer tetap pada tempatnya. Di mobile frame tetap responsif tanpa menyebabkan scroll horizontal. `PublicAtmosphere`, `PublicContent`, Navbar/Footer global dan `MarketingFloatingControls` harus memperlakukan rute ini sebagai framed marketing page supaya tidak menduplikasi atmosphere woodland, pemutar musik, social controls, navbar atau footer. Musik tetap satu player dari marketing provider dan mengikuti pilihan mute/reduced motion. Jangan mengubah landing/Pintu atau desain `/d-invitation` ketika menyamakan shell galeri.

Area isi berbahasa Indonesia default dan responsif terhadap ID/EN navbar; memakai shared typography dan semantic theme tokens aktif. Copy ringkas dan tidak mengulang brand/undangan/galeri secara berlebihan. Kartu katalog harus tetap bersumber dari API/manifest tunggal dan thumbnail real yang lazy-load; filter/pencarian/sort serta preview modal tetap berfungsi tanpa login. Modal preview yang memanjang dibuka di atas bingkai, dapat scroll sendiri, dan tidak terpotong oleh overflow main frame. Tombol pemakaian template membawa pengguna ke Dashboard untuk login/buat event dahulu, tidak membuka Studio anonim. Mode terang/gelap, aksesibilitas keyboard dan interaksi mobile tetap berlaku.

**Kontrak bentuk kontrol tunggal, berlaku 24 September 2026 dan menggantikan seluruh arahan pill sebelumnya:** Tombol CTA aplikasi termasuk landing dan Studio, input satu baris, filter, trigger dropdown dan opsi menu memakai **kotak dengan sudut membulat 16px (rounded rectangle), bukan pill/kapsul** dengan outline brand pada Light/Dark; panel menu custom memiliki radius 18px. Token radius, radius menu, outline ada di `app/globals.css`; pakai `components/ui/button.tsx`, `components/ui/input.tsx` dan `components/ui/control-styles.ts` sebagai sumber bersama, bukan file style khusus halaman. `/template-design` menggunakan source yang sama untuk kolom Cari, chip filter dan Urutkan (Urutan katalog, Nama A–Z, Nama Z–A; ID/EN, Escape, klik di luar), tanpa duplikasi class shape/border. Popup native `<select>` dirender sistem operasi sehingga bentuk opsi tidak dapat dikendalikan penuh; ketika opsi menu harus rounded pakai dropdown custom yang aksesibel. Pengecualian geometry tetap berlaku untuk navbar/control icon khusus yang sudah disetujui, checkbox/radio, textarea multi-baris, dan artistik template undangan; token global tidak boleh mengubah layout/warna frame, Pintu, atau ilustrasi undangan.

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

**Undara Core** memiliki data contracts, database, authorization, event isolation, validation, RSVP/Wishes/Gift logic, Maps/location data, payment/entitlement, dan business rules lain.

**Template Layer** memiliki typography, colors, layout, artwork, ornament, animation, section composition/order, allowed customization capabilities, dan presentation RSVP/Wishes/Gift.

Template layer mengatur cara shared function ditampilkan, tetapi tidak menjadi source of truth untuk persistence, authorization, entitlement, payment, ownership, atau data-security rules.

### 7.3 Template save state

`Invitation.templateKey` adalah indikator bahwa desain/template pernah disimpan.

Configured event tanpa `templateKey` **tidak boleh publish**.

### 7.4 Unpaid template preview & anti-copy strategy

User **boleh** membuka Studio, memilih template, mengedit, preview, dan menyimpan desain sebelum membayar.

Untuk event yang belum memiliki Digital Invitation entitlement:
- preview Studio diberi watermark `PREVIEW • UNDARA`;
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

Footer undangan tetap memiliki kontrol ON/OFF, tetapi **tidak boleh menampilkan atribusi promosi** seperti `Created with Undara`, `Made with Undara`, atau `Dibuat dengan Undara` pada undangan yang dipublikasikan. Tampilan footer boleh berupa penutup dekoratif ringkas sesuai tema tanpa menambahkan copy filler. Identitas brand Undara pada situs pemasaran, Dashboard, atau alur operasional tidak termasuk dalam perubahan footer undangan ini.

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

### 11.1a Template pesan per acara (komponen yang sudah ada di source)

Pengelola acara dapat menyimpan, mengedit dan menghapus template pesan WA Blast per event untuk undangan, pengingat RSVP, pengingat hari acara, dan ucapan terima kasih, memakai `WaBlastTemplate` serta satu sumber data event/tamu. Pesan dapat memuat placeholder terkontrol seperti nama, acara, tanggal, lokasi dan tautan; preview memakai data penerima aktual atau label contoh yang jelas, bukan informasi pelanggan fiktif. **Menyusun, menyalin, atau melihat preview bukan pengiriman massal** dan tidak mengurangi kuota. Tautan undangan publik hanya ditampilkan untuk disalin bila undangan sudah terbit. Pengiriman massal, provider dan penjadwalan backend mengikuti status implementasi serta persyaratan terpisah §11.2, bukan dianggap selesai karena form template pesan tersedia.

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

Data transaksi gift harus terpisah dari billing Undara.

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

## 15. Design System & UX Rules

### 15.1 Sumber visual

- Jangan menjadikan PRD sebagai tempat menyimpan hex color, font stack, shadow, radius, atau ukuran dekorasi yang mudah berubah.
- Semantic theme tokens di `app/globals.css`, shared primitives, `BrandWordmark`, dan komponen layout aktif adalah implementation source untuk detail tersebut.
- Gunakan komponen bersama sebelum membuat variasi visual baru per halaman.
- Invitation artwork tetap scoped ke template dan tidak dipaksa mengikuti palette application shell.

### 15.2 Typography & copy

- Heading, body, metadata, dan control typography harus konsisten melalui token/font utility aktif; jangan hardcode font berbeda per page tanpa alasan desain yang jelas.
- Visible standalone UI names memakai **Title Case** sesuai bahasa, sambil mempertahankan acronym/brand resmi seperti `Undara`, `RSVP`, `VIP`, dan `WhatsApp`.
- Nilai database tidak diubah hanya demi kapitalisasi tampilan.
- Customer-facing copy pendek, kontekstual, dan tidak mengulang kata workspace/acara/undangan tanpa kebutuhan.
- Decorative sequence numbering tidak digunakan sebagai filler. Angka nyata untuk tanggal, waktu, harga, jumlah, kapasitas, quota, urutan anak, metric, atau step proses tetap diperbolehkan.

### 15.3 Controls

- CTA/action memakai shared `components/ui/button.tsx` dan semantic primary tokens.
- Input/filter/dropdown mengikuti shared control geometry dan focus state.
- Jangan membuat button system baru per halaman.
- Icon-only, navbar, theme/language control, dan artwork template boleh memiliki treatment khusus selama tetap konsisten dan accessible.

### 15.4 Layout & surfaces

- Marketing memakai shared framed shell dengan navbar/footer bersama dan scroll area internal yang sudah ada di source.
- Dashboard memakai satu mainframe dan panel besar; hindari frame di dalam frame serta tumpukan mini-card dekoratif.
- Public page mengutamakan komposisi editorial, whitespace, hierarchy, asymmetry terkontrol, dan media/ornament yang menyatu dengan layout.
- Garis tipis berulang sebagai pembatas dekoratif di marketing **tidak digunakan**. Gunakan spacing, perubahan komposisi, surface, atau ornament organik bila section perlu dipisahkan.
- Layout desktop boleh lebih ekspresif; mobile harus kembali ke flow sederhana tanpa overflow horizontal.

### 15.5 Woodland / forest language

- Global marketing atmosphere mengikuti §1.2: forest silhouette, canopy, branch, leaves, engraved vine, fog, dan glow lembut.
- **Bunga besar dan legacy petals tidak dipakai sebagai ambience global.**
- Falling leaves boleh digunakan secara restrained jika tidak mengganggu interaksi dan motion preference.
- Ornamen sudut kanan atas marketing diarahkan ke **premium engraved vine / sulur organik**, bukan bouquet/floral cluster.
- Home boleh lebih imersif; service, catalog, help, dan legal pages memakai treatment lebih tipis supaya konten tetap dominan.
- Motion harus tenang dan purposeful. Respect `prefers-reduced-motion`.

### 15.6 Pintu

- Homepage mempertahankan konsep empat Pintu layanan dan transisi masuk yang sudah aktif.
- Geometry, camera, orbit, opening behavior, dan navigation hanya diubah bila owner meminta secara eksplisit.
- Pintu harus terasa bagian dari dunia woodland Undara, bukan elemen floral/Rose lama.

### 15.7 User-facing copy

- Default locale adalah Bahasa Indonesia, dengan English melalui shared language state.
- Marketing, Dashboard, Studio, template controls, dan published invitation mengikuti locale aktif sesuai capability masing-masing.
- Brand customer-facing selalu **Undara**.

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

### 16.0a Kontinuitas background dan tipografi marketing — 29 September 2026

Seluruh route marketing framed (`/d-invitation`, `/event-planner`, `/guestbook`, `/undangan-fisik`, `/template-design`, `/help`) memakai **satu bahasa background yang sama**: foliage bronze/champagne dari `EventPlannerBotanicalAtmosphere`, glow halus, dan daun jatuh beragam. Atmosfer berada sebagai sibling di belakang mainframe transparan, jadi header, body scroll, footer, dan bagian luar frame tetap tersambung secara visual. Hanya panel `main` yang menggulir; bingkai tetap terlihat jelas. Homepage tetap memakai woodland khusus yang sudah disetujui. Ketentuan ini menggantikan bunga/Rose glow lama dan pengecualian foliage khusus Event Planner pada paragraf historis.

Katalog dan seluruh chrome halaman marketing memakai shared typography tokens aktif; karya di dalam preview template tetap memakai font tema masing-masing. Copy produk, email, unduhan QR, dan dokumen baru memakai nama Undara. Nomor invoice lama serta ID teknis `dc-*` tetap dibaca untuk kompatibilitas; invoice baru memakai awalan `UND-`.

### 16.1 Guestbook dan Undangan Fisik — main frame marketing

Halaman `/guestbook` dan `/undangan-fisik` menggunakan komposisi frame viewport yang sudah disetujui pada `/d-invitation` dan `/event-planner`: bingkai Rose responsif ±90vw; navbar embedded tetap di atas, footer compact embedded berisi player musik persisten serta Instagram tetap di bawah, hanya `main` di tengah yang scroll. Dekorasi ornament legacy dan Rose glow memakai **satu** `PublicMarketingAtmosphere` per route di dalam scene, bukan overlay dekorasi global tambahan. Semua konten memakai satu lebar tengah 88% mobile / 80vw mulai sm, `max-w-[1100px]`, dengan gap antarsection 80px mobile / 96px desktop. Global `PublicAtmosphere`, `PublicContent`, Navbar, Footer serta `MarketingFloatingControls` harus mengecualikan kedua framed route ini agar tidak menumpuk background, footer, navbar atau kontrol audio/Instagram.

Pakai `ScrollReveal` berbasis panel scroll internal untuk opacity/translateY per section (`once:false`) dan `MarketingTextReveal` untuk animasi ulang teks hanya setelah keluar dari viewport panel lalu masuk kembali, dari arah scroll mana pun; kendali interaktif, animasi `prefers-reduced-motion` dan keyboard tetap berfungsi. Visual kartu mengikuti shared marketing surface, control geometry, dan typography tokens aktif. Pertahankan data fitur/check-in, review/FAQ/paket dan tautan pada Guestbook; pada Undangan Fisik pertahankan ilustrasi cetak, proses pemesanan, target anchor `#proses` / `#konsultasi` di dalam scroll panel serta tautan WhatsApp dan Digital Invitation. Kedua route tetap bisa dikunjungi dari widget Pintu kiri. Jangan mengubah konten, pintu landing, Dashboard atau undangan tamu.


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
- perubahan material dicatat dalam Appendix A di `prd.md` dengan affected files, commit, dan validation status.

### Critical end-to-end acceptance

Minimal canonical Digital Invitation journey harus bekerja:

`Tambah acara → input acara (WEDDING dapat mengisi parent identity opsional) → dd/mm/yyyy date dengan calendar picker + waktu 24 jam HH:mm → Simpan acara → database event configured → Buat undangan → parent line otomatis tersedia di preview/template jika diisi → pilih template → canvas berubah mengikuti template → atur section RSVP/Wishes/Gift sesuai kebutuhan → edit → Simpan desain → Publish → unpaid diarahkan ke paket event → payment aktif → Publish sukses → public invitation dapat dibuka.`

Public route harus tetap menolak event yang belum configured, belum menyimpan template, belum published, atau belum memiliki valid event-scoped entitlement.

Untuk deployment yang membawa migration baru, end-to-end persistence baru dianggap siap di environment target setelah `prisma migrate deploy` / `pnpm db:deploy` berhasil diterapkan pada database target. Build CI tidak menggantikan langkah ini.

---

## 21. Documentation Governance

**Satu PRD aktif: `prd.md`.** Badan utama (§1–§21) berisi keputusan produk yang berlaku; Appendix A hanya jejak historis dan bukti implementasi, **bukan daftar perintah untuk coding**. Bila keputusan baru mengganti keputusan lama, perbarui satu pasal di badan utama dan pindahkan alasan/perubahannya ke histori. Jangan menumpuk aturan lama dan baru dalam badan utama dengan label "terbaru" tanpa mengganti rumusan lama.

### 21.1 Hierarki sumber dan status dokumen

| Dokumen | Fungsi dan status | Jika ditemukan konflik |
| --- | --- | --- |
| `prd.md` §1–§21 | **Satu-satunya persyaratan produk aktif** (termasuk keputusan terbaru yang sudah disepakati). | Perbarui pasal yang benar, bukan tambah PRD baru. |
| `AGENTS.md` | Aturan kerja dan engineering global; hanya ringkasan prinsip lintas fitur, bukan catatan setiap iterasi UI. | Harus mengikuti `prd.md` untuk keputusan produk. |
| `template.md`, `studio.md` | Panduan implementasi khusus domain; menjelaskan *cara* memenuhi kontrak PRD. | Persyaratan produk yang berubah wajib diperbarui dahulu di `prd.md`, lalu sinkronkan panduan terkait. |
| `README.md` | Orientasi repo dan petunjuk menjalankan aplikasi; **bukan** PRD/changelog kedua. | Ringkaskan dan tautkan ke PRD; petunjuk teknis harus cocok dengan source nyata. |
| `checklist.md` | Daftar pemeriksaan rilis dan hasil QA bertanggal, **bukan** bukti fitur selesai hanya karena checklist tercentang lama. | Revalidasi terhadap source dan lingkungan target; jangan salin checkbox lama sebagai status terbaru. |
| `dashboard-redesign-history.md` | Jurnal tahapan desain Dashboard; bukan PRD produk aktif. | Ambil keputusan aktif dari §6 dan §15; jurnal tidak boleh menimpa PRD. |
| Arsip Git dari `prd-tambahan.md`, `prd-landing.md`, `prdpaging.md`, `pintu3d.md` | File lama dihapus dari branch aktif setelah audit domain awal; referensi lengkap tersimpan di commit GitHub yang tercantum pada Appendix A. | Jangan gunakan rancangan yang tidak disetujui atau milestone historis sebagai aturan aktif; pakai §6, §7, §11 dan §15 PRD yang berlaku. |
| Appendix A dalam `prd.md` | Riwayat tanggal, keputusan, commit, dan validasi; dapat memuat istilah/versi lama. | Tidak dipakai sebagai rule aktif dan tidak menimpa badan utama. |

Dokumen baru `prd1.md`, `prdnew.md`, `PRD2.md` dan sejenisnya tidak boleh dibuat. Empat dokumen landing/delta/Pintu legacy sudah diaudit dan dihapus dari branch aktif pada konsolidasi ini; jangan membuatnya kembali. Semua perubahan produk selanjutnya harus dimasukkan ke pasal kanonik PRD dan perubahan material dicatat di Appendix A. Untuk membaca detail versi lama gunakan permalink GitHub pada Appendix A, bukan memulihkan rulebook paralel.

### 21.2 Urutan saat ada aturan tumpang tindih

1. Periksa keputusan owner paling baru yang **sudah tercatat dan berlaku** pada pasal produk terkait; tandai rumusan sebelumnya sebagai superseded, bukan menggabungkan dua pilihan yang bertolak belakang.
2. Bedakan target/requirement, implementasi yang benar-benar ada dalam source, dan validasi yang benar-benar telah dijalankan. Klaim historis `PASS` tidak otomatis berlaku bagi commit, database, atau environment terkini.
3. Spesifikasi template atau Studio membatasi **cara visual/teknis**, tidak boleh melemahkan otorisasi server, kepemilikan event, entitlement, RSVP, dan kontrak komponen bersama.
4. Perubahan yang berdampak pada banyak fitur harus mencantumkan komponen/source of truth, kompatibilitas data lama, target mobile/desktop, dan penerimaan QA; jangan menduplikasi model/API hanya untuk menyamakan penampilan.

### 21.3 Tahapan pembenahan dokumentasi (audit 24 September 2026)

- **Tahap 1 — Tata kelola dan tautan [pemeriksaan awal selesai untuk 11 dokumen utama teridentifikasi]:** status dokumen, rujukan `prd1.md` yang sudah tidak ada, heading ganda, lokasi pasal, referensi landing, jumlah tema dalam registry, dan status Wishes yang usang telah ditangani. Ini **bukan** bukti seluruh berkas Markdown di subfolder sudah terinventarisasi atau bahwa semua kontradiksi isi sudah hilang.
- **Tahap 2 — Perbandingan lintas-dokumen per domain:** landing/Pintu, Dashboard, template/Studio, tamu/RSVP, pembayaran/entitlement, security/deployment. Untuk setiap domain: matriks keputusan aktif vs legacy vs implementasi vs pending QA, lalu pindahkan rumusan unik yang masih relevan ke satu pasal PRD.
- **Tahap 3 — Pemadatan aturan:** ringkas AGENTS menjadi engineering guardrails; README menjadi onboarding; pindahkan rincian historis berulang dari badan utama ke ringkasan Appendix A atau arsip Git (jangan hilangkan bukti commit).
- **Tahap 4 — Penutupan:** penghapusan empat sumber historis landing/delta/Pintu selesai sebagai pembersihan terlingkup setelah audit keputusan aktif, referensi dan arsip Git. Audit semua Markdown di subfolder, seluruh rujukan silang, status produk dan QA lintas domain **masih perlu dilanjutkan** sebelum menyatakan konsolidasi repo sepenuhnya selesai.

**Aturan perubahan berikutnya:** edit pasal produk kanonik terlebih dahulu; perbarui hanya panduan domain yang terdampak; catat perubahan material dan validasi yang benar-benar diamati pada Appendix A. Jangan melaporkan build, CI, migrasi atau browser PASS hanya berdasarkan perubahan Markdown.
---

# Appendix A — Implementation History

Appendix ini hanya menyimpan **ringkasan keputusan yang masih membantu memahami state produk sekarang**. Eksperimen visual lama, rebrand bertahap, palet/font yang sudah superseded, route lab, iterasi floral/Rose, dan log commit harian tidak lagi disalin ke PRD; detail tersebut tetap tersedia melalui Git history.

## 28–30 September 2026 — Canonical Undara state

- Brand customer-facing dikonsolidasikan menjadi **Undara**; nama brand lama tidak boleh kembali ke surface baru.
- Landing diarahkan ke **woodland / forest editorial**: forest silhouette, canopy, branch, leaves, fog/glow, fireflies, dan ornament organik. Floral cluster dan rose-petal ambience global dipensiunkan.
- Shared marketing frame/footer/audio/social atmosphere dipakai lintas halaman publik.
- Event Planner menjadi benchmark art direction marketing; service pages lain mengikuti bahasa editorial yang sama tanpa harus menyalin layout persis.
- Marketing pages mendapat rhythm/asymmetry yang lebih editorial; legal pages ikut shared framed marketing shell.
- Full template catalog mendapat stagger desktop yang halus tanpa mengganggu hover interaction.
- ID/EN diperluas ke marketing/catalog dan invitation publishing flow.
- Studio terus bergerak ke object-based editing untuk Amplop dan section Isi, sementara Save tetap di Studio dan Publish dikendalikan dari Dashboard.
- Sapaan Personal Invitation pada Amplop terhubung ke data tamu dan mendukung ID/EN.
- Theme preference Light/Dark persisten setelah refresh.
- Design workflow menggunakan source canonical PRD/AGENTS/scoped docs lebih dulu, lalu prinsip design-quality eksternal bila tersedia.

## 30 September 2026 — PRD cleanup & woodland direction

**Rationale:** PRD telah menumpuk ribuan baris histori desain yang sudah tidak berlaku dan mengandung beberapa identitas lama, aturan Rose/pink, detail font/palet yang saling supersede, serta eksperimen floral/Pintu. Owner meminta dokumen aktif dibersihkan agar keputusan sekarang lebih mudah diikuti.

- Repository reference dikoreksi menjadi `wanzy0808/Undara`.
- Brand contract dipadatkan: customer-facing hanya Undara; exact legacy identifiers hanya compatibility detail.
- Hex color dan nama font tidak lagi menjadi kontrak PRD. Detail implementasi mengikuti semantic theme tokens dan shared brand components di source.
- Canonical public art direction ditegaskan sebagai **woodland / forest editorial**.
- Bunga besar, floral cluster, dan rose-petal ambience dipensiunkan sebagai bahasa visual global; premium engraved vine/sulur, branch, canopy, leaves, fog, dan subtle glow menjadi motif yang dianjurkan.
- Dark Mode boleh menambahkan lampion-lampion kecil yang tersembunyi di kedalaman woodland dengan glow hangat dan kepadatan rendah; Light Mode tetap tanpa kewajiban lampion.
- Design System §15 ditulis ulang agar durable dan tidak mengunci detail kosmetik yang mudah berubah.
- Appendix lama yang sangat panjang dipadatkan. Git history tetap menjadi sumber histori implementasi rinci.

**Area:** `prd.md`.

**Validation:** documentation/source consistency review; tidak ada perubahan runtime pada langkah ini.
