import { useGridConfig } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import { selectVendorUser } from "@/redux/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  createVendorStoreInformation,
  getMyStoreInformation,
  selectSaveError,
  selectStoreError,
  selectStoreExists,
  selectStoreInfo,
  selectStoreLoading,
  selectStoreSaving,
  updateVendorStoreInformation,
} from "../../../../../../redux/vendorstoreinformationSlice";

// ─── Validators ───────────────────────────────────────────────────────────────

const isValidPhone = (val) =>
  val.trim() === "" || /^[0-9]{10}$/.test(val.trim());

const isValidEmail = (val) =>
  val.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

// ─── Main Component ───────────────────────────────────────────────────────────

const ContactInformation = () => {
  const { colors, typography, shadows } = useTheme();
  const { horizontalPad } = useGridConfig();
  const router = useRouter();
  const dispatch = useDispatch();

  const vendorUser = useSelector(selectVendorUser);
  const storeInfo = useSelector(selectStoreInfo);
  const loading = useSelector(selectStoreLoading);
  const error = useSelector(selectStoreError);
  const saving = useSelector(selectStoreSaving);
  const saveError = useSelector(selectSaveError);
  const storeExists = useSelector(selectStoreExists);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [ownerName, setOwnerName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [supportNumber, setSupportNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // touched fields for inline validation
  const [touched, setTouched] = useState({});

  // ── Fetch guard: only fetch once per mount ─────────────────────────────────
  // Don't use an initialLoad state — use a ref so it survives re-renders
  // without triggering extra effects.
  const hasFetched = useRef(false);

  useEffect(() => {
    if (vendorUser?._id && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getMyStoreInformation());
    }
  }, [vendorUser?._id, dispatch]);

  // ── Hydrate form whenever storeInfo changes ────────────────────────────────
  // FIX: storeInfo.contactInformation may be undefined on old documents that
  // were created before the subdocument was added to the schema. Fall back to
  // empty string for every field so inputs are always controlled.
  useEffect(() => {
    if (!storeInfo) return;

    const c = storeInfo.contactInformation ?? {};

    setOwnerName(c.ownerName ?? "");
    setStorePhone(c.storePhone ?? "");
    setAlternatePhone(c.alternatePhone ?? "");
    setEmail(c.email ?? "");
    setSupportNumber(c.supportNumber ?? "");
    setWhatsappNumber(c.whatsappNumber ?? "");
  }, [storeInfo]);

  // ── Inline error helpers ───────────────────────────────────────────────────
  const errors = {
    storePhone:
      touched.storePhone && !isValidPhone(storePhone)
        ? "Must be a 10-digit number"
        : null,
    alternatePhone:
      touched.alternatePhone && !isValidPhone(alternatePhone)
        ? "Must be a 10-digit number"
        : null,
    email:
      touched.email && !isValidEmail(email)
        ? "Enter a valid email address"
        : null,
    supportNumber:
      touched.supportNumber && !isValidPhone(supportNumber)
        ? "Must be a 10-digit number"
        : null,
    whatsappNumber:
      touched.whatsappNumber && !isValidPhone(whatsappNumber)
        ? "Must be a 10-digit number"
        : null,
  };

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ── Pre-save validation ────────────────────────────────────────────────────
  const validateForm = () => {
    if (!ownerName.trim()) {
      Alert.alert("Required", "Please enter the owner or contact name.");
      return false;
    }
    if (!storePhone.trim()) {
      Alert.alert("Required", "Please enter your store phone number.");
      return false;
    }
    if (!isValidPhone(storePhone)) {
      Alert.alert("Invalid", "Store phone must be a 10-digit number.");
      return false;
    }
    if (!isValidPhone(alternatePhone)) {
      Alert.alert("Invalid", "Alternate phone must be a 10-digit number.");
      return false;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid", "Please enter a valid email address.");
      return false;
    }
    if (!isValidPhone(supportNumber)) {
      Alert.alert("Invalid", "Support number must be a 10-digit number.");
      return false;
    }
    if (!isValidPhone(whatsappNumber)) {
      Alert.alert("Invalid", "WhatsApp number must be a 10-digit number.");
      return false;
    }
    return true;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  // Sends contactInformation as JSON string inside FormData.
  // Keys must match schema exactly: ownerName, storePhone, alternatePhone,
  // email, supportNumber, whatsappNumber
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();

      formData.append(
        "contactInformation",
        JSON.stringify({
          ownerName: ownerName.trim(),
          storePhone: storePhone.trim(),
          alternatePhone: alternatePhone.trim(),
          email: email.trim(),
          supportNumber: supportNumber.trim(),
          whatsappNumber: whatsappNumber.trim(),
        }),
      );

      const result = storeExists
        ? await dispatch(
            updateVendorStoreInformation({
              vendorId: vendorUser._id,
              formData,
            }),
          )
        : await dispatch(createVendorStoreInformation(formData));

      const isSuccess = storeExists
        ? updateVendorStoreInformation.fulfilled.match(result)
        : createVendorStoreInformation.fulfilled.match(result);

      if (isSuccess) {
        Alert.alert("Saved", "Contact information updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          result.payload || "Failed to save contact information.",
        );
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred while saving.");
      console.error("Save contact info error:", err);
    }
  };

  // ── Loading state (first fetch, nothing in Redux yet) ──────────────────────
  if (loading && storeExists === null) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <Header colors={colors} typography={typography} router={router} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading contact information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <Header colors={colors} typography={typography} router={router} />

      {error && (
        <ErrorBanner
          message={error}
          colors={colors}
          onDismiss={() => dispatch(clearError())}
        />
      )}
      {saveError && (
        <ErrorBanner
          message={saveError}
          colors={colors}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.body, { paddingHorizontal: horizontalPad * 2 }]}>
            {/* ── Intro card ── */}
            <View
              style={[
                styles.introCard,
                {
                  backgroundColor: colors.secondary + "0C",
                  borderColor: colors.secondary + "28",
                },
              ]}
            >
              <View
                style={[
                  styles.introIconWrap,
                  { backgroundColor: colors.secondary + "18" },
                ]}
              >
                <Ionicons name="call" size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.introTitle,
                    { color: colors.text, ...typography.bodyMedium },
                  ]}
                >
                  How customers reach you
                </Text>
                <Text
                  style={[
                    styles.introSub,
                    { color: colors.textSecondary, ...typography.caption },
                  ]}
                >
                  Shown on your store page and used for order communication.
                </Text>
              </View>
            </View>

            {/* ── Section: Primary Contact ── */}
            <SectionLabel
              icon="person-outline"
              text="Primary Contact"
              colors={colors}
              typography={typography}
            />

            <Field
              label="Owner Name"
              required
              colors={colors}
              typography={typography}
            >
              <TextInput
                value={ownerName}
                onChangeText={setOwnerName}
                onBlur={() => touch("ownerName")}
                placeholder="e.g. Rajesh Kumar"
                placeholderTextColor={colors.placeholder}
                maxLength={80}
                editable={!saving}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    opacity: saving ? 0.6 : 1,
                  },
                ]}
              />
            </Field>

            <Field
              label="Store Phone Number"
              required
              hint="10-digit number"
              error={errors.storePhone}
              colors={colors}
              typography={typography}
            >
              <PhoneInput
                value={storePhone}
                onChangeText={(t) => setStorePhone(t.replace(/[^0-9]/g, ""))}
                onBlur={() => touch("storePhone")}
                hasError={!!errors.storePhone}
                saving={saving}
                colors={colors}
                icon={
                  <Text
                    style={[
                      styles.dialCodeTxt,
                      { color: colors.textSecondary },
                    ]}
                  >
                    🇮🇳 +91
                  </Text>
                }
              />
            </Field>

            <Field
              label="Alternate Phone Number"
              hint="Optional"
              error={errors.alternatePhone}
              colors={colors}
              typography={typography}
            >
              <PhoneInput
                value={alternatePhone}
                onChangeText={(t) =>
                  setAlternatePhone(t.replace(/[^0-9]/g, ""))
                }
                onBlur={() => touch("alternatePhone")}
                hasError={!!errors.alternatePhone}
                saving={saving}
                colors={colors}
                icon={
                  <Text
                    style={[
                      styles.dialCodeTxt,
                      { color: colors.textSecondary },
                    ]}
                  >
                    🇮🇳 +91
                  </Text>
                }
              />
            </Field>

            <Field
              label="Email Address"
              hint="For order confirmations"
              error={errors.email}
              colors={colors}
              typography={typography}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                onBlur={() => touch("email")}
                placeholder="store@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={120}
                editable={!saving}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: errors.email ? colors.error : colors.border,
                    opacity: saving ? 0.6 : 1,
                  },
                ]}
              />
            </Field>

            {/* ── Section: Customer Support ── */}
            <SectionLabel
              icon="headset-outline"
              text="Customer Support"
              colors={colors}
              typography={typography}
              style={{ marginTop: 8 }}
            />

            <Field
              label="Customer Support Number"
              hint="Optional"
              error={errors.supportNumber}
              colors={colors}
              typography={typography}
            >
              <PhoneInput
                value={supportNumber}
                onChangeText={(t) => setSupportNumber(t.replace(/[^0-9]/g, ""))}
                onBlur={() => touch("supportNumber")}
                hasError={!!errors.supportNumber}
                saving={saving}
                colors={colors}
                icon={
                  <Text
                    style={[
                      styles.dialCodeTxt,
                      { color: colors.textSecondary },
                    ]}
                  >
                    🇮🇳 +91
                  </Text>
                }
              />
            </Field>

            {/* ── Section: WhatsApp Business ── */}
            <SectionLabel
              icon="logo-whatsapp"
              text="WhatsApp Business"
              colors={colors}
              typography={typography}
              style={{ marginTop: 8 }}
            />

            <Field
              label="WhatsApp Business Number"
              hint="Optional"
              error={errors.whatsappNumber}
              colors={colors}
              typography={typography}
            >
              <PhoneInput
                value={whatsappNumber}
                onChangeText={(t) =>
                  setWhatsappNumber(t.replace(/[^0-9]/g, ""))
                }
                onBlur={() => touch("whatsappNumber")}
                hasError={!!errors.whatsappNumber}
                saving={saving}
                colors={colors}
                icon={
                  <View style={styles.waIconRow}>
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text
                      style={[
                        styles.dialCodeTxt,
                        { color: colors.textSecondary, marginLeft: 4 },
                      ]}
                    >
                      +91
                    </Text>
                  </View>
                }
              />
            </Field>

            {/* Quick-fill: copy store phone → WhatsApp */}
            {storePhone.length === 10 && whatsappNumber === "" && (
              <TouchableOpacity
                onPress={() => setWhatsappNumber(storePhone)}
                style={[
                  styles.copyHintRow,
                  {
                    backgroundColor: colors.secondary + "0E",
                    borderColor: colors.secondary + "28",
                  },
                ]}
              >
                <Ionicons
                  name="copy-outline"
                  size={15}
                  color={colors.secondary}
                />
                <Text
                  style={[
                    styles.copyHintTxt,
                    { color: colors.secondary, ...typography.caption },
                  ]}
                >
                  Same as store phone? Tap to copy
                </Text>
              </TouchableOpacity>
            )}

            {/* ── Info box ── */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.secondary + "08",
                  borderColor: colors.secondary + "25",
                },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.secondary}
              />
              <Text
                style={[
                  styles.infoText,
                  { color: colors.textSecondary, flex: 1 },
                ]}
              >
                Owner name and store phone are required. All other fields are
                optional and can be updated later.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Save bar ── */}
      <View
        style={[
          styles.saveBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.secondary,
              opacity: saving ? 0.7 : 1,
              ...shadows.secondary,
            },
          ]}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.saveBtnTxt, { ...typography.button }]}>
                Saving...
              </Text>
            </>
          ) : (
            <Text style={[styles.saveBtnTxt, { ...typography.button }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = ({ colors, typography, router }) => (
  <View
    style={[
      styles.header,
      { backgroundColor: colors.background, borderBottomColor: colors.border },
    ]}
  >
    <TouchableOpacity
      onPress={() => router.back()}
      style={[
        styles.backBtn,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </TouchableOpacity>

    <View style={styles.headerCenter}>
      <Text
        style={[
          styles.headerTitle,
          { color: colors.text, ...typography.heading3 },
        ]}
      >
        Contact Information
      </Text>
      <Text
        style={[
          styles.headerSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Phone, email & WhatsApp
      </Text>
    </View>

    <View
      style={[
        styles.headerBadge,
        {
          backgroundColor: colors.secondary + "18",
          borderColor: colors.secondary + "35",
        },
      ]}
    >
      <Ionicons name="call" size={17} color={colors.secondary} />
    </View>
  </View>
);

// ─── Error banner ─────────────────────────────────────────────────────────────

const ErrorBanner = ({ message, colors, onDismiss }) => (
  <View
    style={[
      styles.errorAlert,
      {
        backgroundColor: colors.error + "15",
        borderColor: colors.error + "35",
      },
    ]}
  >
    <Ionicons name="alert-circle" size={18} color={colors.error} />
    <Text style={[styles.errorText, { color: colors.error, flex: 1 }]}>
      {message}
    </Text>
    <TouchableOpacity onPress={onDismiss}>
      <Ionicons name="close" size={18} color={colors.error} />
    </TouchableOpacity>
  </View>
);

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ icon, text, colors, typography, style }) => (
  <View style={[styles.sectionLabelRow, style]}>
    <Ionicons name={icon} size={15} color={colors.secondary} />
    <Text
      style={[
        styles.sectionLabelTxt,
        { color: colors.text, ...typography.bodyMedium },
      ]}
    >
      {text}
    </Text>
  </View>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  children,
  colors,
  typography,
  required,
  hint,
  error,
}) => (
  <View style={styles.field}>
    <View style={styles.fieldLabelRow}>
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.textSecondary, ...typography.label },
        ]}
      >
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      {hint && (
        <Text
          style={[
            styles.fieldHint,
            { color: colors.textMuted, ...typography.caption },
          ]}
        >
          {hint}
        </Text>
      )}
    </View>
    {children}
    {error ? (
      <Text style={[styles.fieldError, { color: colors.error }]}>{error}</Text>
    ) : null}
  </View>
);

// ─── Phone input with prefix ──────────────────────────────────────────────────

const PhoneInput = ({
  value,
  onChangeText,
  onBlur,
  hasError,
  saving,
  colors,
  icon,
}) => (
  <View
    style={[
      styles.phoneInputWrap,
      {
        backgroundColor: colors.inputBg,
        borderColor: hasError ? colors.error : colors.border,
      },
    ]}
  >
    <View style={[styles.dialCodePill, { borderRightColor: colors.border }]}>
      {icon}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder="9876543210"
      placeholderTextColor={colors.placeholder}
      keyboardType="number-pad"
      maxLength={10}
      editable={!saving}
      style={[
        styles.phoneInput,
        { color: colors.text, opacity: saving ? 0.6 : 1 },
      ]}
    />
  </View>
);

export default ContactInformation;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontWeight: "700", marginBottom: 1 },
  headerSub: { opacity: 0.7 },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: "500" },

  body: { paddingTop: 20, gap: 4 },

  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 26,
  },
  introIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: { fontWeight: "600", marginBottom: 2 },
  introSub: { lineHeight: 17 },

  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 14,
  },
  sectionLabelTxt: { fontWeight: "700" },

  field: { marginBottom: 18 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fieldLabel: {},
  fieldHint: { fontStyle: "italic" },
  fieldError: { fontSize: 12, marginTop: 5, fontWeight: "500" },

  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },

  phoneInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  dialCodePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  dialCodeTxt: { fontSize: 14, fontWeight: "600" },
  waIconRow: { flexDirection: "row", alignItems: "center" },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },

  copyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: -10,
    marginBottom: 18,
  },
  copyHintTxt: { fontWeight: "600" },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  infoText: { fontSize: 13 },

  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnTxt: { color: "#fff" },
});
