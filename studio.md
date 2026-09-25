# studio.md — Aturan Designer Studio & Customer Studio DC Organizer

**Status:** spesifikasi produk dan aturan implementasi, bukan klaim bahwa semua fitur di bawah telah dibuat atau diuji.
**Cakupan:** panel desainer `/designer`, editor template, editor undangan pelanggan, renderer publik, dan alur pesanan custom. Ketentuan produk aktif tetap mengikuti `prd.md`; aturan engineering umum mengikuti `AGENTS.md`; kontrak isi dan karakter tema mengikuti `template.md`. Jika ada konflik, selaraskan persyaratan di `prd.md` lebih dahulu. Jangan mengubah landing page/Pintu atau modul lain yang tidak terkait.

## 1. Tujuan produk

DC Organizer harus menjadi tempat kerja desainer undangan digital **di dalam aplikasi sendiri**: login ke panel desainer → buat dari canvas kosong atau duplikasi master → desain semua bagian undangan → simpan draft → pratinjau/uji → publikasikan template untuk katalog **atau** serahkan proyek custom kepada pelanggan yang dituju. Desainer tidak perlu berpindah ke platform desain eksternal untuk pekerjaan harian. Aset dari luar boleh diimpor secara aman; impor bukan prasyarat mengedit template.

Bedakan **Designer Studio**, tempat membuat dan mengelola *master template/proyek custom*, dari **Customer Studio**, tempat pemilik acara menerapkan template dan mengganti konten/properti yang diizinkan. Jangan menyamakan editor master dengan editor undangan event-scoped saat ini. Keduanya harus memakai satu format desain tervalidasi dan renderer undangan nyata, bukan dua versi visual yang bisa berbeda.

## 2. Aturan inti: bebas secara visual, terkunci secara fungsional

**Protected component dengan editable design properties.** Desainer boleh mengatur penempatan, ukuran, susunan, tipografi, palet, frame, border, spacing, dekorasi, foto, animasi, dan varian tata letak melalui properti yang dinyatakan di *capability/manifest* komponen. Editor hanya memperlihatkan kontrol yang benar-benar didukung renderer; jangan membuka source code, HTML/JavaScript/CSS arbitrer, endpoint, skema database, atau logika bisnis melalui inspector.

Komponen fungsional tetap milik engine DC Organizer:
- **Amplop Digital:** desain flap, latar dan animasi boleh berubah; mekanisme membuka undangan harus tetap berjalan.
- **Identitas, Detail Acara, Tanggal, Maps, Countdown:** gaya visual bisa berubah; nilai nama/keluarga, jadwal, venue, tautan lokasi dan hitung waktu tetap berasal dari data acara yang benar.
- **Foto/Galeri:** layout, mask, crop/fokus dan animasi dapat diatur; foto tetap milik koleksi event dan aturan kepemilikannya.
- **RSVP:** desain label, input, tombol dan urutan presentasi yang aman dapat diubah; pilihan kehadiran, field wajib, validasi, kapasitas/sesi, QR, endpoint, penyimpanan dan otorisasi tidak boleh diganti/dihilangkan.
- **Ucapan Tamu:** gaya form/daftar boleh diubah; penyimpanan, moderasi/validasi, batas pengiriman dan hubungan `Invitation.id` tetap memakai layanan bersama.
- **Hadiah/E-Angpao:** tampilan kartu/tombol boleh berubah; rekening berasal dari data pemilik dan aksi salin benar-benar berfungsi.
- **Musik:** gaya player dapat diubah; sumber audio, pemutaran/jeda, izin browser dan toggle global tetap dipegang engine.

Tidak semua section harus berbentuk card atau grid, dan tidak semua desain harus simetris. Kebebasan visual **tidak** mengizinkan objek dekoratif menutup aksi utama, menghilangkan akses keyboard/touch, membuat kontras tidak terbaca, atau memotong data wajib. Komponen terlindungi boleh dipilih sebagai satu kesatuan serta diedit melalui slot/properti presentasinya; struktur internal dan jalur datanya tidak menjadi objek bebas untuk dihapus. Penonaktifan section hanya melalui capability dan kontrol ON/OFF resmi, tanpa menghapus data.

## 3. Dua tingkat editor dan hak akses

| Peran | Yang dapat dikerjakan | Batas |
| --- | --- | --- |
| **Designer / Editor berizin** | Membuat master baru, mengedit komposisi seluruh section yang diizinkan, memilih varian komponen, menentukan *customer-editable properties*, menyimpan draft, menguji, mengajukan publikasi; mengedit pesanan custom yang secara eksplisit ditugaskan kepadanya. | Tidak dapat mengubah bisnis/API/skema/komponen inti, mengambil data event lain, atau menerbitkan template di luar hak dan alur review. |
| **Customer/pemilik acara** | Memakai master yang siap digunakan dan mengubah foto, musik, narasi serta properti lain yang diizinkan master; mengelola konten dan data acara pada tempatnya. | Tidak dapat mengedit master global, mengubah backend, atau mengakses proyek dan data pelanggan lain. |
| **Admin/owner yang berwenang** | Mengelola penugasan custom, review, persetujuan dan publikasi sesuai otorisasi server. | Izin di UI bukan pengganti pemeriksaan backend dan jejak audit. |

Perbedaan izin tidak boleh hanya berupa tombol yang disembunyikan: seluruh operasi baca/tulis harus memeriksa sesi, role, kepemilikan master, penugasan custom, dan event ID di server.

## 4. Perilaku kanvas Designer Studio

Kanvas utama harus merender undangan **asli** (amplop + 13 section + kontrol musik sesuai `template.md`), termasuk state non-submitting untuk form di mode desain. Desainer dapat memilih section, memilih objek, drag-and-drop, resize, rotate, menyusun layer, lock/hide objek dekoratif, duplicate, delete objek yang diizinkan, undo/redo, zoom/pan, snap/guides opsional, dan mengedit properti kontekstual dari inspector. Perintah Delete/Backspace, Ctrl/Cmd+C/V, Ctrl/Cmd+Z/Shift+Z harus hanya bekerja saat fokus berada pada kanvas dan tidak sedang mengetik di input/textarea/contenteditable atau mengganggu shortcut browser.

Drag dari pustaka aset harus mempertahankan titik drop relatif terhadap section target, bukan selalu menambahkan objek di titik default atau membatasi seluruh pekerjaan desainer pada Cover. Simpan koordinat per section/layer dalam sistem yang tahan zoom; penyimpanan satu gerakan drag dihitung sebagai **satu** langkah Undo. Objek hanya dapat dipindahkan/diubah jika capability mengizinkan; elemen sistem atau data wajib tidak boleh dihapus atau tergeser hingga tidak berfungsi.

Sediakan preview desktop dan mobile dengan kemungkinan override tata letak yang aman agar desain tidak sekadar mengecil di HP. Scroll, pointer/touch, animasi, RSVP dan aksesibilitas harus tetap berjalan. Desainer dapat mengatur gaya narasi dan foto tanpa memodifikasi nilai data acara yang menjadi sumber tunggal. Fitur berat dimuat hanya untuk editor/template yang memakainya.

### Implementasi bertahap: objek dekoratif di Customer Studio (24 September 2026)

**Interaksi pemilihan objek (25 September 2026):** klik gambar/teks pada canvas menampilkan bounding box Rose hanya selama objek dipilih; empat titik di sudut kotak dapat ditarik untuk mengubah ukuran secara langsung dan grip bundar di atas kotak untuk rotasi. Seluruh alat mengikuti rotasi objek dan hilang ketika objek tidak dipilih, tanpa menambahkan garis putih permanen pada aset yang tersimpan atau undangan publik. Pengaturan inspector tetap menjadi alternatif keyboard/touch; interaksi pointer hanya memutakhirkan riwayat setelah dilepas. Jangan menjadikan tombol panel sebagai satu-satunya cara resize/rotate.


Editor undangan event-scoped `/dashboard/editor` kini mempunyai jalur **Aset** dan **Teks** untuk objek dekoratif yang sengaja ditambahkan pemilik. Gambar yang sudah berada di direktori publik template dapat dijatuhkan ke section undangan yang sedang aktif; teks dekoratif baru dapat ditambahkan ke section aktif, lalu dipilih, dipindah antar-section, diperbesar/diperkecil, diputar langsung lewat handle canvas, diubah lewat inspector kanan, disusun, diduplikasi atau dihapus. Pemindahan/transformasi oleh pointer baru dicatat sebagai satu perubahan saat pointer dilepas; koordinat relatif terhadap section. Urutan keyboard dan perlindungan input tetap berlaku. Teks baru ini **bukan** mekanisme untuk merombak judul sistem, nama, jadwal, hadiah, form RSVP, maupun label template yang terkunci.

Ini **belum** mengimplementasikan editor master bebas milik Designer berizin, kemampuan master yang dipublikasikan, custom made, sistem versi, atau JSON project storage yang dibahas di §5; jalur baru ini masih memakai token `::layers=` event-scoped yang sudah ada sebagai langkah kompatibilitas, **bukan** format proyek master yang disarankan. Sebelum membuat editor master dan menyebarkan kemampuan ini ke pelanggan produksi, audit izin per template/role, benturan objek dengan tombol dan form, panjang design key, serta pengujian interaksi desktop/touch dan public renderer. Jangan menyatakan seluruh acceptance criteria Studio sudah lulus tanpa QA tersebut.

## 5. Struktur proyek, penyimpanan, dan versi

Pisahkan **master template** dari **instance undangan pelanggan**:
- Master mempunyai ID stabil, pemilik/desainer, mode komersial/kustom, status draft/review/published/archived, manifest kemampuan, struktur section/layer, properti desain, aset, preview, dan nomor versi.
- Setiap undangan event menyimpan referensi ke **versi master yang digunakan** plus override konten/properti yang diizinkan, bukan salinan backend atau akses tulis ke master. Undangan yang sudah terbit tidak boleh berubah diam-diam ketika master diperbarui.
- Proyek custom terikat pada **event pelanggan dan desainer yang ditugaskan**, bukan otomatis tersedia di katalog atau untuk pelanggan lain. Perubahan, preview dan revisi mengikuti persetujuan pemilik/penanggung jawab yang berwenang.
- Simpan draft berulang, histori revisi dan status belum disimpan; publikasi hanya dari versi yang lolos validasi. `Simpan` bukan `Publish`; pembayaran/publish undangan pelanggan tetap mengikuti aturan event-scoped pada `prd.md`.
- Aset event tetap melalui upload terotorisasi dan Sharp → WebP; template dan pelanggan boleh memakai peran foto yang sama tanpa menduplikasi upload/database. Master berlisensi privat tidak disimpan sebagai file publik.
- Gunakan skema proyek visual yang tervalidasi/di-whitelist; jangan memperlakukan ZIP/HTML/JSON unggahan sebagai kode template React yang aman dijalankan otomatis. Renderer dan registry harus mengerti format proyek sebelum item ditandai `ready` dan dapat dibeli/dipakai.

**Kompatibilitas:** model yang ada (`Invitation.templateKey`, `DesignerTemplate`, pilihan 15 toggle, slot foto, copy, dan undangan terbit) tidak boleh dihapus atau ditafsirkan ulang tanpa migrasi, adapter, dan uji regresi yang jelas. Bentuk data versi berikutnya harus dirancang sebelum migrasi; hindari memasukkan semua scene/layer multi-section ke string `templateKey` yang sebelumnya dipakai untuk override per-event.

## 6. Dua alur produksi yang harus didukung

**Template katalog:** desainer login → buat/duplikasi master → desain dan simpan draft → validasi 15 kontrol dan interaksi → ajukan review → admin/owner menerbitkan versi → katalog menampilkan hanya template yang *render-ready* → pelanggan memilih dan mengisi acara sendiri. Satu master dipakai banyak event, dengan versi dan data masing-masing tetap terpisah.

**Custom made:** pesanan/brief pelanggan → admin menugaskan desainer dan event yang tepat → desainer mulai dari kosong/duplikasi master → simpan draft dan berikan preview aman kepada pemilik → revisi/persetujuan → tetapkan desain hanya pada event terkait → undangan pelanggan dipublikasikan lewat alur normal. Tidak otomatis mengubah master katalog, tidak membuka data pelanggan lain, dan tidak dapat dijual ulang tanpa izin eksplisit yang sesuai.

## 7. Validasi sebelum menyatakan template siap

Sebuah template/proyek belum boleh ditandai *ready* hanya karena desainnya tampak benar di canvas. Uji bahwa:
- Amplop, 13 bagian undangan, dan musik memiliki implementasi/toggle yang sesuai kontrak; OFF tidak menghapus data.
- RSVP, Ucapan Tamu, hadiah, lokasi, countdown, foto dan audio tetap memakai sumber data/API bersama; preview tidak mengirim data produksi.
- Teks dan foto kosong, nama panjang, venue panjang, banyak foto, berbagai status toggle, serta desktop/mobile tetap terbaca dan operasional.
- Pengaturan desainer yang disimpan dirender sama pada preview dan undangan sungguhan; reload, Undo/Redo, versi master dan instance pelanggan tidak membocorkan perubahan antar-event.
- Server menolak perubahan properti terlarang, akses lintas-event, publikasi tanpa izin, dan unggahan kode/asset yang tidak aman; keyboard/touch/reduced-motion diuji.

**Batas implementasi saat pembaruan 24 September 2026:** repo memiliki panel unggah desainer dan Customer Studio event-scoped dengan objek dekoratif lintas section, teks dekoratif, serta handle resize/rotate (implementasi source, belum dinyatakan lulus build/QA browser). Belum ada bukti editor master visual seluruh section dengan role/capability lengkap, sistem versi master, penugasan custom lengkap, maupun alur end-to-end publikasi template hasil editor. Isi `studio.md` adalah arah pembangunan dan acceptance criteria; jangan mencatatnya sebagai fitur yang sudah selesai sebelum kode dan pengujian nyata tersedia.
