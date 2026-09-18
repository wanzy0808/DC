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

Setelah Stage 2, gap utama yang tersisa:

- scene web sudah memiliki room/depth/material treatment, tetapi belum divalidasi berdampingan dengan screenshot browser nyata terhadap visual reference;
- realism tetap sengaja berbasis web/SVG/CSS sehingga tidak meniru detail photoreal random dari generated image secara pixel-perfect;
- organic decoration dibuat restrained dan category-neutral, sehingga kepadatan visual memang lebih rendah daripada reference image;
- mobile/tablet belum memiliki dedicated visual composition pass;
- laptop 1366×768 belum dicek untuk clipping dan hierarchy;
- final portal/copy scale, footer clearance, dan navbar alignment masih perlu browser screenshot verification;
- setelah responsive pass baru bisa dinilai apakah secondary decorative asset benar-benar diperlukan.

---

## Stage 2 — Room & Portal Realism

**Status: implemented + Build Validation PASS**

Implemented:

- architectural room diperdalam dengan distant city silhouette, moulding berlapis, cast-window light, dan richer arch depth;
- floor sekarang memiliki perspective grid yang lebih halus, marble-like vein, specular wash, dan portal reflection silhouettes;
- ditambah restrained lounge silhouette, sculptural pedestal, serta abstract botanical branches di tepi scene supaya ruang tidak terasa vector kosong;
- decorative depth tetap category-neutral dan tidak memakai wedding-specific props;
- portal frame dibuat berlapis seperti Rose metal + glass: outer ring, inner bevel, specular vertical edge, glass veil, luminous sill, dan richer active shadow;
- panel Pintu sekarang terasa seperti translucent Rose glass dan tetap membuka dengan Motion;
- tone tiga existing product images disatukan menggunakan shared Rose light/wash, saturation/contrast treatment, dan glass overlay;
- inactive portal tetap visible/elegan tetapi active portal memiliki edge light, floor glow, reflection, dan brighter interior focus;
- active service sekarang memindahkan subtle floor light di room scene;
- dedicated generated full-scene asset belum dipakai; implementation tetap real web layers agar interaction/theme lebih fleksibel.

---

## Stage 3 — Motion & Interaction Polish

**Status: implemented on feature branch; validation pending**

Implemented:

- service selector memakai shared moving Rose active surface agar perpindahan state terasa kontinu;
- active copy memakai satu timing family: eyebrow → heading → body → supporting statement;
- text transition tetap restrained, tanpa word-by-word effect, bounce, random rotation, atau kinetic typography;
- portal panel opening timing dipadatkan dan diberi small active delay agar mengikuti perubahan selection, bukan mendahuluinya;
- portal content/luminous sill menyusul opening dengan delay kecil;
- environmental floor glow dan vertical Rose light bergerak ke portal aktif dengan easing yang sama;
- ambient room drift diperlambat agar background tetap lebih tenang daripada Pintu;
- hover/focus hanya mengubah active portal; navigation tetap terjadi melalui click/link normal;
- reduced-motion memotong hampir seluruh delay dan memakai transition sangat pendek.

---

## Stage 4 — Responsive & Browser Visual Pass

**NEXT**

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

### 18 September 2026 — Stage 2
- deepened the room with city/window depth, moulding, marble treatment, foreground lounge/pedestal, and restrained botanical silhouettes;
- rebuilt portal material treatment with layered Rose metal/glass framing, specular edges, richer glass doors, luminous threshold, and physical-looking floor reflection;
- unified the three existing portal images with one shared Rose-lit treatment;
- active portal now drives subtle floor light position inside the room;
- no new dependency added; implementation remains Tailwind + SVG/CSS + Motion + existing theme stack;
- Build Validation #1058: **PASS** for dependency install, Prisma Client generation, and Next.js production build + TypeScript;
- browser visual verification: pending;
- next focus: Stage 3 motion synchronization and interaction polish.


### 18 September 2026 — Stage 3
- synchronized selector, content reveal, portal opening, and environmental light timing;
- added shared-layout active service indicator;
- kept motion transform/opacity based and reduced-motion safe;
- ambient room drift remains slower than portal interaction;
- Build/TypeScript/CI: pending;
- browser visual verification: pending;
- next focus after validation: Stage 4 responsive/browser visual pass.
