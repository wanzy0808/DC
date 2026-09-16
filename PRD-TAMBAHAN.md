# PRD Tambahan — Current Implementation Snapshot

**Project:** DC Organizer  
**Repository:** `wanzy0808/DC`  
**Snapshot date:** 2026-09-16  
**Purpose:** Catatan implementasi aktual sebelum penyusunan PRD produk baru.

> Dokumen ini adalah **implementation changelog / current-state snapshot**, bukan pengganti PRD baru yang akan disusun setelah ini. Histori detail sebelumnya tetap berada di `PRD-3.md`, `PRD-4.md`, dan `PRD-5.md`. Bila ada konflik antara keputusan historis di file tersebut dan bagian **Current Product Direction** di dokumen ini, keputusan terbaru di dokumen ini yang mencerminkan implementasi terkini.

---

## 1. Referensi Histori yang Sudah Ada

### `PRD-3.md` — Dashboard Surface Refinement
Mencatat perubahan visual dashboard, antara lain:
- neutral functional surfaces;
- pengurangan divider horizontal;
- form readability;
- rounded table/roster rows;
- SeatingChart surface pass;
- Beranda/Usher surface pass;
- semantic button hierarchy;
- single active event editor pada fase desain sebelumnya.

### `PRD-4.md` — Undangan Hub & Distribution Workspace
Mencatat fase ketika dashboard memiliki parent `Undangan`, lalu diubah menjadi `Acara`, termasuk:
- Rangkaian Acara;
- Undangan;
- WA Blast;
- Personal Invitation;
- public view counter;
- Personal Invitation token/password/view counter;
- database-backed WA Blast queue;
- schema/migration distribution fields.

Sebagian requirement di file ini **sudah superseded**, terutama limit maksimum 3 undangan dan free WA quota 100.

### `PRD-5.md` — Event-Scoped Dashboard Operations
Mencatat event-scoping untuk:
- RSVP;
- guest management;
- seating;
- QR/check-in;
- dropdown pemilihan acara;
- `Invitation.eventConfigured`;
- public RSVP menulis ke event yang tepat.

Konsep event-scoped tetap berlaku dan menjadi dasar arsitektur terbaru.

---

# 2. Current Product Direction — Latest Implemented Direction

## 2.1 DC Organizer bukan SaaS wedding-only
Arah produk terbaru adalah **general event digital invitation SaaS**.

Platform ditujukan untuk berbagai jenis acara yang membutuhkan undangan digital, RSVP, dan manajemen tamu, termasuk tetapi tidak terbatas pada:
- wedding;
- birthday;
- engagement;
- baby shower;
- corporate/private event;
- anniversary;
- gathering/event lainnya.

Customer-facing brand tetap **DC Organizer**.

### Superseded
Requirement lama berikut tidak lagi menjadi target produk terbaru:
- “platform SaaS pernikahan saja”;
- onboarding wajib nama pasangan;
- semua event mengikuti satu identitas wedding/couple;
- undangan hanya untuk Wedding / Akad & Sangjit.

---

# 3. Monetization & Entitlement Terbaru

## 3.1 Digital Invitation — Rp150.000 per event
Model terbaru:

**1 pembelian = 1 event + 1 digital invitation + 1 template**.

Harga dasar:
- `INVITATION_BASIC` = **Rp150.000 per event**.

Digital Invitation event mencakup:
- 1 event;
- 1 invitation digital;
- 1 template invitation;
- publish invitation;
- RSVP;
- guest management;
- table/seating management;
- gallery/media/detail event sesuai fitur Studio yang tersedia.

## 3.2 Jumlah event / invitation tidak dibatasi 3
User dapat membuat event/undangan sesuai kebutuhan.

`POST /api/invitations` tidak lagi menerapkan limit maksimum 3 event.

Dashboard overview dan Invitation workspace juga tidak lagi memakai `x / 3` sebagai aturan bisnis aktif.

## 3.3 Entitlement Digital Invitation bersifat per-event
Pembelian satu Digital Invitation **tidak membuka event lain**.

Payment/entitlement harus menempel pada `Invitation` event terkait.

Helper compatibility `hasAccountDigitalInvitation(...)` sekarang tetap mempertahankan nama lama untuk caller existing, tetapi Digital Invitation access membaca direct payment event yang sedang diproses.

## 3.4 Checkout event-aware
`/packages` dan `POST /api/orders` menerima `invitationId`.

Order Digital Invitation dibuat untuk event tertentu sehingga satu pembayaran tidak mengaktifkan invitation lain.

Jika user masuk ke purchase flow tanpa event existing, backend dapat membuat draft event untuk ditautkan ke order tersebut.

---

# 4. WA Blast sebagai Add-on

WA Blast **bukan bagian dari harga Rp150.000 Digital Invitation**.

## 4.1 Harga dan quota
- Paket add-on: `WA_BLAST_50`;
- Harga: **Rp75.000**;
- Penambahan: **50 quota per pembelian**;
- dapat dibeli ulang sesuai kebutuhan.

## 4.2 Quota awal
`Invitation.waBlastQuota` terbaru menggunakan default **0** untuk event baru.

### Superseded
Keputusan historis `WA Blast quota default 100` dari PRD-4 tidak lagi berlaku sebagai model produk terbaru.

## 4.3 WA Blast event-scoped
Workspace WA Blast meminta user memilih event aktif.

Add-on hanya dapat dibeli untuk event yang sudah memiliki Digital Invitation aktif.

Queue menggunakan database tamu event tersebut dan mendukung:
- memilih guest existing;
- memasukkan guest baru + nomor WhatsApp;
- menyimpan selected recipients;
- menghapus recipient dari queue;
- melihat quota / selected / remaining.

## 4.4 Delivery provider belum diintegrasikan
Saat snapshot ini dibuat, workflow queue/quota/order sudah database-backed, tetapi **provider/API pengiriman WhatsApp nyata belum ditetapkan/diintegrasikan**.

Jangan mengklaim WA message delivery sudah aktif sebelum provider benar-benar terpasang dan tervalidasi.

---

# 5. Dashboard Information Architecture Terbaru

Parent menu utama tetap bernama **Acara**.

Struktur terkini:
- Beranda
- Acara
  - Rangkaian Acara
  - Undangan
  - Personal Invitation
- WA Blast Add-on
- RSVP
- Manajemen Tamu
- Usher App

WA Blast telah dikeluarkan dari submenu inti Acara dan diposisikan sebagai add-on.

## 5.1 Dashboard visual system
Dashboard sudah melalui beberapa consistency pass:
- neutral-first surface;
- Rose hanya accent/interaksi;
- field form memiliki neutral background tipis;
- min input height sekitar 44px;
- radius form sekitar 10px;
- card/panel sekitar 12px;
- table/roster menggunakan rounded rows;
- divider atas/bawah panjang dikurangi;
- typography tetap Cinzel / Fauna One / DM Mono;
- canonical app button tetap `components/ui/button.tsx`;
- button semantics menggunakan verb + icon + size + placement, bukan banyak warna variant.

---

# 6. Rangkaian Acara / Event Editor

## 6.1 Unlimited event creation
User dapat membuat rangkaian/event baru tanpa business limit 3.

Editor menampilkan satu event aktif pada satu waktu untuk menjaga density dashboard.

## 6.2 General event fields
Editor terbaru tidak bergantung pada nama pasangan.

Data utama event yang sekarang menjadi fokus:
- Nama Acara;
- Tanggal;
- Waktu Mulai;
- Waktu Selesai;
- Venue;
- Alamat;
- Maps URL;
- Deskripsi;
- Catatan;
- timezone.

`eventConfigured` tetap digunakan untuk membedakan record draft/internal dari event yang benar-benar telah disimpan user sebagai acara.

---

# 7. Undangan Workspace

Invitation workspace membaca semua invitation/event milik user dan menampilkan status per event.

Status utama:
- Belum aktif;
- Aktif;
- Terbit.

Per event tersedia flow:
- buka Studio;
- aktivasi Digital Invitation Rp150.000 jika belum dibayar;
- publish / tarik dari publik;
- buka public invitation;
- jumlah view/open;
- venue/detail ringkas.

Summary workspace mencakup:
- jumlah undangan;
- jumlah aktif;
- jumlah published;
- total opened/page views.

Responder RSVP juga tetap ditampilkan dari guest data nyata.

Tidak ada mock invitation/guest data.

---

# 8. RSVP per Event

RSVP tetap **event-scoped**.

Dashboard RSVP memiliki dropdown `Acara aktif` berdasarkan event yang telah dibuat.

Jika belum ada event configured, workspace menampilkan pesan:

**“Silakan buat rangkaian acara dulu.”**

Setiap event memiliki dataset RSVP sendiri:
- RSVP status;
- attending;
- pax;
- check-in;
- QR;
- table;
- CSV export.

Public RSVP menulis Guest ke `Invitation.id` dari event/undangan yang dibuka, bukan ke event global/default.

---

# 9. Manajemen Tamu & Seating per Event

Manajemen Tamu juga event-scoped menggunakan dropdown event sendiri.

Per event memiliki:
- guest roster;
- manual guest;
- table;
- seating chart;
- seat assignment;
- swap kursi;
- check-in-related guest state.

Seating mutation tetap server-authoritative.

Atomic seat swap existing dipertahankan.

Saat user pindah event, SeatingChart di-reset menggunakan `key={invitationId}` agar state lokal event sebelumnya tidak bercampur.

---

# 10. Personal Invitation

Personal Invitation tetap menggunakan `Guest` sebagai source of truth identitas penerima.

Field database yang telah ditambahkan meliputi:
- `personalToken`;
- `personalPublished`;
- `personalPasswordProtected`;
- `personalPasswordHash`;
- `personalViewCount`.

Dashboard mendukung:
- pilih guest existing;
- buat guest baru;
- preview;
- edit nama/nomor;
- publish/tarik publik;
- aktifkan password;
- ganti password;
- matikan password.

Password disimpan dengan bcrypt hash dan hash tidak dikirim ke client melalui guest API.

Public personal invitation memiliki URL token per tamu dan view count sendiri.

---

# 11. Public Event Planner

## 11.1 Canonical page
Public planner sekarang diarahkan ke **Event Planner**.

Canonical route:
- `/event-planner`

Legacy compatibility:
- `/wedding-planner` dipertahankan sebagai redirect agar link lama tidak langsung rusak.

## 11.2 Paket konsultasi tanpa harga
Event Planner menampilkan empat tipe layanan konsultasi:
1. Wedding Organizer
2. Wedding Planner
3. Silver / Golden Wedding
4. Baby Shower

Harga tidak ditampilkan pada card package.

CTA paket menggunakan label **Konsultasi**.

Nomor konsultasi:
- **+62 821-2478-6516**

Format WhatsApp message per paket:
- `Halo, aku ingin tanya2 mengenai paket Wedding Organizer.`
- `Halo, aku ingin tanya2 mengenai paket Wedding Planner.`
- `Halo, aku ingin tanya2 mengenai paket Silver / Golden Wedding.`
- `Halo, aku ingin tanya2 mengenai paket Baby Shower.`

Pintu/navigation/footer sudah mulai diarahkan ke terminology Event Planner.

---

# 12. Digital Invitation Public Marketing

Public Digital Invitation page sudah mulai digeneralisasi dari wedding-only menjadi event invitation.

Copy yang diubah mencakup:
- hero;
- feature section;
- template collection;
- Studio CTA;
- review;
- FAQ;
- package description.

Public marketing sekarang menjelaskan model:
- Rp150.000 per event;
- 1 event = 1 invitation = 1 template;
- RSVP + guest management termasuk dalam Digital Invitation event;
- user dapat menambah event lagi sesuai kebutuhan;
- WA Blast adalah add-on terpisah.

---

# 13. Public Invitation Renderer

Default public invitation renderer sudah digeneralisasi agar event title dapat menjadi identitas utama.

Renderer tidak lagi harus menampilkan pasangan sebagai heading utama pada setiap event.

Nama pasangan tetap dapat digunakan jika memang tersedia/relevan, tetapi bukan requirement universal untuk event SaaS.

Footer/default copy mulai diubah dari `Digital Wedding Platform` ke event-oriented wording.

Public renderer masih menggunakan beberapa legacy data fields/enum seperti `WEDDING`, `ADAT_AKAD`, `groomName`, `brideName`, dan `weddingHashtag` untuk backward compatibility; pembersihan schema tersebut belum dilakukan.

---

# 14. Onboarding Terbaru

Dashboard onboarding tidak lagi mewajibkan data pasangan untuk user umum.

Flow terbaru hanya membutuhkan data profil workspace seperti `firstName` / nama panggilan sebelum user masuk ke workspace utama.

Data event diisi ketika user membuat Rangkaian Acara.

---

# 15. README & Public Terminology

`README.md` sudah mulai diselaraskan dengan product direction general event invitation SaaS.

Brand customer-facing tetap **DC Organizer**.

Beberapa legacy wedding terminology masih ada di source code / master `prd.md`; bagian tersebut belum seluruhnya dibersihkan dan harus diputuskan pada PRD baru.

---

# 16. Prisma / Data Model Changes yang Sudah Dibuat

Perubahan terkait invitation distribution/event operations mencakup antara lain:
- `Invitation.eventConfigured`;
- `Invitation.viewCount`;
- `Invitation.waBlastQuota`;
- Guest WA Blast state;
- Guest Personal Invitation state/token/password/view count;
- relation/order event-aware;
- payment order memiliki event/invitation context untuk purchase flow terbaru.

Migration terkait distribution fields berada di area:
- `prisma/migrations/20260916173000_add_invitation_distribution_fields/migration.sql`

Terdapat juga perubahan lanjutan untuk mengubah model WA Blast quota awal menjadi 0 pada event baru.

**Migration execution dan Prisma Client regeneration belum diverifikasi pada deployment dari sesi coding ini.**

---

# 17. Important Superseded Decisions

Bagian ini penting untuk penyusunan PRD baru agar requirement historis tidak dianggap masih berlaku.

| Requirement historis | Status terbaru |
| --- | --- |
| Maksimal 3 rangkaian/undangan | **Superseded** — event/invitation sekarang unlimited |
| `x / 3` sebagai limit bisnis | **Superseded** |
| Free WA Blast quota 100 | **Superseded** — default 0 |
| WA Blast bagian default Digital Invitation | **Superseded** — add-on 50 quota = Rp75.000 |
| Digital Invitation Rp300.000 | **Superseded** — Rp150.000 per event |
| Satu payment membuka additional event | **Superseded** — entitlement invitation per-event |
| Produk hanya untuk wedding | **Superseded** — general event invitation SaaS |
| Dashboard onboarding wajib groom/bride | **Superseded** |
| Canonical Wedding Planner public page | **Superseded** — canonical Event Planner, legacy URL redirect |
| Parent sidebar bernama Undangan | **Superseded** — parent saat ini `Acara` |

---

# 18. Known Remaining Work / Technical Debt Sebelum PRD Baru Dieksekusi

## 18.1 Invitation Studio masih wedding-centric
Audit terakhir menemukan Studio masih memiliki beberapa assumption lama:
- tab `Undangan Pernikahan` / `Akad & Sangjit`;
- preview couple `groomName & brideName`;
- placeholder `Nama Pria` / `Nama Wanita`;
- `weddingHashtag`;
- preview label `The Wedding`;
- beberapa direct `<button>` masih belum menggunakan canonical `Button`;
- beberapa warna legacy hardcoded seperti `#7A1C25` masih ada di Studio preview/editor shell.

Studio perlu dirancang ulang menjadi event-centric setelah requirement PRD baru ditetapkan.

## 18.2 Guestbook public page masih mengandung model/copy lama
Audit terakhir menemukan:
- copy `DC Wedding` masih ada;
- wording bundle lama `INVITATION_GUESTBOOK` masih muncul;
- page masih mengasumsikan wedding/day-H dalam beberapa section;
- pricing/package strategy Guestbook perlu disinkronkan kembali dengan PRD baru.

## 18.3 Master `prd.md` masih mengandung requirement lama
Master PRD saat ini masih menyebut antara lain:
- wedding-only vision;
- Digital Invitation Rp300.000;
- Wedding Planner;
- wedding onboarding/couple canonical data;
- max/old package assumptions.

Jangan menganggap bagian-bagian tersebut sebagai requirement terbaru setelah user menyusun PRD baru.

## 18.4 Legacy schema terminology
Enum/field seperti:
- `WEDDING`;
- `ADAT_AKAD`;
- `groomName`;
- `brideName`;
- `weddingHashtag`;

masih dipertahankan sementara demi backward compatibility.

PRD baru perlu menentukan apakah:
- schema akan digeneralisasi penuh;
- atau legacy fields dipertahankan sebagai optional compatibility fields.

## 18.5 Invitation root domain masih legacy
Sebagian UI/config masih menggunakan default `dcwedding.com` melalui `NEXT_PUBLIC_INVITATION_ROOT_DOMAIN` fallback.

Domain final untuk general-event invitation belum diputuskan pada requirement terbaru.

## 18.6 WA Blast provider
Quota/order management tersedia, tetapi delivery provider belum dipilih.

PRD baru sebaiknya menentukan:
- provider/API;
- template/message policy;
- delivery status;
- retry/failure handling;
- billing usage rule;
- apakah quota terpotong saat enqueue, accepted, atau delivered.

---

# 19. Main Affected Areas / Files

Area implementasi terbaru mencakup:
- `app/[dashboard]/page.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `app/api/invitations/route.ts`
- `app/api/orders/route.ts`
- `app/api/dashboard/context/route.ts`
- `app/api/guests/route.ts`
- guest seating/swap/check-in APIs
- `app/api/wa-blast/route.ts`
- Personal Invitation APIs/routes
- public invitation routes/renderers
- `lib/packages/catalog.ts`
- `lib/packages/access.ts`
- `lib/packages/server-access.ts`
- `components/Layout/PackageSelector.tsx`
- `app/packages/page.tsx`
- `app/event-planner/page.tsx`
- legacy `app/wedding-planner/page.tsx`
- `components/Pintu/PintuSection.tsx`
- navbar/footer/i18n public navigation
- Digital Invitation marketing components/data
- `README.md`
- `prisma/schema.prisma`
- related Prisma migrations.

---

# 20. Recent Commit Trail — Event SaaS Realignment

Recent implementation commits include the following known commits from the current refactor sequence:

- `4e9e0adecfc61b3bf515cd9f899f44a04e75e8f4`
- `85efceedf5410d8e6f4170e77075fa3bc76d355d`
- `ab9f62f793e6c4f11b0e24cdee24d7cd1aa823e3`
- `ff2a5e22cc583c1448bedf3841bd1ed0fcd8fd93`
- `dd3653d261479d21fcd15a8439e2538dc19b6b0c`
- `ce9efabf9f94b90a6da9768c7b2d95dc66cd1fe6`
- `28724b8adad5c40543559b1e3726d5af0dd1dbda`
- `ce43c751e096bb317ac13796d0c226841e0ba703`
- `095c787a898cd55d2a629c5c176e2e200bdba894`
- `89acebc6bda698071fb256126e5495b36795c7ec`
- `21b399fa2ef4a0356c0e4ce3b7d5e34bcc2d79c7`
- `e8b57b6588bf89c1f278f3bd2441e53a4fddf9ef`
- `2b8f08acc9d668af3fef89cd073e8342e1e5a40a`
- `8d67affb2706e277424a9ae860e646246a0c48a1`
- `1e02311562bd8382eac06b5b08ff90430fe321fa`
- `573199939b3393bdabd5dd89e200ce176f21fe9b`
- `1358b072cd373ad0504af30624a78be87899255d`
- `9ca2c6938fca92bb14fbaa05d29883504db5ba60`
- `9e7f11a4ce6659a15d5120e97082726d71c2ca81`
- `6160d514a41cdd716d7e458ea69b7cb616ae775e`
- `8414ed741d1bbf035ed8405d043c70d49d43b2e2`
- `90af9d5938670b334342c5d0414b8753695fb4e6`
- `ec1f63cc85f98ee6cd3f4106edadcddf188d166d`
- `2d65ed98129a1588bfd792f0f43663187a1625c8`
- `fc7808b9bde76d232472051200ea6cf9c607bce8`
- `d8a2929f26f0f52d1bf4a7a9c842803e8dcebfeb`
- `1094b42b8232df1c88fa6cc0157ec7d1a5ff3426`
- `1917441e383815d3e00b4492f045a93252709149`
- `d7658eecf780fe5dbc51c7706cf000ffc825aa34`
- `4ebab9e92ccad08e7b0118b60d211371521b15a5`
- `de36b9c051e4e627b1fd3e1cc0e1d101b3d8bd8f`
- `8a9539a95f59cf0423f9c3fc99dfcbce83a21c11`

Histori dashboard sebelum Event SaaS realignment tetap tercatat lebih detail di `PRD-3.md`, `PRD-4.md`, dan `PRD-5.md`.

---

# 21. Validation Status

Pada snapshot ini:
- build belum diklaim PASS;
- lint belum diklaim PASS;
- CI belum diklaim PASS;
- Prisma generate belum diklaim PASS;
- migration execution di environment deployment belum diklaim selesai;
- WA Blast provider delivery belum tersedia.

Perubahan harus dianggap **implemented in source but pending full validation** sampai build/CI/migration aktual berhasil diamati.

---

# 22. Handoff untuk PRD Baru

Saat PRD baru dibuat, gunakan dokumen ini sebagai baseline fakta implementasi terbaru, lalu jadikan keputusan PRD baru sebagai target source-of-truth berikutnya.

Hal yang paling penting untuk diputuskan pada PRD baru:
1. final general-event data model dan taxonomy event;
2. final package/entitlement matrix;
3. apakah Guestbook tetap produk terpisah atau event add-on;
4. final behavior Personal Invitation;
5. final WA Blast provider dan billing semantics;
6. final invitation domain/URL model;
7. generalisasi Invitation Studio;
8. generalisasi public templates tanpa couple dependency;
9. migration strategy dari legacy wedding fields;
10. terminology/routing yang harus dipertahankan untuk backward compatibility.
