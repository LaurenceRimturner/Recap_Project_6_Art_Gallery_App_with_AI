import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getInitialTheme, THEME_STORAGE_KEY, type Theme } from "../theme";

const TRANSITION_MS = 300;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    return () => {
      window.clearTimeout(timer.current);
      document.documentElement.classList.remove("theme-transition");
    };
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.add("theme-transition");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => root.classList.remove("theme-transition"),
      TRANSITION_MS
    );

    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // the choice still applies for this visit
    }
  }

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      className="nav-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggle}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}
