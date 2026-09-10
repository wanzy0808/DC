"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/Theme/ThemeContext";
import { usePathname } from "next/navigation";

function InstagramIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.012-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.79 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
}
function TiktokIcon({ className }: { className?: string }) { return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.91 1.62V7.54a4.85 4.85 0 0 1-1-.85z"/></svg>; }
function FacebookIcon({ className }: { className?: string }) { return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>; }
function YoutubeIcon({ className }: { className?: string }) { return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>; }

export default function Footer() {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;

  if (pathname === "/") {
    return <footer className="absolute bottom-0 left-0 w-full py-3 text-center text-[10px] md:text-xs opacity-50 font-mono tracking-wider z-20 bg-transparent text-[var(--foreground)] border-none pointer-events-none">© {new Date().getFullYear()} DC Wedding. All Rights Reserved.</footer>;
  }

  return <footer className={`w-full border-none bg-transparent transition-colors duration-500 z-20 ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
    <div className="w-full max-w-[75%] mx-auto px-6 py-12 md:py-16 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
        <div className="md:col-span-6 space-y-4"><Link href="/" className="inline-block"><div className={`font-serif text-3xl font-bold tracking-[0.2em] ${isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]"}`}>D C</div><span className="text-[9px] font-sans tracking-[0.25em] opacity-60 uppercase block">WEDDING</span></Link><p className="text-xs max-w-sm leading-relaxed opacity-70 font-light">DC adalah platform digitalisasi pernikahan terpadu yang membuat pernikahanmu lebih efisien, berkesan, dan elegan.</p><div className="pt-2 text-xs font-mono opacity-80 space-y-1"><p>Layanan Pelanggan:</p><p className={`font-semibold ${isDarkMode ? "text-[#E8A5AE]" : "text-[#7A1C25]"}`}>halo@dcwedding.co | +62 812-3456-7890</p></div></div>
        <div className="md:col-span-6 md:text-right space-y-3"><h4 className="text-xs font-mono uppercase tracking-widest opacity-80">Metode Pembayaran</h4><div className="flex md:justify-end items-center"><div className={`p-3 rounded-2xl border backdrop-blur-md inline-flex items-center justify-center ${isDarkMode ? "bg-white/5 border-white/10 shadow-lg" : "bg-white border-[#7A1C25]/10 shadow-md"}`}><Image src="/bca.webp" alt="Bank BCA" width={75} height={25} className="object-contain h-6 w-auto" /></div></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8"><div className="space-y-3"><h5 className={`text-xs font-serif font-bold ${isDarkMode ? "text-[#E8A5AE]" : "text-[#7A1C25]"}`}>Produk</h5><ul className="space-y-2 text-xs opacity-70 font-light"><li><Link href="/D-invitation">Undangan Digital</Link></li><li><Link href="/guestbook">Buku Tamu QR</Link></li><li><Link href="/wedding-organizer">WO & Planning</Link></li></ul></div><div className="space-y-3"><h5 className={`text-xs font-serif font-bold ${isDarkMode ? "text-[#E8A5AE]" : "text-[#7A1C25]"}`}>Bantuan</h5><ul className="space-y-2 text-xs opacity-70 font-light"><li>FAQ</li><li>Syarat & Ketentuan</li><li>Kebijakan Privasi</li></ul></div><div className="space-y-3"><h5 className={`text-xs font-serif font-bold ${isDarkMode ? "text-[#E8A5AE]" : "text-[#7A1C25]"}`}>Resources</h5><ul className="space-y-2 text-xs opacity-70 font-light"><li>Katalog Template</li><li>Blog & Artikel</li></ul></div><div className="space-y-3"><h5 className={`text-xs font-serif font-bold ${isDarkMode ? "text-[#E8A5AE]" : "text-[#7A1C25]"}`}>Ikuti Kami</h5><div className="flex items-center gap-3">{[{icon:InstagramIcon,href:"#"},{icon:TiktokIcon,href:"#"},{icon:FacebookIcon,href:"#"},{icon:YoutubeIcon,href:"#"}].map((item,index)=>{const IconComponent=item.icon;return <a key={index} href={item.href} className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${isDarkMode ? "bg-[#C26B70]/15 border-[#C26B70]/30 text-[#E8A5AE] hover:bg-[#C26B70] hover:text-white" : "bg-[#7A1C25]/10 border-[#7A1C25]/20 text-[#7A1C25] hover:bg-[#7A1C25] hover:text-white"}`}><IconComponent className="w-4 h-4" /></a>;})}</div></div></div>
      <div className="pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono opacity-50 gap-2"><p>© 2026 PT DC ORGANIZER INDONESIA. All Rights Reserved.</p><div className="flex gap-4"><span>Pernyataan Hukum</span><span>Kebijakan Privasi</span></div></div>
    </div>
  </footer>;
}
