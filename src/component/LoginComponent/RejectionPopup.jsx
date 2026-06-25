// LoginVerifyModal.jsx — after OTP verify, fetch vendor status and route accordingly
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Shadows, useTheme } from "@/constants/theme";

export default function RejectionPopup({ visible, remark, onClose, onRetry }) {
  const { colors, radii, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          mass: 0.9,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent statusBarTranslucent>
      <View style={popupStyles.overlay}>
        <Animated.View
          style={[
            popupStyles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.xl || 16,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              ...(isDark ? Shadows.lg : Shadows.md),
            },
          ]}
        >
          {/* Icon */}
          <View style={popupStyles.iconWrap}>
            <Text style={popupStyles.icon}>✕</Text>
          </View>

          <Text style={[popupStyles.title, { color: colors.text }]}>
            Application Rejected
          </Text>

          <Text style={[popupStyles.subtitle, { color: colors.textSecondary }]}>
            Your vendor application was reviewed and unfortunately could not be
            approved at this time.
          </Text>

          {remark ? (
            <View
              style={[
                popupStyles.remarkBox,
                {
                  backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#FEF2F2",
                  borderColor: isDark ? "rgba(239,68,68,0.25)" : "#FECACA",
                },
              ]}
            >
              <Text style={[popupStyles.remarkLabel, { color: "#EF4444" }]}>
                Reason from admin:
              </Text>
              <Text style={[popupStyles.remarkText, { color: colors.text }]}>
                {remark}
              </Text>
            </View>
          ) : null}

          <Text style={[popupStyles.hint, { color: colors.textMuted }]}>
            You can update your information and resubmit your application for
            review.
          </Text>

          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.85}
            style={popupStyles.retryBtn}
          >
            <LinearGradient
              colors={["#5BB64A", "#4CAF3E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={popupStyles.retryGradient}
            >
              <Text style={popupStyles.retryBtnText}>
                Update &amp; Resubmit
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={popupStyles.closeLink}>
            <Text
              style={[popupStyles.closeLinkText, { color: colors.textMuted }]}
            >
              Maybe later
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Popup Styles ─────────────────────────────────────────────────────────────
const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 22,
    color: "#EF4444",
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.85,
  },
  remarkBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  remarkLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remarkText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "500",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 20,
    opacity: 0.75,
  },
  retryBtn: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  retryGradient: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14.5,
    fontWeight: "700",
  },
  closeLink: {
    paddingVertical: 8,
  },
  closeLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
