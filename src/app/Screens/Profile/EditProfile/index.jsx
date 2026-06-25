import { useTheme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Document card config ────────────────────────────────────────────────────
const DOCUMENTS = [
  {
    key: "aadhaar",
    label: "Aadhaar Card",
    icon: "card-account-details-outline",
    hint: "Front side · Clear & unobstructed",
  },
  {
    key: "drivingLicence",
    label: "Driving Licence",
    icon: "car-outline",
    hint: "Front side · All details visible",
  },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
const VendorIdentityScreen = () => {
  const { colors, typography, radii, shadows } = useTheme();

  // Camera
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState("front");
  const [avatar, setAvatar] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  // Documents
  const [docs, setDocs] = useState({ aadhaar: null, drivingLicence: null });
  const [uploading, setUploading] = useState({});

  // ── Avatar ────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission needed",
          "Allow camera access to take a photo.",
        );
        return;
      }
    }
    setCameraOpen(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        skipProcessing: false,
      });
      setAvatar(photo.uri);
      setCameraOpen(false);
    } catch (e) {
      Alert.alert("Error", "Could not capture photo. Try again.");
    } finally {
      setCapturing(false);
    }
  };

  const retakeAvatar = () => {
    setAvatar(null);
    setCameraOpen(true);
  };

  // ── Documents ─────────────────────────────────────────────────────────────
  const pickDocument = async (key) => {
    setUploading((p) => ({ ...p, [key]: true }));
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [16, 10],
      });
      if (!result.canceled && result.assets?.[0]) {
        setDocs((p) => ({ ...p, [key]: result.assets[0].uri }));
      }
    } catch {
      Alert.alert("Error", "Could not pick image.");
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
    }
  };

  const removeDoc = (key) => setDocs((p) => ({ ...p, [key]: null }));

  const canContinue = avatar && docs.aadhaar && docs.drivingLicence;

  // ── Camera view ───────────────────────────────────────────────────────────
  if (cameraOpen) {
    return (
      <View style={[styles.cameraScreen, { backgroundColor: "#000" }]}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />

        {/* Oval guide */}
        <View style={styles.ovalWrap} pointerEvents="none">
          <View style={[styles.oval, { borderColor: colors.primary }]} />
          <Text style={[styles.ovalHint, { color: "#fff" }]}>
            Position your face inside the frame
          </Text>
        </View>

        {/* Top bar */}
        <View style={styles.camTopBar}>
          <TouchableOpacity
            onPress={() => setCameraOpen(false)}
            style={styles.camIconBtn}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
            style={styles.camIconBtn}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Shutter */}
        <View style={styles.shutterRow}>
          <TouchableOpacity
            onPress={capturePhoto}
            disabled={capturing}
            activeOpacity={0.8}
            style={[styles.shutter, { borderColor: colors.primary }]}
          >
            {capturing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View
                style={[
                  styles.shutterInner,
                  { backgroundColor: colors.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, ...typography.h2 }]}>
          Identity Verification
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, ...typography.body2 },
          ]}
        >
          Help us confirm you're the right person
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar section ── */}
        <SectionLabel
          label="Profile Photo"
          colors={colors}
          typography={typography}
        />

        <View style={styles.avatarSection}>
          {avatar ? (
            <View style={styles.avatarPreviewWrap}>
              <Image
                source={{ uri: avatar }}
                style={[styles.avatarPreview, { borderColor: colors.primary }]}
              />
              {/* Verified tick */}
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>

              <TouchableOpacity
                onPress={retakeAvatar}
                style={[
                  styles.retakeBtn,
                  { borderColor: colors.primary, backgroundColor: colors.card },
                ]}
              >
                <Ionicons name="camera" size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.retakeTxt,
                    { color: colors.primary, ...typography.caption },
                  ]}
                >
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openCamera}
              activeOpacity={0.85}
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.cameraIconCircle,
                  { backgroundColor: colors.primary + "18" },
                ]}
              >
                <Ionicons name="camera" size={28} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.avatarPlaceholderTitle,
                  { color: colors.text, ...typography.body1 },
                ]}
              >
                Take a Live Photo
              </Text>
              <Text
                style={[
                  styles.avatarPlaceholderSub,
                  { color: colors.textSecondary, ...typography.caption },
                ]}
              >
                Camera only · No gallery upload
              </Text>
            </TouchableOpacity>
          )}

          {/* Rules */}
          <View
            style={[
              styles.ruleCard,
              {
                backgroundColor: colors.primary + "0D",
                borderColor: colors.primary + "30",
              },
            ]}
          >
            {[
              "Face clearly visible, no sunglasses",
              "Good lighting, neutral background",
              "Look directly at the camera",
            ].map((r) => (
              <View key={r} style={styles.ruleRow}>
                <Ionicons
                  name="ellipse"
                  size={5}
                  color={colors.primary}
                  style={{ marginTop: 5 }}
                />
                <Text
                  style={[
                    styles.ruleTxt,
                    { color: colors.text, ...typography.caption },
                  ]}
                >
                  {r}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Documents section ── */}
        <SectionLabel
          label="KYC Documents"
          colors={colors}
          typography={typography}
          style={{ marginTop: 28 }}
        />

        {DOCUMENTS.map((doc) => (
          <DocumentCard
            key={doc.key}
            doc={doc}
            uri={docs[doc.key]}
            loading={uploading[doc.key]}
            colors={colors}
            typography={typography}
            radii={radii}
            shadows={shadows}
            onPick={() => pickDocument(doc.key)}
            onRemove={() => removeDoc(doc.key)}
          />
        ))}

        {/* ── Continue ── */}
        <TouchableOpacity
          disabled={!canContinue}
          activeOpacity={0.85}
          onPress={() => {
            // dispatch or navigate here
          }}
          style={[
            styles.continueBtn,
            {
              backgroundColor: canContinue ? colors.primary : colors.border,
              ...shadows.md,
            },
          ]}
        >
          <Text
            style={[
              styles.continueTxt,
              {
                color: canContinue ? "#fff" : colors.textSecondary,
                ...typography.button,
              },
            ]}
          >
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={canContinue ? "#fff" : colors.textSecondary}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ label, colors, typography, style }) => (
  <View style={[styles.sectionLabelRow, style]}>
    <Text
      style={[styles.sectionLabel, { color: colors.text, ...typography.h4 }]}
    >
      {label}
    </Text>
    <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
  </View>
);

const DocumentCard = ({
  doc,
  uri,
  loading,
  colors,
  typography,
  radii,
  shadows,
  onPick,
  onRemove,
}) => (
  <View
    style={[
      styles.docCard,
      {
        backgroundColor: colors.card,
        borderColor: uri ? colors.primary + "60" : colors.border,
        borderRadius: radii.lg,
        ...shadows.sm,
      },
    ]}
  >
    {/* Left icon */}
    <View
      style={[
        styles.docIconWrap,
        { backgroundColor: uri ? colors.primary + "15" : colors.background },
      ]}
    >
      <MaterialCommunityIcons
        name={doc.icon}
        size={22}
        color={uri ? colors.primary : colors.textSecondary}
      />
    </View>

    {/* Info */}
    <View style={styles.docInfo}>
      <Text
        style={[styles.docLabel, { color: colors.text, ...typography.body1 }]}
      >
        {doc.label}
      </Text>
      {uri ? (
        <Text
          style={[
            styles.docUploaded,
            { color: colors.primary, ...typography.caption },
          ]}
        >
          ✓ Uploaded
        </Text>
      ) : (
        <Text
          style={[
            styles.docHint,
            { color: colors.textSecondary, ...typography.caption },
          ]}
        >
          {doc.hint}
        </Text>
      )}
    </View>

    {/* Preview thumbnail */}
    {uri && (
      <Image
        source={{ uri }}
        style={[styles.docThumb, { borderRadius: radii.sm }]}
      />
    )}

    {/* Action btn */}
    {uri ? (
      <TouchableOpacity onPress={onRemove} style={styles.docRemoveBtn}>
        <Ionicons
          name="close-circle"
          size={22}
          color={colors.error || "#E53935"}
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={onPick}
        disabled={loading}
        style={[styles.docUploadBtn, { backgroundColor: colors.primary }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { marginBottom: 2 },
  subtitle: { opacity: 0.7 },

  scroll: { padding: 20, paddingBottom: 48 },

  // Section label
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: { marginRight: 10 },
  sectionLine: { flex: 1, height: 1 },

  // Avatar section
  avatarSection: { alignItems: "center", gap: 16 },

  avatarPlaceholder: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  cameraIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarPlaceholderTitle: { fontWeight: "600" },
  avatarPlaceholderSub: { opacity: 0.7 },

  avatarPreviewWrap: { alignItems: "center", gap: 12 },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 44,
    right: "34%",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  retakeTxt: { fontWeight: "600" },

  ruleCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  ruleTxt: { flex: 1, lineHeight: 18 },

  // Document cards
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: { flex: 1 },
  docLabel: { fontWeight: "600", marginBottom: 2 },
  docHint: { opacity: 0.65 },
  docUploaded: { fontWeight: "600" },
  docThumb: { width: 44, height: 30, resizeMode: "cover" },
  docUploadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docRemoveBtn: { padding: 2 },

  // Continue
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
  },
  continueTxt: { fontWeight: "700", fontSize: 16 },

  // Camera screen
  cameraScreen: { flex: 1 },
  camTopBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  camIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  ovalWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  oval: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 2.5,
    borderStyle: "dashed",
  },
  ovalHint: {
    fontSize: 13,
    opacity: 0.85,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  shutterRow: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

export default VendorIdentityScreen;
