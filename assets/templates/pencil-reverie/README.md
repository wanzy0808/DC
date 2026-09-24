# Pencil Reverie — no-photo illustrated wedding invitation

Stable key: \`pencil-reverie\` · asset directory: \`public/templates/pencil-reverie/\` · catalog type: **Tanpa Foto**.

## Visual target
Owner's **Pencil Reverie Wedding Template Showcase** reference (24 September 2026): warm ivory paper, soft rose pencil accents, youth-oriented oldies scrapbook, asymmetric cover, river-town linework, couple illustration, hand-drawn hearts, Polaroids, bicycle, street lamp, cassette, ribbon, books, balloon cluster, ticket and camera. It is a visual reference; no pixel-identical browser proof is claimed.

## Implementation
- \`PencilReverieScene.tsx\`: collage-style opening (not a compulsory picture of an envelope) and artwork-led cover. Opens only with **Buka Undangan**, no duplicate Cover CTA. Opening callback happens synchronously on the user's click so shared music can start; UniversalInvitationTemplate delays the visual change 1.05s to show a staged scrapbook page turn.
- \`PencilReverieArtwork.tsx\`: individual composition for each supported section, six illustrated scrapbook gallery items (no fabricated uploaded photos), keyboard-operable lightbox, and reversing clock hands. Every image in the original ten-file asset folder has a role. All decorative images pass through Next Image for responsive derivatives; original PNGs remain intact.
- \`pencil-reverie.css\`: paper/rose/charcoal layout, section-specific art, handwritten accent, animated hand-drawn heart, slow floating balloon/ticket/ribbon, rotating cassette reels, light pulse, time-rewind clock, cover entrance and scroll reveal. The IntersectionObserver replays entrances only on genuine re-entry, pauses off-screen cover loops and provides static fallbacks for reduced-motion users.
- Universal invitation renderer still owns event/guest data, RSVP/QR, gifts, section toggles, music, and routing. No independent database/API and no customer photo slots. Gallery is explicitly "Galeri Cerita", depicting template-provided illustrations rather than guest-uploaded photographs.
- The same scene is used on the Studio canvas and public invitations. Cover is the catalog face, not the opening artwork. All sections use normal shared visibility keys; no extra mandatory section.

## Quality and limits
\`tests/pencil-reverie.test.mjs\` asserts registry/type, all ten assets, opening audio gesture and motion fallback. Static checks do not prove screenshots or an actual build passed. The new compositions should be compared with the reference on 360–390px mobile and desktop after syncing. Existing guest wishes remains governed by shared backend availability; never render fake guest comments as real data. Original illustration files are ~0.9–2.7 MB PNG each; monitor Next Image derivative and real device performance before release. Verify license to distribute supplied art; original committed PNGs are public by design.
