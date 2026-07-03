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
  Switch,
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
import { safeBack } from "../../../../../../utils/navigation";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  deliveryAvailable: true,
  pickupAvailable: false,
  cashOnDelivery: true,
  freeDeliveryThreshold: "",
  deliveryCharge: "",
  minimumOrderAmount: "",
  estimatedDeliveryTime: "",
};

// ─── Validators ───────────────────────────────────────────────────────────────

const isValidAmount = (val) =>
  val.trim() === "" || /^\d+(\.\d{1,2})?$/.test(val.trim());

// ─── Main Component ───────────────────────────────────────────────────────────

const DeliveryInformation = () => {
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
  const [deliveryAvailable, setDeliveryAvailable] = useState(
    DEFAULTS.deliveryAvailable,
  );
  const [pickupAvailable, setPickupAvailable] = useState(
    DEFAULTS.pickupAvailable,
  );
  const [cashOnDelivery, setCashOnDelivery] = useState(DEFAULTS.cashOnDelivery);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    DEFAULTS.freeDeliveryThreshold,
  );
  const [deliveryCharge, setDeliveryCharge] = useState(DEFAULTS.deliveryCharge);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(
    DEFAULTS.minimumOrderAmount,
  );
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(
    DEFAULTS.estimatedDeliveryTime,
  );

  const [touched, setTouched] = useState({});

  const hasFetched = useRef(false);

  useEffect(() => {
    if (vendorUser?._id && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(getMyStoreInformation());
    }
  }, [vendorUser?._id, dispatch]);

  // ── Hydrate form whenever storeInfo changes ────────────────────────────────
  useEffect(() => {
    if (!storeInfo) return;

    const d = storeInfo.deliveryInformation ?? {};

    setDeliveryAvailable(d.deliveryAvailable ?? DEFAULTS.deliveryAvailable);
    setPickupAvailable(d.pickupAvailable ?? DEFAULTS.pickupAvailable);
    setCashOnDelivery(d.cashOnDelivery ?? DEFAULTS.cashOnDelivery);
    setFreeDeliveryThreshold(
      d.freeDeliveryThreshold != null ? String(d.freeDeliveryThreshold) : "",
    );
    setDeliveryCharge(d.deliveryCharge != null ? String(d.deliveryCharge) : "");
    setMinimumOrderAmount(
      d.minimumOrderAmount != null ? String(d.minimumOrderAmount) : "",
    );
    setEstimatedDeliveryTime(d.estimatedDeliveryTime ?? "");
  }, [storeInfo]);

  // ── Inline error helpers ───────────────────────────────────────────────────
  const errors = {
    freeDeliveryThreshold:
      touched.freeDeliveryThreshold && !isValidAmount(freeDeliveryThreshold)
        ? "Enter a valid amount"
        : null,
    deliveryCharge:
      touched.deliveryCharge && !isValidAmount(deliveryCharge)
        ? "Enter a valid amount"
        : null,
    minimumOrderAmount:
      touched.minimumOrderAmount && !isValidAmount(minimumOrderAmount)
        ? "Enter a valid amount"
        : null,
  };

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ── Pre-save validation ────────────────────────────────────────────────────
  const validateForm = () => {
    if (!deliveryAvailable && !pickupAvailable) {
      Alert.alert(
        "Required",
        "Enable at least one of Delivery or Pickup so customers can get their orders.",
      );
      return false;
    }
    if (!isValidAmount(freeDeliveryThreshold)) {
      Alert.alert("Invalid", "Free delivery threshold must be a valid amount.");
      return false;
    }
    if (!isValidAmount(deliveryCharge)) {
      Alert.alert("Invalid", "Delivery charge must be a valid amount.");
      return false;
    }
    if (!isValidAmount(minimumOrderAmount)) {
      Alert.alert("Invalid", "Minimum order amount must be a valid amount.");
      return false;
    }
    return true;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();

      formData.append(
        "deliveryInformation",
        JSON.stringify({
          deliveryAvailable,
          pickupAvailable,
          cashOnDelivery,
          freeDeliveryThreshold: freeDeliveryThreshold.trim()
            ? Number(freeDeliveryThreshold)
            : 0,
          deliveryCharge: deliveryCharge.trim() ? Number(deliveryCharge) : 0,
          minimumOrderAmount: minimumOrderAmount.trim()
            ? Number(minimumOrderAmount)
            : 0,
          estimatedDeliveryTime: estimatedDeliveryTime.trim(),
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
        Alert.alert("Saved", "Delivery information updated successfully.", [
          { text: "OK", onPress: () => safeBack(router) },
        ]);
      } else {
        Alert.alert(
          "Error",
          result.payload || "Failed to save delivery information.",
        );
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred while saving.");
      console.error("Save delivery info error:", err);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
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
            Loading delivery information...
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
                <Ionicons name="bicycle" size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.introTitle,
                    { color: colors.text, ...typography.bodyMedium },
                  ]}
                >
                  How orders reach your customers
                </Text>
                <Text
                  style={[
                    styles.introSub,
                    { color: colors.textSecondary, ...typography.caption },
                  ]}
                >
                  Set fulfillment options and charges shown at checkout.
                </Text>
              </View>
            </View>

            {/* ── Section: Fulfillment Options ── */}
            <SectionLabel
              icon="options-outline"
              text="Fulfillment Options"
              colors={colors}
              typography={typography}
            />

            <ToggleRow
              icon="bicycle-outline"
              title="Delivery Available"
              subtitle="Customers can get orders delivered to their address"
              value={deliveryAvailable}
              onValueChange={setDeliveryAvailable}
              saving={saving}
              colors={colors}
              typography={typography}
            />

            <ToggleRow
              icon="storefront-outline"
              title="Pickup Available"
              subtitle="Customers can collect orders directly from your store"
              value={pickupAvailable}
              onValueChange={setPickupAvailable}
              saving={saving}
              colors={colors}
              typography={typography}
            />

            <ToggleRow
              icon="cash-outline"
              title="Cash on Delivery"
              subtitle="Accept cash payment when the order is delivered"
              value={cashOnDelivery}
              onValueChange={setCashOnDelivery}
              saving={saving}
              colors={colors}
              typography={typography}
            />

            {/* ── Section: Pricing ── */}
            <SectionLabel
              icon="pricetag-outline"
              text="Pricing & Charges"
              colors={colors}
              typography={typography}
              style={{ marginTop: 10 }}
            />

            <Field
              label="Delivery Charge"
              hint="₹ amount charged per order"
              error={errors.deliveryCharge}
              colors={colors}
              typography={typography}
            >
              <AmountInput
                value={deliveryCharge}
                onChangeText={setDeliveryCharge}
                onBlur={() => touch("deliveryCharge")}
                hasError={!!errors.deliveryCharge}
                saving={saving}
                colors={colors}
              />
            </Field>

            <Field
              label="Free Delivery Threshold"
              hint="Order value above which delivery is free (₹0 = disabled)"
              error={errors.freeDeliveryThreshold}
              colors={colors}
              typography={typography}
            >
              <AmountInput
                value={freeDeliveryThreshold}
                onChangeText={setFreeDeliveryThreshold}
                onBlur={() => touch("freeDeliveryThreshold")}
                hasError={!!errors.freeDeliveryThreshold}
                saving={saving}
                colors={colors}
              />
            </Field>

            <Field
              label="Minimum Order Amount"
              hint="Smallest order value you'll accept (₹0 = no minimum)"
              error={errors.minimumOrderAmount}
              colors={colors}
              typography={typography}
            >
              <AmountInput
                value={minimumOrderAmount}
                onChangeText={setMinimumOrderAmount}
                onBlur={() => touch("minimumOrderAmount")}
                hasError={!!errors.minimumOrderAmount}
                saving={saving}
                colors={colors}
              />
            </Field>

            {/* ── Section: Timing ── */}
            <SectionLabel
              icon="time-outline"
              text="Delivery Timing"
              colors={colors}
              typography={typography}
              style={{ marginTop: 10 }}
            />

            <Field
              label="Estimated Delivery Time"
              hint='e.g. "30-45 mins" or "1-2 days"'
              colors={colors}
              typography={typography}
            >
              <TextInput
                value={estimatedDeliveryTime}
                onChangeText={setEstimatedDeliveryTime}
                placeholder="30-45 mins"
                placeholderTextColor={colors.placeholder}
                maxLength={40}
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
                Leave amount fields as 0 to disable that charge or threshold. At
                least one of Delivery or Pickup must stay enabled.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Save bar ── */}
      <View
        style={[
          styles.saveBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
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
      onPress={() => safeBack(router)}
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
        Delivery Information
      </Text>
      <Text
        style={[
          styles.headerSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Fulfillment, charges & timing
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
      <Ionicons name="bicycle" size={17} color={colors.secondary} />
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

// ─── Toggle row ───────────────────────────────────────────────────────────────

const ToggleRow = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  saving,
  colors,
  typography,
}) => (
  <View
    style={[
      styles.toggleRow,
      { backgroundColor: colors.inputBg, borderColor: colors.border },
    ]}
  >
    <View
      style={[
        styles.toggleIconWrap,
        { backgroundColor: colors.secondary + "15" },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.secondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={[
          styles.toggleTitle,
          { color: colors.text, ...typography.bodyMedium },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.toggleSubtitle,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        {subtitle}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={saving}
      trackColor={{ false: colors.border, true: colors.secondary + "80" }}
      thumbColor={value ? colors.secondary : "#f4f3f4"}
    />
  </View>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({ label, children, colors, typography, hint, error }) => (
  <View style={styles.field}>
    <View style={styles.fieldLabelRow}>
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.textSecondary, ...typography.label },
        ]}
      >
        {label}
      </Text>
    </View>
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
    {children}
    {error ? (
      <Text style={[styles.fieldError, { color: colors.error }]}>{error}</Text>
    ) : null}
  </View>
);

// ─── Amount input with ₹ prefix ───────────────────────────────────────────────

const AmountInput = ({
  value,
  onChangeText,
  onBlur,
  hasError,
  saving,
  colors,
}) => (
  <View
    style={[
      styles.amountInputWrap,
      {
        backgroundColor: colors.inputBg,
        borderColor: hasError ? colors.error : colors.border,
      },
    ]}
  >
    <View style={[styles.currencyPill, { borderRightColor: colors.border }]}>
      <Text style={[styles.currencyTxt, { color: colors.textSecondary }]}>
        ₹
      </Text>
    </View>
    <TextInput
      value={value}
      onChangeText={(t) => onChangeText(t.replace(/[^0-9.]/g, ""))}
      onBlur={onBlur}
      placeholder="0"
      placeholderTextColor={colors.placeholder}
      keyboardType="decimal-pad"
      maxLength={10}
      editable={!saving}
      style={[
        styles.amountInput,
        { color: colors.text, opacity: saving ? 0.6 : 1 },
      ]}
    />
  </View>
);

export default DeliveryInformation;

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

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { fontWeight: "600", marginBottom: 2 },
  toggleSubtitle: { lineHeight: 15 },

  field: { marginBottom: 18, marginTop: 6 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {},
  fieldHint: { fontStyle: "italic", marginTop: 2, marginBottom: 8 },
  fieldError: { fontSize: 12, marginTop: 5, fontWeight: "500" },

  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },

  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  currencyPill: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  currencyTxt: { fontSize: 15, fontWeight: "700" },
  amountInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
    marginBottom: 20,
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
