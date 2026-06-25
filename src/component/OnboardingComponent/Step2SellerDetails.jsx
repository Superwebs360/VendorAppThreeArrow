// Step2SellerDetails.jsx
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COMPONENT } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";

function FormInput({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
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
        autoCorrect={false}
      />
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

export default function Step2SellerDetails({ formData, onChange, errors }) {
  const { colors } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Seller Details
      </Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Enter the authorized seller information
      </Text>

      <FormInput
        label="Seller Full Name"
        required
        value={formData.sellerName}
        onChangeText={(v) => onChange("sellerName", v)}
        placeholder="Full legal name"
        error={errors?.sellerName}
      />

      <FormInput
        label="Seller Email"
        required
        value={formData.sellerEmail}
        onChangeText={(v) => onChange("sellerEmail", v)}
        placeholder="seller@email.com"
        keyboardType="email-address"
        error={errors?.sellerEmail}
      />

      <FormInput
        label="Phone Number"
        required
        value={formData.sellerPhone}
        onChangeText={(v) => onChange("sellerPhone", v)}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        error={errors?.sellerPhone}
      />

      <FormInput
        label="Address"
        required
        value={formData.sellerAddress}
        onChangeText={(v) => onChange("sellerAddress", v)}
        placeholder="Street address, building, suite"
        error={errors?.sellerAddress}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <FormInput
            label="City"
            required
            value={formData.sellerCity}
            onChangeText={(v) => onChange("sellerCity", v)}
            placeholder="e.g. Mumbai"
            error={errors?.sellerCity}
          />
        </View>
        <View style={styles.half}>
          <FormInput
            label="State"
            required
            value={formData.sellerState}
            onChangeText={(v) => onChange("sellerState", v)}
            placeholder="e.g. Maharashtra"
            error={errors?.sellerState}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <FormInput
            label="Pincode"
            required
            value={formData.sellerPincode}
            onChangeText={(v) => onChange("sellerPincode", v)}
            placeholder="e.g. 400001"
            keyboardType="number-pad"
            error={errors?.sellerPincode}
          />
        </View>
        <View style={styles.half} />
      </View>
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
  subheading: { fontSize: 14, marginBottom: 24, opacity: 0.8 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, opacity: 0.9 },
  errorText: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  input: {
    height: COMPONENT?.inputHeight || 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
});
