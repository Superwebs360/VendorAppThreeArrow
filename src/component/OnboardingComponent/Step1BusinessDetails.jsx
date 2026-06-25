// Step1BusinessDetails.jsx
import React, { useState } from "react";
import {
  FlatList,
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

const BUSINESS_TYPES = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
];

const PRODUCT_CATEGORIES = [
  "fashion",
  "food",
  "casual wear",
  "toys",
  "snacks",
  "home utils",
  "grocery",
  "Grocery & Kitchen",
  "Snacks & Drinks",
  "Fashion & Apparel",
  "Electronics",
  "Books",
  "Sports",
  "Beauty & Health",
];

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

export default function Step1BusinessDetails({ formData, onChange, errors }) {
  const { colors, radii, isDark } = useTheme();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const selectedCategories = formData.productCategories || [];
  const selectedType = formData.businessType || "";

  const toggleCategory = (cat) => {
    const current = formData.productCategories || [];
    if (current.includes(cat)) {
      onChange(
        "productCategories",
        current.filter((c) => c !== cat),
      );
    } else if (current.length < 10) {
      onChange("productCategories", [...current, cat]);
    }
  };

  const toggleOnboardAs = (type) => {
    const current = formData.onboardAs || [];
    if (current.includes(type)) {
      onChange(
        "onboardAs",
        current.filter((t) => t !== type),
      );
    } else {
      onChange("onboardAs", [...current, type]);
    }
  };

  const onboardAs = formData.onboardAs || [];
  const catLabel =
    selectedCategories.length === 0
      ? "Select Categories"
      : selectedCategories.join(", ");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Business Details
      </Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Enter the details about your products and sales
      </Text>

      {/* Product Categories */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>
          Product Categories (Max 10)
          <Text style={{ color: colors.error }}> *</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setCategoryOpen(true)}
          activeOpacity={0.8}
          style={[
            styles.select,
            {
              backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
              borderColor: errors?.productCategories
                ? colors.error
                : colors.border || "rgba(0,0,0,0.1)",
              borderRadius: radii.s || 8,
            },
          ]}
        >
          <Text
            style={{
              color: selectedCategories.length
                ? colors.text
                : colors.placeholder,
              flex: 1,
              fontSize: 14,
            }}
            numberOfLines={1}
          >
            {catLabel}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>▼</Text>
        </TouchableOpacity>
        {errors?.productCategories && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.productCategories}
          </Text>
        )}
      </View>

      {/* Onboard As */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>
          Onboard As{" "}
          <Text
            style={{ color: colors.textMuted, fontWeight: "400", fontSize: 12 }}
          >
            (Select one or both)
          </Text>
          <Text style={{ color: colors.error }}> *</Text>
        </Text>
        <View style={styles.onboardRow}>
          {["Retailer", "Wholesaler"].map((t) => {
            const active = onboardAs.includes(t);
            return (
              <TouchableOpacity
                key={t}
                onPress={() => toggleOnboardAs(t)}
                activeOpacity={0.8}
                style={[
                  styles.onboardCard,
                  {
                    borderColor: active
                      ? colors.secondary
                      : colors.border || "rgba(0,0,0,0.1)",
                    backgroundColor: active
                      ? isDark
                        ? "rgba(93,182,74,0.15)"
                        : "rgba(93,182,74,0.06)"
                      : colors.inputBg || "rgba(0,0,0,0.02)",
                    borderRadius: radii.m || 12,
                  },
                ]}
              >
                <View
                  style={[
                    styles.onboardCheckbox,
                    {
                      borderColor: active ? colors.secondary : colors.textMuted,
                      backgroundColor: active
                        ? colors.secondary
                        : "transparent",
                    },
                  ]}
                >
                  {active && (
                    <Text
                      style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.onboardTitle, { color: colors.text }]}>
                    {t}
                  </Text>
                  <Text
                    style={[styles.onboardSub, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {t === "Retailer"
                      ? "Sell directly to end consumers"
                      : "Sell in bulk to businesses"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors?.onboardAs && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.onboardAs}
          </Text>
        )}
      </View>

      {/* Form Fields Stack */}
      <FormInput
        label="Business Name"
        required
        value={formData.businessName}
        onChangeText={(v) => onChange("businessName", v)}
        placeholder="e.g. Acme Corp"
        error={errors?.businessName}
      />

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>
          Business Type<Text style={{ color: colors.error }}> *</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setTypeOpen(true)}
          activeOpacity={0.8}
          style={[
            styles.select,
            {
              backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
              borderColor: errors?.businessType
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
            {selectedType || "Select Type"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>▼</Text>
        </TouchableOpacity>
        {errors?.businessType && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.businessType}
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label="GST Number"
            required
            value={formData.gstNumber}
            onChangeText={(v) => onChange("gstNumber", v)}
            placeholder="e.g. 29ABCDE1234F1Z5"
            error={errors?.gstNumber}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label="PAN Number"
            required
            value={formData.panNumber}
            onChangeText={(v) => onChange("panNumber", v)}
            placeholder="e.g. ABCDE1234F"
            error={errors?.panNumber}
          />
        </View>
      </View>

      <FormInput
        label="Business Email"
        required
        value={formData.businessEmail}
        onChangeText={(v) => onChange("businessEmail", v)}
        placeholder="contact@business.com"
        keyboardType="email-address"
        error={errors?.businessEmail}
      />

      <FormInput
        label="Business Phone"
        required
        value={formData.businessPhone}
        onChangeText={(v) => onChange("businessPhone", v)}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        error={errors?.businessPhone}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <FormInput
            label="Year Established"
            required
            value={formData.yearEstablished}
            onChangeText={(v) => onChange("yearEstablished", v)}
            placeholder="e.g. 2015"
            keyboardType="number-pad"
            error={errors?.yearEstablished}
          />
        </View>
        <View style={styles.halfField}>
          <FormInput
            label="Number of Employees"
            required
            value={formData.employees}
            onChangeText={(v) => onChange("employees", v)}
            placeholder="e.g. 50"
            keyboardType="number-pad"
            error={errors?.employees}
          />
        </View>
      </View>

      {/* Category Modal */}
      <Modal visible={categoryOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setCategoryOpen(false)}
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
              Select Categories (Max 10)
            </Text>
            <FlatList
              data={PRODUCT_CATEGORIES}
              keyExtractor={(i) => i}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const checked = selectedCategories.includes(item);
                return (
                  <TouchableOpacity
                    onPress={() => toggleCategory(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.modalRow,
                      {
                        borderBottomColor: colors.divider || "rgba(0,0,0,0.06)",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: checked
                            ? colors.secondary
                            : colors.textMuted,
                          backgroundColor: checked
                            ? colors.secondary
                            : "transparent",
                        },
                      ]}
                    >
                      {checked && (
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.modalItem, { color: colors.text }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              onPress={() => setCategoryOpen(false)}
              activeOpacity={0.8}
              style={[
                styles.doneBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: radii.s || 8,
                },
              ]}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Type Modal */}
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
              Select Business Type
            </Text>
            {BUSINESS_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  onChange("businessType", t);
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
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, opacity: 0.9 },
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
  row: { flexDirection: "row", gap: 12, marginBottom: 0 },
  halfField: { flex: 1 },
  onboardRow: { flexDirection: "row", gap: 12 },
  onboardCard: {
    flex: 1,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  onboardCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  onboardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  onboardSub: { fontSize: 11, lineHeight: 15, opacity: 0.7 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: "88%", maxHeight: "65%", padding: 20 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.1,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalItem: { fontSize: 14 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
