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
