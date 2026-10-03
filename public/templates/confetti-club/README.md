# Confetti Club

Birthday stationery with a cream paper surface, cobalt type, coral ribbons,
a two-tier cake and a folded gift envelope. Font preset: Syne + Inter.

The cover is illustrated. An optional customer portrait uses the shared
`cover` photo role in Identity; Gallery uses the event's selected media.
RSVP, Wishes, Maps, Gift, countdown and music use the shared invitation engine.
No age, customer name, date, venue or photo is baked into the theme.

Artwork is authored as code-native SVG/CSS in `ConfettiClubArtwork.tsx` and
`ConfettiClubScene.tsx`. Important groups/parts have native Studio markers.
`preview.svg` is a generic catalog fallback; live cards use the actual renderer.
Generated image references guided composition and are not bundled as event UI.

Default music reuses the existing DayFox — They Say... audio asset and license
metadata from the shared library. No new audio or third-party photo is added.
Gallery-only birthday fixtures reuse local public demo portraits.

Browser QA remains required for desktop/touch editing, long names, section
backgrounds, reduced motion and Save → reload → public.
