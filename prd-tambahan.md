# PRD Tambahan — Dashboard Visual Consistency Phase 2

**Date:** 17 September 2026  
**Status:** User-requested supplemental non-canonical delta log. Active product requirements remain in `prd.md`; implementation history remains in `prd1.md`.

## Requirement delta

- Brand DC Organizer tetap locked; wordmark tidak boleh diinterpretasi ulang per halaman.
- Dashboard tidak menampilkan marketing tagline pada header.
- Seluruh tab dan component dashboard mengikuti visual language Beranda: neutral white/near-black surfaces, Rose `#C07A84` sebagai accent, subtle border/shadow, canonical font tokens, icon Lucide, dan hierarchy tabel/card yang konsisten.
- Rangkaian Acara boleh memakai table-oriented layout agar lebih data-oriented dan mudah discan.
- Table/graph hanya memakai data nyata atau derived data dari aplikasi; tidak ada filler/mock metric.
- Shared dashboard presentation harus memakai/extend `components/Dashboard/DashboardPrimitives.tsx` agar styling tidak kembali belang antar-page.
- Setelah Undangan/Rangkaian Acara berstatus published, dashboard tidak boleh menawarkan action unpublish/tarik publik yang bertentangan dengan published lock.

## Implementation pada phase ini

- canonical typography token dibersihkan ke `--font-dc-heading`, `--font-dc-sans`, dan `--font-dc-mono` pada dashboard workspace;
- shared primitives diperluas untuk page, surface, metric, notice, section header, status badge, dan empty state;
- Rangkaian Acara diubah menjadi data table dengan tanggal, lokasi, status, dan actions;
- Undangan, Personal Invitation, WA Blast, RSVP, event scope, feature gate, dan seating-related surfaces diseragamkan ke surface hierarchy Beranda;
- Undangan yang sudah published menampilkan status terkunci dan tidak lagi menawarkan `Tarik publik`;
- `prd.md`, `AGENTS.md`, dan `README.md` mencatat exception dokumentasi ini sebagai supplemental non-canonical log.

## Validation

Build workflow: Dashboard Consistency Phase 2 #2 (run 35213218973): PASS
Database migration: N/A.
