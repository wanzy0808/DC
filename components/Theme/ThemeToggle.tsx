"use client";

import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/components/I18n/LanguageProvider";
import { useTheme } from "@/components/Theme/ThemeProvider";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { locale } = useLanguage();
  const label = isDarkMode
    ? locale === "en"
      ? "Switch to light mode"
      : "Ganti ke mode terang"
    : locale === "en"
      ? "Switch to dark mode"
      : "Ganti ke mode gelap";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="h-11 w-11 border-primary/35 bg-transparent text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-white/20 dark:text-white dark:hover:border-white/35 dark:hover:bg-white/[0.07] dark:hover:text-white"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
