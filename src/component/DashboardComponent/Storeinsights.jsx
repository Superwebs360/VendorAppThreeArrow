import { StyleSheet, Text, View } from "react-native";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";

const METRICS = [
  {
    id: "inventory",
    label: "Inventory Health",
    value: 88,
    color: "#5BB74A",
    trackColor: "#EDF7EB",
    trackDark: "#0F2010",
  },
  {
    id: "fulfillment",
    label: "Fulfillment Rate",
    value: 94,
    color: "#FB8106",
    trackColor: "#FFF4E8",
    trackDark: "#2A1F10",
  },
];

function ProgressBar({ metric, isDark }) {
  const { colors } = useTheme();

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
          {metric.label}
        </Text>
        <Text style={[styles.metricValue, { color: metric.color }]}>
          {metric.value}%
        </Text>
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: isDark ? metric.trackDark : metric.trackColor,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${metric.value}%`,
              backgroundColor: metric.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function StoreInsights() {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Store Insights
      </Text>

      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {METRICS.map((metric) => (
          <ProgressBar key={metric.id} metric={metric} isDark={isDark} />
        ))}

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View
          style={[
            styles.insightBox,
            { backgroundColor: isDark ? colors.surface : "#F7F8FA" },
          ]}
        >
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            "Your store traffic is up 15% this week. Consider promoting{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              'Coca Cola'
            </Text>{" "}
            for better conversion."
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: {
    ...Typography.heading3,
    marginBottom: 12,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  metricRow: { gap: 8 },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  track: {
    height: 8,
    borderRadius: Radii.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radii.full,
  },
  divider: {
    height: 1,
    marginHorizontal: -16,
  },
  insightBox: {
    borderRadius: Radii.md,
    padding: 12,
  },
  insightText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
  },
});
