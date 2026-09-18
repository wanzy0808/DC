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
- navigation button memakai Rose `#C07A84` dengan teks/icon near-black;
- hover dapat memakai Supporting Rose `#D9A3AA` dengan teks/icon near-black;
- active dapat memakai Deep Rose `#A65E69` dengan teks/icon near-black;
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
- control transparan tidak boleh mewarisi black text dari canonical filled Rose button bila background header near-black.

### Affected files

- `app/dashboard/page.tsx`
- `app/globals.css`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `prd-tambahan.md`

### Validation

- Build: PENDING
- TypeScript: PENDING
- Database migration: N/A
