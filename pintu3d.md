# Pintu 3D — Panduan Tahapan Visual DC Organizer

**Status:** Tahap 1–2 disetujui owner. Tahap 3–7 sudah dikodekan; Tahap 6–7 menunggu review visual, terutama ukiran dan molding yang harus melekat pada daun saat membuka. Tahap 3–5 belum diberi persetujuan visual eksplisit.
**Dibuat:** 20 September 2026
**Ruang lingkup:** Pintu 1 (Event Planner) sebagai objek visual 3D yang akan menjadi referensi untuk tiga Pintu landing. Dokumen ini adalah *tracker teknis dan visual*, bukan PRD kedua; bila ada perubahan requirement produk, `prd.md` tetap canonical.

## Target hasil akhir yang dikunci

- Pintu 1 harus tampak sebagai **objek arsitektural megah**, bukan kartu UI, blok datar, atau gambar pintu yang sekadar disapu ke samping.
- **Daun pintu kiri dan kanan utuh** (seluruh tinggi, ketebalan, ukiran, panel, ornamen yang menempel pada daun) masing-masing berputar bersama engsel pada jamb/kusen kiri dan kanan. Ketika terbuka, **hanya kusen/ambang dan ruang di belakangnya yang tetap pada tempatnya**. Tidak boleh ada potongan facade/panel pintu melayang di mulut bukaan.
- Kusen, balok atas, dinding belakang, engsel pada jamb, dan ambang tidak bergerak. Hindari kotak abu-abu di belakang/bawah, siluet tanduk, sisi terpotong atau bingkai dobel yang merusak bentuk.
- Pengamatan dilakukan dari kondisi **tertutup, setengah terbuka, terbuka penuh, dan ditutup kembali**. Pastikan pada sudut >90° daun masih terlihat sebagai bidang utuh berketebalan dari perspektif samping, bukan lenyap karena backface/culling.
- Komposisi utama memberi skala pintu yang megah. Material matte/satin dengan detail serat/ukiran dan highlight tepi yang halus; dominan keluarga Rose DC (`#C07A84`, `#D9A3AA`, `#A65E69`), tanpa plastik glossy atau palet gold.
- Ornamen/list/bunga adalah bagian dari geometri daun atau kusen yang benar. Ornamen tidak boleh tetap mengambang di pusat pintu ketika daun terbuka.
- Cahaya putih gading dengan nuansa Rose keluar **hanya dari bukaan** mengikuti besar celah; bayangan kontak lantai tetap. Tidak ada halo pink besar atau balok abu-abu sebagai pengganti ruang di balik pintu.
- Performa mobile, contrast, reduced motion, semantik interaksi, dan perilaku landing tetap terjaga.
- Pintu 2/3 dan orbital Motion **tidak digandakan sebelum Pintu 1 disetujui**. Setelah disetujui, gunakan komponen inti yang sama dan aset/varian yang terpisah; jangan tiga salinan kode.
- **Jangan mengganti landing utama (`/`) atau tiga pintu aktif di sana selama uji Pintu 1**. Preview mandiri: `/pintu-lab`. Eksperimen lama di `/jiplak` tetap tersedia; promosi ke landing dilakukan setelah approval visual.
- Referensi `public/pintu1.png`—`pintu4.png` adalah gambar facade yang **belum boleh dipakai sebagai satu bidang bukaan bergerak**, karena gambar mungkin memuat kusen dan daun secara bersamaan. Ketika digunakan, pisahkan/mask kusen (diam) dan daun kiri/kanan (berputar) dengan tepi dan engsel yang sejajar. Jangan memotong seluruh foto termasuk kusennya lalu memutar semua bagian.

## Struktur komponen dan pembagian tanggung jawab

- `app/pintu-lab/page.tsx` — area preview satu Pintu, instruksi review dan kontrol buka/tutup.
- `components/Landing/Pintu/Pintu3DPreview.tsx` — state interaksi preview; objek Pintu 1, jamb/kusen diam, ruang/bayangan, pivot daun dan muka/belakang daun. Ini **komponen percobaan awal**, belum API publik tiga Pintu.
- Tahap berikut: ekstrak `DoorFrame`, `DoorLeaf`, `DoorHinges`, `DoorOrnaments`, `DoorInterior`, `DoorLighting`, `DoorMotion` jika kompleksitasnya memang sudah memerlukan pemisahan. Hindari membuat file kosong yang belum bermanfaat. Asset hanya dibutuhkan saat tahap detail/foto; **belum perlu mengunggah apa pun untuk tahap pertama**.
- Gunakan stack existing: Next.js + Tailwind + Motion. Eksperimen Three.js `/jiplak` tetap independen. Pilih apakah geometry final akan dipindahkan ke Three.js atau tetap CSS 3D setelah review kualitas/performanya; mekanisme fisik engsel harus benar untuk keduanya.

## 15 tahap dengan perubahan yang terlihat

| Tahap | Fase | Perubahan yang harus tampak saat direview | Status |
| --- | --- | --- | --- |
| 1 | Dasar | Satu Pintu besar di preview khusus, **dua daun lengkap** yang bisa dibuka/ditutup pada pivot kusen luar. Tidak ada setengah facade yang tertinggal di tengah. | Disetujui owner — screenshot tertutup/terbuka |
| 2 | Dasar | Rapikan proporsi tinggi/lebar, lebar celah/ambang dan ketebalan setiap daun dari depan dan sudut miring. | Disetujui owner — screenshot; kontrol sudut miring perlu diuji tersendiri bila belum tampil pada refresh |
| 3 | Dasar | Material utama matte Rose dengan perbedaan muka, rusuk, dan belakang serta highlight halus, tanpa kesan plastik atau tekstur melar. | Implementasi masuk GitHub — menunggu review visual |
| 4 | Dasar | Engsel di jamb dengan posisi vertikal masuk akal; pivot daun konsisten sampai terbuka penuh dan saat ditutup. | Implementasi di GitHub — menunggu review tampak miring dan buka-tutup |
| 5 | Dasar | Timing bukaan/tutupan natural, collision/projection visual wajar, shadow daun bergerak; uji 0°/45°/90°/110°. | Implementasi GitHub: empat sudut, easing buka/tutup, dua bayangan bergerak; menunggu review browser |
| 6 | Detail | Ukiran/panel relief pada **dua daun** mengikuti gerakan utuh daun, tidak ditempel pada portal diam. | Implementasi GitHub: relief acanthus dan sulur pada panel atas/bawah tiap daun, menunggu screenshot/review owner |
| 7 | Detail | Molding bertingkat, list dekoratif dan pertemuan panel/frame rapi saat tertutup maupun terbuka. | Kode masuk GitHub — tiga lapis profil panel dan lis daun/kusen; review visual pending |
| 8 | Detail | Ornamen bunga/crest terintegrasi pada kusen atau daun sesuai titik penempelan, bukan bunga melayang atau tanduk. | Belum |
| 9 | Detail | Ruang di balik bukaan mempunyai kedalaman, bukan kotak/lembaran gelap datar; cocok untuk banyak jenis acara. | Belum |
| 10 | Detail | Cahaya ivory–Rose keluar dari celah saat buka, volumetric feel secukupnya dan grounding shadow tetap natural. | Belum |
| 11 | Finishing | Review screenshot empat kondisi dari desktop dan mobile; perbaiki bentuk, clipping, pixel gaps, dan sudut tak wajar. | Belum |
| 12 | Finishing | Responsive size dan komposisi hero: pintu megah desktop tanpa memotong daun saat terbuka, ringkas di mobile. | Belum |
| 13 | Finishing | Performa: asset optimization, reduced motion, pointer/touch/keyboard, fallback tanpa WebGL bila digunakan. | Belum |
| 14 | Finishing | Komponen reusable dan varian visual Pintu 2/3 yang masih mempertahankan geometri engsel dan konsistensi visual Pintu 1. **Hanya setelah owner puas.** | Belum |
| 15 | Finishing | Integrasi ketiga Pintu dengan orbital Motion, hover pause/resume, navigasi dan verifikasi akhir seluruh tema/viewport. | Belum |

## Catatan review dan sumber keputusan

**20 September 2026 — Tahap 7 (implementasi):** lanjutkan detail yang benar-benar terlihat di preview tunggal `/pintu-lab` tanpa merombak desain yang sudah ada. Komponen baru `components/Landing/Pintu/DoorMolding.tsx` mendefinisikan panel trim berlapis: bingkai luar berbayang matte, lis terang kedua, cekungan dalam dengan bayangan inset dan empat sambungan sudut/miter kecil pada panel atas dan bawah. Reling perimeter dan dua lis pertemuan tengah dipasang langsung ke **muka masing-masing daun bergerak**, sesudah `DoorRelief` sehingga relief tetap terlihat di dalam panel dan semua detail mengikuti engsel hingga 110°. `FrameMolding` memasang lis tipis pada depan kusen tetap, terpisah dari node daun; tidak ada lis membentang di ruang kosong ketika pintu terbuka. Panel, kusen, material, perspektif, sudut bukaan, engsel, dan shadow lama tidak diganti. Pintu lab header/instruksi kini menjelaskan uji pertemuan panel saat tertutup dan list daun/kusen saat terbuka. Source commits: `ed5110d1`, `52d5b348`, `5e2ac0c0`. Pengujian CI **menunggu observasi**, kualitas visual molding/siluet dari browser **menunggu review owner**; jangan menandai tahap selesai hanya dari build. Asset/crest bunga tidak ditambahkan (Tahap 8), ruangan/lampu ditunda (Tahap 9–10). `/`, `/jiplak`, dan orbital tidak diubah.



**20 September 2026 — Screenshot owner Tahap 5:** owner mengirim tampak miring ketika pintu tertutup dan terbuka; engsel luar, sisi daun dan jamb bisa terlihat. Pada screenshot keadaan terbuka, latar ruang di balik pintu masih berupa bidang gelap dan tetap dijadwalkan untuk Tahap 9. Bagian atas pintu tampak terpotong di atas viewport pada screenshot yang sedang terscroll; ini perlu diperiksa lagi saat responsive/komposisi di Tahap 11–12, bukan alasan memperbesar atau mengganti geometri pada Tahap 6. Owner meminta lanjut tanpa menyatakan Tahap 3–5 secara eksplisit telah disetujui final.

**20 September 2026 — Tahap 6 (implementasi):** buat `components/Landing/Pintu/DoorRelief.tsx`, ornamen relief acanthus dan sulur yang reusable, berisi dua varian panel (atas/bawah) dengan lapisan goresan gelap di bawah, highlight tipis di punggung pahatan, pinggiran panel berkontur dan medali relief kecil. Komponen dipasang **di dalam muka depan masing-masing `HingedLeaf`** di `Pintu3DPreview.tsx`, tepat di atas panel dekoratif yang sudah bergerak bersama daun. Ornamen kiri dan kanan diberi opsi mirror agar komposisi kedua daun berpasangan saat tertutup. Tidak ada dekorasi baru yang diikat pada bidang portal diam, kusen, atau melayang di tengah; tidak memotong `pintu1.png` dan belum menambahkan crest/bunga besar (Tahap 8). Foto, material, dimensi, pivot dan sudut bukaan 0°/45°/90°/110° tidak diubah. Route `/pintu-lab` menampilkan instruksi baru untuk review ukiran; halaman canonical `/` dan eksperimen `/jiplak` tetap utuh. Source commits: `38e4c888` (relief), `6065d48c` (attach pada daun), `30f67cbc` (instruksi preview). GitHub Build Validation run `35499261849` pada source head `30f67cbcf230923ef5e5519cea0f747c8d9731e5` **PASS** (file relief, pemasangan pada kedua daun dan instruksi lab). **Belum ada penilaian visual Tahap 6 dari owner**. Relief CSS/SVG ini simulasi visual pahatan, bukan geometri ukiran 3D penuh yang sudah lolos review.



**20 September 2026 — Tahap 5 (implementasi):** atas permintaan owner untuk lanjut, preview `/pintu-lab` kini menyediakan tombol kondisi bukaan 0°, 45°, 90°, 110° selain tombol buka/tutup utama. Dua daun memakai satu target sudut dengan arah rotasi berlawanan dan easing terkontrol 1,1 detik (0,01 detik bila `prefers-reduced-motion`) tanpa overshoot/spring. Dua projected elliptical contact shadows diletakkan terpisah dari daun, berakar di kaki setiap jamb, diputar dan diubah opacity/scale-nya mengikuti target sudut dengan timing yang sama; bayangan dasar frame lama tetap. Eksposur lembut pada latar bukaan berubah secara gradual mengikuti sudut tetapi belum merupakan final light beam Tahap 10. User bisa membandingkan empat bukaan dari tampak depan/kiri/kanan; ini **visual CSS approximation** dan belum mengklaim collision solver/photometric shadows. Bentuk, material, enam bidang tiap daun, engsel serta fixed jamb tidak diubah. Source files `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`; source commits `93d5854a`, `41e81f8e`. Build/CI: GitHub Build Validation run `35499021097` on stage-five application source head `41e81f8e92f0f9ca561ef48b0302a116dda98d6b` **PASS**. Review browser/screenshot dan kepuasan visual owner tetap **pending**; CI tidak memverifikasi penampilan bayangan. Landing `/`, `/jiplak`, orbital dan protected Rose petals tidak berubah.



**20 September 2026 — Feedback Tahap 3 / permintaan lanjut Tahap 4:** owner menyampaikan tampak miring masih terlihat seperti lembaran dimiringkan. Ini **bukan** persetujuan visual terhadap material/volume Tahap 3. Akar teknis pada preview sebelumnya: daun telah mempunyai enam bidang, tetapi kusen hanya empat strip pada bidang datar, dan mode miring merotasi seluruh komposisi tanpa return/depth kusen. Validasi Tahap 3: GitHub Build Validation run `35498336075` pada commit `4c13211787c924fcd0185330d153cc9cd8695e20` **PASS**, bukan bukti visual kedalaman.

**20 September 2026 — Tahap 4 (implementasi):** kusen tetap punya profil depan asli tetapi memperoleh return/jamb kiri dan kanan, permukaan lintel atas, ambang bawah, serta profil belakang pada z=-44 px yang **tidak bergerak saat daun dibuka**. Bidang ruang di balik bukaan juga dipindah ke z=-44 px agar return jamb tidak tertutup oleh background datar pada bidang depan. Masing-masing daun memakai pivot pada sumbu engsel luar dengan transform-origin z=16 px (selaras dengan barrel engsel); tiga set knuckle per sisi dipisah menjadi bagian tetap pada jamb (atas/bawah) dan bagian tengah serta bracket pada daun yang ikut rotasi. Posisi vertikal barrel dihitung relatif terhadap posisi atas dan tinggi daun sehingga set engsel tetap segaris saat terbuka. Kamera inspeksi dibuat pilihan depan, kiri -30°, kanan +30° untuk mengecek volume dari kedua sisi; geometri/mat Rose muka daun dan bukaan dua daun tetap. Ini memperbaiki kesan lembaran tetapi **CSS 3D masih bukan mesh 3D penuh**: jangan klaim fisik/visual realism final sebelum screenshot dan review browser. Files `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`, `pintu3d.md`, `prd.md`; source commits `51990eed`, `294b1b7e`, `4b14d753`, `a43c5c92` (recess ruang), `25e04cf5` (hindari translate ganda barrel pada Tailwind v4). CI untuk source head **pending**; owner visual **pending**. Landing `/`, `/jiplak`, rose petals dan orbital tetap tidak berubah.


**20 September 2026 — Review owner Tahap 1 dan 2:** owner mengirim screenshot Pintu tertutup dan terbuka pada `/pintu-lab` serta menyatakan keduanya sudah OK. Siluet dua daun, pertemuan tengah, bukaan utuh dan kusen tidak bergerak disetujui sebagai baseline. Screenshot menampilkan judul dan satu tombol preview lama, sehingga mode tampak miring dari Tahap 2 belum terlihat pada gambar; persetujuan proporsi/bukaan dicatat tanpa mengklaim kontrol sudut miring sudah diuji. Jangan mengubah bentuk dan mekanisme yang telah disetujui ketika menambah material.

**20 September 2026 — Tahap 3 (implementasi):** muka, belakang, dan keempat rusuk setiap daun mendapat warna tonal berbeda, lapisan garis serat halus serta bayangan matte tanpa gambar/asset tambahan; kedua panel muka memiliki shading cekung dan tekstur tersendiri. Material ini melekat pada node daun/pivot existing, tidak mengubah ukuran, posisi daun, kecepatan bukaan, kusen, atau latar interior. Heading/instruksi preview disesuaikan untuk peninjauan material. Files: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`. Source commits `48c31bac`, `4c132117`. Build/CI dan tampilan aktual: **pending**. Review dan persetujuan owner untuk Tahap 3: **belum**.


**20 September 2026 — Tahap 2 (implementasi):** Pintu 1 di `/pintu-lab` dibuat lebih tinggi (proporsi 0,65), ukuran viewport dikendalikan agar objek tetap besar tanpa perlu mengubah landing, trim top/bottom dan sisi kusen dipersempit, kedua daun disusun simetris dengan celah tengah 0,7% dari lebar kusen. Setiap daun mendapat muka dan belakang pada z ±10 px serta keempat rusuk prismanya (tebal 20 px) yang ikut satu pivot engsel. Ditambahkan pilihan tampak depan/miring (-17°) untuk mengevaluasi volume ketika terbuka dan perubahan instruksi pada route. Bukan tahap material/ukiran akhir. Berkas kode: `components/Landing/Pintu/Pintu3DPreview.tsx`, `app/pintu-lab/page.tsx`. Source commits: `6f9fb541`, `271b634e`. Build/CI: **pending observation**; penilaian bentuk dari browser/screenshot: **pending owner review**. `/` dan `/jiplak` tidak diubah.


**20 September 2026 — Implementasi & pemeriksaan teknis awal:** GitHub Build Validation run `35497267847` pada commit `e67a7da17b9a14dc68ff563413600703d73dd3f5` (komponen + route) **PASS**. Ini verifikasi build, bukan bukti kualitas tampilan/engsel di browser; screenshot desktop/mobile dan feedback owner tetap **pending**. Tidak diperlukan asset baru pada baseline ini.

**20 September 2026 — Tahap 1 mulai:** owner meminta satu file `pintu3d.md`, 15 tahap menjadi tiga fase, utuhnya gerakan daun hingga hanya kusen tersisa. Dipilih `/pintu-lab` agar satu pintu bisa diamati tanpa orbital dan landing canonical tidak terganggu. Baseline pertama memakai model CSS 3D + Motion tanpa meminta asset baru. **Jangan menganggap tampilan sudah disetujui sampai ada screenshot/feedback pemilik.**

**Masalah yang harus selalu dicek:** facade ikut membuka bersama kusen; bagian atas/ornamen tetap mengambang; backing kotak abu-abu; ambang berupa balok; pintu terlalu kecil; foto melar; material plastik; cahaya besar berlebihan; daun menghilang saat sudut >90°; overflow memotong bukaan; orbital menggantikan review satu Pintu.

## Protokol tiap tahap

1. Ubah kode sehingga ada perbedaan visual yang dapat diperiksa langsung di `/pintu-lab`.
2. Catat apa yang berubah, file terdampak, hasil lint/build/CI yang **benar-benar teramati**, dan apakah owner sudah menyetujui.
3. Setelah screenshot/feedback, perbaiki tahap terkait sebelum lanjut; tidak menganggap nomor tahap sebagai bukti kualitas.
4. Jangan mengubah Rose petals, brand font/button, landing utama, product routing, atau backend sebagai efek samping.
