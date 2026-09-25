# DC Organizer — Launch Readiness Checklist

**Status:** Living launch-hardening guide  
**Initial audit:** 17 September 2026  
**Scope:** Production readiness for the general-event DC Organizer SaaS.  
**Canonical product requirements:** `prd.md`  
**Engineering rules:** `AGENTS.md`  
**Implementation history:** `prd.md` → Appendix A

> This file is a launch checklist, not a parallel PRD. If this file conflicts with `prd.md`, `prd.md` wins. When an item is implemented, follow `AGENTS.md`: update `prd.md` only if requirements changed and append implementation history/validation to Appendix A in `prd.md`.

> **Catatan audit dokumentasi (24 September 2026):** ringkasan dan checkbox bertanggal 17 September adalah snapshot historis, **bukan** verifikasi bahwa seluruh status launch masih berlaku pada HEAD atau environment produksi sekarang. Untuk setiap klaim readiness baru, periksa source/CI/migrasi/E2E terbaru dan catat tanggal, commit serta environment. Persyaratan aktif berada di `prd.md` §21; checklist ini hanya alat QA.

## Status legend

- [x] **Audited present** — implementation evidence exists in the repository. This does **not** automatically mean production/E2E verified.
- [ ] **Open** — missing, incomplete, or not yet verified strongly enough for launch sign-off.
- **BLOCKER** — should be resolved/verified before public paid launch.
- **P1** — launch-quality requirement; may be completed during launch hardening.
- **P2** — useful after launch; should not delay the first safe release unless product scope promises it.

---

# 1. Current audit summary

The product core is substantially implemented. DC Organizer is no longer primarily in feature-building mode; the remaining work is mostly **launch hardening, production operations, security verification, and end-to-end validation**.

Current repository evidence already shows:

- [x] PostgreSQL/Prisma is the product source of truth.
- [x] Custom database-backed authentication/session infrastructure exists.
- [x] Passwords are hashed with bcrypt.
- [x] Session tokens are random, stored hashed, and sent through HttpOnly cookies.
- [x] Session cookie uses `SameSite=Lax` and `Secure` in production.
- [x] Email verification data model/route exists.
- [x] Server-side invitation ownership checks exist in important event/payment/upload mutations.
- [x] Publish gate checks configured event, template, payment entitlement, and ownership server-side.
- [x] Published event metadata cannot be edited/unpublished/deleted through the main invitation API.
- [x] RSVP is event/slug scoped and checks configured + published + entitlement state.
- [x] Public RSVP has basic rate limiting.
- [x] Upload API validates ownership, MIME family, size, count limits, and optimizes images.
- [x] GitHub Actions performs install, Prisma client generation, and production build validation.
- [x] Production migration command (`pnpm db:deploy`) is documented.

Important gaps found in the initial audit:

- [ ] **BLOCKER — real email delivery is not production-ready.** Registration currently creates a verification token but prints the verification URL to server logs with a `[DEV]` message. Integrate a transactional email provider and never depend on logs for verification links.
- [ ] **BLOCKER — password reset / forgot-password flow needs production implementation and verification.** No reset flow was confirmed during this audit.
- [ ] **BLOCKER — payment is currently manual proof-of-transfer + admin confirmation, not a payment-gateway/webhook flow.** Decide whether manual transfer is intentionally the launch payment model. If yes, fully harden and document that operational flow. If moving to a gateway, implement signed webhook verification, idempotency, pending/paid/failed/expired handling, and event-scoped entitlement activation.
- [ ] **BLOCKER — uploads currently write to `public/uploads` on the application filesystem.** This is fragile for redeploys, horizontal scaling, backup, and immutable/container deployments. Move customer assets to durable object storage or explicitly design persistent VPS storage + backup before launch.
- [ ] **BLOCKER — production backup + tested restore procedure not verified.** Database backup is not complete until a restore has actually been tested.
- [ ] **BLOCKER — production deployment/rollback workflow not verified.** Current GitHub Actions evidence is build validation, not production deployment.
- [ ] **BLOCKER — full authorization audit across every API route is still required.** Important routes already use ownership checks, but launch sign-off requires checking all nested resources (guests, tables, personal invitations, assets, payments, WA Blast, usher/check-in, admin/designer/owner routes).
- [ ] **BLOCKER — critical end-to-end production-like test has not been recorded.** Register → verify → login → create event → save design → payment/entitlement → publish → public invitation → RSVP → organizer sees RSVP must pass as one complete journey.
- [ ] **BLOCKER — production secrets/configuration audit not verified.** Confirm no credentials are committed or exposed to client bundles and that production env separation is correct.
- [ ] **P1 — observability/alerting is not yet launch-signed-off.** Console logging exists, but production error monitoring, health monitoring, and actionable alerts should be defined.

---

# 2. BLOCKER — Authentication & account security

- [x] Registration endpoint exists.
- [x] Login endpoint exists.
- [x] Logout endpoint exists.
- [x] Session endpoint/infrastructure exists.
- [x] Password hashes use bcrypt.
- [x] Login rejects incorrect credentials without exposing whether password was correct.
- [x] Login requires verified email.
- [x] Session token uses cryptographically random bytes.
- [x] Session token is stored hashed in the database.
- [x] Session cookie is HttpOnly.
- [x] Session cookie is Secure in production.
- [x] Session cookie uses SameSite=Lax.
- [x] Session expiry is enforced server-side.
- [ ] **BLOCKER:** Integrate real transactional email delivery for verification emails.
- [ ] **BLOCKER:** Ensure verification tokens are never logged in production.
- [ ] **BLOCKER:** Implement/verify forgot-password request flow.
- [ ] **BLOCKER:** Implement/verify one-time password reset token with expiry and invalidation.
- [ ] **BLOCKER:** Invalidate appropriate sessions after password reset/change.
- [ ] **BLOCKER:** Add/verify rate limiting for login, registration, verification resend, forgot-password, and password-reset endpoints.
- [ ] Verify registration validates Terms/Privacy consent server-side as required by `prd.md`.
- [ ] Verify email format and normalization consistently on registration/login/reset flows.
- [ ] Verify duplicate registration race is safely handled by DB uniqueness, not only pre-check logic.
- [ ] Define session management policy: max session age, logout-all-devices behavior if needed, stale session cleanup.
- [ ] Test expired, deleted, forged, and reused session tokens.
- [ ] Test auth behavior behind production HTTPS/reverse proxy.

**Launch acceptance:** A normal user can securely register, receive a real verification email, verify, login, logout, recover a forgotten password, and cannot abuse auth endpoints at unlimited rate.

---

# 3. BLOCKER — Authorization & tenant/event isolation

DC Organizer is multi-tenant and event-scoped. Authentication alone is insufficient. Every sensitive server mutation/read must prove that the current actor is allowed to access the target event/resource.

- [x] Main invitation API resolves owned invitations server-side.
- [x] Payment proof submission verifies `invitationId + ownerId`.
- [x] Invitation upload verifies `invitationId + ownerId`.
- [x] RSVP guest lookup constrains `guestId` to the current invitation.
- [x] Published event mutation/delete lock exists in the main invitation API.
- [ ] **BLOCKER:** Audit every `app/api/**` route for authentication + role + resource ownership.
- [ ] **BLOCKER:** Verify User A cannot GET event data belonging to User B by changing IDs/query params.
- [ ] **BLOCKER:** Verify User A cannot PUT/PATCH/DELETE User B event.
- [ ] **BLOCKER:** Verify User A cannot read/mutate User B invitation assets by asset ID.
- [ ] **BLOCKER:** Verify User A cannot read/mutate User B guests by guest ID.
- [ ] **BLOCKER:** Verify User A cannot read/mutate User B tables/seating by table/seat/guest ID.
- [ ] **BLOCKER:** Verify User A cannot read/mutate User B Personal Invitations.
- [ ] **BLOCKER:** Verify User A cannot consume or modify User B WA Blast quota.
- [ ] **BLOCKER:** Verify User A cannot access User B payment/proof/transaction data.
- [ ] **BLOCKER:** Verify Usher/QR/check-in mutations are event-scoped and replay/cross-event safe.
- [ ] **BLOCKER:** Audit `/admin`, `/owner`, `/designer`, `/editor`, `/finance` API boundaries for server-side role checks.
- [ ] Verify nested-resource APIs derive ownership from DB relationships rather than trusting `ownerId`/`invitationId` supplied by the browser.
- [ ] Add automated negative authorization tests for cross-user IDs.

**Launch acceptance:** Changing any event/resource identifier to another customer's ID never exposes or mutates that customer's data, regardless of what the UI hides.

---

# 4. BLOCKER — Publish & entitlement integrity

- [x] Event must be configured before publish.
- [x] Event title/venue/date are validated before publish.
- [x] Saved `templateKey` is required before publish.
- [x] Digital Invitation entitlement/payment is checked server-side before publish.
- [x] Payment/entitlement is event scoped in the main publish flow.
- [x] Published event metadata is immutable through the main customer event mutation flow.
- [x] Customer cannot unpublish a published event through the main invitation API.
- [x] Customer cannot delete a published event through the main invitation API.
- [ ] **BLOCKER:** Test direct API attempts to publish without payment.
- [ ] **BLOCKER:** Test direct API attempts to publish Event B using Event A's paid entitlement.
- [ ] **BLOCKER:** Test direct API attempts to publish without template/configured event.
- [ ] Verify public invitation renderer independently requires configured + template + published + valid entitlement, not only `isPublished`.
- [ ] Verify payment revocation/refund policy and its effect on already-published invitations.
- [ ] Verify Studio capabilities after publish match `prd.md` and do not accidentally mutate locked event metadata.

**Launch acceptance:** No frontend manipulation or direct API call can produce a publicly valid unpaid/unconfigured invitation.

---

# 5. BLOCKER — Payment & financial operations

## Current repository model

The audited payment endpoint currently accepts a **proof-of-transfer URL**, stores/updates a single event payment as `PENDING`, and relies on confirmation elsewhere. This is a valid possible business model, but it is not an automated payment gateway.

### Decide launch payment strategy

- [ ] **BLOCKER:** Explicitly choose one launch model:
  - **Manual transfer:** proof submission → finance/admin review → confirmed/rejected → entitlement; or
  - **Payment gateway:** checkout → provider → signed webhook → transaction state → entitlement.

### If launching with manual transfer

- [ ] **BLOCKER:** Define official bank/payment destination and customer instructions.
- [ ] **BLOCKER:** Prefer controlled proof upload/storage instead of arbitrary external proof URL, or document why URL-only is acceptable.
- [ ] **BLOCKER:** Admin/Finance can inspect proof and confirm/reject only with server-side role authorization.
- [ ] **BLOCKER:** Confirmation records `confirmedAt` and `confirmedById` and cannot silently unlock another event.
- [ ] **BLOCKER:** Re-submitting proof cannot create duplicate financial entitlement.
- [ ] **BLOCKER:** Define rejection/resubmission state and customer-facing status.
- [ ] Keep an auditable payment history if operational/legal requirements need it; avoid destructive overwrites that remove important financial history.

### If launching with payment gateway

- [ ] **BLOCKER:** Use provider-generated transaction/order ID.
- [ ] **BLOCKER:** Verify webhook signature server-side.
- [ ] **BLOCKER:** Webhook processing is idempotent.
- [ ] **BLOCKER:** Handle `PENDING`, `PAID/SETTLED`, `FAILED`, `EXPIRED`, `CANCELLED`, and refund/reversal where applicable.
- [ ] **BLOCKER:** Never trust client-side success redirect as proof of payment.
- [ ] **BLOCKER:** Amount/package/event association is verified server-side.
- [ ] **BLOCKER:** Duplicate/reordered webhooks do not double-credit entitlement/quota.
- [ ] **BLOCKER:** Store enough provider references for reconciliation.

### Product pricing integrity

- [x] Canonical Digital Invitation price is Rp150.000/event in product docs.
- [x] WA Blast add-on is documented separately at 50 credits = Rp75.000.
- [ ] Verify server-side price/package data cannot be changed by client request.
- [ ] Verify WA Blast purchase credits only the selected event.
- [ ] Define refund/cancellation/manual correction process for Finance/Owner.

**Launch acceptance:** Money status is server-authoritative, auditable, event-scoped, and cannot be double-applied or spoofed from the browser.

---

# 6. BLOCKER — Uploads, media & durable storage

- [x] Upload requires authenticated user.
- [x] Upload checks event ownership.
- [x] Upload requires configured event.
- [x] Image MIME allowlist exists.
- [x] Audio MIME allowlist exists.
- [x] Image size limit exists (15 MB input).
- [x] Audio size limit exists (10 MB input).
- [x] Per-event image count limit exists.
- [x] Per-event audio count limit exists.
- [x] Images are normalized/optimized through Sharp and written as WebP.
- [x] Random UUID filenames are used.
- [ ] **BLOCKER:** Replace app-local `public/uploads` with durable object storage, **or** formally provision persistent VPS storage that survives deployments and is included in backup/restore procedures.
- [ ] **BLOCKER:** Verify uploaded files cannot execute as application code.
- [ ] **BLOCKER:** Verify delete/replace operations enforce owner/event ownership.
- [ ] Validate actual file content, not only browser-provided MIME metadata, especially audio.
- [ ] Define storage quota/retention per event/account.
- [ ] Define orphan cleanup when DB record creation fails/event is deleted where deletion is allowed.
- [ ] Define cache/CDN strategy for public invitation assets.
- [ ] If private master/template assets are required by `prd.md`, implement private storage + signed access rather than exposing originals publicly.
- [ ] Verify filenames/metadata do not leak sensitive local paths or original private information.

**Launch acceptance:** Customer media survives deploy/restart, is backed up or durably stored, cannot cross tenant boundaries, and untrusted uploads cannot become executable content.

---

# 7. BLOCKER — Database, migrations, backup & recovery

- [x] PostgreSQL + Prisma are established as source of truth.
- [x] `pnpm db:migrate` exists for development.
- [x] `pnpm db:deploy` exists for production migrations.
- [x] Documentation explicitly says build validation does not apply production migrations.
- [ ] **BLOCKER:** Provision automated production PostgreSQL backups.
- [ ] **BLOCKER:** Define backup retention policy.
- [ ] **BLOCKER:** Encrypt/protect backup access appropriately.
- [ ] **BLOCKER:** Perform a real restore test into a safe database and document result/date.
- [ ] **BLOCKER:** Define production migration sequence: backup → deploy migration → deploy app → health check.
- [ ] **BLOCKER:** Define rollback procedure for app release.
- [ ] Define strategy for irreversible/destructive Prisma migrations.
- [ ] Verify DB constraints for unique email, slug, event payment relationship, and other integrity-critical fields.
- [ ] Verify cascade/delete behavior does not accidentally destroy financial/audit data.
- [ ] Add/verify indexes for common event, guest, slug, payment, and RSVP queries before meaningful traffic.

**Launch acceptance:** A failed deployment, migration, or database incident has a documented and tested recovery path.

---

# 8. BLOCKER — Production deployment & infrastructure

- [x] Deployment target is Hostinger VPS/Linux in product docs.
- [x] GitHub Actions Build Validation exists for push/PR to `main`.
- [x] CI installs frozen dependencies, generates Prisma client, and runs `pnpm build`.
- [ ] **BLOCKER:** Provision production domain/DNS.
- [ ] **BLOCKER:** Enforce HTTPS with valid certificate.
- [ ] **BLOCKER:** Configure reverse proxy correctly for Next.js and client IP forwarding.
- [ ] **BLOCKER:** Production process manager/container restarts application after crash/reboot.
- [ ] **BLOCKER:** Define actual deployment workflow; current CI is build validation only.
- [ ] **BLOCKER:** Deployment runs pending Prisma migrations safely before relying on schema-dependent code.
- [ ] **BLOCKER:** Define rollback to previous application release.
- [ ] **BLOCKER:** Verify production environment variables are injected securely and are not committed.
- [ ] Verify `NODE_ENV=production` and secure cookie behavior on the real domain.
- [ ] Verify `APP_URL`, invitation root domain, and callback/public URLs use production domains.
- [ ] Verify filesystem permissions and non-root application execution where practical.
- [ ] Verify firewall exposes only required services.
- [ ] Keep PostgreSQL inaccessible from the public internet unless explicitly secured/required.

**Launch acceptance:** A clean deployment can be repeated safely, HTTPS works, migrations are controlled, crashes recover, and rollback is possible.

---

# 9. BLOCKER — Secrets & security baseline

- [ ] **BLOCKER:** Audit Git history/current tree for committed secrets, database credentials, API keys, private keys, webhook secrets, SMTP credentials, and tokens.
- [ ] **BLOCKER:** Rotate any credential that has ever been committed/exposed.
- [ ] **BLOCKER:** Confirm secrets are server-only and never placed in `NEXT_PUBLIC_*` unless intentionally public.
- [ ] **BLOCKER:** Confirm production DB errors/stack traces are not returned to customers.
- [ ] **BLOCKER:** Add/verify rate limits on sensitive auth/public mutation endpoints.
- [ ] Review CSRF risk for cookie-authenticated state-changing endpoints. SameSite=Lax helps but does not replace endpoint-specific review.
- [ ] Add/verify security headers appropriate to Next.js deployment (CSP strategy, frame protection, MIME sniffing protection, referrer policy as appropriate).
- [ ] Review all user-rendered text/URLs for XSS and unsafe URL schemes.
- [ ] Review Maps/live-stream/music/external URLs for protocol allowlisting where needed.
- [ ] Review image/audio processing against malformed file handling and resource exhaustion.
- [ ] Dependency vulnerability review before launch.

**Launch acceptance:** No known credential leak, obvious cross-site injection path, unlimited brute-force endpoint, or production debug leakage remains.

---

# 10. BLOCKER — Critical end-to-end launch test

Run this against a production-like environment with a brand-new customer account. Record date, environment, tester, commit SHA, and result in this section; ringkasan implementasi material dan validasi masuk Appendix A di `prd.md`.

- [ ] **BLOCKER:** Register new account.
- [ ] **BLOCKER:** Receive verification email.
- [ ] **BLOCKER:** Verify email.
- [ ] **BLOCKER:** Login.
- [ ] **BLOCKER:** Complete onboarding/profile if required.
- [ ] **BLOCKER:** `Tambah acara` does not create unwanted blank DB records merely by opening the form.
- [ ] **BLOCKER:** Save a valid event.
- [ ] **BLOCKER:** Reload and confirm event persists correctly.
- [ ] **BLOCKER:** Open `Buat undangan` for the correct event.
- [ ] **BLOCKER:** Select template.
- [ ] **BLOCKER:** Edit invitation content/design.
- [ ] **BLOCKER:** Upload image/music and confirm they survive reload/restart/deploy scenario appropriate to storage design.
- [ ] **BLOCKER:** Save design and confirm `templateKey`/design persist.
- [ ] **BLOCKER:** Attempt Publish unpaid and confirm server rejects it.
- [ ] **BLOCKER:** Complete the real launch payment flow.
- [ ] **BLOCKER:** Confirm entitlement attaches only to that event.
- [ ] **BLOCKER:** Publish successfully.
- [ ] **BLOCKER:** Public invitation opens on its production URL.
- [ ] **BLOCKER:** Unpublished/unpaid/invalid event URL does not expose invitation content.
- [ ] **BLOCKER:** Submit RSVP as a guest.
- [ ] **BLOCKER:** Organizer sees correct RSVP under correct event.
- [ ] **BLOCKER:** Submit wishes if enabled and verify event isolation/moderation behavior.
- [ ] **BLOCKER:** Verify Personal Invitation guest targeting does not leak another event's guest.
- [ ] **BLOCKER:** Verify published Rangkaian Acara cannot be edited, unpublished, or deleted.
- [ ] **BLOCKER:** Logout and verify protected dashboard/API access is gone.
- [ ] **BLOCKER:** Test forgot-password/reset-password end to end.

### Cross-tenant attack test

Create Customer A and Customer B with separate events.

- [ ] **BLOCKER:** A cannot fetch B event by ID.
- [ ] **BLOCKER:** A cannot edit/delete B event by ID.
- [ ] **BLOCKER:** A cannot upload/delete B assets.
- [ ] **BLOCKER:** A cannot fetch/edit B guests.
- [ ] **BLOCKER:** A cannot fetch/edit B tables/seating.
- [ ] **BLOCKER:** A cannot use B payment/entitlement.
- [ ] **BLOCKER:** A cannot use B WA Blast quota.
- [ ] **BLOCKER:** A cannot check in B guests through A's event context.

---

# 11. P1 — Public invitation quality

- [ ] Public invitation is excellent and fully usable on common mobile viewport sizes.
- [ ] Test Android Chrome and iPhone Safari.
- [ ] Test slow/mobile network behavior and image loading.
- [ ] Invalid slug returns a proper not-found experience.
- [ ] Unpublished invitation is inaccessible publicly.
- [ ] Paid/published entitlement is rechecked server-side.
- [ ] Event date/time/timezone render correctly for WIB/WITA/WIT.
- [ ] `END` sentinel renders `- end` consistently.
- [ ] Optional parent/couple fields do not create empty placeholders.
- [ ] Non-wedding categories never show forced wedding wording.
- [ ] Template preview and public output are materially consistent.
- [ ] Long names, long venue, long address, and unusual but valid content do not break layout.
- [ ] Missing optional image/music/gift/maps fields degrade gracefully.
- [ ] Accessibility pass: keyboard basics, labels, contrast, reduced motion, meaningful controls.
- [ ] Metadata/SEO/social sharing preview is intentional for public invitations.

---

# 12. P1 — RSVP, Wishes & anti-abuse

- [x] RSVP public endpoint has basic IP+slug rate limiting.
- [x] RSVP validates attendance status.
- [x] RSVP constrains existing guest updates to the current invitation.
- [x] RSVP limits plus-ones to a bounded value.
- [ ] Verify duplicate RSVP behavior matches product intent; repeated submissions should not accidentally create uncontrolled duplicate guests.
- [ ] Validate/normalize WhatsApp phone numbers consistently.
- [ ] Define RSVP deadline behavior if product uses a deadline.
- [ ] Verify capacity/plus-one rules if event capacity is enforced.
- [ ] Audit Wishes endpoint for event scoping, length limits, spam/rate limit, and moderation.
- [ ] Add abuse protection appropriate to public forms if bot traffic becomes meaningful (rate limiting first; CAPTCHA/challenge only when justified).
- [ ] Ensure organizer views cannot accidentally mix RSVP/Wishes across selected events.

---

# 13. P1 — Guest management, seating & Usher

- [ ] Explicit event selector/scope is always visible where multiple events are possible.
- [ ] Guest CRUD is server-authoritative and event-scoped.
- [ ] Seating mutations are server-authoritative.
- [ ] Seat/table collision handling is safe under concurrent updates.
- [ ] QR token cannot be trivially forged.
- [ ] QR/check-in cannot apply a guest to the wrong event.
- [ ] Repeated scan behavior is defined and safe.
- [ ] Check-in audit information is sufficient for event operations.
- [ ] Usher permissions expose only operational data required by the role when EventMember/P1 team access is implemented.
- [ ] Test event-day workflow on real mobile devices and weak venue connectivity.

---

# 14. P1 — WA Blast

- [x] Product requirement defines WA Blast as separate add-on.
- [x] Canonical package is 50 credits = Rp75.000.
- [ ] Verify provider/integration strategy for production sending.
- [ ] Verify consent/opt-in and messaging compliance requirements applicable to the chosen provider/use case.
- [ ] Quota decrement must be atomic and server-authoritative.
- [ ] Failed send/retry behavior must not double-charge quota incorrectly.
- [ ] Purchase must credit only selected event.
- [ ] Message status/history should be sufficient for support/reconciliation.
- [ ] Rate/throughput/provider failure handling is defined.

> If WA Blast is not part of the first public promise, it may be feature-gated/disabled at launch rather than delaying the safe Digital Invitation core.

---

# 15. P1 — Observability & support operations

- [ ] Add production error monitoring or equivalent centralized exception visibility.
- [ ] Add application health endpoint/health check.
- [ ] Monitor uptime externally.
- [ ] Define alerts for repeated 5xx, app downtime, database connectivity failure, and payment/webhook failure if gateway is used.
- [ ] Logs include useful request/context IDs without leaking passwords, tokens, proof secrets, or personal data unnecessarily.
- [ ] Define support path for payment stuck pending, invitation unavailable, lost media, and failed RSVP.
- [ ] Define who can perform manual financial corrections and how they are audited.
- [ ] Define basic incident procedure: identify → contain → rollback/restore → communicate → postmortem.

---

# 16. P1 — CI/CD & release discipline

- [x] Build Validation runs on push/PR to `main`.
- [x] Frozen lockfile install is used.
- [x] Prisma client generation is part of CI.
- [x] `pnpm build` is part of CI.
- [ ] Add lint/type/test steps as appropriate if not already covered by Next build.
- [ ] Add automated authorization/security regression tests for critical APIs.
- [ ] Add automated publish-gate tests.
- [ ] Add automated payment state/idempotency tests once payment strategy is finalized.
- [ ] Add a production deployment workflow or a documented manual deployment runbook.
- [ ] Record deployed commit SHA/version.
- [ ] Do not deploy when build validation is failing.
- [ ] Keep DB migration and application deployment order explicit.

---

# 17. P1 — Legal, privacy & customer trust

Before accepting public users and payment, review applicable Indonesian requirements with appropriate professional/legal guidance where needed.

- [ ] Terms of Service page exists and is linked at registration.
- [ ] Privacy Policy exists and is linked at registration.
- [ ] Registration consent is stored/handled as required by product/legal decision.
- [ ] Explain what guest personal data is collected (e.g. name, phone, RSVP, check-in).
- [ ] Define organizer/customer responsibility for uploaded guest contacts and invitations.
- [ ] Define data retention/deletion policy.
- [ ] Define account deletion/data export handling if required by policy/law/product promise.
- [ ] Define payment/refund/cancellation terms.
- [ ] Avoid exposing guest phone numbers or private operational data on public invitation surfaces.
- [ ] Establish a contact/support/privacy channel.

---

# 18. P1 — Performance & production capacity

- [ ] Run a production build and inspect major page/API performance.
- [ ] Public invitation does not ship unnecessarily huge media/assets.
- [ ] Images use optimized dimensions/formats and caching.
- [ ] Database queries for guest/event lists are paginated or bounded where lists can grow large.
- [ ] Avoid N+1 query patterns on high-traffic public/event operations.
- [ ] Test concurrent RSVP/check-in behavior at realistic event traffic.
- [ ] Test a realistic large guest list.
- [ ] Define sensible request body/upload limits at reverse proxy and application layers.
- [ ] Verify server disk, memory, CPU, and PostgreSQL connection limits for initial expected traffic.

---

# 19. P2 — Safe post-launch backlog

These are valuable, but should not block the first safe release unless they are explicitly promised in the launch scope.

- [ ] EventMember multi-user/team access (Owner/Admin/Event Operator/Usher) from PRD P1 roadmap.
- [ ] Custom domains.
- [ ] Advanced analytics/reporting.
- [ ] More invitation templates.
- [ ] Advanced template marketplace/designer workflow.
- [ ] Coupon/promo/referral engine.
- [ ] Native mobile app.
- [ ] Advanced automation/CRM integrations.
- [ ] Richer audit log UI.
- [ ] Advanced anti-spam/challenge systems when traffic justifies them.
- [ ] CDN/media transformations beyond initial durable storage needs.

---

# 20. Launch sign-off gate

DC Organizer is ready for a public paid launch only when all **BLOCKER** items below are either checked or explicitly accepted as a documented business/operational risk by the owner:

- [ ] Authentication production-ready: real email verification + password recovery + auth rate limiting.
- [ ] Full API authorization/tenant isolation audit passed.
- [ ] Payment strategy finalized and hardened.
- [ ] Publish/entitlement bypass tests passed.
- [ ] Durable media storage strategy is production-safe.
- [ ] Production DB backup exists and restore test passed.
- [ ] Production deployment, migrations, HTTPS, secrets, restart, and rollback are verified.
- [ ] Critical E2E customer journey passed on production-like environment.
- [ ] Cross-tenant attack test passed.
- [ ] No known launch-critical security issue remains.

### Sign-off record

- **Release candidate commit:** TBD
- **Environment:** TBD
- **Audit date:** TBD
- **E2E tester:** TBD
- **Backup restore test date:** TBD
- **Payment test:** TBD
- **Authorization test:** TBD
- **Decision:** NOT YET SIGNED OFF

---

# 21. Recommended implementation order

Use this order for future coding so launch work does not become random feature work:

1. **Auth production hardening** — email delivery, password reset, auth rate limiting.
2. **Authorization audit** — every API/resource, with cross-user negative tests.
3. **Payment decision + hardening** — manual-transfer production workflow or gateway/webhooks.
4. **Durable media storage** — remove deployment dependency on app-local uploads.
5. **Backup + restore + migration runbook**.
6. **Production deployment/HTTPS/secrets/rollback**.
7. **Critical E2E + cross-tenant testing**.
8. **Observability + operational support**.
9. **Mobile/public invitation QA + RSVP/Wishes hardening**.
10. **Only then resume P2 feature expansion.**

The purpose of this file is to keep future implementation focused on reaching a safe, supportable launch instead of continually adding features without production readiness.


---

# 22. Repo maintainability — audit 24 September 2026 (bukan sign-off produk)

**Ruang lingkup:** tree GitHub berisi 674 entri sebelum pembersihan; audit referensi dilakukan dengan workflow `.github/workflows/orphan-audit.yml` pada setiap perubahan source/aset dan bisa dijalankan manual. File tanpa static import atau tanpa string URL adalah **kandidat review**, bukan bukti aman dihapus: pertimbangkan route Next.js, `import()`, deklarasi `.d.ts` pendamping JavaScript, aset yang tersedia pada galeri Studio, serta URL file yang telah disimpan di database pelanggan. Aturan produk yang aktif tetap di `prd.md`, `template.md` dan `studio.md` merupakan panduan domain.

- [x] Hapus skrip one-shot lama `.github/scripts/modular-template-studio.py` yang menulis PRD dan source versi lama (commit `563abaf1`).
- [x] Pisahkan panel pemilihan template dari `DesignerPanels.tsx` dan pertahankan API re-export, dengan tes source disesuaikan (commit `1203d256`; [Build Validation berhasil](https://github.com/wanzy0808/DC/actions/runs/36009224370)).
- [x] Hapus 10 source orphan tanpa inbound import (commit `08db49b4`; [Build Validation berhasil](https://github.com/wanzy0808/DC/actions/runs/36010088189)).
- [x] Hapus 6 dependensi yatim berikutnya (commit `c3698273`; [Build Validation berhasil](https://github.com/wanzy0808/DC/actions/runs/36010656879)).
- [x] Pada audit sebelum pensiun eksperimen, commit `93db1101` lolos [Build Validation](https://github.com/wanzy0808/DC/actions/runs/36011178677) dan [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36011178767). Dua deklarasi `reference-door-*.d.ts` saat itu masih dibutuhkan route lab; file tersebut **telah dihapus bersama engine dan route eksperimen** setelah instruksi owner terbaru. Primitive reusable `components/ui/sheet.tsx` tetap dipertahankan.
- [x] Sesuai instruksi owner, hapus seluruh 11 file route `/jiplak` dan `/pintu-lab` termasuk engine lokal ([commit `9d90ecf6`](https://github.com/wanzy0808/DC/commit/9d90ecf65e3e6c1149a2f5d3410c3bcfc06d35fd); [Build Validation](https://github.com/wanzy0808/DC/actions/runs/36019026551) dan [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36019026605) berhasil). Lanjut hapus 19 file pendukung eksperimen orphan (preview CSS/prosedural/orbital, engine/dekorasi, backdrop; [commit `f0368103`](https://github.com/wanzy0808/DC/commit/f0368103e874425a248ec6f41e3cecebfa2b3bb3)); [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36019259332) kini hanya melaporkan `components/ui/sheet.tsx` sebagai reusable zero-inbound. [Build Validation source kedua run 36019259303](https://github.com/wanzy0808/DC/actions/runs/36019259303) **berhasil**. Landing `LandingDoorScene.tsx`, `PortalTransition.tsx`, keempat tujuan layanan, dan data event tidak diubah.
- [x] Pisahkan helper validasi event dan lookup/slug legacy dari `app/api/invitations/route.ts` tanpa mengganti endpoint/handler (commit `db44fade`; [Build Validation](https://github.com/wanzy0808/DC/actions/runs/36014049136) dan [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36014049101) berhasil untuk commit source).
- [x] Pisahkan UI inspector layer ilustrasi Cover ke `components/InvitationStudio/AssetLayerInspector.tsx` tanpa memindahkan state, shortcut, aturan 15 layer atau penyimpanan ke komponen baru (commit [`3eea60bc`](https://github.com/wanzy0808/DC/commit/3eea60bc54b17e6005af31b12f08d09f4102718f); [Build Validation](https://github.com/wanzy0808/DC/actions/runs/36016774489) dan [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36016774492) berhasil).
- [x] Gabungkan aritmetika countdown Universal dan Romantic Rose pada `lib/invitations/countdown.ts` sambil mempertahankan tampilan per tema; tambahkan tes zero-clamp, input tanggal tidak sah dan pemakaian kedua renderer. Commit source [`e89d8300`](https://github.com/wanzy0808/DC/commit/e89d83004bcc7bc5e180f34c85f1fbd5f27d3080), koreksi asumsi tes [`32c455cd`](https://github.com/wanzy0808/DC/commit/32c455cdebb71a57842c2a80e38416883d49d25a). Build commit source pertama gagal pada pemeriksaan pola source tes yang salah; [Build Validation run 36017096159](https://github.com/wanzy0808/DC/actions/runs/36017096159) untuk commit koreksi berhasil menjalankan tes dan build. [Orphan Audit source](https://github.com/wanzy0808/DC/actions/runs/36017055673) juga berhasil.
- [ ] Lanjut audit/refactor bertahap `InvitationDesigner.tsx` (load/save vs interaksi canvas), `UniversalInvitationTemplate.tsx` (presentasi section vs engine RSVP/Wishes/media), operasi server tersisa di `app/api/invitations/route.ts`, `EventPanel.tsx` dan `SeatingChart.tsx` jika batasnya jelas dan tes regresi tersedia; jangan membuat API/data event ganda.
- [x] Padatkan `README.md` menjadi orientasi repo, setup, source map aktual dan tautan fitur aktif; hapus narasi milestone berulang yang sudah terdapat di Appendix A, perbaiki referensi `GuestManagement*` dan `data/templates/showcase.ts` yang sudah dihapus, pertahankan petunjuk OAuth Google/setup/migrasi.
- [ ] Lanjut audit duplikasi yang *terbukti* antara `AGENTS.md` dan badan utama `prd.md` per domain; keputusan terbaru menang hanya saat konflik dan aturan lama yang kompatibel tetap berlaku. Appendix A adalah histori, bukan rulebook aktif.
- [x] Audit 103 file komponen fitur `.tsx`: seluruh nama sudah PascalCase. Komponen pintu produksi `SimpleDoorLab.tsx` diganti menjadi `LandingDoorScene.tsx` (commit [`f2dbec48`](https://github.com/wanzy0808/DC/commit/f2dbec480ad938fbf0e9539074ddf4f1c8e0cae8); [Build Validation](https://github.com/wanzy0808/DC/actions/runs/36021506334) dan [Orphan Audit](https://github.com/wanzy0808/DC/actions/runs/36021506263) berhasil). Tes `tests/repo-file-naming.test.mjs` menjaga konvensi PascalCase, pemakaian scene oleh homepage dan absennya route lab; assertion awal keliru membaca `TemplateSection` sebagai `Temp*`, diperbaiki di [`a53096ec`](https://github.com/wanzy0808/DC/commit/a53096ec39ee5f4a352cb104bdcda7e1084deb44), lalu [Build Validation run 36022078654](https://github.com/wanzy0808/DC/actions/runs/36022078654) **berhasil**. Nama file/folder publik yang ejaannya tidak baku tidak diubah karena kompatibilitas URL aset undangan.
- [x] Rename jurnal `Dashboard-redesign.md` menjadi `dashboard-redesign-history.md` untuk membedakan catatan implementasi bertanggal dari `prd.md` §6 sebagai aturan aktif; sinkronkan rujukan di AGENTS, README dan pasal aktif PRD tanpa mengubah isi aturan Dashboard atau history Git.
- [x] Koreksi nama metadata `package.json` dari `my-app` menjadi `dc-organizer` tanpa perubahan package versions, lockfile atau database. Nama container/volume Docker pengembangan `doc-postgres` / `doc_postgres_data` tetap dipertahankan demi data lokal yang sudah ada; tidak termasuk rename nama source file.
- [x] Audit lokasi kode Zen Atelier: pindahkan komponen React `ZenArtwork.tsx` dari folder asset-reference ke `components/PublicInvitation/ZenAtelierArtwork.tsx`; perbarui dua import (termasuk dynamic import), tes, panduan aset dan PRD aktif. File media `public/` tidak dipindahkan atau diubah.
- [x] Pindahkan event-selection gateway `StudioEntrySection.tsx` dari folder komponen marketing `DigitalInvitation/` ke domain `InvitationStudio/` karena hanya dipakai `/studio`. Biarkan `DigitalInvitation/StudioSection.tsx` sebagai CTA marketing; perbarui import serta assertion test tanpa mengubah alur, login, event selection atau URL.
- [ ] Audit media `public/` yang besar; hindari penghapusan otomatis. Dua path MP3 Zen Atelier berisi blob yang identik tetapi salah satunya dipakai sebagai default tema dan path lama mungkin telah tersimpan sebagai `musicUrl`. Penghapusan membutuhkan jaminan kompatibilitas URL dan verifikasi penggunaan sebelum dilakukan.

Pemeriksaan CI pada satu commit memvalidasi source pada commit tersebut, **bukan** bukti browser, migrasi, entitlement, ataupun kesiapan produksi penuh. File source yang dihapus tetap dapat diambil melalui Git history bila dibutuhkan.

---

# 23. Studio core editor priority — 25 September 2026

**Current product decision:** pause further animation-library expansion until the Studio has the expected baseline editing tools. The existing curated section-animation catalog stays available; richer element/scene animation work is deferred, not removed.

### P1 — Standard canvas editing before advanced animation

- [x] Select/deselect design objects from the canvas.
- [x] Move objects by drag.
- [x] Resize from edge and corner handles.
- [x] Rotate from a dedicated handle below the object.
- [x] Layer ordering: bring to front, forward one, backward one, send to back.
- [x] Copy/paste selected design layer with keyboard shortcut.
- [x] Delete selected design layer with Delete/Backspace.
- [x] Undo/redo design changes.
- [x] **Add Cut (`Ctrl/Cmd+X`) for selected design layers.**
- [x] **Add proper photo crop controls:** free X/Y crop position, zoom, reset crop; persist per photo slot without modifying the original uploaded asset.
- [x] Add crop mode directly on-canvas so the frame stays fixed while the photo can be repositioned/zoomed inside it.
- [x] Add common aspect-ratio crop presets where appropriate (Original, 1:1, 4:5, 3:4, 16:9) without forcing every template frame to the same ratio.
- [x] Add duplicate shortcut (`Ctrl/Cmd+D`) for selected layers.
- [x] Add lock/unlock layer.
- [x] Add show/hide layer.
- [x] Improve overlapping-object selection and layer list naming so stacked objects are easy to target.
- [x] Add keyboard nudge with Arrow keys and larger Shift+Arrow movement for movable design layers.
- [x] Add snapping/alignment guides for center, section bounds, and nearby objects.
- [x] Add local Studio canvas zoom controls without changing saved invitation geometry.
- [x] Add image layer flip horizontal/vertical and quick center positioning.
- [x] Add multi-select/group only after single-layer selection/crop/lock behavior is stable.
- [x] Audit clipboard behavior for text vs image layers and prevent browser text-edit shortcuts from being hijacked while typing.

### Deferred — richer animation system

- [ ] Expand from section animation to **element animation**: text, photo, asset and ornament presets.
- [ ] Add text choreography such as per-word/per-character stagger where it improves premium templates.
- [ ] Add photo/gallery choreography, mask reveals and lightweight parallax.
- [ ] Use Motion/GSAP selectively for premium timelines; keep simple section entrances on the lightweight shared engine.
- [ ] Keep Three/R3F effects opt-in for selected premium templates only; do not make standard invitation pages depend on heavy 3D.
- [ ] Preserve reduced-motion behavior and mobile performance budgets for every animation preset.

**Priority rule:** baseline Studio editing (crop/cut/selection/layers/locking/snapping) wins over adding more animation presets until the editor feels dependable for normal designer work.
