# PRD5 — Event-First Invitation Lifecycle & Template Preview Licensing

**Project:** DC Organizer  
**Date:** 2026-09-17  
**Status:** Implementation log continuation after `PRD-TAMBAHAN.md`, `PRD1.md`, `PRD2.md`, `PRD3.md`, and `PRD4.md`

> Dokumen ini mencatat koreksi flow produk terbaru. Bila bertentangan dengan `PRD4.md`, flow di dokumen ini yang berlaku. Histori lama tidak dihapus agar alasan perubahan tetap dapat dilacak.

---

## 2026-09-17 — Finalized event → invitation → publish lifecycle

### Product requirement
Flow utama ditetapkan menjadi:

1. `Tambah acara`
2. Input data acara
3. `Simpan acara`
4. Data acara tersimpan di PostgreSQL/Prisma
5. `Buat undangan`
6. Pilih template
7. Edit template / isi Studio
8. `Simpan desain`
9. `Publish`
10. Jika Digital Invitation event belum dibeli, arahkan ke paket Rp150.000 untuk event tersebut
11. Setelah entitlement aktif, undangan dapat dipublish

### Supersedes PRD4 first-entry flow
`PRD4.md` sempat mencatat flow `Tambah acara → langsung Studio`.

Flow tersebut **superseded**.

Current behavior:
- klik `Tambah acara` hanya membuka form input acara;
- tidak membuat record database baru pada klik awal;
- record baru dibuat ketika user menekan `Simpan acara` dan validasi minimum berhasil;
- setelah event tersimpan, event tersebut menjadi source data untuk Invitation Studio;
- CTA berubah menjadi `Buat undangan` bila belum memiliki desain dan `Edit undangan` bila template/desain sudah tersimpan.

Legacy blank draft yang sudah terlanjur ada dari flow sebelumnya tetap dapat dipakai ulang oleh backend untuk mencegah orphan/duplicate draft.

---

## Atomic event creation on save

`POST /api/invitations` sekarang mendukung body event lengkap dengan `eventConfigured: true`.

Server memvalidasi sebelum create/update draft:
- event category;
- nama sesuai mode category;
- tanggal;
- waktu mulai;
- venue.

Jika valid:
- reusable blank draft milik user dapat diisi menjadi event configured; atau
- Invitation/event baru dibuat langsung dengan data tersebut.

Ini menjaga database sebagai source of truth tanpa membuat blank database row hanya karena user membuka form.

---

## Invitation design state

`Invitation.templateKey` digunakan sebagai indikator bahwa user sudah memilih dan menyimpan desain/template.

Dashboard membedakan state:
- acara belum lengkap;
- acara siap desain;
- undangan belum desain;
- desain tersimpan / siap publish;
- terbit.

Configured event tanpa `templateKey` belum boleh publish.

Server-side `PUT /api/invitations` sekarang menolak `isPublished = true` apabila:
- event belum configured;
- data minimum event tidak valid;
- `templateKey` kosong;
- entitlement Digital Invitation event belum aktif.

Dengan demikian urutan `simpan acara → simpan template → publish` tidak hanya bergantung pada UI.

---

## Payment / entitlement rule

Harga Digital Invitation tetap:

**Rp150.000 per event / invitation.**

Payment tidak diperlukan untuk:
- membuat dan menyimpan acara;
- membuka Invitation Studio;
- memilih template;
- mengedit desain;
- menyimpan template/desain;
- preview internal Studio.

Payment diperlukan ketika user menekan `Publish`.

Jika event belum memiliki entitlement:
- Studio mengecek state database terbaru;
- user diarahkan ke `/packages?package=INVITATION_BASIC&invitationId=<event-id>`;
- pembelian tetap event-scoped.

Satu event berbayar tidak membuka publish event lain.

---

## Template protection strategy

### Important limitation
Template web yang sudah dikirim sebagai HTML/CSS/JavaScript ke browser **tidak dapat dibuat 100% anti-copy** terhadap user yang memiliki kemampuan DevTools/browser reverse engineering.

Karena itu proteksi menggunakan defense-in-depth dan licensing, bukan klaim DRM absolut.

### Implemented protection — unpaid Studio
Untuk event yang belum memiliki Digital Invitation entitlement:
- Studio tetap dapat digunakan untuk mencoba desain;
- preview utama diberi watermark `PREVIEW • DC ORGANIZER`;
- fullscreen preview juga diberi watermark;
- drag/select image dipersulit;
- browser context-menu pada Studio preview dipersulit;
- UI menjelaskan bahwa sesi masih `preview` dan pembayaran diperlukan saat Publish.

Proteksi client-side tersebut adalah deterrent, bukan security boundary.

### Server-authoritative protection
Security boundary utama berada di server.

Public invitation hanya dapat dirender jika semua kondisi berikut benar:
- event configured;
- `templateKey` sudah tersimpan;
- `isPublished = true`;
- `hasPaidDigitalInvitation(payment) = true`.

Requirement diterapkan pada canonical public invitation route dan additional-event public route.

Jika salah satu kondisi gagal, public renderer tidak mengirim invitation final dan menampilkan locked state.

### Recommended stronger asset protection for future premium templates
Untuk template premium dengan aset proprietary, jangan letakkan master asset final sebagai public static URL.

Arsitektur lanjutan yang direkomendasikan:
- thumbnail/low-resolution/watermarked asset publik hanya untuk catalog/preview;
- master asset disimpan pada private object storage;
- endpoint server memverifikasi owner + event entitlement;
- master asset diberikan melalui short-lived signed URL setelah entitlement valid;
- public renderer final mengambil asset melalui server-authorized path;
- source asset asli tidak dimasukkan ke bundle frontend sebelum lisensi aktif.

Ini memberikan perlindungan yang jauh lebih kuat daripada sekadar memblokir klik kanan.

---

## Studio Publish action

Invitation Studio sekarang memiliki action `Publish` pada shell utama.

Saat ditekan:
1. Studio membaca state invitation terbaru dari server.
2. Jika template belum tersimpan → tampilkan instruksi `Simpan template terlebih dahulu sebelum publish`.
3. Jika template sudah tersimpan tetapi entitlement belum aktif → redirect ke paket event tersebut.
4. Jika entitlement aktif → request publish ke API.
5. API tetap melakukan seluruh validasi server-side sebelum mengubah `isPublished`.

Publish tidak mempercayai state client sebagai authorization source.

---

## Public rendering hardening

Affected public routes sekarang membutuhkan saved template selain payment/published state:
- `app/invite/[slug]/page.tsx`
- `app/invite/[slug]/[eventSlug]/page.tsx`

Tidak ada default-template fallback untuk invitation publik yang belum pernah menyimpan desain.

---

## README synchronization

`README.md` diperbarui agar product lifecycle terdokumentasi konsisten:

`Tambah acara → input → simpan event → buat undangan → pilih/edit template → simpan desain → publish → payment gate bila belum aktif.`

README juga mencatat:
- payment hanya di tahap Publish;
- unpaid Studio adalah preview-only/watermarked;
- public rendering tetap server-authoritative.

---

## Affected files

- `app/api/invitations/route.ts`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationWorkspacePanel.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `app/invite/[slug]/page.tsx`
- `app/invite/[slug]/[eventSlug]/page.tsx`
- `README.md`
- `PRD5.md`

---

## Implementation commits

- `4effd9da8c4429c44b48bcfb3403b70bf1532cd3` — persist complete event data on Save and require saved template before publish
- `29c40c9883650b6aa3c266d490a621914ed93d08` — restore event-input-first dashboard flow and separate `Buat undangan`
- `c5bb4df32037903911f9ef48dbb2136fd91f8a90` — clarify invitation design/publish lifecycle in workspace
- `bf4d5fa01361b07b57ff8db8d6b4d4c369221f61` — add Studio preview watermark and publish-to-package flow
- `01f2859668b308124bb59c35e6054fc045b2a67f` — require saved paid template on canonical public invitation route
- `d730e00e4c55c621ec9b714f6bc3b75effa879ad` — require saved template on additional event public route
- `56e00c714c76110208ef8ecd43c60dffc06bf396` — synchronize README lifecycle

---

## Validation status

Source-level checks in this implementation pass confirm the intended guards are present in the changed files.

Build, TypeScript, Prisma generation, and GitHub Actions results for the final combined source state are **not claimed PASS** until an actual workflow result is observed.

No database schema migration is introduced by this change.
