import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { Colors, Typography, Radii, Shadows } from "./theme"; // your existing theme.jsx, untouched

const THEME_STORAGE_KEY = "@app/theme-mode";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  // "light" | "dark" | "system"
  const [themeMode, setThemeModeState] = useState("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on app start
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          mounted &&
          (stored === "light" || stored === "dark" || stored === "system")
        ) {
          setThemeModeState(stored);
        }
      } catch {
        // ignore read errors, fall back to "system"
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const resolvedScheme =
    themeMode === "system" ? (systemScheme ?? "light") : themeMode;
  const isDark = resolvedScheme === "dark";

  const value = useMemo(
    () => ({
      colors: isDark ? Colors.dark : Colors.light,
      isDark,
      typography: Typography,
      radii: Radii,
      shadows: Shadows,
      themeMode, // "light" | "dark" | "system" — what the user picked
      setThemeMode, // call this to change it app-wide
      isThemeLoaded: isLoaded,
    }),
    [isDark, themeMode, setThemeMode, isLoaded],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Drop-in replacement for theme.jsx's useTheme — same shape, plus themeMode/setThemeMode
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
