# PRD4 — Create Event → Studio Flow & Publish-Only Payment Gate

**Project:** DC Organizer  
**Date:** 2026-09-17  
**Status:** Implementation log continuation after `PRD-TAMBAHAN.md`, `PRD1.md`, `PRD2.md`, and `PRD3.md`

> Dokumen ini melanjutkan implementation changelog tanpa menimpa histori sebelumnya. Arah produk tetap mengikuti `AGENTS.md`, `README.md`, master `prd.md`, `PRD-TAMBAHAN.md`, dan PRD lanjutan yang lebih baru bila requirement historis saling bertentangan.

---

## 2026-09-17 — `Tambah acara` langsung membuka Invitation Studio

### Problem
Pada `Rangkaian Acara`, tombol `Tambah acara` sebelumnya membuat/reuse draft database lalu membuka editor acara inline di halaman yang sama.

Walaupun backend berhasil membuat draft, perubahan posisi UI dapat terasa seperti tombol tidak merespons, terutama jika user mengharapkan alur langsung menuju Studio.

### Current behavior
Flow `Tambah acara` sekarang menjadi:

1. User klik `Tambah acara`.
2. Client mengirim `POST /api/invitations`.
3. Backend membuat draft Invitation baru atau me-reuse blank unfinished draft yang aman digunakan.
4. Backend mengembalikan `invitation.id` yang server-authoritative.
5. Dashboard langsung membuka:

   `/dashboard/editor?type=<type>&invitationId=<invitation-id>`

6. Invitation Studio memuat draft event yang persis sama berdasarkan `invitationId`.
7. User dapat memilih template, mengubah desain, mengunggah foto/musik, dan menyimpan pekerjaan Studio tanpa membeli paket terlebih dahulu.

Tidak ada client-side fake event atau temporary mock ID. PostgreSQL/Prisma tetap menjadi source of truth.

### Existing event behavior
Event yang sudah ada tetap mempertahankan action:
- `Lengkapi acara` / `Edit acara` untuk data inti acara;
- `Buka Studio` untuk desain undangan.

Perubahan ini hanya memperjelas first-entry flow dari tombol `Tambah acara`; editor data acara existing tidak dihapus agar event yang belum lengkap tetap dapat diselesaikan sebelum publish.

---

## Publish-only Digital Invitation payment gate

### Product rule
Harga Digital Invitation tetap:

**Rp150.000 per event / invitation.**

Pembayaran **tidak diwajibkan** untuk:
- membuat draft event;
- membuka Invitation Studio;
- memilih template;
- mengatur palette/font/decor;
- mengunggah foto;
- mengunggah musik;
- menyimpan desain;
- menyiapkan guest/event data yang memang diizinkan sebelum publish.

Pembayaran baru diwajibkan ketika user ingin membuat undangan menjadi publik.

### Server-authoritative publish gate
`app/api/invitations/route.ts` tetap menjadi authoritative gate.

Ketika request meminta `isPublished = true`:
- event harus memiliki data minimum yang valid;
- event harus memiliki entitlement Digital Invitation aktif;
- jika entitlement belum aktif, API menolak publish dengan status `402` dan pesan aktivasi Digital Invitation Rp150.000.

Dengan demikian, menghilangkan UI gate sebelum Studio tidak melemahkan authorization karena publish tetap divalidasi di server.

### Invitation workspace behavior
Pada `components/Dashboard/InvitationWorkspacePanel.tsx`:
- event belum lengkap meminta user melengkapi acara terlebih dahulu;
- event lengkap dan sudah dibayar menampilkan action `Publish`;
- event lengkap tetapi belum dibayar menampilkan action publish yang mengarahkan ke pembelian `INVITATION_BASIC` untuk `invitationId` tersebut;
- event yang sudah terbit dapat ditarik kembali dari publik.

Entitlement tetap event-scoped. Membeli Digital Invitation untuk Event A tidak membuka publish Event B.

---

## UX rationale

Alur produk yang dituju:

**Tambah acara → Studio → desain & simpan gratis → lengkapi data acara bila diperlukan → Publish → aktivasi Rp150.000 bila belum aktif.**

Tujuan perubahan:
- tombol `Tambah acara` memberikan respons navigasi yang jelas;
- user dapat mencoba dan menyiapkan undangan sebelum membayar;
- monetisasi ditempatkan pada moment of value, yaitu saat publish;
- tidak ada payment wall yang menghalangi eksplorasi Studio;
- entitlement tetap aman karena publish diperiksa oleh backend.

---

## Affected file

- `components/Dashboard/EventPanel.tsx`

Related existing implementation yang dipertahankan:
- `app/api/invitations/route.ts`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/InvitationStudio/InvitationDesigner.tsx`
- `app/api/invitations/assets/upload/route.ts`
- package/payment access helpers di `lib/packages/*`

---

## Commit

- `77685a7d2c60e4a499e373c49e64ee23eaf03897` — Open Invitation Studio immediately after creating event draft

---

## Validation status

Source inspection setelah commit memastikan:
- `Tambah acara` masih membuat/reuse Invitation melalui `POST /api/invitations`;
- redirect ke Studio menggunakan `invitationId` yang dikembalikan backend;
- Studio route tidak memiliki package gate pada entry;
- backend `PUT /api/invitations` masih memeriksa payment ketika `isPublished` diminta `true`;
- payment/entitlement tetap per event.

Build/TypeScript/CI untuk commit baru **belum diklaim PASS** sampai hasil GitHub Actions aktual diamati.

---

## Next implementation direction

Setelah flow create-event ini stabil, pengembangan dapat dilanjutkan sesuai backlog PRD dengan prioritas fondasi:
- Guest category & tags;
- Offline-first Usher;
- WhatsApp gateway integration;
- Multi-user / Wedding Organizer access;
- Public RSVP rate limiting;

Fitur ekspansi berikutnya dapat mengikuti setelah core operational flow stabil:
- Digital Gift / QRIS;
- Live Guestbook Wall;
- WA Blast top-up;
- Data Retention Policy;
- thermal label / wristband printing.
