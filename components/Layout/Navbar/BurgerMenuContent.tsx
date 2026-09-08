"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, Package, Grid, ChevronDown } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegisterDialog from "./RegisterDialog";

interface BurgerMenuContentProps {
  isDarkMode: boolean;
}

export default function BurgerMenuContent({ isDarkMode }: BurgerMenuContentProps) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const accentColor = isDarkMode ? "text-[#C26B70]" : "text-[#7A1C25]";
  const borderColor = isDarkMode ? "border-white/10" : "border-black/10";
  const hoverBg = isDarkMode ? "hover:bg-white/5" : "hover:bg-black/5";

  return (
    <SheetContent 
      side="right" 
      className={`w-full sm:w-[400px] border-l ${borderColor} ${
        isDarkMode ? "bg-[#060508] text-white" : "bg-[#FAF7F2] text-[#1A1A1A]"
      } p-6 flex flex-col justify-between`}
    >
      <div>
        <SheetHeader className="text-left mb-8">
          <span className={`text-[10px] tracking-[0.3em] uppercase font-mono ${accentColor}`}>
            [ NAVIGATION MENU ]
          </span>
          <SheetTitle className={`font-serif text-2xl font-normal ${isDarkMode ? "text-white" : "text-[#1A1A1A]"}`}>
            Pilihan Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-4 font-light text-base">
          
          {/* 1. LOGIN (Hapus asChild di SheetClose) */}
          <SheetClose>
            <Link
              href="/login"
              className={`flex items-center justify-between p-3.5 rounded-xl border ${borderColor} ${hoverBg} transition-all`}
            >
              <div className="flex items-center gap-3">
                <LogIn className={`w-5 h-5 ${accentColor}`} />
                <span>Login Dashboard</span>
              </div>
              <span className="text-xs opacity-50 font-mono">→</span>
            </Link>
          </SheetClose>

<Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
  <DialogTrigger
    className={`w-full flex items-center justify-between p-3.5 rounded-xl border ${borderColor} ${hoverBg} transition-all text-left cursor-pointer`}
  >
    <div className="flex items-center gap-3">
      <UserPlus className={`w-5 h-5 ${accentColor}`} />
      <span>Daftar Akun</span>
    </div>
    <span className="text-xs opacity-50 font-mono">+</span>
  </DialogTrigger>
  
  <RegisterDialog isDarkMode={isDarkMode} onSwitchToLogin={() => setIsRegisterOpen(false)} />
</Dialog>

          {/* 3. PRODUK */}
          <div className={`rounded-xl border ${borderColor} overflow-hidden transition-all`}>
            <button
              onClick={() => setIsProductOpen(!isProductOpen)}
              className={`w-full flex items-center justify-between p-3.5 ${hoverBg} text-left transition-all`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-5 h-5 ${accentColor}`} />
                <span>Produk & Layanan</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProductOpen ? "rotate-180" : ""}`} />
            </button>

            {isProductOpen && (
              <div className={`flex flex-col border-t ${borderColor} p-2 space-y-1 ${isDarkMode ? "bg-black/20" : "bg-black/5"}`}>
                {/* Hapus asChild di SheetClose */}
                <SheetClose>
                  <Link
                    href="/wedding-organizer"
                    className={`text-sm px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 ${hoverBg} transition-all flex items-center justify-between`}
                  >
                    <span>💍 Wedding Organizer</span>
                    <span className="text-xs opacity-40">→</span>
                  </Link>
                </SheetClose>

                {/* Hapus asChild di SheetClose */}
                <SheetClose>
                  <Link
                    href="/D-invitation"
                    className={`text-sm px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 ${hoverBg} transition-all flex items-center justify-between`}
                  >
                    <span>💌 Digital Invitation</span>
                    <span className="text-xs opacity-40">→</span>
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>

          {/* 4. DLL (Hapus asChild di SheetClose) */}
          <SheetClose>
            <Link
              href="/dll"
              className={`flex items-center justify-between p-3.5 rounded-xl border ${borderColor} ${hoverBg} transition-all`}
            >
              <div className="flex items-center gap-3">
                <Grid className={`w-5 h-5 ${accentColor}`} />
                <span>Dll (Lainnya)</span>
              </div>
              <span className="text-xs opacity-50 font-mono">→</span>
            </Link>
          </SheetClose>

        </div>
      </div>

      <div className={`pt-6 border-t ${borderColor} text-xs opacity-60 flex justify-between items-center`}>
        <span>DC Wedding</span>
        <span className="font-mono">v1.0</span>
      </div>
    </SheetContent>
  );
}