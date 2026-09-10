"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import RomanticBackground from "@/components/Layout/background";

const privatePrefixes = ["/dashboard", "/admin"];

export default function PublicAtmosphere() {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  // The landing page already owns its interactive background. Keeping a
  // second global background here causes duplicated visual layers there.
  if (isPrivateArea || pathname === "/") return null;

  return <RomanticBackground />;
}

export function PublicContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLanding = pathname === "/";

  return (
    <main
      className={
        isPrivateArea
          ? "w-full min-h-screen"
          : isLanding
            ? "public-content landing-page w-full mx-auto flex-1 flex flex-col justify-center items-center relative z-10"
            : "public-content public-page w-[75vw] max-w-[75vw] mx-auto flex-1 flex flex-col relative z-10"
      }
    >
      {children}
    </main>
  );
}
