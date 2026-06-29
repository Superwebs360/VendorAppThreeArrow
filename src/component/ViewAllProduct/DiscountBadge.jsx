import { StyleSheet, Text, View } from "react-native";

/**
 * Displays a discount percentage badge if MRP is greater than price
 */
export function DiscountBadge({ price, mrp }) {
  if (!mrp || Number(mrp) <= Number(price)) return null;

  const disc = Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>-{disc}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.3 },
});
