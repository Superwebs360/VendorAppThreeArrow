import { SPACING, useGridConfig } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import { selectVendorUser } from "@/redux/authSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  selectStoreError,
  selectStoreInfo,
  selectStoreLoading,
  updateVendorStoreInformation,
} from "../../../../../../redux/vendorstoreinformationSlice";

const CATEGORIES = [
  "Grocery",
  "Fashion",
  "Electronics",
  "Home & Living",
  "Beauty",
  "Food & Beverage",
];

const StoreProfile = () => {
  const { colors, typography, radii, shadows } = useTheme();
  const { horizontalPad } = useGridConfig();
  const router = useRouter();
  const dispatch = useDispatch();

  const vendorUser = useSelector(selectVendorUser);
  const storeInfo = useSelector(selectStoreInfo);
  const loading = useSelector(selectStoreLoading);
  const error = useSelector(selectStoreError);

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isOpen, setIsOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (vendorUser?._id && initialLoad) {
      dispatch(getMyStoreInformation());
      setInitialLoad(false);
    }
  }, [vendorUser?._id, dispatch, initialLoad]);

  useEffect(() => {
    if (storeInfo) {
      setStoreName(storeInfo.storeName || "");
      setBrandName(storeInfo.brandName || "");
      setDescription(storeInfo.storeDescription || "");

      if (storeInfo.category && CATEGORIES.includes(storeInfo.category)) {
        setCategory(storeInfo.category);
      }

      setIsOpen(storeInfo.isActive !== false);

      if (storeInfo.storeLogo?.url) {
        setLogo(storeInfo.storeLogo.url);
      }
      if (storeInfo.storeBanner?.url) {
        setBanner(storeInfo.storeBanner.url);
      }
    }
  }, [storeInfo]);

  const pickImage = async (setter, aspect) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsEditing: true,
        aspect,
      });
      if (!result.canceled && result.assets?.[0]) {
        setter(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Image picker error:", err);
    }
  };

  const handleSave = async () => {
    if (!storeName.trim()) {
      Alert.alert("Store name required", "Please enter your store name.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      Alert.alert(
        "Description too short",
        "Please enter at least 10 characters describing your store.",
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("storeName", storeName);
      formData.append("brandName", brandName);
      formData.append("storeDescription", description);
      formData.append("category", category);
      formData.append("isActive", isOpen ? "true" : "false");

      if (logo && logo.uri && !logo.uri.startsWith("http")) {
        formData.append("storeLogo", {
          uri: logo.uri,
          type: logo.mimeType || "image/jpeg",
          name: logo.fileName || `logo-${Date.now()}.jpg`,
        });
      }

      if (banner && banner.uri && !banner.uri.startsWith("http")) {
        formData.append("storeBanner", {
          uri: banner.uri,
          type: banner.mimeType || "image/jpeg",
          name: banner.fileName || `banner-${Date.now()}.jpg`,
        });
      }

      const result = storeInfo
        ? await dispatch(
            updateVendorStoreInformation({
              vendorId: vendorUser._id,
              formData,
            }),
          )
        : await dispatch(createVendorStoreInformation(formData));

      const isSuccess = storeInfo
        ? updateVendorStoreInformation.fulfilled.match(result)
        : createVendorStoreInformation.fulfilled.match(result);

      if (isSuccess) {
        Alert.alert("Saved", "Store profile updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", result.payload || "Failed to save store profile.");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred while saving.");
      console.error("Save store profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !storeInfo && !initialLoad && !error) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
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
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text, ...typography.heading3 },
            ]}
          >
            Store Profile
          </Text>
        </View>

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
            Store Profile
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: colors.textSecondary, ...typography.caption },
            ]}
          >
            Name, logo & description
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
          <Ionicons name="storefront" size={17} color={colors.secondary} />
        </View>
      </View>

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={styles.heroWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => pickImage(setBanner, [16, 7])}
              style={[styles.banner, { backgroundColor: colors.surface }]}
            >
              {banner ? (
                <Image
                  source={{
                    uri: typeof banner === "string" ? banner : banner.uri,
                  }}
                  style={styles.bannerImg}
                />
              ) : (
                <View
                  style={[
                    styles.bannerPlaceholder,
                    { backgroundColor: colors.secondary + "12" },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={26}
                    color={colors.secondary}
                  />
                  <Text
                    style={[
                      styles.bannerHint,
                      { color: colors.secondary, ...typography.caption },
                    ]}
                  >
                    Add store banner
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.bannerEditBadge,
                  { backgroundColor: colors.text + "B3" },
                ]}
              >
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => pickImage(setLogo, [1, 1])}
              style={[
                styles.logoWrap,
                {
                  borderColor: colors.background,
                  backgroundColor: colors.card,
                  ...shadows.md,
                },
              ]}
            >
              {logo ? (
                <Image
                  source={{
                    uri: typeof logo === "string" ? logo : logo.uri,
                  }}
                  style={styles.logoImg}
                />
              ) : (
                <View
                  style={[
                    styles.logoPlaceholder,
                    { backgroundColor: colors.secondary + "15" },
                  ]}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={26}
                    color={colors.secondary}
                  />
                </View>
              )}
              <View
                style={[
                  styles.logoEditBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Ionicons name="camera" size={11} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.body, { paddingHorizontal: horizontalPad * 2 }]}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    ...shadows.sm,
                  },
                ]}
              >
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isOpen
                          ? colors.secondary
                          : colors.error,
                      },
                    ]}
                  />
                  <View>
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: colors.text, ...typography.bodyMedium },
                      ]}
                    >
                      {isOpen ? "Store Open" : "Store Closed"}
                    </Text>
                    <Text
                      style={[
                        styles.statusSub,
                        { color: colors.textMuted, ...typography.caption },
                      ]}
                    >
                      Visible to customers
                    </Text>
                  </View>
                </View>
                <View style={{ marginRight: 10 }}>
                  <Switch
                    value={isOpen}
                    onValueChange={setIsOpen}
                    trackColor={{
                      false: colors.border,
                      true: colors.secondary + "90",
                    }}
                    thumbColor={isOpen ? colors.secondary : colors.textMuted}
                  />
                </View>
              </View>

              {storeInfo?.isVerified && (
                <View
                  style={[
                    styles.verifiedCard,
                    {
                      backgroundColor: colors.secondary + "12",
                      borderColor: colors.secondary + "35",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text
                    style={[
                      styles.verifiedTxt,
                      { color: colors.secondary, ...typography.caption },
                    ]}
                  >
                    Verified Seller
                  </Text>
                </View>
              )}
            </View>

            <Field
              label="Store Name"
              colors={colors}
              typography={typography}
              radii={radii}
            >
              <TextInput
                value={storeName}
                onChangeText={setStoreName}
                placeholder="e.g. Arbaj General Store"
                placeholderTextColor={colors.placeholder}
                maxLength={100}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              />
            </Field>

            <Field
              label="Brand Name"
              colors={colors}
              typography={typography}
              radii={radii}
            >
              <TextInput
                value={brandName}
                onChangeText={setBrandName}
                placeholder="e.g. ThreeArrow"
                placeholderTextColor={colors.placeholder}
                maxLength={100}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              />
            </Field>

            <Field
              label="Store Category"
              colors={colors}
              typography={typography}
              radii={radii}
            >
              <TouchableOpacity
                onPress={() => setCategoryOpen((v) => !v)}
                style={[
                  styles.input,
                  styles.dropdownInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: colors.text, ...typography.body }}>
                  {category}
                </Text>
                <Ionicons
                  name={categoryOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {categoryOpen && (
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
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => {
                        setCategory(c);
                        setCategoryOpen(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text
                        style={{
                          color:
                            c === category ? colors.secondary : colors.text,
                          fontWeight: c === category ? "700" : "400",
                          ...typography.body,
                        }}
                      >
                        {c}
                      </Text>
                      {c === category && (
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

            <Field
              label="Store Description"
              colors={colors}
              typography={typography}
              radii={radii}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tell customers what makes your store special..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={4}
                maxLength={300}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              />
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {description.length}/300
              </Text>
            </Field>

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
                Changes will be saved to your profile and visible to customers.
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
          disabled={saving || loading}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.secondary,
              opacity: saving || loading ? 0.7 : 1,
              ...shadows.secondary,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
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

const Field = ({ label, children, colors, typography }) => (
  <View style={styles.field}>
    <Text
      style={[
        styles.fieldLabel,
        { color: colors.textSecondary, ...typography.label },
      ]}
    >
      {label}
    </Text>
    {children}
  </View>
);

export default StoreProfile;

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
  loadingText: {
    fontSize: 14,
  },
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
  errorText: {
    fontSize: 13,
    fontWeight: "500",
  },

  heroWrap: { marginBottom: 44 },
  banner: { width: "100%", height: 150, overflow: "hidden" },
  bannerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bannerHint: { fontWeight: "600" },
  bannerEditBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    position: "absolute",
    bottom: -36,
    left: SPACING.xxl,
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: { width: "100%", height: "100%", resizeMode: "cover" },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  body: { gap: 4 },

  statusRow: { flexDirection: "row", gap: 2, marginBottom: 28 },
  statusCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: -10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusLabel: { fontWeight: "600" },
  statusSub: { marginTop: 1 },
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  verifiedTxt: { fontWeight: "700" },

  field: { marginBottom: 22 },
  fieldLabel: { marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: { minHeight: 96, textAlignVertical: "top" },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 6 },
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

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
  },

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
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnTxt: { color: "#fff" },
});
