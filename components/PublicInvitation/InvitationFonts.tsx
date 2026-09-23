"use client";

import { useEffect } from "react";

/** Reuse one stylesheet per family; picker requests only the existing font catalog. */
export default function InvitationFonts({ families }: { families: readonly string[] }) {
  const key = [...new Set(families)].sort().join("|");
  useEffect(() => {
    for (const family of key.split("|")) {
      if (!family || family === "Cinzel" || family === "Fauna One") continue;
      const id = `dc-invitation-font-${family.replaceAll(" ", "-")}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      const name = family === "Slabo" ? "Slabo 27px" : family;
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}&display=swap`;
      document.head.appendChild(link);
    }
  }, [key]);
  return null;
}
