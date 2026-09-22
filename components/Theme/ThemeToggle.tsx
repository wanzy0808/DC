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
      className="dc-theme-toggle h-11 w-11"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
