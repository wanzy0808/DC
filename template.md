# template.md — Zen Atelier | Panduan Implementasi Visual & Interaksi

**Status:** Spesifikasi desain untuk implementasi berikutnya; **belum berarti semua fitur sudah selesai dikodekan**.  
**Ruang lingkup:** Template undangan digital **Zen Atelier**, katalog `/template-design` yang menampilkannya, dan pratinjau template yang memakai renderer undangan yang sama. **Jangan mengubah landing page, Pintu, identitas visual Dashboard, atau template lain.**  
**Sumber kebenaran produk:** `prd.md` dan `AGENTS.md`. Dokumen ini memperinci *art direction, copy, komposisi, dan motion* Zen Atelier; jika mengubah kontrak produk, sinkronkan dulu ke PRD utama.

## 1. Acuan visual yang wajib diikuti

Acuan utama adalah gambar **`Zen Atelier Wedding Moodboard UI.png`** dari percakapan owner, terutama deretan contoh layar mobile **01 Cover, 02 Amplop, 03 Pasangan, 04 Detail Acara, 05 RSVP, 06 Galeri** dan contoh kecil **07 Ucapan, 08 Hadiah, 09 Closing**. Urutan nomor pada papan referensi adalah urutan *gambar contoh*, **bukan** urutan runtime undangan: runtime selalu dimulai dari Amplop Digital, lalu Cover, kemudian komponen lain sesuai kontrak 15 komponen di bawah. Jangan menafsirkan gambar moodboard sebagai screenshot website yang harus dimasukkan utuh sebagai background: buat layout responsif dengan teks/data sungguhan dan aset dekoratif terpisah.

**Karakter desain yang harus terlihat:** kertas washi berwarna ivory/krem hangat, ruang kosong lapang, tipografi editorial Playfair Display + Inter, teks utama hampir hitam, sage yang redup, terakota/wax seal merah bata, ranting bunga tipis, pegunungan tinta di bagian bawah, pola kisi/shoji hanya sebagai aksen. Foto pasangan terasa editorial, bukan stok foto generik atau potongan hiasan ramai. Proporsi, hierarki, komposisi, jenis ornamen, posisi elemen dan susunan teks harus mengikuti contoh, bukan diserahkan pada tema Universal secara visual.

**Palet acuan (arah awal, bukan pengganti pilihan warna Studio):** ivory `#F4F0E6`; kertas terang `#FBF8F0`; tinta `#262B29`; sage redup `#667266`; terakota `#A9513B`; beige `#C9BDA9`. Gunakan kontras teks terbaca. **Jangan buat teks penjelas menjadi abu-abu pucat**: teks isi tetap gelap; teks sekunder hanya dipakai jika informasinya perlu.

**Aset yang sudah ada di repo:** `public/templates/` (bukan `public/template/`): `amplop1.png`, `bunga0001.png` s.d. `bunga0004.png`, `bamboo1.png`, `ensostroke.png`, `inkmountain.png`, `redsun1.png`, `japancup.png`, `japanroom1.png`, `japanroom2.png`, `darkcloud1.png`, `darkcloud2.png`. **Periksa satu per satu isi, orientasi, rasio, alpha/transparansi dan cropping gambarnya sebelum memasang.** Nama file tidak menjamin aset tersebut cocok sebagai layer atau latar. Hindari menumpuk seluruh gambar sekaligus; setiap layar perlu komposisi terkurasi. Pakai aset moodboard yang benar-benar ada dan sesuai; bila aset tertentu tidak sama dengan referensi, catat ketidakcocokannya dan minta peninjauan owner alih-alih menggantinya diam-diam dengan ilustrasi acak.

Aset foto undangan berasal dari pustaka foto **event pemilik**. Nama dan foto pada moodboard, seperti **Aruna & Kaito**, hanya contoh dalam katalog. Jangan memakainya sebagai fallback undangan pelanggan yang belum mengisi data.

## 2. Aturan tulisan, kontrol, dan kebersihan antarmuka

- Tombol utama pada Amplop Digital **tepat bertuliskan `Buka Undangan`**. Gunakan kapital awal kata seperti itu; jangan `BUKA UNDANGAN`, `buka undangan`, `Ketuk untuk membuka` sebagai label tombol utama, atau padanan bahasa Inggris ketika bahasa aktif Indonesia. Boleh memakai kalimat `Ketuk untuk membuka` sebagai petunjuk **singkat bila memang dibutuhkan**, tetapi pilih satu aksi utama saja.
- **Hapus tombol `Lihat Undangan` pada Cover**, baik yang berbentuk tombol bulat panah maupun teks, bila fungsinya hanya menggulir ke section berikutnya. Setelah amplop dibuka, konten langsung berlanjut dan pengguna dapat scroll normal; jangan tambahkan CTA kedua untuk membuka isi yang sebenarnya sudah terbuka.
- **Jangan render kata/label `Pratinjau`, `Preview`, `Preview · demo data`, atau watermark preview di dalam amplop, cover, galeri, footer, maupun isi undangan.** Jika antarmuka katalog/Studio butuh nama mode, tempatkan hanya di **chrome luar** area undangan, jangan di renderer yang dilihat tamu.
- **Hapus** copy teknis/filler seperti `Preview mengikuti renderer undangan publik`, `Pratinjau menggunakan data contoh`, `Renderer siap digunakan`, `Pratinjau Studio`, dan tulisan abu-abu yang menjelaskan sesuatu yang sudah jelas dari judul atau tombol. Di daftar template, cukup nama tema, indikasi foto bila diperlukan untuk filter, dan tindakan memilih/membuka. Umpan balik error, batasan, akses, atau data yang memang belum ada tetap boleh tampil **di tempat yang relevan** dan dengan kontras terbaca; jangan sembunyikan informasi penting hanya demi mengurangi teks.
- Hindari eyebrow, judul, deskripsi dan label yang mengulang informasi sama. Gunakan copy manusiawi, pendek, berbahasa Indonesia secara default. Judul/nama/kontrol memakai **Title Case** yang wajar (mis. `Galeri Foto`, `Konfirmasi Kehadiran`, `Kirim Hadiah`, `Buka Undangan`); kalimat isi memakai kapitalisasi normal. Nama pelanggan diformat pada tampilan tanpa mengubah nilai database. `DC Organizer` tetap memakai komponen wordmark resmi ketika logo brand diperlukan.
- Jangan memasukkan teks contoh menjadi data undangan publik: `#JourneyWithYou`, nama pasangan contoh, tanggal contoh, rekening, doa, alamat, dan foto contoh hanya boleh berada di fixture demo. Konten sesungguhnya dibaca dari data event. Kutipan dekoratif boleh berupa teks tema yang memang tidak mengaku sebagai kesaksian/ucapan pengguna.
- Studio dan halaman tamu memakai **komposisi yang sama**. Preview publik boleh menonaktifkan pengiriman RSVP atau aksi lain yang menyimpan data, tetapi tidak boleh menambahkan badge, tombol, atau penjelasan yang tidak ada pada halaman tamu.

## 3. Kontrak **15 komponen** wajib

Ada **15 kontrol/komponen desain**: **Amplop Digital + 13 bagian undangan + Musik**. **Musik adalah kontrol pemutar global yang tetap tersedia setelah undangan dibuka, bukan section vertikal ke-15 yang memaksa pengguna scroll ke bawah.** Semua komponen harus dapat diatur ON/OFF melalui sistem toggle Studio yang sudah ada, dan perubahan tampil di live canvas serta tersimpan sesuai kontrak produk. Komponen 1 adalah gerbang sebelum konten; bagian 2–14 muncul setelah dibuka; komponen 15 melayang/menempel secara tidak mengganggu.

| No. | Key tersimpan | Nama di Studio | Komposisi Zen Atelier / isi yang harus tampil |
| --- | --- | --- | --- |
| 01 | `envelope` | Amplop Digital | Kertas krem, amplop bersegel lilin, pengantar sangat singkat, **satu** tombol `Buka Undangan`; buka dengan animasi surat lembut. |
| 02 | `cover` | Sampul / Cover | Ranting bunga atas, pegunungan tinta bawah, `THE WEDDING OF` hanya untuk acara pernikahan, nama pasangan besar di tengah, tanggal nyata, hashtag hanya jika diisi. **Tanpa tombol `Lihat Undangan`.** |
| 03 | `greeting` | Salam Pembuka | Salam dan paragraf undangan asli yang dapat diedit; gaya editorial 1 kolom, ornamen sangat tipis, teks tampil bertahap. |
| 04 | `identity` | Pasangan / Identitas | **Satu foto utama pasangan** bila foto gabungan tersedia (dari koleksi event), atau komposisi foto mempelai yang ada; nama dan hubungan keluarga nyata, quote pendek dari data/teks tema yang tidak mengaku sebagai data pelanggan. **Jangan buat identitas selalu harus dua orang:** event nonwedding mengikuti model acara. |
| 05 | `event` | Detail Acara | Untuk wedding: blok **Upacara Nikah** dan **Resepsi** dengan ikon garis tipis, tanggal/jam/tempat sesuai field yang benar-benar tersedia. Untuk event lain gunakan label kegiatan sesuai kategori. Jangan menganggap waktu selesai sebagai otomatis jam mulai resepsi. |
| 06 | `dateTime` | Tanggal & Waktu | Tanggal dan waktu yang benar, zona waktu, aksen kalender/garis tipis; jangan menyalin ulang seluruh Detail Acara. Prioritaskan tampilan `Save the Date` yang bersih. |
| 07 | `gallery` | Galeri Foto | Foto event asli dalam **galeri editorial yang kaya animasi**: lihat aturan motion khusus di §4. Jika tanpa foto, ilustrasi/empty state jujur, bukan foto pasangan dummy. |
| 08 | `countdown` | Hitung Mundur | Hari, jam, menit, detik dari tanggal acara sebenarnya; angka animasi halus saat berubah, tanpa kedipan berlebihan atau perubahan layout. |
| 09 | `location` | Lokasi | Nama tempat/alamat nyata, **satu** tombol `Lihat Lokasi` jika URL peta valid; tanpa link palsu atau alamat yang diciptakan. |
| 10 | `rsvp` | Konfirmasi Kehadiran | Form bersama: nama tamu dan kuota yang benar, pilihan **Saya Akan Hadir**, **Saya Mungkin Hadir**, **Saya Tidak Dapat Hadir**, pesan opsional bila API mendukung, tombol `Kirim RSVP`, feedback sukses, dan QR unduhan sesuai fitur yang sudah ada. **Jangan buat form palsu di preview yang terlihat seolah-olah berhasil menyimpan.** |
| 11 | `wishes` | Ucapan & Doa | Daftar/kartu ucapan nyata dan form hanya bila backend Wishes bersama benar-benar siap. Jika belum aktif, tampilkan empty state jujur **sependek mungkin** di area section; jangan buat nama tamu/ucapan palsu pada publik. |
| 12 | `gift` | Kirim Hadiah | Rekening/e-angpao milik event, nama bank/penerima dan tombol `Salin Nomor Rekening` yang berfungsi bila data tersedia. Jangan tampilkan nomor rekening/aksi palsu. |
| 13 | `closing` | Terima Kasih | Pesan penutup dengan nama pasangan/host, ilustrasi pegunungan tinta di sisi bawah, ruang kosong luas dan animasi teks lembut. |
| 14 | `footer` | Footer | Penutup identitas tema/brand yang ringkas, tanpa badge mode preview atau paragraf teknis; tidak membuat player musik kedua. |
| 15 | `music` | Musik | Satu pemutar audio bersama: play/pause, status jelas, preferensi user dihormati. Musik dipicu dari gestur klik/tap membuka amplop sesuai kebijakan browser; default dan unggahan mengikuti sistem musik Studio. |

**Toggle:** OFF menyembunyikan komponen terkait tanpa menghapus data. Bila Amplop OFF, Cover muncul langsung. RSVP/Wishes/Gift OFF tidak menghapus data. Jangan membuat tabel customer, form backend, upload foto atau pemutar audio duplikat khusus tema. Perubahan visual harus mempertahankan ID section, pembacaan data dan jalur undangan personal/publik.

## 4. Arah motion — hidup, rapi, dan dapat dikendalikan

### 4.1 Amplop dan alur masuk

Amplop tampil dulu. Satu klik/tap **Buka Undangan** memicu suara/musik yang diizinkan serta transisi surat dan wax seal: lift/flip ringan, opacity dan scale kecil, lalu Cover tampil. Gunakan `motion/react` atau solusi animasi yang sudah terpasang; hindari efek loading layar kosong, pintu kedua atau animasi transisi yang menghalangi akses. Jangan tambahkan tombol `Lihat Undangan` setelah cover. Hormati `prefers-reduced-motion`: ganti gerakan besar dengan perubahan instan atau fade singkat.

### 4.2 Animasi tipografi untuk **semua** bagian

Tidak ada heading yang statis sepenuhnya pada mode motion aktif. Setiap bagian memiliki animasi teks yang terkurasi, misalnya:
- judul: blur ringan 0→jelas bersama fade + naik 8–18px;
- nama pasangan: dua sisi masuk dari kiri/kanan secara elegan lalu diam, bukan berputar atau terus bergerak;
- paragraf: muncul per baris/per frasa melalui fade dan sedikit translate, dengan urutan yang tetap mudah dibaca;
- tanggal/angka/label: stagger singkat, **bukan** animasi per karakter pada seluruh paragraf panjang.

Gunakan variasi antarbagian, tetapi satu tata bahasa animasi yang konsisten (editorial lembut, tidak ramai). Teks harus **tetap dapat dibaca dan selectable**; jangan mengacak huruf, mengubah data, memecah teks dengan cara merusak pembaca layar, atau membuat nama pelanggan panjang terpotong. Umumnya durasi 0,4–0,85 dtk; stagger 0,04–0,12 dtk. Saat section meninggalkan viewport lalu masuk kembali, animasi boleh replay setelah benar-benar keluar dari threshold, bukan reset tiap pixel scroll; hormati reduced motion, keyboard, dan browser yang tak mendukung IntersectionObserver. Jangan animasikan input form ketika sedang diketik.

### 4.3 **Galeri Foto = bagian dengan eksplorasi animasi terbanyak**

Bentuk awal mengikuti mockup referensi: judul `Galeri Foto`, filter **hanya jika ada pengelompokan foto nyata**, kemudian kombinasi satu foto besar dan beberapa foto kecil sebagai **masonry/editorial asymmetrical grid**. Gunakan lebih banyak microinteraction di sini daripada section lain, tetapi **jangan menjalankan semua efek berat sekaligus**. Pilih satu mode utama yang cocok dengan jumlah foto dan sediakan fallback:

1. **Masonry Grid + Hover/Focus Effect (default untuk ≥3 foto):** foto masuk stagger dari tepi secara halus; hover/focus memperbesar foto sedikit (mis. scale 1,03), menggeser overlay tipis/teks jika relevan; sentuh/klik membuka lightbox, bukan efek hover yang tak bisa diakses mobile.
2. **Carousel / swipe gallery (opsi jika foto banyak atau layar sempit):** drag/swipe, tombol sebelumnya/berikutnya dengan label aksesibel, indikator posisi, snap halus; jangan autoplay agresif atau mengganti foto saat user membaca.
3. **Parallax Scrolling Gallery (aksen opsional):** kedalaman ringan pada gambar/background beberapa piksel, **hanya saat masuk viewport** pada perangkat yang mampu dan `prefers-reduced-motion: no-preference`. Nonaktifkan untuk mobile low-power atau bila mengganggu scroll.
4. **Reveal / clip-mask / ken-burns lembut (opsional satu variasi per komposisi):** gambar muncul satu per satu dengan zoom yang selesai dan diam; hindari motion tanpa henti di seluruh foto.
5. **Lightbox:** keyboard Escape menutup, fokus kembali ke pemicu, next/prev bila multi-foto, alt text yang masuk akal, tak menyimpan data baru.

**Pemilihan otomatis yang masuk akal:** 0 foto → ilustrasi kosong jujur; 1 foto → satu gambar editorial besar; 2 foto → diptych; 3–8 → masonry asimetris dengan hover/focus dan lightbox; >8 → masonry yang tetap efisien atau carousel dengan pemuatan bertahap. Mobile tidak bergantung pada hover. Foto harus di-lazy-load, ukurannya responsif, aspek rasio stabil untuk mencegah layout shift, tanpa mengunduh semua album sebelum dibutuhkan. Gunakan `transform`/`opacity`, batasi jumlah animasi bersamaan dan hindari parallax yang memicu jank. Seluruh pengalaman galeri tetap bisa dipakai tanpa JavaScript animasi.

### 4.4 Animasi section lain

Salam tampil bertahap; foto Pasangan reveal seperti lembar album; Detail Acara tiap baris muncul dari samping bergantian; tanggal masuk dengan fade; Hitung Mundur hanya angka berubah secara halus; Lokasi dan Gift microinteraction pada tombol; Ucapan menampilkan kartu bertahap jika ada data; Closing teks muncul di atas sapuan tinta yang **tidak** menghalangi keterbacaan. Animasi per section dapat dinonaktifkan jika komponen memiliki capability animasi; OFF harus menghentikan gerakan, bukan sekadar menyembunyikan kontrol.

## 5. Perilaku per perangkat dan keterbacaan

- **Mobile first:** jadikan enam frame ponsel pada moodboard sebagai ukuran acuan visual, bukan scaling screenshot. Teks tidak terpotong; elemen dekoratif berada di belakang teks dan tidak menutup tombol/form. Area sentuh tombol umumnya ≥44×44px, jarak antaropsi RSVP cukup.
- Desktop memakai kolom undangan dengan lebar bacaan nyaman; jangan membentangkan sebuah kartu undangan ke seluruh layar atau menjejalkan banyak frame kecil. Gunakan ruang kosong agar feel Zen terjaga.
- Hindari grayscale/pale-gray copy yang membuat panel terasa penuh keterangan; teks utama kontras, teks sekunder lebih sedikit. Placeholder memang boleh berbeda, tetapi tetap terbaca.
- Reduced motion: semua informasi, RSVP, galeri, foto, musik dan tombol tetap tersedia tanpa animasi. Jangan menahan tampilan dengan opacity 0 jika observer/JavaScript gagal.
- Jangan mengunduh asset template lain saat Zen Atelier ditampilkan; manfaatkan lazy loading templat serta derivative gambar optimal dari aset yang ada. **Jangan mengubah/menghapus file master PNG dari repo secara diam-diam.**

## 6. Integrasi Studio dan data — tetap satu sistem

Renderer Zen Atelier adalah presentasi, **bukan** layanan kedua. Tetap gunakan katalog `lib/templates/catalog.ts`, section registry `lib/templates/sections.ts`, renderer tamu dan Studio yang sama, foto `InvitationAsset` event yang sama, upload baru melalui Sharp→WebP, musik bawaan/pilihan pengguna, RSVP/QR bersama, dan akses undangan personal yang telah ada. Warna dan font yang dapat diubah di Studio harus terlihat jelas di **semua** bagian yang relevan tanpa membuat kontras buruk atau merusak hierarki moodboard. Pembatasan font/layout dibuat per kemampuan tema, bukan mengunci diam-diam kontrol yang terlihat aktif.

**Catatan kebutuhan data:** gambar moodboard memperlihatkan dua agenda Upacara Nikah dan Resepsi, namun jangan membuat asumsi bahwa field `receptionTime` saat ini adalah waktu mulai resepsi sebelum memeriksa model dan API. Bila belum ada dua waktu mulai/tempat yang terpisah, tulis gap tersebut dan pakai data yang memang ada; jangan membuat tanggal/jam/venue contoh menjadi informasi acara sungguhan.

## 7. Checklist penerimaan sebelum menyebut template selesai

- [ ] Sudah dicocokkan **side by side** dengan moodboard asli untuk Amplop, Cover, Pasangan, Detail Acara, RSVP, Galeri, Ucapan, Hadiah dan Closing pada viewport mobile; beda yang disengaja dicatat.
- [ ] Semua **15 komponen** muncul pada default ON; Amplop → 13 bagian → Musik sebagai kontrol global. ON/OFF bertahan setelah save/reload, termasuk Amplop dan Musik.
- [ ] Tombol awal hanya **Buka Undangan**; **tidak ada** tombol `Lihat Undangan` di Cover; tidak ada label `Pratinjau` apa pun **di dalam** undangan.
- [ ] Teks filler/teknis `Preview mengikuti renderer undangan publik` dan deskripsi abu-abu tak berguna dihapus dari katalog/Studio tanpa menyembunyikan status error/akses yang penting.
- [ ] Semua heading/nama menggunakan kapitalisasi Indonesia yang tepat; nama panjang, venue panjang, kosong/tanpa foto, foto banyak dan nonwedding sudah dites.
- [ ] Font animation masuk/replay dengan halus; reduced motion tidak menyembunyikan teks dan keyboard/screen reader tetap berfungsi.
- [ ] Galeri benar-benar menawarkan masonry editorial dengan hover/focus dan lightbox; carousel/parallax ditambahkan **jika memberi manfaat** dan tidak membuat mobile tersendat; 0/1/2/banyak foto teruji.
- [ ] RSVP publik menyimpan data dan QR sesuai backend yang sudah ada; preview tidak pernah mengirim data customer. Wishes tidak berpura-pura aktif bila backend belum siap.
- [ ] Musik tidak autoplay ketika halaman baru dimuat, gestur `Buka Undangan` bekerja, player tunggal bisa pause/resume; toggle OFF meniadakan player.
- [ ] Foto pelanggan dan data event tidak pernah digantikan foto/nama/rekening contoh moodboard; upload foto tetap Sharp→WebP.
- [ ] Review screenshot mobile & desktop, lintas Light/Dark aplikasi bila relevan, a11y dasar, loading/performa, TypeScript, unit test dan production build **dijalankan dan dicatat hasilnya**; jangan mengklaim PASS tanpa bukti.

**Urutan kerja berikutnya:** cocokkan visual Amplop dan Cover dulu, lalu Pasangan/Detail Acara, RSVP/Galeri, Ucapan/Hadiah/Closing, kemudian komponen pendukung dan penyempurnaan Studio. Untuk setiap tahap gunakan screenshot nyata sebagai pembanding dengan moodboard; jangan menyebut hasilnya `sama persis` sebelum ada pemeriksaan visual owner.
