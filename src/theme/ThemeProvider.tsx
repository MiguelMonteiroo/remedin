import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { resolveThemeName, themes, type ThemeColors, type ThemeName } from "./theme";

type AppTheme = { name: ThemeName; colors: ThemeColors };
const ThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const name = resolveThemeName(useColorScheme());
  const value = useMemo(() => ({ name, colors: themes[name] }), [name]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useAppTheme requires AppThemeProvider");
  return theme;
}
