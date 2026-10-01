# Garden Light — twilight garden editorial

Stable key: `garden-light`.

Garden Light is a photo-forward wedding/event invitation that moves from golden hour into a softly illuminated garden evening. The redesign deliberately avoids treating "garden" as a repeated leaf pattern. The visual story is built from recognizable celebration objects, photography, warm light and open space.

## Art direction

- Palette: pale sage, warm ivory, antique gold and garden ink.
- Default type: Young Serif + Instrument Sans.
- Photography: arched editorial frames, asymmetrical portrait rhythm and a mixed-height gallery.
- Atmosphere: warm lanterns, subtle firefly points and garden objects; no constant leaf border.
- Motion: directional entrances that follow object placement. Keyboard actions and reduced-motion paths remain immediate.

## Theme assets

These ten WebP assets were already committed for the theme and are reused rather than adding third-party stock:

| File | Role |
| --- | --- |
| `01_ornate_golden_birdcage.webp` | Envelope stationery anchor; Date/Gift accent |
| `02_vintage_lace_parasol.webp` | Gallery/Wishes accent |
| `03_romantic_lantern_arrangement.webp` | Cover and RSVP warm-light accent |
| `04_hanging_botanical_lantern.webp` | Envelope/Greeting hanging light |
| `05_vintage_garden_tea_table.webp` | Event-detail scene |
| `06_illuminated_garden_swing.webp` | Identity/Closing atmosphere |
| `07_romantic_ivory_bicycle.webp` | Location scene |
| `08_elegant_garden_fountain.webp` | Countdown atmosphere |
| `09_glowing_floral_light_garland.webp` | Cover and Gallery light canopy |
| `10_romantic_lit_wedding_arch.webp` | Cover portal / main theme signature |

All decorative assets render as complete objects with `object-fit: contain`; customer photos retain their real photo-slot/crop contracts.

## 15-component behavior

Amplop uses birdcage stationery and a hanging lantern. Cover uses the lit wedding arch, garland, lanterns and the real Cover photo. Greeting, Identity, Event, Date & Time, Countdown, Location, RSVP, Wishes, Gift and Closing receive different garden-object accents rather than one repeated botanical decoration. Gallery remains a real customer-photo gallery with an editorial 2-column composition. Footer is compact. Music, RSVP, Wishes, Gift, Maps, countdown data, recipient data, event identity, Studio toggles and public behavior continue through the shared Undara engines.

## Motion

The theme uses the existing Studio/native animation library and photo-motion hook. Cover photo reveals upward; couple portraits glide from opposing sides; gallery photos tilt in with a short stagger. The wedding arch reveals upward, lanterns follow their spatial side, section objects rise/glide/fade based on placement, and closing names soft-scale. There is no second animation system and no animation on changing countdown digits. Saved native overrides, section animation/timelines and reduced motion remain authoritative.

## Validation boundary

Source regression checks should verify dedicated scenes, all ten asset references, photo slots, native ownership, motion registration, preset palette/font and reduced-motion CSS. Browser screenshots, physical touch, authenticated save/reload/public flows and deployment need runtime verification when a browser/CI environment is available.
