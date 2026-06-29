import { useTheme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Field({ label, required, error, hint, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      {children}
      {hint && !error && (
        <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
          {hint}
        </Text>
      )}
      {error && (
        <Text style={[styles.fieldError, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  fieldHint: { fontSize: 11, marginTop: 4 },
  fieldError: { fontSize: 11, marginTop: 4, fontWeight: "500" },
});
