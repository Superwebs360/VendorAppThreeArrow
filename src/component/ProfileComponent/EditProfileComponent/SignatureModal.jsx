import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalShell from "./ModalShell";

/**
 * Digital Signature modal.
 *
 * Props:
 *   visible, onClose
 *   value    — { signed: bool, signatureDate: ISO string | null }
 *   onChange — (newValue) => void
 */
const SignatureModal = ({ visible, onClose, value, onChange }) => {
  const { colors, typography, radii } = useTheme();

  const handleSign = () =>
    onChange({ signed: true, signatureDate: new Date().toISOString() });
  const handleClear = () => onChange({ signed: false, signatureDate: null });

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Digital Signature"
      icon="create-outline"
      saveLabel="Done"
      keyboardAvoiding={false}
    >
      {/* Signature display box */}
      <View
        style={[
          styles.sigBox,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radii.lg,
          },
        ]}
      >
        {value.signed ? (
          <>
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={colors.secondary}
            />
            <Text
              style={{
                color: colors.secondary,
                fontWeight: "700",
                fontSize: 16,
                marginTop: 12,
              }}
            >
              Signed
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                ...typography.caption,
                marginTop: 4,
              }}
            >
              {new Date(value.signatureDate).toLocaleString()}
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="create-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                ...typography.body1,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Tap below to apply your digital signature
            </Text>
          </>
        )}
      </View>

      {/* Disclaimer */}
      <View
        style={[
          styles.sigDisclaimer,
          {
            backgroundColor: colors.secondary + "0D",
            borderColor: colors.secondary + "30",
            borderRadius: radii.md,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.secondary}
        />
        <Text
          style={[
            styles.sigDisclaimerTxt,
            { color: colors.text, ...typography.caption },
          ]}
        >
          By signing, you confirm all provided information is accurate and agree
          to our Terms & Conditions.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.sigBtns}>
        {value.signed ? (
          <TouchableOpacity
            onPress={handleClear}
            style={[
              styles.sigBtn,
              { borderWidth: 1.5, borderColor: colors.error || "#E53935" },
            ]}
          >
            <Text
              style={{ color: colors.error || "#E53935", ...typography.button }}
            >
              Clear Signature
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSign}
            style={[styles.sigBtn, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", ...typography.button }}>
              Apply Signature
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalShell>
  );
};

export default SignatureModal;

const styles = StyleSheet.create({
  sigBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: 20,
  },
  sigDisclaimer: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  sigDisclaimerTxt: { flex: 1, lineHeight: 18 },
  sigBtns: { gap: 12 },
  sigBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
});
