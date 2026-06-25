/**
 * gridConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central config for product grid layout.
 * Covers: Android phones, iOS phones, Android tablets, iPad.
 *
 * Static usage (fixed at boot):
 *   import { numColumns, cardWidth, cardGap } from "../config/gridConfig";
 *
 * Reactive usage (updates on rotation):
 *   import { useGridConfig } from "../config/gridConfig";
 *   const { numColumns, cardWidth } = useGridConfig();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { Dimensions, Platform, StatusBar } from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Screen Dimensions
// ─────────────────────────────────────────────────────────────────────────────

const { width: BOOT_W, height: BOOT_H } = Dimensions.get("window");

export const SCREEN = {
  width: BOOT_W,
  height: BOOT_H,
};

// ─────────────────────────────────────────────────────────────────────────────
// Spacing System
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  giant: 64,
};

// Horizontal page padding
export const PAGE_PADDING = SPACING.xxl;

// Content width
export const CONTENT_WIDTH = BOOT_W - PAGE_PADDING * 2;

// ─────────────────────────────────────────────────────────────────────────────
// Safe Area & Status Bar
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

export const SAFE_AREA = {
  top: STATUS_BAR_HEIGHT,
  bottom: Platform.OS === "ios" ? 34 : 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component Sizes
// ─────────────────────────────────────────────────────────────────────────────

export const COMPONENT = {
  buttonHeight: 54,
  inputHeight: 56,

  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  headerHeight: 56,
  tabBarHeight: 64,

  avatarSm: 36,
  avatarMd: 48,
  avatarLg: 64,
};

// ─────────────────────────────────────────────────────────────────────────────
// Breakpoints
// ─────────────────────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

// ─────────────────────────────────────────────────────────────────────────────
// Grid Layout Constants
// ─────────────────────────────────────────────────────────────────────────────

const H_PADDING = 24; // total horizontal padding
const COLUMN_GAP = 12;

// ─────────────────────────────────────────────────────────────────────────────
// Device Helpers
// ─────────────────────────────────────────────────────────────────────────────

const IS_IOS = Platform.OS === "ios";
const IS_ANDROID = Platform.OS === "android";

export function isTablet(screenW = BOOT_W) {
  const ipad = IS_IOS && screenW >= 768;
  const androidTablet = IS_ANDROID && screenW >= 600;

  return ipad || androidTablet;
}

export function responsiveSize(mobile, tablet) {
  return isTablet() ? tablet : mobile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Width / Height Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function wp(percent) {
  return (BOOT_W * percent) / 100;
}

export function hp(percent) {
  return (BOOT_H * percent) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12 Column Layout Helper
// ─────────────────────────────────────────────────────────────────────────────

export function cols(n, totalCols = 12, gutter = SPACING.md) {
  const totalGutter = gutter * (totalCols - 1);

  const colWidth = (BOOT_W - PAGE_PADDING * 2 - totalGutter) / totalCols;

  return colWidth * n + gutter * (n - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Column Resolver
// ─────────────────────────────────────────────────────────────────────────────

function resolveColumns(screenW) {
  if (screenW >= 1024) return 5;

  if (isTablet(screenW)) return 4;

  if (IS_IOS) {
    return screenW < 375 ? 2 : 3;
  }

  if (IS_ANDROID) {
    return screenW < 360 ? 2 : 3;
  }

  return 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid Calculator
// ─────────────────────────────────────────────────────────────────────────────

function computeGrid(screenW, screenH) {
  const columns = resolveColumns(screenW);

  const totalGaps = (columns - 1) * COLUMN_GAP;

  const availableWidth = screenW - H_PADDING - totalGaps;

  const calculatedCardWidth = Math.floor(availableWidth / columns);

  return {
    numColumns: columns,
    cardWidth: calculatedCardWidth,
    imageSize: Math.floor(calculatedCardWidth * 0.8),
    cardGap: COLUMN_GAP,
    horizontalPad: H_PADDING / 2,
    screenWidth: screenW,
    screenHeight: screenH,
    isTablet: isTablet(screenW),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Values
// ─────────────────────────────────────────────────────────────────────────────

const _static = computeGrid(BOOT_W, BOOT_H);

export const numColumns = _static.numColumns;
export const cardWidth = _static.cardWidth;
export const cardGap = _static.cardGap;
export const horizontalPad = _static.horizontalPad;

// ─────────────────────────────────────────────────────────────────────────────
// Reactive Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useGridConfig() {
  const [grid, setGrid] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return computeGrid(width, height);
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setGrid(computeGrid(window.width, window.height));
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return grid;
}

// ─────────────────────────────────────────────────────────────────────────────
// Debug
// ─────────────────────────────────────────────────────────────────────────────

if (__DEV__) {
  console.log(
    `[gridConfig] platform=${Platform.OS} | screen=${BOOT_W}×${BOOT_H}` +
      ` | tablet=${_static.isTablet}` +
      ` | cols=${_static.numColumns}` +
      ` | cardWidth=${_static.cardWidth}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────────────────

export default {
  SCREEN,
  SPACING,
  PAGE_PADDING,
  CONTENT_WIDTH,

  COMPONENT,
  SAFE_AREA,
  BREAKPOINTS,

  cols,
  wp,
  hp,
  responsiveSize,
  isTablet,

  numColumns,
  cardWidth,
  cardGap,
  horizontalPad,

  useGridConfig,
};
