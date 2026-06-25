import { Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Radii } from "../../constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MAX_CIRCLE_RADIUS = Math.sqrt(SCREEN_W * SCREEN_W + SCREEN_H * SCREEN_H);

export const NOTIFICATIONS = [
  {
    id: "n1",
    icon: "package",
    title: "New order received",
    message: "Julian Smith placed an order worth ₹1,240.",
    time: "2m ago",
  },
  {
    id: "n2",
    icon: "truck",
    title: "Order shipped",
    message: "Alice Morgan's order #ORD-8819 has shipped.",
    time: "1h ago",
  },
  {
    id: "n3",
    icon: "check-circle",
    title: "Order delivered",
    message: "Robert Chen's order #ORD-8815 was delivered.",
    time: "3h ago",
  },
  {
    id: "n4",
    icon: "x-circle",
    title: "Order cancelled",
    message: "Karen White cancelled order #ORD-8812.",
    time: "1d ago",
  },
];

/**
 * NotificationOverlay
 *
 * Props:
 *  - visible: boolean — controls open/close
 *  - origin: { x, y } | null — screen coords of the trigger button (for the reveal circle)
 *  - onClose: () => void
 *  - colors: theme color object
 *  - isDark: boolean
 */
export default function NotificationOverlay({
  visible,
  origin,
  onClose,
  colors,
  isDark,
}) {
  const revealAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(false);

  const animateOpen = () => {
    setRendered(true);
    revealAnim.setValue(0);
    contentOpacity.setValue(0);
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start();
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 260,
      delay: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateClose = () => {
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
    Animated.timing(revealAnim, {
      toValue: 0,
      duration: 360,
      useNativeDriver: true,
    }).start(() => {
      setRendered(false);
      onClose?.();
    });
  };

  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) animateOpen();
  else if (!visible && prevVisible.current && rendered) animateClose();
  prevVisible.current = visible;

  if (!rendered) return null;

  const originX = origin?.x ?? SCREEN_W - 40;
  const originY = origin?.y ?? 60;
  const circleSize = MAX_CIRCLE_RADIUS * 2;

  const scale = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      {/* Circular reveal backdrop */}
      <Animated.View
        style={[
          styles.revealCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            left: originX - circleSize / 2,
            top: originY - circleSize / 2,
            backgroundColor: isDark ? colors.background : "#ffffff",
            transform: [{ scale }],
          },
        ]}
      />

      {/* Content */}
      <Animated.View
        style={[styles.overlayContent, { opacity: contentOpacity }]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header */}
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: colors.text }]}>
              Notifications
            </Text>
            <Pressable
              onPress={animateClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.notifCloseBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#ecebeb40",
                },
              ]}
            >
              <Feather name="x" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Notification list */}
          <ScrollView
            contentContainerStyle={styles.notifList}
            showsVerticalScrollIndicator={false}
          >
            {NOTIFICATIONS.map((n) => (
              <View
                key={n.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: isDark ? "#252729" : "#ecebeb40",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.notifIconWrap,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#EEEEFF",
                    },
                  ]}
                >
                  <Feather name={n.icon} size={16} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifCardTitle, { color: colors.text }]}>
                    {n.title}
                  </Text>
                  <Text
                    style={[
                      styles.notifCardMessage,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {n.message}
                  </Text>
                  <Text
                    style={[styles.notifCardTime, { color: colors.textMuted }]}
                  >
                    {n.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  revealCircle: { position: "absolute" },
  overlayContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  notifTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  notifCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  notifList: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  notifCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: Radii.md || 12,
    borderWidth: 1,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  notifCardMessage: { fontSize: 12.5, lineHeight: 17 },
  notifCardTime: { fontSize: 11, marginTop: 6, opacity: 0.7 },
});
