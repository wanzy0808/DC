"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ThemeName = "light" | "dark";

type ThemeContextValue = {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "light" || value === "dark";
}

function persistTheme(theme: ThemeName) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: ThemeName;
}) {
  const hasServerTheme = isThemeName(initialTheme);
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === "dark");
  const [themeReady, setThemeReady] = useState(hasServerTheme);

  // Migrate the existing localStorage preference once when there is no cookie yet.
  // We intentionally never consult prefers-color-scheme: the theme changes only
  // when the user explicitly presses the theme toggle.
  useEffect(() => {
    if (hasServerTheme) {
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
      setThemeReady(true);
      return;
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const theme: ThemeName = isThemeName(savedTheme) ? savedTheme : "light";
    const dark = theme === "dark";

    document.documentElement.classList.toggle("dark", dark);
    setIsDarkMode(dark);
    persistTheme(theme);
    setThemeReady(true);
  }, [hasServerTheme, initialTheme]);

  // Persist every explicit state change so refresh/navigation keeps the exact
  // last selected Light/Dark mode. The ready guard prevents the initial
  // default state from overwriting a saved preference during hydration.
  useEffect(() => {
    if (!themeReady) return;

    const theme: ThemeName = isDarkMode ? "dark" : "light";
    document.documentElement.classList.toggle("dark", isDarkMode);
    persistTheme(theme);
  }, [isDarkMode, themeReady]);

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
