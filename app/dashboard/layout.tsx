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

  // Staff/admin accounts use the separate admin workspace.
  if (user.role === "ADMIN" || user.role === "OWNER") redirect("/admin");

  return <DashboardGate>{children}</DashboardGate>;
}
