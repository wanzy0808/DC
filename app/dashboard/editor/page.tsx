import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import InvitationDesigner from "@/components/InvitationStudio/InvitationDesigner";

export default function InvitationEditorPage() {
  return <main className="min-h-screen bg-background text-foreground"><header className="flex min-h-14 items-center gap-3 border-b border-border bg-card px-4 sm:px-6"><Link href="/dashboard" className="rounded-lg p-2 opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"><ArrowLeft className="h-4 w-4"/></Link><span className="font-[var(--font-cinzel)] text-sm tracking-[.16em] text-primary">DC WEDDING</span><span className="h-4 w-px bg-border"/><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs opacity-60 hover:opacity-100"><LayoutTemplate className="h-4 w-4"/>Dashboard</Link></header><InvitationDesigner/></main>;
}
