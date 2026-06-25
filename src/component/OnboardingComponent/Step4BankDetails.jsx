// Step4BankDetails.jsx
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COMPONENT } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";

function FormInput({
  label,
  required,
  hint,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  secureEntry,
}) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
            borderColor: error
              ? colors.error
              : focused
                ? colors.secondary
                : colors.border || "rgba(0,0,0,0.1)",
            color: colors.text,
            borderRadius: radii.s || 8,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secureEntry}
        autoCorrect={false}
      />
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      )}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

export default function Step4BankDetails({ formData, onChange, errors }) {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Bank Details</Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Enter your bank account details for settlement payments.
      </Text>

      {/* Security banner */}
      <View
        style={[
          styles.securityBanner,
          {
            backgroundColor: isDark
              ? "rgba(93,182,74,0.1)"
              : "rgba(93,182,74,0.05)",
            borderColor: isDark
              ? "rgba(93,182,74,0.25)"
              : "rgba(93,182,74,0.15)",
          },
        ]}
      >
        <Text
          style={{ color: colors.secondary, fontSize: 13, fontWeight: "500" }}
        >
          🔒 Your banking information is encrypted and stored securely.
        </Text>
      </View>

      <FormInput
        label="Account Holder Name"
        required
        value={formData.accountHolder}
        onChangeText={(v) => onChange("accountHolder", v)}
        placeholder="Full name as on bank account"
        error={errors?.accountHolder}
      />

      <FormInput
        label="Bank Name"
        required
        value={formData.bankName}
        onChangeText={(v) => onChange("bankName", v)}
        placeholder="e.g. HDFC Bank"
        error={errors?.bankName}
      />

      <FormInput
        label="Account Number"
        required
        value={formData.accountNumber}
        onChangeText={(v) => onChange("accountNumber", v)}
        placeholder="Enter account number"
        keyboardType="number-pad"
        error={errors?.accountNumber}
        secureEntry
      />

      <FormInput
        label="IFSC Code"
        required
        value={formData.ifscCode}
        onChangeText={(v) => onChange("ifscCode", v)}
        placeholder="e.g. HDFC0001234"
        hint="11-character code printed on your cheque"
        error={errors?.ifscCode}
      />

      <FormInput
        label="Branch"
        required
        value={formData.branch}
        onChangeText={(v) => onChange("branch", v)}
        placeholder="Branch name"
        error={errors?.branch}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subheading: { fontSize: 14, marginBottom: 20, opacity: 0.8 },
  securityBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, opacity: 0.9 },
  hint: { fontSize: 11, marginTop: 5, opacity: 0.85, lineHeight: 15 },
  errorText: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  input: {
    height: COMPONENT?.inputHeight || 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
});
