# DC Organizer — PRD Tambahan

**Status:** Supplemental Delta Log  
**Canonical PRD:** `prd.md`  
**Date:** 18 September 2026

> File ini dibuat atas permintaan eksplisit owner sebagai catatan delta tambahan. Requirement aktif tetap mengikuti `prd.md`; bila ada konflik, `prd.md` yang berlaku.

---

## Dashboard Sidebar — Neutral Shell Revision

### Intent

Full-Rose sidebar tidak digunakan lagi. Sidebar harus terasa lebih menyatu dengan Dashboard body dan memakai Rose pada navigation button/state, bukan sebagai background seluruh rail.

### Light Mode

- sidebar background putih / mengikuti canvas Dashboard;
- default text dan icon near-black agar terbaca jelas;
- hover navigation memakai Rose `#C07A84` dengan teks/icon putih;
- active navigation memakai Deep Rose `#A65E69` dengan teks/icon putih;
- container grup seperti **Acara** tetap transparan/netral, tidak menjadi card Rose tambahan.

### Dark Mode

- sidebar background mengikuti body near-black `#0B0B0C`;
- default navigation button tetap transparent/netral dengan teks/icon putih;
- hover navigation memakai Rose `#C07A84` dengan teks/icon putih;
- active navigation memakai Deep Rose `#A65E69` dengan teks/icon putih;
- behavior ini menjadi kebalikan visual Light Mode: canvas gelap + copy putih, sedangkan Rose hanya muncul saat hover/active;
- sidebar tidak memakai full Rose background.

### Typography

Sidebar dibuat sedikit lebih besar:
- main navigation: sekitar **16px**;
- nested navigation: sekitar **15px**;
- sidebar section metadata: sekitar **11px**.

Targetnya adalah readability yang lebih nyaman pada desktop tanpa membuat sidebar terasa padat atau oversized.

### Header contrast

Perbaikan sebelumnya tetap berlaku:
- theme/language/account controls yang transparan harus tetap terbaca pada Dark Mode;
- ID/EN idle menggunakan near-black/transparent background + white copy; selected locale memakai neutral white emphasis, bukan pink opacity/fill;
- account trigger, avatar, dan dropdown item idle menggunakan near-black background + white copy;
- ID/EN dan account controls baru memakai Rose saat hover/interaction;
- control transparan tidak boleh mewarisi black text atau idle Rose fill dari canonical filled Rose button bila background header near-black.

### Affected files

- `app/dashboard/page.tsx`
- `app/globals.css`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `prd-tambahan.md`

### Validation

- GitHub Actions Build Validation #1025: **PASS** on application source head `bc26869ebfa8454d294f412479445f25d949224b`.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.


### Follow-up — Dark Header Utilities

Owner meminta menghapus sisa Rose opacity/fill pada ID/EN dan account menu saat idle di Dark Mode. Implementasi mengikuti neutral-first rule: black/near-black + white copy saat idle, Rose + white copy hanya saat hover.

Validation: GitHub Actions Build Validation #1030 **PASS** pada application source head `0af685723e2178d52c735a8890026d5ce87d90ff` (dependency install, Prisma Client generation, Next.js production build + TypeScript). Database migration: N/A. Follow-up commit ini hanya memperbarui dokumentasi validation.


---

## Follow-up — Unified Header Control Family

Owner meminta Light/Dark Dashboard tidak lagi memiliki style terpisah untuk burger, theme toggle, ID/EN, dan account trigger.

Canonical delta:
- keempat control memakai satu shape/radius/height/border family;
- Light idle: white/neutral + Rose foreground/border;
- Dark idle: near-black + white foreground;
- hover kedua theme: Rose + white;
- active locale: border/underline emphasis, bukan filled style sendiri;
- perubahan hanya untuk Dashboard header; public navbar behavior existing dipertahankan.

Validation: PENDING workflow terbaru.
