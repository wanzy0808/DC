# DC Organizer — Landing Implementation Progress

**Status:** Active implementation tracker  
**Date:** 18 September 2026  
**Scope:** Root landing page `/` only  
**Canonical requirements:** `prd.md` + approved visual direction in `prd-landing.md`

> File ini adalah tracker pengerjaan bertahap yang diminta owner. File ini **bukan PRD kedua** dan tidak boleh mengoverride `prd.md`. Tujuannya supaya perubahan kecil, gap visual, dan next step tidak hilang dari satu sesi ke sesi berikutnya.

---

## Target Visual

Landing diarahkan sedekat mungkin dengan visual reference yang sudah dibuat/disetujui:

- satu viewport utuh, tanpa long-scroll marketing sections;
- komposisi editorial kiri + architectural room kanan;
- tiga portal/pintu selalu terlihat;
- portal tengah sedikit lebih dominan secara proporsi;
- white architectural room pada Light Mode;
- near-black architectural room pada Dark Mode;
- Rose `#C07A84` menjadi illumination/accent utama;
- jendela/arch, floor depth, reflection, wall moulding, dan light beam memberi rasa ruang;
- navbar, copy, CTA, selector, dan Pintu tetap elemen web asli;
- tidak boleh menyelesaikan landing dengan satu screenshot/full-page image yang ditempel;
- portal tetap interaktif dan membuka menggunakan Motion;
- ID/EN, Light/Dark, reduced motion, dan responsive behavior tetap aktif.

---

## Stage 1 — Structural Rebuild

**Status: implemented + Build Validation PASS**

Perubahan:

- menambahkan `components/Layout/LandingRoomScene.tsx`;
- background landing sekarang berupa architectural scene berbasis SVG/CSS, bukan sekadar garis arch tipis;
- scene memiliki editorial wall, tall window, monumental arch, wall moulding, window-light beam, floor perspective, Rose glow, dan reflection zone;
- navbar root landing diposisikan di atas scene agar terlihat sebagai satu komposisi;
- root landing memenuhi `100dvh` dan tetap single-screen;
- desktop composition menjadi sekitar 37% editorial copy / 63% portal room;
- Pintu orbit/carousel dihapus dari landing;
- tiga Pintu sekarang statis dan selalu terlihat seperti visual reference;
- Digital Invitation tetap sedikit lebih tinggi/besar sebagai central portal;
- active portal membuka menggunakan dua panel Motion;
- portal memakai existing service imagery sebagai interior, bukan sebagai fullscreen background;
- service selector kiri tetap mengubah active copy dan active portal;
- Light/Dark tetap memakai shared ThemeProvider;
- Pintu tetap real links ke Event Planner, Digital Invitation, dan Guestbook.

### Kenapa tahap ini dulu

Perbedaan terbesar antara landing lama dan visual reference bukan warna atau glow, tetapi **spatial composition**. Selama Pintu masih carousel/orbit di atas background kosong, hasil tidak akan terasa seperti reference walaupun background dihias.

---

## Current Visual Gap

Belum dianggap final.

Yang masih membedakan web dari visual reference:

- room masih berupa vector architectural scene, belum mempunyai organic decorative depth seperti bunga/plant/soft furnishing pada reference;
- interior masing-masing portal masih menggunakan existing product images dan belum diarahkan khusus agar menyatu tone-nya dengan ruang;
- floor reflection masih atmospheric, belum benar-benar merefleksikan portal;
- window/city depth belum sekompleks reference;
- framing portal masih perlu polish pada material/glass/metal edge;
- mobile belum menjalani visual pass berdasarkan browser screenshot nyata;
- final spacing/scale perlu diperiksa pada viewport desktop nyata setelah CI/build.

---

## Stage 2 — Room & Portal Realism

**NEXT**

Prioritas berikut:

- refine architectural room supaya tidak terasa seperti vector backdrop;
- tambah restrained decorative depth yang category-neutral;
- tambah side foliage / floral-like abstract branches secara sangat ringan tanpa menjadikan landing wedding-only;
- refine arch material, glass, inner shadow, Rose edge light;
- buat floor reflection portal lebih convincing;
- samakan tone existing `wo.png`, `hp-digital.png`, `bukutamu.png` supaya tiga portal terlihat satu dunia;
- perbaiki inactive portal supaya tetap mewah tetapi active portal jelas menjadi focal point;
- cek apakah scene perlu dedicated generated decorative asset sebagai **secondary layer**, bukan sebagai flattened UI screenshot.

---

## Stage 3 — Motion & Interaction Polish

Setelah bentuk visual Stage 2 benar:

- subtle light response ketika active service berubah;
- portal opening timing refinement;
- very restrained room parallax/light drift;
- text transition disinkronkan dengan portal;
- floor glow/reflection merespons portal aktif;
- memastikan hover tidak menyebabkan accidental navigation atau layout jump;
- reduced-motion tetap memiliki versi tenang.

---

## Stage 4 — Responsive & Browser Visual Pass

- desktop: 1440p dan wide desktop;
- laptop: sekitar 1366×768;
- tablet;
- mobile portrait;
- Light Mode + Dark Mode;
- ID + EN;
- check footer tidak menambah unwanted scroll;
- check navbar/room alignment;
- check three portals tidak terpotong;
- check no horizontal scroll;
- compare browser screenshot langsung dengan visual reference lalu tune spacing/scale.

---

## Locked Decisions

Jangan diubah tanpa instruksi owner:

- root landing hanya satu page / satu viewport;
- tidak ada Memory/Journey/Capabilities/Event Types sections di bawah hero;
- Pintu tetap core navigation;
- tiga portal harus terlihat sebagai bagian dari architectural room;
- Light/Dark keduanya Rose-led;
- no gold/champagne identity;
- brand/font/button contracts tetap mengikuti repository rules;
- protected Rose petals pada halaman publik lain tidak disentuh;
- hindari AI-slop copy/decorative numbering/random text styling.

---

## Work Log

### 18 September 2026 — Stage 1
- started reference-driven landing rebuild;
- replaced carousel/orbit composition with fixed three-portal composition;
- added architectural room scene;
- integrated navbar visually into scene;
- retained real web controls, routes, language/theme behavior, and Motion portal opening;
- Build Validation #1053 failed because a literal `\\n` escape was accidentally committed in `PintuSection.tsx`;
- source was corrected and verified;
- Build Validation #1054: **PASS** for dependency install, Prisma Client generation, and Next.js production build + TypeScript;
- browser visual verification is still pending;
- next focus: Stage 2 room/portal realism.
