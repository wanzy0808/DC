import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardGate from "@/components/Dashboard/DashboardGate";

// Always resolve the session on the server for every dashboard request.
// This layout wraps /dashboard and every route nested below it, so an
// unauthenticated visitor can never render a dashboard child directly.
export const dynamic = "force-dynamic";

const dashboardShellCss = `
  .dc-dashboard {
    min-height: 100dvh;
  }

  .dc-dashboard > .flex {
    min-height: 100dvh;
    padding-top: 4rem;
  }

  .dc-dashboard header {
    position: fixed !important;
    inset: 0 0 auto 0;
    width: 100%;
    z-index: 60;
  }

  .dc-dashboard header > div {
    width: min(80vw, calc(100% - 2rem)) !important;
    max-width: none !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .dc-dashboard > .flex > aside {
    height: calc(100dvh - 4rem);
    min-height: calc(100dvh - 4rem) !important;
    position: sticky;
    top: 4rem;
    overflow-y: auto;
  }

  .dc-dashboard main > div,
  .dc-dashboard main > section:not(.bg-background) {
    width: min(80vw, calc(100% - 2rem)) !important;
    max-width: none !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: clamp(0rem, 0.6vw, 0.75rem) !important;
    padding-right: clamp(0rem, 0.6vw, 0.75rem) !important;
  }

  .dc-dashboard main > section.bg-background > div {
    width: min(80vw, calc(100% - 2rem)) !important;
    max-width: none !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: clamp(0rem, 0.6vw, 0.75rem) !important;
    padding-right: clamp(0rem, 0.6vw, 0.75rem) !important;
  }

  .dc-dashboard main table {
    width: max-content !important;
    min-width: 940px !important;
    max-width: 1180px;
    border-collapse: separate;
    border-spacing: 0 0.4rem;
  }

  .dc-dashboard main table thead tr {
    border-bottom: 0 !important;
  }

  .dc-dashboard main table tbody tr {
    background: color-mix(in srgb, currentColor 2.5%, transparent);
  }

  .dc-dashboard main table tbody td:first-child {
    border-radius: 10px 0 0 10px;
  }

  .dc-dashboard main table tbody td:last-child {
    border-radius: 0 10px 10px 0;
  }

  @media (min-width: 1024px) {
    .dc-dashboard header a[href="/"] {
      width: 14.25rem;
      flex: 0 0 14.25rem;
    }
  }

  @media (max-width: 1023px) {
    .dc-dashboard > .flex > aside {
      top: 4rem !important;
      bottom: 0 !important;
      height: auto;
      min-height: 0 !important;
    }
  }
`;

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

  return (
    <DashboardGate>
      <style>{dashboardShellCss}</style>
      {children}
    </DashboardGate>
  );
}
