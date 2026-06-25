import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

const PRESETS = ["500g", "1kg", "5kg", "Pack of 1"];

export default function UnitWeight({ data, onChange }) {
  const { colors } = useTheme();
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Unit & Weight
      </Text>

      <View style={styles.chips}>
        {PRESETS.map((p) => {
          const active = data.unit === p;
          return (
            <Pressable
              key={p}
              onPress={() => update("unit", p)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.secondary : colors.inputBg,
                  borderColor: active ? colors.secondary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#fff" : colors.textSecondary },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom unit input */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Custom Unit (optional)
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={data.customUnit}
            onChangeText={(v) => update("customUnit", v)}
            placeholder="e.g. 250ml, Pack of 6"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionTitle: { ...Typography.heading3 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipText: { ...Typography.caption, fontWeight: "600" },
  field: { gap: 6 },
  label: { ...Typography.caption, fontWeight: "500" },
  inputWrap: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { ...Typography.body, fontSize: 14, padding: 0 },
});
