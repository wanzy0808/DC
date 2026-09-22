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
- payment gate Digital Invitation hanya ditegakkan ketika user menekan **Publish** di Undangan/Studio;
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
- preview;
- save design;
- publish.

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

### 7.2.3b Sepuluh tema berbeda: lima dengan foto, lima tanpa foto (22 September 2026)

Setiap template READY harus punya komposisi nyata yang dapat dibedakan secara visual sebelum dan setelah membuka amplop, bukan hanya pergantian palette, font, stock photo dan border radius pada satu layout. Manifest tunggal `lib/templates/catalog.ts` menyatakan `usesPhotos: boolean`, `photoSlots`, nama dan preset. Target katalog bawaan saat ini **10 template keseluruhan (7 key lama dipertahankan demi kompatibilitas undangan existing + 3 key baru), 5 dengan foto dan 5 tanpa foto**:

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

Untuk setiap theme, amplop digital tetap punya lipatan/flap dan aksi "Buka Undangan" riil; visual envelope, Cover dan section decoration mengikuti identitas theme berbeda. Foto preview berbasis aset `public/` yang sudah ada, tanpa mengambil URL Unsplash. Tanpa-foto bukan sekadar menyembunyikan tag `img`: tutup, Hero, Identity, Gallery/Media dan dekorasi mengutamakan tipografi, ornamen/ilustrasi dan data event, tidak merender media customer walaupun sebelumnya pernah mengupload foto untuk theme lain. Studio tidak memunculkan input slot/upload untuk theme tanpa foto (koleksi event tetap tersimpan dan muncul bila customer beralih kembali ke theme foto). Gallery/media tanpa foto tetap section semantik ke-6 tetapi menjadi surface story/illustration tanpa menciptakan foto/memori personal palsu. Image-preview-only designer submissions tidak otomatis dipaksa masuk hitungan 5/5 dan tidak selectable hingga renderer asli tersedia.

Galeri publik dan pemilih template Studio menampilkan thumbnail scene visual yang benar-benar digunakan renderer, bukan image sama untuk sejumlah theme; identifikasi jelas melalui badge/filter "Dengan foto" dan "Tanpa foto". Tetap gunakan satu katalog untuk Studio, `/template-design`, `/d-invitation`, tanpa menggandakan API RSVP, assets/customer media, format penyimpanan atau bypass akses Studio. Semua theme tetap menjalankan kontrak 13 section/amplop di §7.2.3a dan integrasi Sharp WebP untuk media upload customer.

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

Halaman publik `/template-design` mengambil built-in template dari `lib/templates/catalog.ts`, bukan list contoh/nomor template palsu yang terpisah dari Studio. Kartu desain menampilkan visual dari `InvitationPreview` sungguhan dan lazily mount ketika masuk viewport, sedangkan modal memungkinkan pengunjung melihat isi undangan (termasuk alur amplop pada template yang mendukungnya) serta mencoba toggle section tanpa menulis database. Preview hanya memakai fixture `data/templates/preview-invitation.ts` yang jelas diberi label data contoh dan tidak membaca konten pelanggan. Semua built-in READY kini memakai presentasi publik yang sama dengan Studio dan galeri, melalui renderer Romantic Rose atau Universal renderer. Hanya upload designer tanpa renderer yang tetap berupa pratinjau gambar.

Tombol dari katalog publik menuju Dashboard untuk membuat acara lebih dahulu; pemilihan/simpan template event dilakukan di Invitation Studio setelah `invitationId` valid. Jangan menyebut berkas designer (HTML/ZIP) sebagai template built-in yang sudah dapat dirender tanpa proses integrasi. Permukaan marketing `/d-invitation` dan landing tidak otomatis ikut berubah saat katalog ini diperbaiki.

### 7.2.9b Satu sumber katalog untuk semua halaman (22 September 2026)

`lib/templates/catalog.ts` adalah manifest tunggal untuk template built-in yang **siap dirender**: key, identitas, kategori, thumbnail/preview mode, dan Studio preset milik template didaftarkan sekali. Halaman publik `/template-design`, koleksi `/d-invitation`, dan pilihan template di Invitation Studio wajib membaca API katalog yang sama (`/api/templates` via `lib/templates/use-template-catalog.ts`), tanpa array unggulan/showcase/preset terpisah. Ketika template kode baru terintegrasi dan sekali diregistrasikan ke manifest, tiga permukaan ikut berubah pada deployment/refresh tanpa mengedit tiga halaman.

Designer upload yang telah berstatus `PUBLISHED` di database muncul otomatis lewat API pada galeri publik dan marketing sebagai `previewType: image`, `ready: false`. File HTML/ZIP/JSON yang diunggah belum merupakan komponen React dan **tidak boleh** dapat dipilih sebagai template aktif di Studio/publish sampai developer mengintegrasikan renderer dan mengubah statusnya menjadi ready lewat registrasi master. Jangan menampilkan klaim bahwa foto preview sama dengan output undangan publik apabila belum ada renderer. Studio menampilkan semua entri katalog dengan item `ready:false` nonaktif dan hanya mengizinkan pemilihan `ready:true`. Fallback built-in tetap tersedia ketika query katalog upload tidak berhasil; publik tidak mendapat akses untuk download paket designer secara langsung dari endpoint katalog.

Preview undangan publik dapat dibuka tanpa login, tetapi tombol penggunaan dari `/template-design` atau `/d-invitation` mengarahkan ke `/dashboard` untuk login dan membuat/memilih event terlebih dahulu. `/dashboard/editor` dan semua turunannya harus tetap diproteksi oleh pengecekan sesi server-side dan editor membutuhkan `invitationId` valid; tidak ada akses anonim ke Studio melalui deep link maupun manipulasi URL.

### 7.2.9c Konsistensi visual galeri publik dengan main frame marketing (22 September 2026)

Halaman `/template-design` merupakan marketing page dengan visual baseline landing terverifikasi `/` dan `/d-invitation`, bukan halaman terpisah dengan full-page putih, navbar/footer tambahan atau dekorasi marketing ganda. Gunakan komponen bersama `Navbar embedded`, `PublicMarketingAtmosphere` dan `MarketingFrameFooter`; bingkai utama di desktop berukuran sesuai frame marketing yang disetujui (lebar ±90vw dengan margin luar), radius 18px, border Rose tipis, permukaan transparan, dan konten sekitar 80vw di dalam frame. Hanya main bagian tengah yang scroll; navbar dan footer tetap pada tempatnya. Di mobile frame tetap responsif tanpa menyebabkan scroll horizontal. `PublicAtmosphere`, `PublicContent`, Navbar/Footer global dan `MarketingFloatingControls` harus memperlakukan rute ini sebagai framed marketing page supaya tidak menduplikasi bunga/rose-petal animation, pemutar musik, Instagram, navbar atau footer. Musik tetap satu player dari marketing provider dan mengikuti pilihan mute/reduced motion. Jangan mengubah landing/Pintu atau desain `/d-invitation` ketika menyamakan shell galeri.

Area isi berbahasa Indonesia default dan responsif terhadap ID/EN navbar; memakai Cinzel untuk heading, Fauna One untuk isi/UI dan DM Mono untuk metadata. Copy ringkas dan tidak mengulang brand/undangan/galeri secara berlebihan. Gunakan palet Rose dan border/transparansi ringan yang sesuai marketing baseline. Kartu katalog harus tetap bersumber dari API/manifest tunggal dan thumbnail real yang lazy-load; filter/pencarian/sort serta preview modal tetap berfungsi tanpa login. Modal preview yang memanjang dibuka di atas bingkai, dapat scroll sendiri, dan tidak terpotong oleh overflow main frame. Tombol pemakaian template membawa pengguna ke Dashboard untuk login/buat event dahulu, tidak membuka Studio anonim. Mode terang/gelap, aksesibilitas keyboard dan interaksi mobile tetap berlaku.

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

Mandatory footer: **DC Organizer**.

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

- Hero halaman marketing `/d-invitation` menyeimbangkan dua kolom: teks mengambil bagian lebih lebar daripada mockup perangkat pada desktop, sementara mockup menggunakan rasio smartphone ramping/tinggi (sekitar 9:19.5), bukan menyerupai tablet. Judul dan deskripsi boleh melebar mengikuti kolom teks. **Keduanya dikelompokkan di tengah main frame** (max-width hero sekitar 1200px di desktop, gap kolom sedang), bukan menempel di sisi luar frame. Responsif mobile tetap aman; isi dan animasi undangan, frame halaman, transisi Pintu, dan visual landing tidak diubah oleh penyesuaian proporsi ini.
- Semua halaman **marketing publik** memakai komponen dekorasi bersama: bunga `flower.png` pada kiri/kanan dan Rose glow dari `LandingFloralGlow`, serta animasi petal interaktif dari `WindRosePetals`. Landing `/` dan `/pagecontoh` serta frame `/d-invitation` merender layer di dalam scene masing-masing; halaman marketing lain merender melalui `PublicAtmosphere` agar tidak ada layer ganda. Reuse asset dan gerakan yang sudah disetujui, hormati reduced-motion. Dekorasi marketing ini tidak otomatis dipasang di Dashboard/Admin/Studio/checkout atau undangan publik milik pelanggan.
- Musik latar marketing adalah **satu audio player persisten** di root layout: track dan volume/mute tidak restart setiap navigasi antarhalaman marketing; autoplay hanya jika browser mengizinkan, user bisa mute/play dan atur volume secara manual. Kontrol berada di kiri bawah serta tautan Instagram resmi DC Organizer di kanan bawah pada setiap halaman marketing. Untuk main frame, kedua kontrol tertanam pada bar footer; halaman marketing tanpa frame memakai floating control di tepi bawah. Jangan menduplikasi player, petals, atau tombol Instagram dalam satu halaman.
- Halaman marketing `/d-invitation` memakai **main frame yang sama secara ukuran/proporsi visual dengan landing yang disetujui**: rounded Rose-border frame setinggi viewport dengan Navbar dan compact Footer di dalam frame, sedangkan semua section marketing berada dalam satu panel tengah yang scrollable mandiri (desktop dan mobile). Scroll halaman luar bukan penggerak utama konten; desain/copy, link, bahasa, tema, dan bagian yang sudah ada tetap dipertahankan. Section yang memasuki viewport panel scroll muncul lembut (opacity/translate, sekali per section); reduced-motion menampilkan konten tanpa gerakan. Perubahan ini khusus halaman `/d-invitation`, bukan perubahan landing `/` atau koreografi transisi Pintu yang sedang ditunda.
- Main panel radius sekitar 12px.
- Nested utility surface sekitar 8–10px.
- Input target minimum sekitar 44px.
- Grouping menggunakan spacing + subtle surface + border, bukan divider horizontal panjang berlebihan.
- Primary public desktop header/content/footer menggunakan **80vw**; jangan mengembalikan fixed `1400px` / `92vw` page wrapper sebagai standard utama. Compact inner content boleh memiliki max-width khusus bila readability membutuhkannya.
- Landing root header dan compact footer harus memakai canvas/background yang sama dengan body landing agar tidak terbaca sebagai kotak surface terpisah. Pada Landing Dark Mode, locale ID/EN yang aktif memakai Rose opaque dengan near-black copy, dan theme toggle memakai Rose opaque dengan near-black icon/text. Requirement ini landing-specific dan tidak boleh mengubah Dashboard/shared control behavior di luar landing.
- Dashboard workspace mengikuti full-width application shell pada Section 6.2; jangan mengembalikan centered public-content cap ke workspace utama.
- **Beranda adalah reference visual language untuk seluruh customer Dashboard.** Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gate, empty/loading/error states, dan reusable dashboard components wajib memakai hierarchy surface/card/table/icon yang konsisten: canvas netral putih/near-black, border/shadow halus, Rose sebagai accent, bukan page-specific theme.
- Dashboard memiliki ruang desktop yang besar, sehingga typography operasional **tidak boleh dibuat terlalu kecil**. Body/form/table copy ditargetkan sekitar 14–16px; metadata/mono kecil tetap readable sekitar 11–12px; section heading sekitar 20–24px; metric value sekitar 24px. Hindari 8–10px untuk copy yang perlu dibaca rutin.
- Sidebar customer Dashboard mengikuti **canvas/background Dashboard**, bukan full Rose rail. Light Mode memakai sidebar putih dengan default teks/icon near-black. Dark Mode memakai background near-black yang sama dengan body Dashboard dengan default teks/icon putih. Pada kedua theme, navigation button tetap netral/transparan saat idle lalu memakai Rose dengan teks/icon putih saat hover/active; Deep Rose dapat dipakai untuk active state.
- Ukuran copy sidebar utama sekitar 15–16px agar nyaman dipindai; nested item tetap sedikit lebih kecil tetapi tidak terasa mikro.
- Header control Dashboard — burger, theme toggle, ID/EN, dan account trigger — wajib mengikuti **visual language navbar landing yang sudah established**, bukan memiliki Dashboard-only control system. ThemeToggle dan LanguageToggle memakai shared component/style yang sama seperti landing. Burger Dashboard meniru treatment burger landing (transparent surface, restrained Rose border/foreground, subtle Rose hover), sedangkan account trigger mengikuti treatment navbar yang sama. Jangan menambahkan CSS override khusus Dashboard yang mengubah shared navbar controls menjadi visual system berbeda.
- Shared dashboard primitives berada di `components/Dashboard/DashboardPrimitives.tsx` dan harus di-extend untuk surface/metric/notice baru agar workspace tidak kembali belang antar-tab.
- Dashboard boleh memakai table/graph ketika datanya berasal dari database/API atau derived metric yang dapat dijelaskan; jangan membuat angka/mock chart untuk dekorasi.
- Pintu tetap core public navigation surface.
- Ornamen/bunga dekoratif di bagian atas setiap Pintu merupakan bagian dari closed-door surface: saat Pintu aktif/terbuka ornamen harus ikut fade/keluar, lalu kembali saat Pintu tertutup. Behavior mengikuti state Pintu yang sama dan tetap menghormati reduced motion.
- Landing 80vw harus memperlakukan copy + Pintu sebagai satu komposisi: orbit dapat melebar dan carousel dapat masuk ke arah copy selama responsive clipping tetap aman.
- Copy kiri landing boleh diperlebar dan sedikit dibesarkan secara vertikal agar mengisi 80vw secara proporsional tanpa mengalahkan Pintu.
- Area quote/proof ditempatkan setelah CTA dan sebelum separator tipis; capability checklist berada di bawah separator dengan jarak yang cukup agar hierarchy terasa ringan.
- Quote pelanggan hanya boleh ditampilkan sebagai testimonial bila sumber/ucapan pelanggan benar-benar tersedia dan dapat dipertanggungjawabkan. Jangan mengarang nama, kutipan, rating, atau klaim pelanggan. Jika belum ada testimonial terverifikasi, gunakan brand/service statement tanpa customer attribution sampai data nyata tersedia.
- Public burger menu tidak menampilkan `Beranda`; home tetap dapat dicapai melalui brand/logo. Untuk locale Indonesia, submenu layanan memakai label `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`. `Layanan` tetap menjadi parent dengan submenu tersebut, `Masuk` dan `Daftar` wajib tersedia, dan icon `Layanan` harus berbeda dari icon `Paket`; decorative numbering tidak digunakan.
- Burger navigation dan authentication surfaces (`Daftar` dialog serta `/login`) memakai treatment netral **background putih + teks hitam + border tipis** sebagai exception eksplisit dari canonical Rose application button. Rose tetap dipakai untuk accent/focus/link, bukan fill utama pada surface ini.
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
