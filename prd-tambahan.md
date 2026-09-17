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
