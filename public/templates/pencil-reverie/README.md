# Pencil Reverie — illustrated memory journal, no customer photos

Stable key: `pencil-reverie`. Registry: `lib/templates/catalog.ts` (`usesPhotos: false`, `photoSlots: []`). Public artwork folder: `public/templates/pencil-reverie/`. The shared invitation renderer remains authoritative for event data and product functions.

## Art direction

Pencil Reverie is now an **editorial memory journal**, not a full illustration poster with text placed on top. The Cover uses an off-axis paper sheet, oversized left-aligned names, a seated couple sketch as the lower-right anchor, a tall streetlamp as the vertical counterweight, and smaller camera/ticket/polaroid/ribbon keepsakes around the page. The composition deliberately differs from the centered stationery, symmetrical poster and layered-paper covers used by other Undara themes.

The palette is warm paper, graphite and dusty rose. The default type pairing is **Young Serif + Instrument Sans**. Customer palette and font overrides remain authoritative through the normal Studio design key.

## Asset library

All fifteen existing WebP assets remain in active use; no customer photograph is fabricated and no extra remote artwork dependency was introduced.

- `bingkai.webp` — opening love-letter sheet.
- `couplesitting.webp` — Cover and Identity couple illustration.
- `streetlamp.webp` — Cover vertical counterweight and Location prop.
- `camera1.webp` — Cover keepsake and Date/Time prop.
- `loveticket.webp` — Envelope/Cover keepsake and Date/Time prop.
- `polaroidlove.webp` — Cover keepsake, Wishes prop and memory Gallery.
- `ribbon.webp` — Envelope/Cover keepsake and Gift prop.
- `bookstack.webp` — Identity/Gift prop and non-wedding Cover fallback.
- `casette.webp` — Countdown/time prop and Gallery memory.
- `bycicle.webp` — Location prop and Gallery memory.
- `loveballon1.webp` — RSVP prop and Gallery memory.
- `bungaandlampbg.webp` — Event journal illustration; no longer the Cover background.
- `bungabg.webp` — Wishes journal illustration and Gallery memory.
- `bungabg1.webp` — Greeting illustration and Gallery memory.
- `sepedabg.webp` — Closing illustration and Gallery memory.

All artwork uses contained geometry. The full lamp, bicycle, figures and paper sheets remain visible rather than being cropped into decorative fragments.

## Section composition

Greeting is a narrow handwritten-style letter column. Identity pairs the couple illustration with typography and the actual parent lines. Event and Date/Time use offset note scraps rather than repeated rounded cards. Gallery is a six-column responsive memory board of illustrated keepsakes with the existing accessible keyboard/touch lightbox. Countdown combines a small backwards clock with static data cells. Location, RSVP, Wishes, Gift and Closing each receive a different marginal sketch prop while preserving the shared functional engines.

The normal 15 visibility controls, optional real Our Story, event data, RSVP, Wishes, Maps, Gift, Music, section order and Studio editing contracts are unchanged.

## Motion

Pencil section entrances now use Undara's shared **native Studio motion system**, so saved section timelines, native-object overrides and OFF settings remain authoritative. The default choreography uses restrained rise, slide, glide, tilt, reveal and soft-scale motion. Cover paper, names and keepsakes enter with short staggered delays; section art follows its associated content.

The opening letter keeps one short gesture-driven page-turn transition. The backward clock remains a slow thematic loop, while changing countdown digits are never animation targets. Motion is one-shot while scrolling, waits for illustration images, and `prefers-reduced-motion` disables decorative animation.

## Ownership

Theme artwork is exposed through `data-studio-native-object` targets for the existing Studio presentation editor. Event names, dates, parents, venue, RSVP, Wishes and Gift data continue to come from the shared invitation/event model; this redesign does not create duplicate business data or a second form engine.

## Validation

Regression coverage lives in `tests/pencil-reverie.test.mjs`. Update this section only with observed CI/build results; do not infer browser, authenticated Studio round-trip or deployment status from source inspection alone.
