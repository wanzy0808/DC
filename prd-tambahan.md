# PRD Tambahan — Supplemental Delta Log

**Date:** 17 September 2026  
**Status:** User-requested supplemental non-canonical delta log. Active product requirements remain in `prd.md`; implementation history remains in `prd1.md`.

## Dashboard Visual Consistency Phase 2

### Requirement delta

- Brand DC Organizer tetap locked; wordmark tidak boleh diinterpretasi ulang per halaman.
- Dashboard tidak menampilkan marketing tagline pada header.
- Seluruh tab dan component dashboard mengikuti visual language Beranda: neutral white/near-black surfaces, Rose `#C07A84` sebagai accent, subtle border/shadow, canonical font tokens, icon Lucide, dan hierarchy tabel/card yang konsisten.
- Rangkaian Acara boleh memakai table-oriented layout agar lebih data-oriented dan mudah discan.
- Table/graph hanya memakai data nyata atau derived data dari aplikasi; tidak ada filler/mock metric.
- Shared dashboard presentation harus memakai/extend `components/Dashboard/DashboardPrimitives.tsx` agar styling tidak kembali belang antar-page.
- Setelah Undangan/Rangkaian Acara berstatus published, dashboard tidak boleh menawarkan action unpublish/tarik publik yang bertentangan dengan published lock.

### Implementation

- canonical typography token dibersihkan ke `--font-dc-heading`, `--font-dc-sans`, dan `--font-dc-mono` pada dashboard workspace;
- shared primitives diperluas untuk page, surface, metric, notice, section header, status badge, dan empty state;
- Rangkaian Acara diubah menjadi data table dengan tanggal, lokasi, status, dan actions;
- Undangan, Personal Invitation, WA Blast, RSVP, event scope, feature gate, dan seating-related surfaces diseragamkan ke surface hierarchy Beranda;
- Undangan yang sudah published menampilkan status terkunci dan tidak lagi menawarkan `Tarik publik`;
- `prd.md`, `AGENTS.md`, dan `README.md` mencatat exception dokumentasi ini sebagai supplemental non-canonical log.

### Validation

Build workflow: Dashboard Consistency Phase 2 #2 (run 35213218973): PASS  
Database migration: N/A.

---

## Invitation Studio — Template Sections & Live Canvas

### Requirement delta

- Template yang dipilih di Invitation Studio harus benar-benar mengubah komposisi canvas, bukan hanya nama atau thumbnail pilihan.
- Section undangan dibuat reusable agar komponen yang sama dapat dipakai lintas template tanpa menduplikasi logic.
- User dapat menyalakan atau mematikan section **RSVP**, **Wishes**, dan **Gift / E-Angpao** secara independen dari Studio.
- Perubahan toggle harus langsung terlihat pada canvas Studio.
- State section ikut tersimpan bersama desain undangan.
- Data inti seperti nama, tanggal, waktu, lokasi, dan parent identity tetap tersinkron dari Rangkaian Acara.
- Ditambahkan template contoh **Botanical Ivory** untuk test flow: long-form mobile invitation bernuansa ivory/botanical yang mengikuti struktur referensi visual user tanpa menyalin aset desain pihak lain.

### Implementation

- menambahkan reusable section configuration `rsvp`, `wishes`, dan `gift`;
- section visibility disimpan kompatibel di `Invitation.templateKey` melalui segment `sections=...`, sehingga perubahan ini tidak membutuhkan migration database;
- menambahkan panel **Section** di Invitation Studio dengan toggle on/off;
- undo/redo desain ikut merekam perubahan section;
- canvas sekarang membaca template aktif dan merender komposisi yang sesuai;
- menambahkan `Botanical Ivory` dengan struktur hero, identitas, waktu/lokasi, RSVP, Wishes, Gift, dan footer;
- template lain memakai adaptive canvas sehingga pilihan template tidak lagi menjadi perubahan katalog yang tidak terlihat pada canvas;
- editor customer sekarang memakai renderer Studio baru.

### Affected files

- `lib/templates/sections.ts`
- `lib/templates/catalog.ts`
- `components/InvitationStudio/InvitationDesignerV2.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `prd.md`
- `prd1.md`
- `prd-tambahan.md`

### Commits

- `f78956b117a8654860ce91cdf1c5195160b22326` — reusable invitation section settings;
- `111a1364d78aa0f7ebadb52760de7119f9c5a501` — Botanical Ivory template catalog entry;
- `f6981ad7103f94a596ee2672d290d370d46507f3` — reusable Studio template system + section toggles;
- `bc26914061be20c826fd0f8819d329cc6bf2e773` — activate section-aware canvas in Invitation Editor.

### Validation

GitHub Actions **Build Validation #970** untuk head `bc26914061be20c826fd0f8819d329cc6bf2e773`: **PASS**.  
Database migration: N/A.

### Current scope note

Toggle dan persistence section sudah bekerja di Studio/design state. Wishes pada perubahan ini adalah section layout/preview; persistence pesan Wishes belum ditambahkan sebagai model data baru.

---

## Invitation Studio — Distinct Template Canvas Follow-up

### Requirement delta

- Mengganti template di Studio harus menghasilkan perubahan visual yang jelas pada **struktur canvas**, bukan sekadar mengganti thumbnail, nama, atau warna kecil.
- Setiap template boleh memiliki starter palette dan font pairing sendiri, sementara user tetap dapat mengubah warna/font setelah template dipilih.
- `Botanical Ivory` dipakai sebagai reference/test long-form mobile yang mendekati komposisi referensi user: hero, identitas, detail waktu/lokasi, RSVP, Wishes, Gift/E-Angpao, dan footer.
- Toggle RSVP, Wishes, dan Gift/E-Angpao tetap reusable dan tidak boleh membuat copy data event baru.
- Public renderer yang sudah memiliki RSVP/Gift harus menghormati visibility state yang sama. Wishes public tetap tidak boleh menampilkan pesan palsu selama persistence Wishes belum tersedia.

### Implementation

- mengaktifkan `InvitationDesignerV3` sebagai renderer Studio customer;
- menambahkan layout canvas berbeda untuk Botanical, Editorial, Maroon, Garden, Midnight, dan Classic sehingga pergantian template terlihat langsung pada canvas;
- pemilihan template menerapkan starter palette/font yang relevan, tetapi panel Warna dan Font tetap dapat mengoverride pilihan tersebut;
- mempertahankan section visibility pada `Invitation.templateKey` sehingga save/load dan event scope tetap backward-compatible tanpa migration;
- generic public invitation membaca `parseInvitationSections()` untuk menyembunyikan/menampilkan RSVP dan Gift sesuai desain tersimpan;
- renderer public Eternal Blossom/Figma Classic juga membaca section visibility yang sama untuk RSVP dan Gift/E-Angpao;
- Gift public hanya dirender ketika section aktif dan data rekening nyata tersedia;
- Wishes di Studio tetap berupa layout preview/input area saja; tidak ada fake guest message atau persistence production yang dibuat pada tahap ini.

### Affected files

- `components/InvitationStudio/InvitationDesignerV3.tsx`
- `components/InvitationStudio/InvitationEditorPage.tsx`
- `lib/templates/design.ts`
- `components/PublicInvitation/PublicInvitation.tsx`
- `components/PublicInvitation/FigmaClassicTemplate.tsx`
- `prd-tambahan.md`
- `prd1.md`

### Validation

- Build Validation #975 menemukan mismatch type pada preset palette/font V3 dan **FAILED**; error tersebut ditelusuri dan diperbaiki.
- Build Validation #976 pada head `87df4ef49aa2cc9063905128cbdd3e633ce7d284` setelah penambahan preset palette/font: **PASS**.
- Build Validation #979 pada documentation head setelah generic public visibility integration: **PASS**.
- Build Validation #980 pada head `b38ccce8470c1f6f7aa7f5ffcf746ece4b2c38db` setelah Figma Classic public visibility integration: **PASS** untuk install, Prisma Client generation, Next.js production build, dan TypeScript.
- Database migration: N/A.

---

## Rangkaian Acara — Wedding Family Wording & Open-ended Time

### Requirement delta

- Input `Anak keberapa` pada event `WEDDING` menghasilkan wording natural di Studio/public invitation: `Putra pertama dari Bapak ... & Ibu ...` untuk pengantin pria dan `Putri pertama dari Bapak ... & Ibu ...` untuk pengantin wanita.
- Urutan anak mengikuti angka yang diinput; 1–10 memakai kata Indonesia (`pertama`, `kedua`, dan seterusnya), sedangkan nilai di atasnya memakai bentuk `ke-N`.
- Rangkaian Acara menyediakan opsi **`Tampilkan “- end” di undangan`** untuk acara yang tidak memakai jam selesai tertentu.
- Opsi tersebut menggunakan compatibility field `receptionTime` dengan sentinel internal `END`; tidak ada schema/database field baru.
- Studio dan public renderer menampilkan `- end` ketika sentinel aktif; `receptionTime` kosong tetap berarti tidak menampilkan waktu selesai.

### Implementation

- family-line formatter dipusatkan di `lib/events/parents.ts`;
- form Rangkaian Acara menampilkan preview wording keluarga secara langsung setelah parent/order diisi;
- field Waktu selesai dapat dinonaktifkan melalui checkbox `Tampilkan “- end” di undangan`;
- API menerima sentinel `END` khusus untuk waktu selesai, sementara waktu mulai tetap wajib `HH:mm`;
- Invitation Studio V3, generic public renderer, dan Figma Classic renderer membaca child order serta sentinel `END` yang sama.

### Commit

- `0068cd7c40a8e06ac076bec20dff10026f1a5421` — add open-ended invitation time and family wording.

### Validation

- `pnpm install --frozen-lockfile`: **PASS**.
- `pnpm db:generate`: **PASS**.
- `pnpm build`: **PASS**.
- Database migration: **N/A**.

