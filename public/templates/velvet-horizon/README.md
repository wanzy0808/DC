# Velvet Horizon

Velvet Horizon is a warm Mediterranean-sunset wedding invitation built on Undara's shared 14-section invitation engine.

## Art direction

- warm ivory paper, dusty-rose velvet, terracotta sunset, muted stone and deep cocoa
- classical arch silhouettes, candlelight and soft floral framing
- centered ceremonial content with asymmetric decorative edges
- cover uses the real customer `cover` photo slot beneath the architectural composition
- Identity keeps the real `personOne` and `personTwo` slots; Gallery keeps real gallery photos
- RSVP, wishes, map, gift, countdown and event data stay on the shared functional engine

## Artwork

The folder already contained a Japanese-inspired asset pack. Only the pieces that can read as neutral watercolor atmosphere are reused here:

- `01_sakura_branch.webp` — soft floral branch
- `03_ink_mountain_landscape.webp` — distant horizon texture
- `06_japanese_cloud_band.webp` — atmospheric cloud band
- `08_red_sun_clouds.webp` — sunset disc/cloud texture

The mizuhiki, shoji and folding-fan assets remain available in the folder but are intentionally not used because they conflict with the Mediterranean reference. Complementary props are lazily borrowed from Garden Light, Modern Maroon and Classic Pearl rather than duplicating files.

## Motion

Default motion is registered in `lib/templates/template-motion.ts`. Large scenery uses restrained fades/reveals, portraits enter from opposite sides, and the gallery uses a light tilt-in stagger. Saved Studio animation/timeline overrides remain authoritative, and reduced-motion is respected.
