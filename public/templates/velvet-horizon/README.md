# Velvet Horizon

Velvet Horizon is a warm Mediterranean-sunset wedding invitation built on Undara's shared 14-section invitation engine.

## Art direction

- warm ivory paper, dusty-rose velvet, terracotta sunset, muted stone and deep cocoa
- classical arch silhouettes, soft drapery, candlelight and restrained floral framing
- cover hierarchy is intentionally limited to photo → architecture → content
- cover uses the real customer `cover` photo slot beneath the architectural composition
- Identity keeps the real `personOne` and `personTwo` slots; Gallery keeps real gallery photos
- RSVP, wishes, map, gift, countdown and event data stay on the shared functional engine
- section art is capped at one decorative focal asset per section to keep the layout calm on small screens

## Artwork

Velvet Horizon deliberately avoids the Japanese-specific assets that were previously mixed into the theme. The current art set only borrows assets that fit the Mediterranean reference:

- Modern Maroon: soft fabric wave
- Garden Light: wedding arch, lanterns, tea table and fountain
- Classic Pearl: ivory bridal garland

The existing `public/templates/velvet-horizon` pack remains available for future replacement art, but none of the sakura, ink mountain, Japanese cloud, red sun, mizuhiki, shoji or folding-fan imagery is used in the current composition.

## Gallery

Gallery photos use a stable two-column editorial grid. The first image and periodic feature images span both columns, while the rest remain aligned cards. No gallery card uses absolute positioning, so the layout remains predictable across phone sizes and long galleries.

## Motion

Default motion is registered in `lib/templates/template-motion.ts`. The cover uses restrained fade/reveal entrances, portraits enter from opposite sides, section decoration mostly fades, and gallery photos rise with a short stagger. Saved Studio animation/timeline overrides remain authoritative, and reduced-motion is respected.
