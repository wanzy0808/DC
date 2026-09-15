"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { Button } from "@/components/ui/button";
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
    <div className="flex h-11 items-center gap-1 bg-transparent p-0" aria-label="Language selector">
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
            className={`h-9 min-w-10 rounded-none border-0 bg-transparent px-2.5 font-[family-name:var(--font-dc-mono)] text-[10px] font-medium uppercase tracking-[0.08em] shadow-none ${
              selected
                ? "text-primary underline decoration-1 underline-offset-4"
                : "text-primary/65 hover:bg-primary/5 hover:text-primary"
            } dark:${selected ? "text-primary" : "text-primary/65"}`}
          >
            {item.toUpperCase()}
          </Button>
        );
      })}
    </div>
  );
}
