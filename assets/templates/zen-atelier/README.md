# Zen Atelier — Template artwork

This folder stores reusable Zen Atelier illustrations as code, NOT private master image binaries.

- ZenArtwork.tsx: sakura, ink mountains, enso sun and decorative media artwork. Source artwork stays outside Next.js static public serving; rendered art is visible in visitors' browsers.
- components/PublicInvitation/ZenAtelierScene.tsx: lazy-loaded envelope and cover.
- /api/template-preview/zen-atelier: small derivative thumbnail for the public catalog.

## Original user-uploaded images

The shared ChatGPT moodboard is a reference, not a file download. No Zen Atelier source image was identifiable in repository main at implementation time. The vector motifs above are new approximations, not the original uploaded files. Do not claim originals were moved or backed up.

For future licensed master images use a PRIVATE, non-Git storage volume or private object bucket, such as private-assets/templates/zen-atelier/originals/ on the server. The .gitignore rules exclude /private-assets/ and /assets/templates/*/originals/ from FUTURE accidental commits, but DO NOT protect files already committed. Upload originals directly to private storage, not public GitHub. Never put master images in public/, browser bundles, publicly accessible routes or public repositories.

Only distribute compressed, resized derivatives to the invitation browser. Private master downloads require server-side owner/entitlement checks. A browser-displayed derivative remains copyable. If files were committed to public Git, deleting or moving them does not remove history or forks.

The cover/envelope are illustrated, while the couple portraits and gallery use existing event-owned photo slots. Customer photo/music uploads continue through the existing authenticated InvitationAsset API and existing database. Do not duplicate RSVP, Gifts, Wishes, payments or guest records for this theme.
