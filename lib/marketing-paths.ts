/** Public marketing surfaces share ambient decoration, music and frame chrome. */
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

const FRAMED_MARKETING_PATHS = new Set([
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

export function isFramedMarketingPath(pathname: string): boolean {
  return FRAMED_MARKETING_PATHS.has(pathname);
}
