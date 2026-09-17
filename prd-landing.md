# DC Organizer — Landing Page Redesign Draft

**Status:** Draft / Pending Owner Approval  
**Purpose:** Design direction untuk landing page DC Organizer sebelum implementation.  
**Canonical PRD:** `prd.md` tetap menjadi Single Source of Truth. Dokumen ini tidak aktif/canonical sampai owner menyetujui dan requirement relevan dipindahkan ke dokumen canonical sesuai governance repository.

> Tidak ada source-code landing page yang diubah oleh draft ini. Implementasi dilakukan kemudian saat owner sudah berada di PC dan memberikan approval eksplisit.

---

## 1. Design Intent

Landing DC Organizer harus terasa seperti **gerbang menuju momen yang akan diingat**, bukan landing wedding-only dan bukan generic SaaS dashboard.

Emotional direction:

**Different events. Different stories. Moments worth remembering.**

Visual harus tetap general-event sehingga cocok untuk wedding, birthday, anniversary, baby shower, corporate/private event, gathering, dan kategori lain yang berkembang.

Hindari visual AI-slop: hero foto wedding generik, dekorasi berlebihan, gradient pink besar, terlalu banyak glass card, floating icon acak, dan ornamental clutter.

---

## 2. Existing Elements That Must Be Preserved

Redesign memperluas existing landing, bukan menggantinya.

- `Pintu` tetap menjadi core landing-page navigation surface.
- Tiga product doors tetap merepresentasikan Event Planner, Digital Invitation, dan Guestbook.
- Existing copy/product switching yang mengikuti active door tetap dipertahankan secara konseptual.
- Primary desktop composition tetap mengikuti workspace 80vw.
- Brand wordmark tetap memakai canonical `BrandWordmark`.
- Typography aplikasi tetap:
  - Cinzel untuk heading/brand/editorial;
  - Fauna One untuk body/UI;
  - DM Mono untuk metadata/utility.
- Canonical Rose tetap `#C07A84`.
- Light mode tetap berakar pada white canvas; dark mode tetap near-black.
- Existing shared `Button` contract tetap berlaku.
- General-event positioning wajib dipertahankan.

---

## 3. Hero Direction — The Threshold

Hero mempertahankan komposisi utama:

```text
COPY / ACTIVE PRODUCT                 THREE PINTU
                                      Event Planner
                                      Digital Invitation
                                      Guestbook
```

Pintu adalah hero object utama. Background tidak boleh bersaing dengan Pintu menggunakan foto venue, foto wedding, atau gambar pintu tambahan.

### 3.1 Background language

Rose petals tidak menjadi bahasa visual utama untuk redesign ini karena terlalu mudah dibaca sebagai wedding/floral.

Background baru menggunakan **architectural memory atmosphere**:
- white / warm-white canvas pada light mode;
- near-black neutral canvas pada dark mode;
- sangat subtle architectural light/shadow;
- soft arch/window shadow;
- thin Rose line/arc yang terasa seperti trajectory/path;
- faint floor/reflection depth pada area Pintu bila sesuai;
- very subtle atmospheric grain/noise bila tidak mengganggu performance;
- sparse soft light particles hanya bila benar-benar diperlukan;
- tidak menggunakan literal flower/petal/confetti sebagai global brand background.

Rose tetap concentrated accent, bukan large page fill.

### 3.2 Door depth

Background boleh memberi spatial context pada Pintu melalui:
- soft grounding shadow;
- faint reflection;
- light beam atau arch shadow;
- depth haze di belakang Pintu.

Efek tersebut tidak boleh membuat Pintu terlihat seperti berada di wedding venue tertentu. Space harus terasa abstract/editorial dan category-neutral.

### 3.3 Motion

Background motion harus jauh lebih tenang daripada Pintu:
- slow light drift;
- subtle line/arc movement;
- very small opacity/parallax movement;
- tidak ada decorative object rain.

Pintu tetap motion focus utama.

Semua motion menghormati `prefers-reduced-motion` / `useReducedMotion()`.

---

## 4. Scroll Narrative

Landing tidak berhenti pada hero. Scroll ke bawah harus terasa seperti kamera mundur dan membuka ruang yang lebih luas, bukan kumpulan section card yang tidak berhubungan.

Target narrative:

```text
THRESHOLD
3 Pintu / choose the experience
        ↓
MEMORY
why the event matters
        ↓
JOURNEY
before → invitation → guest → event day
        ↓
CAPABILITIES
what DC actually handles
        ↓
EVENT TYPES
general-event proof
        ↓
FINAL THRESHOLD
create an event / enter DC
```

Setiap section dapat memiliki atmospheric background sendiri, tetapi semuanya harus terasa sebagai satu continuous environment.

---

## 5. Section Background Concepts

### 5.1 Hero — Threshold Room

Visual:
- bright white architectural space;
- soft large-window shadows;
- restrained Rose accents;
- three existing Pintu as foreground objects;
- subtle horizon/floor depth.

Makna: user berada di depan pilihan layanan DC.

### 5.2 Memory Section — Trace of a Moment

Saat scroll, camera terasa sedikit lebih jauh.

Background:
- open white space;
- large soft light patch;
- faint abstract frame outlines seperti jejak album/memory, bukan literal wedding polaroid;
- extremely subtle blurred shapes at edges;
- thin Rose timeline/path crossing the composition.

Section ini membawa emotional message bahwa acara berlangsung sesaat tetapi detail dan memorinya bertahan.

Tidak boleh bergantung pada foto couple/wedding agar tetap general-event.

### 5.3 Journey Section — One Continuous Path

Background berubah menjadi abstract spatial corridor/path.

Gunakan satu thin Rose line sebagai visual connector perjalanan:

```text
Plan ───── Invite ───── RSVP ───── Welcome ───── Remember
```

Line boleh bergerak secara sangat subtle mengikuti scroll. Content menjelaskan hubungan Event Planner, Digital Invitation, guest management, dan onsite Guestbook sebagai satu lifecycle.

Tidak membuat product cards berwarna-warni.

### 5.4 Capabilities Section — Quiet Gallery

Camera terasa lebih wide.

Background:
- mostly neutral;
- architectural panels/frames;
- light and shadow rhythm;
- capability content berada seperti editorial exhibits dalam space;
- Rose hanya pada icon/key emphasis.

Tujuannya menunjukkan feature depth tanpa berubah menjadi dashboard screenshot wall.

### 5.5 Event Types — Many Stories, One Platform

Background menjadi paling luas dan category-neutral.

Boleh menggunakan abstract image windows atau curated event imagery jika kemudian tersedia, tetapi:
- tidak ada satu category yang mendominasi;
- wedding tidak boleh menjadi universal visual;
- imagery harus mencakup variasi event;
- tanpa imagery pun layout harus tetap kuat.

### 5.6 Final CTA — Open Space / Horizon

Background kembali sederhana.

Visual:
- large negative space;
- soft horizon/light opening;
- satu restrained Rose arc/path yang selesai menuju CTA;
- optional distant abstract doorway/light threshold, tetapi bukan duplicate dari tiga product Pintu.

Ending harus terasa seperti invitation untuk memulai event, bukan hard-sell SaaS banner.

---

## 6. Continuous Background Principle

Desktop landing sebaiknya terasa sebagai **satu long visual canvas**.

Background antar-section tidak menggunakan hard rectangular color blocks kecuali diperlukan untuk contrast. Transisi dilakukan dengan:
- light intensity;
- shadow direction;
- spatial scale;
- subtle texture;
- Rose line/path;
- depth/haze.

Saat user scroll ke bawah, environment dapat terasa semakin zoomed-out/open. Ini memberi ruang untuk content lebih banyak tanpa membuat page sesak.

Mobile boleh menyederhanakan atmospheric layers secara agresif untuk readability dan performance.

---

## 7. Image / Video Policy

Hero tidak membutuhkan full-screen stock event video.

Jika media digunakan:
- gunakan sebagai secondary editorial evidence, bukan page-wide wallpaper;
- hindari wedding-only footage pada general landing;
- prioritaskan optimized still/WebP/AVIF untuk decorative imagery;
- video hanya bila mempunyai narrative purpose dan harus memiliki poster/fallback;
- background media tidak boleh mengganggu Core Web Vitals, text contrast, Pintu interaction, atau mobile data usage.

Pure CSS/SVG/Motion architectural atmosphere lebih disukai untuk global background karena scalable, themeable, dan tidak mengikat brand ke satu event category.

---

## 8. Dark Mode

Dark mode bukan sekadar invert light mode.

Target:
- near-black `#0B0B0C` canvas;
- white primary copy;
- Rose accent tetap `#C07A84`;
- architectural light menjadi faint Rose/white edge light;
- floor/reflection lebih restrained;
- tidak memakai giant pink glow.

Pintu harus tetap menjadi focal object.

---

## 9. Accessibility & Performance

- Respect reduced motion.
- Decorative background tidak boleh menangkap pointer events.
- Contrast text harus tetap memenuhi readability.
- Background tidak boleh menjadi syarat untuk memahami content.
- Prefer transform/opacity animation.
- Avoid heavy continuous blur/filter animation.
- Decorative layers harus dapat dikurangi pada mobile.
- Public landing tidak boleh mengunduh media besar yang tidak terlihat/needed.
- Lazy-load below-the-fold visual media bila applicable.

---

## 10. Implementation Guardrails

Saat coding nanti:

- baca `AGENTS.md`, `prd.md`, `README.md`, `prd1.md`, lalu relevant landing files sebelum perubahan;
- Extend Over Replace;
- jangan menghapus Pintu;
- jangan mengganti brand typography;
- jangan mengganti canonical Rose;
- jangan membuat button primitive baru;
- jangan membuat wedding-only copy/visual assumption;
- jangan mengubah backend/product behavior hanya untuk redesign;
- gunakan existing Motion stack dan reduced-motion behavior;
- gunakan Lucide bila icon diperlukan;
- pertahankan 80vw desktop composition;
- hindari dependency baru kecuali benar-benar diperlukan.

Karena `AGENTS.md` saat ini secara eksplisit melindungi rose-petal implementation, penghapusan/perubahan petal pada coding phase hanya boleh dilakukan setelah requirement redesign ini disetujui owner dan documentation governance diselaraskan.

---

## 11. Documentation Plan Before Implementation

Sebelum coding redesign dimulai, owner akan menentukan bagian mana dari draft ini yang disetujui.

Setelah approval:
1. requirement aktif yang relevan harus diselaraskan ke `prd.md` sebagai canonical product requirement;
2. `AGENTS.md` harus diperbarui bila protected petal/background rule berubah;
3. `README.md` diperbarui hanya untuk architecture/setup/behavior yang memang perlu diketahui developer/operator;
4. implementation dilakukan;
5. setiap material implementation change dicatat secara kronologis di `prd1.md` beserta rationale, affected files, commit, dan validation status.

Dokumen draft ini tidak boleh diam-diam menjadi PRD kedua yang mengalahkan `prd.md`.

---

## 12. Approval Boundary

Belum di-approve untuk coding.

Yang sudah boleh dilakukan pada tahap ini:
- eksplorasi visual;
- mockup/image generation;
- refinement design direction;
- penyusunan requirement draft.

Source landing page, background, Pintu, navbar, dan application behavior tetap tidak diubah sampai owner memberikan approval eksplisit untuk implementation.
