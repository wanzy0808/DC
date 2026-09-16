# PRD2 — Public Event Rendering & Event-Scoped Personal Invitation

**Project:** DC Organizer  
**Date:** 2026-09-16  
**Status:** Implementation log continuation after `PRD-TAMBAHAN.md` and `PRD1.md`

> `PRD-TAMBAHAN.md` remains the consolidated product-direction snapshot. `PRD1.md` records the event-category editor, database draft creation, and event-centric Studio. This file continues the implementation history for the public renderer, public routing, Guestbook generalization, and Personal Invitation event scoping.

---

## 2026-09-16 — Event-Category Public Invitation Renderer

### Goal
Carry the event category selected in `Rangkaian Acara` all the way through Studio and the public invitation so Birthday, Baby Shower, anniversary, and other events are not rendered with wedding-only labels.

### Default public renderer
`components/PublicInvitation/PublicInvitation.tsx` now uses `Invitation.eventCategory` as the public identity source.

Behavior:
- `WEDDING`, `SILVER_WEDDING`, and `GOLDEN_WEDDING` may render the two stored participant names.
- `BIRTHDAY` renders the primary person name.
- `BABY_SHOWER` renders the family / baby label.
- `OTHER` uses the event title.
- date and timezone use Indonesian event values from the database;
- time labels are generic event timing, not Akad/Resepsi assumptions;
- RSVP continues to target the same invitation/event record;
- footer remains DC Organizer.

Legacy `groomName` / `brideName` storage remains temporarily for backward compatibility. Public semantics no longer assume those fields always mean bride/groom.

### Eternal Blossom / Figma Classic renderer
`components/PublicInvitation/FigmaClassicTemplate.tsx` was generalized without changing the existing template key.

The renderer now adapts:
- event label;
- event identity;
- single-name vs two-name composition;
- event timing;
- location;
- RSVP copy;
- gift copy;
- closing copy.

The existing `eternal-blossom` template key is retained so published invitations do not lose their template assignment.

---

## Unlimited Public Event Routing

The legacy additional-event route still assumed:
- only `ADAT_AKAD` could be an additional event;
- maximum two additional events;
- access inherited from the historical main wedding payment.

Those assumptions conflicted with the current product direction.

The public route now:
- resolves configured events owned by the same account without a maximum-two business limit;
- matches the event slug against the actual event title;
- validates the selected event's own Digital Invitation entitlement;
- allows Birthday, Baby Shower, Wedding, anniversary, and other event categories to use the same public flow;
- keeps legacy aliases where needed for compatibility.

Digital Invitation access remains server-authoritative and event-scoped.

---

## Public Password Gate Alignment

The public invitation password gate was aligned with the DC Organizer design system:
- canonical `Button`;
- canonical `Input`;
- semantic background/border/primary tokens;
- Rose application accent;
- Cinzel / Fauna One / DM Mono typography.

Legacy hardcoded wedding-maroon UI was removed from this gate.

Password cookie handling remains server-issued and signed. Compatibility paths continue to work for public invitation routes.

---

## Guestbook Generalization

Guestbook public marketing was cleaned so the service is no longer described as wedding-only.

Changes include:
- DC Organizer replaces remaining customer-facing DC Wedding references;
- hero and process copy use `event` terminology;
- reviews include broader event-use cases rather than only wedding-day labels;
- FAQ uses event-oriented explanations;
- the package section no longer promotes a legacy invitation/guestbook bundle that is inconsistent with the current event-scoped Digital Invitation model.

Guestbook Digital remains the onsite service for QR check-in, usher operations, devices, and event-day support.

---

## 2026-09-16 — Personal Invitation Becomes Event-Scoped

### Problem
The first Personal Invitation implementation always resolved the owner's first `WEDDING` invitation. This could attach Birthday/Baby Shower/event guests and personal links to the wrong event when an account had multiple invitations.

### Server-authoritative event selection
`app/api/personal-invitations/route.ts` now requires an explicit `invitationId` for GET, POST, and PATCH operations.

For every request the server verifies:
- current authenticated user;
- invitation ownership;
- `eventConfigured = true`;
- the selected event's direct Digital Invitation payment/entitlement.

There is no fallback to the first WEDDING record.

### Event-scoped data isolation
All Personal Invitation operations are restricted to the selected `Invitation.id`:
- guest lookup;
- new manual guest creation;
- personal token creation;
- name / phone editing;
- publish / unpublish;
- personal password enable/change/disable;
- personal view statistics.

A guest from Event A cannot be modified through Event B's Personal Invitation context.

### Dashboard event selector
`components/Dashboard/PersonalInvitationPanel.tsx` now uses the shared `EventScopePicker` pattern used by RSVP and Manajemen Tamu.

Behavior:
1. Load all configured events owned by the user.
2. Default to the first event with active Digital Invitation access when possible.
3. User can switch `Acara aktif` from the dropdown.
4. Personal Invitation list and guest source reload for the selected event only.
5. Changing event clears local edit/password/guest-selection state so context does not leak across events.

If no configured event exists, the shared picker shows:

**“Silakan buat rangkaian acara dulu.”**

### Event-level activation state
Configured events without Digital Invitation access remain selectable.

Instead of a global opaque package gate, the selected unpaid event shows:
- event name;
- `Belum aktif` state;
- `Aktifkan Rp150.000` action linked to the selected `invitationId`.

The `FeatureGate` allows Personal Invitation to render its event selector while server APIs remain authoritative for mutations.

### Event-specific public personal URL
Published personal links now use the selected event slug:

`https://<event-slug>.<root-domain>/p/<personal-token>`

This prevents links from being incorrectly attached to a historical main wedding slug.

### Preview route
`app/dashboard/personal-invitation/[guestId]/page.tsx` no longer restricts previews to `Invitation.type = WEDDING`.

Preview authorization now requires:
- the invitation belongs to the authenticated user;
- the event is configured;
- the guest has a personal token.

Birthday, Baby Shower, Silver/Golden Wedding, and Event Lainnya can therefore use the same preview flow.

The preview back action also uses the canonical `Button` primitive.

---

## CI Findings & Resolution

### Build Validation #799 — failed
An observed build on commit `670d5c5e485af8c762e68698ed5aacac847f01bf` failed TypeScript validation because the dashboard Personal Invitation preview still passed the removed legacy `eventKind` prop to the generalized public renderer.

This was a real compile failure and is preserved here as implementation history.

### Fix
Commit `7dda95824c872ed6c3bff81ba6ab13ce637f4354` removed the obsolete `eventKind` prop from the Personal Invitation preview path.

### Build Validation #804 — PASS
GitHub Actions Build Validation run **#804** for commit `680d283675f3494b039d6acde16af9a83fef88b5` completed with conclusion **success**.

Observed state covered by that build includes:
- generalized public invitation renderer;
- event-generic Eternal Blossom renderer;
- unlimited/event-scoped public routing fixes;
- Guestbook generalization;
- Personal Invitation event-scoped API;
- Personal Invitation event selector/UI;
- non-wedding Personal Invitation preview support;
- event-level FeatureGate behavior.

This validates the repository source through the configured production build workflow. It does **not** prove deployment database migrations have been executed on production PostgreSQL.

---

## Affected Files

- `components/PublicInvitation/PublicInvitation.tsx`
- `components/PublicInvitation/FigmaClassicTemplate.tsx`
- `components/PublicInvitation/InvitationPasswordGate.tsx`
- `app/invite/[slug]/page.tsx`
- `app/invite/[slug]/[eventSlug]/page.tsx`
- `app/invite/[slug]/p/[token]/page.tsx`
- `app/invite/[slug]/event-khusus/page.tsx`
- `app/api/invite/[slug]/password/route.ts`
- `components/GuestbookPage/HeroSection.tsx`
- `components/GuestbookPage/FeatureSection.tsx`
- `components/GuestbookPage/ProcessSection.tsx`
- `app/guestbook/page.tsx`
- `data/guestbook.ts`
- `app/api/personal-invitations/route.ts`
- `components/Dashboard/PersonalInvitationPanel.tsx`
- `components/Dashboard/FeatureGate.tsx`
- `app/dashboard/personal-invitation/[guestId]/page.tsx`

---

## Key Commits

Public/event rendering and routing:
- `00586e05da90d64543c6592215ebaec6fc616026`
- `40df4c0b1ae471e66fd1b7b175136d3284a214cb`
- `dd6240e2edb34b6c2118a569d30c756105a09184`
- `5964a88557f4fbaa92755b50a85aeb5e02f0607c`
- `4e632139aa472e99f845af0e2ae868f11584d796`
- `83dbddb10015d6d1e1747a292476a9ffc3ab190a`

Public gate / generic copy cleanup:
- `5dc4c0acef3fc4128885e1f5a33aad4a3497e743`
- `f86fb3391f9f6cfe9237fdc8b1478f22f98f0da1`
- `180993e37fd8a173b3395de1c8c8fb47d35b7dee`
- `2814da983426bb6d5af2e25d182c1f521ca6dfb5`
- `216be589b5ae1427136750f277ba3f1d7b2be519`
- `ffbaaadc0ba425605ea8b30af1759f914b321878`
- `c358882d53d4b8f14262ba51cd0729135eaeaf23`
- `3ae17dcc03f2fcf5e368d5029c4d07eafbcc4d46`
- `670d5c5e485af8c762e68698ed5aacac847f01bf`

Personal Invitation event scope:
- `7dda95824c872ed6c3bff81ba6ab13ce637f4354`
- `f142214fdf490a74a695e49c6aeb50ca06b1e155`
- `116cfee507c5c0a88b320f591cb7f28a077ede2d`
- `7eb3b2f54e4265fdfbb2ec4c2f05da06087abd08`
- `680d283675f3494b039d6acde16af9a83fef88b5`

---

## Validation Status

- GitHub Actions Build Validation #804: **PASS**.
- Commit validated: `680d283675f3494b039d6acde16af9a83fef88b5`.
- Next.js production build: **PASS** in observed workflow.
- TypeScript validation: **PASS** in observed workflow.
- Prisma Client generation: **PASS** in observed workflow install/postinstall path.
- Separate lint workflow: not observed.
- Production PostgreSQL migration execution for newer event-category migrations: not observed in this coding session.

---

## Remaining Compatibility Work

- Legacy schema names `groomName`, `brideName`, `weddingHashtag`, `WEDDING`, and `ADAT_AKAD` remain for backward compatibility.
- The root-domain fallback `dcwedding.com` remains intentionally unchanged until a domain migration is explicitly defined.
- The master `prd.md` still contains historical wedding-only and max-3 requirements; `PRD-TAMBAHAN.md`, `PRD1.md`, and this file document the newer implemented direction until the user replaces the master PRD.
- Usher dashboard still needs a dedicated event selector audit; current general event architecture should not assume the first paid event when multiple events exist.
