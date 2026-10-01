# Golden Art Deco — Gatsby soirée poster

Stable key: `golden-art-deco`.

Golden Art Deco is a photo-free invitation inspired by 1920s theatre posters, soirée tickets and lacquered Art Deco interiors. The redesign intentionally avoids the common Undara pattern of a centered framed hero. Its Cover behaves like an asymmetric poster: names carry the composition, a vertical date rail balances the right edge, and local Gatsby objects create depth without becoming a decorative border.

## Art direction

- Palette: lacquered noir, deep olive-black, champagne gold and warm ivory.
- Default type: Poiret One + Montserrat.
- Cover structure: left editorial rail, stepped geometric bars, offset poster typography, vertical date, full Gatsby arch at lower-right, fan emblem upper-left and champagne tower lower-left.
- No customer photos. Romance is carried by type, celebration objects, scale, rhythm and negative space instead of a portrait placeholder.
- Geometric decoration is sparse and architectural; do not restore the old nested diamond/border frame.

## Theme assets

| File | Role |
| --- | --- |
| `01_gatsby_archway.webp` | Cover architecture and Location |
| `02_gold_pearl_fan_emblem.webp` | Envelope ticket mark, Cover sunburst and Identity |
| `03_champagne_tower.webp` | Cover lower anchor, Gallery and Countdown |
| `04_vintage_gramophone.webp` | Event and Gallery rhythm vignette |
| `05_art_deco_oval_mirror.webp` | Identity and Gallery reflection |
| `06_golden_crystal_candelabra.webp` | Envelope and Date & Time |
| `07_paired_art_deco_lanterns.webp` | Greeting and RSVP |
| `08_art_deco_dessert_table.webp` | Gift scene |
| `09_ivory_gold_chaise_lounge.webp` | Identity and Closing |
| `10_crystal_drapery_garland.webp` | Envelope, Cover and Gallery |

All ten assets are local WebP files and render as complete `object-fit: contain` artwork. They are decorative native Studio objects; event names, parents, dates, venue, RSVP and payment data remain protected shared content.

## Envelope

The Envelope is a vertical admission ticket rather than a folded generic card. It uses twin rails, crystal garland, candelabra, fan emblem, ticket notches and a diamond seal. Opening lifts the ticket with a short motion while Reduced Motion / Animation OFF / authored timelines bypass the wait.

## Cover uniqueness

Do not convert this Cover into:
- an arch surrounding centered names;
- a centered card with decorative border;
- a centered diamond stack;
- a photo frame;
- a copy block centered under an ornament.

The approved composition is poster-like and intentionally asymmetric. The full Gatsby arch is weighted to the lower-right; champagne tower to lower-left; names start around the left-middle and the second name steps inward; date is vertical at the right edge. The rail, steps and decorative WebPs remain independently selectable in Studio.

## Sections and Gallery

Identity is typography-led and photo-free with mirror, chaise and fan details. Event, Date & Time, Countdown, Location, RSVP, Wishes, Gift and Closing each receive a different object-world cue rather than one repeated diamond.

The default Gallery is **Vignette Malam / Evening Vignettes**, a photo-free editorial sequence:
1. champagne — `Sebuah Kilau`;
2. gramophone — `Sebuah Irama`;
3. mirror — `Sebuah Pantulan`.

It deliberately avoids fake customer memories and does not create photo slots.

## Motion

The existing native motion engine remains authoritative. Rails reveal vertically, arch and section props follow their spatial direction, names enter from opposite sides, Gallery vignettes use short tilt/rise entrances, and closing uses restrained soft scale. Countdown digit values are never default motion targets. Golden Art Deco is one-shot on viewport entry to prevent scroll flicker; explicit Studio replay remains available.

## Shared product contract

RSVP, Wishes, Maps, Gift copy action, Music, countdown/event data, recipient personalization, section ordering/toggles, Studio native editing and public rendering continue through the existing shared Undara engines. Golden Art Deco stays `usesPhotos: false` with `photoSlots: []`.
