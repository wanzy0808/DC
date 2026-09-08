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

  if (isPrivateArea) return null;

  return <RomanticBackground />;
}

export function PublicContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivateArea = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return (
    <main
      className={
        isPrivateArea
          ? "w-full min-h-screen"
          : "public-content w-full max-w-[80%] lg:max-w-[70%] mx-auto flex-1 flex flex-col justify-center items-center relative z-10"
      }
    >
      {children}
    </main>
  );
}