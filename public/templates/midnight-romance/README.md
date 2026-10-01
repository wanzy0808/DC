# Midnight Romance — private midnight salon

Stable key: `midnight-romance`.

Midnight Romance is a photo-forward invitation for evening celebrations. The redesign moves away from the old generic moon/star card and into a private midnight salon: navy velvet, burgundy, champagne gold, candlelight, baroque furniture, reflective objects and restrained celestial ambience.

## Art direction

- Palette: deep midnight navy, dark sapphire surface, burgundy velvet, champagne-gold light, warm ivory text.
- Default type: Bodoni Moda + Manrope.
- Photography remains the focal point. Decorative objects frame rather than cover it.
- Celestial details are ambience only; the theme is romance-at-night rather than astronomy.
- Layouts deliberately vary by section instead of repeating a centered card stack.

## Theme assets

| File | Role |
| --- | --- |
| `01_ornate_candlelit_lantern.webp` | Envelope and Greeting candlelight |
| `02_baroque_chaise_lounge.webp` | Identity/Closing salon atmosphere |
| `03_burgundy_light_garland.webp` | Envelope, Cover and Gallery light ribbon |
| `04_navy_rose_wedding_arch.webp` | Primary Cover portal |
| `05_parisian_tea_table.webp` | Event scene |
| `06_celestial_rose_mirror.webp` | Identity and Gallery reflection motif |
| `07_gothic_candelabra.webp` | Date & Time and RSVP |
| `08_golden_rose_carriage.webp` | Location scene |
| `09_crescent_moon_chandelier.webp` | Envelope, Cover and Countdown |
| `10_sapphire_perfume_bottle.webp` | Wishes and Gift accent |

Decorative assets use full-object `object-fit: contain` presentation and are native Studio objects. Customer photos remain real photo slots with crop/edit behavior.

## Envelope and Cover

Envelope uses a crescent chandelier, candlelit lantern, burgundy garland and an ivory-on-midnight letter. Cover uses the navy rose arch, chandelier and garland around the real Cover photo, followed by a restrained editorial name/date/caption panel. Preview behavior remains Cover-first while public opening still respects the shared envelope flow.

## Shared section behavior

Identity keeps `personOne` and `personTwo` photo slots and presents them as offset night portraits. Event, Date & Time, Countdown, Location, RSVP, Wishes, Gift and Closing use different salon props. Gallery keeps every customer photo in an asymmetric night-editorial grid. RSVP/Wishes/Gift/Maps/Music/countdown/event/recipient/business data remain in shared Undara engines.

## Motion

The existing template motion engine remains authoritative. Cover reveals upward, couple portraits glide from opposing sides, Gallery tilts in with a short stagger and subtle photo parallax, while arch/chandelier/garland/salon props use restrained fade, glide, reveal and soft-scale entrances. Countdown digits remain still. Viewport entrances are one-shot to avoid scroll flicker; explicit Studio replay remains available. Reduced-motion and saved Studio animation/timeline overrides win over template defaults.

## Validation boundary

Source regression guards verify the dedicated scene, local asset set, photo slots, shared functional engines, native-object ownership, motion registration, one-shot playback, palette/font preset and reduced-motion CSS. Full browser/build/authenticated Studio/public-flow verification requires a runtime or CI runner.
