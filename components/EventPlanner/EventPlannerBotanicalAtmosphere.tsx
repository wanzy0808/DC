"use client";

import FallingLeaves from "@/components/Layout/FallingLeaves";

/** Shared woodland ambience behind the marketing frame. */
export default function EventPlannerBotanicalAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_78%,rgba(157,120,83,0.11),transparent_42%),radial-gradient(ellipse_at_88%_27%,rgba(140,100,71,0.09),transparent_43%)] dark:bg-[radial-gradient(ellipse_at_12%_78%,rgba(214,179,140,0.075),transparent_42%),radial-gradient(ellipse_at_88%_27%,rgba(214,179,140,0.06),transparent_43%)]" />
      <div className="absolute -bottom-[12%] -left-[10%] h-[48%] w-[48%] rounded-[50%] bg-[radial-gradient(ellipse_at_32%_70%,rgba(116,91,66,0.19),transparent_67%),radial-gradient(ellipse_at_73%_82%,rgba(157,126,87,0.12),transparent_63%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_32%_70%,rgba(30,20,18,0.24),transparent_67%),radial-gradient(ellipse_at_73%_82%,rgba(214,179,140,0.07),transparent_63%)]" />
      <div className="absolute -bottom-[17%] -right-[9%] h-[43%] w-[43%] rounded-[50%] bg-[radial-gradient(ellipse_at_78%_70%,rgba(128,100,71,0.16),transparent_68%),radial-gradient(ellipse_at_27%_85%,rgba(176,138,94,0.10),transparent_62%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_78%_70%,rgba(31,21,18,0.22),transparent_68%),radial-gradient(ellipse_at_27%_85%,rgba(214,179,140,0.06),transparent_62%)]" />
      <FallingLeaves embedded variety="forest" className="opacity-50" />
    </div>
  );
}
