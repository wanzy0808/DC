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
- default navigation button tetap transparent/netral dengan teks/icon putih;
- hover navigation memakai Rose `#C07A84` dengan teks/icon putih;
- active navigation memakai Deep Rose `#A65E69` dengan teks/icon putih;
- behavior ini menjadi kebalikan visual Light Mode: canvas gelap + copy putih, sedangkan Rose hanya muncul saat hover/active;
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
- ID/EN idle menggunakan near-black/transparent background + white copy; selected locale memakai neutral white emphasis, bukan pink opacity/fill;
- account trigger, avatar, dan dropdown item idle menggunakan near-black background + white copy;
- ID/EN dan account controls baru memakai Rose saat hover/interaction;
- control transparan tidak boleh mewarisi black text atau idle Rose fill dari canonical filled Rose button bila background header near-black.

### Affected files

- `app/dashboard/page.tsx`
- `app/globals.css`
- `AGENTS.md`
- `README.md`
- `prd.md`
- `prd-tambahan.md`

### Validation

- GitHub Actions Build Validation #1025: **PASS** on application source head `bc26869ebfa8454d294f412479445f25d949224b`.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.


### Follow-up — Dark Header Utilities

Owner meminta menghapus sisa Rose opacity/fill pada ID/EN dan account menu saat idle di Dark Mode. Implementasi mengikuti neutral-first rule: black/near-black + white copy saat idle, Rose + white copy hanya saat hover.

Validation: GitHub Actions Build Validation #1030 **PASS** pada application source head `0af685723e2178d52c735a8890026d5ce87d90ff` (dependency install, Prisma Client generation, Next.js production build + TypeScript). Database migration: N/A. Follow-up commit ini hanya memperbarui dokumentasi validation.


---

## Follow-up — Unified Header Control Family

Owner meminta Light/Dark Dashboard tidak lagi memiliki style terpisah untuk burger, theme toggle, ID/EN, dan account trigger.

Canonical delta:
- keempat control memakai satu shape/radius/height/border family;
- Light idle: white/neutral + Rose foreground/border;
- Dark idle: near-black + white foreground;
- hover kedua theme: Rose + white;
- active locale: border/underline emphasis, bukan filled style sendiri;
- perubahan hanya untuk Dashboard header; public navbar behavior existing dipertahankan.

Validation: GitHub Actions Build Validation #1033 **PASS** pada application source head `872b7a4d4e493ab279ae05bfea129bc1ef5d51dd` (dependency install, Prisma Client generation, Next.js production build + TypeScript). Database migration: N/A.


---

## Follow-up — Dashboard Header Uses Landing Navbar Style

Owner meminta Dashboard header mengikuti navbar landing secara langsung.

Delta:
- tidak ada lagi Dashboard-only header-control visual override;
- ThemeToggle dan ID/EN menggunakan behavior/style shared yang sama seperti navbar landing;
- burger Dashboard mengikuti class/treatment burger landing;
- tombol user mengikuti visual language navbar landing (transparent, restrained border/accent, subtle hover);
- navbar landing tidak diubah.

Validation: GitHub Actions Build Validation #1036 **PASS** pada application source head `ade7de7accb38ae4ab55d83df7662109bafca6ff` (dependency install, Prisma Client generation, Next.js production build + TypeScript). Database migration: N/A.


---

## Dashboard Microcopy — Anti-Repetition Cleanup

Owner meminta copy Dashboard dibersihkan dari pengulangan istilah yang terasa seperti AI-slop, terutama `workspace`, `acara`, dan `undangan` ketika konteks halaman sebenarnya sudah jelas.

Delta:
- `Workspace` tidak lagi dipakai sebagai generic decorative eyebrow/filler;
- eyebrow menggunakan konteks fungsi seperti **Persiapan**, **Publikasi**, **Distribusi**, **Kehadiran**, **Tamu**, dan **Hari-H**;
- Beranda tidak lagi menampilkan card jumlah acara di header karena informasinya sudah ada pada metric grid;
- label yang konteksnya sudah jelas dipendekkan, misalnya **Total**, **Terbaru**, **Lihat semua**, **Detail**, dan **Daftar**;
- deskripsi tidak mengulang kata `acara`/`workspace` bila page, selector, atau title sudah memberi konteks;
- aturan utama: **hapus copy redundan lebih dulu; jangan sekadar mengganti dengan sinonim**;
- istilah produk tetap dipertahankan bila dibutuhkan untuk menjelaskan scope, status, atau next action;
- pola ini dicatat ke `AGENTS.md` agar koreksi kecil owner menjadi convention untuk perubahan berikutnya, bukan instruksi sekali pakai.

Affected area:
- Beranda;
- Rangkaian Acara;
- Undangan Digital;
- Personal Invitation;
- WA Blast;
- RSVP;
- Manajemen Tamu;
- Feature Gate;
- Usher;
- shared dashboard i18n.

Validation:
- GitHub Actions Build Validation #1043 pada application source head `22b5c929b59acaf68ae66ddacc28fc69e7b81658`: **PASS**.
- Dependency install: **PASS**.
- Prisma Client generation: **PASS**.
- Next.js production build + TypeScript: **PASS**.
- Database migration: N/A.
- Commit dokumentasi setelah validation tidak mengubah application source yang divalidasi.


---

## 19 September 2026 — Landing Chrome & Dark Utility Repair

Owner meminta repair kecil agar chrome landing tidak terlihat sebagai kotak warna terpisah.

Delta:
- header landing mengikuti `var(--background)` yang sama dengan body/canvas landing;
- compact footer landing mengikuti `var(--background)` yang sama dengan body/canvas landing;
- Dark Mode landing: locale ID/EN yang aktif memakai Rose opaque, bukan white/translucent fill;
- Dark Mode landing: theme toggle memakai Rose opaque dengan icon/text near-black;
- override dibatasi pada navbar landing agar behavior Dashboard/shared control tidak ikut berubah.

Affected files:
- `components/Layout/Navbar/Navbar.tsx`;
- `components/Layout/Footer.tsx`;
- `components/I18n/LanguageToggle.tsx`;
- `components/Theme/ThemeToggle.tsx`;
- `app/globals.css`;
- `AGENTS.md`;
- `prd.md`.

Validation: pending GitHub Actions observation.


---

## 19 September 2026 — Pintu Ornament Open-State Repair

Owner meminta ornamen/bunga di bagian atas Pintu tidak tetap terlihat ketika Pintu sedang terbuka.

Delta:
- ornamen atas mengikuti state `isActive` yang sama dengan panel Pintu;
- ketika Pintu terbuka, ornamen fade out sambil bergerak sedikit ke atas;
- ketika Pintu kembali tertutup, ornamen muncul kembali;
- reduced-motion tetap memakai transisi singkat tanpa movement tambahan.

Affected files:
- `components/Landing/Pintu/PintuCard.tsx`;
- `AGENTS.md`;
- `prd.md`.

Validation: pending GitHub Actions observation.


---

## 19 September 2026 — Temporary Landing Clone `/jiplak`

Owner meminta salinan landing yang bisa diubah tanpa menyentuh landing utama.

Delta:
- `app/jiplak/jiplak.tsx` berisi copy landing saat ini;
- `app/jiplak/page.tsx` membuka clone pada `http://localhost:3000/jiplak`;
- header/footer/background/layout shared memperlakukan `/jiplak` sama seperti landing utama;
- `app/page.tsx` tetap tidak berubah;
- route ini bersifat sementara dan boleh dihapus setelah eksperimen selesai.

Validation: pending GitHub Actions observation.


---

## 19 September 2026 — Eksperimen Pintu 3D & Background Baru di `/jiplak`

Eksperimen ini sengaja terisolasi agar landing utama tidak terganggu.

Delta:
- `PintuSecBaru.tsx` dibuat sebagai komponen Pintu alternatif dengan perspective/depth/frame tebal, shadow, light spill, dan daun pintu `rotateY` seperti engsel;
- `JiplakSweetBackground.tsx` mengganti rose-petal drop khusus `/jiplak` dengan soft Rose ambience, bokeh, light beam, dan botanical line-art;
- `jiplak.tsx` memakai komponen baru tersebut;
- `app/page.tsx`, Pintu canonical, dan `RosePetalBackground.tsx` tidak disentuh;
- Three.js belum dipasang; visual 3D pertama diuji memakai CSS 3D + Motion existing.

Validation: pending GitHub Actions observation.


---

## 19 September 2026 — Jiplak Dream Portals V2

Pass pertama terlalu terasa seperti card UI. V2 mengubahnya menjadi cinematic dream-world composition khusus `/jiplak`.

Delta:
- portal aktif besar di tengah scene, dua portal alternatif berada lebih dalam di kiri/kanan;
- frame, daun pintu, shadow, depth, halo, dan light path dibuat sebagai satu objek portal, bukan card terpisah;
- background menjadi dreamy Rose world dengan veil, glow, ring, dust, horizon, dan botanical silhouette abstrak;
- ambience berubah mengikuti dunia aktif;
- copy kiri direcompose agar tidak hilang/kosong dan tetap menjadi bagian hero;
- landing canonical tetap tidak disentuh.

Validation: pending GitHub Actions observation.


---

## 19 September 2026 — Jiplak Asset Dream World V3

Delta:
- scene `/jiplak` sekarang memakai generated image assets sebagai visual utama, bukan garis abstrak;
- crest image menggantikan topper/tanduk generik di atas portal;
- botanical ornament dan dreamy mist image dipakai sebagai ambience background;
- Motion dipakai untuk portal transition, parallax, floating assets, door opening, glow, dan reveal;
- rose petals existing tetap dipakai sebagai layer ambient tambahan;
- landing utama tetap tidak disentuh.

Validation: pending GitHub Actions observation.


Follow-up:
- header/footer `/jiplak` transparan agar menyatu dengan dreamy scene;
- asset aktual memakai `tiara.png` dan `flower.png`;
- `cloud.png` terdeteksi identik dengan `tiara.png` pada remote, jadi belum dipakai sebagai mist background; rose-petal layer tetap aktif.


---

## 20 September 2026 — Perbaikan warning gambar landing

Perubahan teknis saja: `Image fill` di Pintu utama, portal `/jiplak`, dan bunga diberi containing block `relative` yang eksplisit; gambar yang terlihat di layar pertama memakai eager loading dan active Pintu berprioritas tinggi. Tidak ada perubahan desain, animasi, copy, asset, header/footer, maupun rose petals. Validasi build dan hilangnya warning di browser masih menunggu pengujian.


---

## 20 September 2026 — Salinan Pintu landing untuk `/jiplak`

Pintu utama dicopy sebagai dua file independen: `app/jiplak/PintuSectionJiplak.tsx` dan `app/jiplak/PintuCardJiplak.tsx`. Section copy hanya memakai card copy, bukan import komponen Pintu canonical. `jiplak.tsx` memakai section baru dan kontrak active-door yang sama. Desain/background eksperimen lainnya dipertahankan; file landing `/` dan Pintu aslinya tidak disentuh.

Validation: pending GitHub Actions & local visual check.


---

## 20 September 2026 — Dreamy Three.js Pintu khusus `/jiplak`

Eksperimen baru memakai Three.js langsung melalui lazy client import. Tiga pintu sekarang berupa mesh 3D dengan frame melengkung, ketebalan, engsel, material Rose, lantai, shadow, dunia foto di balik daun pintu, cahaya keluar dari portal, partikel, parallax dan transisi antar-dunia. Salinan `PintuSectionJiplak`/`PintuCardJiplak` tetap ada sebagai fallback WebGL2, bukan diganti dengan import komponen landing utama. Bunga, pink glow, rose petals, copy, navbar/footer `/jiplak`, dan navigasi layanan tetap. Landing utama `/` tidak disentuh.

Validation: GitHub Actions Build Validation run `35480379163` **PASS** on application source head `341e25b0a88e08c85de8fe1ee7ef13e4c4b9b915` (dependencies, Prisma Client, production build). Visual/GPU testing at localhost: **pending**.


---

## 20 September 2026 — Revisi Pintu Three.js di `/jiplak`

Revisi hanya eksperimen: kembalikan orbital Motion tiga pintu seperti landing (10 detik, hover pause/resume), perbaiki rasio foto dengan cover crop, ganti plastik glossy menjadi panel kayu/arsitektur matte dalam palet Rose canonical, rapikan engsel dan frame. Shadow lantai dipertahankan; pink halo, light spill dan background radial glow dihapus sementara. Bunga, rose petals, route dan landing utama tetap. Validation: GitHub Build Validation run `35480935118` **PASS** on source head `e6816880e20c3fbefdb9ab582838105b8ac803b8` (dependencies, Prisma generation, production build + TypeScript); actual WebGL appearance and orbital interaction in localhost: **pending visual review**.


## 23 September 2026 — Dashboard navigation & functional-first UI

- Sidebar customer uses the existing neutral Light/Dark canvas and Rose brand, with curved outside corners on hover/active inspired by the owner-provided reference. This is a shape reference only: do not copy its blue colors, branding, or content.
- Shared sidebar navigation styling applies to all tabs within the customer dashboard; mobile and desktop use the same rail. Keep existing navigation, access rules, keyboard focus, and ID/EN controls.
- Remove decorative labels and repeated introduction text where the screen already communicates the context; prioritize actual actions and real counts/charts. Graphs must be based on real product data, never invented sample numbers.
- This commit updates the common sidebar shell; remaining workspace/page content needs a separate per-page audit and runtime visual check. Do not mark the entire dashboard as fully redesigned or validated.


## 23 September 2026 — Customer dashboard redesign implementation

Owner permits redesign of the **customer dashboard only**, retaining DC Organizer's visual language and the supplied sidebar geometry inspiration rather than its blue palette. `Dashboard-redesign.md` records the staged plan and current progress. Current implementation replaces the competing sidebar patches with one shared desktop/mobile navigation component, separates the expanded Acara parent from the actual active child, uses separated Rose hover/active corner states, and provides a closeable mobile backdrop. Common page/surface/metric primitives now use the same styling across workspaces. Beranda keeps its genuine RSVP/publication visualization and event data while removing redundant copy. The first copy cleanup covers Rangkaian Acara, Undangan Digital, Personal Invitation, WA Blast, RSVP, Manajemen Tamu and Usher. Future passes must retain every actual action, auth/entitlement behavior and real data source. **Validation: production build and browser visual checks pending; remaining detailed per-page audit not marked complete.**


## 23 September 2026 — Revisi dashboard dari screenshot owner (menggantikan aturan rail netral)

Owner meminta Rose lebih kuat, sidebar tidak terasa terpisah dan konten lebih fungsional. Aturan sebelumnya yang melarang full-Rose rail menjadi catatan historis, **bukan** baseline aktif. Implementasi baru di customer dashboard: rail dan blok logo Rose dengan label/icon putih; dark rail Deep Rose; hover dan active memakai shade berbeda; lengkungan luar muncul **hanya** pada menu aktif dengan jeda antarmenu yang mencegah tumpang-tindih. Header memakai kontrol visual sekeluarga dengan navbar landing tanpa mengubah landing; canvas Light Mode #fff5f7 dengan card putih dan outline Rose; Dark Mode canvas near-black Rose-tinted dengan card netral. Beranda: hero Rose dengan Tambah acara, empat metrik faktual, daftar acara dan tindakan yang ringkas (tidak ada tabel putih kosong memanjang), serta ringkasan RSVP dan publikasi dari data aktual. Panel dashboard lain mengikuti primitive bersama. CTA putih di hero adalah pengecualian kontras lokal; Button aplikasi lain tetap canonical. Status: sumber sudah di-commit; visual QA di browser dan audit detail tiap workspace belum selesai, dicatat di `Dashboard-redesign.md`.


## 23 September 2026 — Dashboard redesign: tahap halaman operasional

Rangkaian Acara dan Undangan Digital kini menggunakan kartu daftar responsif, bukan tabel minimal 760–780 px yang membuat layar HP scroll horizontal. Setiap kartu mempertahankan data dan aksi asli (edit/hapus/Studio/publikasi/pembelian/tautan publik sesuai status), dengan status dan jumlah dibuka dari API, tanpa data ilustrasi. Tambah acara diletakkan di header halaman, bukan diulang dalam empty state. Pada WA Blast, tombol pembelian kuota hanya muncul sekali pada konteks yang sesuai. Label statistik Personal Invitation yang mengulang judul halaman diganti Total. Detail fungsi RSVP, Manajemen Tamu, Usher, WA Blast dan Personal Invitation masih perlu audit responsive; visual QA di browser masih pending dan status build dicatat pada Dashboard-redesign.md.
