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
- Menu memakai satu daftar datar: icon, nama halaman singkat, dan panah navigasi.
- Link utama: Beranda/Home, Event Planner, Digital Invitation, Guestbook, Paket/Packages, Template, Bantuan/Help, dan Masuk/Sign in.
