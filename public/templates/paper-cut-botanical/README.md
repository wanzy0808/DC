# Paper Cut Botanical

Paper Cut Botanical is a photo-free invitation theme built as a layered paper theatre rather than a generic green botanical card.

## Art direction

- Warm ivory and sage paper layers with a restrained clay accent.
- Asymmetric cover: editorial names on the left, a cut-paper illustration window on the right, a keepsake ticket at the lower edge, and a wax-seal detail.
- Botanical motifs frame the story instead of becoming the only subject.
- The photo-free Gallery becomes a three-part paper collage so it stays honest to the no-photo contract.
- Shared RSVP, Wishes, Maps, Gift, countdown, event data, section toggles, and Studio transforms remain owned by the universal invitation engine.

## Asset provenance

The template intentionally reuses already-committed Undara WebP artwork through Git blob aliases. No new binary format or external asset source was added.

| Paper Cut asset | Existing source artwork |
| --- | --- |
| 01_story_couple.webp | public/templates/botanical-ivory/01_botanical_ivory_handdrawn_embrace.webp |
| 02_love_ticket.webp | public/templates/pencil-reverie/loveticket.webp |
| 03_ribbon.webp | public/templates/pencil-reverie/ribbon.webp |
| 04_wax_seal.webp | public/templates/botanical-ivory/ivory_botanical_wax_seal_with_gold_accents.webp |
| 05_lantern.webp | public/templates/garden-light/03_romantic_lantern_arrangement.webp |
| 06_bicycle.webp | public/templates/garden-light/07_romantic_ivory_bicycle.webp |
| 07_bookstack.webp | public/templates/pencil-reverie/bookstack.webp |
| 08_polaroid.webp | public/templates/pencil-reverie/polaroidlove.webp |
| 09_love_balloon.webp | public/templates/pencil-reverie/loveballon1.webp |
| 10_garden_stroll.webp | public/templates/botanical-ivory/10_botanical_ivory_handdrawn_garden_stroll.webp |

## Motion

The default choreography uses Undara's existing native entrance library. Paper layers use paper-cut reveals; side objects use glide motion; small keepsakes use tilt/soft-scale. Playback is one-shot while scrolling to avoid repeated flicker, waits for theme images, and follows the shared reduced-motion path. Countdown values themselves are not animated targets.

## Studio

Artwork is marked with data-studio-native-object so safe decorative pieces remain selectable by the existing Studio presentation system. Protected event data and functional controls are not converted into freeform content.
