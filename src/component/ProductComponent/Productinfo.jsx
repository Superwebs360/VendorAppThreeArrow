import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Radii, Typography, useTheme } from "../../constants/theme";

const CATEGORIES = [
  "Grocery & Kitchen",
  "Dairy & Eggs",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Electronics",
  "Clothing",
  "Home & Kitchen",
];

const BRANDS = [
  "Amul",
  "Nestle",
  "Britannia",
  "Dabur",
  "Parle",
  "ITC",
  "HUL",
  "Patanjali",
  "Others",
];

function Dropdown({ label, value, options, onSelect, colors, isDark }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.dropdown,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.dropdownText,
            { color: value ? colors.text : colors.placeholder },
          ]}
          numberOfLines={1}
        >
          {value || label}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.optionBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              {label}
            </Text>
            <ScrollView>
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.divider },
                    value === opt && {
                      backgroundColor: colors.secondary + "15",
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {opt}
                  </Text>
                  {value === opt && (
                    <Feather name="check" size={16} color={colors.secondary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function ProductInfo({ data, onChange }) {
  const { colors, isDark } = useTheme();

  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Product Info
      </Text>

      {/* Name */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Product Name
        </Text>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={data.name}
            onChangeText={(v) => update("name", v)}
            placeholder="Enter product name"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { color: colors.text }]}
            maxLength={100}
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {data.name?.length || 0}/100
          </Text>
        </View>
      </View>

      {/* Category + Brand row */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Category
          </Text>
          <Dropdown
            label="Select"
            value={data.category}
            options={CATEGORIES}
            onSelect={(v) => update("category", v)}
            colors={colors}
            isDark={isDark}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Brand
          </Text>
          <Dropdown
            label="Select"
            value={data.brand}
            options={BRANDS}
            onSelect={(v) => update("brand", v)}
            colors={colors}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  sectionTitle: { ...Typography.heading3 },
  field: { gap: 6 },
  label: { ...Typography.caption, fontWeight: "500" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, ...Typography.body, fontSize: 14 },
  charCount: { fontSize: 11, marginLeft: 6 },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1, gap: 6 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: { ...Typography.body, fontSize: 13, flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  optionBox: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    maxHeight: 320,
    overflow: "hidden",
  },
  optionTitle: {
    ...Typography.heading3,
    padding: 16,
    paddingBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionText: { ...Typography.body, fontSize: 14 },
});
