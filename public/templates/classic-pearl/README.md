# Classic Pearl — heirloom atelier

Stable key: `classic-pearl`.

Classic Pearl is a photo-free invitation built around timeless bridal objects instead of generic oval borders and gem icons. The redesign treats the theme as an heirloom couture atelier: porcelain ivory, champagne gold, pearl lustre, quiet engraving lines, bridal objects and generous negative space.

## Art direction

- Palette: porcelain ivory, warm paper white, champagne gold, soft taupe, dark espresso ink.
- Default type: Cormorant Garamond + Manrope.
- No customer photo slots. Romance comes from typography, event identity and bridal/heirloom objects.
- Decorative assets frame content but never replace event/business data.
- Sections intentionally vary alignment and object placement instead of repeating centered cards.

## Theme assets

| File | Role |
| --- | --- |
| `01_ornate_golden_candelabra.webp` | Envelope, Greeting and RSVP |
| `02_ivory_victorian_chaise_lounge.webp` | Closing atmosphere |
| `03_pearl_crested_baroque_mirror_frame.webp` | Identity and keepsake Gallery |
| `04_pearl_adorned_perfume_bottle.webp` | Gallery, Wishes and Gift |
| `05_gold_pearl_bridal_tiara.webp` | Cover, Identity, Date & Time and Gallery |
| `06_crystal_pearl_chandelier.webp` | Cover and Countdown |
| `07_bridal_tea_table.webp` | Event scene |
| `08_ivory_gold_wedding_arch.webp` | Primary Cover portal |
| `09_ivory_bridal_garland_swag.webp` | Envelope, Cover and Gallery |
| `10_golden_bridal_carriage.webp` | Location scene |

All theme artwork is rendered as full objects with `object-fit: contain` and owns a native Studio object key.

## Envelope and Cover

Envelope uses a pearl-edged ivory letter, bridal garland and candelabra with real recipient/name/date content and a short seal/letter release. Cover uses the complete ivory-gold wedding arch and crystal chandelier, with a restrained tiara and garland framing typography rather than a photo.

## Identity and Gallery

Identity is typography-led and photo-free. The baroque mirror and tiara create the central bridal focal point while each partner name and parent line remains protected event content. Gallery is reinterpreted as a three-part heirloom/keepsake sequence using tiara, perfume and mirror objects with product-owned romantic copy.

## Shared engines

RSVP, Wishes, Gift, Maps, Music, countdown, event data, recipient data, editable invitation copy, section order/toggles and Studio native transforms remain in the shared Undara systems. Generic Calendar/MapPin/Gift icons are suppressed for Classic Pearl because the themed objects already provide those visual cues.

## Motion

Classic Pearl uses the shared native motion library only. Chandelier/arch/garland/tiara use restrained reveal/fade/soft-scale entrances; names move from opposing sides; heirloom gallery objects enter with small staged delays; section props glide according to their spatial placement. Countdown digits are not motion targets. Viewport motion is one-shot to avoid scroll flicker, while Studio replay and authored overrides remain available. Reduced Motion and OFF/timeline overrides win over defaults.

## Validation boundary

Source guards verify the dedicated renderer, no-photo contract, all ten local assets, native ownership, shared engine integration, palette/font preset, motion registration, one-shot behavior and reduced-motion CSS. Runtime build/browser/authenticated save-public checks still require an executable project/CI environment.
