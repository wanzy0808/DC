import { redirect } from "next/navigation";

/**
 * This dynamic route is a legacy catch-all kept for compatibility.
 * The real dashboard lives at /dashboard, which has its own layout.
 *
 * Do not redirect unknown public routes to /dashboard: Next.js can resolve
 * an unmatched single-segment URL through this dynamic route. Sending those
 * requests home prevents unrelated public pages from unexpectedly becoming
 * the dashboard.
 */
export default function LegacyDashboardLayout() {
  redirect("/");
}
