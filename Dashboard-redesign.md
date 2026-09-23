# Dashboard Redesign — DC Organizer

Status: in progress. Started 23 September 2026. This file tracks **implemented source changes separately from pending work**.

## Goal
Customer dashboard should feel like the approved DC Organizer landing without duplicating the landing's doors, audio, petals or floral effects. Use Cinzel/Fauna One, Rose #C07A84 / #A65E69, neutral white and near-black, consistent shared navbar controls, generous functional workspace and concise Indonesian-first labels. Sidebar navigation is inspired by the supplied curved-outside reference (geometry, not its blue color). Preserve authentication, data/API behavior, event-scoped access, mobile, ID/EN and light/dark.

## Design decisions
- Use a dedicated customer sidebar component and scoped styling instead of trying to override global Button styles and stacking multiple pseudo-elements on neighboring controls. A menu-group opener must not appear selected alongside its active child.
- Hover and active use controlled states with nonoverlapping curved-outside corner geometry, sufficient vertical separation, keyboard focus, and reduced-motion handling.
- One shared dashboard page/surface/metrics/header vocabulary. Remove decorative eyebrows and descriptions when the current heading or real data already explains context.
- Never make up dashboard counts or chart data. Reuse real event, RSVP, guest, publication and invitation-view data already returned by existing APIs; display honest empty states if absent.
- Do not change the public landing/door, invitation renderer, account/access rules or business logic as part of this visual redesign.

## Implementation stages
- [x] Audit README, AGENTS, PRD and current customer dashboard shell, navigation and primitive components.
- [x] Create this redesign plan to record scope, decisions and validation.
- [x] Stage 1: replace fragile sidebar overrides with a cohesive curved-outside navigation component on desktop/mobile. Remove double-selected Acara group and conflicting hover/active colors; check responsive, keyboard and reduced motion.
- [x] Stage 2: unify customer dashboard shell and shared page primitives, simplify Beranda's redundant text, prioritize operational metrics, latest events and real RSVP/publication visualizations.
- [ ] Stage 3: audit and restyle Rangkaian Acara, Undangan Digital, Personal Invitation, WA Blast, RSVP, Manajemen Tamu, and Usher screens using shared primitives; retain current function and event scoping.
- [ ] Stage 4: validate Next.js build/TypeScript and test desktop/mobile Light/Dark, ID/EN, hover/active, keyboard, zero-data and populated states; fix regressions before marking complete.
- [ ] Record finishing details in AGENTS.md, prd.md, README.md and prd-tambahan.md when verified.

## Implemented in this iteration
- Added `components/Dashboard/DashboardSidebar.tsx` as the single owner of customer sidebar markup for mobile and desktop, with mobile backdrop and keyboard-focusable existing Button controls.
- Removed the two competing legacy sidebar CSS rule groups and implemented a scoped curved-outside active/hover treatment. Every top-level and submenu item has 20px vertical separation so 9px corner facets do not overlap adjacent items. Acara expanded state is distinct from selected child.
- Updated shared DashboardPrimitives geometry and simplified every workspace's page-header presentation without changing event/API semantics.
- Beranda keeps real counts, real RSVP coverage and publication status; removed repeated decorative labels and redundant intro. Empty RSVP data now shows a dash rather than a misleading 0% number.
- Removed the account dropdown help item that previously only closed the menu without opening any help surface.

## Validation log
- GitHub source updates committed to main. Remote GitHub clone for a local build was attempted but network DNS access to github.com is unavailable in this runtime. Next.js build and live browser visual checks are still pending. Stage 1 and 2 implementation checkboxes indicate source implementation, **not** visual approval.
- Stage 3 is partially implemented: first-pass copy cleanup across EventPanel, InvitationWorkspacePanel, PersonalInvitationPanel, WhatsAppBlastPanel, RSVP, guest placement and Usher; all consume updated shared primitives. Still inspect each operational workspace for remaining control/layout inconsistency and real chart opportunities without changing business logic.
- Stage 4 remains open: keyboard, Light/Dark, narrow/large desktop, mobile overlay, ID/EN, active+hover adjacency, zero/populated state, build and TypeScript.

- WhatsApp help: the floating dashboard trigger now opens two clear routes: Wedding Planner → Christine (+62 821-2478-6516), and physical/digital invitations or Guestbook → Admin (+62 812-8500-9609). Both open wa.me with relevant prefills; menu supports outside click, Escape and ID/EN. Source committed; browser testing pending.

## 23 September 2026 — Owner screenshot review: stronger Rose / functional overview

The owner reviewed a full-width dashboard screenshot and rejected the nearly all-white canvas, weak brand presence, sparse oversized latest-events card, disconnected button styling and the old neutral-rail sidebar. The owner explicitly authorized dashboard redesign even where the earlier neutral-rail visual baseline conflicts with this new direction.

### Implemented in source
- Dashboard-only Rose sidebar from top brand block through desktop/mobile rail. White navigation labels, darker active Rose and distinct muted hover. Only the active item draws 10px outside corners; 12px vertical gaps prevent collision with adjacent hovered rows. Expanded Acara opener is not automatically selected.
- Header remains one continuous restrained marketing-style control family, but with a warm near-white Rose canvas; brand wordmark is white inside the Rose brand block. Shared global landing navbar and Pintu are untouched.
- Customer workspace canvas now uses a very pale Rose tint (`#fff5f7`) instead of pure white. Dark mode uses a near-black Rose-tinted canvas, dark neutral cards and a deep Rose rail; controls keep accessible color contrast.
- Shared dashboard card/metric/page-header primitives now emphasize Rose outlines, larger readable figures, and a consistent surface/spacing rhythm across customer workspaces.
- Beranda replaces the tall empty "Terbaru" table with up to five compact event rows (real title/date/venue/status and the existing Studio route). The top Rose hero offers the existing Tambah acara action; four actual metrics, RSVP coverage and publication progress remain live-derived. Cards in the two-column overview align to their own content rather than stretching one empty box to the other's height. Empty data stays honest.
- Normal workspace Button continues to use the canonical shared Button primitive. The white button inside the deep-Rose overview hero is a scoped contrast exception, not a new application-wide button variant.

### Remaining work
- [ ] Visually review with the owner's actual dashboard screenshot viewport, narrower laptop and phone (ID/EN and light/dark) after sync; adjust oversize/cropping/contrast based on actual browser rendering.
- [ ] Audit the functional layout of each dashboard workspace (forms/tables, on-page primary action, filtering and short labels) and remove obsolete historical CSS without changing data or permissions.
- [ ] Verify all new source commits with production build/TypeScript and keyboard/hover behaviors before final approval.

### Validation
Source changes are committed directly to `main`. Screenshot and browser visual verification are **pending**; GitHub Actions status must be recorded against the final application-code commit rather than an older green build.

### Source build checkpoint (23 September 2026)

GitHub Actions **Build Validation** run [35816868869](https://github.com/wanzy0808/DC/actions/runs/35816868869) completed successfully on application source commit `da4c01183389ceab576c2c5a7df3ec0ba8b1a270` (includes Beranda redesign, shell/nav CSS, and shared-primitives changes). Later commits in this iteration modify repository documentation only. This confirms remote build/TypeScript validation for the described source but does **not** verify that the desktop/mobile browser matches the owner screenshot; visual QA and functional walkthrough remain open.

## 23 September 2026 — Stage 3, operational page layout pass

Implementation in `main`:
- `Rangkaian Acara`: replaced the minimum-760px horizontally scrolling dense event table with responsive event cards showing saved title, date, venue, actual status and the original Edit/Hapus/Undangan actions. Published records remain non-editable/non-deletable; event form, validation and save logic are unchanged. Empty state no longer repeats the header's Tambah acara CTA.
- `Undangan Digital`: replaced the minimum-780px invitation table with responsive cards for each real invitation and its views, publication state and existing Studio/Complete Event/Publish/Purchase/Public links. The page header owns Tambah acara, panel header owns Refresh; no duplicate action in the empty state. Response list uses Rose panel language and keeps real guest responses.
- `WA Blast`: purchase CTA appears in the quota panel when quota is zero, or in the page header when there is a quota; no duplicate same-action buttons or empty panel body. All quota/recipient rules remain unchanged.
- `Personal Invitation`: changed the first metric label from the repeated page title to Total; existing links and event-scoped workflow are unchanged.

Remaining Stage 3: review the detailed Personal Invitation, WA Blast recipients, RSVP, Manajemen Tamu/Seating, Usher controls and screen density at mobile/desktop, including real/no-data states. Do not claim these whole pages are finished from their shared primitives alone.

Validation: GitHub Actions build for InvitationWorkspacePanel source commit [c38a33d](https://github.com/wanzy0808/DC/actions/runs/35817433003) passed. Builds for subsequent EventPanel, WA Blast and Personal Invitation commits were still running at the time of this note. No actual browser screenshot comparison has been run for this stage.

## 23 September 2026 — Stage 3, RSVP / Manajemen Tamu / Usher pass

Implemented in customer dashboard source:
- `RsvpAnalyticsPanel`: replaced the 940px minimum-width RSVP table with responsive guest cards. Search by name/phone, sorting, ascending/descending order, filtered CSV export, individual QR generation, and permission-controlled manual check-in still use the existing handlers and API paths. Each real guest card shows RSVP status, pax, check-in, table and actions; zero guests and zero search matches have different concise empty states. No fake metrics introduced.
- `DashboardWorkspaces`: Usher's minimum-width table becomes a responsive guest roster retaining real check-in status and phone, with existing refresh and scanner link. RSVP and guest placement preserve event scope selection. Manajemen Tamu uses concise "Penempatan" heading rather than repeating its page title/explanatory paragraph.
- `EventScopePicker`: a shared, concise event selector is used by RSVP and Manajemen Tamu, with clear zero-event state and stronger Rose outline.
- `SeatingChart`: removed repeated eyebrow/intro paragraphs and restyled the draggable guest roster and floor-plan surface to match the shared Rose cards. Existing drag-and-drop, swap confirmation, table capacity, seat assignment, save route and notice flows remain unchanged.

### QA checkpoint
GitHub Actions Build Validation passed for RSVP, Usher and event-scope source commits: [RSVP run 35817725296](https://github.com/wanzy0808/DC/actions/runs/35817725296), [Usher run 35817744806](https://github.com/wanzy0808/DC/actions/runs/35817744806), and [picker run 35817760967](https://github.com/wanzy0808/DC/actions/runs/35817760967). SeatingChart's later build and desktop/mobile **visual and interaction checks** were pending at the time of this note. Avoid marking Stage 3/4 complete until the remaining Personal Invitation and WA Blast details, functional walkthrough and browser review are verified.

## 23 September 2026 — Stage 3, WA Blast / Personal Invitation detail pass

- `WaBlastPanels`: replaced the 480px minimum-width recipient queue table with responsive recipient cards, retaining phone numbers inside the authenticated management surface and the original per-recipient remove action. Removed duplicate "Penerima"/"Queue" eyebrows and quota explanation already present in the page metrics. Form controls are preserved; surfaces use shared Rose card geometry.
- `PersonalInvitationPanels`: the create and manage panels use the shared Rose card family with redundant event/page name eyebrows and descriptive filler removed; personal-invitation preview, publish/unpublish, edit, password, public link and existing guest flows stay intact.
- The user-requested rule to **hide WhatsApp help contact numbers** still applies to the floating help menu; operational guest/recipient phone numbers remain visible where needed to manage invitations and WA Blast.
- All operational workspaces now have a source styling pass, but that does not mean their desktop/mobile browser behavior is visually approved. Check long guest names, many recipients, open password form, quota-zero screen, stage resizing, and both themes.

### Build checkpoint
GitHub Actions build [SeatingChart run 35817823351](https://github.com/wanzy0808/DC/actions/runs/35817823351) passed. The WA Blast and Personal Invitation detail commits are newer; verify their own builds before marking the source pass fully green. Stage 4 visual/functional walkthrough remains pending.

## 23 September 2026 — WA Blast message-template workflow (owner content reference)

Content-only inspiration from the supplied third-party screenshots: add editable invitation, RSVP reminder, event-day reminder and thank-you message templates. **Do not reproduce the screenshot's magenta/white UI**; this dashboard uses the DC Organizer Rose primitives and existing Acara → WA Blast navigation.

Implemented:
- New `WaBlastTemplateStudio` inside an existing paid Digital Invitation's WA Blast workspace. Template list, create/edit/delete, editable name/title/message/category, 5 inline placeholders, 3-column desktop / stacked narrow-screen layout and real guest preview. Templates remain accessible when WA Blast recipient quota is zero, provided the underlying Digital Invitation is paid.
- `WaBlastTemplate` Prisma model + `20260923110000_add_wa_blast_message_templates` migration + authenticated, event-owner-scoped CRUD endpoint `/api/wa-blast/templates`. Up to 30 saved templates per invitation, strict field lengths and allowed placeholder validation. Templates are deleted with their invitation.
- Presets: Undangan, Pengingat RSVP, Pengingat hari acara, Ucapan terima kasih. Placeholders `{nama}`, `{acara}`, `{tanggal}`, `{lokasi}`, `{link}` are filled with the chosen queued recipient and real event fields in preview. If no recipient exists the preview explicitly displays a sample guest name; copying requires an actual selected recipient. Copying a message containing `{link}` also requires a published public invitation.
- Copy button places the personalized **text** on clipboard. This is intentionally **not** mass sending, scheduling, quota use, or a fake delivery confirmation: the existing WA Blast backend currently manages paid quota and recipient selection only. A separate provider-backed delivery/credit-ledger implementation must be specified, authorized, and verified before enabling any "Kirim Blast" action.
- Contact numbers for the floating dashboard WhatsApp help menu remain hidden; genuine recipient phone numbers remain visible inside authenticated recipient management.

Deployment/QA:
- **Database migration required** after syncing code: run `pnpm db:deploy` against the intended database before testing saved templates. GitHub Actions generates Prisma and builds code but does not migrate the user's database.
- GitHub Actions Build Validation for app integration commit [e80eb68](https://github.com/wanzy0808/DC/actions/runs/35818742769) passed. The earlier studio-only commit failed because the event preview type extension had not been committed yet; later integrated code passes. Follow up with live authenticated create/edit/delete, zero-quota, event-switch, language, clipboard, draft/public link and phone viewport tests.
- Still pending: actual WA delivery integration (not part of this iteration), approval of visual layout from owner's dashboard screenshot and complete responsive QA.


## 23 September 2026 — Framed Beranda + real account settings (initial implementation)

- Adopted landing's compositional motif, **not** its floral/door assets: one 94vw desktop / responsive mobile Rose-outline mainframe with the shared brand rail, navbar and content inside. Earlier fixed full-window header CSS in `app/dashboard/layout.tsx` was removed. Operational content outside Beranda keeps its existing components and genuine data.
- Navbar avatar now reads `DashboardContext.profile.avatarUrl`; dropdown adds Profil Saya and Pengaturan akun while retaining transaction/package/FAQ/logout items. The profile/security panel is a dashboard tab inside the same frame, with separate name/photo and current-password/new-password forms, proper ID/EN copy and visible status errors.
- User-scoped profile WebP upload, optional `User.avatarUrl` column/migration and authenticated current-password verification/session rotation are implemented server-side; no fake local-only profile. Images are stored on disk as existing assets are; persistent media storage is required on deployed infrastructure.
- **Deployment:** sync source, run `pnpm db:deploy` for migration `20260923115000_user_avatar_url`, regenerate Prisma if needed. **Validation:** actual build/CI, browser screenshots (desktop/mobile; Light/Dark), local upload persistence and password/current-session behavior have not yet been verified. No claim of visual approval or passing tests at this stage.

## 23 September 2026 — Owner correction: dashboard frame must actually contain scrolling

- Previous implementation's `min-height` frame and document scrolling did **not** match the approved landing frame. The dashboard root now owns a full viewport, a fixed-size responsive frame, sticky-in-composition header/sidebar and one internally scrolling main content panel; navigation resets internal scroll top. Mobile drawer and overlay are frame-local.
- Previous Rose-full sidebar and pink-tinted dashboard canvas were also not the requested white/black landing-style theme. The new dashboard palette uses white sidebar/background/cards in Light and near-black sidebar/background/cards in Dark, with stronger Rose outlines, typography, hover/selected navigation and landing-style primary CTA. Beranda's hero changes from a dark Rose slab to a light/dark Rose-outlined card; real event/RSVP metrics and operations are unchanged.
- Files: `app/dashboard/page.tsx`, `components/Dashboard/DashboardSidebar.tsx`, `app/globals.css`, `prd.md`, `README.md`, `AGENTS.md`, `Dashboard-redesign.md`. Commits: `267ae839`, `d09c230f`, `7543b6ef` plus documentation commits.
- **QA not yet verified:** desktop/mobile long-content scrolling inside the frame, header account dropdown, sidebar overlay, nested Studio/complex table behavior, Light/Dark screenshots and GitHub Actions build. Do not describe this as a visually approved result.
