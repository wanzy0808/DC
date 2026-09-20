"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import RosePetalBackground from "@/components/Layout/RosePetalBackground";

const privatePrefixes = ["/dashboard", "/admin"];

export default function PublicAtmosphere() {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/" || pathname === "/jiplak";

  // The landing page and its temporary clone already own their interactive
  // background. Keeping a second global background causes duplicate layers.
  if (isPrivateArea || isLanding) return null;

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
  const isLanding = pathname === "/" || pathname === "/jiplak";
  const isDigitalInvitation = pathname === "/d-invitation";

  return (
    <main
      className={`${arrivalPath === pathname ? "dc-portal-arrival " : ""}${
        isPrivateArea
          ? "w-full min-h-screen"
          : isLanding || isDigitalInvitation
            ? "public-content landing-page w-full mx-auto flex-1 flex flex-col relative z-10"
            : "public-content public-page w-[75vw] max-w-[75vw] mx-auto flex-1 flex flex-col relative z-10"
      }`}
    >
      {children}
    </main>
  );
}
