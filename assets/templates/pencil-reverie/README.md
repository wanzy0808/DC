# Pencil Reverie — illustrated invitation, no customer photos

Stable key: `pencil-reverie`. Registry: `lib/templates/catalog.ts` (`usesPhotos: false`, `photoSlots: []`). Public artwork folder: `public/templates/pencil-reverie/`. Template contract: `template.md`; this document describes the current implementation, not a claim of pixel-identical browser validation.

## Asset audit, 24 September 2026

All fifteen shipped assets are now referenced in the actual template. **The five new RGB assets are whole paper illustrations**, not transparent layers; they must be rendered with their full 1122 × 1402 aspect ratio. The mapping below was verified against the uploaded original image bytes / Git blob SHA.

- `bingkai.png` — blank love letter and ribbon; complete opening scene, dynamic title and date in available paper space.
- `bungaandlampbg.png` — riverside street, blossoms and a **complete old-fashioned street lamp**, used as the full Cover scene and Event illustration. Do not layer a large, offset copy of the transparent `streetlamp.png` over it.
- `bungabg.png` — vintage books with blossoms, used in Wishes and the illustrated gallery. This is **not** a magnolia-only file.
- `bungabg1.png` — magnolia blooms, used in Greeting, RSVP and the illustrated gallery.
- `sepedabg.png` — pink vintage bicycle in a paper street setting, used in Closing and gallery.
- Transparent objects: `couplesitting.png`, `bycicle.png`, `camera1.png`, `casette.png`, `bookstack.png`, `loveballon1.png`, `loveticket.png`, `polaroidlove.png`, `ribbon.png`, `streetlamp.png`. The couple and bicycle are fully visible **inside** the complete riverside Cover; the couple also appears as an identity illustration. The single transparent lamp is now displayed in its own full-aspect panel in Location, rather than rendering only its pole from a negative offset. The other icons receive whole-object framing in the art gallery and designated sections.

New scene and section images use responsive Next Image derivatives; original PNG files are retained unchanged. These illustrations are uploaded art assets, **not customer photos or real couple-event memories**. Gallery labels describe the artwork objects, not events claimed to have happened to an invitation owner.

## Experience

The opening is a complete vintage note, not an obligatory drawn envelope. One `Buka Undangan` interaction starts the shared music while the page-turn transition runs; reopening from Studio uses the same renderer. Cover is the actual catalogue face, preserving full lamp/river scene and complete foreground couple/bicycle. Section-specific artwork follows readable content **in layout flow**, so it is never accidentally clipped by a small Studio phone or an offscreen absolute position. All 15 shared toggles, date, location, RSVP and Gift stay backed by their original event/data services.

Text slots visible in Studio Isi and public/personal invitation: `greeting`, `attendanceRequest`, `prayerWish`, `closing`, plus `ourStory` for couples only. Copy changes follow the existing event-owned `::copy=` design key; no duplicated event fields or new database table.

Motion: CSS page-turn and entry animation, re-entrant section reveal, drawn heart, decorative arrow bob and backward-clock hands. When reduced-motion is active, all animated decorations become static. Scene animations pause when out of view. Illustration galleries offer keyboard/touch lightbox controls. No heavy 3D library was added merely to simulate paper and sketches.

## Validation required

Repository-level source and SHA audit completed, and tests updated at `tests/pencil-reverie.test.mjs`. Live Next build, phone/browser comparison against the supplied Pencil Reverie moodboard, and real Studio/public RSVP tests **have not been run in this connector-only edit**. Do not claim pixel-perfect or production-ready before those pass. The old complete PNG assets and their Git history remain publicly accessible; use only art licensed for commercial website display.
