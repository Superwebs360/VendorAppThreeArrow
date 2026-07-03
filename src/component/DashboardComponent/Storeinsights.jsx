import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { useDispatch, useSelector } from "react-redux";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";
import {
  selectInsightsRange,
  selectInsightsSummary,
  selectRevenueProfitSeries,
  selectStatusBreakdown,
  selectTopProducts,
  setInsightsRange,
} from "../../redux/insightsSlice"; // adjust path if needed
import { fetchVendorOrders } from "../../redux/orderSlice"; // adjust path if needed
import { getMyProducts } from "../../redux/productSlice"; // adjust path if needed

const RANGES = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" },
];

const STATUS_COLORS = {
  pending: "#D97706",
  confirmed: "#2563EB",
  processing: "#7C3AED",
  shipped: "#5470E0",
  delivered: "#2F9E5A",
  cancelled: "#E0544F",
  refunded: "#6B7280",
};

const formatCurrency = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* ── Small spinning refresh button ─────────────────────────────────── */
function RefreshButton({ onPress, refreshing, colors, isDark }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop;
    if (refreshing) {
      spin.setValue(0);
      loop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
    } else {
      spin.stopAnimation(() => spin.setValue(0));
    }
    return () => loop?.stop();
  }, [refreshing]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={refreshing}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.refreshBtn,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
          opacity: refreshing ? 0.6 : 1,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Feather name="refresh-cw" size={15} color={colors.textSecondary} />
      </Animated.View>
    </Pressable>
  );
}

/* ── Range toggle chips ─────────────────────────────────────────────── */
function RangeSelector({ value, onChange, colors, isDark }) {
  return (
    <View style={styles.rangeRow}>
      {RANGES.map((r) => {
        const active = r.value === value;
        return (
          <Pressable
            key={r.value}
            onPress={() => onChange(r.value)}
            style={[
              styles.rangeChip,
              {
                backgroundColor: active
                  ? "#5470E0"
                  : isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#F3F4F6",
              },
            ]}
          >
            <Text
              style={[
                styles.rangeChipText,
                { color: active ? "#fff" : colors.textSecondary },
              ]}
            >
              {r.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Summary tile ───────────────────────────────────────────────────── */
function SummaryTile({ label, value, accent, colors, isDark, bg, bgDark }) {
  return (
    <View
      style={[styles.summaryTile, { backgroundColor: isDark ? bgDark : bg }]}
    >
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ── Legend dot row ─────────────────────────────────────────────────── */
function LegendDot({ color, label, colors }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StoreInsights() {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const range = useSelector(selectInsightsRange);
  const summary = useSelector(selectInsightsSummary);
  const series = useSelector(selectRevenueProfitSeries);
  const statusBreakdown = useSelector(selectStatusBreakdown);
  const topProducts = useSelector(selectTopProducts);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      await Promise.all([
        dispatch(fetchVendorOrders({ page: 1, limit: 100 })),
        dispatch(getMyProducts({ token, page: 1, limit: 100 })),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ── Line chart data (revenue vs gross profit) ── */
  const revenueLineData = useMemo(
    () =>
      series.map((pt) => ({
        value: pt.revenue,
        label: pt.label,
        dataPointText: String(pt.revenue),
      })),
    [series],
  );

  const profitLineData = useMemo(
    () => series.map((pt) => ({ value: Math.max(pt.profit, 0) })),
    [series],
  );

  const chartMax = useMemo(() => {
    const values = series.flatMap((pt) => [pt.revenue, pt.profit]);
    const max = Math.max(1, ...values);
    return Math.ceil(max * 1.15);
  }, [series]);

  /* ── Donut chart data (order status) ── */
  const donutData = useMemo(() => {
    const entries = Object.entries(statusBreakdown);
    if (entries.length === 0) return [];
    return entries.map(([status, count]) => ({
      value: count,
      color: STATUS_COLORS[status] || "#9CA3AF",
      text: status,
    }));
  }, [statusBreakdown]);

  const totalOrdersForDonut = donutData.reduce((sum, d) => sum + d.value, 0);

  /* ── Bar chart data (top products) ── */
  const barData = useMemo(
    () =>
      topProducts.map((p) => ({
        value: p.revenue,
        label: p.name.length > 10 ? `${p.name.slice(0, 10)}…` : p.name,
        frontColor: "#5470E0",
        topLabelComponent: () => (
          <Text style={[styles.barTopLabel, { color: colors.text }]}>
            {formatCurrency(p.revenue)}
          </Text>
        ),
      })),
    [topProducts, colors.text],
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Store Insights
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Revenue, profit &amp; performance
          </Text>
        </View>
        <RefreshButton
          onPress={handleRefresh}
          refreshing={isRefreshing}
          colors={colors}
          isDark={isDark}
        />
      </View>

      <RangeSelector
        value={range}
        onChange={(v) => dispatch(setInsightsRange(v))}
        colors={colors}
        isDark={isDark}
      />

      {/* ── Summary tiles ── */}
      <View style={styles.summaryGrid}>
        <SummaryTile
          label="Revenue"
          value={formatCurrency(summary.totalRevenue)}
          accent="#3B8BD4"
          bg="#EAF3FB"
          bgDark="#0D1E2E"
          colors={colors}
          isDark={isDark}
        />
        <SummaryTile
          label={summary.isLoss ? "Loss" : "Gross Profit"}
          value={formatCurrency(Math.abs(summary.totalGrossProfit))}
          accent={summary.isLoss ? "#EF4444" : "#5BB74A"}
          bg={summary.isLoss ? "#FEF2F2" : "#EDF7EB"}
          bgDark={summary.isLoss ? "#2A1010" : "#0F2010"}
          colors={colors}
          isDark={isDark}
        />
        <SummaryTile
          label="Gross Margin"
          value={`${summary.grossMargin}%`}
          accent="#FB8106"
          bg="#FFF4E8"
          bgDark="#2A1F10"
          colors={colors}
          isDark={isDark}
        />
        <SummaryTile
          label="Avg Order"
          value={formatCurrency(summary.avgOrderValue)}
          accent="#7C3AED"
          bg="#EDE9FE"
          bgDark="#1F1530"
          colors={colors}
          isDark={isDark}
        />
      </View>

      {/* ── Revenue vs Gross Profit line chart ── */}
      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Revenue vs Gross Profit
          </Text>
          <View style={styles.legendRow}>
            <LegendDot color="#3B8BD4" label="Revenue" colors={colors} />
            <LegendDot color="#5BB74A" label="Gross Profit" colors={colors} />
          </View>
        </View>

        {series.length === 0 ? (
          <EmptyChartState
            colors={colors}
            message="No orders in this range yet."
          />
        ) : (
          <LineChart
            data={revenueLineData}
            data2={profitLineData}
            height={190}
            width={280}
            maxValue={chartMax}
            noOfSections={4}
            spacing={series.length > 1 ? undefined : 40}
            initialSpacing={16}
            color1="#3B8BD4"
            color2="#5BB74A"
            thickness1={2.5}
            thickness2={2.5}
            startFillColor1="#3B8BD4"
            startFillColor2="#5BB74A"
            startOpacity={0.25}
            endOpacity={0}
            areaChart
            curved
            hideDataPoints
            isAnimated
            animateOnDataChange
            animationDuration={600}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: 9.5,
            }}
            rulesColor={isDark ? "rgba(255,255,255,0.08)" : "#EEEEEE"}
            xAxisColor={colors.border}
            yAxisColor={colors.border}
          />
        )}
      </View>

      {/* ── Order status donut ── */}
      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}
        >
          Order Status
        </Text>

        {donutData.length === 0 ? (
          <EmptyChartState colors={colors} message="No orders in this range." />
        ) : (
          <View style={styles.donutRow}>
            <PieChart
              data={donutData}
              donut
              radius={70}
              innerRadius={46}
              innerCircleColor={colors.card}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={[styles.donutCenterValue, { color: colors.text }]}
                  >
                    {totalOrdersForDonut}
                  </Text>
                  <Text
                    style={[
                      styles.donutCenterLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Orders
                  </Text>
                </View>
              )}
            />
            <View style={styles.donutLegend}>
              {donutData.map((d) => (
                <LegendDot
                  key={d.text}
                  color={d.color}
                  label={`${d.text[0].toUpperCase()}${d.text.slice(1)} (${d.value})`}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── Top products ── */}
      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Top Products
          </Text>
          <Feather name="trending-up" size={16} color="#5470E0" />
        </View>

        {barData.length === 0 ? (
          <EmptyChartState colors={colors} message="No sales in this range." />
        ) : (
          <BarChart
            data={barData}
            horizontal
            height={140}
            barWidth={18}
            spacing={22}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            hideYAxisText
            noOfSections={3}
            isAnimated
            animationDuration={500}
            labelWidth={70}
            xAxisLabelTextStyle={{
              color: colors.textSecondary,
              fontSize: 11,
            }}
          />
        )}
      </View>
    </View>
  );
}

function EmptyChartState({ colors, message }) {
  return (
    <View style={styles.emptyChart}>
      <Feather name="bar-chart-2" size={26} color={colors.textMuted} />
      <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { fontSize: 12.5, marginTop: 2 },

  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  rangeRow: { flexDirection: "row", gap: 8 },
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.full || 20,
  },
  rangeChipText: { fontSize: 12, fontWeight: "700" },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryTile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: Radii.md || 12,
    padding: 12,
    gap: 4,
  },
  summaryLabel: { ...Typography.caption, fontSize: 11 },
  summaryValue: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },

  card: {
    borderRadius: Radii.lg || 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14.5, fontWeight: "700" },

  legendRow: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11.5, fontWeight: "600" },

  donutRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  donutLegend: { flex: 1, gap: 8 },
  donutCenterValue: { fontSize: 18, fontWeight: "800" },
  donutCenterLabel: { fontSize: 10.5 },

  barTopLabel: { fontSize: 10, fontWeight: "700", marginBottom: 2 },

  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyChartText: { fontSize: 12.5 },
});
