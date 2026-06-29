/**
 * NotificationOverlay.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-screen circular-reveal overlay that shows the vendor's
 * real-time notification feed from Redux.
 * FIXED: Added comprehensive logging throughout
 */

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Radii } from "../../constants/theme";
import {
  clearAllNotifications,
  markAllRead,
  removeNotification,
  selectNotifications,
  selectUnreadCount,
} from "../../redux/notificationSlice";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MAX_CIRCLE_RADIUS = Math.sqrt(SCREEN_W ** 2 + SCREEN_H ** 2);

const TYPE_COLORS = {
  new_order: "#4CAF50",
  order_cancelled: "#F44336",
  order_status_updated: "#2196F3",
  low_stock_alert: "#FF9800",
};

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERLAY
═══════════════════════════════════════════════════════════════════════════ */
export default function NotificationOverlay({
  visible,
  origin,
  onClose,
  colors,
  isDark,
}) {
  console.log("[NotificationOverlay] Render:", {
    visible,
    isDark,
    colorsAvailable: !!colors,
  });

  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    console.log("[NotificationOverlay] Notifications updated:", {
      count: notifications.length,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: n.read,
      })),
    });
  }, [notifications, unreadCount]);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(false);

  const animateOpen = () => {
    console.log("[NotificationOverlay] animateOpen() called");
    setRendered(true);
    revealAnim.setValue(0);
    contentOpacity.setValue(0);

    console.log("[NotificationOverlay] Dispatching markAllRead");
    dispatch(markAllRead());

    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 480,
      useNativeDriver: true,
    }).start(() => {
      console.log("[NotificationOverlay] Reveal animation completed");
    });

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 260,
      delay: 200,
      useNativeDriver: true,
    }).start(() => {
      console.log("[NotificationOverlay] Content fade-in animation completed");
    });
  };

  const animateClose = () => {
    console.log("[NotificationOverlay] animateClose() called");
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
      console.log("[NotificationOverlay] Animations completed, closing");
      setRendered(false);
      onClose?.();
    });
  };

  const prevVisible = useRef(false);

  useEffect(() => {
    console.log("[NotificationOverlay] visible changed:", visible);
    if (visible && !prevVisible.current) {
      console.log("[NotificationOverlay] Opening...");
      animateOpen();
    } else if (!visible && prevVisible.current && rendered) {
      console.log("[NotificationOverlay] Closing...");
      animateClose();
    }
    prevVisible.current = visible;
  }, [visible, rendered]);

  if (!rendered) {
    console.log("[NotificationOverlay] Not rendered, returning null");
    return null;
  }

  const originX = origin?.x ?? SCREEN_W - 40;
  const originY = origin?.y ?? 60;
  const circleSize = MAX_CIRCLE_RADIUS * 2;
  const scale = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      {/* ── Circular reveal backdrop ──────────────────────────────────── */}
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

      {/* ── Content ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.overlayContent, { opacity: contentOpacity }]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Notifications
              </Text>
              {notifications.length > 0 && (
                <Text
                  style={[styles.headerSub, { color: colors.textSecondary }]}
                >
                  {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    console.log(
                      "[NotificationOverlay] Clear all button pressed",
                    );
                    dispatch(clearAllNotifications());
                  }}
                  style={[
                    styles.clearBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#f0f0f0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.clearBtnText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Clear all
                  </Text>
                </TouchableOpacity>
              )}

              <Pressable
                onPress={() => {
                  console.log("[NotificationOverlay] Close button pressed");
                  animateClose();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.closeBtn,
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
          </View>

          {/* List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <EmptyState colors={colors} isDark={isDark} />
            ) : (
              notifications.map((n) => {
                console.log(
                  "[NotificationOverlay] Rendering notification:",
                  n.id,
                );
                return (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    colors={colors}
                    isDark={isDark}
                    onDismiss={() => {
                      console.log(
                        "[NotificationOverlay] Dismiss pressed for:",
                        n.id,
                      );
                      dispatch(removeNotification(n.id));
                    }}
                  />
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATION CARD
═══════════════════════════════════════════════════════════════════════════ */
function NotificationCard({ notification: n, colors, isDark, onDismiss }) {
  const accentColor = TYPE_COLORS[n.type] || colors.primary || "#6366f1";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#252729" : "#fafafa",
          borderColor: colors.border,
          borderLeftColor: accentColor,
        },
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
        <Feather name={n.icon || "bell"} size={16} color={accentColor} />
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {n.title}
        </Text>
        <Text
          style={[styles.cardMessage, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {n.message}
        </Text>
        <Text style={[styles.cardTime, { color: colors.textMuted }]}>
          {relativeTime(n.timestamp)}
        </Text>
      </View>

      {/* Dismiss */}
      <Pressable
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.dismissBtn}
      >
        <Feather name="x" size={13} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════════════════ */
function EmptyState({ colors }) {
  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: "rgba(150,150,150,0.1)" },
        ]}
      >
        <Feather name="bell-off" size={32} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        All caught up!
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        New orders and alerts will appear here in real-time.
      </Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNREAD BADGE
═══════════════════════════════════════════════════════════════════════════ */
export function UnreadBadge({ colors }) {
  const count = useSelector(selectUnreadCount);

  useEffect(() => {
    console.log("[UnreadBadge] Count updated:", count);
  }, [count]);

  if (!count) {
    console.log("[UnreadBadge] No unread, returning null");
    return null;
  }

  return (
    <View
      style={[styles.badge, { backgroundColor: colors.danger || "#F44336" }]}
    >
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */
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

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearBtnText: { fontSize: 12, fontWeight: "600" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  /* List */
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },

  /* Card */
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: Radii.md || 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  cardMessage: { fontSize: 12.5, lineHeight: 17 },
  cardTime: { fontSize: 11, marginTop: 6, opacity: 0.7 },
  dismissBtn: { alignSelf: "flex-start", marginTop: 2 },

  /* Empty */
  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    opacity: 0.75,
  },

  /* Badge */
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
