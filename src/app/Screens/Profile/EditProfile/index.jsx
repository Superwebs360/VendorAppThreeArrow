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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

const VendorEditProfile = () => {
  const { colors, typography, shadows } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────────────────────
  const vendor = useSelector(selectVendorProfile);
  const updateStatus = useSelector(selectUpdateStatus);
  const uploadStatus = useSelector(selectUploadStatus);
  const updateError = useSelector(selectUpdateError);
  const successMessage = useSelector(selectSuccessMessage);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  // ── Local form state (mirrors schema) ─────────────────────────────────────
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

  // ── Camera ─────────────────────────────────────────────────────────────────
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState("front");
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  const [docUploading, setDocUploading] = useState({});

  // ── Seed local state from Redux vendor on mount / vendor change ────────────
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

  // ── Success / error toasts ─────────────────────────────────────────────────
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

  // ── Field setter factory ───────────────────────────────────────────────────
  const makeSetter = (setter) => (key, val) =>
    setter((prev) => ({ ...prev, [key]: val }));

  // ── Camera handlers ────────────────────────────────────────────────────────
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
      console.log("[VendorEditProfile] Uploading avatar →", photo.uri);

      const formData = new FormData();
      formData.append("avatar", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      });

      const result = await dispatch(uploadKycAvatar(formData));
      console.log("[VendorEditProfile] Avatar dispatch result →", result);
      setCameraOpen(false);
    } catch (error) {
      console.error("[VendorEditProfile] capturePhoto error →", error);
      Alert.alert("Error", "Could not capture photo. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  // ── Document picker ────────────────────────────────────────────────────────
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
        console.log(
          `[VendorEditProfile] Uploading doc "${key}" →`,
          result.assets[0].uri,
        );

        const formData = new FormData();
        formData.append("document", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: `${key}.jpg`,
        });
        // NOTE: docType is appended inside the thunk to avoid double-append

        const dispatchResult = await dispatch(
          uploadKycDocument({ formData, docType: key }),
        );
        console.log(
          "[VendorEditProfile] Doc dispatch result →",
          dispatchResult,
        );
      }
    } catch (error) {
      console.error("[VendorEditProfile] pickDocument error →", error);
      Alert.alert("Error", "Could not pick image. Please try again.");
    } finally {
      setDocUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const removeDoc = async (key) => {
    try {
      const result = await dispatch(removeKycDocument(key));
      console.log("[VendorEditProfile] removeDoc result →", result);
    } catch (error) {
      Alert.alert("Error", "Could not remove document.");
    }
  };

  // ── Section save ───────────────────────────────────────────────────────────
  const handleSaveSection = async (sectionKey, sectionData) => {
    console.log("──────────────────────────────────────");
    console.log(`[VendorEditProfile] Saving section: "${sectionKey}"`);
    console.log(
      "[VendorEditProfile] Payload →",
      JSON.stringify(sectionData, null, 2),
    );
    console.log("──────────────────────────────────────");

    const result = await dispatch(
      updateVendorSection({ sectionKey, data: sectionData }),
    );

    console.log("[VendorEditProfile] Dispatch result →", result);

    // Only close modal on success
    if (result.meta.requestStatus === "fulfilled") {
      closeModal();
    }
  };

  // BUG FIX: handleSaveSignature now accepts the NEW value directly
  // instead of reading digitalSignature state (which hasn't updated yet)
  const handleSaveSignature = async (newValue) => {
    console.log("[VendorEditProfile] Saving signature →", newValue);

    const result = await dispatch(updateVendorSignature(newValue));
    console.log("[VendorEditProfile] Signature dispatch result →", result);

    if (result.meta.requestStatus === "fulfilled") {
      closeModal();
    }
  };

  // ── Summary per section ────────────────────────────────────────────────────
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
        return kycDetails?.avatarUrl
          ? "Photo + documents uploaded"
          : "Incomplete";
      case "signature":
        return digitalSignature.signed
          ? `Signed · ${new Date(digitalSignature.signatureDate).toLocaleDateString()}`
          : "Not signed";
      default:
        return "";
    }
  };

  // ── Camera overlay ─────────────────────────────────────────────────────────
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

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
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
            style={[styles.pageTitle, { color: colors.text, ...typography.h3 }]}
          >
            {sellerDetails.sellerName || "Vendor Profile"}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: colors.secondary + "18" },
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
              backgroundColor: colors.secondary + "15",
              borderColor: colors.secondary + "35",
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.secondary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Avatar row */}
        <TouchableOpacity
          onPress={() => openModal("kyc")}
          activeOpacity={0.85}
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
                { backgroundColor: colors.secondary + "18" },
              ]}
            >
              <Ionicons name="person" size={32} color={colors.secondary} />
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
        </TouchableOpacity>

        {/* Sections */}
        <View
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
              <TouchableOpacity
                onPress={() => openModal(s.key)}
                activeOpacity={0.7}
                style={styles.sectionRow}
              >
                <View
                  style={[
                    styles.sectionIconWrap,
                    { backgroundColor: colors.secondary + "15" },
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
                />
              </TouchableOpacity>
              {i < SECTIONS.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* ── Modals ── */}

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

      {/* BUG FIX: pass newValue into handleSaveSignature directly
          (don't call handleSaveSignature() with no args — digitalSignature
          state hasn't updated yet when onChange fires) */}
      <SignatureModal
        visible={activeModal === "signature"}
        onClose={closeModal}
        value={digitalSignature}
        onChange={(newValue) => {
          setDigitalSignature(newValue);
          handleSaveSignature(newValue); // ← pass newValue, not stale state
        }}
      />
    </View>
  );
};

export default VendorEditProfile;

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingBottom: 14,
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
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
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
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  avatarImg: { width: 64, height: 64, borderRadius: 32, borderWidth: 2 },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInfo: { flex: 1 },
  avatarName: { fontWeight: "700", marginBottom: 2 },
  avatarBiz: { opacity: 0.7 },
  editBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  sectionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionText: { flex: 1 },
  sectionLabel: { fontWeight: "600", marginBottom: 2 },
  sectionSummary: { opacity: 0.65 },
  divider: { height: 1, marginLeft: 66 },
});
