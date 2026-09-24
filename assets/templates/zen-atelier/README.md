# Zen Atelier — Template artwork

This folder documents the Zen Atelier design assets; React artwork components now live in `components/PublicInvitation/ZenAtelierArtwork.tsx`, not this asset-reference folder. Neither folder is private master-image storage.

- `components/PublicInvitation/ZenAtelierArtwork.tsx`: template-owned decorative React composition and gallery empty-state, using the existing public artwork files; the previous `ZenArtwork.tsx` source path here has been retired.
- components/PublicInvitation/ZenAtelierScene.tsx: lazy-loaded envelope and cover, assembled using images in public/templates/ (amplop1, japanroom1, redsun1, inkmountain, bamboo1 and bunga0001).
- /api/template-preview/zen-atelier: small derivative thumbnail for the public catalog.

## Current digital envelope — Japanese washi (24 September 2026)

The latest **owner-requested envelope** is a hand-built Japanese ceremonial stationery composition in `components/PublicInvitation/ZenAtelierScene.tsx` and `components/PublicInvitation/zen-atelier.css`: an ivory washi paper packet, asymmetrical folded layers, central red/gold `mizuhiki` cord and printed red seal, shoji/slatted shadow and subdued blossom/enso/ink-mountain vectors already defined in `components/PublicInvitation/ZenAtelierArtwork.tsx`. A guest's actual names/date appear on the inner letter only once it opens. The Japanese label is decorative and changes between wedding/general event context. One **Buka Undangan** action directly starts the existing shared music gesture and stages the fold → letter → Cover animation. Reduced-motion users advance immediately. Studio canvas can show/replay the same envelope; catalog cards/popups continue showing Cover/Hero.

This **replaces use of `amplop1.png` in the live envelope**, because that asset is a Western-style photographic wax-seal envelope and the owner requested a stronger Japanese visual distinct from the rest of the template. The original image stays in `public/templates/Zen Atelier/` untouched as an optional reference; do not remove or rename it. Cover, identity, gallery and remaining invitation sections are unchanged by this envelope-only redesign. Older log entries below document the previous visual implementation and are historical, not instructions to restore it. This code change has not been compared against a real browser screenshot of the latest right-hand visual reference: no pixel-perfect claim.

## Original user-uploaded images

The shared ChatGPT moodboard is a reference, not a file download. Artwork with Zen/Japanese-style filenames is now present in public/templates/ and used in the theme. This does not prove any individual file is an exact export of the shared ChatGPT moodboard; visual comparison and asset licenses still need owner verification. Do not claim originals were moved or backed up.

For future licensed master images use a PRIVATE, non-Git storage volume or private object bucket, such as private-assets/templates/zen-atelier/originals/ on the server. The .gitignore rules exclude /private-assets/ and /assets/templates/*/originals/ from FUTURE accidental commits, but DO NOT protect files already committed. Upload originals directly to private storage, not public GitHub. Never put master images in public/, browser bundles, publicly accessible routes or public repositories.

Only distribute compressed, resized derivatives to the invitation browser. Private master downloads require server-side owner/entitlement checks. A browser-displayed derivative remains copyable. If files were committed to public Git, deleting or moving them does not remove history or forks.

The cover/envelope are illustrated, while the couple portraits and gallery use existing event-owned photo slots. Customer photo/music uploads continue through the existing authenticated InvitationAsset API and existing database. Do not duplicate RSVP, Gifts, Wishes, payments or guest records for this theme.

## 24 September 2026 — public artwork hookup

The existing public/templates PNGs are used AS-IS. They were not renamed, moved, optimized, or migrated to private storage. These files and all displayed derivatives remain publicly downloadable by browsers. Optimize large PNG display derivatives (without deleting/changing their source) in a separate, visually reviewed change before production rollout.

The original `Zen Atelier Wedding Moodboard UI.png` was subsequently retrieved from the user's conversation Library and visually reviewed. The real mobile reference shows an ivory blossom-and-ink-mountain cover, cream wax-seal envelope, couple editorial, wedding schedule, RSVP, asymmetric gallery and illustrated closing. The scene is composed to follow that reference, but a pixel-identical result has NOT been verified through browser screenshots. Existing PNG assets remain public and large; image optimization is a separate reviewed task.


## 24 September 2026 — owner prompt reconstruction

Source: owner-uploaded `Pasted markdown(3).md`, plus universal `template.md`. The prompt is available; the original nine-panel moodboard image is not attached to this turn. The contact sheet of the actual assets was inspected. No claim of pixel-identical reproduction or browser visual approval.

### Asset inventory (actual directory: `public/templates/Zen Atelier`)

| File | Dimensions | Alpha channel | Current role |
| --- | --- | --- | --- |
| `amplop1.png` | 1122 × 1402 | No | Preserved historical wax-envelope reference; **not used by the current Japanese envelope** |
| `bamboo1.png` | 1024 × 1536 | Yes | Available bamboo; omitted from revised gallery |
| `bunga0001.png` | 1254 × 1254 | Yes | Upper-left cover sakura |
| `bunga0002.png` | 1254 × 1254 | Yes | Available alternate sakura; not added to cover |
| `bunga0003.png` | 1254 × 1254 | Yes | Available alternate sakura |
| `bunga0004.png` | 1254 × 1254 | Yes | Lower-right identity sakura |
| `darkcloud1.png` | 2172 × 724 | Yes | Available alternate transparent landscape |
| `darkcloud2.png` | 2172 × 724 | Yes | Gallery heading, RSVP and closing landscape |
| `ensostroke.png` | 1254 × 1254 | Yes | Available ink circle; omitted from sections without reference need |
| `inkmountain.png` | 1122 × 1402 | No | Cover lower landscape with feathered edge |
| `japancup.png` | 1122 × 1402 | No | Available tea photo; removed from RSVP/Gift decoration |
| `japanroom1.png` | 1122 × 1402 | No | Available interior; not a substitute couple photograph |
| `japanroom2.png` | 1122 × 1402 | No | Available interior; legacy unused empty-state asset |
| `redsun1.png` | 1254 × 1254 | Yes | Available red sun; omitted from revised cover |

The local MP3 `audiolibraryinfinite-jikan-wa-mikata-da-314226.mp3` is the Zen default, with owner audio still taking precedence. The repository also has shared `/couple.jpg`, `/couple2.jpg`, `/couple3.jpg`, `/man.jpg` and `/female.jpg` demo photographs; catalogue fixtures use those already-provided local images, not random external sources. They are not verified as the moodboard's Aruna/Kaito photos. No separate paper texture or wax-seal export exists in this directory. The envelope photograph contains both paper and seal; CSS adds subtle grain without generating substitute ornaments. Next/Image serves sized derivatives of the principal decorative files without modifying PNG sources.

### Composition and integration

- One opening action, **Buka Undangan**. Click starts shared audio immediately; CSS animates clipped flap/letter layers, then shared renderer opens the content. Reduced motion skips waiting; timers clean up on unmount. Because the supplied envelope is a flat photograph, an isolated wax-seal response remains limited by the source.
- Cover: left-top sakura, stacked bride/groom names, date/hashtag, lower mountains and icon-only scroll. No red sun, extra right-side blossom or second opening text.
- Identity: one full-width shared `cover` photo slot, names/family, lower-right blossom. Catalog declares cover/gallery; older personOne/personTwo data is retained, not deleted.
- Date/countdown/location visually join event details with no boxed metrics. Existing ceremonyTime/receptionTime remain start/end; the old fabricated separate reception block was removed. The model does not provide independent ceremony/reception venues.
- Gallery: asymmetric two-column masonry, intersection reveals and hover zoom; native modal lightbox supports Escape/focus return, arrows and swipe. No category chips because assets have no category metadata.
- RSVP: optional Zen presentation of the same shared form/API/QR, radio choices, no duplicate heading; catalog form can be explored but cannot submit. Existing 15 visibility keys remain unchanged.
- Gift copy reports actual clipboard success/failure. Closing and shared global audio stay ivory/charcoal. Theme preset remains Playfair Display + Inter, and existing Studio palette/font options are respected.

### Known remaining scope

The shared Wishes persistence service and RSVP message field do not exist. Zen shows a short unavailable state instead of fake comments or a false-success textarea. No separate editable love-story model exists: the current owner description stays in Greeting, rather than fabricating a couple history or adding a sixteenth visibility key. Independent ceremony/reception schedules and gallery categories require actual model/UI support. No new tables/migration introduced in this visual pass. Browser screenshots, physical device/touch/download checks and comparison against the actual reference image remain required; SSR/build do not establish visual equivalence.
