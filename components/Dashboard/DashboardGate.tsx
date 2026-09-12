"use client";

import { useEffect, type ReactNode } from "react";

export default function DashboardGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.dashboardReady = "true";
    return () => {
      delete document.documentElement.dataset.dashboardReady;
    };
  }, []);

  return <div className="dashboard-gate-shell">{children}</div>;
}
