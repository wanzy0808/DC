# DC Organizer — Public Page Visual & Component Direction Draft

**Status:** Draft / Pending Owner Approval  
**Purpose:** Menampung arah visual untuk public/service pages di luar landing sebelum implementation.  
**Canonical PRD:** `prd.md` tetap Single Source of Truth. Dokumen ini tidak menggantikan `prd.md`, `AGENTS.md`, atau `prd1.md`.

> Belum ada source page/component yang diubah berdasarkan dokumen ini. Coding dilakukan setelah owner memberikan approval eksplisit.

---

## Scope

Arah ini dapat diterapkan secara konsisten pada public/service pages DC Organizer seperti Event Planner, Digital Invitation, Guestbook, package/marketing surfaces, dan public informational pages lain yang relevan.

Dashboard/workspace tidak otomatis mengikuti decorative public-page treatment ini. Dashboard tetap mengikuti Beranda/dashboard design language yang sudah ditentukan di `AGENTS.md`.

Tujuannya bukan membuat semua page identik, tetapi memberi mereka satu **DC spatial/architectural visual language**.

---

## Core Visual Language

Public pages menggunakan neutral architectural canvas dengan cahaya sebagai decorative identity.

Light mode:
- pure white / warm-white visual canvas;
- soft window/door/arch light;
- restrained architectural shadow;
- faint Rose reflection/edge;
- negative space tetap dominan.

Dark mode:
- near-black neutral canvas;
- white primary text;
- Rose `#C07A84` sebagai brand illumination/accent;
- pink/Rose edge light, window light, reflection, dan subtle atmospheric depth;
- tidak menggeser palette menjadi gold/champagne/bronze;
- tidak menggunakan giant pink glow atau full pink surface.

Visual boleh terasa seperti cahaya datang dari jendela atau pintu di luar frame. Tidak perlu selalu menggambar literal door pada setiap page.

---

## Brand & Typography Lock

Perubahan visual page tidak boleh mengubah identity system.

Tetap gunakan:
- canonical `BrandWordmark`;
- Cinzel untuk display/heading/brand/editorial;
- Fauna One untuk body/UI;
- DM Mono untuk metadata/utility;
- Rose `#C07A84` sebagai canonical accent;
- shared `Button` component dan visual contract existing.

Jangan:
- menambah font baru untuk application/public UI;
- membuat page-specific logo;
- membuat button variant baru;
- membuat gradient/gold button;
- membuat rounded pill CTA hanya karena reference image;
- mengubah Rose menjadi gold/champagne.

Generated mockup hanya mood reference. Existing brand/component rules menang apabila reference image bertentangan.

---

## Page Composition

Public page harus terasa spacious dan editorial, bukan kumpulan card SaaS.

Gunakan:
- 80vw desktop composition sesuai existing rule;
- clear hero hierarchy;
- generous negative space;
- background light/shadow yang membantu depth;
- section transition yang lembut;
- content yang berasal dari product truth.

Hindari:
- decorative numbering seperti `01`, `02`, `03`;
- numbered feature cards yang tidak merepresentasikan data/order nyata;
- repeated pink cards;
- glassmorphism di semua section;
- icon floating acak;
- fake statistics;
- fake testimonials;
- random italic colored words;
- terlalu banyak font size/color treatment dalam satu heading.

Jika urutan benar-benar merupakan instruksi/proses nyata, UI boleh menyampaikan sequence secara natural, tetapi tidak perlu memakai nomor dekoratif sebagai motif visual.

---

## Background by Page Context

Setiap page boleh memiliki atmospheric variation berdasarkan fungsi, tetapi tetap berasal dari keluarga yang sama.

**Event Planner** dapat menggunakan sense of path, planning table/grid shadow, architectural corridor, atau subtle timeline light. Hindari literal wedding planner imagery sebagai global background.

**Digital Invitation** dapat menggunakan layered paper/frame light, subtle screen/frame silhouette, soft opening-light, atau gallery-like composition. Template preview tetap menjadi content utama; background jangan bersaing dengannya.

**Guestbook / onsite** dapat menggunakan entrance/check-in spatial cues, soft doorway light, reception-desk-like geometry, atau path into venue secara abstrak. Jangan membuatnya terlihat seperti hotel/wedding venue tertentu.

**Package/pricing/informational pages** menggunakan versi paling restrained: white/near-black canvas, architectural light, thin Rose lines, dan minimal depth agar pricing/content tetap mudah dibaca.

Background adalah ambience, bukan product illustration wajib.

---

## Motion System

Motion adalah bagian dari public DC experience, bukan tambahan acak.

### Page text motion

Setiap major public page/section harus mempunyai restrained entrance/reveal:
- heading reveal/fade;
- body/supporting copy masuk setelah heading dengan delay kecil;
- CTA/supporting elements mengikuti reading order;
- scroll section menggunakan subtle fade + vertical movement bila sesuai;
- animation duration/easing konsisten dengan `AGENTS.md`.

Hindari bounce, random rotation, per-letter gimmick, atau motion berbeda-beda hanya agar page terlihat ramai.

### Decorative background motion

Background boleh menggunakan:
- very slow light drift;
- soft parallax;
- subtle shadow shift;
- faint Rose line/path movement;
- restrained opacity/depth transition.

Jangan memakai object rain global, confetti, petal, sparkle shower, atau looping decorative animation yang mendominasi semua page.

### Pintu-specific motion

Tiga Pintu tetap khusus landing/core navigation dan **tidak perlu dicopy literal ke semua page**.

Page lain boleh mengambil bahasa motion-nya—threshold, opening light, depth, reveal—tanpa membuat tiga Pintu baru di setiap route.

Reduced motion wajib dihormati pada seluruh motion layer.

---

## Shared Component Direction

Saat implementation dimulai, audit existing components terlebih dahulu dan **Extend Over Replace**.

Targetnya adalah reusable visual primitives seperlunya, bukan membuat satu component besar yang memaksa semua page sama.

Candidate shared responsibilities dapat mencakup:
- public-page atmospheric background wrapper;
- light/dark architectural lighting layers;
- section reveal wrapper yang mengikuti reduced motion;
- shared editorial section shell/spacing;
- subtle Rose path/line decoration;
- optional depth/reflection treatment.

Nama/file/component final ditentukan setelah audit source saat coding. Dokumen ini tidak memerintahkan pembuatan component baru jika existing component dapat diperluas.

Shared visual components tidak boleh:
- mengambil alih business logic;
- mengubah route/API/data behavior;
- memaksa wedding assumptions;
- membuat page-specific content menjadi hard-coded global content.

---

## Image & Media

Gunakan real product imagery atau curated event imagery hanya bila mempunyai fungsi content.

Global background sebaiknya mengandalkan CSS/SVG/Motion architectural atmosphere agar:
- ringan;
- responsive;
- themeable;
- tidak terikat satu event category;
- mudah disederhanakan pada mobile.

Jika video digunakan, harus mempunyai purpose yang jelas, poster/fallback, lazy-loading strategy yang tepat, dan tidak boleh mengorbankan performance.

---

## Mobile

Mobile bukan desktop yang diperkecil.

Pada viewport kecil:
- kurangi decorative depth layers;
- prioritaskan contrast dan copy;
- sederhanakan reflection/parallax;
- hindari large offscreen media;
- pertahankan brand typography;
- pertahankan shared button behavior;
- motion tetap ringan;
- background tidak boleh membuat scrolling berat.

---

## Accessibility & Performance

- Respect `prefers-reduced-motion` / existing Motion reduced-motion handling.
- Decorative layers menggunakan pointer-events none.
- Text tetap readable tanpa background effect.
- Prefer transform/opacity animation.
- Jangan terus-menerus menganimasikan blur/filter berat.
- Lazy-load below-the-fold media.
- Jangan eager-load decorative assets dari page lain.
- Dark/light theme harus mempertahankan contrast.

---

## Documentation & Implementation Governance

Sebelum coding:
- baca `AGENTS.md`;
- baca canonical `prd.md`;
- baca `README.md`;
- baca recent `prd1.md`;
- audit relevant page/components;
- periksa current Next.js guidance sesuai `AGENTS.md`.

Jika direction ini disetujui menjadi requirement aktif:
- sinkronkan requirement yang relevan ke `prd.md`;
- update `AGENTS.md` hanya bila protected design/implementation rules memang berubah;
- update `README.md` hanya bila developer/operator architecture perlu didokumentasikan;
- jangan membuat generic agent prompt yang menduplikasi `AGENTS.md`; specialized agent instruction hanya dibuat jika benar-benar dibutuhkan dan narrowly scoped;
- setiap material coding change dicatat di `prd1.md` dengan rationale, affected files, commit, dan validation status;
- jangan claim build/CI PASS tanpa observed result.

---

## Approval Boundary

Dokumen ini hanya design/implementation planning.

Belum di-approve untuk:
- redesign source pages;
- mengganti shared components;
- mengubah background implementation;
- mengubah protected visual rules;
- mengubah product behavior.

Owner akan memberikan approval coding secara terpisah.
