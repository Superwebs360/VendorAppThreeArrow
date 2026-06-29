import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TInput from "./TInput";

export const EMPTY_VARIANT = {
  color: "",
  size: "",
  sku: "",
  stock: "",
  mrp: "",
  price: "",
};

export default function VariantRow({
  variant,
  index,
  onChange,
  onRemove,
  colors,
  radii,
}) {
  const vErr =
    variant.price && variant.mrp && Number(variant.price) > Number(variant.mrp);
  return (
    <View
      style={[
        styles.variantRow,
        {
          borderColor: colors.border,
          borderRadius: radii.sm,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.variantTopRow}>
        <Text style={[styles.variantIndex, { color: colors.textMuted }]}>
          Variant {index + 1}
        </Text>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <TInput
            value={variant.color}
            onChangeText={(v) => onChange("color", v)}
            placeholder="Colour (e.g. Red)"
          />
        </View>
        <View style={styles.half}>
          <TInput
            value={variant.size}
            onChangeText={(v) => onChange("size", v)}
            placeholder="Size (e.g. M)"
          />
        </View>
      </View>
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.half}>
          <TInput
            value={variant.sku}
            onChangeText={(v) => onChange("sku", v)}
            placeholder="SKU *"
          />
        </View>
        <View style={styles.half}>
          <TInput
            value={variant.stock}
            onChangeText={(v) => onChange("stock", v)}
            placeholder="Stock *"
            keyboardType="number-pad"
          />
        </View>
      </View>
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.half}>
          <TInput
            value={variant.mrp}
            onChangeText={(v) => onChange("mrp", v)}
            placeholder="MRP *"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.half}>
          <TInput
            value={variant.price}
            onChangeText={(v) => onChange("price", v)}
            placeholder="Price *"
            keyboardType="decimal-pad"
            error={vErr ? "err" : undefined}
          />
        </View>
      </View>
      {vErr && (
        <Text style={[styles.fieldError, { color: colors.error }]}>
          Variant price cannot exceed MRP
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  variantRow: { padding: 12, borderWidth: 1, marginBottom: 10 },
  variantTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  variantIndex: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  fieldError: { fontSize: 11, marginTop: 4, fontWeight: "500" },
});
