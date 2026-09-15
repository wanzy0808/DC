import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardGate from "@/components/Dashboard/DashboardGate";

// Always resolve the session on the server for every dashboard request.
// This layout wraps /dashboard and every route nested below it, so an
// unauthenticated visitor can never render a dashboard child directly.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // Staff workspaces are intentionally separated from the customer workspace.
  if (user.role === "OWNER") redirect("/owner");
  if (user.role === "ADMIN" || user.role === "FINANCE") redirect("/admin");
  if (user.role === "DESIGNER" || user.role === "EDITOR") redirect("/designer");

  return <DashboardGate>{children}</DashboardGate>;
}
