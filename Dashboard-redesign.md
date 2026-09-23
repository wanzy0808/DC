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
