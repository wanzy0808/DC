# PRD Tambahan — Event-Scoped Dashboard Operations

## 2026-09-16 — Beranda, RSVP & Manajemen Tamu per Acara

### Tujuan
Menyesuaikan dashboard DC Organizer dengan arsitektur `Acara` yang dapat memiliki maksimal tiga rangkaian. RSVP dan Manajemen Tamu tidak lagi diperlakukan sebagai satu dataset global/main-wedding, tetapi sebagai workspace yang memiliki dataset independen untuk setiap rangkaian acara yang benar-benar sudah dibuat/disimpan user.

Perubahan tetap mengikuti Extend Over Replace: model `Invitation`, `Guest`, `WeddingTable`, public RSVP, QR, check-in, dan SeatingChart existing dipertahankan lalu dibuat event-aware. PostgreSQL/Prisma tetap menjadi source of truth.

## Definisi “Acara Sudah Dibuat”

### `Invitation.eventConfigured`
- Ditambahkan field `Invitation.eventConfigured Boolean @default(false)`.
- Record WEDDING yang dibuat otomatis saat onboarding/context **tidak otomatis dianggap sebagai acara aktif**.
- Sebuah rangkaian menjadi acara aktif setelah user menekan `Simpan rangkaian` di `Rangkaian Acara`; save tersebut mengirim `eventConfigured: true`.
- Membuat slot tambahan saja belum membuat slot tersebut muncul di selector RSVP/Manajemen Tamu sampai rangkaiannya disimpan.
- Migration melakukan backfill `eventConfigured = true` untuk data existing yang jelas sudah memiliki konfigurasi bermakna seperti venue/alamat/waktu/deskripsi/template/publish, agar data lama tidak hilang dari workspace.

## Event Selector / Dropdown

Komponen reusable baru: `components/Dashboard/EventScopePicker.tsx`.

Behavior:
- RSVP dan Manajemen Tamu menampilkan dropdown `Acara aktif`.
- Dropdown hanya memuat maksimal tiga `Invitation` milik owner dengan `eventConfigured = true`.
- Masing-masing workspace memiliki selected-event state sendiri; mengganti acara di RSVP tidak mengubah pilihan Manajemen Tamu dan sebaliknya.
- Jika belum ada acara configured, dropdown tidak ditampilkan dan hanya muncul neutral empty-state dengan teks **“Silakan buat rangkaian acara dulu.”**
- Tidak ada mock/fallback event yang dibuat untuk mengisi dropdown.

## RSVP per Acara

### Dashboard
- `app/[dashboard]/page.tsx` sekarang mengambil daftar acara dari `/api/invitations?all=1`, lalu hanya memakai record `eventConfigured` untuk selector.
- Setelah acara dipilih, dashboard mengambil guest dataset dari `/api/guests?invitationId=<id>`.
- `RsvpAnalyticsPanel` dapat dirender sebagai embedded workspace di bawah selector acara.
- Statistik RSVP, Hadir, Pax, Check-in, search, sort, CSV, QR, dan row action hanya memakai guest milik acara yang sedang dipilih.
- Empty table berbunyi `Belum ada data RSVP untuk acara ini.`.
- Check-in manual dapat refresh dataset acara aktif tanpa full-page reload.

### Public RSVP
- `POST /api/invite/[slug]/rsvp` tetap menggunakan slug invitation publik yang sedang dibuka dan membuat/mengubah `Guest` dengan `invitationId` record tersebut.
- Account-level Digital Invitation entitlement dipakai sehingga event tambahan tetap dapat menerima RSVP walaupun direct `Payment` relation hanya berada pada invitation utama.
- Endpoint juga mensyaratkan `eventConfigured` dan `isPublished`.
- Hasilnya, bila user memiliki tiga acara maka masing-masing acara memiliki Guest/RSVP dataset yang independen.

## Manajemen Tamu per Acara

### Guest & table retrieval
- `GET /api/guests` menerima optional `invitationId` dan hanya mengembalikan guest + wedding tables dari invitation milik user tersebut.
- Legacy fallback ke main WEDDING dipertahankan jika `invitationId` tidak diberikan.
- `POST /api/guests` menerima `invitationId` untuk menambah manual guest langsung ke roster acara aktif.

### Seating table creation
- `POST /api/tables` menerima `invitationId` dan memvalidasi invitation tersebut milik user.
- Batas maksimal 100 meja berlaku per acara.
- SeatingChart mengirim `invitationId` saat membuat meja dan menambah guest manual.

### Seat assignment & swap
- `PATCH /api/guests/[id]` tidak lagi mencari main invitation. Event ditentukan dari relation guest yang sedang diubah.
- Meja target wajib berasal dari invitation/acara yang sama.
- Seating eligibility dan seat collision validation existing tetap berlaku.
- `POST /api/guests/[id]/swap` menentukan event dari source guest dan target guest wajib berada pada event yang sama.
- Atomic swap transaction existing dipertahankan.

### SeatingChart state isolation
- `SeatingChart` menerima `invitationId` sebagai prop.
- Parent merender SeatingChart dengan `key={invitationId}` sehingga local roster/table/drag state di-reset saat user berpindah acara dan state acara sebelumnya tidak terbawa ke acara berikutnya.

## QR & Check-in per Acara
- `POST /api/usher/qr` menentukan invitation dari Guest yang dipilih, bukan lagi selalu invitation pertama.
- `POST /api/usher/manual-checkin` juga menentukan invitation dari Guest dan memeriksa owner + account Guestbook entitlement.
- QR/check-in action pada RSVP event 2 atau event 3 tidak lagi ditolak hanya karena guest bukan milik event utama.

## Account-Level Entitlement Helper

File baru `lib/packages/server-access.ts` menyediakan:
- `hasAccountDigitalInvitation(userId, directPayment?)`
- `hasAccountGuestbook(userId, directPayment?)`

Tujuan:
- additional event tetap menggunakan entitlement paket user/account walaupun direct `Payment` relation secara historis berada pada invitation utama;
- server authorization tetap authoritative;
- tidak ada entitlement yang hanya dipercayakan kepada state client.

## Beranda Refinement

Beranda diselaraskan dengan struktur `Acara`:
- identity header menjadi rounded neutral surface;
- summary utama menjadi `Acara x / 3`, `Undangan terbit x / 3`, `RSVP`, dan `Tamu`;
- section `Rangkaian acara` menampilkan card untuk setiap acara configured dengan nama, venue, dan status Draft/Terbit;
- jika belum ada configured event, Beranda menampilkan prompt untuk membuat rangkaian pertama;
- action utama difokuskan ke `Kelola rangkaian`, `Kelola undangan`, `Buka RSVP`, `Kelola tamu`, `Siapkan WA Blast`, dan `Kelola paket`;
- horizontal divider panjang kembali dikurangi; hierarchy memakai neutral surface, border tipis, radius, dan spacing.

`/api/dashboard/context` menghitung overview RSVP/Tamu/Open/Publish hanya dari invitation yang sudah `eventConfigured`, sehingga slot internal yang belum pernah dibuat user tidak ikut summary operasional.

## Public Invitation Guard
- Main public invitation mensyaratkan `eventConfigured`, publish state, dan Digital Invitation entitlement sebelum render.
- Event public route hanya mencari additional invitation yang sudah configured.
- Additional event public entitlement diperiksa pada level account, menjaga kompatibilitas dengan payment architecture existing.

## Migration
Migration existing `prisma/migrations/20260916173000_add_invitation_distribution_fields/migration.sql` diperluas untuk menambahkan:
- `Invitation.eventConfigured BOOLEAN NOT NULL DEFAULT false`;
- backfill acara existing yang sudah memiliki data konfigurasi bermakna.

Migration masih harus dijalankan pada environment database dan Prisma Client harus diregenerate sebelum deployment feature ini.

## Affected Files
- `app/[dashboard]/page.tsx`
- `components/Dashboard/EventScopePicker.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `app/api/invitations/route.ts`
- `app/api/dashboard/context/route.ts`
- `app/api/guests/route.ts`
- `app/api/guests/[id]/route.ts`
- `app/api/guests/[id]/swap/route.ts`
- `app/api/tables/route.ts`
- `app/api/usher/qr/route.ts`
- `app/api/usher/manual-checkin/route.ts`
- `app/api/invite/[slug]/rsvp/route.ts`
- `app/invite/[slug]/page.tsx`
- `app/invite/[slug]/[eventSlug]/page.tsx`
- `lib/packages/server-access.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260916173000_add_invitation_distribution_fields/migration.sql`

## Commits
- `0e56f799f51d5bf632d1f4fed0379036f975a18d`
- `a666ae4ec860116f2a43025ef6197cb2f538f0c1`
- `d819c31b923abe4feea4aecc80cd14f2bc7ffa45`
- `52180b6b09f22fae2f6dc21e72b18441209bd3d5`
- `1fc78eccb89bd7fd86b9d089398f9e82e6b5c56d`
- `7f27f65ace15be090c77f521d42d5d323676b9c2`
- `e331079da3f062a0743c8dc7de6d316e60e70c87`
- `67caf92252cafdb0d28e5632eac27ca9e4523ea9`
- `1c3640caefd46538dbe94008333c4ac7fbf02126`
- `8469e981342d8f669ab3fee6f3101fe7bf35ca0d`
- `03adbdaa8ae863c1d71f7cbc624154bdee4b8a68`
- `d7f8dfbcfa34ffc1d8cdabc57270d2ea5dbd5268`
- `09419a01385002a2fc5b74dba8ce278c94c8b1b9`
- `90587e7139665a4dbb496a1d45c7ece9e02b87fb`
- `c4a87132a6fc05b64bfad09bbcf318e566a8305a`
- `c8ba6b5ac9b6dab9a4a339033e8ee51dff95355a`
- `fe132d79d0d05003367dafa5063fba0310c867f1`
- `bb3aefaf5e61c6bffea68119bab1d3f1014bdbd5`
- `b975caa3d9b711d7486a5e2da1851f7e0ad26dc1`

## Validation
- Build, lint, Prisma generate, migration execution, CI, dan deployment belum diverifikasi dalam sesi ini.
- Migration file sudah diperbarui tetapi belum diklaim applied.
- Tidak ada mock data yang ditambahkan.
- Event isolation diterapkan pada read/write RSVP, guest CRUD relevant to this workspace, seating table creation, seat assignment, atomic swap, QR, dan check-in.