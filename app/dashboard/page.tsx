"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";
import DashboardPage from "../[dashboard]/page";

export default function DashboardHome() {
  return (
    <>
      <DashboardPage />
      <Link
        href="/dashboard/usher"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#E60087] px-4 py-3 text-xs font-medium text-white shadow-lg shadow-[#E60087]/25 transition hover:-translate-y-0.5 hover:bg-[#c90077]"
      >
        <ScanLine className="h-4 w-4" />
        Usher App
      </Link>
    </>
  );
}
