import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import ModalShell from "./ModalShell";

/**
 * Generic field-list modal.
 *
 * Props:
 *   visible, onClose, title, icon
 *   fields   — array from fieldConfigs.js
 *   values   — object of current field values
 *   onChange — (key, value) => void
 *   warning  — optional string shown at top (e.g. bank security notice)
 */
const FieldModal = ({
  visible,
  onClose,
  title,
  icon,
  fields,
  values,
  onChange,
  warning,
  onSave,
  isSaving,
}) => {
  const { colors, typography, radii } = useTheme();

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={title}
      icon={icon}
      onSave={onSave}
      isSaving={isSaving}
    >
      {/* Optional warning banner */}
      {warning && (
        <View
          style={[
            styles.warningBanner,
            {
              backgroundColor: colors.secondary + "12",
              borderColor: colors.secondary + "30",
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={colors.secondary}
          />
          <Text
            style={[
              styles.warningTxt,
              { color: colors.secondary, ...typography.caption },
            ]}
          >
            {warning}
          </Text>
        </View>
      )}

      {/* Form fields */}
      {fields.map((f) => (
        <View key={f.key} style={styles.fieldWrap}>
          <Text
            style={[
              styles.fieldLabel,
              { color: colors.textSecondary, ...typography.caption },
            ]}
          >
            {f.label}
          </Text>
          <TextInput
            value={values[f.key] || ""}
            onChangeText={(v) => onChange(f.key, v)}
            placeholder={f.placeholder}
            placeholderTextColor={colors.textSecondary + "80"}
            keyboardType={f.keyboard || "default"}
            autoCapitalize={
              f.caps ? "characters" : f.multiline ? "sentences" : "words"
            }
            multiline={f.multiline}
            secureTextEntry={f.secure}
            numberOfLines={f.multiline ? 3 : 1}
            style={[
              styles.textInput,
              f.multiline && styles.textInputMulti,
              {
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radii.md,
                ...typography.body1,
              },
            ]}
          />
        </View>
      ))}
    </ModalShell>
  );
};

export default FieldModal;

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { marginBottom: 6, fontWeight: "600" },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    fontSize: 15,
  },
  textInputMulti: { height: 88, textAlignVertical: "top" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningTxt: { flex: 1, lineHeight: 18 },
});
