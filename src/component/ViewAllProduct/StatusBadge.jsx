import { StyleSheet, Text, View } from "react-native";

/**
 * Displays a status badge indicating if product is Live or Draft
 */
export function StatusBadge({ isActive }) {
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: isActive ? "#DCFCE7" : "#FEE2E2" },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isActive ? "#16A34A" : "#DC2626" },
        ]}
      />
      <Text style={[styles.text, { color: isActive ? "#15803D" : "#B91C1C" }]}>
        {isActive ? "Live" : "Draft"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
});
