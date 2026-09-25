# studio.md — Aturan Designer Studio & Customer Studio DC Organizer

**Status:** spesifikasi produk dan aturan implementasi, bukan klaim bahwa semua fitur di bawah telah dibuat atau diuji.
**Cakupan:** panel desainer `/designer`, editor template, editor undangan pelanggan, renderer publik, dan alur pesanan custom. Ketentuan produk aktif tetap mengikuti `prd.md`; aturan engineering umum mengikuti `AGENTS.md`; kontrak isi dan karakter tema mengikuti `template.md`. Jika ada konflik, selaraskan persyaratan di `prd.md` lebih dahulu. Jangan mengubah landing page/Pintu atau modul lain yang tidak terkait.

## 1. Tujuan produk

DC Organizer harus menjadi tempat kerja desainer undangan digital **di dalam aplikasi sendiri**: login ke panel desainer → buat dari canvas kosong atau duplikasi master → desain semua bagian undangan → simpan draft → pratinjau/uji → publikasikan template untuk katalog **atau** serahkan proyek custom kepada pelanggan yang dituju. Desainer tidak perlu berpindah ke platform desain eksternal untuk pekerjaan harian. Aset dari luar boleh diimpor secara aman; impor bukan prasyarat mengedit template.

Bedakan **Designer Studio**, tempat membuat dan mengelola *master template/proyek custom*, dari **Customer Studio**, tempat pemilik acara menerapkan template dan mengganti konten/properti yang diizinkan. Jangan menyamakan editor master dengan editor undangan event-scoped saat ini. Keduanya harus memakai satu format desain tervalidasi dan renderer undangan nyata, bukan dua versi visual yang bisa berbeda.

### Siklus draft edit pelanggan (25 September 2026)

Editor undangan pelanggan harus memulihkan perubahan yang **belum disimpan** setelah refresh tab Studio yang sama. Snapshot sementara hanya berada di `sessionStorage` tab tersebut dan dipakai **hanya pada navigasi browser bertipe reload pada entri history Studio yang sama**, setelah undangan terautentikasi dimuat dan ID undangan serta baseline field yang tersimpan di server masih cocok. Penanda history mencegah navigasi SPA menuju Studio setelah refresh halaman lain dianggap sebagai refresh editor; perubahan fallback foto baru dari unggahan tidak boleh membuat baseline desain palsu. Semua perubahan visual yang berada di `InvitationDesignState` (termasuk pemilihan template, section, foto, narasi template dan objek dekoratif), pilihan musik, hashtag, dan dress code termasuk snapshot ini; bukan autosave server.

Jika pengguna keluar Studio ke halaman lain, logout, berganti undangan, menutup tab, atau kembali melalui Back/Forward, editor harus memuat versi terakhir yang disimpan melalui tombol Simpan Desain—**jangan pulihkan draft sementara**. Setelah Simpan Desain berhasil, hapus snapshot. Browser yang menolak sessionStorage boleh kehilangan pemulihan refresh tanpa menghalangi pengeditan dan penyimpanan manual. Jangan menyimpan token, sesi login, dokumen pengguna lain, atau data terproteksi ke cache ini; server tetap sumber kebenaran dan tidak boleh ditimpa bila baseline berubah.

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

**Klik area kosong untuk melepas seleksi (25 September 2026):** ketika gambar atau teks dipilih, klik bagian kosong pada canvas/undangan membatalkan pilihan dan menyembunyikan bounding box serta semua handle tanpa menghapus objek maupun mengubah desain tersimpan. Klik objek lain memindahkan pilihan. Klik tombol/form asli undangan, kontrol layer kanan, atau objek yang sedang di-drag/resize tidak boleh menghilangkan seleksi tanpa sengaja. Keyboard Escape dan tombol ✕ inspector tetap dapat melepas seleksi.

**Interaksi pemilihan objek (25 September 2026):** klik gambar/teks pada canvas menampilkan bounding box Rose hanya selama objek dipilih; delapan titik resize berada di empat sudut serta tengah sisi kiri, kanan, atas, dan bawah. Saat mouse berada di titik, cursor menunjukkan arah resize (horizontal, vertikal, atau diagonal). Empat handle sudut mengubah lebar dan tinggi secara proporsional. Handle tengah kiri/kanan **hanya mengubah lebar dari sisi yang ditarik**: menarik kanan mempertahankan tepi kiri, menarik kiri mempertahankan tepi kanan. Handle tengah atas/bawah **hanya mengubah tinggi dari sisi yang ditarik**: menarik atas mempertahankan tepi bawah dan sebaliknya. Karena objek berpusat pada koordinat X/Y, resizing juga memindahkan pusat sejauh setengah selisih ukuran searah handle, termasuk saat objek diputar. Empat sudut mengubah lebar dan tinggi proporsional dengan menjaga sudut berseberangan tetap pada posisinya, selama tidak dibatasi tepi section. Dimensi tinggi independen disimpan hanya setelah pengguna mengubah rasio objek; aset lama tanpa dimensi tinggi tetap mempertahankan proporsi asli. Inspector kanan menyediakan tinggi independen dan tombol pulihkan proporsi asli; crop tetap merupakan fitur terpisah. Grip rotasi berbentuk lingkaran berada di bawah garis batas gambar, dapat ditarik ke kiri/kanan untuk memutar; inspector kanan juga menyediakan slider dan input angka derajat presisi (-180 hingga 180). Seluruh alat mengikuti rotasi objek dan hilang ketika objek tidak dipilih, tanpa menambahkan garis putih permanen pada aset yang tersimpan atau undangan publik. Pengaturan inspector tetap menjadi alternatif keyboard/touch; interaksi pointer hanya memutakhirkan riwayat setelah dilepas. Jangan menjadikan tombol panel sebagai satu-satunya cara resize/rotate.


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

### Kontrol Customer Studio — 25 September 2026

- Tombol **Simpan** (EN: **Save**) berada pada **toolbar canvas**, bukan toolbar atas terpisah. Urutan aksi pada deretan ini adalah **Nama template → Restart/Ulang dari awal → Undo → Redo → Simpan**; simpan hanya desain event terkait, bukan publikasi undangan.
- **Urungkan/Undo** dan **Ulangi/Redo** berada pada **toolbar canvas yang sama dengan Restart dan Simpan**. Jangan taruh Undo/Redo di toolbar atas terpisah. Indikator **Ponsel/Mobile** pada deretan ini dihapus karena canvas sudah jelas merupakan pratinjau undangan. Tombol aktif bila ada langkah historis yang dapat dibatalkan/diulang, nonaktif bila riwayat kosong atau editor sedang menyimpan/mengolah audio; perubahan baru mengosongkan daftar Redo. Shortcut Ctrl/Cmd+Z, Ctrl/Cmd+Y dan Ctrl/Cmd+Shift+Z bekerja saat fokus berada pada canvas, tidak saat mengetik dalam input/textarea.
- **Ulang dari awal/Restart hanya ada satu kali, yaitu pada toolbar canvas**; jangan tampilkan kontrol Restart kedua di rail kiri. Tombol ini adalah **reset desain penuh ke kondisi awal template yang sedang dipilih**, bukan sekadar replay animasi Amplop. Satu aksi ini menghapus seluruh override desain event-scoped: objek/asset dekoratif yang ditempel beserta posisi, ukuran, rotasi dan urutannya; teks dekoratif; assignment/fokus foto; override musik; copy/narasi template; palet/font; serta toggle section. Restart juga melepas seleksi, mengosongkan clipboard layer, kembali ke Amplop dan scroll ke atas. **File gambar/audio yang sudah di-upload tidak dihapus dari koleksi media/event**; reset hanya melepas pemakaian/override-nya dari desain sampai pengguna menekan Simpan.
- Pemilih tahap **Amplop** dan **Cover** berada tepat **di atas preview undangan di dalam area canvas** (mengikuti lebar preview), bukan di toolbar global. Ini hanya mengubah tahap pratinjau dan tidak mengubah toggle section/data yang disimpan. Jika Amplop dinonaktifkan, tombol Amplop disembunyikan dan Cover tetap tersedia.
- Kontrol aksi Studio memakai keluarga tombol DC Organizer yang sama: bentuk **rounded rectangle** dengan `--dc-control-radius` 16px, bukan pill. Pada toolbar canvas, **Restart, Undo, dan Redo tampil icon-only** dengan `aria-label` dan bantuan hover/title yang jelas; **Simpan tetap memakai ikon + teks** sebagai aksi utama. Keempatnya tetap satu keluarga visual DC Organizer.

## 7. Validasi sebelum menyatakan template siap

Sebuah template/proyek belum boleh ditandai *ready* hanya karena desainnya tampak benar di canvas. Uji bahwa:
- Amplop, 13 bagian undangan, dan musik memiliki implementasi/toggle yang sesuai kontrak; OFF tidak menghapus data.
- RSVP, Ucapan Tamu, hadiah, lokasi, countdown, foto dan audio tetap memakai sumber data/API bersama; preview tidak mengirim data produksi.
- Teks dan foto kosong, nama panjang, venue panjang, banyak foto, berbagai status toggle, serta desktop/mobile tetap terbaca dan operasional.
- Pengaturan desainer yang disimpan dirender sama pada preview dan undangan sungguhan; reload, Undo/Redo, versi master dan instance pelanggan tidak membocorkan perubahan antar-event.
- Server menolak perubahan properti terlarang, akses lintas-event, publikasi tanpa izin, dan unggahan kode/asset yang tidak aman; keyboard/touch/reduced-motion diuji.

**Batas implementasi saat pembaruan 24 September 2026:** repo memiliki panel unggah desainer dan Customer Studio event-scoped dengan objek dekoratif lintas section, teks dekoratif, serta handle resize/rotate (implementasi source, belum dinyatakan lulus build/QA browser). Belum ada bukti editor master visual seluruh section dengan role/capability lengkap, sistem versi master, penugasan custom lengkap, maupun alur end-to-end publikasi template hasil editor. Isi `studio.md` adalah arah pembangunan dan acceptance criteria; jangan mencatatnya sebagai fitur yang sudah selesai sebelum kode dan pengujian nyata tersedia.
