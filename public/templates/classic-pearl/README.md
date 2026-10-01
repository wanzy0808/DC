# Classic Pearl — heirloom atelier

Stable key: `classic-pearl`.

Classic Pearl is a photo-free invitation built around timeless bridal objects instead of generic oval borders and gem icons. The redesign treats the theme as an heirloom couture atelier: porcelain ivory, champagne gold, pearl lustre, quiet engraving lines, bridal objects and generous negative space.

## Art direction

- Palette: porcelain ivory, warm paper white, champagne gold, soft taupe, dark espresso ink.
- Default type: Cormorant Garamond + Manrope.
- No customer photo slots. Romance comes from typography, event identity and bridal/heirloom objects.
- Decorative assets frame content but never replace event/business data.
- Sections intentionally vary alignment and object placement instead of repeating centered cards.
- The Cover specifically avoids Undara's recurring centered-frame formula: its primary composition is an asymmetric editorial ledger with copy on the left and bridal architecture on the right.

## Theme assets

| File | Role |
| --- | --- |
| `01_ornate_golden_candelabra.webp` | Envelope and Date & Time |
| `02_ivory_victorian_chaise_lounge.webp` | Closing atmosphere |
| `03_pearl_crested_baroque_mirror_frame.webp` | Greeting, Identity and keepsake Gallery |
| `04_pearl_adorned_perfume_bottle.webp` | Gallery and Wishes |
| `05_gold_pearl_bridal_tiara.webp` | Cover, Identity, Gallery and Gift |
| `06_crystal_pearl_chandelier.webp` | Cover and Countdown |
| `07_bridal_tea_table.webp` | Event scene |
| `08_ivory_gold_wedding_arch.webp` | Right-side Cover architecture |
| `09_ivory_bridal_garland_swag.webp` | Envelope, Cover, Gallery and RSVP |
| `10_golden_bridal_carriage.webp` | Location scene |

All theme artwork is rendered as full objects with `object-fit: contain` and owns a native Studio object key.

## Envelope and Cover

Envelope keeps a traditional stationery ritual because it is the invitation gate: a pearl-edged ivory letter, bridal garland and candelabra carry the real recipient/name/date content, followed by a short seal/letter release.

The Cover deliberately changes composition. It has no central oval, no centered card, no photo frame and no full decorative border. A thin vertical ledger line establishes the left editorial column; large names occupy that negative space, with the second partner offset rather than stacked on the same centerline. The complete wedding arch stands on the right, chandelier hangs from the upper-left edge, tiara anchors the lower-right, and a short pearl trail terminates the ledger. The garland sits low as atmosphere rather than becoming another centered crown. The result should read like a bridal atelier lookbook page, not another invitation card placed in the middle of the phone.

## Identity and Gallery

Identity is typography-led and photo-free. The baroque mirror and tiara create a bridal focal point while each partner name and parent line remains protected event content.

Gallery is intentionally not a repeated card grid. It becomes a three-part keepsake editorial sequence: tiara and promise copy use a split row, perfume and memory copy reverse the relationship, then the mirror becomes a larger closing vignette with offset copy. This preserves the romantic Gallery section for a no-photo template without pretending customer photos exist.

## Shared engines

RSVP, Wishes, Gift, Maps, Music, countdown, event data, recipient data, editable invitation copy, section order/toggles and Studio native transforms remain in the shared Undara systems. Generic Calendar/MapPin/Gift icons are suppressed for Classic Pearl because the themed objects already provide those visual cues. Stale Gallery photo settings cannot turn this no-photo template into a photo template because configurable photo presentation is guarded by the catalog `usesPhotos` capability.

## Motion

Classic Pearl uses the shared native motion library rather than a second animation system. Cover motion follows its actual spatial composition: the ledger reveals vertically, chandelier glides from the left, arch glides from the right, garland reveals laterally, the tiara soft-scales, names arrive from opposing directions and the pearl trail reveals after the primary composition. Gallery's promise/memory vignettes use short tilt-in entrances while the final mirror vignette rises more quietly.

The custom Envelope interaction uses full transform strings plus opacity, preserving the shared animation performance rule. Countdown digits are not motion targets. Viewport motion is one-shot to avoid scroll flicker, while Studio replay and authored overrides remain available. Native motion waits for local artwork. Reduced Motion and OFF/timeline overrides win over template defaults.

## Studio ownership

Arch, chandelier, garland, tiara, ledger line, pearl trail, section props, mirror and other authored decoration remain native Studio objects. Decorative pearl/line/art objects may be hidden without allowing event names, date, recipient data, parents or functional controls to be deleted as decoration.

## Validation boundary

Source guards verify the dedicated renderer, asymmetric Cover contract, no-photo capability, all ten local assets, full-object artwork rendering, varied section props, shared engine integration, palette/font preset, themed Gallery heading, native motion registration, one-shot behavior, reduced-motion CSS and Studio decoration ownership. Runtime build/browser/authenticated save-public checks still require an executable project/CI environment.
