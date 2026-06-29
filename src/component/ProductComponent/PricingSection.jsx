import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Field from "./Field";
import PillSelect from "./PillSelect";
import TInput from "./TInput";

const GST_OPTIONS = [0, 5, 12, 18, 28];

export default function PricingSection({
  data,
  onChange,
  errors,
  colors,
  radii,
}) {
  const mrpNum = Number(data.mrp);
  const priceNum = Number(data.price);
  const discount =
    data.mrp && data.price && mrpNum > 0 && priceNum > 0
      ? Math.max(0, ((mrpNum - priceNum) / mrpNum) * 100).toFixed(1)
      : null;
  const priceErr = data.price && data.mrp && priceNum > mrpNum;

  return (
    <>
      <View style={styles.row}>
        <View style={styles.half}>
          <Field label="MRP" required error={errors?.mrp}>
            <TInput
              value={data.mrp}
              onChangeText={(v) => onChange("mrp", v)}
              placeholder="₹ 0.00"
              keyboardType="decimal-pad"
              error={errors?.mrp}
            />
          </Field>
        </View>
        <View style={styles.half}>
          <Field
            label="Selling price"
            required
            error={priceErr ? "Must be ≤ MRP" : errors?.price}
          >
            <TInput
              value={data.price}
              onChangeText={(v) => onChange("price", v)}
              placeholder="₹ 0.00"
              keyboardType="decimal-pad"
              error={priceErr ? "err" : errors?.price}
            />
          </Field>
        </View>
      </View>

      {discount !== null && !priceErr && (
        <View
          style={[
            styles.discountBadge,
            {
              backgroundColor: colors.secondary + "15",
              borderColor: colors.secondary + "35",
            },
          ]}
        >
          <Ionicons name="pricetag" size={13} color={colors.secondary} />
          <Text style={[styles.discountText, { color: colors.secondary }]}>
            {discount}% off MRP
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.half}>
          <Field label="Cost / purchase price" hint="Your sourcing cost">
            <TInput
              value={data.costPrice}
              onChangeText={(v) => onChange("costPrice", v)}
              placeholder="₹ 0.00"
              keyboardType="decimal-pad"
            />
          </Field>
        </View>
        <View style={styles.half}>
          <Field label="GST rate">
            <PillSelect
              options={GST_OPTIONS.map((g) => ({
                label: `${g}%`,
                value: String(g),
              }))}
              value={String(data.gst)}
              onChange={(v) => onChange("gst", v)}
              colors={colors}
              radii={radii}
            />
          </Field>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
  },
  discountText: { fontSize: 12, fontWeight: "700" },
});
