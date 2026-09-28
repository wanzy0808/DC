"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import FallingLeaves from "@/components/Layout/FallingLeaves";
import PublicMarketingAtmosphere from "@/components/Layout/PublicMarketingAtmosphere";
import { isFramedMarketingPath, isMarketingPath } from "@/lib/marketing-paths";

const privatePrefixes = ["/dashboard", "/admin"];

export default function PublicAtmosphere() {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  // Framed pages own their ambient layers inside their isolated scene; do not double them here.
  if (isPrivateArea || isFramedMarketingPath(pathname)) return null;
  if (isMarketingPath(pathname)) return <PublicMarketingAtmosphere />;

  // Unrelated public routes keep only the restrained leaf ambience; no full woodland silhouette.
  return <FallingLeaves />;
}

export function PublicContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isFramedMarketing = isFramedMarketingPath(pathname);
  const isAuthPage = pathname === "/login";

  return (
    <main
      className={`${
        isPrivateArea
          ? "w-full min-h-screen"
          : isFramedMarketing
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
