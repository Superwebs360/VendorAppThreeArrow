import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Info Row ─────────────────────────────────────────────────────────────────
export default function InfoRow({ fields, colors }) {
  return (
    <View style={styles.tableRow}>
      {fields.map((f, i) => (
        <View key={i} style={styles.tableCell}>
          <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
            {f.label}
          </Text>
          <Text
            style={[
              styles.cellValue,
              { color: f.value ? colors.text : colors.textMuted },
            ]}
            numberOfLines={2}
          >
            {f.value || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: "wrap",
    gap: 12,
  },
  tableCell: {
    flex: 1,
    minWidth: 130,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cellValue: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
});
