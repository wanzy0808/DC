# PRD Tambahan — Undangan Hub & Distribution Workspace

## 2026-09-16 — Dashboard Undangan Hub

### Tujuan
Menyusun ulang workspace user agar alur undangan terbaca sebagai satu domain kerja, bukan kumpulan menu terpisah. Menu `Undangan` menjadi parent navigation dengan empat submenu operasional: `Rangkaian Acara`, `Undangan`, `WA Blast`, dan `Personal Invitation`.

Perubahan mengikuti prinsip Extend Over Replace: route, API, Studio, RSVP, guest database, public invitation renderer, seating, dan entitlement existing dipertahankan lalu diperluas. PostgreSQL/Prisma tetap menjadi source of truth dan tidak ada mock invitation/guest data.

### Information Architecture Dashboard
Sidebar user sekarang memiliki struktur:
- `Beranda`
- `Undangan`
  - `Rangkaian Acara`
  - `Undangan`
  - `WA Blast`
  - `Personal Invitation`
- `RSVP`
- `Manajemen Tamu`
- `Usher App`

Parent `Undangan` dapat expand/collapse. Active submenu tetap memakai Rose accent dan neutral surface yang sama dengan design system dashboard existing.

## Rangkaian Acara — Maksimal 3

### Keputusan data
- Satu `Invitation` dipakai sebagai satu rangkaian yang sekaligus menjadi sumber data undangan untuk rangkaian tersebut.
- Arsitektur existing dipertahankan tanpa enum/schema event baru: satu record `WEDDING` menjadi rangkaian utama dan maksimal dua record `ADAT_AKAD` menjadi rangkaian tambahan.
- Maksimal total adalah **3 rangkaian/undangan per owner**.
- API lama berbasis `type` tetap dipertahankan untuk compatibility, sedangkan workflow baru dapat membaca dan mengubah record berdasarkan `Invitation.id`.

### UX
- `Rangkaian Acara` menampilkan satu editor aktif pada satu waktu.
- User dapat memilih rangkaian existing untuk diedit.
- Tombol `Tambah rangkaian` membuat record tambahan sampai limit 3.
- Setiap rangkaian memiliki CTA `Buat undangan di Studio` yang membawa `type` dan `invitationId` sehingga Studio membuka record yang benar.
- Couple name tetap bersumber dari data pasangan canonical.
- Studio resolver membatasi penggunaan `invitationId` dari URL/referrer hanya ketika tipe yang sedang dibuka cocok, sehingga pindah tipe Studio tidak menyimpan target record yang salah.

## Undangan — Status Maksimal 3

Workspace `Undangan` membaca tiga record rangkaian yang sama dan menampilkan:
- jumlah yang sudah dipublish (`x / 3`),
- jumlah total page open dari `Invitation.viewCount`,
- jumlah tamu yang sudah memberi respons RSVP,
- card status setiap undangan,
- tombol `Masuk Studio`,
- tombol `Publish` / `Tarik publik`,
- public URL ketika undangan sudah terbit,
- list nama tamu yang merespon beserta status dan pax.

Slot yang belum dibuat ditampilkan sebagai `Slot tersedia` dan CTA diarahkan kembali ke `Rangkaian Acara`, sehingga user membuat rangkaian lebih dulu lalu mendesain undangannya.

### Open counter
- Main public invitation menambah `Invitation.viewCount` setelah undangan lolos published/payment/password gate.
- Event public invitation melakukan hal yang sama.
- Angka ini adalah **page-open counter**, bukan unique-person analytics.

## Public Event Routing untuk 3 Rangkaian
- Route event publik tidak lagi mengasumsikan hanya satu `ADAT_AKAD`.
- Route mencari maksimal dua event tambahan milik owner dan mencocokkan `eventSlug` terhadap `slugifyEvent(title)`.
- URL existing dan alias lama tetap dipertahankan melalui `proxy.ts`.
- Publish/payment tetap server-authoritative.

## WA Blast

### Baseline quota
- `Invitation.waBlastQuota` ditambahkan dengan default **100** pada undangan utama.
- Server menghitung penerima yang dipilih dan menolak penambahan ketika quota sudah penuh.
- Workspace menampilkan `Kuota`, `Dipilih`, dan `Sisa`.

### Recipient queue
- User dapat memilih tamu existing yang memiliki nomor WhatsApp.
- Jika tamu belum ada, user dapat memasukkan nama dan nomor WhatsApp lalu record dibuat sebagai `Guest` MANUAL dan langsung masuk queue.
- Queue disimpan melalui `Guest.waBlastSelected` dan dapat dibatalkan per tamu.
- Field `waBlastSentAt` disediakan untuk integrasi delivery berikutnya.

### Tambah quota
- CTA `Tambah quota` tersedia dan saat ini mengarah ke packages/workflow monetization existing.
- Harga/top-up quantity dan provider pengiriman WhatsApp **belum ditentukan pada requirement**, sehingga implementasi tidak mengarang harga ataupun provider.
- Tahap ini adalah recipient/quota management; **belum mengirim pesan WhatsApp secara nyata** karena delivery provider/API belum ditentukan.

## Personal Invitation

### Data model
Personal Invitation menggunakan `Guest` existing agar identitas tamu tetap satu source of truth. Field baru:
- `personalToken` — token publik unik,
- `personalPublished`,
- `personalPasswordProtected`,
- `personalPasswordHash`,
- `personalViewCount`.

### Dashboard workflow
User dapat:
- memilih tamu existing atau membuat tamu baru,
- membuat Personal Invitation,
- melihat list Personal Invitation,
- membuka `Pratinjau` tanpa harus publish,
- edit nama dan nomor tamu,
- publish / tarik dari publik,
- aktifkan password,
- ganti password,
- matikan password,
- membuka URL publik ketika sudah publish.

### Public route
- Canonical personal URL: `https://[couple-slug].[root-domain]/p/[token]`.
- Proxy me-rewrite URL tersebut ke `/invite/[slug]/p/[token]`.
- Route memeriksa published state, paid entitlement, token, dan password sebelum render.
- Public render memakai template WEDDING existing dan menambahkan identitas `Undangan khusus untuk <nama tamu>`.
- `personalViewCount` bertambah setelah access gate berhasil dilewati.
- Owner preview tersedia di `/dashboard/personal-invitation/[guestId]` dan tidak menambah public view count.

### Password security
- Password disimpan sebagai bcrypt hash.
- Hash tidak pernah dikembalikan oleh Personal Invitation API.
- `GET /api/guests` diubah menggunakan explicit safe select sehingga `personalPasswordHash` tidak bocor ke client setelah schema baru diterapkan.
- Personal access cookie memakai scope key `personal-[token]` dan path personal invitation terkait.

## Prisma Migration
Migration baru:
`prisma/migrations/20260916173000_add_invitation_distribution_fields/migration.sql`

Menambahkan:
- `Invitation.waBlastQuota` default 100,
- WA Blast state pada `Guest`,
- Personal Invitation state/token/password/view counter pada `Guest`,
- unique index `personalToken`,
- query indexes untuk WA Blast dan Personal Invitation.

Migration harus dijalankan pada environment database sebelum feature baru digunakan.

## Studio & Asset Compatibility
- Additional invitation dapat dipilih berdasarkan `Invitation.id` tanpa menghapus API `type` lama.
- Asset upload dan URL-asset endpoints sekarang menerima entitlement Digital Invitation pada level account/user, sehingga rangkaian tambahan tidak gagal hanya karena record tambahan tidak memiliki direct `Payment` relation.
- Existing Studio, dynamic template selection, upload limits, and renderers tetap dipertahankan.

## Dashboard Overview
- `invitationsLimit` diselaraskan dari 2 menjadi **3**.
- Total open pada overview dijumlahkan dari seluruh invitation owner.
- Publish summary bernilai aktif jika minimal satu invitation sudah published.

## Affected Files
- `app/[dashboard]/page.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/Dashboard/WhatsAppBlastPanel.tsx`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `app/api/invitations/route.ts`
- `app/api/dashboard/context/route.ts`
- `app/api/guests/route.ts`
- `app/api/wa-blast/route.ts`
- `app/api/personal-invitations/route.ts`
- `app/api/invitations/assets/route.ts`
- `app/api/invitations/assets/upload/route.ts`
- `app/invite/[slug]/page.tsx`
- `app/invite/[slug]/[eventSlug]/page.tsx`
- `app/invite/[slug]/p/[token]/page.tsx`
- `app/api/invite/[slug]/personal/[token]/password/route.ts`
- `app/dashboard/personal-invitation/[guestId]/page.tsx`
- `components/PublicInvitation/PersonalInvitationPasswordGate.tsx`
- `lib/invitation-password.ts`
- `proxy.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260916173000_add_invitation_distribution_fields/migration.sql`

## Commits
- `d732061017bf70234bb026df9999c8718c3184cc`
- `98b6b051f648300b1ec6a301f936d08bf4d591ba`
- `c5f1bd10ca2f4c7543ed04297a2a173bb9a90f1b`
- `daa55b276982c00b35bc3b15685f4d8ea3e0a908`
- `9770a0ead4db72743e65eadc22413591d90ceb9c`
- `3743e3a34f5204f0a41ee51bc462fa03f993893d`
- `761cc28535eaa111010fb1ef341b9c14d8794980`
- `be81c612d082ac4cd0b97ea1a3bb909327984dc2`
- `aef226b82e6046c54cbbf5072bb81b65a09d4cbd`
- `e9992cdf45091944dc44af103bf36ed64540a06b`
- `64511bbde94b59df0839d51673e41373cb37e642`
- `b105eea5676611d27912fca11c382f7e27d103c4`
- `b9393eeae8d210e3202fc45ee77be40477a56041`
- `1dad93ca15ee56d24bcf79d701e0e3e648bc46ae`
- `f3d906c10fd3cbf4438a68be177df2c4c7c7a843`
- `cf75806c1f4d9d56807cd812f746c829dc29dfc9`
- `c5ab35f4554b10e4ead4df740ad3c37873cdf0fd`
- `023b4c338a1b21c780901a600095ea9b4092a562`
- `985c84acd2285b2301b84c09f981973d0fb52ead`
- `ff423a1dae6fac18d491c1811ce471a77cf49772`
- `a260d129f45989b6853e11b823d238534a0ece4c`
- `686f7c635b07c8dde0cefb7a8d2381df8fe0897c`
- `ec43e324c6e43e1f47b003236ec5591f82d36da0`

## Validation
- Prisma migration **belum dijalankan** pada environment deployment dari sesi ini.
- Prisma client regeneration **belum diverifikasi**.
- Build, lint, CI, dan deployment **belum diverifikasi**.
- WA Blast delivery provider dan quota top-up pricing/order flow belum ditentukan, sehingga tidak diklaim sebagai fitur pengiriman pesan aktif.
- Implementasi tahap ini memprioritaskan database-backed workflow, backward compatibility, server entitlement, dan struktur dashboard baru tanpa mock data.