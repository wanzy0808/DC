"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { buttonVariants } from "@/components/ui/button";
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
    <div
      className="flex h-11 items-center gap-1 border border-primary/35 bg-transparent p-1"
      aria-label="Language selector"
    >
      {(["id", "en"] as const).map((item) => {
        const selected = locale === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => changeLocale(item)}
            aria-pressed={selected}
            aria-label={item === "id" ? "Bahasa Indonesia" : "English"}
            className={buttonVariants({
              variant: selected ? "ghost" : "ghost",
              size: "sm",
              className: `h-9 min-w-10 rounded-none px-2.5 font-[family-name:var(--font-dc-mono)] text-[10px] font-medium uppercase tracking-[0.08em] ${selected ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-primary/65 hover:bg-primary/5 hover:text-primary"}`,
            })}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
