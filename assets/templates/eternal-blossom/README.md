# Eternal Blossom — a flowering album

Stable key: `eternal-blossom`. A responsive photo invitation for couple and general events. Product authority remains `prd.md`, `AGENTS.md`, `template.md` and `studio.md`; this file records the theme brief, artwork and implementation decisions.

## Direction and reference extraction

Blush paper, cream photo mounts, mulberry serif lettering and two complete flowering specimens replace the old oversized outline-flower icons and hard offset photo shadow. Playfair Display + Lora remains the font preset. The new `blossom` palette is background `#f7edea`, surface `#fff9f3`, ink `#673f4d`, accent `#99566b`, soft `#dfb8bd`. Saved explicit palette/font selections remain authoritative; fresh selections and bare theme keys receive the new preset.

The existing repository components, motion presets and connected Library inventory were checked before creating artwork. The available botanical/global floral images belonged to other visual worlds; none was a matching Eternal Blossom specimen. Three generated composition references were inspected: a scalloped portrait cover, a folded envelope and an overlapping photo album. They are design references, **not browser screenshots or approved pixel-equivalence evidence**.

Cover extraction: a short invitation line, actual event photo in a gently tilted scalloped oval paper mount, a complete branch at left and sprig at lower right, actual names on two offset lines with an italic ampersand, and actual date. The image mount is 70% of the inner column and display type scales to a 96px maximum. Vertical spacing is compact for the existing 390px catalog scene; long names stay in normal flow and can make the cover taller. General events use their own title instead of invented couple names.

Envelope extraction: actual names/date above folded cream paper, a visible inner letter, five-petal seal, asymmetrical complete flowers, optional real recipient wording, and one Buka Undangan action. CSS draws the stationery; the floral contours come from transparent artwork. Gallery extraction: a broad first print, smaller second print overlapping on the right, and another broad print, with slight alternating rotation. Customer photos retain color. No fake handwritten captions or decorative photo numbering are added.

## Artwork inventory and provenance

| Web derivative | Size | Bytes | Transparency | Use |
| --- | --- | --- | --- | --- |
| `public/templates/eternal-blossom/blossom-branch.webp` | 768 × 1152 | 135,958 | Actual alpha, clear corners | Cover left; envelope right |
| `public/templates/eternal-blossom/blossom-sprig.webp` | 640 × 640 | 64,316 | Actual alpha, clear corners | Cover right; envelope foreground; greeting and closing |

These are original image-generated artwork produced for this redesign, not downloaded stock images or customer uploads. The original generated branch was 1024 × 1536 RGBA; the sprig was 1254 × 1254 RGBA. Display derivatives preserve those ratios through Sharp resize and WebP quality 82, alpha quality 100, effort 6. The owner committed the branch master as `public/templates/eternal-blossom/bungapink1.png` in incoming commit `31900e6`; it is byte-identical to the inspected generated branch (SHA-256 `9906d57b3741a0a49b87f9bd0c4d130688d979371385297541a55cdba4b01e0a`). That master remains unchanged. The renderer loads optimized WebP derivatives; the owner PNG is also present in public Git/web assets, not private storage. No exclusive-licensing claim is made.

Generation direction: an isolated, complete slender flowering branch and a small complete flowering sprig, muted blush and cream petals, natural botanical contours, fine stems, soft watercolor detail, transparent background, no lettering, frame or paper rectangle. This records the art brief rather than asserting a verbatim copy of the tool prompts. A later transparency-only branch variant was inspected but not selected; the original branch retained the quieter color treatment. The chosen branch was flattened over blush solely for an alpha inspection, not used as a baked backdrop.

Raster flowers preserve their original colors; Studio palette controls recolor paper, ink, seal and vector ornament, not individual baked petals. Flowers use intrinsic ratios, `contain`, no accidental edge crop, and lazy loading outside the initial scene. The scalloped paper and five-petal mark are original vector geometry, not replacements for raster floral contours. Cover and identity photography always comes from shared event photo slots; there is no new customer-image fallback.

## All 15 controls

| Control | Presentation and motion | Shared behavior / empty state |
| --- | --- | --- |
| Envelope | Cream folds, floral seal, letter lift; opposing flower entrances | One user opening action; real recipient; OFF/reduced motion/keyboard skip the wait; Studio editing guard retained |
| Cover | Scalloped event-photo mount; staggered names and flowers; upward photo reveal | Actual cover slot, focus/crop and editor overlay; truthful missing-photo message; general-event title |
| Greeting | Cream surface, one sprig, actual greeting and attendance request | Existing editable-copy fields, length limits and saved overrides |
| Identity | Alternating arched portraits and name/parent text; opposite glides | Shared personOne/personTwo slots and crops; actual host for general events; honest missing portraits |
| Our Story within identity | Editorial text only when genuine story is supplied | Existing optional, couple-only narrative; no extra toggle or invented story |
| Event | Flat editorial title and actual agenda/venue | Existing category/data formatting; no guessed reception time |
| Date & time | Unboxed large date, real start/end and timezone | Existing date formatting and missing-date handling |
| Gallery | Full-color paper prints; staggered tilt-in; real fullscreen photo view | Shared event photo IDs/order, edit control and empty state; native dialog, Escape/arrows, swipe and focus restoration |
| Countdown | Mulberry band with unboxed tabular numbers | Shared actual countdown; digits remain still between updates |
| Location | Left-aligned venue/address and one map action | Valid real map URL only; existing preview guard and missing-location copy |
| RSVP | Shared form on paper with readable fields | Existing Guest identity, validation, config/quota/API and preview protections |
| Wishes | Shared form and real messages | Existing event-scoped API; preview sends/loads no customer messages; no synthetic wishes |
| Gift | Unboxed bank details and copy action | Shared event details and clipboard status; honest missing-gift copy |
| Closing | Sprig, thanks/prayer and actual names; gentle scale/rise | Existing closing/prayer fields and saved copy; no invented personal narrative |
| Footer | Quiet five-petal mark | Existing native styling and footer toggle |
| Music | Existing global invitation player | User-gesture playback and existing music toggle/assets; no duplicate player |

Our Story is a subsection, not a sixteenth control. Envelope + 13 content sections + global music remain the existing 15-control contract. Catalog cards stay Cover-only; opened catalog previews begin at Envelope. No business field, database table, endpoint, authorization gate or customer photo role is added.

## Motion and bounded review

| Effect | Existing library / reason | Fallback |
| --- | --- | --- |
| Seal release, flap lift, letter exit | `motion/react`, isolated wrappers, ease `[.22, 1, .36, 1]`; one spatial opening moment | Reduced motion, section OFF/timeline and keyboard opening are immediate; shared timer cleans up |
| Photo and botanical entrances | Shared Studio `reveal-up`, `glide-left/right`, `tilt-in`, `soft-scale` presets and WAAPI observer | Saved photo/native settings win; authored section motion suppresses defaults; lazy discovery/image wait and visible fallback |
| Photo fullscreen and navigation | Existing Serein gallery dialog adapted with a Blossom appearance | No animation wait, autoplay or custom scroll interception; keyboard/Escape and focus restoration remain native |
| Button feedback | CSS transform/opacity 160ms; fine-pointer hover only | Reduced motion removes transforms/transitions; visible focus and 48px primary targets |

Default illustration/photo entrances last 650–900ms for the occasional invitation reveal; functional input feedback remains immediate. No looping petals, per-character paragraphs, animated countdown digits or motion during typing. Shared runtime replay and preserved Studio transforms/opacity are reused; the artwork is not driven by another animation engine. No measured GPU/frame-rate claim is made.

Emil source review:

| Before | After | Why |
| --- | --- | --- |
| Eternal Blossom had static photo/flower presentation | Opposing botanical/identity glides, upward photo reveal and staggered album tilt | Make the theme visibly flowering while keeping reading controls steady |
| An opening transform could overwrite native Studio positioning | Motion wrappers surround the selectable seal, flap and letter nodes | Preserve native saved transforms |
| Keyboard opening could inherit the visual wait | Keyboard and reduced-motion opening call the immediate shared transition | Avoid waiting for repeated keyboard actions |
| Gallery reuse inherited Serein grid/monochrome styling | Scoped Blossom grid, ratio and full-color overrides; no-op catalog photo editor removed | Reuse working interactions without copying another theme's visual grammar |

Impeccable's bundled detector ran once over the new scene/artwork sources and returned zero findings. A bounded source polish inspected section coverage, inherited gallery specificity, palette contrast handling, native selection, localized controls and public/preview boundaries. This approves the reviewed source behavior only; a clean scan is not visual or perceived-motion approval.

## Verification boundary

Regression tests cover saved palette/font compatibility, photo capability/roles, native/photo OFF serialization, authored timeline precedence, selectable targets and actual WebP ratio/alpha/byte budgets. Existing shared tests cover renderer data guards, lazy discovery, image waiting, replay, preserved presentation and reduced-motion fallback. Final observed checks are recorded in `prd.md` Appendix A.

Chromium is unavailable in this environment. Browser screenshots, mobile/desktop timing, physical touch, authenticated Studio save/reload and public/personal runtime round trips were not verified. No browser/E2E, pixel-equivalence, migration or deployment PASS is claimed.
