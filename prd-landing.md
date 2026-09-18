# DC Organizer — Landing Page Redesign Draft

**Status:** Approved Visual Direction / Implementation Active  
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

## 4. Single-Screen Composition — Owner Override

Landing root `/` **tidak menggunakan long-scroll narrative**. Owner meminta satu page utuh; semua content utama selesai dalam viewport yang sama setelah navbar.

Target composition:

```text
COPY / ACTIVE PRODUCT                 THREE PINTU
service switch                        architectural threshold
headline + short body                 Event Planner
CTA + restrained support              Digital Invitation
                                      Guestbook
```

Canonical behavior:
- tidak ada section Memory, Journey, Capabilities, Event Types, atau Final CTA di bawah hero;
- tidak membuat stacked marketing cards yang memaksa user scroll;
- Pintu tetap focal object utama;
- active product copy berubah mengikuti Pintu;
- supporting capability/proof boleh tetap muncul secara ringkas hanya bila viewport cukup;
- mobile boleh menyederhanakan copy/details agar satu-screen tetap usable.

---

## 5. Landing Background — Architectural Threshold

Landing memakai satu continuous background karena hanya terdiri dari satu viewport.

Visual:
- white / warm-white neutral canvas pada Light Mode;
- near-black neutral canvas pada Dark Mode;
- soft large-window / arch shadow;
- restrained Rose edge light / thin path;
- subtle horizon dan floor/reflection depth di area Pintu;
- tidak ada hard section block karena tidak ada below-the-fold sections;
- tidak memakai wedding venue photo, literal flower scene, atau giant pink glow.

Implementation boundary:
- gunakan landing-specific atmosphere layer;
- protected `components/Layout/background.tsx` tidak perlu diubah untuk implementasi awal ini;
- Rose petals pada public pages lain tetap mengikuti existing protected implementation.

---

## 6. Responsive Single-Screen Principle

Desktop:
- primary composition tetap 80vw;
- copy + Pintu berbagi satu viewport;
- Pintu boleh sedikit overlap ke area copy secara intentional;
- footer landing tetap ringan dan tidak menciptakan section baru.

Mobile:
- orbit Pintu dipadatkan;
- detail card dapat disederhanakan;
- copy diturunkan skalanya dan supporting content yang tidak essential boleh disembunyikan;
- jangan mengubah mobile menjadi long-scroll substitute.

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
1. requirement aktif yang relevan diselaraskan ke `prd.md` sebagai canonical product requirement;
2. `AGENTS.md` diperbarui untuk convention yang harus dipertahankan agent;
3. `README.md` diperbarui hanya untuk architecture/setup/behavior yang memang perlu diketahui developer/operator;
4. implementation dilakukan dengan Extend Over Replace;
5. setiap material implementation change dicatat di Appendix A `prd.md`; `prd-tambahan.md` hanya supplemental log saat owner meminta.

Dokumen draft ini tidak boleh diam-diam menjadi PRD kedua yang mengalahkan `prd.md`.

---

## 12. Approval Boundary

Owner telah memberikan approval eksplisit untuk mulai coding arah visual ini pada 18 September 2026.

Approved untuk implementation:
- architectural landing atmosphere;
- Rose-led Light/Dark treatment;
- Pintu animation refinement;
- restrained text motion;
- single-screen landing composition.

Owner override terbaru menghapus rencana long-scroll sections. Root landing harus tetap satu viewport.

---

## 13. Approved Visual Direction Notes — Pink-Led Dark Mode & Motion

Owner menyukai arah visual mockup dark mode dengan architectural space, tetapi **Rose/pink DC harus lebih dominan daripada gold/champagne**.

Dark-mode visual language:
- base tetap near-black `#0B0B0C` / dark neutral;
- light yang masuk dari jendela, arch, atau doorway menggunakan white-to-Rose / dusty-pink illumination;
- highlight/reflection pada floor dan edge Pintu boleh terasa luminous, tetapi hue utama tetap Rose family;
- hindari gold, amber, bronze, atau champagne sebagai secondary brand palette;
- warm neutral hanya boleh muncul sebagai konsekuensi natural lighting yang sangat kecil, bukan warna identitas;
- Pintu, architectural edge light, reflection, dan atmospheric accents harus terasa satu keluarga dengan `#C07A84`;
- jangan mengubah page menjadi full pink background atau giant pink glow. Dark neutral tetap canvas utama.

### Pintu animation is required

Pintu bukan static decoration. Motion Pintu adalah bagian penting dari identity landing:
- existing three-door motion/navigation concept harus dipertahankan dan boleh diperhalus;
- movement harus terasa smooth, premium, dan intentional;
- active/front door harus mempunyai hierarchy yang jelas;
- interaction boleh memberi subtle depth, light response, opening/threshold cue, atau reflection response bila tidak mengganggu navigation;
- motion tidak boleh berubah menjadi gimmick atau membuat user sulit memilih layanan;
- reduced-motion mode wajib mempunyai versi yang tenang dan usable.

### Text animation is required

Landing harus memiliki restrained text entrance/reveal pada setiap major page section:
- heading, supporting copy, CTA, dan supporting editorial content boleh masuk dengan fade/reveal/soft vertical movement;
- gunakan timing dan easing yang konsisten dengan DC motion rules;
- hindari word-by-word rainbow effects, kinetic typography berlebihan, bouncing text, random rotation, atau animation berbeda untuk setiap kalimat;
- text animation harus mendukung reading order, bukan menjadi pusat perhatian;
- scroll reveal hanya dijalankan ketika relevan dan mengikuti reduced-motion preference.

### Anti AI-slop composition

Visual/content treatment harus terasa editorial dan manusiawi:
- jangan memberi nomor dekoratif pada section, feature, card, atau heading;
- jangan membuat setiap heading memiliki satu kata italic/berwarna hanya demi variasi;
- jangan mencampur terlalu banyak text styles dalam satu block;
- Rose dipakai untuk meaningful emphasis, bukan mewarnai kata secara acak;
- italic hanya digunakan bila memang mempunyai alasan editorial/content, bukan default visual trick;
- hierarchy terutama dibangun dari Cinzel/Fauna/DM Mono, ukuran, spacing, opacity, alignment, dan composition;
- jangan meniru copy, statistik, testimonial, atau event category palsu yang muncul pada generated visual reference.

Generated images yang dipakai dalam diskusi adalah **visual-direction reference**, bukan pixel-perfect specification dan bukan source of truth untuk copy/product data.
