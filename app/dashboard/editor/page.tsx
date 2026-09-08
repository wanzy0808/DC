import Link from "next/link";
import { ArrowLeft, ExternalLink, LayoutTemplate, MonitorPlay, Save } from "lucide-react";
import InvitationEditor from "@/components/InvitationStudio/InvitationEditor";
import InvitationCanvasEditor from "@/components/InvitationStudio/InvitationCanvasEditor";

export default function InvitationEditorPage() {
  return (
    <main className="min-h-screen bg-dc-cream text-[#1A1A1A] font-sans [font-family:var(--font-dc-sans)] dark:bg-dc-dark dark:text-white">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded-lg p-2 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10" aria-label="Kembali ke dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-serif text-lg font-bold tracking-[0.15em] text-dc-maroon dark:text-dc-pink">D C</span>
            <span className="h-4 w-px bg-black/10 dark:bg-white/10" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Invitation Studio</p>
            <h1 className="text-sm font-medium">Eternal Blossom</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs text-emerald-600 sm:flex"><Save className="h-3.5 w-3.5" />Auto-save aktif</span>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs dark:border-white/10"><LayoutTemplate className="h-3.5 w-3.5" />Dashboard</Link>
          <Link href="/dashboard" className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs opacity-60 transition hover:opacity-100 sm:inline-flex"><MonitorPlay className="h-3.5 w-3.5" />Kembali ke ringkasan</Link>
        </div>
      </header>
      <div className="border-b border-border bg-card px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto text-xs">
          <Link href="/dashboard/editor" className="border-b-2 border-dc-pink py-2 font-medium text-dc-pink">Edit desain</Link>
          <Link href="/dashboard" className="py-2 opacity-50 transition hover:opacity-100">Halaman undangan</Link>
          <Link href="/dashboard/editor#share" className="py-2 opacity-50 transition hover:opacity-100">Bagikan</Link>
          <Link href="/dashboard/editor#settings" className="py-2 opacity-50 transition hover:opacity-100">Pengaturan</Link>
          <span className="ml-auto hidden items-center gap-1 whitespace-nowrap opacity-50 sm:flex"><ExternalLink className="h-3 w-3" /> 1 undangan aktif</span>
        </div>
      </div>
      <InvitationCanvasEditor />
      <div className="border-t border-black/10 bg-dc-cream py-10 dark:border-white/10 dark:bg-dc-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-dc-maroon dark:text-dc-pink">Buka pengaturan data undangan lanjutan</summary>
            <InvitationEditor />
          </details>
        </div>
      </div>
    </main>
  );
}
