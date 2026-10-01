# Botanical Ivory — growing together

Stable key: `botanical-ivory`. A responsive, photo-free invitation for weddings and general events. This is a theme brief and implementation record; product authority remains `prd.md`, `AGENTS.md`, `template.md` and `studio.md`.

## Art direction and reference extraction

The replacement world is an ivory stationery set with complete botanical specimens. Warm paper, olive ink, Rufina headings and Average Sans body text replace the previous Cinzel/pearl boxed cover and repeated leaf icons. Existing saved palette/font selections stay authoritative; the new preset applies to fresh selections and bare legacy theme keys.

Two image-first composition references were generated and inspected before implementing the scenes: a flat portrait cover and a paper envelope with an olive belly band. These are design references, **not screenshots of the implemented website**. The cover extraction is: small opening line near the top, first name left, second name indented right with an italic ampersand, centered actual date, a complete branch in the lower half, and one short caption. The heading has roughly twice the body scale hierarchy; the principal botanical is about 57% of the invitation column width. It sits in normal flow so long names push it down instead of colliding with it. The envelope extraction is: actual names/date, an isolated sprig across folded paper, an olive band and leaf seal, optional real recipient wording, and one opening action. Paper geometry is drawn in CSS; the botanical artwork is raster imagery, not a collection of hand-drawn SVG leaves.

The existing Library/asset inventory was inspected. No suitable existing Botanical composition reference was found. The owner committed the generated branch and fern as `greenplant.webp` and `greenplant2.webp`; these originals remain untouched. The fern file is byte-identical to the inspected generated fern. The remaining sections were designed as the blueprint below; there is no claim that all 15 sections have separate approved reference images.

Default palette: background `#f7f4e9`, surface `#fffdf5`, ink `#3f4a36`, accent `#667055`, soft `#b7bea4`. Decorative raster plates blend their alpha mask with `currentColor`, preserving illustrated texture while following palette/native color changes. Normal-flow typography and illustration ratios respond to the actual invitation column (`cqw`), including the scaled Studio canvas. Selected artwork wrappers retain stable Studio native keys; internal plates own their static rotation so native transforms and entrance transforms do not erase it.

## Asset audit

| Source / shipped derivative | Dimensions | Alpha | Role and treatment |
| --- | --- | --- | --- |
| `public/templates/botanical-ivory/greenplant.webp` | 1024 × 1536 | Yes | Owner-committed full flowering branch; preserved |
| `public/templates/botanical-ivory/greenplant.webp` | 768 × 1152; 211,760 bytes | Yes | Cover, envelope sprig, selected identity/section accents and first herbarium page |
| `public/templates/botanical-ivory/greenplant2.webp` | 1024 × 1536 | Yes | Owner-committed full fern; preserved |
| `public/templates/botanical-ivory/fern.webp` | 768 × 1152; 216,666 bytes | Yes | Identity, event/location accents and second herbarium page |

The images were generated for this task and committed by the owner, rather than copied from another invitation designer. No third-party stock license is claimed. Derivatives use Sharp, WebP quality 84 and alpha quality 100; their transparent corners and original 2:3 ratio are regression-tested. All raster illustrations render complete with `object-fit:contain`. These public illustrations are downloadable theme assets, not private customer photos. Cover/envelope images load eagerly; other artwork loads lazily and its entrance waits for the image. No new dependency or asset-upload pipeline is introduced.

## All 15 controls

| Control | Composition and actual content | Motion / interaction | Empty and mobile behavior |
| --- | --- | --- | --- |
| Envelope | Folded ivory paper, sprig, olive band/seal; names/date and real recipient line | Band slips left, letter lifts; one **Buka Undangan** starts the shared music gesture and opens Cover | No generic recipient filler; names wrap; OFF/reduced motion opens immediately |
| Cover | Offset name lines, italic ampersand, actual date, complete flowering branch | Name rise, branch reveal upward, restrained date/caption fade | General events show actual event name; long names extend the scene; no second CTA |
| Greeting | Left-aligned invitation wording on warm paper; one faint branch | Heading rise and botanical reveal; paragraphs remain readable | Uses event description/saved copy before defaults; no fabricated guest name |
| Identity | Fern left/host right, then host left/branch right; actual optional parents | Names enter from opposite sides; artwork reveals upward | General events show one actual event identity; optional Our Story stays inside Identity and is absent publicly when empty |
| Event | Editorial heading and actual title, venue and optional dress code, small fern at right | Heading rise and fern reveal | Missing optional details are omitted; actual fields remain dashboard-owned |
| Date & time | Centered unboxed large date, real start/end and timezone | One restrained panel fade | Existing date/time formatting and missing-date handling are retained |
| Gallery | Two ivory herbarium sheets with full branch/fern and truthful specimen labels | Slight tilt entrance; native scroll/snap, touch swipe, previous/next and arrow keys | No customer-photo placeholders or uploads; keyboard and reduced-motion navigation are instant; disabled end controls |
| Countdown | Olive band with tabular, unboxed numbers | Heading fade; digits never animate each second | Existing shared countdown clamps finished events and handles invalid dates |
| Location | Right-aligned actual venue/address, small fern at left | Heading/fern entrance; shared real map link | Existing missing-location text; no empty map CTA; safe preview behavior |
| RSVP | Clean shared form using existing Zen presentation | Heading entrance; immediate keyboard feedback | Existing validation, event/Guest identity, quota, preview and API guards unchanged |
| Wishes | Shared real messages/form on ivory surface | Heading entrance; inputs remain still | Existing real empty/error/disabled states; preview sends nothing |
| Gift | Flat paper bank/account details, one copy action | Heading entrance; short press feedback | Missing details remain truthful; clipboard success/error handled by shared renderer |
| Closing | Short thanks/prayer, actual names and faint branch | Soft scale signature and branch reveal | Saved copy wins; no invented couple story |
| Footer | Small leaf and Undara signature | Static | Existing footer toggle and native styling retained |
| Music | Existing global invitation player | User gesture playback, existing play/pause | Existing asset/default selection, errors and missing-audio handling; no duplicate player |

This introduces no section toggle, photo role, business field, table, endpoint, payment/RSVP service or duplicate Guest record. The catalog still renders the real Cover/Hero rather than the envelope. Studio and public use the same renderer, event-scoped copy/native style/section codecs and shared forms.

## Motion choices and review

| Effect | Library / reason | Assets | Fallback |
| --- | --- | --- | --- |
| Band release and letter lift | Existing `motion/react`; distinct transform strings on isolated wrappers coordinate the opening | CSS stationery plus complete branch | OFF, authored envelope timeline or reduced motion skips the custom opening wait; timers clean up |
| Growing botanical, names and headings | Existing Studio animation presets and shared WAAPI entrance runtime; no second animation system | Lazy transparent artwork | Content is visible when motion/observer is unavailable; image-load wait; native OFF overrides defaults |
| Herbarium pages | Shared `tilt-in` preset and browser scroll/snap | Two complete specimen plates | Touch scroll remains native; keyboard/reduced motion moves instantly; no autoplay |
| Press/hover feedback | CSS transform 120–140ms and color 180ms | None | Hover gated by fine pointer; keyboard/reduced motion suppresses press transforms |

Default entrances replay only after fully leaving and reentering the viewport; Studio's existing replay event is also supported. The runtime preserves customer opacity/transform and discovers lazily mounted scenes/artwork. Section-authored animation/timeline suppresses default child motion; explicit native animation wins; explicit native `none` round-trips. The existing `reveal-up` preset uses a simple inset clip mask (per the shared Studio library); no claim of measured GPU/frame-rate performance is made. Opening/illustration timing is 0.4–0.9s because this is an occasional invitation reveal; UI control feedback stays below 300ms. No looping plant sway, input entrance during typing, paragraph-by-letter effect or per-second countdown movement.

Emil source motion review:

| Before | After | Why |
| --- | --- | --- |
| Keyboard gallery navigation inherited smooth scroll | Arrow keys and keyboard button activation scroll instantly (`BotanicalIvoryGallery.tsx`) | Avoid waiting for repeated keyboard commands |
| A native object could compete with its decorative transform | Motion wrappers surround native paper/band; art rotation lives on an inner plate (`BotanicalIvoryScene.tsx`, `BotanicalIvoryArtwork.tsx`) | Preserve saved Studio transforms and static illustration angles |
| Section OFF/timeline could leave a custom opening delay | Immediate shared opening transition for authored timeline/OFF (`UniversalInvitationTemplate.tsx`) | Avoid an unanimated 950ms wait |
| Simultaneously visible identity name entrances had equal delay | Second name receives a 70ms offset (`template-motion.ts`) | Give the two hosts a gentle order without delaying reading |

**Verdict: approve the source implementation.** Purpose, easing, control timing, cleanup, keyboard behavior and reduced-motion handling are present. Actual perceived timing, swipe performance, overlap at mobile/desktop sizes and frame-rate remain unverified; this is not a browser motion approval.

Impeccable was used for a bounded source polish/audit against existing repo authority, rather than creating conflicting global product/design documents. The bundled detector ran once over the new artwork/scene/gallery/CSS and shared integration/motion sources and returned zero findings. Follow-up manual inspection removed the unreachable old Botanical cover, removed hidden duplicate Our Story decorations, kept one opening action, confirmed authentic data/empty states and translated theme-owned copy. A clean detector is not evidence of rendered visual quality.

## Validation boundary

Automated checks cover actual alpha derivatives and byte budgets, no-photo catalog/preset compatibility, optional authentic identity/story, English gallery semantics/copy, native animation targets and OFF/timeline precedence. Shared runtime tests also cover lazy image waits, replay, preserved transforms/opacity, observer fallback and reduced motion. Historical catalog source guards were aligned with the owner's current 1450px wheel perspective, 84% foreground, active-wheel localized description, flexible right-side copy and canvas-only popup. The popup's separate close-control guard remains in the catalog test; the Studio/landing radius test no longer imposes its old shape on that changed popup. Marketing application sources are unchanged by this work.

Browser screenshots, perceived motion on real mobile/desktop, synthesized/physical touch and authenticated Studio save/reload/public/personal flows still need runtime QA. Chromium is unavailable in this environment; no screenshot, pixel-equivalence, E2E, database migration or deployment PASS is claimed. Final observed build/test results are recorded in `prd.md` Appendix A.
