"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import RosePetalBackground from "@/components/Layout/RosePetalBackground";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import { isMarketingPath } from "@/lib/marketing-paths";

const privatePrefixes = ["/dashboard", "/admin"];

export default function PublicAtmosphere() {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/" || pathname === "/jiplak" || pathname === "/pagecontoh";

  // Framed pages own their ambient layers inside their isolated scene; don't double them here.
  if (isPrivateArea || isLanding || pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik") return null;
  if (isMarketingPath(pathname)) return <PublicMarketingAtmosphere />;

  // Preserve existing background behavior for unrelated public routes.
  return <RosePetalBackground />;
}

export function PublicContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [arrivalPath, setArrivalPath] = useState<string | null>(null);

  useEffect(() => {
    // The orbital preview writes this token only after the camera enters.
    // It is consumed once on the real destination route; direct links and
    // browser back/forward don't replay the transition.
    if (!["/event-planner", "/d-invitation", "/guestbook"].includes(pathname)) return;
    let requested: string | null = null;
    try {
      requested = window.sessionStorage.getItem("dc.portal.arrival");
      if (requested === pathname) window.sessionStorage.removeItem("dc.portal.arrival");
    } catch {
      return;
    }
    if (requested !== pathname) return;
    const raf = window.requestAnimationFrame(() => setArrivalPath(pathname));
    const finish = window.setTimeout(() => setArrivalPath(null), 850);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(finish);
    };
  }, [pathname]);
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/" || pathname === "/jiplak" || pathname === "/pagecontoh";
  const isFramedMarketing = pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik";

  return (
    <main
      className={`${arrivalPath === pathname ? "dc-portal-arrival " : ""}${
        isPrivateArea
          ? "w-full min-h-screen"
          : isLanding || isFramedMarketing
            ? "public-content landing-page w-full mx-auto flex-1 flex flex-col relative z-10"
            : "public-content public-page w-[75vw] max-w-[75vw] mx-auto flex-1 flex flex-col relative z-10"
      }`}
    >
      {children}
    </main>
  );
}
