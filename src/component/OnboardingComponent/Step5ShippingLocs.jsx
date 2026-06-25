// Step5ShippingLocs.jsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

export default function Step5ShippingLocs({ formData, onChange, errors }) {
  const { colors, radii, isDark } = useTheme();
  const [locating, setLocating] = useState(false);

  const useCurrentLocation = () => {
    setLocating(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange("latitude", String(pos.coords.latitude.toFixed(4)));
          onChange("longitude", String(pos.coords.longitude.toFixed(4)));
          setLocating(false);
        },
        () => {
          Alert.alert(
            "Location Error",
            "Could not fetch location. Please enter manually.",
          );
          setLocating(false);
        },
      );
    } else {
      Alert.alert(
        "Geolocation",
        "Enter coordinates manually or install expo-location.",
      );
      setLocating(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Shipping Locations
      </Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Enter your warehouse and shipping address details
      </Text>

      <FormInput
        label="Warehouse Address"
        required
        value={formData.warehouseAddress}
        onChangeText={(v) => onChange("warehouseAddress", v)}
        placeholder="Building, street, area"
        error={errors?.warehouseAddress}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <FormInput
            label="City"
            required
            value={formData.warehouseCity}
            onChangeText={(v) => onChange("warehouseCity", v)}
            placeholder="e.g. Delhi"
            error={errors?.warehouseCity}
          />
        </View>
        <View style={styles.half}>
          <FormInput
            label="State"
            required
            value={formData.warehouseState}
            onChangeText={(v) => onChange("warehouseState", v)}
            placeholder="e.g. Delhi"
            error={errors?.warehouseState}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <FormInput
            label="Pincode"
            required
            value={formData.warehousePincode}
            onChangeText={(v) => onChange("warehousePincode", v)}
            placeholder="e.g. 110001"
            keyboardType="number-pad"
            error={errors?.warehousePincode}
          />
        </View>
        <View style={styles.half} />
      </View>

      {/* GPS Section */}
      <View
        style={[
          styles.gpsCard,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#F9FAFB",
            borderColor: colors.border || "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View style={styles.gpsHeader}>
          <Text style={{ fontSize: 16 }}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsTitle, { color: colors.text }]}>
              GPS Location
            </Text>
            <Text style={[styles.gpsSub, { color: colors.textSecondary }]}>
              Add your warehouse coordinates so nearby customers can discover
              your products easily.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={useCurrentLocation}
          disabled={locating}
          activeOpacity={0.8}
          style={[
            styles.gpsBtn,
            { backgroundColor: colors.secondary, borderRadius: radii.s || 8 },
          ]}
        >
          {locating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.gpsBtnText}>Use current location</Text>
          )}
        </TouchableOpacity>

        <View style={styles.gpsRow}>
          <View style={styles.coordField}>
            <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>
              Latitude
            </Text>
            <TextInput
              style={[
                styles.coordInput,
                {
                  borderColor: colors.border || "rgba(0,0,0,0.1)",
                  backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
                  color: colors.text,
                  borderRadius: radii.s || 6,
                },
              ]}
              placeholder="e.g. 28.6139"
              placeholderTextColor={colors.placeholder}
              value={formData.latitude}
              onChangeText={(v) => onChange("latitude", v)}
              keyboardType="decimal-pad"
              autoCorrect={false}
            />
          </View>

          <View style={styles.coordField}>
            <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>
              Longitude
            </Text>
            <TextInput
              style={[
                styles.coordInput,
                {
                  borderColor: colors.border || "rgba(0,0,0,0.1)",
                  backgroundColor: colors.inputBg || "rgba(0,0,0,0.02)",
                  color: colors.text,
                  borderRadius: radii.s || 6,
                },
              ]}
              placeholder="e.g. 77.2090"
              placeholderTextColor={colors.placeholder}
              value={formData.longitude}
              onChangeText={(v) => onChange("longitude", v)}
              keyboardType="decimal-pad"
              autoCorrect={false}
            />
          </View>
        </View>
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
  gpsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  gpsHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  gpsTitle: { fontSize: 14, fontWeight: "700", letterSpacing: -0.1 },
  gpsSub: { fontSize: 12, marginTop: 3, lineHeight: 17, opacity: 0.9 },
  gpsBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  gpsBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coordField: { flex: 1 },
  coordLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.8,
  },
  coordInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
  },
});
