# PRD Tambahan - Validation cleanup

## 2026-09-16 - React lifecycle lint repair

### Scope and design checkpoint
This stage fixes the lint errors exposed by automatic validation; it does not redo the dashboard redesign. `PRD-2.md` already covers Beranda, Event Panel, RSVP, Invitation Management, and Seating Chart. The later access-notice changes cover locked Usher and upgrade messaging. Active Usher UI remains the next design stage.

### Changes
- Data-loading state updates now occur in fetch completion/error callbacks. Initial loading state is initialized once; user-triggered refresh/type changes own their loading indicators.
- EventPanel and InvitationDesigner abort obsolete requests on type change/unmount, preventing stale responses from replacing the active invitation form.
- Login query parameters are resolved in the server route and passed to LoginForm. Existing role-based routing, checkout destination, OAuth error display, and URL cleanup are retained.
- Registration destination and register-on-open state derive from a hydration-safe browser search snapshot via useSyncExternalStore; no mounting effect copies query state.
- InvitationDesigner initializes from its requested invitation type after browser-query hydration, avoiding a redundant initial WEDDING load for ADAT_AKAD.
- PackageSelector synchronizes a changed initialPackage before rendering children instead of resetting it in an effect; user selection persists while the source prop is unchanged.
- Pintu's mounted flag uses a hydration snapshot. Door links, navigation, dimensions, timings, orbit, reduced-motion behavior, and visual styling are unchanged. Protected rose petals are untouched.
- MenuItem now has a concrete Lucide icon type instead of any. No lint rules are disabled or weakened.

### Affected files
- `app/[dashboard]/page.tsx`
- `app/login/page.tsx`, `app/login/LoginForm.tsx`
- `components/Admin/AdminOperations.tsx`
- `components/Dashboard/EventPanel.tsx`
- `components/Dashboard/InvitationManagementPanel.tsx`
- `components/Designer/DesignerDashboard.tsx`
- `components/InvitationStudio/InvitationDesigner.tsx`
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Navbar/RegisterDialog.tsx`
- `components/Layout/PackageSelector.tsx`
- `components/Owner/OwnerDashboard.tsx`
- `components/Pintu/PintuSection.tsx`
- `components/UsherApp/UsherApp.tsx`
- `lib/hooks/use-browser-search.ts`

### Validation
- `pnpm lint`: exit 0, zero errors, 10 existing non-blocking warnings. No suppression or configuration change.
- `pnpm typecheck`: exit 0.
- `git diff --check`: clean.
- Six server-render checks passed for default/internal/external/array login destinations and OAuth configuration error display.
- Browser interaction, camera, and database integration have not been verified in this environment.
- Changes are on draft PR #2, `codex/dashboard-access-consistency`. GitHub build/lint results are recorded below once observed.
