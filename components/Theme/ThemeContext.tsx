"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/I18n/LanguageProvider";

type ThemeContextType = {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const dark = savedTheme === "dark";

    document.documentElement.classList.toggle("dark", dark);
    window.setTimeout(() => setIsDarkMode(dark), 0);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        toggleTheme: () => setIsDarkMode((value) => !value),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }

  return context;
}

export function ThemeToggle() {
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
      className="h-11 w-11 border-primary/35 bg-transparent text-primary shadow-none hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      {isDarkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </Button>
  );
}
