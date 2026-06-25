import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";

const PRODUCTS = [
  {
    id: "1",
    name: "Coca Cola",
    price: "₹86.00",
    status: "Active",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/240px-24701-nature-natural-beauty.jpg",
    color: "#E53935",
  },
  {
    id: "2",
    name: "Amul Milk",
    price: "₹30.00",
    status: "Active",
    image: null,
    color: "#1E88E5",
  },
  {
    id: "3",
    name: "T-shirt",
    price: "₹300.00",
    status: "Active",
    image: null,
    color: "#5BB74A",
  },
];

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isActive ? "#EDF7EB" : "#FEF2F2" },
      ]}
    >
      <Text
        style={[styles.badgeText, { color: isActive ? "#5BB74A" : "#EF4444" }]}
      >
        {status}
      </Text>
    </View>
  );
}

function ProductRow({ item }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View style={[styles.thumb, { backgroundColor: item.color + "22" }]}>
        <Text style={{ fontSize: 18 }}>
          {item.name === "Coca Cola"
            ? "🥤"
            : item.name === "Amul Milk"
              ? "🥛"
              : "👕"}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.productName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: colors.textSecondary }]}>
          {item.price}
        </Text>
      </View>
      <StatusBadge status={item.status} />
      <Pressable style={styles.moreBtn} hitSlop={8}>
        <Feather name="more-vertical" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

export default function RecentProducts({ onViewAll }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Products
        </Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={[styles.viewAll, { color: colors.secondary }]}>
            View All
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {PRODUCTS.map((item, index) => (
          <ProductRow
            key={item.id}
            item={item}
            isLast={index === PRODUCTS.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.heading3,
  },
  viewAll: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  productName: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    ...Typography.caption,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  moreBtn: {
    padding: 4,
  },
});
