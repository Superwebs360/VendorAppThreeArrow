import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PillSelect({
  options,
  value,
  onChange,
  colors,
  radii,
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => {
        const val = opt.value ?? opt;
        const label = opt.label ?? opt;
        const selected = String(value) === String(val);
        return (
          <TouchableOpacity
            key={String(val)}
            onPress={() => onChange(String(val))}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? colors.secondary : colors.inputBg,
                borderColor: selected ? colors.secondary : colors.border,
                borderRadius: radii.full,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: selected ? "#fff" : colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: "600" },
});
