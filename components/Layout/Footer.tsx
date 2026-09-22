"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/Theme/ThemeProvider";
import { useLanguage } from "@/components/I18n/LanguageProvider";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.012-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.012-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.79 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.91 1.62V7.54a4.85 4.85 0 0 1-1-.85z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer({ embedded = false }: { embedded?: boolean }) {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  const isJiplak = pathname === "/jiplak";
  const isLanding = pathname === "/" || isJiplak || (embedded && (pathname === "/pagecontoh" || pathname === "/d-invitation"));
  const { messages } = useLanguage();
  const { footer } = messages;

  if ((!embedded && (pathname === "/" || pathname === "/pagecontoh" || pathname === "/d-invitation")) || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return null;
  }

  if (isLanding) {
    return (
      <footer
        className={`${embedded ? "relative" : "absolute bottom-0 left-0"} z-20 w-full border-none py-3 text-center font-[family-name:var(--font-dc-mono)] text-[10px] tracking-wider text-[var(--foreground)] opacity-50 md:text-xs ${
          isJiplak ? "bg-transparent" : "bg-background"
        }`}
      >
        © {new Date().getFullYear()} DC Organizer. {footer.rights}
      </footer>
    );
  }

  const socialItems = [InstagramIcon, TiktokIcon, FacebookIcon, YoutubeIcon];

  return (
    <footer
      className={`z-20 w-full border-none bg-transparent transition-colors duration-500 ${
        isDarkMode ? "text-white" : "text-[var(--foreground)]"
      }`}
    >
      <div className="mx-auto w-full max-w-[75%] space-y-12 px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 items-start justify-between gap-8 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6">
            <Link href="/" className="inline-block">
              <div className="font-[family-name:var(--font-dc-heading)] text-3xl font-bold tracking-[0.2em] text-[var(--primary)]">
                D C
              </div>
              <span className="block font-[family-name:var(--font-dc-mono)] text-[9px] uppercase tracking-[0.25em] opacity-60">
                ORGANIZER
              </span>
            </Link>
            <p className="max-w-sm font-[family-name:var(--font-dc-body)] text-xs font-light leading-relaxed opacity-70">
              {footer.description}
            </p>
            <div className="space-y-1 pt-2 font-[family-name:var(--font-dc-mono)] text-xs opacity-80">
              <p>{footer.customerService}:</p>
              <a
                href="https://wa.me/6282124786516"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--primary)]"
              >
                +62 821-2478-6516
              </a>
            </div>
          </div>

          <div className="space-y-3 text-left md:col-span-6 md:text-right">
            <h4 className="font-[family-name:var(--font-dc-mono)] text-xs uppercase tracking-widest opacity-80">
              {footer.paymentMethods}
            </h4>
            <div className="flex items-center md:justify-end">
              <div
                className={`inline-flex items-center justify-center rounded-2xl border p-3 backdrop-blur-md ${
                  isDarkMode
                    ? "border-white/10 bg-white/5 shadow-lg"
                    : "border-[var(--primary)]/10 bg-white shadow-md"
                }`}
              >
                <Image
                  src="/bca.webp"
                  alt="Bank BCA"
                  width={75}
                  height={25}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-[var(--border)] pt-8 md:grid-cols-4">
          <div className="space-y-3">
            <h5 className="font-[family-name:var(--font-dc-heading)] text-xs font-bold text-[var(--primary)]">
              {footer.products}
            </h5>
            <ul className="space-y-2 font-[family-name:var(--font-dc-body)] text-xs font-light opacity-70">
              <li>
                <Link href="/d-invitation">{footer.digitalInvitation}</Link>
              </li>
              <li>
                <Link href="/guestbook">{footer.qrGuestbook}</Link>
              </li>
              <li>
                <Link href="/event-planner">{footer.weddingPlanner}</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-[family-name:var(--font-dc-heading)] text-xs font-bold text-[var(--primary)]">
              {footer.help}
            </h5>
            <ul className="space-y-2 font-[family-name:var(--font-dc-body)] text-xs font-light opacity-70">
              <li>{footer.faq}</li>
              <li>{footer.terms}</li>
              <li>{footer.privacy}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-[family-name:var(--font-dc-heading)] text-xs font-bold text-[var(--primary)]">
              {footer.resources}
            </h5>
            <ul className="space-y-2 font-[family-name:var(--font-dc-body)] text-xs font-light opacity-70">
              <li>{footer.templates}</li>
              <li>{footer.articles}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-[family-name:var(--font-dc-heading)] text-xs font-bold text-[var(--primary)]">
              {footer.followUs}
            </h5>
            <div className="flex items-center gap-3">
              {socialItems.map((IconComponent, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={footer.followUs}
                  className={`rounded-full border p-2.5 transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? "border-white/10 bg-white/5 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                      : "border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 pt-4 font-[family-name:var(--font-dc-mono)] text-[10px] opacity-50 md:flex-row">
          <p>© 2026 PT DC ORGANIZER INDONESIA. {footer.rights}</p>
          <div className="flex gap-4">
            <span>{footer.legal}</span>
            <span>{footer.privacy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
