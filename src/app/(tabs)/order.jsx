import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Radii, Shadows, useTheme } from "../../constants/theme";

// ── Separated components ───────────────────────────────────────────────────
import NotificationOverlay from "@/component/OrderComponent/NotificationOverlay";
import SearchBar, {
  GlassIconButton,
  GlassNotificationButton,
} from "../../component/OrderComponent/Search";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const ORDERS = [
  {
    id: "#ORD-8821",
    name: "Julian Smith",
    initials: "JS",
    avatarColor: "#D9F2E3",
    avatar: null,
    date: "Oct 24, 2023",
    status: "New",
    total: "₹1,240",
  },
  {
    id: "#ORD-8819",
    name: "Alice Morgan",
    initials: "AM",
    avatarColor: "#E1E6FB",
    avatar: null,
    date: "Oct 23, 2023",
    status: "Shipped",
    total: "₹860",
  },
  {
    id: "#ORD-8815",
    name: "Robert Chen",
    initials: "RC",
    avatarColor: null,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    date: "Oct 22, 2023",
    status: "Delivered",
    total: "₹2,150",
  },
  {
    id: "#ORD-8812",
    name: "Karen White",
    initials: "KW",
    avatarColor: "#FBDADA",
    avatar: null,
    date: "Oct 21, 2023",
    status: "Cancelled",
    total: "₹430",
  },
];

const TOTAL_SHOWN = 25;
const TOTAL_ORDERS = 128;

const STATUS_STYLES = {
  New: {
    bg: { light: "#E3F5EA", dark: "rgba(47,158,90,0.12)" },
    text: "#2F9E5A",
  },
  Shipped: {
    bg: { light: "#E9EDFB", dark: "rgba(84,112,224,0.12)" },
    text: "#5470E0",
  },
  Delivered: {
    bg: { light: "#E3F5EA", dark: "rgba(47,158,90,0.12)" },
    text: "#2F9E5A",
  },
  Cancelled: {
    bg: { light: "#FBE7E7", dark: "rgba(224,84,79,0.12)" },
    text: "#E0544F",
  },
};

const COL = { id: 95, customer: 170, date: 105, status: 105, total: 85 };

/* ─── Local sub-components ───────────────────────────────────────────────── */
function StatusBadge({ status, isDark }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDark ? s.bg.dark : s.bg.light },
      ]}
    >
      <Text style={[styles.badgeText, { color: s.text }]} numberOfLines={1}>
        {status}
      </Text>
    </View>
  );
}

function Avatar({ order, isDark }) {
  if (order.avatar) {
    return <Image source={{ uri: order.avatar }} style={styles.avatarImg} />;
  }
  const bgFill = isDark
    ? "rgba(255,255,255,0.08)"
    : order.avatarColor || "#F3F4F6";
  const labelColor = isDark ? "#A3A3A3" : "rgba(0,0,0,0.6)";
  return (
    <View style={[styles.avatarCircle, { backgroundColor: bgFill }]}>
      <Text style={[styles.avatarText, { color: labelColor }]}>
        {order.initials}
      </Text>
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */
export default function OrderScreen() {
  const { colors, isDark } = useTheme();
  const [page] = useState(1);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification state
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);

  // Body fade/slide while search is open (kept in parent so the table can react)
  const searchSlideAnim = useState(() => new Animated.Value(0))[0];

  const handleSearchOpen = () => {
    setShowSearch(true);
    Animated.timing(searchSlideAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchClose = () => {
    Animated.timing(searchSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSearch(false);
      setSearchQuery("");
    });
  };

  const contentOpacity = searchSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const contentTranslateX = searchSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.text }]}>
            <Feather name="grid" size={22} color={colors.background} />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>
            Store Manager
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.topIcons}>
          {!showSearch && (
            <GlassIconButton
              icon="search"
              size={17}
              onPress={handleSearchOpen}
              isDark={isDark}
              colors={colors}
            />
          )}
          <View style={{ width: 10 }} />
          <GlassNotificationButton
            onPress={() => setNotifVisible(true)}
            onLayoutOrigin={setNotifOrigin}
            colors={colors}
            isDark={isDark}
          />
        </View>
      </View>

      {/* ── Sliding glass search bar ──────────────────────────────────────── */}
      <SearchBar
        visible={showSearch}
        onClose={handleSearchClose}
        onQueryChange={setSearchQuery}
        colors={colors}
        isDark={isDark}
        topOffset={118}
      />

      {/* ── Body (fades + slides while search is open) ───────────────────── */}
      <Animated.View
        style={[
          { flex: 1 },
          {
            opacity: contentOpacity,
            transform: [{ translateX: contentTranslateX }],
          },
        ]}
        pointerEvents={showSearch ? "none" : "auto"}
      >
        {/* Sticky header section */}
        <View
          style={[styles.stickyHeader, { backgroundColor: colors.background }]}
        >
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Manage and track your customer orders in real-time.
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : colors.inputBg || "#F9FAFB",
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="sliders" size={13} color={colors.textSecondary} />
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                Filter
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : colors.inputBg || "#F9FAFB",
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="calendar" size={13} color={colors.textSecondary} />
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                Last 30 Days
              </Text>
            </Pressable>
          </View>

          <View style={styles.topPagerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Showing{" "}
              <Text style={{ fontWeight: "600", color: colors.text }}>
                {TOTAL_SHOWN}
              </Text>{" "}
              of{" "}
              <Text style={{ fontWeight: "600", color: colors.text }}>
                {TOTAL_ORDERS}
              </Text>{" "}
              orders
            </Text>
            <View style={styles.pager}>
              <Pressable
                style={[
                  styles.pagerBtn,
                  { borderColor: colors.border, opacity: page === 1 ? 0.3 : 1 },
                ]}
                disabled={page === 1}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather
                  name="chevron-left"
                  size={15}
                  color={colors.textSecondary}
                />
              </Pressable>
              <Pressable
                style={[styles.pagerBtn, { borderColor: colors.border }]}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather
                  name="chevron-right"
                  size={15}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Scrollable orders table */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.tableCard,
              !isDark && Shadows.sm,
              {
                backgroundColor: isDark ? "#1E2022" : colors.card || "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header row */}
                <View
                  style={[
                    styles.headerRow,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  {["ORDER ID", "CUSTOMER", "DATE", "STATUS", "TOTAL"].map(
                    (label, i) => (
                      <Text
                        key={label}
                        style={[
                          styles.colHeader,
                          {
                            width: Object.values(COL)[i],
                            color: colors.textMuted,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    ),
                  )}
                </View>

                {/* Data rows */}
                {ORDERS.map((order, i) => (
                  <View
                    key={order.id}
                    style={[
                      styles.row,
                      i !== ORDERS.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.divider,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderId,
                        { width: COL.id, color: colors.secondary },
                      ]}
                    >
                      {order.id}
                    </Text>

                    <View
                      style={[styles.customerCell, { width: COL.customer }]}
                    >
                      <Avatar order={order} isDark={isDark} />
                      <Text
                        style={[styles.customerName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {order.name}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.dateText,
                        { width: COL.date, color: colors.textSecondary },
                      ]}
                    >
                      {order.date}
                    </Text>

                    <View style={{ width: COL.status }}>
                      <StatusBadge status={order.status} isDark={isDark} />
                    </View>

                    <Text
                      style={[
                        styles.totalText,
                        { width: COL.total, color: colors.text },
                      ]}
                    >
                      {order.total}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </Animated.View>

      {/* ── Notification overlay ──────────────────────────────────────────── */}
      <NotificationOverlay
        visible={notifVisible}
        origin={notifOrigin}
        onClose={() => setNotifVisible(false)}
        colors={colors}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 26, fontWeight: "800", letterSpacing: -0.2 },
  topIcons: { flexDirection: "row", alignItems: "center" },

  /* Sticky header */
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 16,
  },
  titleRow: { flexDirection: "row", marginBottom: 2 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18, opacity: 0.8 },
  actionsRow: { flexDirection: "row", gap: 8 },
  topPagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.md || 10,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: "600" },

  /* Table */
  scrollContent: { paddingHorizontal: 16, paddingBottom: 122, gap: 16 },
  tableCard: {
    borderRadius: Radii.lg || 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  colHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderId: { fontSize: 13, fontWeight: "700", letterSpacing: -0.1 },
  customerCell: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 11, fontWeight: "700" },
  avatarImg: { width: 32, height: 32, borderRadius: 16 },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    letterSpacing: -0.1,
  },
  dateText: { fontSize: 13, opacity: 0.9 },
  totalText: { fontSize: 13, fontWeight: "700" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  footerText: { fontSize: 12, letterSpacing: -0.1 },
  pager: { flexDirection: "row", gap: 6 },
  pagerBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
