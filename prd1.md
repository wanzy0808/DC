# DC Organizer — Implementation Changelog

**File:** `prd1.md`  
**Purpose:** Chronological implementation history after master PRD consolidation  
**Master Product Requirements:** `prd.md`  
**Started:** 17 September 2026

> `prd.md` adalah single source of truth untuk requirement aktif. File ini **bukan PRD kedua** dan tidak boleh menduplikasi seluruh requirement. Gunakan file ini untuk mencatat perubahan implementasi, alasan, affected files, commit, dan validation status. Jika perubahan mengubah product requirement, update `prd.md` terlebih dahulu lalu catat perubahan tersebut di sini.

---

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
- `prd1.md` menjadi satu-satunya implementation changelog setelah consolidation.

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
- `prd1.md` → implementation changelog;
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
- `27a65c2de4f0825d4f3429866a65ec578fc7e72a` — create lowercase `prd1.md` unified changelog;
- `752d313935399107814257067f2db62f17a717a4` — align `AGENTS.md` with `prd.md` + `prd1.md` governance.

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
5. `prd1.md`;
6. relevant implementation files.

Every material implementation change is now appended to `prd1.md`. A product requirement change must update `prd.md` first. Agent rules also no longer treat couple fields as universal semantics and no longer instruct creation of `PRD-TAMBAHAN.md`.

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
- `prd1.md`

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

## Future Entry Format

Tambahkan perubahan baru di bagian paling bawah dengan format:

```md
## YYYY-MM-DD — Nama Perubahan

### Requirement / Intent
Apa yang diminta dan kenapa.

### Implementation
Apa yang benar-benar diubah.

### Affected Files
- `path/file.ts`

### Commit
- `<sha>` — message

### Validation
- Build: PASS / FAIL / NOT RUN
- TypeScript: PASS / FAIL / NOT RUN
- Migration: APPLIED / NOT APPLIED / N/A
- Catatan deployment bila ada
```

Jangan menulis `PASS` tanpa hasil aktual yang diamati.
