import { StyleSheet, Text, View } from "react-native";

/**
 * Displays a visual stock level indicator with color coding
 */
export function StockBar({ stock = 0, maxStock = 100, accent }) {
  const pct = Math.min(Math.max(stock / maxStock, 0), 1);
  const color = pct > 0.6 ? "#10B981" : pct > 0.25 ? "#F59E0B" : "#EF4444";

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.label, { color }]}>
        {stock <= 0 ? "Out" : stock < 10 ? `Low · ${stock}` : `${stock} left`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  track: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 2 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2, minWidth: 44 },
});
