import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";

export default function InvitationEditorPage() {
  return <main className="min-h-screen bg-[#f8f0ed] text-[#2d2020]"><header className="flex min-h-16 items-center gap-3 border-b border-[#5E141C] bg-[#7A1C25] px-4 text-[#FFF8F5] sm:px-6"><Link href="/dashboard" className="rounded-lg p-2 text-[#FFF8F5] hover:bg-white/10"><ArrowLeft className="h-5 w-5"/></Link><span className="font-[var(--font-cinzel)] text-sm tracking-[.16em]">DC WEDDING</span><span className="h-5 w-px bg-white/25"/><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/85 hover:text-white"><LayoutTemplate className="h-4 w-4"/>Dashboard</Link></header><InvitationDesigner/></main>;
}
