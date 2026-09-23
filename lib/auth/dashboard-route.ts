/** Destination for the signed-in user's dashboard (not a post-login deep link). */
export function dashboardRouteForRole(role: string | null | undefined): string {
  if (role === "OWNER") return "/owner";
  if (role === "ADMIN" || role === "FINANCE") return "/admin";
  if (role === "DESIGNER" || role === "EDITOR") return "/designer";
  return "/dashboard";
}
