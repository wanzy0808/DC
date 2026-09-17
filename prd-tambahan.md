# PRD Tambahan — Desktop Workspace & Content Label Correction

**Date:** 17 September 2026  
**Status:** Supplemental user-requested delta. Active/canonical requirements are mirrored into `prd.md`; implementation history remains in `prd1.md`.

## Desktop width correction
- Primary desktop header/content/footer containers target **80vw**.
- Page-level UI must not regress to fixed `max-width: 1400px` / `92vw` wrappers that leave excessive unused space on wide monitors.
- Dashboard chrome/background may span the viewport, while the content workspace targets 80vw and is capped by the actual main-pane width so the sidebar cannot create horizontal overflow.
- Compact controls/forms may stay content-sized when readability benefits; data tables remain content-driven rather than stretched unnaturally.

## Content numbering correction
- Do not use decorative sequence numbering in page/component copy.
- Examples to remove/avoid: `Workspace / 01`, `Acara 02`, `Undangan 03`, numbered feature labels, numbered cards, or index-based fallback titles.
- Replace them with descriptive labels such as `Workspace`, `Acara`, `Undangan Digital`, or `Acara tanpa judul`.
- Numbers that represent actual user/product data are not decorative and remain allowed: dates, times, prices, counts, capacities, quotas, child order, phone numbers, and metrics.

## Implementation scope
- Dashboard shell/header/content width behavior.
- Beranda and dashboard tab headers.
- Rangkaian Acara event list.
- Undangan workspace cards.
- Personal Invitation workspace.
- WA Blast workspace.
- RSVP, Manajemen Tamu, Usher, and feature-gate wrappers.
- Event scope fallback labels.
- Public/application page-level containers: homepage, Event Planner, Digital Invitation, Guestbook, Packages, Transactions, Checkout, Navbar, and Invitation Studio header.
- Backoffice page-level workspaces: Admin, Owner, and Designer; inner modal/text readability constraints remain intentionally compact.

## Decorative numbering audit follow-up
- Audit lint-like review after the width cleanup found remaining presentational sequence numbers in Event Planner package cards, planner service cards, Guestbook feature tabs, burger navigation, and RSVP list/export rows.
- Those sequence numbers are removed; the labels/content now stand on their own without `01`, `02`, `#`, or index-based decoration.
- Functional numeric data remains untouched, including seating numbers, time picker hours/minutes, prices, dates, quotas, counts, child order, phone numbers, and template identifiers.

## Landing page Pintu proportion correction
- Pintu remains the primary visual navigation surface on the landing page and must not be reduced into a small secondary card treatment.
- Desktop Pintu cards receive only a restrained size increase so the three-door carousel remains balanced inside the right-side landing workspace.
- Typography inside an active Pintu is increased for title, tags, description, and action so it remains legible relative to the card size.
- Closed-door title typography is increased and the unused decorative number slot is removed entirely.
- Landing hero heading uses a smoother responsive scale so it does not overpower the Pintu carousel around standard desktop widths.
- The Event Planner landing CTA uses the canonical `/event-planner` route instead of the legacy `/wedding-planner` compatibility path.

## Event Planner header correction
- Event Planner is a public consultation/service page and does not show a dedicated `Client Login` button in its page hero/header.
- Removing that page-specific action does not remove the application login route or global authentication flow.

## Landing hero copy balance
- Teks di kiri Pintu harus mendukung visual Pintu, bukan mengalahkannya.
- Headline dibuat lebih singkat, lebar teks dibatasi, dan skala desktop diturunkan sedikit.
- Deskripsi dan capability label dibuat lebih ringkas agar mudah dipindai.
- Tombol `Lihat Detail` / `View Details` memakai title case normal, bukan forced uppercase.
- Jarak antar elemen hero dibuat lebih rapat agar tinggi blok teks seimbang dengan carousel Pintu.

## Burger navigation simplification
- Burger/sidebar navigation difokuskan untuk berpindah halaman.
- Nomor dekoratif pada header dan item menu dihilangkan.
- Deskripsi produk dan teks sekunder dihilangkan dari panel.
- Menu memakai label singkat dan icon yang konsisten dengan navigation system aplikasi.

## Burger navigation correction — supersedes flat-list behavior
- Burger menu memakai treatment navigation button seperti sidebar Dashboard, bukan daftar garis datar.
- `Layanan` kembali menjadi parent menu dengan submenu yang dapat dibuka/tutup.
- Submenu `Layanan` berisi Event Planner, Digital Invitation, dan Guestbook Digital.
- Beranda, Paket, Template, dan Bantuan tetap tersedia sebagai navigation button utama.
- `Masuk` dan `Daftar` wajib tersedia di burger menu; `Daftar` tetap membuka registration dialog existing.
- Tidak memakai nomor urutan dekoratif dan tidak mengembalikan description panjang di setiap item.

## Landing integrated 80vw composition
- Landing tetap menggunakan primary desktop width **80vw**, tetapi ruang tambahan harus dipakai untuk menyatukan copy dan Pintu, bukan menciptakan dead space di tengah.
- Blok copy kiri boleh sedikit lebih lebar dan description boleh sedikit lebih lengkap selama hierarchy tetap ringkas.
- CTA memakai garis aksen horizontal halus sebagai directional bridge menuju Pintu.
- Pintu carousel digeser masuk ke arah copy pada desktop sehingga dua sisi terasa sebagai satu hero composition.
- Orbit horizontal Pintu diperlebar dan vertical depth sedikit ditambah agar animasi mengisi wide-screen workspace dengan lebih baik.
- Active Pintu sedikit lebih besar pada desktop; back Pintu tetap lebih kecil untuk mempertahankan depth hierarchy.
- Standard desktop breakpoint boleh memakai scale sedikit lebih kecil, sementara wide desktop menampilkan komposisi penuh untuk mencegah clipping.


## Burger button uniformity & landing proof hierarchy
- Burger menu tidak menampilkan Beranda/Home; brand/logo tetap menjadi jalur kembali ke landing.
- Semua action utama burger menggunakan treatment canonical Rose Button seperti `Daftar`, termasuk `Masuk`, `Paket`, `Template`, dan `Bantuan`.
- `Layanan` tetap menjadi parent button dengan submenu Event Planner, Digital Invitation, dan Guestbook Digital.
- Icon `Layanan` dan `Paket` wajib berbeda agar scanning menu tidak membingungkan.
- Landing copy kiri diperlebar dan sedikit dibesarkan ke bawah agar komposisi 80vw terasa penuh tanpa menjauh dari Pintu.
- Quote/proof block berada setelah CTA dan sebelum garis separator; capability/checklist abu-abu berada lebih bawah setelah separator.
- Testimonial customer hanya boleh memakai feedback nyata. Selama quote customer terverifikasi belum tersedia, landing memakai brand/service statement tanpa atribusi customer dan siap diganti setelah data nyata diberikan.
