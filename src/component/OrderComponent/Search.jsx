import { Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, TextInput, View } from "react-native";

/* ─── Glass tokens (mirrored from parent) ──────────────────────────────────── */
const GLASS = {
  light: {
    bg: "#ecebeb40",
    border: "rgba(255,255,255,0.85)",
    shadow: "rgba(0,0,0,0.08)",
  },
  dark: {
    bg: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.14)",
    shadow: "rgba(0,0,0,0.4)",
    shine: "rgba(255,255,255,0.10)",
  },
};

/**
 * GlassIconButton
 *
 * A pill-shaped frosted-glass icon button with spring press animation.
 *
 * Props:
 *  - icon: Feather icon name
 *  - size: icon size (default 18)
 *  - onPress: () => void
 *  - isDark: boolean
 *  - colors: theme color object
 *  - badge: boolean — shows a red notification dot
 */
export function GlassIconButton({
  icon,
  size = 18,
  onPress,
  isDark,
  colors,
  badge,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const g = isDark ? GLASS.dark : GLASS.light;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.glassBtn,
          {
            backgroundColor: g.bg,
            borderColor: g.border,
            shadowColor: g.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
      >
        <Feather name={icon} size={size} color={colors.text} />
        {badge ? <View style={styles.badgeDot} /> : null}
      </Pressable>
    </Animated.View>
  );
}

/**
 * GlassNotificationButton
 *
 * Bell icon button with an animated ripple ring on press.
 *
 * Props:
 *  - onPress: () => void
 *  - colors: theme color object
 *  - isDark: boolean
 *  - onLayoutOrigin: ({ x, y }) => void — reports screen-centre of the button
 *    so the caller can position the circular reveal overlay correctly.
 */
export function GlassNotificationButton({
  onPress,
  colors,
  isDark,
  onLayoutOrigin,
}) {
  const containerRef = useRef(null);
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, w, h) => {
        onLayoutOrigin?.({ x: x + w / 2, y: y + h / 2 });
      });
    }

    rippleScale.setValue(0);
    rippleOpacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.8,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <View ref={containerRef} style={styles.rippleWrapper}>
      {/* Ripple ring */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rippleRing,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
            borderColor: isDark
              ? "rgba(255,255,255,0.25)"
              : "rgba(99,102,241,0.35)",
          },
        ]}
      />
      <GlassIconButton
        icon="bell"
        size={17}
        onPress={handlePress}
        isDark={isDark}
        colors={colors}
        badge
      />
    </View>
  );
}

/**
 * SearchBar
 *
 * A frosted-glass search bar that slides in from the right.
 * Manages its own open/close animation internally; callers just toggle
 * `visible` to show or hide it.
 *
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - colors: theme color object
 *  - isDark: boolean
 *  - topOffset: number — vertical position from top of parent (default 118)
 *
 * Exposes:
 *  - searchQuery: string (managed internally, can be lifted via onQueryChange)
 *  - onQueryChange: (text: string) => void — optional callback
 */
export default function SearchBar({
  visible,
  onClose,
  colors,
  isDark,
  topOffset = 118,
  onQueryChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevVisible = useRef(false);

  if (visible && !prevVisible.current) {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  } else if (!visible && prevVisible.current) {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
  prevVisible.current = visible;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [420, 0],
  });

  const g = isDark ? GLASS.dark : GLASS.light;

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSearchQuery("");
      onQueryChange?.("");
      onClose?.();
    });
  };

  const handleChangeText = (text) => {
    setSearchQuery(text);
    onQueryChange?.(text);
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.searchBar,
        {
          top: topOffset,
          backgroundColor: g.bg,
          borderColor: g.border,
          shadowColor: g.shadow,
          transform: [{ translateX }],
        },
      ]}
    >
      {/* Back / close chevron */}
      <Pressable
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ marginRight: 12 }}
      >
        <Feather name="chevron-right" size={20} color={colors.text} />
      </Pressable>

      {/* Input */}
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Search orders…"
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={handleChangeText}
        autoFocus
      />

      {/* Clear button */}
      {searchQuery.length > 0 && (
        <Pressable
          onPress={() => handleChangeText("")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={17} color={colors.textSecondary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* ── Glass icon button ──────────────────────────────────────────────────── */
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* Notification badge dot */
  badgeDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  /* Ripple ring around notification button */
  rippleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  rippleRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },

  /* ── Search bar ─────────────────────────────────────────────────────────── */
  searchBar: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 8,
  },
});
