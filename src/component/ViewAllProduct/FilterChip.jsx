import { StyleSheet, Text, TouchableOpacity } from "react-native";

/**
 * Reusable chip component for filter selection
 */
export function FilterChip({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.secondary : colors.surface,
          borderColor: active ? colors.secondary : colors.border,
        },
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.text, { color: active ? "#fff" : colors.textSecondary }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: { fontSize: 13, fontWeight: "600" },
});
