import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

const DELIVERY_TIMES = ["10 min", "20 min", "30 min", "60 min"];

export default function DeliverySettings({ data, onChange }) {
  const { colors } = useTheme();
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Delivery Setting
      </Text>

      {/* Preferred delivery time */}
      <View style={styles.subSection}>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Preferred Delivery Time
        </Text>
        <View style={styles.chips}>
          {DELIVERY_TIMES.map((t) => {
            const active = data.deliveryTime === t;
            return (
              <Pressable
                key={t}
                onPress={() => update("deliveryTime", t)}
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
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Express delivery toggle */}
      <View style={styles.subSection}>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Express Delivery
        </Text>
        <View
          style={[
            styles.toggleRow,
            {
              backgroundColor: data.express
                ? colors.secondary + "18"
                : colors.inputBg,
              borderColor: data.express ? colors.secondary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.toggleLabel,
              { color: data.express ? colors.secondary : colors.textSecondary },
            ]}
          >
            {data.express ? "Enabled" : "Disabled"}
          </Text>
          <Switch
            value={data.express}
            onValueChange={(v) => update("express", v)}
            trackColor={{
              false: colors.border,
              true: colors.secondary + "66",
            }}
            thumbColor={data.express ? colors.secondary : colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  sectionTitle: { ...Typography.heading3 },
  subSection: { gap: 8 },
  subLabel: { ...Typography.caption, fontWeight: "500" },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipText: { ...Typography.caption, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleLabel: { ...Typography.bodyMedium, fontWeight: "600", fontSize: 14 },
});
