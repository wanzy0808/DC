"use client";

import LandingFloralGlow from "@/components/Landing/LandingFloralGlow";
import FallingLeaves from "@/components/Layout/FallingLeaves";

/** Shared non-home marketing ambience: brand glow, restrained botanical edges and sparse falling leaves. */
export default function PublicMarketingAtmosphere() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(112,59,59,0.09),transparent_64%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,rgba(214,179,140,0.09),transparent_66%)]"
      />
      <LandingFloralGlow />
      <FallingLeaves />
    </>
  );
}
