import { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

function PriceField({ label, value, onChange, prefix, suffix, colors }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
        ]}
      >
        {prefix ? (
          <Text style={[styles.affix, { color: colors.textSecondary }]}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.placeholder}
          placeholder="0"
        />
        {suffix ? (
          <Text style={[styles.affix, { color: colors.textSecondary }]}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function Pricing({ data, onChange }) {
  const { colors } = useTheme();

  const update = (key, val) => {
    const updated = { ...data, [key]: val };
    // Auto-calculate discount
    if (key === "mrp" || key === "selling") {
      const mrp = parseFloat(key === "mrp" ? val : data.mrp) || 0;
      const sell = parseFloat(key === "selling" ? val : data.selling) || 0;
      if (mrp > 0 && sell > 0 && sell < mrp) {
        updated.discount = Math.round(((mrp - sell) / mrp) * 100).toString();
      } else {
        updated.discount = "0";
      }
    }
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing</Text>
      <View style={styles.row}>
        <View style={styles.third}>
          <PriceField
            label="MRP(₹)"
            value={data.mrp}
            onChange={(v) => update("mrp", v)}
            colors={colors}
          />
        </View>
        <View style={styles.third}>
          <PriceField
            label="Selling Price(₹)"
            value={data.selling}
            onChange={(v) => update("selling", v)}
            colors={colors}
          />
        </View>
        <View style={styles.third}>
          <PriceField
            label="Discount%"
            value={data.discount}
            onChange={(v) => update("discount", v)}
            suffix="%"
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionTitle: { ...Typography.heading3 },
  row: { flexDirection: "row", gap: 10 },
  third: { flex: 1 },
  field: { gap: 6 },
  label: { ...Typography.caption, fontWeight: "500", fontSize: 11 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  affix: { ...Typography.caption, marginHorizontal: 2 },
  input: { flex: 1, ...Typography.body, fontSize: 14, padding: 0 },
});
