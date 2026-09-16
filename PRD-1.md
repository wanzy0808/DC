# DC Organizer — PRD-1

## 2026-09-16 — Dashboard Visual Redesign

### Objective
Merapikan ulang visual workspace dashboard DC Organizer agar terasa lebih premium, editorial, tenang, dan konsisten dengan design system, tanpa mengubah sidebar yang sudah ada.

### Scope
- Dashboard utama (`/dashboard`) dan panel-panel yang dirender di area `main` mendapat visual treatment baru.
- Sidebar secara eksplisit tidak diubah.
- Tidak ada perubahan database, API, entitlement, routing, atau business logic.
- Existing components tetap dipakai; redesign dilakukan sebagai visual layer agar alur yang sudah berjalan tetap kompatibel.

### Design Direction
- Canvas light: putih; dark: hampir hitam.
- Rose `#C07A84` hanya menjadi aksen untuk action, focus, selected state, dan brand.
- Mengurangi kesan warm/cream surfaces dan card stacking yang terlalu berat.
- Border tipis, radius konsisten, shadow sangat ringan.
- Input/form mengikuti surface dashboard dan focus ring Rose yang halus.
- Table header dan row hover memakai neutral tint dengan aksen Rose yang sangat ringan.
- Metadata tetap menggunakan DM Mono; heading memakai Cinzel; body/UI memakai Fauna One.
- Motion ringan hanya pada interaksi dan menghormati `prefers-reduced-motion`.

### Implementation
Affected files:
- `app/dashboard-theme.css` — visual system khusus area `main` dashboard; selector sengaja tidak menyentuh sidebar.
- `app/layout.tsx` — memuat dashboard visual stylesheet secara global.

Existing dashboard components remain behaviorally intact, termasuk:
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/RsvpAnalyticsPanel.tsx`
- `components/Dashboard/SeatingChart.tsx`
- `components/Dashboard/FeatureGate.tsx`

### Preservation Rules
- Sidebar tidak di-redesign.
- Tidak menambah primitive button baru; button tetap melalui `components/ui/button.tsx` sesuai aturan repository.
- Tidak menambahkan data mock.
- Tidak mengubah API/database flow.
- Tidak mengubah protected landing Pintu atau rose petals.

### Commits
- `c9a3eed906b1fb2286613d96cc75415b81f2a093` — add dashboard visual system.
- `2bf06195b9b7b962c0c32708fc3b99cf75293653` — load dashboard visual system.
- `52ee28cc198712884d822e999d0e7b537e356186` — refine panel hierarchy and interactions.

### Validation Status
Code changes were written to the repository. No local build, lint, or CI result was observed during this change, so validation is **not marked PASS**.
