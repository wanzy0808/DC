# Zen Atelier — Template artwork

This folder stores reusable Zen Atelier illustrations as code, NOT private master image binaries.

- ZenArtwork.tsx: template-owned decorative composition and gallery empty-state, now using public artwork files; older inline vector helpers remain available but are no longer the primary illustration.
- components/PublicInvitation/ZenAtelierScene.tsx: lazy-loaded envelope and cover, assembled using images in public/templates/ (amplop1, japanroom1, redsun1, inkmountain, bamboo1 and bunga0001).
- /api/template-preview/zen-atelier: small derivative thumbnail for the public catalog.

## Original user-uploaded images

The shared ChatGPT moodboard is a reference, not a file download. Artwork with Zen/Japanese-style filenames is now present in public/templates/ and used in the theme. This does not prove any individual file is an exact export of the shared ChatGPT moodboard; visual comparison and asset licenses still need owner verification. Do not claim originals were moved or backed up.

For future licensed master images use a PRIVATE, non-Git storage volume or private object bucket, such as private-assets/templates/zen-atelier/originals/ on the server. The .gitignore rules exclude /private-assets/ and /assets/templates/*/originals/ from FUTURE accidental commits, but DO NOT protect files already committed. Upload originals directly to private storage, not public GitHub. Never put master images in public/, browser bundles, publicly accessible routes or public repositories.

Only distribute compressed, resized derivatives to the invitation browser. Private master downloads require server-side owner/entitlement checks. A browser-displayed derivative remains copyable. If files were committed to public Git, deleting or moving them does not remove history or forks.

The cover/envelope are illustrated, while the couple portraits and gallery use existing event-owned photo slots. Customer photo/music uploads continue through the existing authenticated InvitationAsset API and existing database. Do not duplicate RSVP, Gifts, Wishes, payments or guest records for this theme.

## 24 September 2026 — public artwork hookup

The existing public/templates PNGs are used AS-IS. They were not renamed, moved, optimized, or migrated to private storage. These files and all displayed derivatives remain publicly downloadable by browsers. Optimize large PNG display derivatives (without deleting/changing their source) in a separate, visually reviewed change before production rollout.

The original `Zen Atelier Wedding Moodboard UI.png` was subsequently retrieved from the user's conversation Library and visually reviewed. The real mobile reference shows an ivory blossom-and-ink-mountain cover, cream wax-seal envelope, couple editorial, wedding schedule, RSVP, asymmetric gallery and illustrated closing. The scene is composed to follow that reference, but a pixel-identical result has NOT been verified through browser screenshots. Existing PNG assets remain public and large; image optimization is a separate reviewed task.
