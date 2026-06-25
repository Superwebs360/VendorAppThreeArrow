import { Feather } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";

const CHART_W = Dimensions.get("window").width - 80;
const CHART_H = 100;

const DATA = [
  { label: "10 may", value: 0 },
  { label: "11 may", value: 75 },
  { label: "12 may", value: 50 },
  { label: "13 may", value: 150 },
  { label: "14 may", value: 100 },
  { label: "15 may", value: 200 },
  { label: "16 may", value: 170 },
  { label: "17 may", value: 225 },
];

function LineChart({ color }) {
  const max = Math.max(...DATA.map((d) => d.value)) || 1;
  const pts = DATA.map((d, i) => ({
    x: (i / (DATA.length - 1)) * CHART_W,
    y: CHART_H - (d.value / max) * CHART_H,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    `M ${pts[0].x} ${CHART_H} ` +
    pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${pts[pts.length - 1].x} ${CHART_H} Z`;

  return (
    <Svg width={CHART_W} height={CHART_H + 4}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#grad)" />
      <Path
        d={linePath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
      ))}
    </Svg>
  );
}

export default function ExpectedSales() {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Expected Sales{" "}
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          (based on similar products)
        </Text>
      </Text>

      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Y-axis labels */}
        <View style={styles.chartArea}>
          <View style={styles.yAxis}>
            {["225", "150", "75", "0"].map((v) => (
              <Text
                key={v}
                style={[styles.axisLabel, { color: colors.textMuted }]}
              >
                {v}
              </Text>
            ))}
          </View>
          <View>
            <LineChart color={colors.secondary} />
            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {DATA.filter((_, i) => i % 2 === 0).map((d) => (
                <Text
                  key={d.label}
                  style={[styles.axisLabel, { color: colors.textMuted }]}
                >
                  {d.label.replace(" may", "")}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        {/* Summary */}
        <View style={styles.summary}>
          <View>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Expected Sales
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              120-150
            </Text>
            <Text style={[styles.summaryUnit, { color: colors.textMuted }]}>
              Units per day
            </Text>
          </View>
          <View
            style={[
              styles.growthBadge,
              { backgroundColor: isDark ? "#0F2010" : "#EDF7EB" },
            ]}
          >
            <Feather name="trending-up" size={14} color={colors.secondary} />
            <Text style={[styles.growthText, { color: colors.secondary }]}>
              18% vs Last 7 Days
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 8 },
  sectionTitle: { ...Typography.heading3 },
  hint: { fontWeight: "400", fontSize: 13 },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  chartArea: { flexDirection: "row", gap: 8 },
  yAxis: {
    justifyContent: "space-between",
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  axisLabel: { fontSize: 10 },
  divider: { height: 1 },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  summaryLabel: { ...Typography.caption },
  summaryValue: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  summaryUnit: { ...Typography.caption, marginTop: 2 },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  growthText: { fontSize: 12, fontWeight: "600" },
});
