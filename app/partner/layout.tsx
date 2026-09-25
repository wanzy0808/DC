import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dashboardRouteForRole } from "@/lib/auth/dashboard-route";

export default async function PartnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/partner");
  if (user.role !== "SUPPORT") redirect(dashboardRouteForRole(user.role));
  return children;
}
