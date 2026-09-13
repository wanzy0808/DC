# DC Organizer — PRD Implementation Addendum

Dokumen ini adalah implementation log / PRD tambahan untuk repository `wanzy0808/DC`.

- `prd.md` = Master Product Requirements / Product Source of Truth.
- `PRD-TAMBAHAN.md` = implementation log untuk perubahan material terbaru.
- `AGENTS.md` = coding/design-system rules.
- `README.md` = technology stack dan public architecture.

---

# 2026-09-13 — Burger Menu Visual Refinement

## 1. Typography & Theme Consistency
- Burger menu navigation sekarang secara eksplisit memakai typography DC Organizer:
  - **Cinzel** untuk `SheetTitle` / display heading.
  - **Fauna One** untuk body copy, navigation, dan interactive labels.
  - **DM Mono** untuk metadata seperti `Navigation / 01` dan `JOIN`.
- Menu memakai semantic theme tokens (`foreground`, `secondary`, `secondary-foreground`, `primary`, `ring`) agar light/dark theme tetap mengikuti brand Rose `#C07A84` family.
- Hover state tidak lagi bergantung pada kombinasi rose background + putih yang berpotensi low-contrast. Hover memakai semantic foreground/background sehingga tetap terbaca di kedua theme.

## 2. Editorial Navigation & Motion
- Burger menu diarahkan menjadi extension dari landing/navbar, bukan panel generic.
- Menu utama menggunakan nomor editorial `01`–`06`, divider tipis, dan accent rose untuk membangun hierarchy tanpa card-heavy styling.
- Content panel mendapat subtle entrance animation menggunakan existing `motion/react`.
- Accordion `Layanan` menggunakan `AnimatePresence` dengan opacity/translate motion, tanpa animasi layout height.
- Product links mendapat staggered reveal ringan.
- Arrow dan icon mendapat micro-interaction saat hover.
- `useReducedMotion()` tetap dihormati; motion dikurangi ketika user meminta reduced motion.

## 3. Preservation
- Route existing tetap dipertahankan.
- Pintu navigation tidak diubah.
- Rose petals tidak diubah.
- Registration dialog dan existing Sheet architecture tetap dipertahankan.
- Tidak ada dependency baru.

## 4. Affected Files
- `components/Layout/Navbar/BurgerMenuContent.tsx`

## 5. Commit
- `77261e7fb04435b2414ecc18d0a4eb30d6f9b904` — refine burger into editorial navigation.

## 6. Validation
- Code-level review completed against `AGENTS.md`, `prd.md`, `README.md`, dan `SKILL.md`.
- Build/CI: **Not verified**; tidak ada hasil build/CI yang diklaim.

---

# 2026-09-13 — Guest Create API Validation Hardening

## 1. Problem / Gap
- Endpoint `POST /api/guests` sebelumnya menerima `tableId` tanpa memverifikasi bahwa meja tersebut milik invitation yang sedang dikelola.
- Endpoint juga dapat menempatkan tamu baru ke meja yang sudah mencapai kapasitas.
- Validasi `plusOnes` belum menolak nilai negatif atau pecahan.
- Ini tidak selaras dengan prinsip server-authoritative pada `prd.md` dan aturan collision-safe guest management di `AGENTS.md`.

## 2. Implementation
- `tableId` sekarang diverifikasi terhadap `invitation.id` sebelum guest dibuat.
- Meja penuh menghasilkan HTTP `409` dan guest tidak dibuat.
- Guest tetap boleh dibuat tanpa meja dengan `tableId = null`.
- `plusOnes` harus berupa integer non-negatif.
- Validasi existing payment/entitlement dan authentication tetap dipertahankan.
- Tidak ada perubahan schema atau dependency.

## 3. Affected Files
- `app/api/guests/route.ts`

## 4. Commit
- `e3f7d384f7480bd4ce0fa4085c9c080196cb740c` — validate table ownership and capacity on create.

## 5. Validation
- Source reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, dan existing guest/seating APIs.
- Build/CI: **Not verified**; workflow run belum tersedia untuk commit ini.

---

# 2026-09-13 — Seating Builder Limits Enforcement

## 1. Problem / Gap
- PRD menetapkan generator denah maksimal **100 meja** dan **50 kursi per meja**, tetapi `POST /api/tables` sebelumnya hanya memvalidasi kapasitas minimum.
- Endpoint juga menerima nilai `shape` arbitrary yang tidak digunakan oleh UI saat ini.

## 2. Implementation
- Kapasitas meja sekarang dibatasi server-side pada `1–50` kursi.
- Jumlah meja per invitation dibatasi server-side pada maksimal `100` meja.
- Shape dibatasi ke nilai yang sudah digunakan UI: `ROUND`, `RECTANGLE`, dan `SQUARE`.
- Batas dilakukan di API sehingga tidak bergantung pada validasi client-side.
- Tidak ada perubahan schema atau dependency.

## 3. Affected Files
- `app/api/tables/route.ts`

## 4. Commit
- `ae73a728be0610e8e1c6437a33bb7924d1588eed` — enforce seating builder limits.

## 5. Validation
- Source reviewed against `AGENTS.md`, `SKILL.md`, `prd.md`, `README.md`, dan existing seating implementation.
- Build/CI: **Not verified**; workflow run belum tersedia untuk commit ini.
