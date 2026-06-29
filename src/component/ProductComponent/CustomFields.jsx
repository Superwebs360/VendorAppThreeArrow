import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TInput from "./TInput";

export default function CustomFields({ fields, onChange, colors, radii }) {
  const add = () => onChange([...fields, { label: "", value: "" }]);
  const remove = (i) => onChange(fields.filter((_, idx) => idx !== i));
  const update = (i, key, val) =>
    onChange(fields.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  return (
    <View>
      {fields.map((f, i) => (
        <View key={i} style={[styles.row, { marginBottom: 8 }]}>
          <View style={styles.half}>
            <TInput
              value={f.label}
              onChangeText={(v) => update(i, "label", v)}
              placeholder="Label e.g. Material"
            />
          </View>
          <View style={[styles.half, { flexDirection: "row", gap: 6 }]}>
            <View style={{ flex: 1 }}>
              <TInput
                value={f.value}
                onChangeText={(v) => update(i, "value", v)}
                placeholder="Value e.g. Cotton"
              />
            </View>
            <TouchableOpacity onPress={() => remove(i)} style={styles.cfRemove}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        onPress={add}
        style={[
          styles.addRowBtn,
          { borderColor: colors.secondary + "50", borderRadius: radii.sm },
        ]}
      >
        <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
        <Text style={[styles.addRowText, { color: colors.secondary }]}>
          Add custom field
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  cfRemove: {
    width: 44,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addRowText: { fontSize: 13, fontWeight: "600" },
});
