// LoginVerifyModal.jsx — after OTP verify, fetch vendor status and route accordingly
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { SPACING } from "@/constants/gridConfig";
import { Radii, Shadows, Typography, useTheme } from "@/constants/theme";
import {
  clearAuthErrors,
  resetOtpState,
  selectOtpError,
  selectOtpLoading,
  selectOtpSent,
  selectStoredEmailOrPhone,
  selectVerifyError,
  selectVerifyLoading,
  sendOTP,
  verifyOTP,
} from "../../redux/authSlice";
import {
  fetchMyVendorProfile,
  selectVendorProfile,
} from "../../redux/vendorInfoSlice";
import RejectionPopup from "./RejectionPopup";

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function LoginVerifyModal({ visible, onClose, onLoginSuccess }) {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  // ── Redux state ──────────────────────────────────────────────────────────────
  const otpLoading = useSelector(selectOtpLoading);
  const verifyLoading = useSelector(selectVerifyLoading);
  const otpSent = useSelector(selectOtpSent);
  const otpError = useSelector(selectOtpError);
  const verifyError = useSelector(selectVerifyError);
  const storedEmailOrPhone = useSelector(selectStoredEmailOrPhone);
  const vendorProfile = useSelector(selectVendorProfile);

  // ── Local state ──────────────────────────────────────────────────────────────
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [fetchingVendor, setFetchingVendor] = useState(false);
  const [showRejectionPopup, setShowRejectionPopup] = useState(false);
  const [rejectedRemark, setRejectedRemark] = useState("");

  // ── Anim refs ────────────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0.1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // ── Resend countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ── Entrance animation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 14,
          mass: 0.8,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ── Close modal ──────────────────────────────────────────────────────────────
  const closeModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.1,
        damping: 14,
        mass: 0.8,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetLocal();
      dispatch(resetOtpState());
      dispatch(clearAuthErrors());
      onClose();
    });
  };

  const resetLocal = () => {
    setEmailOrPhone("");
    setOtp("");
    setResendTimer(0);
    setFetchingVendor(false);
    setShowRejectionPopup(false);
    setRejectedRemark("");
  };

  // ── Routing logic after successful login ─────────────────────────────────────
  // Called after OTP verify succeeds. Fetches vendor status and routes.
  const handlePostLoginRouting = async () => {
    setFetchingVendor(true);
    try {
      const result = await dispatch(fetchMyVendorProfile());

      // No vendor profile yet → fresh onboarding
      if (fetchMyVendorProfile.rejected.match(result)) {
        closeModal();
        router.push("/(onboarding)/wizard");
        return;
      }

      const vendor = result.payload;

      if (!vendor) {
        // No profile — start fresh
        closeModal();
        router.push("/(onboarding)/wizard");
        return;
      }

      const status = vendor.status || "draft";

      if (status === "approved") {
        // Approved → go to dashboard
        closeModal();
        router.push("/(tabs)/dashboard");
        return;
      }

      if (status === "pending") {
        // Pending → show approval/status page
        closeModal();
        router.push("/(approval)/bussiness_info");
        return;
      }

      if (status === "rejected") {
        // Rejected → show popup, then let them go to wizard with prefilled data
        setFetchingVendor(false);
        setRejectedRemark(vendor.adminRemark || "");
        setShowRejectionPopup(true);
        return;
      }

      // Draft (or any other status) → wizard with saved data hydrated
      closeModal();
      router.push("/(onboarding)/wizard");
    } catch (err) {
      console.error("Vendor fetch error:", err);
      // On error, default to wizard
      closeModal();
      router.push("/(onboarding)/wizard");
    } finally {
      setFetchingVendor(false);
    }
  };

  // ── Rejection popup actions ──────────────────────────────────────────────────
  const handleRejectionRetry = () => {
    setShowRejectionPopup(false);
    closeModal();
    // vendorInfoSlice already has hydrated formData from fetchMyVendorProfile
    router.push("/(onboarding)/wizard");
  };

  const handleRejectionClose = () => {
    setShowRejectionPopup(false);
    closeModal();
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!emailOrPhone.trim()) {
      alert("Please enter email or phone number");
      return;
    }
    const result = await dispatch(
      sendOTP({ emailOrPhone: emailOrPhone.trim() }),
    );
    if (sendOTP.fulfilled.match(result)) {
      setResendTimer(60);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    const result = await dispatch(
      verifyOTP({
        emailOrPhone: storedEmailOrPhone || emailOrPhone.trim(),
        otp: otp.trim(),
      }),
    );
    if (verifyOTP.fulfilled.match(result)) {
      onLoginSuccess?.(result.payload);
      // Don't close modal yet — route after vendor status check
      await handlePostLoginRouting();
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    const result = await dispatch(
      sendOTP({ emailOrPhone: storedEmailOrPhone || emailOrPhone.trim() }),
    );
    if (sendOTP.fulfilled.match(result)) {
      setResendTimer(60);
      setOtp("");
    }
  };

  // ── Back to email/phone ──────────────────────────────────────────────────────
  const handleBackToEmail = () => {
    dispatch(resetOtpState());
    dispatch(clearAuthErrors());
    setOtp("");
    setResendTimer(0);
  };

  const isLoading = otpLoading || verifyLoading || fetchingVendor;

  return (
    <>
      {/* Rejection popup — outside the main modal so it layers on top */}
      <RejectionPopup
        visible={showRejectionPopup}
        remark={rejectedRemark}
        onClose={handleRejectionClose}
        onRetry={handleRejectionRetry}
      />

      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        onRequestClose={closeModal}
        hardwareAccelerated
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.outerContainer}>
              {/* Backdrop */}
              <Animated.View
                style={[
                  styles.backdrop,
                  {
                    opacity: backdropOpacity,
                    backgroundColor: colors.overlay,
                  },
                ]}
              >
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={closeModal}
                />
              </Animated.View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <Animated.View
                  style={[
                    styles.modalCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      transform: [{ scale: scaleAnim }],
                      opacity: opacityAnim,
                      ...(isDark ? Shadows.lg : Shadows.md),
                    },
                  ]}
                >
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={closeModal}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text
                      style={[styles.closeBtnText, { color: colors.textMuted }]}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>

                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={[styles.brandText, { color: colors.text }]}>
                      3Arrow{" "}
                      <Text style={{ color: colors.secondary }}>Vendor</Text>
                    </Text>
                    <Text
                      style={[
                        styles.welcomeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {otpSent
                        ? "Enter OTP sent to you"
                        : "Welcome! Please login"}
                    </Text>
                  </View>

                  {/* Loading overlay when fetching vendor status */}
                  {fetchingVendor ? (
                    <View style={styles.loadingState}>
                      <ActivityIndicator
                        size="small"
                        color={colors.secondary}
                      />
                      <Text
                        style={[
                          styles.loadingText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Setting up your account…
                      </Text>
                    </View>
                  ) : !otpSent ? (
                    /* ── Step 1: Email / Phone ─────────────────────────── */
                    <>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: otpError ? "#ef4444" : colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Email or phone *"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailOrPhone}
                        onChangeText={(t) => {
                          setEmailOrPhone(t);
                          if (otpError) dispatch(clearAuthErrors());
                        }}
                        editable={!isLoading}
                        autoFocus={false}
                      />

                      {otpError ? (
                        <Text style={styles.errorText}>{otpError}</Text>
                      ) : null}

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSendOtp}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={[colors.secondary, colors.secondaryLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.otpBtn, isLoading && { opacity: 0.6 }]}
                        >
                          <Text style={styles.otpBtnText}>
                            {otpLoading ? "Sending..." : "Send OTP"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.divider}>
                        <View
                          style={[
                            styles.dividerLine,
                            { backgroundColor: colors.divider },
                          ]}
                        />
                        <Text
                          style={[
                            styles.dividerText,
                            { color: colors.textMuted },
                          ]}
                        >
                          Or
                        </Text>
                        <View
                          style={[
                            styles.dividerLine,
                            { backgroundColor: colors.divider },
                          ]}
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.googleBtn,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.googleIcon}>G</Text>
                        <Text
                          style={[styles.googleBtnText, { color: colors.text }]}
                        >
                          Sign in with Google
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    /* ── Step 2: OTP ─────────────────────────────────── */
                    <View style={styles.otpSection}>
                      <Text
                        style={[
                          styles.otpSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        We've sent a code to{" "}
                        {storedEmailOrPhone || emailOrPhone}
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          styles.otpInput,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: verifyError
                              ? "#ef4444"
                              : colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={(t) => {
                          setOtp(t);
                          if (verifyError) dispatch(clearAuthErrors());
                        }}
                        editable={!isLoading}
                      />

                      {verifyError ? (
                        <Text style={styles.errorText}>{verifyError}</Text>
                      ) : null}

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleVerifyOtp}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={[colors.secondary, colors.secondaryLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.otpBtn, isLoading && { opacity: 0.6 }]}
                        >
                          <Text style={styles.otpBtnText}>
                            {verifyLoading || fetchingVendor
                              ? "Verifying..."
                              : "Verify OTP"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.resendContainer}>
                        {resendTimer > 0 ? (
                          <Text
                            style={[
                              styles.resendText,
                              { color: colors.textMuted },
                            ]}
                          >
                            Resend OTP in {resendTimer}s
                          </Text>
                        ) : (
                          <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={isLoading}
                          >
                            <Text
                              style={[
                                styles.resendLink,
                                { color: colors.secondary },
                              ]}
                            >
                              Resend OTP
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={handleBackToEmail}
                        disabled={isLoading}
                      >
                        <Text
                          style={[
                            styles.backLink,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Use different number
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!fetchingVendor && (
                    <Text
                      style={[styles.termsText, { color: colors.textMuted }]}
                    >
                      By continuing, I agree to the{" "}
                      <Text style={{ color: colors.secondary }}>
                        Terms of Use &amp; Privacy Policy
                      </Text>
                    </Text>
                  )}
                </Animated.View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  outerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: 40,
  },
  modalCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: 28,
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 16,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  welcomeText: {
    ...Typography.body,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  otpSection: {
    marginBottom: 8,
  },
  otpSubtitle: {
    ...Typography.bodySmall,
    marginBottom: 16,
    textAlign: "center",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 16,
    letterSpacing: 6,
    fontWeight: "600",
  },
  otpBtn: {
    height: 52,
    borderRadius: Radii.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  otpBtnText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  resendText: {
    ...Typography.bodySmall,
  },
  resendLink: {
    ...Typography.bodySmall,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  backLink: {
    textAlign: "center",
    ...Typography.bodySmall,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
  },
  googleBtn: {
    height: 50,
    borderWidth: 1,
    borderRadius: Radii.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleBtnText: {
    ...Typography.bodyMedium,
  },
  termsText: {
    textAlign: "center",
    ...Typography.caption,
  },
});
