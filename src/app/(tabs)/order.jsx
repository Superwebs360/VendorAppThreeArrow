import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    bg: { light: "#FEF3C7", dark: "rgba(217,119,6,0.15)" },
    text: "#D97706",
    dot: "#D97706",
  },
  confirmed: {
    bg: { light: "#DBEAFE", dark: "rgba(59,130,246,0.15)" },
    text: "#2563EB",
    dot: "#2563EB",
  },
  processing: {
    bg: { light: "#EDE9FE", dark: "rgba(124,58,237,0.15)" },
    text: "#7C3AED",
    dot: "#7C3AED",
  },
  shipped: {
    bg: { light: "#E9EDFB", dark: "rgba(84,112,224,0.15)" },
    text: "#5470E0",
    dot: "#5470E0",
  },
  delivered: {
    bg: { light: "#E3F5EA", dark: "rgba(47,158,90,0.15)" },
    text: "#2F9E5A",
    dot: "#2F9E5A",
  },
  cancelled: {
    bg: { light: "#FBE7E7", dark: "rgba(224,84,79,0.15)" },
    text: "#E0544F",
    dot: "#E0544F",
  },
  refunded: {
    bg: { light: "#F3F4F6", dark: "rgba(107,114,128,0.15)" },
    text: "#6B7280",
    dot: "#6B7280",
  },
};

const DATE_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "last30" },
];

const GRADIENTS = {
  brand: ["#5DB64A", "#5BB74A"],
  pending: ["#F59E0B", "#D97706"],
  confirmed: ["#3B82F6", "#2563EB"],
  processing: ["#8B5CF6", "#7C3AED"],
  shipped: ["#6B82E8", "#5470E0"],
  delivered: ["#34D399", "#2F9E5A"],
  cancelled: ["#F87171", "#E0544F"],
  refunded: ["#9CA3AF", "#6B7280"],
  avatar: ["#34C759", "#5BB74A"],
};

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
      <View style={[styles.badgeDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.badgeText, { color: s.text }]} numberOfLines={1}>
        {capitalize(status)}
      </Text>
    </View>
  );
}

function Avatar({ user, size = 40 }) {
  const name = user?.name || "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <LinearGradient
      colors={GRADIENTS.avatar}
      style={[
        styles.avatarCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </LinearGradient>
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
            Shadows.lg,
            { backgroundColor: isDark ? "#1C1D21" : "#fff" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.modalHandle,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.15)",
              },
            ]}
          />

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Filter Orders
          </Text>

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

          <View style={styles.modalBtns}>
            <Pressable
              onPress={reset}
              style={[
                styles.modalBtn,
                { borderColor: colors.border, borderWidth: 1.5 },
              ]}
            >
              <Text
                style={[styles.modalBtnText, { color: colors.textSecondary }]}
              >
                Reset
              </Text>
            </Pressable>
            <Pressable onPress={apply} style={styles.modalBtnGradientWrap}>
              <LinearGradient
                colors={GRADIENTS.brand}
                style={styles.modalBtnGradient}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  Apply Filters
                </Text>
              </LinearGradient>
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
            Shadows.lg,
            { backgroundColor: isDark ? "#1C1D21" : "#fff" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.modalHandle,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.15)",
              },
            ]}
          />
          <View style={styles.modalHeaderRow}>
            <Avatar user={order?.user} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Update Status
              </Text>
              <Text
                style={[styles.modalSubtext, { color: colors.textSecondary }]}
              >
                Order {formatOrderId(order?._id)} ·{" "}
                {order?.user?.name || "Customer"}
              </Text>
            </View>
          </View>

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
                      borderWidth: active ? 1.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[styles.badgeDot, { backgroundColor: st.dot }]}
                  />
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
                { borderColor: colors.border, borderWidth: 1.5 },
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
              style={styles.modalBtnGradientWrap}
            >
              <LinearGradient
                colors={GRADIENTS[selected] || GRADIENTS.brand}
                style={[
                  styles.modalBtnGradient,
                  { opacity: updating ? 0.7 : 1 },
                ]}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    Update
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ filters, colors, isDark, onReset }) {
  const hasFilters =
    filters.status !== "all" || filters.search || filters.dateRange !== "all";
  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: isDark ? "rgba(84,112,224,0.12)" : "#E9EDFB" },
        ]}
      >
        <Feather name="inbox" size={32} color="#5470E0" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {hasFilters ? "No matching orders" : "No orders yet"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "Orders from customers will appear here as they come in."}
      </Text>
      {hasFilters && (
        <Pressable
          onPress={onReset}
          style={[styles.resetBtn, { borderColor: colors.border }]}
        >
          <Feather name="rotate-ccw" size={13} color={colors.textSecondary} />
          <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
            Clear Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─── Order Card Row ─────────────────────────────────────────────────────── */
function OrderCard({ order, colors, isDark, onPress }) {
  const amount = order.vendorSubtotal || order.total || 0;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.orderCard,
        !isDark && Shadows.sm,
        {
          backgroundColor: isDark ? "#1C1D21" : "#fff",
          borderColor: colors.border,
        },
      ]}
    >
      <Avatar user={order.user} />

      <View style={styles.orderCardBody}>
        <View style={styles.orderCardTopRow}>
          <Text
            style={[styles.customerName, { color: colors.text }]}
            numberOfLines={1}
          >
            {order.user?.name || "Customer"}
          </Text>
          <Text style={[styles.totalText, { color: colors.text }]}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.orderCardBottomRow}>
          <View style={styles.orderMetaRow}>
            <Text style={[styles.orderId, { color: "#5470E0" }]}>
              {formatOrderId(order._id)}
            </Text>
            <View
              style={[styles.metaDivider, { backgroundColor: colors.divider }]}
            />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <StatusBadge status={order.status} isDark={isDark} />
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={16}
        color={colors.textMuted}
        style={styles.chevron}
      />
    </TouchableOpacity>
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
    dispatch(fetchVendorOrders({ page: 1, limit: 100 }));
  }, []);

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
          <LinearGradient colors={GRADIENTS.brand} style={styles.logoBox}>
            <Feather name="grid" size={20} color={"#ffffff"} />
          </LinearGradient>
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
                Manage and track your customer orders.
              </Text>
            </View>
          </View>

          {/* Filter + Date range row */}
          <View style={styles.actionsRow}>
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
                        ? "rgba(255,255,255,0.04)"
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
                        ? "rgba(255,255,255,0.04)"
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
              <Text style={{ fontWeight: "700", color: colors.text }}>
                {orders.length}
              </Text>{" "}
              of{" "}
              <Text style={{ fontWeight: "700", color: colors.text }}>
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

        {/* ── Order list (card-based) ── */}
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
              isDark={isDark}
              onReset={() => dispatch(resetFilters())}
            />
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                colors={colors}
                isDark={isDark}
                onPress={() => setStatusModal({ visible: true, order })}
              />
            ))
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5470E0",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  brandText: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  topIcons: { flexDirection: "row", alignItems: "center" },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  titleRow: { flexDirection: "row", marginBottom: 2 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18, opacity: 0.75 },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.md || 12,
    borderWidth: 1.2,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
  activeFilterRow: { flexDirection: "row", gap: 8 },
  activeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeFilterText: { fontSize: 12, fontWeight: "700" },
  topPagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  footerText: { fontSize: 12.5, letterSpacing: -0.1 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.md || 12,
  },
  errorText: { flex: 1, fontSize: 13 },
  retryText: { fontSize: 13, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 130, gap: 10 },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radii.lg || 16,
    borderWidth: 1,
  },
  orderCardBody: { flex: 1, gap: 8 },
  orderCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderCardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaDivider: { width: 1, height: 10, opacity: 0.6 },
  chevron: { marginLeft: 2 },
  orderId: { fontSize: 12.5, fontWeight: "800", letterSpacing: -0.1 },
  customerName: {
    fontSize: 14.5,
    fontWeight: "700",
    flexShrink: 1,
    letterSpacing: -0.1,
  },
  dateText: { fontSize: 12.5, opacity: 0.85 },
  totalText: { fontSize: 14.5, fontWeight: "800", letterSpacing: -0.2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  avatarCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5470E0",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  loadingWrap: { alignItems: "center", paddingTop: 80, gap: 14 },
  loadingText: { fontSize: 14 },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 40,
    gap: 6,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  resetBtnText: { fontSize: 13, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 38,
    paddingTop: 14,
    gap: 14,
  },
  modalHandle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  modalTitle: { fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
  modalSubtext: { fontSize: 12.5, marginTop: 2 },
  filterLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalBtnGradientWrap: { flex: 1, borderRadius: 14, overflow: "hidden" },
  modalBtnGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalBtnText: { fontSize: 14.5, fontWeight: "800" },
});
