import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

function SettingRow({ icon, label, colors, onPress, isLast }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            { backgroundColor: colors.secondary + "18" },
          ]}
        >
          {icon}
        </View>
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 14, fontWeight: "600" },
});

export default SettingRow;
