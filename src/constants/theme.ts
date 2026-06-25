// theme.jsx
import { useColorScheme } from "react-native";

export const Colors = {
  light: {
    primary: "#FB8106",
    primaryLight: "#FFA040",
    primaryDark: "#D96A00",
    secondary: "#5BB74A",
    secondaryLight: "#7DD46C",
    background: "#FFFFFF",
    surface: "#F7F8FA",
    surfaceElevated: "#FFFFFF",
    border: "#EDEFF3",
    text: "#1A1D23",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    placeholder: "#B0B7C3",
    error: "#EF4444",
    success: "#5BB74A",
    shadow: "#000000",
    card: "#FFFFFF",
    inputBg: "#F7F8FA",
    divider: "#F0F1F3",
    overlay: "rgba(0,0,0,0.45)",
  },
  dark: {
    primary: "#FB8106",
    primaryLight: "#FFA040",
    primaryDark: "#D96A00",

    secondary: "#5BB74A",
    secondaryLight: "#7DD46C",

    background: "#3B3E40",
    surface: "#17181C",
    surfaceElevated: "#24262B",

    card: "#1A1B20",
    inputBg: "#24262B",

    border: "#3B3E45",
    divider: "#2D3038",

    text: "#FFFFFF",
    textSecondary: "#C9CDD5",
    textMuted: "#8B909B",
    placeholder: "#6F7682",

    error: "#FF5C5C",
    success: "#5BB74A",

    shadow: "#000000",
    overlay: "rgba(0,0,0,0.75)",
  },
};

export const Typography = {
  display: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  heading1: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  heading3: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  button: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    lineHeight: 20,
  },
};

export const Radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  primary: {
    shadowColor: "#FB8106",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
    typography: Typography,
    radii: Radii,
    shadows: Shadows,
  };
}

export default { Colors, Typography, Radii, Shadows };
