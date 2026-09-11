"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole, ScanLine, X } from "lucide-react";

type Access = { digitalInvitation: boolean; guestbook: boolean; bundle: boolean };
type InvitationLink = { slug: string; type: "WEDDING" | "ADAT_AKAD"; isPublished: boolean };

function absoluteInvitationUrl(slug: string) {
  if (typeof window === "undefined") return `/invite/${slug}`;
  return `${window.location.origin}/invite/${slug}`;
}

export default function DashboardFeatureGuard({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>({ digitalInvitation: false, guestbook: false, bundle: false });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<"guestbook" | "digital">("guestbook");
  const [invitationLinks, setInvitationLinks] = useState<InvitationLink[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/access", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => data && setAccess(data)).catch(() => undefined);
    Promise.all([
      fetch("/api/invitations?type=WEDDING", { cache: "no-store" }),
      fetch("/api/invitations?type=ADAT_AKAD", { cache: "no-store" }),
    ]).then(async ([wedding, akad]) => {
      const rows: InvitationLink[] = [];
      for (const response of [wedding, akad]) {
        if (!response.ok) continue;
        const data = await response.json();
        const invitation = data?.invitation;
        if (invitation?.slug) rows.push({ slug: invitation.slug, type: invitation.type, isPublished: Boolean(invitation.isPublished) });
      }
      setInvitationLinks(rows);
    }).catch(() => undefined);

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const text = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
      const needsGuestbook = text.includes("tamu undangan") || text.includes("manajemen tamu") || text.includes("kelola tamu") || text.includes("tambah tamu");
      const needsDigital = text.includes("bagikan undangan") || text === "bagikan" || text.includes("publikasi");
      if ((!access.guestbook && needsGuestbook) || (!access.digitalInvitation && needsDigital)) {
        event.preventDefault();
        event.stopPropagation();
        setUpgradeType(!access.guestbook && needsGuestbook ? "guestbook" : "digital");
        setUpgradeOpen(true);
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [access.digitalInvitation, access.guestbook]);

  useEffect(() => {
    const renameGuestMenu = () => {
      document.querySelectorAll("button").forEach(button => {
        const text = button.textContent?.replace(/\s+/g, " ").trim();
        if (text === "Tamu Undangan" || text === "Tamu UndanganUpgrade") {
          const label = Array.from(button.children).find(child => child.tagName === "SPAN");
          if (label) label.textContent = "Manajemen Tamu";
        }
      });
    };
    renameGuestMenu();
    const observer = new MutationObserver(renameGuestMenu);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const renderInvitationLinks = () => {
      const active = Array.from(document.querySelectorAll("button")).some(button => {
        const text = button.textContent?.replace(/\s+/g, " ").trim();
        return text?.startsWith("Undangan Digital") && /bg-\[#7A1C25\]\/10|bg-\[#E8A5AE\]\/10/.test(button.className);
      });
      const main = document.querySelector(".dc-dashboard main");
      if (!main) return;
      const existing = main.querySelector<HTMLElement>("[data-dashboard-invitation-links]");
      if (!active) {
        existing?.remove();
        return;
      }
      if (existing) return;

      const wrapper = document.createElement("section");
      wrapper.dataset.dashboardInvitationLinks = "true";
      wrapper.className = "mx-auto max-w-6xl px-5 pt-5 sm:px-8";
      const card = document.createElement("div");
      card.className = "rounded-3xl border border-[#d9cbc2] bg-[#f3ede6] p-5 dark:border-white/10 dark:bg-[#121116]";
      card.innerHTML = `<div class="mb-4"><p class="font-[family-name:var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[.2em] text-[#7A1C25] dark:text-[#E8A5AE]">Link Undangan</p><h2 class="mt-1 font-[family-name:var(--font-fauna)] text-xl">Pilih undangan yang ingin dibagikan</h2></div>`;
      const grid = document.createElement("div");
      grid.className = "grid gap-3 md:grid-cols-2";

      const types = [
        ["WEDDING", "Undangan Pernikahan", "Link utama untuk acara pernikahan"],
        ["ADAT_AKAD", "Akad & Sangjit", "Link khusus untuk akad nikah / sangjit"],
      ] as const;
      for (const [type, title, description] of types) {
        const invitation = invitationLinks.find(item => item.type === type);
        const item = document.createElement("div");
        item.className = "rounded-2xl border border-[#d9cbc2] bg-[#faf7f2] p-4 dark:border-white/10 dark:bg-[#0f0e12]";
        const slug = invitation?.slug;
        const url = slug ? absoluteInvitationUrl(slug) : "";
        item.innerHTML = `<p class="font-[family-name:var(--font-cinzel)] text-sm font-semibold">${title}</p><p class="mt-1 text-xs text-[#5A4545] dark:text-white/60">${description}</p><p class="mt-3 truncate rounded-xl border border-[#d9cbc2] bg-transparent px-3 py-2 text-xs dark:border-white/10">${url || "Undangan belum tersedia"}</p>`;
        const actions = document.createElement("div");
        actions.className = "mt-3 flex gap-2";
        if (slug) {
          const open = document.createElement("a");
          open.href = `/invite/${slug}`;
          open.target = "_blank";
          open.rel = "noreferrer";
          open.className = "inline-flex flex-1 items-center justify-center rounded-xl bg-[#7A1C25] px-3 py-2 text-xs font-semibold text-white hover:bg-[#5E141C] dark:bg-[#C26B70] dark:text-black";
          open.textContent = invitation?.isPublished ? "Buka undangan" : "Preview link";
          actions.appendChild(open);
          const copy = document.createElement("button");
          copy.type = "button";
          copy.className = "rounded-xl border border-[#d9cbc2] px-3 py-2 text-xs font-semibold dark:border-white/10";
          copy.textContent = "Salin link";
          copy.addEventListener("click", async () => {
            await navigator.clipboard.writeText(url);
            copy.textContent = "Tersalin";
            window.setTimeout(() => { copy.textContent = "Salin link"; }, 1400);
          });
          actions.appendChild(copy);
        }
        item.appendChild(actions);
        grid.appendChild(item);
      }
      card.appendChild(grid);
      wrapper.appendChild(card);
      main.prepend(wrapper);
    };

    renderInvitationLinks();
    const observer = new MutationObserver(renderInvitationLinks);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [invitationLinks]);

  return <>
    {children}
    <div className="fixed right-0 top-0 z-[70] hidden h-16 items-center gap-1 border-b border-[#d8cbc2] bg-[#FAF7F2]/95 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0B0A0E]/95 sm:flex">
      <span className="mr-2 font-[family-name:var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[.14em] text-[#5A4545] dark:text-white/60">Menu</span>
      <Link href="/transactions" className="rounded-xl px-3 py-2 font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#3F3030] hover:bg-[#7A1C25]/10 dark:text-white/80 dark:hover:bg-white/5">Transaksi</Link>
      <Link href="/packages" className="rounded-xl bg-[#7A1C25] px-3 py-2 font-[family-name:var(--font-fauna)] text-xs font-semibold text-white hover:bg-[#5E141C]">Tambah paket</Link>
      <Link href="/faq" className="rounded-xl px-3 py-2 font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#3F3030] hover:bg-[#7A1C25]/10 dark:text-white/80 dark:hover:bg-white/5">FAQ</Link>
      <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 font-[family-name:var(--font-fauna)] text-xs font-semibold text-[#3F3030] hover:bg-[#7A1C25]/10 dark:text-white/80 dark:hover:bg-white/5">Bantuan</a>
    </div>
    <Link href="/dashboard/usher" className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium text-white shadow-xl transition hover:-translate-y-0.5 ${access.guestbook ? "bg-primary" : "bg-dc-maroon"}`}>
      {access.guestbook ? <ScanLine className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}Usher App{!access.guestbook && " · Upgrade"}
    </Link>
    {!access.guestbook && <div className="fixed bottom-20 right-5 z-30 hidden rounded-xl border border-border bg-card px-3 py-2 text-[9px] opacity-60 shadow-lg sm:block">Tamu &amp; Usher App tersedia di Guestbook Digital</div>}
    {upgradeOpen && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={() => setUpgradeOpen(false)}><div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5"/></div><button type="button" onClick={() => setUpgradeOpen(false)} className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"><X className="h-4 w-4"/></button></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Upgrade paket</p><h2 className="mt-2 font-[var(--font-cinzel)] text-2xl">{upgradeType === "guestbook" ? "Kelola tamu dengan lebih lengkap" : "Publikasikan undanganmu"}</h2><p className="mt-2 text-sm leading-6 opacity-60">{upgradeType === "guestbook" ? "Daftar tamu, nomor meja, kursi, Usher App, QR check-in, dan realtime attendance termasuk dalam Guestbook Digital." : "Paket Undangan Digital diperlukan untuk membagikan undanganmu ke tamu dan mengaktifkan halaman publik."}</p><Link href="/packages" onClick={() => setUpgradeOpen(false)} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-xs font-medium text-primary-foreground">Lihat paket</Link></div></div>}
  </>;
}
