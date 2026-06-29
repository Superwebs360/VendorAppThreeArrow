import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ToggleRow({
  label,
  subtitle,
  value,
  onChange,
  colors,
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.secondary + "80" }}
        thumbColor={value ? colors.secondary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  toggleSub: { fontSize: 12, marginTop: 2 },
});
