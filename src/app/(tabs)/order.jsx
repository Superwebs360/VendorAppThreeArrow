/**
 * OrderScreen.jsx - UPDATED WITH SOCKET INITIALIZATION LOGGING
 * Add this useEffect to initialize the socket connection
 */

import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Radii, Shadows, useTheme } from "../../constants/theme";
import VendorSocket from "../../redux/vendorSocket"; // ← ADD THIS IMPORT

import NotificationOverlay from "@/component/OrderComponent/NotificationOverlay";
import SearchBar, {
  GlassIconButton,
  GlassNotificationButton,
} from "../../component/OrderComponent/Search";

import {
  fetchVendorOrders,
  resetFilters,
  selectFilteredOrders,
  selectFilters,
  selectOrdersError,
  selectOrdersLoading,
  selectPagination,
  setDateRange,
  setFilter,
  updateVendorOrderStatus,
} from "../../redux/orderSlice";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const VENDOR_STATUS_OPTIONS = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  pending: {
    bg: { light: "#FEF3C7", dark: "rgba(217,119,6,0.12)" },
    text: "#D97706",
  },
  confirmed: {
    bg: { light: "#DBEAFE", dark: "rgba(59,130,246,0.12)" },
    text: "#2563EB",
  },
  processing: {
    bg: { light: "#EDE9FE", dark: "rgba(124,58,237,0.12)" },
    text: "#7C3AED",
  },
  shipped: {
    bg: { light: "#E9EDFB", dark: "rgba(84,112,224,0.12)" },
    text: "#5470E0",
  },
  delivered: {
    bg: { light: "#E3F5EA", dark: "rgba(47,158,90,0.12)" },
    text: "#2F9E5A",
  },
  cancelled: {
    bg: { light: "#FBE7E7", dark: "rgba(224,84,79,0.12)" },
    text: "#E0544F",
  },
  refunded: {
    bg: { light: "#F3F4F6", dark: "rgba(107,114,128,0.12)" },
    text: "#6B7280",
  },
};

const COL = { id: 105, customer: 175, date: 110, status: 115, total: 90 };

const DATE_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "last30" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatOrderId = (id) => {
  if (!id) return "—";
  return `#${id.slice(-6).toUpperCase()}`;
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function StatusBadge({ status, isDark }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDark ? s.bg.dark : s.bg.light },
      ]}
    >
      <Text style={[styles.badgeText, { color: s.text }]} numberOfLines={1}>
        {capitalize(status)}
      </Text>
    </View>
  );
}

function Avatar({ user, isDark }) {
  const name = user?.name || "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bgFill = isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6";
  const labelColor = isDark ? "#A3A3A3" : "rgba(0,0,0,0.6)";
  return (
    <View style={[styles.avatarCircle, { backgroundColor: bgFill }]}>
      <Text style={[styles.avatarText, { color: labelColor }]}>{initials}</Text>
    </View>
  );
}

/* ─── Filter Modal ───────────────────────────────────────────────────────── */
function FilterModal({ visible, onClose, filters, dispatch, colors, isDark }) {
  const [localStatus, setLocalStatus] = useState(filters.status);
  const [localDateRange, setLocalDateRange] = useState(filters.dateRange);

  useEffect(() => {
    if (visible) {
      setLocalStatus(filters.status);
      setLocalDateRange(filters.dateRange);
    }
  }, [visible]);

  const apply = () => {
    dispatch(setFilter({ key: "status", value: localStatus }));
    dispatch(setDateRange(localDateRange));
    onClose();
  };

  const reset = () => {
    dispatch(resetFilters());
    onClose();
  };

  const chip = (label, active, onPress) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? colors.primary || "#5470E0"
            : isDark
              ? "rgba(255,255,255,0.06)"
              : "#F3F4F6",
          borderColor: active ? colors.primary || "#5470E0" : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? "#fff" : colors.textSecondary },
        ]}
      >
        {capitalize(label)}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            { backgroundColor: isDark ? "#1E2022" : "#fff" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHandle} />

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Filter Orders
          </Text>

          {/* Status */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            STATUS
          </Text>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((s) =>
              chip(s === "all" ? "All" : s, localStatus === s, () =>
                setLocalStatus(s),
              ),
            )}
          </View>

          {/* Date Range */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            DATE RANGE
          </Text>
          <View style={styles.chipRow}>
            {DATE_RANGES.map((r) =>
              chip(r.label, localDateRange === r.value, () =>
                setLocalDateRange(r.value),
              ),
            )}
          </View>

          {/* Buttons */}
          <View style={styles.modalBtns}>
            <Pressable
              onPress={reset}
              style={[
                styles.modalBtn,
                { borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text
                style={[styles.modalBtnText, { color: colors.textSecondary }]}
              >
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={apply}
              style={[
                styles.modalBtn,
                { backgroundColor: colors.primary || "#5470E0" },
              ]}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Status Update Modal ────────────────────────────────────────────────── */
function StatusUpdateModal({
  order,
  visible,
  onClose,
  dispatch,
  colors,
  isDark,
}) {
  const [selected, setSelected] = useState(order?.status || "");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order) setSelected(order.status);
  }, [order]);

  const handleUpdate = async () => {
    if (!order || selected === order.status) return onClose();
    setUpdating(true);
    await dispatch(
      updateVendorOrderStatus({ orderId: order._id, status: selected }),
    );
    setUpdating(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            { backgroundColor: isDark ? "#1E2022" : "#fff" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHandle} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Update Status
          </Text>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            Order {formatOrderId(order?._id)}
          </Text>

          <View style={styles.chipRow}>
            {VENDOR_STATUS_OPTIONS.map((s) => {
              const st = STATUS_STYLES[s];
              const active = selected === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSelected(s)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? isDark
                          ? st.bg.dark
                          : st.bg.light
                        : isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#F3F4F6",
                      borderColor: active ? st.text : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? st.text : colors.textSecondary,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {capitalize(s)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.modalBtns}>
            <Pressable
              onPress={onClose}
              style={[
                styles.modalBtn,
                { borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text
                style={[styles.modalBtnText, { color: colors.textSecondary }]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleUpdate}
              disabled={updating}
              style={[
                styles.modalBtn,
                {
                  backgroundColor: colors.primary || "#5470E0",
                  opacity: updating ? 0.7 : 1,
                },
              ]}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  Update
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ filters, colors, onReset }) {
  const hasFilters =
    filters.status !== "all" || filters.search || filters.dateRange !== "all";
  return (
    <View style={styles.emptyWrap}>
      <Feather name="inbox" size={44} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {hasFilters ? "No matching orders" : "No orders yet"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {hasFilters
          ? "Try adjusting your filters."
          : "Orders from customers will appear here."}
      </Text>
      {hasFilters && (
        <Pressable
          onPress={onReset}
          style={[styles.resetBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
            Clear Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */
export default function OrderScreen() {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const orders = useSelector(selectFilteredOrders);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  // UI
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    visible: false,
    order: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  const searchSlideAnim = useRef(new Animated.Value(0)).current;

  /* ── Initial fetch ── */
  useEffect(() => {
    console.log("[OrderScreen] Component mounted");
    dispatch(fetchVendorOrders({ page: 1, limit: 100 }));
  }, []);

  /* ── SOCKET INITIALIZATION - ADD THIS EFFECT ── */
  useEffect(() => {
    console.log("[OrderScreen] useEffect - Socket initialization");

    const initializeSocket = async () => {
      try {
        console.log("[OrderScreen] Starting socket initialization...");

        // Retrieve token from AsyncStorage
        const vendorToken = await AsyncStorage.getItem("vendorToken");

        if (!vendorToken) {
          console.warn("[OrderScreen] No vendor token found in AsyncStorage");
          return;
        }

        console.log("[OrderScreen] Token retrieved:", {
          hasToken: !!vendorToken,
          tokenLength: vendorToken.length,
        });

        // Connect socket
        console.log("[OrderScreen] Calling VendorSocket.connect()");
        VendorSocket.connect(vendorToken, dispatch);

        console.log("[OrderScreen] ✅ Socket initialization completed");
      } catch (err) {
        console.error("[OrderScreen] Socket initialization error:", err);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      console.log("[OrderScreen] Component unmounting, cleaning up");
      // Optionally disconnect socket on unmount
      // VendorSocket.disconnect();
    };
  }, [dispatch]);

  /* ── Sync search query to redux filter ── */
  useEffect(() => {
    dispatch(setFilter({ key: "search", value: searchQuery }));
  }, [searchQuery]);

  /* ── Pull-to-refresh ── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchVendorOrders({ page: 1, limit: 100 }));
    setRefreshing(false);
  }, [dispatch]);

  /* ── Search animations ── */
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

  /* ── Derived filter badges ── */
  const activeFilterCount = [
    filters.status !== "all",
    filters.dateRange !== "all",
  ].filter(Boolean).length;

  const dateRangeLabel =
    filters.dateRange === "last30"
      ? "Last 30 Days"
      : filters.dateRange === "custom"
        ? `${filters.from} → ${filters.to}`
        : "All Time";

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.secondary }]}>
            <Feather name="grid" size={22} color={"#ffffff"} />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>
            Store Manager
          </Text>
        </View>
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

      {/* ── Sliding search bar ── */}
      <SearchBar
        visible={showSearch}
        onClose={handleSearchClose}
        onQueryChange={setSearchQuery}
        colors={colors}
        isDark={isDark}
        topOffset={118}
      />

      {/* ── Body ── */}
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
        {/* ── Sticky header ── */}
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

          {/* Filter + Date range row */}
          <View style={styles.actionsRow}>
            {/* Filter button */}
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor:
                    activeFilterCount > 0
                      ? isDark
                        ? "rgba(84,112,224,0.15)"
                        : "#E9EDFB"
                      : isDark
                        ? "rgba(255,255,255,0.03)"
                        : colors.inputBg || "#F9FAFB",
                  borderColor:
                    activeFilterCount > 0 ? "#5470E0" : colors.border,
                },
              ]}
            >
              <Feather
                name="sliders"
                size={13}
                color={activeFilterCount > 0 ? "#5470E0" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      activeFilterCount > 0 ? "#5470E0" : colors.textSecondary,
                  },
                ]}
              >
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Text>
            </Pressable>

            {/* Date range button */}
            <Pressable
              onPress={() => {
                dispatch(
                  setDateRange(
                    filters.dateRange === "last30" ? "all" : "last30",
                  ),
                );
              }}
              style={[
                styles.actionBtn,
                {
                  backgroundColor:
                    filters.dateRange !== "all"
                      ? isDark
                        ? "rgba(84,112,224,0.15)"
                        : "#E9EDFB"
                      : isDark
                        ? "rgba(255,255,255,0.03)"
                        : colors.inputBg || "#F9FAFB",
                  borderColor:
                    filters.dateRange !== "all" ? "#5470E0" : colors.border,
                },
              ]}
            >
              <Feather
                name="calendar"
                size={13}
                color={
                  filters.dateRange !== "all" ? "#5470E0" : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      filters.dateRange !== "all"
                        ? "#5470E0"
                        : colors.textSecondary,
                  },
                ]}
              >
                {dateRangeLabel}
              </Text>
            </Pressable>
          </View>

          {/* Status filter quick strip */}
          {filters.status !== "all" && (
            <View style={styles.activeFilterRow}>
              <View
                style={[
                  styles.activeFilterBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(84,112,224,0.15)"
                      : "#E9EDFB",
                  },
                ]}
              >
                <Text style={[styles.activeFilterText, { color: "#5470E0" }]}>
                  {capitalize(filters.status)}
                </Text>
                <Pressable
                  onPress={() =>
                    dispatch(setFilter({ key: "status", value: "all" }))
                  }
                >
                  <Feather name="x" size={12} color="#5470E0" />
                </Pressable>
              </View>
            </View>
          )}

          {/* Pagination info */}
          <View style={styles.topPagerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Showing{" "}
              <Text style={{ fontWeight: "600", color: colors.text }}>
                {orders.length}
              </Text>{" "}
              of{" "}
              <Text style={{ fontWeight: "600", color: colors.text }}>
                {pagination.total}
              </Text>{" "}
              orders
            </Text>
            {loading && !refreshing && (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            )}
          </View>
        </View>

        {/* ── Error banner ── */}
        {error && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: isDark ? "rgba(224,84,79,0.1)" : "#FBE7E7" },
            ]}
          >
            <Feather name="alert-circle" size={14} color="#E0544F" />
            <Text style={[styles.errorText, { color: "#E0544F" }]}>
              {error}
            </Text>
            <Pressable
              onPress={() =>
                dispatch(fetchVendorOrders({ page: 1, limit: 100 }))
              }
            >
              <Text style={[styles.retryText, { color: "#E0544F" }]}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── Table ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
            />
          }
        >
          {loading && !refreshing && orders.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.textSecondary} />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Loading orders…
              </Text>
            </View>
          ) : orders.length === 0 ? (
            <EmptyState
              filters={filters}
              colors={colors}
              onReset={() => dispatch(resetFilters())}
            />
          ) : (
            <View
              style={[
                styles.tableCard,
                !isDark && Shadows.sm,
                {
                  backgroundColor: isDark
                    ? "#1E2022"
                    : colors.card || "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header */}
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

                  {/* Rows */}
                  {orders.map((order, i) => (
                    <TouchableOpacity
                      key={order._id}
                      activeOpacity={0.75}
                      onPress={() => setStatusModal({ visible: true, order })}
                      style={[
                        styles.row,
                        i !== orders.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderId,
                          {
                            width: COL.id,
                            color: colors.secondary || "#5470E0",
                          },
                        ]}
                      >
                        {formatOrderId(order._id)}
                      </Text>

                      <View
                        style={[styles.customerCell, { width: COL.customer }]}
                      >
                        <Avatar user={order.user} isDark={isDark} />
                        <Text
                          style={[styles.customerName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {order.user?.name || "Customer"}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.dateText,
                          { width: COL.date, color: colors.textSecondary },
                        ]}
                      >
                        {formatDate(order.createdAt)}
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
                        ₹
                        {(
                          order.vendorSubtotal ||
                          order.total ||
                          0
                        ).toLocaleString("en-IN")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Modals ── */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        dispatch={dispatch}
        colors={colors}
        isDark={isDark}
      />

      <StatusUpdateModal
        order={statusModal.order}
        visible={statusModal.visible}
        onClose={() => setStatusModal({ visible: false, order: null })}
        dispatch={dispatch}
        colors={colors}
        isDark={isDark}
      />

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

  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  titleRow: { flexDirection: "row", marginBottom: 2 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18, opacity: 0.8 },
  actionsRow: { flexDirection: "row", gap: 8 },
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
  activeFilterRow: { flexDirection: "row", gap: 8 },
  activeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeFilterText: { fontSize: 12, fontWeight: "600" },
  topPagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  footerText: { fontSize: 12, letterSpacing: -0.1 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.md || 10,
  },
  errorText: { flex: 1, fontSize: 13 },
  retryText: { fontSize: 13, fontWeight: "700" },

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
    paddingVertical: 13,
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

  loadingWrap: { alignItems: "center", paddingTop: 80, gap: 14 },
  loadingText: { fontSize: 14 },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetBtnText: { fontSize: 13, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 14,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(120,120,120,0.3)",
    alignSelf: "center",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
  },
  modalBtnText: { fontSize: 14, fontWeight: "700" },
});
