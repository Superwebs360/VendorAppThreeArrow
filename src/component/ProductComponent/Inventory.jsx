import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

export default function Inventory({ data, onChange }) {
  const { colors } = useTheme();
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Inventory
      </Text>

      <View style={styles.row}>
        {/* Stock Quantity */}
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Stock Quantity
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={data.quantity}
              onChangeText={(v) => update("quantity", v)}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text }]}
              placeholderTextColor={colors.placeholder}
              placeholder="0"
            />
          </View>
        </View>

        {/* Stock Status toggle */}
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Stock Status
          </Text>
          <View
            style={[
              styles.statusWrap,
              {
                backgroundColor: data.inStock
                  ? colors.secondary + "18"
                  : colors.error + "18",
                borderColor: data.inStock ? colors.secondary : colors.error,
              },
            ]}
          >
            <Switch
              value={data.inStock}
              onValueChange={(v) => update("inStock", v)}
              trackColor={{
                false: colors.error + "55",
                true: colors.secondary + "55",
              }}
              thumbColor={data.inStock ? colors.secondary : colors.error}
            />
            <Text
              style={[
                styles.statusText,
                { color: data.inStock ? colors.secondary : colors.error },
              ]}
            >
              {data.inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionTitle: { ...Typography.heading3 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1, gap: 6 },
  label: { ...Typography.caption, fontWeight: "500" },
  inputWrap: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { ...Typography.body, fontSize: 14, padding: 0 },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  statusText: { ...Typography.caption, fontWeight: "600" },
});
