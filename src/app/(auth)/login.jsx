import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LoginVerifyModal from "@/component/LoginComponent/loginVerifyModal";
import { hp, SPACING, wp } from "@/constants/gridConfig";
import { Radii, Shadows, Typography, useTheme } from "@/constants/theme";

export default function Login() {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLoginSuccess = (credentials) => {
    // Handle successful login
    console.log("Login successful with:", credentials);
    // Store auth token, navigate to dashboard, etc.
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={[""]}>
        <ImageBackground
          source={require("@/assets/vendor_Background.png")}
          resizeMode="cover"
          style={styles.background}
        >
          {/* Dark overlay for readability */}
          {isDark && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.35)" },
              ]}
            />
          )}

          {/* Top Branding */}
          <View style={styles.hero}>
            <Text style={styles.heading}>
              Manage Your Store{"\n"}
              Anytime, Anywhere
            </Text>
            <Text style={styles.subtitle}>
              Track orders, manage inventory, monitor sales and grow your
              business with ease.
            </Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                <Text style={styles.loginText}>Login as Vendor</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footer}>Powered by 3Arrow Marketplace</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>

      {/* Login Verify Modal */}
      <LoginVerifyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // ── Background / Layout ───────────────────────────────
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    justifyContent: "space-between",
  },

  // ── Hero ──────────────────────────────────────────────
  hero: {
    marginTop: hp(8),
    paddingHorizontal: SPACING.xxxl,
  },

  heading: {
    ...Typography.display,
    color: "#FFFFFF",
    fontWeight: "800",
    maxWidth: wp(80),
  },

  subtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: SPACING.lg,
    maxWidth: wp(80),
  },

  // ── Bottom CTA ────────────────────────────────────────
  bottomContainer: {
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: hp(5),
  },

  loginBtn: {
    height: 58,
    borderRadius: Radii.full,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.primary,
  },

  loginText: {
    ...Typography.button,
    color: "#FFFFFF",
    fontSize: 17,
  },

  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
    marginTop: SPACING.lg,
    ...Typography.caption,
  },
});
