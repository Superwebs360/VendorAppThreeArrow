import { COMPONENT } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

export default function TInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
  editable = true,
  error,
}) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        styles.input,
        multiline && {
          height: (numberOfLines || 3) * 22 + 16,
          textAlignVertical: "top",
          paddingTop: 12,
          paddingBottom: 12,
        },
        {
          backgroundColor: editable ? colors.inputBg : colors.surface,
          borderColor: error
            ? colors.error
            : focused
              ? colors.primary
              : colors.border,
          color: editable ? colors.text : colors.textMuted,
          borderRadius: radii.sm,
          height: multiline ? undefined : COMPONENT?.inputHeight || 50,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      keyboardType={keyboardType || "default"}
      multiline={!!multiline}
      numberOfLines={multiline ? numberOfLines || 3 : 1}
      editable={editable}
      autoCorrect={false}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
});
