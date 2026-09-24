/** Public marketing surfaces share ambient decoration and optional music. */
const MARKETING_PATHS = new Set([
  "/",
  "/d-invitation",
  "/event-planner",
  "/wedding-planner",
  "/guestbook",
  "/undangan-fisik",
  "/template-design",
  "/help",
]);

export function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname);
}
