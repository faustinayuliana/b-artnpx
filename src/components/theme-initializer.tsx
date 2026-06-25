"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/src/lib/stores";

export function ThemeInitializer() {
  const { theme } = usePreferencesStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else if (theme === "light") {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      } else if (theme === "system") {
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemIsDark) {
          root.classList.add("dark");
          root.style.colorScheme = "dark";
        } else {
          root.classList.remove("dark");
          root.style.colorScheme = "light";
        }
      }
    };

    applyTheme();

    // Listen to system changes if theme is system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        applyTheme();
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return null;
}
