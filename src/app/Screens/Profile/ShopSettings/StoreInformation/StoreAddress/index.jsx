import { useGridConfig } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import { selectVendorUser } from "@/redux/authSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { safeBack } from "../../../../../../utils/navigation";

const COUNTRIES = ["India", "United States", "United Kingdom", "Other"];

const MIN_RADIUS = 1;
const MAX_RADIUS = 50;
const RADIUS_STEP = 1;

const StoreAddress = () => {
  const { colors, typography, radii, shadows } = useTheme();
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

  // ── Form State ────────────────────────────────────────────────────────────
  const [shopNumber, setShopNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [deliveryRadius, setDeliveryRadius] = useState(5);

  const [locating, setLocating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ── Load existing store info on component mount ──────────────────────────
  useEffect(() => {
    if (vendorUser?._id && initialLoad) {
      // Dispatch the thunk to fetch store info
      dispatch(getMyStoreInformation());
      setInitialLoad(false);
    }
  }, [vendorUser?._id, dispatch, initialLoad]);

  // ── Populate form from fetched store info ────────────────────────────────
  useEffect(() => {
    if (storeInfo) {
      const addr = storeInfo.storeAddress || {};
      setShopNumber(addr.shopNumber || "");
      setStreet(addr.street || "");
      setLandmark(addr.landmark || "");
      setCity(addr.city || "");
      setState(addr.state || "");
      setPostalCode(addr.postalCode || "");
      setCountry(addr.country || COUNTRIES[0]);

      if (
        addr.googleMapLocation?.latitude &&
        addr.googleMapLocation?.longitude
      ) {
        setLatitude(addr.googleMapLocation.latitude);
        setLongitude(addr.googleMapLocation.longitude);
      }

      if (storeInfo.deliveryRadius != null) {
        setDeliveryRadius(storeInfo.deliveryRadius);
      }
    }
  }, [storeInfo]);

  const hasLocation = latitude != null && longitude != null;

  const locationLabel = useMemo(() => {
    if (!hasLocation) return "Not set";
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }, [hasLocation, latitude, longitude]);

  // ── Use current device location ──────────────────────────────────────────
  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Please allow location access to set your store's map pin.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    } catch (err) {
      Alert.alert(
        "Error",
        "Could not get your current location. Please try again.",
      );
      console.error("Location error:", err);
    } finally {
      setLocating(false);
    }
  };

  // ── Open native Maps app to drop / adjust a pin ──────────────────────────
  const handleOpenMaps = async () => {
    try {
      const hasCoords = hasLocation;
      const lat = hasCoords ? latitude : 0;
      const lng = hasCoords ? longitude : 0;

      const label = encodeURIComponent(storeInfo?.storeName || "My Store");
      const url = Platform.select({
        ios: hasCoords
          ? `maps:0,0?q=${label}@${lat},${lng}`
          : `maps:0,0?q=${label}`,
        android: hasCoords
          ? `geo:${lat},${lng}?q=${lat},${lng}(${label})`
          : `geo:0,0?q=${label}`,
      });

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = hasCoords
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          : `https://www.google.com/maps`;
        await Linking.openURL(webUrl);
      }

      if (!hasCoords) {
        Alert.alert(
          "Drop your pin",
          'Find your store in Maps, then come back and tap "Use Current Location" once you\'re physically there — or enter coordinates manually below.',
        );
      }
    } catch (err) {
      Alert.alert("Error", "Could not open Maps. Please try again.");
      console.error("Open maps error:", err);
    }
  };

  const handleManualCoordsChange = (text, axis) => {
    const num = text.trim() === "" ? null : Number(text);
    if (text.trim() !== "" && Number.isNaN(num)) return;
    if (axis === "lat") setLatitude(num);
    else setLongitude(num);
  };

  // ── Delivery radius controls ─────────────────────────────────────────────
  const decreaseRadius = () =>
    setDeliveryRadius((r) => Math.max(MIN_RADIUS, r - RADIUS_STEP));
  const increaseRadius = () =>
    setDeliveryRadius((r) => Math.min(MAX_RADIUS, r + RADIUS_STEP));

  const radiusPercent = useMemo(
    () => ((deliveryRadius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100,
    [deliveryRadius],
  );

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!street.trim()) {
      Alert.alert(
        "Street address required",
        "Please enter your street address.",
      );
      return false;
    }
    if (!city.trim()) {
      Alert.alert("City required", "Please enter your city.");
      return false;
    }
    if (!state.trim()) {
      Alert.alert("State required", "Please enter your state.");
      return false;
    }
    if (postalCode && !/^[0-9]{6}$/.test(postalCode.trim())) {
      Alert.alert("Invalid pincode", "Pincode must be exactly 6 digits.");
      return false;
    }
    return true;
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();

      const storeAddress = {
        shopNumber: shopNumber.trim(),
        street: street.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country,
        ...(hasLocation && {
          googleMapLocation: { latitude, longitude },
        }),
      };

      formData.append("storeAddress", JSON.stringify(storeAddress));
      formData.append("deliveryRadius", String(deliveryRadius));

      // If store exists, update it; otherwise create it
      const result = storeExists
        ? await dispatch(
            updateVendorStoreInformation({
              vendorId: vendorUser._id,
              formData,
            }),
          )
        : await dispatch(createVendorStoreInformation(formData));

      // Check if the async thunk succeeded
      const isSuccess = storeExists
        ? updateVendorStoreInformation.fulfilled.match(result)
        : createVendorStoreInformation.fulfilled.match(result);

      if (isSuccess) {
        Alert.alert(
          "Success",
          storeExists
            ? "Store address updated successfully."
            : "Store created successfully.",
          [
            {
              text: "OK",
              onPress: () => safeBack(router),
            },
          ],
        );
      } else {
        // The thunk returned a rejection
        Alert.alert(
          "Error",
          result.payload || "Failed to save store information.",
        );
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred while saving.");
      console.error("Save store address error:", err);
    }
  };

  // ── Initial loading state (first load) ────────────────────────────────────
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
            Loading store information...
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

      {/* Error from fetching/loading */}
      {error && (
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
            {error}
          </Text>
          <TouchableOpacity onPress={() => dispatch(clearError())}>
            <Ionicons name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Error from saving */}
      {saveError && (
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
            {saveError}
          </Text>
          <TouchableOpacity onPress={() => dispatch(clearError())}>
            <Ionicons name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Info card: Store not yet created */}
      {storeExists === false && (
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.secondary + "12",
              borderColor: colors.secondary + "30",
              marginHorizontal: horizontalPad * 2,
              marginTop: 12,
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
              styles.infoCardText,
              { color: colors.text, ...typography.bodyMedium },
            ]}
          >
            Complete your store profile by adding an address and delivery range.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
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
                <Ionicons name="location" size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.introTitle,
                    { color: colors.text, ...typography.bodyMedium },
                  ]}
                >
                  Help customers find you
                </Text>
                <Text
                  style={[
                    styles.introSub,
                    { color: colors.textSecondary, ...typography.caption },
                  ]}
                >
                  An accurate address and pin improve delivery accuracy and
                  search visibility.
                </Text>
              </View>
            </View>

            {/* ── Section: Address details ── */}
            <SectionLabel
              icon="document-text-outline"
              text="Address Details"
              colors={colors}
              typography={typography}
            />

            <View style={styles.row}>
              <Field
                label="Shop Number"
                flex={1}
                colors={colors}
                typography={typography}
              >
                <TextInput
                  value={shopNumber}
                  onChangeText={setShopNumber}
                  placeholder="e.g. 14B"
                  placeholderTextColor={colors.placeholder}
                  maxLength={30}
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
            </View>

            <Field
              label="Street Address"
              required
              colors={colors}
              typography={typography}
            >
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. MG Road, Sector 12"
                placeholderTextColor={colors.placeholder}
                maxLength={150}
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

            <Field label="Landmark" colors={colors} typography={typography}>
              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Near City Hospital"
                placeholderTextColor={colors.placeholder}
                maxLength={100}
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

            <View style={styles.row}>
              <Field
                label="City"
                required
                flex={1}
                colors={colors}
                typography={typography}
              >
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Delhi"
                  placeholderTextColor={colors.placeholder}
                  maxLength={60}
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
              <View style={{ width: 12 }} />
              <Field
                label="State"
                required
                flex={1}
                colors={colors}
                typography={typography}
              >
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="e.g. Delhi"
                  placeholderTextColor={colors.placeholder}
                  maxLength={60}
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
            </View>

            <View style={styles.row}>
              <Field
                label="Pincode"
                flex={1}
                colors={colors}
                typography={typography}
              >
                <TextInput
                  value={postalCode}
                  onChangeText={(t) => setPostalCode(t.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 110001"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={6}
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
              <View style={{ width: 12 }} />
              <Field
                label="Country"
                flex={1}
                colors={colors}
                typography={typography}
              >
                <TouchableOpacity
                  onPress={() => setCountryOpen((v) => !v)}
                  disabled={saving}
                  style={[
                    styles.input,
                    styles.dropdownInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      opacity: saving ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{ color: colors.text, ...typography.body }}
                    numberOfLines={1}
                  >
                    {country}
                  </Text>
                  <Ionicons
                    name={countryOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {countryOpen && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: radii.md,
                        ...shadows.sm,
                      },
                    ]}
                  >
                    {COUNTRIES.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => {
                          setCountry(c);
                          setCountryOpen(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text
                          style={{
                            color:
                              c === country ? colors.secondary : colors.text,
                            fontWeight: c === country ? "700" : "400",
                            ...typography.body,
                          }}
                        >
                          {c}
                        </Text>
                        {c === country && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={colors.secondary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Field>
            </View>

            {/* ── Section: Map location ── */}
            <SectionLabel
              icon="map-outline"
              text="Map Location"
              colors={colors}
              typography={typography}
              style={{ marginTop: 8 }}
            />

            <View
              style={[
                styles.mapCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <View style={styles.mapCardTop}>
                <View
                  style={[
                    styles.mapPinBadge,
                    {
                      backgroundColor: hasLocation
                        ? colors.secondary + "16"
                        : colors.textMuted + "14",
                    },
                  ]}
                >
                  <Ionicons
                    name={hasLocation ? "location" : "location-outline"}
                    size={18}
                    color={hasLocation ? colors.secondary : colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.mapStatusLabel,
                      { color: colors.text, ...typography.bodyMedium },
                    ]}
                  >
                    {hasLocation ? "Pin set" : "No pin set yet"}
                  </Text>
                  <Text
                    style={[
                      styles.mapStatusSub,
                      { color: colors.textMuted, ...typography.caption },
                    ]}
                  >
                    {locationLabel}
                  </Text>
                </View>
                {hasLocation && (
                  <TouchableOpacity
                    onPress={() => {
                      setLatitude(null);
                      setLongitude(null);
                    }}
                    disabled={saving}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={
                        saving ? colors.textMuted + "60" : colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.mapActionsRow}>
                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={locating || saving}
                  style={[
                    styles.mapActionBtn,
                    {
                      backgroundColor: colors.secondary,
                      opacity: locating || saving ? 0.7 : 1,
                    },
                  ]}
                >
                  {locating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={15} color="#fff" />
                      <Text style={styles.mapActionBtnTxt}>
                        Use Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenMaps}
                  disabled={saving}
                  style={[
                    styles.mapActionBtnOutline,
                    { borderColor: colors.border, opacity: saving ? 0.6 : 1 },
                  ]}
                >
                  <Ionicons name="map" size={15} color={colors.secondary} />
                  <Text
                    style={[
                      styles.mapActionBtnOutlineTxt,
                      { color: colors.secondary },
                    ]}
                  >
                    Open Maps
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Manual coordinate entry (fallback) ── */}
              <View style={styles.coordsRow}>
                <View style={styles.coordsField}>
                  <Text
                    style={[
                      styles.coordsLabel,
                      { color: colors.textMuted, ...typography.caption },
                    ]}
                  >
                    Latitude
                  </Text>
                  <TextInput
                    value={latitude != null ? String(latitude) : ""}
                    onChangeText={(t) => handleManualCoordsChange(t, "lat")}
                    placeholder="28.6139"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numbers-and-punctuation"
                    editable={!saving}
                    style={[
                      styles.coordsInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        opacity: saving ? 0.6 : 1,
                      },
                    ]}
                  />
                </View>
                <View style={{ width: 10 }} />
                <View style={styles.coordsField}>
                  <Text
                    style={[
                      styles.coordsLabel,
                      { color: colors.textMuted, ...typography.caption },
                    ]}
                  >
                    Longitude
                  </Text>
                  <TextInput
                    value={longitude != null ? String(longitude) : ""}
                    onChangeText={(t) => handleManualCoordsChange(t, "lng")}
                    placeholder="77.2090"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numbers-and-punctuation"
                    editable={!saving}
                    style={[
                      styles.coordsInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        opacity: saving ? 0.6 : 1,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ── Section: Delivery radius ── */}
            <SectionLabel
              icon="navigate-circle-outline"
              text="Delivery Radius"
              colors={colors}
              typography={typography}
              style={{ marginTop: 8 }}
            />

            <View
              style={[
                styles.radiusCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <View style={styles.radiusValueRow}>
                <Text
                  style={[
                    styles.radiusValue,
                    { color: colors.secondary, ...typography.heading2 },
                  ]}
                >
                  {deliveryRadius}
                  <Text
                    style={[
                      styles.radiusUnit,
                      { color: colors.textSecondary, ...typography.bodyMedium },
                    ]}
                  >
                    {" "}
                    km
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.radiusHint,
                    { color: colors.textMuted, ...typography.caption },
                  ]}
                >
                  Orders outside this range won't be shown to you
                </Text>
              </View>

              {/* Stepper */}
              <View style={styles.radiusStepperRow}>
                <TouchableOpacity
                  onPress={decreaseRadius}
                  disabled={deliveryRadius <= MIN_RADIUS || saving}
                  style={[
                    styles.stepperBtn,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      opacity: deliveryRadius <= MIN_RADIUS || saving ? 0.4 : 1,
                    },
                  ]}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>

                <View
                  style={[
                    styles.sliderTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.sliderFill,
                      {
                        width: `${radiusPercent}%`,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      {
                        left: `${radiusPercent}%`,
                        backgroundColor: colors.secondary,
                        borderColor: colors.background,
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  onPress={increaseRadius}
                  disabled={deliveryRadius >= MAX_RADIUS || saving}
                  style={[
                    styles.stepperBtn,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      opacity: deliveryRadius >= MAX_RADIUS || saving ? 0.4 : 1,
                    },
                  ]}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.radiusScaleRow}>
                <Text
                  style={[styles.radiusScaleTxt, { color: colors.textMuted }]}
                >
                  {MIN_RADIUS} km
                </Text>
                <Text
                  style={[styles.radiusScaleTxt, { color: colors.textMuted }]}
                >
                  {MAX_RADIUS} km
                </Text>
              </View>
            </View>

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
                Street, city, and state are required. Everything else can be
                added later.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

// ─── Shared header ────────────────────────────────────────────────────────────
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
        Store Address
      </Text>
      <Text
        style={[
          styles.headerSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Location & delivery range
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
      <Ionicons name="location" size={17} color={colors.secondary} />
    </View>
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
const Field = ({ label, children, colors, typography, required, flex }) => (
  <View style={[styles.field, flex ? { flex } : null]}>
    <Text
      style={[
        styles.fieldLabel,
        { color: colors.textSecondary, ...typography.label },
      ]}
    >
      {label}
      {required && <Text style={{ color: colors.error }}> *</Text>}
    </Text>
    {children}
  </View>
);

export default StoreAddress;

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

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoCardText: { flex: 1, fontSize: 13 },

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

  row: { flexDirection: "row" },

  field: { marginBottom: 18 },
  fieldLabel: { marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownMenu: { marginTop: 8, borderWidth: 1, overflow: "hidden" },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  mapCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 26,
    gap: 14,
  },
  mapCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  mapPinBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapStatusLabel: { fontWeight: "600" },
  mapStatusSub: { marginTop: 1 },
  mapActionsRow: { flexDirection: "row", gap: 10 },
  mapActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 12,
  },
  mapActionBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "600" },
  mapActionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  mapActionBtnOutlineTxt: { fontSize: 13, fontWeight: "600" },

  coordsRow: { flexDirection: "row" },
  coordsField: { flex: 1 },
  coordsLabel: { marginBottom: 6 },
  coordsInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },

  radiusCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 26,
  },
  radiusValueRow: { marginBottom: 16 },
  radiusValue: { fontWeight: "800" },
  radiusUnit: { fontWeight: "500" },
  radiusHint: { marginTop: 4 },
  radiusStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
    left: 0,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    marginLeft: -9,
  },
  radiusScaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  radiusScaleTxt: { fontSize: 11 },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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
