# PRD Tambahan — Continuation 1

Dokumen ini melanjutkan catatan implementasi `PRD-TAMBAHAN.md` tanpa menghapus atau menulis ulang histori sebelumnya. Dipakai untuk perubahan bertahap pada standardisasi dashboard.

## 2026-09-16 — Dashboard Role Shell & Semantic Theme Alignment — Stage 1

### Tujuan
Menyeragamkan shell dan palette dashboard role (`/owner`, `/admin`, `/designer`) dengan canonical DC Organizer tanpa mengubah alur bisnis, data, authorization, atau behavior fitur.

### Perubahan
- `/owner`, `/admin`, dan `/designer` sekarang memakai shell `dc-dashboard` dan semantic theme tokens `bg-background` / `text-foreground`.
- Owner Dashboard mengganti hardcoded palette utama dengan token semantic (`text-primary`, `bg-background`, `border-border`, `text-muted-foreground`, `bg-primary/10`).
- Admin Dashboard mengganti hardcoded white/dark/card palette dengan token semantic dan mengikuti canvas netral dashboard.
- Designer Dashboard mengganti hardcoded white/dark/rose palette dengan token semantic yang sama.
- Struktur fitur, API calls, role behavior, upload flow, payment flow, dan data model tidak diubah.
- Tidak menambahkan gradient, glow baru, atau warna brand baru.
- Canonical Rose tetap `#C07A84`, Supporting Rose `#D9A3AA`, dan Deep Rose `#A65E69` sesuai `AGENTS.md`/PRD.

### Affected files
- `app/owner/page.tsx`
- `app/admin/page.tsx`
- `app/designer/page.tsx`
- `components/Owner/OwnerDashboard.tsx`
- `components/Designer/DesignerDashboard.tsx`

### Commits
- `d35a70e0b54381c52cb8efd207cb9866412988cb`
- `90d5e45c716cc6e770d30207aca85aff38798dfe`
- `2a2b8808b0bbc18dc46a73048dc7b7b4a2bc7239`
- `9fd73e01d1d33aa41ca577b97a5ff54947a64ee2`
- `5c102f81d6ad8912531e42d5252f349186e5a22a`

### Validation
GitHub combined status pada commit terakhir tidak mengembalikan status/check. Karena tidak ada hasil build/CI aktual yang tersedia, validation **belum diverifikasi dengan build/CI**.

### Tahap berikutnya
Audit dan standardisasi Workspace `/dashboard` serta seluruh component dashboard satu per satu, terutama:
- sidebar active/hover palette yang masih memakai warna legacy;
- konsistensi surface/card/radius;
- form/input/select;
- table/status chip;
- dialog/modal;
- mobile layout dan overflow;
- konsistensi typography dan action hierarchy.
