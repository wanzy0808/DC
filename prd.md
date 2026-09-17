# DC Organizer — Master Product Requirements Document

**Document Status:** Single Source of Truth  
**Brand:** DC Organizer  
**Repository:** `wanzy0808/DC`  
**Last Consolidated:** 17 September 2026  
**Implementation Changelog:** `prd1.md`

> Dokumen ini adalah requirement produk aktif dan menggantikan seluruh keputusan yang sebelumnya tersebar di `PRD-TAMBAHAN.md`, `PRD1.md`, `PRD2.md`, `PRD3.md`, `PRD4.md`, dan `PRD5.md`. Jika histori lama bertentangan dengan dokumen ini, **dokumen ini yang berlaku**. Histori implementasi baru tidak ditambahkan ke master PRD kecuali requirement produk berubah; catat perubahan implementasi di `prd1.md`.

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
- optional wedding identity `groomFatherName` / `groomMotherName` / `brideFatherName` / `brideMotherName`;
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
- format canonical ketika kedua orang tua tersedia: **`Anak dari Bapak <nama bapak> & Ibu <nama ibu>`**;
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
- untuk WEDDING: nama bapak/ibu masing-masing pengantin;
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
- mempertahankan value `HH:mm` saat dibaca ulang dari database/API.

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

## 6. Dashboard Information Architecture

Sidebar user:
- **Beranda**
- **Acara**
  - Rangkaian Acara
  - Undangan
  - Personal Invitation
- **WA Blast Add-on**
- **RSVP**
- **Manajemen Tamu**
- **Usher App**

WA Blast adalah add-on, bukan submenu inti Digital Invitation.

Workspace yang menggunakan data event harus menyediakan explicit event scope. Tidak boleh diam-diam memilih event pertama jika user memiliki lebih dari satu event.

### 6.1 Desktop dashboard shell

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

- Main panel radius sekitar 12px.
- Nested utility surface sekitar 8–10px.
- Input target minimum sekitar 44px.
- Grouping menggunakan spacing + subtle surface + border, bukan divider horizontal panjang berlebihan.
- Primary public desktop header/content/footer menggunakan **80vw**; jangan mengembalikan fixed `1400px` / `92vw` page wrapper sebagai standard utama. Compact inner content boleh memiliki max-width khusus bila readability membutuhkannya.
- Dashboard workspace mengikuti full-width application shell pada Section 6.1; jangan mengembalikan centered public-content cap ke workspace utama.
- **Beranda adalah reference visual language untuk seluruh customer Dashboard.** Rangkaian Acara, Undangan, Personal Invitation, WA Blast, RSVP, Manajemen Tamu/Seating, Usher, feature gate, empty/loading/error states, dan reusable dashboard components wajib memakai hierarchy surface/card/table/icon yang konsisten: canvas netral putih/near-black, border/shadow halus, Rose sebagai accent, bukan page-specific theme.
- Shared dashboard primitives berada di `components/Dashboard/DashboardPrimitives.tsx` dan harus di-extend untuk surface/metric/notice baru agar workspace tidak kembali belang antar-tab.
- Dashboard boleh memakai table/graph ketika datanya berasal dari database/API atau derived metric yang dapat dijelaskan; jangan membuat angka/mock chart untuk dekorasi.
- Pintu tetap core public navigation surface.
- Landing 80vw harus memperlakukan copy + Pintu sebagai satu komposisi: orbit dapat melebar dan carousel dapat masuk ke arah copy selama responsive clipping tetap aman.
- Copy kiri landing boleh diperlebar dan sedikit dibesarkan secara vertikal agar mengisi 80vw secara proporsional tanpa mengalahkan Pintu.
- Area quote/proof ditempatkan setelah CTA dan sebelum separator tipis; capability checklist berada di bawah separator dengan jarak yang cukup agar hierarchy terasa ringan.
- Quote pelanggan hanya boleh ditampilkan sebagai testimonial bila sumber/ucapan pelanggan benar-benar tersedia dan dapat dipertanggungjawabkan. Jangan mengarang nama, kutipan, rating, atau klaim pelanggan. Jika belum ada testimonial terverifikasi, gunakan brand/service statement tanpa customer attribution sampai data nyata tersedia.
- Public burger menu tidak menampilkan `Beranda`; home tetap dapat dicapai melalui brand/logo. Untuk locale Indonesia, submenu layanan memakai label `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`. `Layanan` tetap menjadi parent dengan submenu tersebut, `Masuk` dan `Daftar` wajib tersedia, dan icon `Layanan` harus berbeda dari icon `Paket`; decorative numbering tidak digunakan.
- Burger navigation dan authentication surfaces (`Daftar` dialog serta `/login`) memakai treatment netral **background putih + teks hitam + border tipis** sebagai exception eksplisit dari canonical Rose application button. Rose tetap dipakai untuk accent/focus/link, bukan fill utama pada surface ini.
- Registration dialog tidak boleh menempatkan action `Masuk` di header kanan bila bertabrakan dengan tombol close `X`; switch ke `Masuk` ditempatkan di bawah form. Login/register copy harus general-event oriented, bukan wedding-only.
- Rose petals di `components/Layout/background.tsx` adalah protected visual element.

### 15.5 User-facing copy

Dashboard harus menjelaskan:
- current state;
- next action;
- event context.

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
- production migration execution harus diverifikasi per deployment; source migration file dan successful `pnpm build` saja tidak membuktikan DB production sudah migrated.

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

`Tambah acara → input acara (WEDDING dapat mengisi parent identity opsional) → dd/mm/yyyy date dengan calendar picker + waktu 24 jam HH:mm → Simpan acara → database event configured → Buat undangan → parent line otomatis tersedia di preview/template jika diisi → pilih template → edit → Simpan desain → Publish → unpaid diarahkan ke paket event → payment aktif → Publish sukses → public invitation dapat dibuka.`

Public route harus tetap menolak event yang belum configured, belum menyimpan template, belum published, atau belum memiliki valid event-scoped entitlement.

Untuk deployment yang membawa migration baru, end-to-end persistence baru dianggap siap di environment target setelah `prisma migrate deploy` / `pnpm db:deploy` berhasil diterapkan pada database target. Build CI tidak menggantikan langkah ini.

---

## 21. Documentation Governance

Hanya dua dokumen PRD aktif yang digunakan:

- **`prd.md`** — current product requirements / single source of truth.
- **`prd1.md`** — chronological implementation changelog dan keputusan perubahan setelah master consolidation.

Aturan:
- jangan membuat `PRD-TAMBAHAN.md`, `PRD2.md`, `PRD3.md`, dst. selama `prd1.md` masih dapat digunakan;
- changelog tidak boleh menjadi requirement paralel;
- jika requirement berubah, update `prd.md` terlebih dahulu lalu catat perubahan/rationale di `prd1.md`;
- requirement superseded dihapus/diganti di `prd.md`, sedangkan histori perubahan tetap dicatat ringkas di `prd1.md`;
- jangan mengklaim build, lint, CI, migration, atau deployment PASS tanpa hasil aktual yang diamati.
