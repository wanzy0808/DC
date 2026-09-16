# PRD Tambahan

## 2026-09-15 — Navbar Language & D-Invitation FAQ Buttons

- Navbar language selector (`ID` / `EN`) sekarang tanpa border kotak luar.
- Bahasa aktif tetap diberi visual active state agar pilihan locale terlihat jelas.
- `Button` canonical diperbaiki agar utility class eksplisit seperti `border-0` dapat meng-override default border tanpa mengubah visual default button lainnya.
- Tombol FAQ pada D-Invitation menggunakan `border-0` sehingga tidak memiliki border luar tambahan; border container FAQ dan kotak chat tetap tidak diubah.

## 2026-09-15 — D-Invitation Favorite Preview & Studio Protection

- Bagian Koleksi Favorit sekarang memakai label Pratinjau untuk aksi preview.
- Pratinjau template dibuka dalam mockup HP dengan frame, bezel, tombol samping, dan area undangan yang dapat di-scroll.
- Route Studio sekarang melakukan server-side authentication check dan mengarahkan pengguna yang belum login ke /login.
- Tampilan Studio client dipisahkan dari route server agar proteksi akses terjadi sebelum Studio dirender.

Affected files:
- components/D-Invitation/TemplateSection.tsx
- components/InvitationStudio/InvitationEditorPage.tsx
- app/dashboard/editor/page.tsx

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — Workspace Sidebar Typography

- Font navigasi utama pada sidebar Workspace/Dashboard diperbesar dari `11px` menjadi `14px` agar label seperti Beranda, Rangkaian Acara, Undangan Digital, RSVP, dan Manajemen Tamu lebih mudah dibaca.
- Struktur sidebar, spacing, warna, ikon, dan behavior navigasi tidak diubah.

Affected files:
- app/[dashboard]/page.tsx

Commit:
- `7ec6a082f527eab6f74008cdabfd15b776db2d13`

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — D-Invitation Single Package

- Bagian paket pada halaman D-Invitation sekarang hanya menampilkan **1 paket Undangan Digital**.
- Paket yang ditampilkan adalah `INVITATION_BASIC` dengan harga **Rp 300.000**.
- Kartu paket otomatis berada di tengah karena hanya ada satu pilihan.
- Copy section disesuaikan agar menegaskan satu paket lengkap, dalam Bahasa Indonesia dan English.

Affected files:
- app/d-invitation/page.tsx

Commit:
- `4471ce72b1493090c49f52d30faa1e0b1d2f7512`

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — Manual Payment, Invoice & Admin Activation

- CTA **Pilih paket** sekarang mempertahankan paket yang dipilih dan mengarahkan user ke alur checkout.
- User yang belum login diarahkan ke login dengan `next` destination; setelah autentikasi tujuan checkout tetap dipertahankan. Alur registrasi juga mempertahankan destination.
- Ditambahkan `PaymentOrder` sebagai record transaksi/invoice terpisah dari entitlement paket aktif pada `Payment`, sehingga riwayat pembelian dan upgrade dapat disimpan tanpa menimpa transaksi sebelumnya.
- Checkout manual menampilkan nomor invoice, paket, nominal, rekening pembayaran dari environment, dan status verifikasi.
- Bukti transfer dapat di-upload langsung sebagai JPG/PNG/WEBP/PDF maksimal sekitar 3 MB atau diberikan sebagai URL. Untuk MVP upload disimpan sebagai data URL pada record order; storage object/private storage dapat diganti kemudian tanpa mengubah alur checkout.
- Ditambahkan pengiriman invoice email opsional melalui Resend apabila `RESEND_API_KEY` dan `RESEND_FROM_EMAIL` tersedia.
- Paket **tidak otomatis aktif** setelah order dibuat atau bukti dikirim. Admin/Owner/Finance harus menekan **Aktifkan paket** setelah verifikasi manual.
- Panel Admin pembayaran diperluas untuk melihat invoice, user, paket, nominal, bukti transfer, lalu menolak atau mengaktifkan paket.
- Role `FINANCE` sekarang dapat masuk ke area admin dan memproses verifikasi pembayaran.
- Menu **Transaksi** diperbarui agar membaca `PaymentOrder`, menampilkan nomor invoice, status, nominal, bukti, dan tombol membuka invoice.
- Upgrade dari `INVITATION_BASIC` ke `GUESTBOOK_DIGITAL` menghitung **selisih harga paket**, bukan menagihkan Rp 2.000.000 penuh.
- Struktur payment tetap manual dan belum bergantung pada payment gateway; provider nantinya dapat ditambahkan di level order tanpa mengubah alur entitlement.

Affected files:
- prisma/schema.prisma
- prisma/migrations/20260915170000_add_payment_orders/migration.sql
- app/api/orders/route.ts
- app/api/orders/[id]/route.ts
- app/checkout/[id]/page.tsx
- components/Payments/CheckoutClient.tsx
- app/api/admin/payments/route.ts
- components/Admin/AdminPayments.tsx
- app/admin/layout.tsx
- app/api/transactions/route.ts
- app/transactions/page.tsx
- app/packages/page.tsx
- components/Layout/PackageSelector.tsx
- components/Marketing/PackageShowcase.tsx
- app/login/page.tsx
- components/Layout/Navbar/RegisterDialog.tsx
- components/Layout/Navbar/BurgerMenuContent.tsx
- app/api/auth/google/route.ts
- app/api/auth/google/callback/route.ts
- lib/email.ts
- .env.example

Validation: belum diverifikasi dengan build/CI. Migration Prisma dan konfigurasi email perlu dijalankan/dikonfigurasi pada environment deployment sebelum fitur digunakan secara produksi.

## 2026-09-15 — Admin Finance Payment Panel

- Panel pembayaran Admin sekarang memiliki ringkasan jumlah order berdasarkan `Pending`, `Paid`, `Rejected`, dan seluruh order.
- Ditambahkan filter status agar Finance/Admin dapat fokus pada antrean verifikasi tanpa mengubah data transaksi.
- Ditambahkan detail invoice dalam modal yang menampilkan paket, nominal, pemesan, status, timestamp, catatan, serta bukti transfer.
- Bukti gambar dapat dipreview langsung; PDF/URL tetap dapat dibuka di tab baru.
- Tombol aksi mengikuti primitive `Button` canonical tanpa styling warna custom per halaman.
- Status order diselaraskan dengan enum `PaymentOrder` yang saat ini menggunakan `PENDING`, `PAID`, `FAILED`, dan `CANCELLED`.

Affected files:
- components/Admin/AdminPayments.tsx

Commit:
- `40d5467a3c905637bc10a3f8c7c4c938176e4fc9`

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — Role-Based Owner, Admin & Designer Dashboards

- Dashboard internal mulai dipisahkan berdasarkan role menjadi **Owner**, **Admin/Finance**, **Designer**, dan **User** tetap menggunakan Workspace `/dashboard`.
- Owner mendapatkan `/owner` khusus untuk melihat jumlah akun, daftar nama/email/role, jumlah undangan/order, membuat akun `Admin`, `Designer`, atau `User`, serta mengubah data akun.
- Perubahan password akun oleh Owner tidak langsung diterapkan: sistem membuat confirmation token sekali pakai dan mengirim link konfirmasi ke `OWNER_CONFIRMATION_EMAIL` atau email Owner saat ini.
- Admin/Finance mendapatkan `/admin` untuk membaca database user/undangan, melihat template yang dipilih, membantu mengubah nama pengantin pria/wanita, preview undangan, dan membantu publish/draft. Data user lainnya tetap read-only dari panel operasional.
- Panel pembayaran Admin tetap tersedia untuk verifikasi manual dan aktivasi paket.
- Designer mendapatkan `/designer` untuk upload template ke server, membuat nama template, tag, dan nomor template otomatis 3 digit mulai dari `001` tanpa duplikasi.
- Upload Designer mendukung preview JPG/PNG/WEBP maksimal 5 MB serta file template ZIP/HTML/JSON maksimal 25 MB; file disimpan pada `public/uploads/templates/<templateNo>/` dan metadata tersimpan di PostgreSQL.
- Dashboard Designer menampilkan jumlah template milik designer dan jumlah penggunaan/penjualan berdasarkan undangan yang memakai `templateKey` template tersebut.
- Login manual dan Google OAuth sekarang mengarahkan role ke dashboard yang sesuai.
- Role `DESIGNER` ditambahkan tanpa menghapus role `EDITOR` lama untuk menjaga kompatibilitas.
- Ditambahkan audit log untuk pembuatan/perubahan akun Owner dan bantuan perubahan data/publikasi Admin.
- Admin sekarang dapat membuat invoice **CUSTOM_DESIGN** secara manual untuk user/invitation tertentu dengan nominal yang ditentukan Admin, mengirim invoice melalui email user, dan memasukkannya ke antrean verifikasi pembayaran yang sama.

Affected files:
- prisma/schema.prisma
- prisma/migrations/20260915190000_add_roles_templates/migration.sql
- app/owner/layout.tsx
- app/owner/page.tsx
- components/Owner/OwnerDashboard.tsx
- app/api/owner/users/route.ts
- app/api/owner/account-confirmation/route.ts
- app/owner/account-confirmation/page.tsx
- app/admin/layout.tsx
- app/admin/page.tsx
- components/Admin/AdminOperations.tsx
- app/api/admin/operations/route.ts
- app/designer/layout.tsx
- app/designer/page.tsx
- components/Designer/DesignerDashboard.tsx
- app/api/designer/templates/route.ts
- app/login/page.tsx
- app/api/auth/google/callback/route.ts
- lib/email.ts
- .env.example

Commits:
- `b2a0bc05effa6c2144e1a9187b4075ac8862c7ea`
- `56d2ef27cac215675472b654c7e1cf1d88922772`
- `9d54e646347c4cd73ef4537818b5ef8992db1774`
- `35fbd1029eece6b549a540df69efd6def02b7076`
- `d0808836c04f7601f30e4281ada74bfbc386ca7b`
- `48b90fa23625096860d7fb4edececee16f56c2d5`
- `f535889c340aacf66f7b9545cea85f83f6482a88`
- `bc35606b05549c7ab9a8089c8909fead4a74a8ed`
- `46f5eb8a86e05b18e55fe882e`
- `c52b30a900bcb37fb0b0caf158ea75ccb3925b30`
- `9142901b9138f7101abc31a038dc145eac74c975`
- `ab389e37747d14dd05a6d59ed0eb7cab75feba52`
- `1a5fc05b3e12563ca0c764580a64ec1ea679f6c1`
- `f746a56a3d52976d39a1a8a4ac025ea984e21192`
- `526edf93b83dcde6fc1d6172f309f2d4dc129afd`
- `0c0e72437b67b76a62fc01cee7a98c29423cc656`
- `81fb60d1245087a9f1b8d8375efb00c10e1d25b9`
- `cd2d0b91977b41840eb023333c474c90013d7455`
- `58e5b12d48f0f2b81d552bf004f8c99e29a04d85`
- `a2a8b42dcc983e6823838cb6c806f7f5d7f1305a`
- `00fbaefd0d7a387b087e564ab666d3e2d53443c8`
- `3e248fa880731b757af9eaabb4dba6eb330430d3`

Validation: belum diverifikasi dengan build/CI. Prisma migration dan konfigurasi `OWNER_CONFIRMATION_EMAIL`/Resend perlu diterapkan pada environment deployment. Upload file template menggunakan filesystem server, sehingga deployment production perlu memastikan `public/uploads` writable dan persistent.

## 2026-09-15 — Role Dashboard Routing & Designer Template Integration

- Route `/dashboard` sekarang melakukan redirect server-side berdasarkan role: `OWNER` → `/owner`, `ADMIN`/`FINANCE` → `/admin`, dan `DESIGNER`/`EDITOR` → `/designer`. User biasa tetap berada di Workspace `/dashboard`.
- Ditambahkan endpoint publik `GET /api/templates` yang hanya mengekspos `DesignerTemplate` berstatus `PUBLISHED`, termasuk nomor template, nama, tag, preview image, dan file template.
- Koleksi template D-Invitation sekarang mengambil template Designer yang sudah published dari database sehingga template baru dapat muncul di koleksi tanpa mengubah kode katalog setiap kali ada upload.
- Panel Admin sekarang menerima metadata template yang sedang dipilih user, termasuk nomor template, preview image, designer, tag, dan file template, sehingga Admin dapat memeriksa template yang digunakan sebelum membantu user.
- Perhitungan `salesCount` Designer sekarang hanya menghitung invitation yang memiliki entitlement/payment `PAID`, bukan seluruh invitation draft yang kebetulan menyimpan `templateKey`.
- Penomoran template Designer tetap 3 digit dan diperkuat dengan retry ketika terjadi collision pada unique constraint `templateNo`; folder file yang gagal dibuat dibersihkan agar tidak meninggalkan asset yatim.

Affected files:
- app/dashboard/layout.tsx
- app/api/templates/route.ts
- app/api/designer/templates/route.ts
- app/api/admin/operations/route.ts
- components/Admin/AdminOperations.tsx
- components/D-Invitation/TemplateSection.tsx

Commits:
- `506f6c07e9f3d176db787d6de39da55a8cdbca1f`
- `db8304561d95debf041e475617acf343e9ada494`
- `d4e84508f24af6afcfa498299b87f068ecf439f1`
- `fa58f531e5c9a8b909b59da3afb02b590b6278dd`
- `24b711b3f392c5dc0d085d7f6f310a232a207939`
- `940f57e44bb00ee4252513a0cc80c8e332daf343`

Validation: belum diverifikasi dengan build/CI. Endpoint/template integration membutuhkan Prisma schema yang sudah memiliki `DesignerTemplate` dan environment deployment yang dapat membaca file upload pada `public/uploads`.

## 2026-09-15 — Dark Mode Language Toggle Alignment

- **Light mode tidak diubah.** Styling dasar ID/EN dipertahankan.
- Hanya tombol bahasa `ID` / `EN` yang diperbaiki pada dark mode agar active state menggunakan treatment visual yang sama dengan light mode: background active rose transparan, teks rose, dan hover treatment yang sama.
- State inactive dark mode juga disamakan dengan light mode: transparan dengan teks rose ber-opacity rendah dan hover tint ringan.
- Tidak ada perubahan pada tombol theme, navbar lain, background, glow, atau komponen di luar tombol bahasa.

Affected files:
- components/I18n/LanguageToggle.tsx

Commit:
- `8e8042acf223e82edc4864115932e832caf35cfc`

Validation: belum diverifikasi dengan build/CI.

## 2026-09-15 — Figma Classic Invitation Template

- Desain Figma yang diberikan diimplementasikan sebagai template undangan baru bernama **Figma Classic** dengan layout satu kolom, bingkai tipis stone, tipografi editorial klasik, hero foto berbentuk arch, divider, event cards, RSVP, Gift, dan closing.
- Konten hardcoded dari contoh Figma tidak dipakai sebagai data undangan. Nama pasangan, tanggal, lokasi, waktu, deskripsi, foto, Maps, RSVP, dan informasi rekening dibaca dari data Invitation/asset yang sudah ada.
- Template diregistrasikan ke katalog Studio dengan key `figma-classic` sehingga dapat dipilih sebagai desain undangan.
- Public invitation route memilih renderer Figma Classic ketika `templateKey` menggunakan `figma-classic`, sementara renderer existing tetap dipertahankan untuk template lain.
- Public invitation sekarang memuat `assets` dan field gift bank yang diperlukan oleh renderer template.
- Brand footer existing yang masih bertuliskan legacy `DC Wedding` pada renderer lama diperbaiki menjadi `DC Organizer`.

Affected files:
- components/PublicInvitation/FigmaClassicTemplate.tsx
- lib/templates/catalog.ts
- app/invite/[slug]/page.tsx
- components/PublicInvitation/PublicInvitation.tsx

Commits:
- `a61c878578241ad9ab7191ae940693e559fb5e27`
- `5f963c9c0d1b396a33e7aa523859b537f8fb8fff`
- `00c77ed7c91b2eed4eb121c2b2ac613b1df2ac57`
- `daf97ecbc9776075b4d40ed96c489ad65c615b98`

Validation: belum diverifikasi dengan build/CI. Template sudah terhubung ke database invitation dan payment/password gate existing; visual/build verification masih perlu dilakukan pada environment aplikasi.

## 2026-09-16 — Dashboard Theme Consolidation & CSS Cleanup

- `app/globals.css` sekarang menjadi single source of truth untuk theme dan dashboard styling.
- Styling yang masih diperlukan dari `dashboard-theme.css` dan `design-overrides.css` dipindahkan/dirapikan ke `globals.css`; conflicting visual overrides tidak dipertahankan.
- Brand theme legacy dipindahkan ke semantic theme tokens; dark-mode primary tetap canonical Rose `#C07A84` dan button foreground mengikuti aturan canonical button.
- `app/layout.tsx` tidak lagi mengimpor stylesheet theme tambahan.
- `app/dashboard-theme.css`, `app/brand-theme.css`, dan `app/design-overrides.css` dihapus karena styling-nya sudah dikonsolidasikan.
- Gradient/radial dashboard background dan gradient button layer tidak diperkenalkan kembali. Dashboard memakai canvas netral dengan Rose hanya sebagai accent.
- Dashboard shell, form, table, dialog, WhatsApp help button, dan Invitation Studio diarahkan ke token semantic yang sama agar visual antar halaman lebih konsisten.
- Google Fonts CSS import lama di `globals.css` dihapus karena typography aplikasi sudah menggunakan `next/font/google` pada `app/layout.tsx` sesuai engineering rules.

Affected files:
- app/globals.css
- app/layout.tsx
- app/dashboard-theme.css (deleted)
- app/brand-theme.css (deleted)
- app/design-overrides.css (deleted)

Commits:
- `964934a9a3eb1dc23986e7f0479e6d8e088e078d` — globals/theme consolidation
- `d0de6710783667aa9a42b3257433510e00c3fd06` — remove theme imports
- `209b219997e8605f1cf781c7395249684887547e` — remove dashboard theme
- `a84ebc87f3e7942f50494277baad01762f578663` — remove brand theme
- `5a97657b7f089fc9777eb886bf77015a805313c5` — remove design overrides

Validation: build/CI belum diverifikasi pada saat pencatatan ini. Langkah berikutnya adalah menjalankan build/CI dan audit halaman/component dashboard satu per satu untuk menemukan visual yang masih menyimpang dari canonical system.
