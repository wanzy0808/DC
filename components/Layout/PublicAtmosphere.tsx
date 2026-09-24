"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import RosePetalBackground from "@/components/Layout/RosePetalBackground";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import { isMarketingPath } from "@/lib/marketing-paths";

const privatePrefixes = ["/dashboard", "/admin"];

export default function PublicAtmosphere() {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/";

  // Framed pages own their ambient layers inside their isolated scene; don't double them here.
  if (isPrivateArea || isLanding || pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik") return null;
  if (isMarketingPath(pathname)) return <PublicMarketingAtmosphere />;

  // Preserve existing background behavior for unrelated public routes.
  return <RosePetalBackground />;
}

export function PublicContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/";
  const isFramedMarketing = pathname === "/d-invitation" || pathname === "/template-design" || pathname === "/event-planner" || pathname === "/guestbook" || pathname === "/undangan-fisik";
  const isAuthPage = pathname === "/login";

  return (
    <main
      className={`${
        isPrivateArea
          ? "w-full min-h-screen"
          : isLanding || isFramedMarketing
            ? "public-content landing-page w-full mx-auto flex-1 flex flex-col relative z-10"
            : isAuthPage
              ? "public-content w-full mx-auto flex-1 flex flex-col relative z-10"
              : "public-content public-page w-[75vw] max-w-[75vw] mx-auto flex-1 flex flex-col relative z-10"
      }`}
    >
      {children}
    </main>
  );
}
