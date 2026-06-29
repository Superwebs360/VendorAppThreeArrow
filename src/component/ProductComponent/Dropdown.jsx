import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder,
  colors,
  radii,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => (o._id ?? o.value) === value);

  return (
    <View style={{ zIndex: 10 }}>
      <TouchableOpacity
        onPress={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        style={[
          styles.dropdownTrigger,
          {
            backgroundColor: disabled ? colors.surface : colors.inputBg,
            borderColor: open ? colors.secondary : colors.border,
            borderRadius: radii.sm,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={{
            color: selected ? colors.text : colors.placeholder,
            fontSize: 14,
            flex: 1,
          }}
        >
          {selected ? (selected.name ?? selected.label) : placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {open && (
        <View
          style={[
            styles.dropdownList,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.sm,
            },
          ]}
        >
          {options.map((opt) => {
            const id = opt._id ?? opt.value;
            const name = opt.name ?? opt.label;
            const isSel = value === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  onChange(id);
                  setOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  isSel && { backgroundColor: colors.secondary + "12" },
                ]}
              >
                <Text
                  style={{
                    color: isSel ? colors.secondary : colors.text,
                    fontSize: 14,
                    fontWeight: isSel ? "600" : "400",
                  }}
                >
                  {name}
                </Text>
                {isSel && (
                  <Ionicons name="checkmark" size={14} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  dropdownList: { borderWidth: 1, borderTopWidth: 0, overflow: "hidden" },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
