"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1]) : "";
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

function writeStoredTheme(theme: Theme) {
  document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeProvider({
  children,
  ...props
}: { children: React.ReactNode } & Record<string, unknown>) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>("light");

  // Hydrate from the cookie (SSR-readable) and reflect it on the DOM.
  React.useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    setResolvedTheme(resolveTheme(stored));
  }, []);

  // Keep in sync with OS preference while using "system".
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        applyTheme("system");
        setResolvedTheme(getSystemTheme());
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredTheme(next);
    applyTheme(next);
    setResolvedTheme(resolveTheme(next));
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
    };
  }
  return ctx;
}
