// component/ProfileComponent/EditProfileComponent/VendorEditProfile.js

import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  interpolate,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { safeBack } from "../../../../utils/navigation";

import {
  fetchMyVendorProfile,
  selectVendorProfile,
} from "@/redux/vendorInfoSlice";
import CameraOverlay from "../../../../component/ProfileComponent/EditProfileComponent/CameraOverlay";
import FieldModal from "../../../../component/ProfileComponent/EditProfileComponent/FieldModal";
import KycModal from "../../../../component/ProfileComponent/EditProfileComponent/KycModal";
import SignatureModal from "../../../../component/ProfileComponent/EditProfileComponent/SignatureModal";
import {
  BANK_FIELDS,
  BRAND_FIELDS,
  BUSINESS_FIELDS,
  SECTIONS,
  SELLER_FIELDS,
  SHIPPING_FIELDS,
} from "../../../../component/ProfileComponent/EditProfileComponent/filedConfigs";
import {
  clearSuccessMessage,
  clearUpdateError,
  removeKycDocument,
  selectSuccessMessage,
  selectUpdateError,
  selectUpdateStatus,
  selectUploadStatus,
  updateVendorSection,
  updateVendorSignature,
  uploadKycAvatar,
  uploadKycDocument,
} from "../../../../redux/vendorUpdateSlice";

// Premium Scale Feedback Wrapper Component
const ScaleTouchable = ({ children, onPress, style, activeOpacity = 0.9 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(0.97, { duration: 120 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[style]}
    >
      <Animated.View style={[animatedStyle, styles.flexRowFull]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const VendorEditProfile = () => {
  const { colors, typography, shadows } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const borderOpacity = interpolate(scrollY.value, [0, 40], [0, 1], "clamp");
    return {
      borderBottomColor: `rgba(224, 224, 224, ${borderOpacity})`,
      elevation: interpolate(scrollY.value, [0, 50], [0, 3], "clamp"),
      shadowOpacity: interpolate(scrollY.value, [0, 50], [0, 0.06], "clamp"),
    };
  });

  const vendor = useSelector(selectVendorProfile);
  const updateStatus = useSelector(selectUpdateStatus);
  const uploadStatus = useSelector(selectUploadStatus);
  const updateError = useSelector(selectUpdateError);
  const successMessage = useSelector(selectSuccessMessage);

  const [activeModal, setActiveModal] = useState(null);
  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  const [businessDetails, setBusinessDetails] = useState({});
  const [sellerDetails, setSellerDetails] = useState({});
  const [brandDetails, setBrandDetails] = useState({});
  const [bankDetails, setBankDetails] = useState({});
  const [shippingLocations, setShippingLocations] = useState({});
  const [kycDetails, setKycDetails] = useState({
    avatarUrl: null,
    documents: { aadhaar: null, drivingLicence: null },
  });
  const [digitalSignature, setDigitalSignature] = useState({
    signed: false,
    signatureDate: null,
  });

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState("front");
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  const [docUploading, setDocUploading] = useState({});

  useEffect(() => {
    if (vendor) {
      setBusinessDetails(vendor.businessDetails || {});
      setSellerDetails(vendor.sellerDetails || {});
      setBrandDetails(vendor.brandDetails || {});
      setBankDetails(vendor.bankDetails || {});
      setShippingLocations(vendor.shippingLocations || {});
      setKycDetails(vendor.kycDetails || { avatarUrl: null, documents: {} });
      setDigitalSignature(
        vendor.digitalSignature || { signed: false, signatureDate: null },
      );
    }
  }, [vendor]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert("✓ Saved", successMessage, [{ text: "OK" }]);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (updateError) {
      Alert.alert("Error", updateError, [{ text: "OK" }]);
      dispatch(clearUpdateError());
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    dispatch(fetchMyVendorProfile());
  }, []);

  const makeSetter = (setter) => (key, val) =>
    setter((prev) => ({ ...prev, [key]: val }));

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission needed", "Allow camera access to take photos.");
        return;
      }
    }
    setCameraOpen(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      const formData = new FormData();
      formData.append("avatar", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      });

      await dispatch(uploadKycAvatar(formData));
      setCameraOpen(false);
    } catch (error) {
      Alert.alert("Error", "Could not capture photo. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  const pickDocument = async (key) => {
    setDocUploading((p) => ({ ...p, [key]: true }));
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsEditing: true,
        aspect: [16, 10],
      });

      if (!result.canceled && result.assets?.[0]) {
        const formData = new FormData();
        formData.append("document", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: `${key}.jpg`,
        });

        await dispatch(uploadKycDocument({ formData, docType: key }));
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick image. Please try again.");
    } finally {
      setDocUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const removeDoc = async (key) => {
    try {
      await dispatch(removeKycDocument(key));
    } catch (error) {
      Alert.alert("Error", "Could not remove document.");
    }
  };

  const handleSaveSection = async (sectionKey, sectionData) => {
    const result = await dispatch(
      updateVendorSection({ sectionKey, data: sectionData }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      closeModal();
    }
  };

  const handleSaveSignature = async (newValue) => {
    const result = await dispatch(updateVendorSignature(newValue));
    if (result.meta.requestStatus === "fulfilled") {
      closeModal();
    }
  };

  const getSummary = (key) => {
    switch (key) {
      case "business":
        return businessDetails.businessName || "Not set";
      case "seller":
        return sellerDetails.sellerName || "Not set";
      case "brand":
        return brandDetails.brandName || "Not set";
      case "bank":
        return bankDetails.bankName || "Not set";
      case "shipping":
        return shippingLocations.city
          ? `${shippingLocations.city}, ${shippingLocations.state}`
          : "Not set";
      case "kyc":
        return kycDetails?.avatarUrl ? "Photo & docs uploaded" : "Incomplete";
      case "signature":
        return digitalSignature.signed
          ? `Signed · ${new Date(digitalSignature.signatureDate).toLocaleDateString()}`
          : "Not signed";
      default:
        return "";
    }
  };

  if (cameraOpen) {
    return (
      <CameraOverlay
        cameraRef={cameraRef}
        facing={facing}
        capturing={capturing}
        onClose={() => setCameraOpen(false)}
        onFlip={() => setFacing((f) => (f === "front" ? "back" : "front"))}
        onCapture={capturePhoto}
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: colors.background },
          animatedHeaderStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => safeBack(router)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[
            styles.backBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            numberOfLines={1}
            style={[styles.pageTitle, { color: colors.text, ...typography.h3 }]}
          >
            {sellerDetails.sellerName || "Vendor Profile"}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: colors.secondary + "12" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: colors.secondary }]}
            />
            <Text style={[styles.statusTxt, { color: colors.secondary }]}>
              {vendor?.status === "approved" ? "Verified" : "Pending"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.shieldBadge,
            {
              backgroundColor: colors.secondary + "12",
              borderColor: colors.secondary + "25",
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.secondary}
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <ScaleTouchable
            onPress={() => openModal("kyc")}
            style={[
              styles.avatarRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                ...shadows.sm,
              },
            ]}
          >
            {kycDetails?.avatarUrl ? (
              <Image
                source={{ uri: kycDetails.avatarUrl }}
                style={[styles.avatarImg, { borderColor: colors.secondary }]}
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: colors.secondary + "15" },
                ]}
              >
                <Ionicons name="person" size={30} color={colors.secondary} />
              </View>
            )}
            <View style={styles.avatarInfo}>
              <Text
                style={[
                  styles.avatarName,
                  { color: colors.text, ...typography.h4 },
                ]}
              >
                {sellerDetails.sellerName || "Your Name"}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.avatarBiz,
                  { color: colors.textSecondary, ...typography.caption },
                ]}
              >
                {businessDetails.businessName || "Business name not set"}
              </Text>
            </View>
            <View
              style={[styles.editBadge, { backgroundColor: colors.secondary }]}
            >
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </ScaleTouchable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          layout={LinearTransition.springify().damping(22)}
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              ...shadows.sm,
            },
          ]}
        >
          {SECTIONS.map((s, i) => (
            <React.Fragment key={s.key}>
              <ScaleTouchable
                onPress={() => openModal(s.key)}
                style={styles.sectionRow}
              >
                <View
                  style={[
                    styles.sectionIconWrap,
                    { backgroundColor: colors.secondary + "12" },
                  ]}
                >
                  <Ionicons name={s.icon} size={18} color={colors.secondary} />
                </View>
                <View style={styles.sectionText}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: colors.text, ...typography.body1 },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.sectionSummary,
                      { color: colors.textSecondary, ...typography.caption },
                    ]}
                  >
                    {getSummary(s.key)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                  style={styles.chevronRight}
                />
              </ScaleTouchable>
              {i < SECTIONS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </React.Fragment>
          ))}
        </Animated.View>
      </Animated.ScrollView>

      <FieldModal
        visible={activeModal === "business"}
        onClose={closeModal}
        title="Business Details"
        icon="storefront-outline"
        fields={BUSINESS_FIELDS}
        values={businessDetails}
        onChange={makeSetter(setBusinessDetails)}
        onSave={() => handleSaveSection("business", businessDetails)}
        isSaving={updateStatus === "loading"}
      />
      <FieldModal
        visible={activeModal === "seller"}
        onClose={closeModal}
        title="Seller Details"
        icon="person-outline"
        fields={SELLER_FIELDS}
        values={sellerDetails}
        onChange={makeSetter(setSellerDetails)}
        onSave={() => handleSaveSection("seller", sellerDetails)}
        isSaving={updateStatus === "loading"}
      />
      <FieldModal
        visible={activeModal === "brand"}
        onClose={closeModal}
        title="Brand Details"
        icon="ribbon-outline"
        fields={BRAND_FIELDS}
        values={brandDetails}
        onChange={makeSetter(setBrandDetails)}
        onSave={() => handleSaveSection("brand", brandDetails)}
        isSaving={updateStatus === "loading"}
      />
      <FieldModal
        visible={activeModal === "bank"}
        onClose={closeModal}
        title="Bank Details"
        icon="card-outline"
        fields={BANK_FIELDS}
        values={bankDetails}
        onChange={makeSetter(setBankDetails)}
        onSave={() => handleSaveSection("bank", bankDetails)}
        warning="Your bank details are encrypted and stored securely."
        isSaving={updateStatus === "loading"}
      />
      <FieldModal
        visible={activeModal === "shipping"}
        onClose={closeModal}
        title="Shipping / Warehouse"
        icon="cube-outline"
        fields={SHIPPING_FIELDS}
        values={shippingLocations}
        onChange={makeSetter(setShippingLocations)}
        onSave={() => handleSaveSection("shipping", shippingLocations)}
        isSaving={updateStatus === "loading"}
      />
      <KycModal
        visible={activeModal === "kyc"}
        onClose={closeModal}
        kycDetails={kycDetails}
        docUploading={docUploading}
        onOpenCamera={openCamera}
        onRetake={() => {
          setKycDetails((p) => ({ ...p, avatarUrl: null }));
          openCamera();
        }}
        onPickDoc={pickDocument}
        onRemoveDoc={removeDoc}
      />
      <SignatureModal
        visible={activeModal === "signature"}
        onClose={closeModal}
        value={digitalSignature}
        onChange={(newValue) => {
          setDigitalSignature(newValue);
          handleSaveSignature(newValue);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flexRowFull: { flexDirection: "row", alignItems: "center", flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 3 },
  pageTitle: { fontWeight: "700", letterSpacing: 0.2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  shieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  avatarImg: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5 },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInfo: { flex: 1 },
  avatarName: { fontWeight: "700", marginBottom: 2 },
  avatarBiz: { opacity: 0.7, paddingRight: 8 },
  editBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionText: { flex: 1 },
  sectionLabel: { fontWeight: "600", marginBottom: 2 },
  sectionSummary: { opacity: 0.55 },
  chevronRight: { opacity: 0.8 },
  divider: { height: 1, marginLeft: 72, opacity: 0.6 },
});

export default VendorEditProfile;
