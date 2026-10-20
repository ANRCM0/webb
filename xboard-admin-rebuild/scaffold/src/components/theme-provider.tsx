import * as React from "react";

type Theme = "dark" | "light" | "system";
const ThemeContext = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "system",
  setTheme: () => null,
});

/** 复刻原件：storageKey "vite-ui-theme"，system 走 matchMedia */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    const applied =
      theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    root.classList.add(applied);
  }, [theme]);

  const setTheme = React.useCallback(
    (t: Theme) => {
      localStorage.setItem(storageKey, t);
      setThemeState(t);
    },
    [storageKey],
  );

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => React.useContext(ThemeContext);
