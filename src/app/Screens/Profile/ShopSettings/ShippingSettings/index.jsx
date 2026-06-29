// screens/ShippingSettings/index.jsx
//
// Hydration priority:
//   1. vendor.shippingLocations  (from vendorInfoSlice — already loaded in VendorEditProfile)
//   2. shippingSettings.shippingLocation (from shippingSettingsSlice — own API)
//
// On "Save location" → dispatches saveShippingSettings which POSTs to
// /api/vendor/shipping-settings (upsert) and also syncs Vendor.shippingLocations
// on the backend.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { COMPONENT, SPACING } from "../../../../../constants/gridConfig";
import { useTheme } from "../../../../../constants/theme";

// Vendor profile slice (already fetched by VendorEditProfile parent)
import { selectVendorProfile } from "../../../../../redux/vendorInfoSlice";

// Shipping settings slice (for save / own fetch)
import {
  clearShippingError,
  fetchMyShippingSettings,
  saveShippingSettings,
  selectShippingError,
  selectShippingExists,
  selectShippingLoading,
  selectShippingLocation,
  selectShippingSaving,
} from "../../../../../redux/shippingsettingSlice";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toStr(val) {
  if (val == null || val === "") return "";
  return String(val);
}

function buildFormFromSource(source) {
  return {
    warehouseAddress: source?.warehouseAddress || "",
    city: source?.city || "",
    state: source?.state || "",
    pincode: source?.pincode || "",
    country: source?.country || "India",
    latitude: source?.latitude != null ? toStr(source.latitude) : "",
    longitude: source?.longitude != null ? toStr(source.longitude) : "",
  };
}

function validate(form) {
  const errs = {};
  if (!form.warehouseAddress?.trim())
    errs.warehouseAddress = "Warehouse address is required";
  if (!form.city?.trim()) errs.city = "City is required";
  if (!form.state?.trim()) errs.state = "State is required";
  if (!form.pincode?.trim()) errs.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(form.pincode.trim()))
    errs.pincode = "Must be 6 digits";
  if (form.latitude && isNaN(Number(form.latitude)))
    errs.latitude = "Invalid latitude";
  if (form.longitude && isNaN(Number(form.longitude)))
    errs.longitude = "Invalid longitude";
  return errs;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, colors }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function InputField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  editable = true,
}) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            height: COMPONENT?.inputHeight || 50,
            backgroundColor: editable ? colors.inputBg : colors.surface,
            borderColor: error
              ? colors.error
              : focused
                ? colors.primary
                : colors.border,
            color: editable ? colors.text : colors.textMuted,
            borderRadius: radii.sm,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={editable}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function CoordField({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  radii,
  error,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.coordWrap}>
      <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.coordInput,
          {
            borderColor: error
              ? colors.error
              : focused
                ? colors.primary
                : colors.border,
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderRadius: radii.sm,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
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

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function ShippingSettings() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { colors, radii, shadows, isDark } = useTheme();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const vendorProfile = useSelector(selectVendorProfile); // full vendor doc
  const shippingRecord = useSelector(selectShippingLocation); // shipping slice
  const loading = useSelector(selectShippingLoading);
  const saving = useSelector(selectShippingSaving);
  const error = useSelector(selectShippingError);
  const storeExists = useSelector(selectShippingExists);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState(buildFormFromSource(null));
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialForm = useRef(null);
  const hydrated = useRef(false); // prevent double-hydration

  // ── Hydrate form ───────────────────────────────────────────────────────────
  // Priority: vendor profile's shippingLocations first (already in Redux from
  // the parent screen), then fall back to the dedicated shipping slice.
  useEffect(() => {
    if (hydrated.current) return;

    const vendorShipping = vendorProfile?.shippingLocations;
    const source = vendorShipping?.warehouseAddress
      ? vendorShipping // ← use vendor profile data (has real values)
      : shippingRecord; // ← fall back to shipping slice

    if (source) {
      const f = buildFormFromSource(source);
      setForm(f);
      initialForm.current = f;
      setIsDirty(false);
      hydrated.current = true;
    }
  }, [vendorProfile, shippingRecord]);

  // ── Fetch own shipping record if vendor profile has no data ───────────────
  useEffect(() => {
    const hasVendorData = !!vendorProfile?.shippingLocations?.warehouseAddress;
    if (!hasVendorData) {
      dispatch(fetchMyShippingSettings());
    }
  }, [dispatch, vendorProfile]);

  // ── Re-hydrate when shipping record arrives (if vendor profile was empty) ──
  useEffect(() => {
    if (hydrated.current) return;
    if (shippingRecord) {
      const f = buildFormFromSource(shippingRecord);
      setForm(f);
      initialForm.current = f;
      setIsDirty(false);
      hydrated.current = true;
    }
  }, [shippingRecord]);

  // ── Error alert ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => dispatch(clearShippingError()) },
      ]);
    }
  }, [error, dispatch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setIsDirty(true);
  }, []);

  const useCurrentLocation = useCallback(() => {
    setLocating(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleChange("latitude", String(pos.coords.latitude.toFixed(6)));
          handleChange("longitude", String(pos.coords.longitude.toFixed(6)));
          setLocating(false);
        },
        () => {
          Alert.alert(
            "Location Error",
            "Could not fetch location. Enter manually.",
          );
          setLocating(false);
        },
        { timeout: 10000 },
      );
    } else {
      Alert.alert("Not Available", "Enter coordinates manually.");
      setLocating(false);
    }
  }, [handleChange]);

  const handleSave = useCallback(() => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      warehouseAddress: form.warehouseAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim() || "India",
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };

    dispatch(saveShippingSettings(payload))
      .unwrap()
      .then(() => {
        setIsDirty(false);
        initialForm.current = form;
        Alert.alert("✓ Saved", "Shipping location updated successfully.");
      })
      .catch(() => {}); // handled via error selector
  }, [dispatch, form]);

  const handleDiscard = useCallback(() => {
    if (!isDirty) return;
    Alert.alert("Discard changes?", "Your unsaved changes will be lost.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          if (initialForm.current) {
            setForm(initialForm.current);
            setErrors({});
            setIsDirty(false);
          }
        },
      },
    ]);
  }, [isDirty]);

  // ── Loading state (only when no data at all yet) ───────────────────────────
  const hasNoData =
    !vendorProfile?.shippingLocations?.warehouseAddress && !shippingRecord;

  if (loading && hasNoData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading shipping info…
        </Text>
      </View>
    );
  }

  // ── Source label for the info row ──────────────────────────────────────────
  const dataSource = vendorProfile?.shippingLocations?.warehouseAddress
    ? "Loaded from your vendor profile"
    : "Loaded from shipping settings";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* ── Header ── */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.backBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Shipping Location
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {storeExists || vendorProfile?.shippingLocations?.warehouseAddress
                ? "Update your warehouse details"
                : "Set up your warehouse"}
            </Text>
          </View>

          {isDirty && (
            <TouchableOpacity onPress={handleDiscard} style={styles.discardBtn}>
              <Text style={[styles.discardText, { color: colors.textMuted }]}>
                Discard
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: SPACING.huge },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Status pill ── */}
          {(() => {
            const isConfigured =
              storeExists ||
              !!vendorProfile?.shippingLocations?.warehouseAddress;
            return (
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: isConfigured
                      ? colors.success + "18"
                      : colors.primary + "14",
                    borderColor: isConfigured
                      ? colors.success + "40"
                      : colors.primary + "30",
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isConfigured
                        ? colors.success
                        : colors.primary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isConfigured ? colors.success : colors.primary },
                  ]}
                >
                  {isConfigured ? dataSource : "Not configured yet"}
                </Text>
              </View>
            );
          })()}

          {/* ── Warehouse Address card ── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...shadows.sm,
              },
            ]}
          >
            <SectionHeader
              title="Warehouse Address"
              subtitle="Where your orders are dispatched from"
              colors={colors}
            />

            <InputField
              label="Street / Area"
              required
              value={form.warehouseAddress}
              onChangeText={(v) => handleChange("warehouseAddress", v)}
              placeholder="Building, street, locality"
              error={errors.warehouseAddress}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <InputField
                  label="City"
                  required
                  value={form.city}
                  onChangeText={(v) => handleChange("city", v)}
                  placeholder="e.g. Delhi"
                  error={errors.city}
                />
              </View>
              <View style={styles.half}>
                <InputField
                  label="State"
                  required
                  value={form.state}
                  onChangeText={(v) => handleChange("state", v)}
                  placeholder="e.g. Delhi"
                  error={errors.state}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <InputField
                  label="Pincode"
                  required
                  value={form.pincode}
                  onChangeText={(v) => handleChange("pincode", v)}
                  placeholder="6-digit pincode"
                  keyboardType="number-pad"
                  error={errors.pincode}
                />
              </View>
              <View style={styles.half}>
                <InputField
                  label="Country"
                  value={form.country}
                  onChangeText={(v) => handleChange("country", v)}
                  placeholder="India"
                />
              </View>
            </View>
          </View>

          {/* ── GPS Coordinates card ── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...shadows.sm,
              },
            ]}
          >
            <SectionHeader
              title="GPS Coordinates"
              subtitle="Help nearby customers discover you faster"
              colors={colors}
            />

            <TouchableOpacity
              onPress={useCurrentLocation}
              disabled={locating}
              activeOpacity={0.82}
              style={[
                styles.gpsBtn,
                {
                  backgroundColor: isDark
                    ? colors.primary + "20"
                    : colors.primary + "0F",
                  borderColor: colors.primary + "40",
                  borderRadius: radii.sm,
                },
              ]}
            >
              {locating ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <Text style={styles.gpsBtnIcon}>📍</Text>
                  <Text style={[styles.gpsBtnLabel, { color: colors.primary }]}>
                    Use my current location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={[styles.dividerRow, { marginVertical: SPACING.md }]}>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.orText, { color: colors.textMuted }]}>
                or enter manually
              </Text>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            </View>

            <View style={styles.coordRow}>
              <CoordField
                label="Latitude"
                value={form.latitude}
                onChangeText={(v) => handleChange("latitude", v)}
                placeholder="e.g. 28.6139"
                colors={colors}
                radii={radii}
                error={errors.latitude}
              />
              <CoordField
                label="Longitude"
                value={form.longitude}
                onChangeText={(v) => handleChange("longitude", v)}
                placeholder="e.g. 77.2090"
                colors={colors}
                radii={radii}
                error={errors.longitude}
              />
            </View>

            {form.latitude &&
              form.longitude &&
              !isNaN(Number(form.latitude)) && (
                <View
                  style={[
                    styles.coordPreview,
                    {
                      backgroundColor: colors.surface,
                      borderRadius: radii.sm,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.coordPreviewText,
                      { color: colors.textMuted },
                    ]}
                  >
                    📌 {Number(form.latitude).toFixed(4)},{" "}
                    {Number(form.longitude).toFixed(4)}
                  </Text>
                </View>
              )}
          </View>

          {/* ── Info banner ── */}
          <View
            style={[
              styles.infoBanner,
              {
                backgroundColor: isDark ? "#1A2A1A" : "#F0FAF0",
                borderColor: colors.success + "40",
              },
            ]}
          >
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Your warehouse location is used to calculate delivery estimates
              and show your store to nearby customers. It is not shown publicly.
            </Text>
          </View>
        </ScrollView>

        {/* ── Save Button ── */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "ios" ? SPACING.xxl : SPACING.lg,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !isDirty}
            activeOpacity={0.85}
            style={[
              styles.saveBtn,
              {
                backgroundColor:
                  saving || !isDirty ? colors.border : colors.primary,
                borderRadius: radii.md,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={[
                  styles.saveBtnText,
                  { color: saving || !isDirty ? colors.textMuted : "#fff" },
                ]}
              >
                Save location
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: { fontSize: 14, marginTop: SPACING.sm },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  headerSub: { fontSize: 13, marginTop: 2 },
  discardBtn: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  discardText: { fontSize: 14, fontWeight: "500" },

  scroll: { padding: SPACING.sm + 5, gap: SPACING.lg },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 999,
    borderWidth: 1,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },

  card: { borderWidth: 1, borderRadius: 16, padding: SPACING.xl },

  sectionHeader: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.1 },
  sectionSubtitle: { fontSize: 12, marginTop: 3, lineHeight: 16 },

  fieldWrap: { marginBottom: SPACING.md },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  input: { borderWidth: 1, paddingHorizontal: SPACING.md, fontSize: 14 },
  errorText: { fontSize: 11, marginTop: 4, fontWeight: "500" },

  row: { flexDirection: "row", gap: SPACING.md },
  half: { flex: 1 },

  gpsBtn: {
    height: 46,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  gpsBtnIcon: { fontSize: 16 },
  gpsBtnLabel: { fontSize: 14, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  orText: { fontSize: 11, fontWeight: "500" },

  coordRow: { flexDirection: "row", gap: SPACING.md },
  coordWrap: { flex: 1 },
  coordLabel: { fontSize: 11, fontWeight: "600", marginBottom: SPACING.xs },
  coordInput: {
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 44,
    fontSize: 13,
  },

  coordPreview: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  coordPreviewText: { fontSize: 12, fontWeight: "500" },

  infoBanner: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  saveBtn: {
    height: COMPONENT?.buttonHeight || 52,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
