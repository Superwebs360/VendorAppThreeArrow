import Section from "@/component/ProfileComponent/Section";
import SettingRow from "@/component/ProfileComponent/SettingRow";
import { logout } from "@/redux/authSlice";
import {
  fetchMyVendorProfile,
  selectVendorProfile,
} from "@/redux/vendorInfoSlice";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { SPACING } from "../../constants/gridConfig";
import { Radii, Shadows, Typography, useTheme } from "../../constants/theme";

// "Arbaj Khan" → "AK"
function getInitials(name) {
  if (!name) return "VN";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
  return initials.join("") || "VN";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const vendor = useSelector(selectVendorProfile);

  useEffect(() => {
    dispatch(fetchMyVendorProfile());
  }, [dispatch]);

  // ── Derive display fields from vendor profile ──────────────────────────────
  const displayName =
    vendor?.sellerDetails?.sellerName ||
    vendor?.businessDetails?.businessName ||
    "Vendor";

  const handle =
    (vendor?.sellerDetails?.sellerEmail &&
      `@${vendor.sellerDetails.sellerEmail.split("@")[0]}`) ||
    (vendor?._id && `ID: ${vendor._id.slice(-6).toUpperCase()}`) ||
    "@vendor";

  const avatarUrl = vendor?.kycDetails?.avatarUrl || null;
  const initials = getInitials(displayName);

  const handleLogout = () => {
    Alert.alert(
      "Log out?",
      "Are you sure you want to log out of your vendor account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await dispatch(logout());
            router.replace("/(auth)/login");
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.secondary + "22" },
                ]}
              >
                <Text
                  style={[styles.avatarInitials, { color: colors.secondary }]}
                >
                  {initials}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Feather name="check" size={11} color="#fff" />
            </View>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.handle, { color: colors.textMuted }]}>
            {handle}
          </Text>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.tag,
                { backgroundColor: isDark ? "#0F2010" : "#EDF7EB" },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.secondary }]}>
                Active Merchant
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: isDark ? "#1A1530" : "#EFEAFB" },
              ]}
            >
              <Text style={[styles.tagText, { color: "#7C5CD6" }]}>
                Premium Tier
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/Screens/Profile/EditProfile")}
            style={[styles.editBtn, { backgroundColor: colors.secondary }]}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Store Performance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Store Performance
          </Text>

          <View style={styles.perfRow}>
            <View
              style={[
                styles.perfCard,
                Shadows.sm,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>
                Overall Rating
              </Text>
              <View style={styles.ratingRow}>
                <Text style={[styles.perfValue, { color: colors.text }]}>
                  4.8
                </Text>
                <Feather name="star" size={16} color="#F5B400" />
              </View>
              <Text style={[styles.perfSub, { color: colors.textMuted }]}>
                Based on 1,240 reviews
              </Text>
            </View>

            <View
              style={[
                styles.perfCard,
                Shadows.sm,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>
                Years on Platform
              </Text>
              <Text style={[styles.perfValue, { color: colors.text }]}>
                3 Years
              </Text>
            </View>
          </View>

          {/* Inventory health */}
          <View
            style={[
              styles.invCard,
              Shadows.sm,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.invHeader}>
              <Text style={[styles.invLabel, { color: colors.textSecondary }]}>
                Inventory Health
              </Text>
              <Text style={[styles.invStatus, { color: colors.secondary }]}>
                Optimal
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.divider },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: "85%", backgroundColor: colors.secondary },
                ]}
              />
            </View>
            <Text style={[styles.invSub, { color: colors.textMuted }]}>
              85% of stock levels are healthy
            </Text>
          </View>
        </View>

        {/* Shop Settings */}
        <Section title="Shop Settings" colors={colors}>
          <SettingRow
            onPress={() =>
              router.push("/Screens/Profile/ShopSettings/StoreInformation/main")
            }
            icon={<Feather name="info" size={16} color={colors.secondary} />}
            label="Store Information"
            colors={colors}
          />
          <SettingRow
            icon={<Feather name="truck" size={16} color={colors.secondary} />}
            label="Shipping Settings"
            colors={colors}
          />
          <SettingRow
            icon={
              <Feather name="credit-card" size={16} color={colors.secondary} />
            }
            label="Payment Methods"
            colors={colors}
          />
          <SettingRow
            icon={
              <Feather name="file-text" size={16} color={colors.secondary} />
            }
            label="Tax Information"
            colors={colors}
            isLast
          />
        </Section>

        {/* Account */}
        <Section title="Account" colors={colors}>
          <SettingRow
            icon={<Feather name="shield" size={16} color={colors.secondary} />}
            label="Login & Security"
            colors={colors}
          />
          <SettingRow
            icon={<Feather name="bell" size={16} color={colors.secondary} />}
            label="Notification Preferences"
            colors={colors}
            isLast
          />
        </Section>

        {/* Help banner */}
        <View
          style={[
            styles.helpCard,
            { backgroundColor: isDark ? "#0F2010" : "#EDF7EB" },
          ]}
        >
          <View
            style={[
              styles.helpIcon,
              { backgroundColor: colors.secondary + "22" },
            ]}
          >
            <Ionicons
              name="headset-outline"
              size={18}
              color={colors.secondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              Need Help?
            </Text>
            <Text style={[styles.helpSub, { color: colors.textSecondary }]}>
              Contact our dedicated vendor support team 24/7.
            </Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="log-out" size={16} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.sm + 7,
    paddingBottom: 100,
    gap: 18,
  },
  profileHeader: { alignItems: "center", gap: 4, paddingTop: 8 },
  avatarWrap: { marginBottom: 4 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 24, fontWeight: "800" },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  handle: { fontSize: 13 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  tagText: { fontSize: 11, fontWeight: "700" },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: Radii.md,
    width: "100%",
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  section: { gap: 10 },
  sectionTitle: { ...Typography.heading3, fontWeight: "700" },
  perfRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  perfCard: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  perfLabel: { fontSize: 11, textAlign: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  perfValue: { fontSize: 20, fontWeight: "800" },
  perfSub: { fontSize: 10, textAlign: "center" },
  invCard: { borderRadius: Radii.lg, borderWidth: 1, padding: 14, gap: 8 },
  invHeader: { flexDirection: "row", justifyContent: "space-between" },
  invLabel: { fontSize: 13, fontWeight: "600" },
  invStatus: { fontSize: 12, fontWeight: "700" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  invSub: { fontSize: 11 },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: Radii.lg,
    padding: 16,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  helpTitle: { fontSize: 14, fontWeight: "700" },
  helpSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingVertical: 14,
  },
  logoutText: { fontSize: 14, fontWeight: "700" },
});
