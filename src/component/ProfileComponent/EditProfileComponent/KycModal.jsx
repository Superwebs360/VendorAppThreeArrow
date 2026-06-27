import { useTheme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KYC_DOCUMENTS } from "./filedConfigs";
import ModalShell from "./ModalShell";

/**
 * KYC & Identity modal.
 *
 * Props:
 *   visible, onClose
 *   kycDetails       — { avatarUrl, documents: { aadhaar, drivingLicence } }
 *   docUploading     — { aadhaar: bool, drivingLicence: bool }
 *   onOpenCamera     — open live camera for avatar
 *   onRetake         — clear avatar and reopen camera
 *   onPickDoc(key)   — open gallery picker for a doc
 *   onRemoveDoc(key) — remove a picked doc
 */
const KycModal = ({
  visible,
  onClose,
  kycDetails,
  docUploading,
  onOpenCamera,
  onRetake,
  onPickDoc,
  onRemoveDoc,
}) => {
  const { colors, typography, radii, shadows } = useTheme();

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="KYC & Identity"
      icon="shield-checkmark-outline"
      keyboardAvoiding={false}
    >
      {/* ── Profile photo ── */}
      <Text
        style={[
          styles.kycSectionTitle,
          { color: colors.text, ...typography.h4 },
        ]}
      >
        Profile Photo
      </Text>
      <Text
        style={[
          styles.kycSectionSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Live capture only · No gallery
      </Text>

      <View style={styles.kycAvatarRow}>
        {kycDetails.avatarUrl ? (
          <>
            <Image
              source={{ uri: kycDetails.avatarUrl }}
              style={[styles.kycAvatar, { borderColor: colors.secondary }]}
            />
            <View style={{ flex: 1, gap: 8 }}>
              <Text
                style={{
                  color: colors.secondary,
                  fontWeight: "600",
                  ...typography.body2,
                }}
              >
                ✓ Photo captured
              </Text>
              <TouchableOpacity
                onPress={onRetake}
                style={[
                  styles.retakeBtn,
                  {
                    borderColor: colors.secondary,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="camera" size={13} color={colors.secondary} />
                <Text
                  style={{
                    color: colors.secondary,
                    ...typography.caption,
                    fontWeight: "600",
                  }}
                >
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            onPress={onOpenCamera}
            activeOpacity={0.85}
            style={[
              styles.kycCamBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.kycCamIcon,
                { backgroundColor: colors.secondary + "18" },
              ]}
            >
              <Ionicons name="camera" size={26} color={colors.secondary} />
            </View>
            <Text
              style={{
                color: colors.text,
                ...typography.body1,
                fontWeight: "600",
              }}
            >
              Take Live Photo
            </Text>
            <Text
              style={{ color: colors.textSecondary, ...typography.caption }}
            >
              Face clearly visible · Good lighting
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo rules */}
      <View
        style={[
          styles.ruleCard,
          {
            backgroundColor: colors.secondary + "0D",
            borderColor: colors.secondary + "30",
          },
        ]}
      >
        {[
          "No sunglasses or face coverings",
          "Neutral background",
          "Look directly at the camera",
        ].map((r) => (
          <View key={r} style={styles.ruleRow}>
            <Ionicons
              name="ellipse"
              size={5}
              color={colors.secondary}
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

      {/* ── KYC documents ── */}
      <Text
        style={[
          styles.kycSectionTitle,
          { color: colors.text, ...typography.h4, marginTop: 24 },
        ]}
      >
        KYC Documents
      </Text>
      <Text
        style={[
          styles.kycSectionSub,
          { color: colors.textSecondary, ...typography.caption },
        ]}
      >
        Upload clear images from your gallery
      </Text>

      {KYC_DOCUMENTS.map((doc) => {
        const uri = kycDetails.documents?.[doc.key];
        return (
          <View
            key={doc.key}
            style={[
              styles.docCard,
              {
                backgroundColor: colors.card,
                borderColor: uri ? colors.secondary + "60" : colors.border,
                borderRadius: radii.lg,
                ...shadows.sm,
              },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.docIconWrap,
                {
                  backgroundColor: uri
                    ? colors.secondary + "15"
                    : colors.background,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={doc.icon}
                size={22}
                color={uri ? colors.secondary : colors.textSecondary}
              />
            </View>

            {/* Info */}
            <View style={styles.docInfo}>
              <Text
                style={[
                  styles.docLabel,
                  { color: colors.text, ...typography.body1 },
                ]}
              >
                {doc.label}
              </Text>
              {uri ? (
                <Text
                  style={{
                    color: colors.secondary,
                    fontWeight: "600",
                    ...typography.caption,
                  }}
                >
                  ✓ Uploaded
                </Text>
              ) : (
                <Text
                  style={{ color: colors.textSecondary, ...typography.caption }}
                >
                  {doc.hint}
                </Text>
              )}
            </View>

            {/* Thumbnail */}
            {uri && (
              <Image
                source={{ uri }}
                style={[styles.docThumb, { borderRadius: radii.sm }]}
              />
            )}

            {/* Action */}
            {uri ? (
              <TouchableOpacity
                onPress={() => onRemoveDoc(doc.key)}
                style={styles.docRemoveBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={colors.error || "#E53935"}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => onPickDoc(doc.key)}
                disabled={docUploading[doc.key]}
                style={[
                  styles.docUploadBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                {docUploading[doc.key] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={16}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ModalShell>
  );
};

export default KycModal;

const styles = StyleSheet.create({
  kycSectionTitle: { fontWeight: "700", marginBottom: 4 },
  kycSectionSub: { opacity: 0.65, marginBottom: 14 },
  kycAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  kycAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5 },
  kycCamBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  kycCamIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  ruleCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  ruleTxt: { flex: 1, lineHeight: 18 },
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
  docThumb: { width: 44, height: 30, resizeMode: "cover" },
  docUploadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docRemoveBtn: { padding: 2 },
});
