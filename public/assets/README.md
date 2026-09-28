# Undara shared public assets

This directory is the canonical home for shared browser-served assets.

- `brand/undara/` — logo and brand files.
- `landing/doors/` — service images shown inside the production landing doors.
- `landing/ornaments/botanical/` — current reusable branch and leaf ornaments.
- `landing/ornaments/legacy/` — retained legacy landing ornaments still referenced by code.
- `landing/reference/doors/` — visual reference door images, not production geometry.
- `marketing/<service>/` — service-specific marketing artwork.
- `demo/invitation/` — non-customer preview/demo photos.
- `payments/banks/` — bank/payment display marks.
- `audio/` — bundled shared audio tracks.

Template-specific artwork stays in `public/templates/<template>/`. Next.js metadata icons stay in `app/`.

Use lowercase kebab-case, avoid spaces, and do not add new loose files to the `public/` root.
