"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const selectorLabel = locale === "en" ? "Language selector" : "Pilih bahasa";

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocale(nextLocale);
    router.refresh();
  };

  return (
    <div className="dc-language-toggle flex h-11 items-center gap-1 bg-transparent p-0" aria-label={selectorLabel}>
      {(["id", "en"] as const).map((item) => {
        const selected = locale === item;

        return (
          <Button
            key={item}
            type="button"
            size="sm"
            onClick={() => changeLocale(item)}
            aria-pressed={selected}
            aria-label={item === "id" ? "Bahasa Indonesia" : "English"}
            className={`h-9 min-w-10 rounded-none border-0 px-2.5 font-[family-name:var(--font-dc-mono)] text-[10px] font-medium uppercase tracking-[0.08em] shadow-none ${
              selected
                ? "bg-primary/40 text-primary hover:bg-primary/15 hover:text-primary dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:hover:text-white"
                : "bg-transparent text-primary/65 hover:bg-primary/5 hover:text-primary dark:bg-transparent dark:text-white/60 dark:hover:bg-white/[0.07] dark:hover:text-white"
            }`}
          >
            {item.toUpperCase()}
          </Button>
        );
      })}
    </div>
  );
}
