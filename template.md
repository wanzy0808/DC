# template.md — Panduan Semua Template Undangan DC Organizer

**Cakupan:** Semua template undangan digital yang akan direncanakan, dirancang, dan dibuat bersama ChatGPT. Bukan panduan khusus Zen Atelier ataupun satu gaya visual tertentu.  
**Fungsi:** Brief produksi desain dan interaksi, dari ide → moodboard → aset → contoh layar → coding → integrasi Studio → pengujian.  
**Sumber aturan produk:** prd.md dan AGENTS.md. Jika kontrak produk berubah, selaraskan PRD terlebih dahulu. Jangan mengubah landing page, Pintu, Dashboard, dan template lain hanya karena sedang membuat satu template baru.

## 1. Prinsip untuk setiap template

Setiap template harus punya identitas visual yang berbeda: pilihan komposisi, ritme ruang kosong, karakter tipografi, gaya foto/ilustrasi, ornamen, amplop, susunan galeri, dan motion. Jangan membuat semua tema sebagai satu kerangka identik yang hanya berbeda warna/font. Contoh Zen Atelier adalah referensi **hanya untuk Zen Atelier**; tema baru memakai brief dan moodboard yang disetujui untuk tema itu.

Pakai urutan acuan: (1) permintaan spesifik owner, (2) moodboard/gambar referensi yang bisa benar-benar dilihat, (3) aset yang diperiksa secara visual, (4) ide kreatif untuk adaptasi mobile dan desktop. Jika referensi tidak tersedia atau aset tidak cocok, jelaskan bagian yang belum diketahui; jangan menyatakan hasil sudah sama persis.

Sistem pelanggan tetap satu: katalog template, data event, autentikasi, Studio, foto, musik, RSVP/QR, pengaturan section dan rute undangan publik/personal. Template berhak membuat presentasi visual unik, bukan menduplikasi database dan business logic.

## 2. Alur desain bersama ChatGPT — diulang untuk tiap tema

### Langkah A — Brief

Catat nama tema dan stable key, sasaran jenis acara, kesan yang ingin dicapai, foto atau tanpa foto, palet, pasangan font, batasan layout, pilihan dekorasi, referensi visual, tingkat motion, dan kebutuhan aset. Nama/tanggal/foto demo boleh dipilih bervariasi per tema, tetapi **tidak boleh dipakai sebagai data undangan pelanggan**.

### Langkah B — Moodboard dan screen-by-screen

Buat moodboard warna, font, tekstur, bentuk, komposisi dan contoh tampilan mobile. Siapkan referensi tiap bagian penting: amplop, cover, identitas, detail acara, RSVP, galeri, ucapan, hadiah dan penutup; lengkapi bagian lain dari kontrak 15 komponen. Owner dapat meminta gambar dan aset dipecah satu per satu. Minta persetujuan art direction sebelum coding; jangan menyamarkan contoh moodboard sebagai hasil website final.

### Langkah C — Aset

Lihat gambar sebenarnya sebelum menentukan penempatan. Audit nama file, transparansi, rasio, resolusi, orientasi, ukuran, crop yang aman untuk teks, dan izin penggunaan. Bedakan background, ilustrasi, ornamen, thumbnail dan foto demo. Simpan turunan web pada folder konsisten per template, misalnya public/templates/<slug>/; jangan menghapus atau menimpa master diam-diam. Master berlisensi privat jangan disimpan di repo publik/web root. Optimalkan turunan gambar untuk web; upload baru milik pelanggan tetap melalui pipeline Sharp → WebP yang sudah ada.

### Langkah D — Blueprint seluruh komponen

Untuk masing-masing 15 komponen pada §3 tentukan struktur mobile/desktop, copy yang memang diperlukan, sumber data, dekorasi, animasi, respons interaksi, fallback data kosong, dan apakah pengguna boleh mengubah propertinya lewat Studio. Musik adalah kontrol global, bukan satu layar scroll. Urutan section isi dapat berbeda sesuai kemampuan sistem, tetapi gerbang amplop tetap mendahului konten dan tidak ada komponen wajib yang dihilangkan dari manifest.

### Langkah E — Review, coding, dan perbaikan

Bandingkan mockup dengan moodboard berdampingan: hierarki tulisan, jarak, posisi ornamen, jenis foto, bentuk tombol dan suasana. Jika visual belum tepat, koreksi dahulu; jangan menambah efek untuk menutup perbedaan. Setelah disetujui, coding bertahap menggunakan sistem bersama, jalankan screenshot browser HP/desktop lalu koreksi bersama owner. Catat dengan jelas mana yang baru spesifikasi, mana yang sudah terimplementasi, dan mana yang telah diuji.

## 3. Kontrak wajib: tepat 15 komponen / kontrol

15 = Amplop Digital + 13 bagian undangan + Musik. Komponen 01 tampil sebagai gerbang sebelum isi; komponen 02–14 adalah isi yang dapat di-scroll; komponen 15 adalah pemutar musik global yang selalu mudah dijangkau, **bukan** section panjang setelah footer. Semua komponen punya toggle ON/OFF di Studio yang berlaku pada renderer nyata dan disimpan tanpa menghapus data terkait.

| No. | Key sistem | Komponen | Kontrak fungsional; presentasi boleh berbeda tiap tema |
| --- | --- | --- | --- |
| 01 | envelope | Amplop Digital | Gerbang sesuai tema; satu tombol utama **Buka Undangan**. Transisi buka hanya sekali; jika OFF, langsung masuk ke isi. |
| 02 | cover | Cover / Hero | Nama/judul acara, tanggal, foto atau ilustrasi sesuai tema dan data event. **Tidak ada tombol Lihat Undangan redundan** setelah amplop dibuka. |
| 03 | greeting | Introduction / Greeting | Salam dan pengantar asli, dengan tata letak dan tipografi khas tema. |
| 04 | identity | Identity / Host / Couple | Identitas host/pasangan dan keluarga sesuai kategori acara; tema boleh memakai foto gabungan atau dua foto jika slot mendukung. Jangan memaksa nonwedding menjadi wedding. |
| 05 | event | Event Detail | Jenis/rangkaian acara, tempat, informasi agenda yang benar. Jangan menebak awal resepsi dari field jam selesai; pakai data yang tersedia. |
| 06 | dateTime | Date & Time | Tanggal, jam, dan zona waktu valid, tanpa menggandakan seluruh paragraf Detail Acara. |
| 07 | gallery | Gallery / Media | Galeri foto/video atau artwork empty state yang jujur; utamakan motion dan interaksi kaya tetapi tetap lancar di mobile (lihat §5). |
| 08 | countdown | Countdown | Hari, jam, menit dan detik menuju acara nyata; animasi angka halus tanpa flicker. |
| 09 | location | Location / Maps | Venue, alamat, dan tombol **Lihat Lokasi** hanya ketika URL valid. |
| 10 | rsvp | RSVP / Konfirmasi Kehadiran | Form bersama dan status nyata; pilihan hadir/tentatif/tidak hadir, aksi **Kirim RSVP**, konfirmasi serta QR sesuai backend. Mode contoh tidak mengirim data pelanggan. |
| 11 | wishes | Wishes / Ucapan & Doa | Form dan daftar ucapan nyata hanya saat backend bersama aktif. Bila belum tersedia, empty state singkat dan jujur, bukan kartu tamu palsu. |
| 12 | gift | Gift / E-Angpao | Data rekening/hadiah dari pemilik dan aksi salin yang berfungsi; tanpa rekening contoh sebagai data pelanggan. |
| 13 | closing | Closing | Kalimat penutup, nama host/pasangan sesungguhnya dan koreografi visual khas tema. |
| 14 | footer | Footer | Penutup branding yang ringkas, tanpa penjelasan teknis, watermark contoh, atau pemutar musik kedua. |
| 15 | music | Musik | Satu player play/pause bersama. Musik dipicu oleh gestur pembuka bila diizinkan browser; tidak autoplay pada page load. Dapat dimatikan melalui Studio. |

OFF menyembunyikan komponen terkait **tanpa menghapus data**. Fitur yang belum aktif tidak boleh digambarkan seolah-olah dapat menyimpan atau mengirim. Undangan publik dan kanvas Studio memakai komponen visual yang sama; fitur simpan/submit pada mode contoh harus dilindungi.

### Wajah template di katalog: Cover / Hero, bukan Amplop

Saat menampilkan kartu pilihan template (termasuk tiga smartphone pilihan di `/d-invitation` dan katalog lengkap `/template-design`), ambil **tampilan Cover / Hero sebenarnya** dari renderer temanya: nama/judul, foto/ilustrasi, tipografi, dan dekorasi yang mencerminkan desain utama. **Jangan jadikan Amplop Digital sebagai thumbnail utama**, karena semua calon pembeli perlu melihat karakter visual undangannya sebelum memilih.

**Popup pilihan template juga langsung menampilkan Cover/Hero** agar pengunjung dapat melihat desain dan menggulir isi tanpa harus membuka amplop di tiap klik katalog. **Canvas Invitation Studio tetap harus menyediakan Amplop Digital** sebagai tahap yang dapat dilihat, diklik untuk mencoba animasi buka, dan diulang dengan kontrol Amplop; kontrol Cover dapat menampilkan isi langsung untuk memudahkan penyuntingan. Pilihan tampilan canvas/preview tidak mengubah nilai toggle Amplop tersimpan atau pengalaman tamu, yang tetap dimulai dari Amplop bila ON. Tombol **Buat Undangan** pada popup menuju gateway `/studio` dengan template yang dipilih; pengguna belum login diminta login dahulu, dan bila belum punya acara terkonfigurasi wajib membuat/memilih acara sebelum masuk editor. Template yang dipilih hanya dipasang sebagai perubahan Studio **belum tersimpan** hingga pengguna menekan Simpan Desain.

Ini hanya pengaturan **representasi kartu katalog**: undangan interaktif yang dibuka dari kartu atau dibagikan kepada tamu tetap dimulai dari Amplop Digital ketika toggle-nya ON, lalu Cover dan section selanjutnya. Jangan mengubah urutan buka undangan, 15 kontrol, data pelanggan, atau toggle tersimpan demi thumbnail. Kartu yang menampilkan renderer asli perlu hanya merender cover untuk menghemat performa; saat template belum mempunyai renderer nyata, gunakan gambar contoh cover yang benar dan jangan menampilkan amplop sebagai penggantinya.

### Simpan pilihan tema sampai pengguna siap masuk Studio

Jika pengunjung menekan **Buat Undangan** pada tema di katalog, simpan **hanya key tema** sebagai pilihan sementara pada browser (localStorage + cookie SameSite=Lax dengan masa berlaku tujuh hari), dan bawa key yang sama pada URL selama login → pilih/buat acara → Studio. **Jangan simpan nama/foto/data tamu dalam cookie.** Validasi key terhadap registry template; URL dan browser storage tidak memberi izin Studio atau hak publikasi. Jika pengguna belum login, tampilkan login lalu teruskan tema; jika belum ada acara, arahkan ke input acara dan **setelah acara baru berhasil disimpan** teruskan langsung ke Studio dengan tema tadi. Jika tersedia lebih dari satu acara, pengguna tetap memilih acara tujuan; jangan membuat atau menimpa acara otomatis.

Di Studio, tema pilihan katalog langsung terlihat pada canvas sebagai **perubahan belum tersimpan**. Browser storage bukan pengganti database: desain baru hanya tersimpan untuk acara tersebut setelah **Simpan Desain** berhasil; setelah itu hapus pilihan sementara agar tidak diterapkan diam-diam ke acara lain. Jika pengguna meninggalkan alur sebelum menyimpan, pilihan tema sementara dapat dipulihkan dari browser yang sama selama masa berlakunya. Gagal mengakses cookie/storage tidak boleh memblokir alur URL normal.

**Panel Tema Studio harus siap ratusan template:** menyediakan kolom pencarian dengan tombol/ikon cari yang benar-benar memfokuskan input, filter Semua / Dengan foto / Tanpa foto, urutan Pilihan aktif / Nama A–Z / Nama Z–A, penanda pilihan yang mudah ditemukan, dan tampilan bertahap (mis. 18 kartu + Tampilkan Lagi) agar tidak merender seluruh katalog pada satu waktu. Pencarian bekerja pada nama/kategori/deskripsi dan langsung memperbarui hasil. Tetap pakai Cover/Hero nyata pada setiap kartu, bukan Amplop Digital. Tidak perlu paragraf abu-abu yang menjelaskan hal yang sudah jelas.

## 4. Aturan teks dan CTA — berlaku untuk SEMUA tema dan katalog

**Hapus tulisan yang tidak membantu pengunjung mengambil tindakan.** Jangan tampilkan teks yang menjelaskan mekanisme internal, identitas data contoh, atau cara kerja pratinjau pada kartu template, bawah katalog, panel pratinjau, amplop, cover, atau isi undangan.

**Contoh teks yang harus dihilangkan dari UI:**  
- “Foto dan nama pada pratinjau merupakan data contoh. Untuk memakai foto sendiri, buat acara lalu unggah foto melalui Invitation Studio.”
- “Preview mengikuti renderer undangan publik.”
- “Pratinjau menggunakan data contoh.”, “Renderer siap digunakan.”, “Pratinjau desain Invitation Studio.”, dan keterangan lain yang menjelaskan hal yang sudah jelas.

**Hilang dari UI bukan berarti sistem berubah:** data contoh tetap dipakai pada katalog terisolasi; CTA buat undangan tetap menuju alur login/event yang aman; status penting seperti error, perubahan belum tersimpan, batas upload, dan ketersediaan fitur tetap muncul saat memang diperlukan.

**Aturan tombol dan label:** tombol pertama undangan tepat **Buka Undangan** dalam bahasa Indonesia dan Title Case, bukan BUKA UNDANGAN atau label acak tiap tema. Hapus **Lihat Undangan** di cover jika hanya menggulir isi yang sudah terbuka. Aksi yang benar-benar berbeda tetap memakai nama jelas, misalnya Lihat Lokasi, Kirim RSVP, Salin Nomor Rekening. Tombol mengikuti gaya template; teks/fungsi utama tetap konsisten.

**Tidak ada kata Pratinjau/Preview, watermark mode, badge demo, atau petunjuk developer DI DALAM renderer undangan**, termasuk amplop, cover, galeri, footer. Pada UI Studio boleh ada label kontrol yang benar-benar perlu untuk mengoperasikan editor, tetapi jangan membuat paragraf abu-abu menjelaskan demo. Nama tombol/section memakai kapitalisasi awal kata yang wajar; paragraf memakai ejaan normal. Jangan membuat seluruh tulisan tampak abu-abu pucat; utamakan kontras dan whitespace. Bahasa aplikasi default Indonesia.

Contoh nama, foto, tanggal, hashtag, alamat, ucapan dan rekening pada moodboard **hanya fixture demo**, bukan konten otomatis untuk undangan pelanggan. Jangan menampilkan fake review atau fake ucapan seolah berasal dari tamu.

## 5. Motion: animasi tipografi seluruh template; galeri paling ekspresif

### 5.1 Tipografi dan alur scroll

Setiap tema punya *motion direction* berbeda sesuai gaya, bukan satu preset identik untuk semua template. Semua heading mendapat animasi masuk yang lembut bila animasi aktif: fade, muncul dari kiri/kanan, sedikit slide/blur, mask reveal, atau stagger per baris. Nama host/pasangan bisa mendapat koreografi paling menarik; **jangan menganimasikan seluruh paragraf per huruf sampai sulit dibaca**. Nama panjang tetap wrap baik dan selectable, screen reader membaca teks utuh.

Rentang awal yang boleh disesuaikan: durasi 0,4–0,9 detik, slide 8–24px, stagger 0,04–0,12 detik. Animasi boleh replay setelah bagian **benar-benar keluar viewport dan masuk kembali**, bukan reset setiap pixel scroll. Setelah transisi, teks tetap terlihat. Jika reduced motion aktif, toggle animasi OFF, atau IntersectionObserver gagal, isi tetap muncul langsung. Jangan animasikan input ketika pengguna sedang mengetik; hentikan gerak di luar layar untuk menghemat daya.

Amplop memiliki opening motion sesuai art direction dan tetap **satu aksi Buka Undangan**. Cover tidak perlu CTA kedua hanya untuk scroll. Identity menampilkan foto/nama dengan reveal halus; detail acara bisa masuk bergantian; countdown mengganti angka tanpa mengguncang layout; penutup menggunakan animasi yang mengakhiri cerita dengan nyaman.

### 5.2 Galeri Foto = eksplorasi animasi terbesar

Pilih mode/efek yang cocok dengan identitas tema, jumlah foto dan kemampuan perangkat. **Galeri harus terasa kreatif tetapi jangan menumpuk semuanya sekaligus**: carousel + parallax + scale + autoplay tanpa jeda justru mengurangi kualitas.

- **Masonry Grid + Hover/Focus Effect:** komposisi asimetris; reveal bertahap; hover/focus sedikit zoom dan overlay relevan; pada mobile tap membuka foto.
- **Carousel / Swipe:** cocok untuk koleksi lebih besar atau tema yang horizontal. Snap halus, tombol prev/next yang aksesibel, posisi jelas; autoplay tidak wajib.
- **Parallax Scrolling Gallery:** aksen kedalaman beberapa piksel saat terlihat; nonaktif pada reduced motion atau perangkat yang tersendat.
- **Alternatif per tema:** lightbox, clip-mask reveal, polaroid, scrapbook, filmstrip, editorial split, atau Ken Burns lembut; pilih satu bahasa visual dominan.
- 0 foto → artwork tema/empty state jujur. 1 foto → komposisi tunggal. 2 foto → diptych/dua panel. 3–8 foto → masonry/carousel sesuai tema. Banyak foto → lazy-load dan pengalaman tetap lancar. Jangan membuat chip kategori foto jika tidak ada kategori asli dalam data.

Lightbox keyboard Escape, tombol/fokus dapat digunakan tanpa mouse, alt text bermakna, swipe mobile tidak mengunci scroll halaman. Gambar responsif dan lazy loading; ukurannya stabil untuk mencegah layout shift; batasi efek aktif dan utamakan transform/opacity.

## 6. Library dan kemampuan animasi yang SUDAH kita miliki

**Jangan batasi kreativitas pada animasi fade/slide biasa.** Repo DC Organizer sudah punya beberapa library yang dapat dikombinasikan untuk membuat masing-masing template memiliki gerak, kedalaman, dan interaksi berbeda. Daftar ini diverifikasi dari `package.json` dan stack proyek; *terpasang* bukan berarti setiap efek di bawah sudah terimplementasi, sudah lolos uji performa, atau boleh diaktifkan sekaligus.

| Library / teknologi | Kemampuan untuk template undangan | Contoh penerapan yang relevan |
| --- | --- | --- |
| **Motion** (`motion/react`) | Animasi komponen React, variants/stagger, gesture hover/tap/drag, enter/exit, layout transitions, animasi berbasis scroll. | Amplop terbuka, nama pasangan masuk dari kiri-kanan, halaman foto muncul bergantian, carousel geser, kartu ucapan muncul ketika terlihat. |
| **GSAP** (`gsap`) | Timeline koreografi lebih kompleks, urutan animasi presisi, scrub/tween saat scroll bila plugin dan integrasinya tersedia. | Pembukaan undangan multi-lapis, teks/mask reveal, gerak ornamen mengikuti scroll, parallax galeri yang halus. Pastikan plugin yang dipakai memang tersedia sebelum mengimpornya. |
| **Three.js + React Three Fiber** (`three`, `@react-three/fiber`) | 3D/WebGL, depth, kamera, cahaya, material dan interaksi scene. | Amplop atau objek dekoratif 3D, efek ruang/portal mini, album foto berlapis dalam satu tema yang memang memerlukan 3D. Aktifkan hanya pada tema yang sesuai dan sediakan fallback 2D. |
| **React Konva + Konva** (`react-konva`, `konva`) | Kanvas interaktif 2D untuk komposisi objek dan manipulasi posisi/rotasi. | Scrapbook, stiker, potongan kertas, atau album foto yang bisa dipindahkan bila desainnya benar-benar membutuhkan interaksi kanvas. Jangan memakainya untuk teks utama atau form RSVP yang perlu aksesibel. |
| **Tailwind CSS v4 + `tw-animate-css` + CSS native** | Styling responsif, keyframes, transitions, transforms, clip-path, mask, gradients, scroll snap dan efek hover/focus ringan. | Paper-fold, tombol, floating petals, reveal gambar, masonry editorial, filter foto, text masking, microinteraction tanpa beban JavaScript besar. |
| **Lucide React** (`lucide-react`) | Ikon vektor yang konsisten; CSS/Motion bisa memberi transform, reveal atau gerakan halus. | Kontrol musik, panah carousel, penanda lokasi, RSVP, efek indikator scroll seperlunya. |
| **Next.js 16 + React 19** | Komposisi komponen, lazy loading lewat dynamic import, optimasi/pemisahan asset dan state interaktif. | Hanya unduh implementasi tema yang dibuka; mount galeri berat saat diperlukan; hindari mengunduh 3D pada tema 2D. |
| **Sharp** (`sharp`) | Pengolahan aset gambar dan konversi WebP di sisi server, **bukan** mesin animasi. | Optimalkan foto pengguna dan turunan gambar tema agar gallery/parallax tetap ringan di HP. |

**Catatan akurasi:** `@react-three/drei` **tidak tercantum dalam dependency `package.json` saat panduan ini diperbarui**. Jangan menganggapnya tersedia tanpa pemeriksaan dan persetujuan untuk menambah dependency. Native `IntersectionObserver`, `requestAnimationFrame`, CSS dan `prefers-reduced-motion` juga dapat dipakai tanpa menambah library. Jangan memilih library hanya karena tersedia: gunakan opsi paling sederhana yang mampu menghasilkan desain sesuai moodboard dan menjaga performa.

### Contoh kombinasi efek menurut bagian dan arah tema

- **Amplop:** Motion untuk gerak flap, segel, surat, dan crossfade; GSAP timeline jika pembukaannya memiliki banyak tahap; 3D hanya bila brief meminta amplop 3D, bukan sebagai standar semua tema.
- **Cover dan tipografi:** variants/stagger Motion atau timeline GSAP untuk judul muncul dari kiri/kanan, clip-mask reveal, perubahan tracking, dan decorative strokes. Tetap gunakan teks HTML nyata dan jangan membuat elemen dekoratif menutupi nama.
- **Galeri (bagian paling kaya animasi):** CSS Grid/Masonry + Motion untuk layout/hover/focus, drag carousel untuk swipe, GSAP *atau* animasi scroll Motion untuk parallax, mask reveal, lightbox dengan enter/exit, dan efek depth 3D bila sesuai tema. Pilih satu teknik utama dan paling banyak beberapa aksen; jangan menjalankan semua engine atas elemen yang sama.
- **Countdown, lokasi, RSVP, hadiah:** animate angka/pergantian state dan feedback tombol dengan Motion/CSS; utamakan respons cepat dan aksesibilitas, jangan menggeser field saat pengguna mengetik.
- **Closing:** timeline tipografi, ilustrasi bergerak pelan, partikel ringan atau fade yang mengikuti art direction; animasi selesai dengan seluruh pesan tetap terbaca.

### Aturan pemilihan library sebelum coding

1. Catat **efek → library → alasan → kebutuhan asset → fallback mobile/reduced-motion** dalam brief tema. Untuk efek sederhana, utamakan CSS atau Motion; untuk koreografi berantai GSAP; untuk 3D Three/Fiber; untuk kanvas interaktif 2D Konva.
2. Pastikan kompatibilitas React/Next, dependency serta plugin yang benar-benar terpasang melalui repo. Hindari memasang paket baru atau mencampur Motion dan GSAP pada properti `transform`/opacity yang sama tanpa orkestrasi jelas.
3. Hormati `prefers-reduced-motion`, kontrol animasi ON/OFF bila tersedia, keterbacaan teks, keyboard/touch, dan fallback bila WebGL gagal. Animasi tidak boleh menahan isi pada opacity 0 atau menghambat RSVP.
4. Lazy-load hanya kemampuan berat yang digunakan tema aktif. Batasi animasi bersamaan, hentikan pekerjaan ketika section tidak terlihat, hindari layout thrashing dan parallax berlebihan; evaluasi HP kelas menengah, bukan desktop saja.
5. Nilai kualitas dari **kesesuaian dengan moodboard dan hasil nyata**, bukan jumlah efek/library. Satu tema bisa minimal dan tenang; tema lain bisa sinematik, playful, scrapbook atau 3D. Tetap berbeda identitas meskipun memakai library bersama.

## 7. Studio, data, dan batasan implementasi

Satu registry template pada lib/templates/catalog.ts digunakan katalog, /d-invitation, dan Studio. Section keys mengikuti lib/templates/sections.ts; renderer pelanggan dan kanvas Studio berbagi tampilan nyata. Tema baru yang masih berupa gambar boleh muncul sebagai referensi visual tetapi **belum dapat dipilih/dipublikasikan** sampai renderer siap.

Foto pelanggan dibaca dari pustaka event yang sama, bukan di-upload ulang untuk setiap tema. Template tanpa foto tidak memaksa foto walaupun event memiliki aset. Upload foto baru tetap melewati Sharp → WebP. Musik satu player, pilihan pemilik event mengungguli default; penghormatan aturan autoplay browser dan mute. RSVP serta QR memakai sistem yang telah ada; jangan membuat tabel atau endpoint palsu demi demo. Wishes belum boleh ditampilkan sebagai layanan aktif sebelum backend siap.

Pengaturan font/palet hanya untuk properti yang didukung template dan harus tampak di semua bagian relevan tanpa menghilangkan identitas visual atau mengorbankan kontras. Kemampuan animasi per section dinyatakan jelas bila disediakan. Gunakan lazy loading agar membuka satu template tidak mengunduh kode/aset seluruh katalog. Pertahankan rute publik/personal, validasi server, pembayaran dan akses sesuai PRD.

## 8. Checklist sebelum menyebut sebuah tema selesai

- [ ] Brief, moodboard, dan aset tema tersebut sudah diperiksa serta disetujui owner; tidak menggunakan visual Zen Atelier pada tema lain tanpa alasan.
- [ ] Semua 15 komponen tersedia; amplop mendahului isi, musik satu kontrol global; ON/OFF tersimpan dan terpantul di kanvas serta undangan tamu.
- [ ] Tombol utama bertuliskan **Buka Undangan**, tanpa tombol Lihat Undangan redundan dan tanpa label Pratinjau di dalam undangan.
- [ ] Katalog/Studio bebas copy pengantar data contoh, klaim renderer, dan teks abu-abu penjelasan tak perlu; error dan informasi penting tetap jelas.
- [ ] Foto/nama/venue/rekening demo tidak pernah menjadi konten pelanggan; data kosong, nama/venue panjang, nonwedding, dan foto banyak diuji.
- [ ] Animasi heading halus dan dapat replay setelah keluar-masuk viewport; reduced motion, keyboard dan pembaca layar tetap berfungsi.
- [ ] Galeri punya komposisi serta efek sesuai karakter tema; kondisi 0/1/2/banyak foto dan sentuhan mobile diperiksa.
- [ ] Library animasi dipilih dan digunakan sesuai brief/moodboard (CSS/Motion/GSAP/Three/Fiber/Konva bila relevan), bukan diasumsikan semua dipakai; dependency, reduced motion, fallback dan performa mobile diperiksa.
- [ ] RSVP publik, QR, tautan peta, Gift, musik dan seluruh kontrol yang tersedia benar-benar berfungsi; mode demo tidak menulis data pelanggan.
- [ ] Screenshot HP dan desktop dibandingkan side by side dengan referensi tiap layar; perbedaan yang belum selesai dicatat, bukan diklaim sama persis.
- [ ] TypeScript, tes, build, performa aset dan aksesibilitas dijalankan, dengan hasil nyata dicatat di PRD; push GitHub saja tidak berarti semua tes lulus.

**Cara pakai di chat selanjutnya:** “Buat template [nama tema] mengikuti template.md; mulai brief, moodboard, contoh 15 komponen, dan aset satu per satu sebelum coding.”  
**Penting:** dokumen ini adalah standar produksi; keberadaan checklist bukan bukti setiap template sudah memenuhi semua poin.
