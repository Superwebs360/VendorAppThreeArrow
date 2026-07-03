import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";
import { selectRawOrders, setFilter } from "../../redux/orderSlice"; // adjust path if needed
import { selectProducts } from "../../redux/productSlice"; // adjust path if needed
import { computeDashboardStats } from "../../utils/statsHelper"; // adjust path if needed

const LOW_STOCK_DANGER = 3; // red at/under this
const LOW_STOCK_WARN = 10; // amber at/under this

function severityColor(stock) {
  if (stock <= LOW_STOCK_DANGER) return "#EF4444";
  if (stock <= LOW_STOCK_WARN) return "#F59E0B";
  return "#5BB74A";
}

/* ── Mini preview shown inside the Low Stock card ─────────────────────── */
function LowStockPreview({ lowestProducts, isHealthy, colors, isDark }) {
  return (
    <View
      style={[
        styles.miniCard,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#FAFAFA",
          borderColor: colors.border,
        },
      ]}
    >
      {isHealthy && (
        <View style={styles.miniHealthyRow}>
          <Text style={styles.miniEmoji}>🙂</Text>
          <Text style={[styles.miniHealthyText, { color: colors.text }]}>
            Stock levels look healthy
          </Text>
        </View>
      )}

      {lowestProducts.length > 0 ? (
        <View style={styles.miniList}>
          {!isHealthy && (
            <Text
              style={[styles.miniListLabel, { color: colors.textSecondary }]}
            >
              LOWEST STOCK
            </Text>
          )}
          {isHealthy && (
            <Text
              style={[styles.miniListLabel, { color: colors.textSecondary }]}
            >
              KEEP AN EYE ON
            </Text>
          )}
          {lowestProducts.map((p) => {
            const stock = p.stock ?? 0;
            const dot = severityColor(stock);
            const name = p.name || p.title || "Unnamed product";
            return (
              <View key={p._id} style={styles.miniRow}>
                <View style={[styles.miniDot, { backgroundColor: dot }]} />
                <Text
                  numberOfLines={1}
                  style={[styles.miniName, { color: colors.text }]}
                >
                  {name}
                </Text>
                <Text style={[styles.miniStockText, { color: dot }]}>
                  {stock} left
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.miniEmptyText, { color: colors.textSecondary }]}>
          No products yet
        </Text>
      )}
    </View>
  );
}

export default function StatsCards({ onOpenProducts }) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const orders = useSelector(selectRawOrders);
  const products = useSelector(selectProducts) || [];

  const stats = useMemo(
    () => computeDashboardStats(orders, products),
    [orders, products],
  );

  // Always surface the 2 products with the lowest stock, regardless of
  // whether they cross the "low stock" threshold used in computeDashboardStats.
  const lowestStockProducts = useMemo(() => {
    return [...products]
      .filter((p) => typeof p.stock === "number")
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 2);
  }, [products]);

  const isStockHealthy = stats.lowStockCount === 0;

  const goToOrders = (statusFilter) => {
    if (statusFilter) {
      dispatch(setFilter({ key: "status", value: statusFilter }));
    }
    router.push("/(tabs)/order");
  };

  const CARDS = [
    {
      id: "sales",
      label: "Total Sales",
      value: stats.totalSales,
      change: stats.salesChange,
      positive: stats.salesPositive,
      icon: "trending-up",
      iconLib: "feather",
      accent: "#FB8106",
      bg: "#FFF4E8",
      bgDark: "#2A1F10",
    },
    {
      id: "products",
      label: "Active Products",
      value: String(stats.activeProducts),
      icon: "package",
      iconLib: "feather",
      accent: "#3B8BD4",
      bg: "#EAF3FB",
      bgDark: "#0D1E2E",
    },
    {
      id: "stock",
      label: "Low Stock",
      value: String(stats.lowStockCount),
      icon: "alert-triangle",
      iconLib: "feather",
      accent: "#EF4444",
      bg: "#FEF2F2",
      bgDark: "#2A1010",
      premium: true,
      // Tapping this card opens AllProductsScreen pre-filtered to
      // low-stock items, sorted by stock ascending.
      onPress: (e) =>
        onOpenProducts?.(
          { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY },
          { lowStock: true, sortBy: "stock", sortOrder: "asc" },
        ),
    },
    {
      id: "orders",
      label: "Pending Orders",
      value: String(stats.pendingCount),
      icon: "clipboard-list-outline",
      iconLib: "material",
      accent: "#5BB74A",
      bg: "#EDF7EB",
      bgDark: "#0F2010",
      onPress: () => goToOrders("pending"),
    },
  ];

  return (
    <View style={styles.grid}>
      {CARDS.map((stat) => {
        const CardWrapper = stat.onPress ? Pressable : View;
        return (
          <CardWrapper
            key={stat.id}
            {...(stat.onPress
              ? {
                  onPress: (e) => stat.onPress(e),
                  android_ripple: { color: "#00000010" },
                }
              : {})}
            style={[
              styles.card,
              stat.premium && styles.cardPremium,
              Shadows.sm,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isDark ? stat.bgDark : stat.bg },
                ]}
              >
                {stat.iconLib === "feather" ? (
                  <Feather name={stat.icon} size={18} color={stat.accent} />
                ) : (
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={20}
                    color={stat.accent}
                  />
                )}
              </View>
              {stat.change && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: stat.positive
                        ? isDark
                          ? "#0F2010"
                          : "#EDF7EB"
                        : isDark
                          ? "#2A1010"
                          : "#FEF2F2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: stat.positive ? "#5BB74A" : "#EF4444" },
                    ]}
                  >
                    {stat.change}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {stat.value}
            </Text>

            {stat.premium && (
              <LowStockPreview
                lowestProducts={lowestStockProducts}
                isHealthy={isStockHealthy}
                colors={colors}
                isDark={isDark}
              />
            )}
          </CardWrapper>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 4,
  },
  card: {
    flex: 1,
    minWidth: "47%",
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  cardPremium: {
    minWidth: "100%",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: "600",
    fontSize: 11,
  },
  label: {
    ...Typography.caption,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  /* ── Low Stock mini preview ── */
  miniCard: {
    marginTop: 10,
    borderRadius: Radii.md || 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  miniHealthyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniEmoji: { fontSize: 18 },
  miniHealthyText: {
    fontSize: 13,
    fontWeight: "700",
  },
  miniList: { gap: 6 },
  miniListLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  miniStockText: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  miniEmptyText: {
    fontSize: 12.5,
    fontStyle: "italic",
  },
});
