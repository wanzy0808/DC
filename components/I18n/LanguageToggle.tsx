"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocale(nextLocale);
    router.refresh();
  };

  return (
    <div className="flex min-h-11 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--background)]/70 p-1 backdrop-blur-md" aria-label="Language selector">
      <Languages className="ml-2 h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
      {(["id", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => changeLocale(item)}
          aria-pressed={locale === item}
          className={`min-h-9 min-w-9 rounded-full px-2.5 font-[family-name:var(--font-dc-mono)] text-[10px] font-medium uppercase tracking-[0.08em] transition duration-200 ${locale === item ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
