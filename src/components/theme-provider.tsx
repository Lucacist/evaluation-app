"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "default" | "blue" | "green" | "purple" | "orange" | "rose" | "blue-dark" | "green-dark" | "purple-dark" | "orange-dark" | "rose-dark" | "slate-dark";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

const themeColors: Record<Theme, { bg: string; sidebar: string }> = {
  default: { bg: "bg-background", sidebar: "bg-card" },
  blue: { bg: "bg-blue-50", sidebar: "bg-blue-100" },
  green: { bg: "bg-green-50", sidebar: "bg-green-100" },
  purple: { bg: "bg-purple-50", sidebar: "bg-purple-100" },
  orange: { bg: "bg-orange-50", sidebar: "bg-orange-100" },
  rose: { bg: "bg-rose-50", sidebar: "bg-rose-100" },
  "blue-dark": { bg: "bg-blue-200", sidebar: "bg-blue-300" },
  "green-dark": { bg: "bg-green-200", sidebar: "bg-green-300" },
  "purple-dark": { bg: "bg-purple-200", sidebar: "bg-purple-300" },
  "orange-dark": { bg: "bg-orange-200", sidebar: "bg-orange-300" },
  "rose-dark": { bg: "bg-rose-200", sidebar: "bg-rose-300" },
  "slate-dark": { bg: "bg-slate-200", sidebar: "bg-slate-300" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as Theme | null;
    if (savedTheme && themeColors[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("app-theme", theme);
      // Appliquer la couleur au body
      document.body.className = document.body.className
        .replace(/bg-\w+-\d+/g, "")
        .replace(/bg-background/g, "")
        .trim();
      document.body.classList.add(themeColors[theme].bg);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    // Retourner des valeurs par défaut si pas dans le provider
    return { theme: "default" as Theme, setTheme: () => {} };
  }
  return context;
}

export function getSidebarColor(theme: Theme): string {
  return themeColors[theme]?.sidebar || "bg-card";
}

export { themeColors, type Theme };
