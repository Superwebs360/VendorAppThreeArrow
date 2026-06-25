// Step3BrandDetails.jsx
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COMPONENT } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";

const BRAND_TYPES = [
  "Manufacturer",
  "Distributor",
  "Retailer",
  "Reseller",
  "Importer",
  "Other",
];

function FormInput({
  label,
  required,
  optional,
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
        {optional && (
          <Text
            style={[
              styles.optionalTag,
              {
                color: colors.textMuted,
                borderColor: colors.border || "rgba(0,0,0,0.1)",
                backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
              },
            ]}
          >
            Optional
          </Text>
        )}
      </View>
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

export default function Step3BrandDetails({ formData, onChange, errors }) {
  const { colors, radii, isDark } = useTheme();
  const [typeOpen, setTypeOpen] = useState(false);
  const selectedType = formData.brandType || "";

  // Determine required-fields-missing hint
  const missingFields = [];
  if (!formData.brandName) missingFields.push("Brand Name");
  if (!formData.brandType) missingFields.push("Brand Type");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Brand Details
      </Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Enter your brand and trademark information.
      </Text>

      <FormInput
        label="Brand Name"
        required
        value={formData.brandName}
        onChangeText={(v) => onChange("brandName", v)}
        placeholder="e.g. Nike, Apple"
        error={errors?.brandName}
      />

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>
          Brand Type<Text style={{ color: colors.error }}> *</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setTypeOpen(true)}
          activeOpacity={0.8}
          style={[
            styles.select,
            {
              backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
              borderColor: errors?.brandType
                ? colors.error
                : colors.border || "rgba(0,0,0,0.1)",
              borderRadius: radii.s || 8,
            },
          ]}
        >
          <Text
            style={{
              color: selectedType ? colors.text : colors.placeholder,
              flex: 1,
              fontSize: 14,
            }}
          >
            {selectedType || "Select brand type"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>▼</Text>
        </TouchableOpacity>
        {errors?.brandType && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.brandType}
          </Text>
        )}
      </View>

      <FormInput
        label="Trademark Number"
        optional
        value={formData.trademarkNumber}
        onChangeText={(v) => onChange("trademarkNumber", v)}
        placeholder="e.g. TM-1234567"
      />

      <FormInput
        label="Brand Website"
        optional
        value={formData.brandWebsite}
        onChangeText={(v) => onChange("brandWebsite", v)}
        placeholder="https://yourbrand.com"
        keyboardType="url"
      />

      {/* Hint banner when required fields missing */}
      {missingFields.length > 0 && (
        <View
          style={[
            styles.hintBanner,
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
          <Text style={{ color: colors.secondary, fontSize: 13 }}>
            Fill in{" "}
          </Text>
          {missingFields.map((f, i) => (
            <Text
              key={f}
              style={{
                color: colors.secondary,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {f}
              {i < missingFields.length - 1 ? " and " : " "}
            </Text>
          ))}
          <Text style={{ color: colors.secondary, fontSize: 13 }}>
            to continue.
          </Text>
        </View>
      )}

      {/* Brand Type Modal */}
      <Modal visible={typeOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setTypeOpen(false)}
        >
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card || colors.background,
                borderRadius: radii.xl || 16,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Brand Type
            </Text>
            {BRAND_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  onChange("brandType", t);
                  setTypeOpen(false);
                }}
                activeOpacity={0.7}
                style={[
                  styles.modalRow,
                  {
                    borderBottomColor: colors.divider || "rgba(0,0,0,0.06)",
                    backgroundColor:
                      selectedType === t
                        ? isDark
                          ? "rgba(93,182,74,0.1)"
                          : "rgba(93,182,74,0.05)"
                        : "transparent",
                    borderRadius: radii.s || 6,
                    paddingHorizontal: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalItem,
                    {
                      color:
                        selectedType === t ? colors.secondary : colors.text,
                      fontWeight: selectedType === t ? "600" : "400",
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  label: { fontSize: 13, fontWeight: "600", opacity: 0.9 },
  optionalTag: {
    fontSize: 10,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: "hidden",
  },
  errorText: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  input: {
    height: COMPONENT?.inputHeight || 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  select: {
    height: COMPONENT?.inputHeight || 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  hintBanner: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "88%", padding: 20 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.1,
  },
  modalRow: { paddingVertical: 14, borderBottomWidth: 1 },
  modalItem: { fontSize: 14 },
});
