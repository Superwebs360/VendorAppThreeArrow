import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";

const STATS = [
  {
    id: "sales",
    label: "Total Sales",
    value: "₹24,592",
    change: "+12%",
    positive: true,
    icon: "trending-up",
    iconLib: "feather",
    accent: "#FB8106",
    bg: "#FFF4E8",
    bgDark: "#2A1F10",
  },
  {
    id: "products",
    label: "Active Products",
    value: "142",
    icon: "package",
    iconLib: "feather",
    accent: "#3B8BD4",
    bg: "#EAF3FB",
    bgDark: "#0D1E2E",
  },
  {
    id: "stock",
    label: "Low Stock",
    value: "8",
    icon: "alert-triangle",
    iconLib: "feather",
    accent: "#EF4444",
    bg: "#FEF2F2",
    bgDark: "#2A1010",
  },
  {
    id: "orders",
    label: "Pending Orders",
    value: "24",
    icon: "clipboard-list-outline",
    iconLib: "material",
    accent: "#5BB74A",
    bg: "#EDF7EB",
    bgDark: "#0F2010",
  },
];

export default function StatsCards() {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.grid}>
      {STATS.map((stat) => (
        <View
          key={stat.id}
          style={[
            styles.card,
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
        </View>
      ))}
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
});
