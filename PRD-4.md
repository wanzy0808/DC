# PRD Tambahan - Automatic validation and React lifecycle cleanup

## 2026-09-16 - Validation on the latest dashboard

### Current design checkpoint
Based on main `bdb047781a667f7ff4ba66e27c8863681167bc2d`, after reading the consolidated `prd.md` and `PRD-3.md`.

The dashboard already includes rounded functional surfaces, reduced dividers, a single Rangkaian Acara flow with an optional additional sequence, seating/roster refinements, Beranda/Usher surface polish, and explicit action labels. These changes, including the latest button primitive, stylesheet, FeatureGate, and sidebar, are retained. Earlier access-notice changes have already reached main. This stage repairs validation rather than redoing those designs.

### Automatic validation
- GitHub Actions separates `Prisma, TypeScript & Build` from `ESLint`. Both run on pushes to main and updates to PRs targeting main, including drafts.
- Added explicit schema validation, Prisma client generation, route/type generation, manual dispatch, timeouts, read-only permissions, and obsolete-run cancellation.
- Added `db:validate` and `typecheck` package scripts and README instructions.
- No lint rules were suppressed; no continue-on-error, production secrets, deployment, database resets, or migrations are introduced. Branch protection is documented, not changed.

### Build repairs
- Restore AuditLog model to match the table, nullable actor relation, and index in the existing initial migration; no new SQL migration is required.
- Correct readonly FAQ input and feature icon tuple types.
- Include invitation assets on the public event query; authorization/publication/password checks remain intact.

### React lifecycle repairs
- Fetch completion/error callbacks own asynchronous state updates; initial loading values are initialized once. User actions own refresh/type-change loading indicators.
- EventPanel retains the latest single-sequence flow and aborts obsolete requests on selection/unmount. InvitationDesigner similarly cancels stale responses and initializes the requested invitation type after query hydration.
- Login parameters are resolved on the server and passed to LoginForm. Role destinations, safe internal checkout paths, OAuth error display, and URL cleanup are preserved.
- Registration query state derives from a hydration-safe useSyncExternalStore snapshot, with popstate subscription cleanup.
- Package selection resets only when its initial-package prop changes.
- Pintu's mounting flag uses a hydration snapshot; navigation, styling, orbit, duration, hover, and reduced-motion settings are preserved. Rose petals remain untouched.

### Affected files
- `.github/workflows/build.yml`, `package.json`, `README.md`, `prisma/schema.prisma`
- `app/[dashboard]/page.tsx`, `app/login/page.tsx`, `app/login/LoginForm.tsx`, `app/invite/[slug]/[eventSlug]/page.tsx`
- `components/Admin/AdminOperations.tsx`, `components/Designer/DesignerDashboard.tsx`, `components/Owner/OwnerDashboard.tsx`
- `components/Dashboard/EventPanel.tsx`, `components/Dashboard/InvitationManagementPanel.tsx`
- `components/InvitationStudio/InvitationDesigner.tsx`, `components/UsherApp/UsherApp.tsx`
- `components/Layout/Navbar/BurgerMenuContent.tsx`, `components/Layout/Navbar/RegisterDialog.tsx`, `components/Layout/PackageSelector.tsx`
- `components/Pintu/PintuSection.tsx`, `components/Marketing/FaqSection.tsx`, `components/D-Invitation/FeatureSection.tsx`
- `lib/hooks/use-browser-search.ts`

### Validation history
- Earlier CI run `35048849505` at `10039adc` passed Prisma, TypeScript, and production build, while exposing the legacy lint errors.
- Lint/TypeScript cleanup initially verified on the older branch, then ported onto current main to preserve concurrent UI changes. Only non-overlapping files were copied; loaders in the three changed dashboard components were adapted in place.
- Six login server-render checks passed for default/internal/external/array destinations and OAuth error display.
- Latest-main local validation: ESLint passed with 0 errors and 5 existing warnings; Next route generation and TypeScript passed; git diff --check passed. GitHub CI run `35070808608` for code commit `25ce06e0dbc9723263a7660a14e3a1314f2db67c` passed both `Prisma, TypeScript & Build` and `ESLint`, including the production build. This result predates the documentation-only commit recording it. Browser/camera/database integration checks remain unverified.
