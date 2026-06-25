// (approval)/bussiness_info.jsx
// Shows real vendor data from Redux store (fetched by LoginVerifyModal before routing here)
// If store is empty (direct navigation), fetches vendor profile on mount
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import HelpModal from "../../component/ApprovalComponenet/Business_Info/HelpModal";
import InfoRow from "../../component/ApprovalComponenet/Business_Info/InfoRow";
import ProgressBar from "../../component/ApprovalComponenet/Business_Info/Progress_Bar";
import { SPACING, useGridConfig } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import {
  fetchMyVendorProfile,
  selectVendorFetchStatus,
  selectVendorFormData,
  selectVendorProfile,
  withdrawVendorApplication,
} from "../../redux/vendorInfoSlice";

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BusinessInfo() {
  const { colors, typography, radii, shadows, isDark } = useTheme();
  const grid = useGridConfig();
  const dispatch = useDispatch();

  const vendor = useSelector(selectVendorProfile);
  const formData = useSelector(selectVendorFormData);
  const fetchStatus = useSelector(selectVendorFetchStatus);

  const [helpVisible, setHelpVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Fetch on mount ONLY if vendor isn't already in store (e.g. direct
  // navigation without going through LoginVerifyModal). If withdraw/edit
  // already populated `vendor` via the thunk's fulfilled reducer, skip the
  // refetch — an unconditional fetch here can race with backend writes and
  // briefly clobber the freshly-updated Redux state with stale data.
  useEffect(() => {
    if (!vendor) {
      dispatch(fetchMyVendorProfile());
    }
  }, []);

  const isLoading = fetchStatus === "loading" && !vendor;

  // ── Derive display data ───────────────────────────────────────────────────────
  const bd = vendor?.businessDetails || {};

  const businessName = bd.businessName || formData.businessName || "";
  const businessType = bd.businessType || formData.businessType || "";
  const businessEmail = bd.businessEmail || formData.businessEmail || "";
  const businessPhone = bd.businessPhone || formData.businessPhone || "";
  const gstNumber = bd.gstNumber || formData.gstNumber || "";
  const panNumber = bd.panNumber || formData.panNumber || "";
  const yearEstablished = bd.yearEstablished
    ? String(bd.yearEstablished)
    : formData.yearEstablished || "";
  const employees = bd.numberOfEmployees
    ? String(bd.numberOfEmployees)
    : formData.employees || "";

  const rawCategories = bd.categories || formData.productCategories || [];
  const categoriesList = Array.isArray(rawCategories)
    ? rawCategories
    : String(rawCategories)
        .split(/[,·]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const rawOnboard = bd.onboardingType || formData.onboardAs || [];
  const onboardLabel = Array.isArray(rawOnboard)
    ? rawOnboard.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")
    : String(rawOnboard);

  const vendorStatus = vendor?.status || "pending";
  const submittedAt = vendor?.updatedAt || vendor?.createdAt;
  const adminRemark = vendor?.adminRemark;

  // ── Withdraw handler ──────────────────────────────────────────────────────────
  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Application",
      "Are you sure you want to withdraw your application? You can edit your details and resubmit at any time.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: async () => {
            setWithdrawing(true);
            try {
              const result = await dispatch(withdrawVendorApplication());
              if (withdrawVendorApplication.fulfilled.match(result)) {
                Alert.alert(
                  "Application Withdrawn",
                  "Your application has been withdrawn. You can update your details and resubmit.",
                  [
                    {
                      text: "Edit Details",
                      onPress: () => router.push("/(onboarding)/wizard?edit=1"),
                    },
                    { text: "Stay Here", style: "cancel" },
                  ],
                );
              } else {
                Alert.alert(
                  "Error",
                  result.payload ||
                    "Could not withdraw application. Please try again.",
                );
              }
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ],
    );
  };

  const cardStyle = {
    backgroundColor: colors.card || colors.background,
    borderRadius: radii.xl || 16,
    borderColor: colors.border || "rgba(0,0,0,0.06)",
    borderWidth: 1,
    ...(!isDark && shadows.sm),
    overflow: "hidden",
    marginBottom: 16,
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.loaderWrap, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
          Loading your application…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: grid.horizontalPad || 16,
          paddingTop: SPACING.xl || 24,
          paddingBottom: SPACING.huge || 40,
        }}
      >
        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.greeting,
                { color: colors.textMuted, ...typography.caption },
              ]}
            >
              GOOD DAY
            </Text>
            <Text
              style={[
                styles.title,
                { color: colors.text, ...typography.heading1 },
              ]}
              numberOfLines={1}
            >
              {businessName || "Vendor"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Help button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setHelpVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[styles.iconBtnText, { color: colors.textSecondary }]}
              >
                ?
              </Text>
            </TouchableOpacity>

            {/* Refresh button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => dispatch(fetchMyVendorProfile())}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[styles.iconBtnText, { color: colors.textSecondary }]}
              >
                ↻
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.s || 8,
                },
              ]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text
                style={[styles.loginBtnText, { color: colors.textSecondary }]}
              >
                Login
              </Text>
            </TouchableOpacity>

            {/* Dashboard shortcut (only if approved) */}
            {vendorStatus === "approved" && (
              <TouchableOpacity
                style={[styles.dashBtn, { backgroundColor: colors.secondary }]}
                onPress={() => router.push("/(tabs)/dashboard")}
              >
                <Text style={styles.dashBtnText}>Dashboard</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Admin remark (if rejected) ── */}
        {vendorStatus === "rejected" && adminRemark ? (
          <View
            style={[
              styles.remarkCard,
              {
                backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#FEF2F2",
                borderColor: isDark ? "rgba(239,68,68,0.25)" : "#FECACA",
              },
            ]}
          >
            <Text style={styles.remarkTitle}>Rejection Reason</Text>
            <Text style={[styles.remarkBody, { color: colors.text }]}>
              {adminRemark}
            </Text>
            <TouchableOpacity
              style={[
                styles.resubmitBtn,
                { backgroundColor: colors.secondary },
              ]}
              onPress={() => router.push("/(onboarding)/wizard?edit=1")}
            >
              <Text style={styles.resubmitBtnText}>Update &amp; Resubmit</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Application Progress Card ── */}
        <View style={cardStyle}>
          <View
            style={[
              styles.cardSection,
              {
                borderBottomColor: colors.divider || "rgba(0,0,0,0.05)",
                borderBottomWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, ...typography.label },
              ]}
            >
              APPLICATION PROGRESS
            </Text>
            <Text
              style={[
                styles.sectionDesc,
                { color: colors.textSecondary, ...typography.caption },
              ]}
            >
              {vendorStatus === "approved"
                ? "Your application has been approved. Welcome aboard!"
                : vendorStatus === "rejected"
                  ? "Your application was reviewed and needs corrections."
                  : "Your application is currently "}
              {vendorStatus === "pending" ? (
                <Text style={{ color: colors.secondary, fontWeight: "600" }}>
                  under review
                </Text>
              ) : null}
              {vendorStatus === "pending" ? " by our team." : ""}
            </Text>
            <ProgressBar
              colors={colors}
              radii={radii}
              isDark={isDark}
              vendorStatus={vendorStatus}
              submittedAt={submittedAt}
            />
          </View>

          {/* ── Business Information ── */}
          <View style={[styles.cardSection, { paddingBottom: 4 }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, ...typography.heading3, fontSize: 16 },
              ]}
            >
              Business Information
            </Text>
          </View>

          <InfoRow
            colors={colors}
            fields={[
              { label: "Business Name", value: businessName },
              { label: "Business Type", value: businessType },
            ]}
          />
          <InfoRow
            colors={colors}
            fields={[
              { label: "Business Email", value: businessEmail },
              { label: "Business Phone", value: businessPhone },
            ]}
          />
          <InfoRow
            colors={colors}
            fields={[
              { label: "GST Number", value: gstNumber },
              { label: "PAN Number", value: panNumber },
            ]}
          />
          {yearEstablished || employees ? (
            <InfoRow
              colors={colors}
              fields={[
                { label: "Year Established", value: yearEstablished },
                { label: "Employees", value: employees },
              ]}
            />
          ) : null}
          {onboardLabel ? (
            <InfoRow
              colors={colors}
              fields={[{ label: "Onboard As", value: onboardLabel }]}
            />
          ) : null}

          {/* ── Categories ── */}
          {categoriesList.length > 0 && (
            <View
              style={[
                styles.cardSection,
                { paddingTop: 16, paddingBottom: 20 },
              ]}
            >
              <Text
                style={[
                  styles.cellLabel,
                  { color: colors.textMuted, marginBottom: 10 },
                ]}
              >
                PRODUCT CATEGORIES
              </Text>
              <View style={styles.chipsRow}>
                {categoriesList.map((category, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "#F3F4F6",
                        borderRadius: radii.s || 6,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: colors.textSecondary }]}
                    >
                      {category}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Action Buttons Row (Edit Details + Withdraw) ── */}
        {(vendorStatus === "pending" || vendorStatus === "draft") && (
          <View style={styles.actionRow}>
            {/* Edit Details */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.m || 10,
                  flex: 1,
                },
              ]}
              onPress={() => router.push("/(onboarding)/wizard?edit=1")}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnIcon, { color: colors.text }]}>
                ✎
              </Text>
              <Text style={[styles.actionBtnLabel, { color: colors.text }]}>
                Edit Details
              </Text>
            </TouchableOpacity>

            {/* Withdraw Application */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#FEF2F2",
                  borderColor: isDark ? "rgba(239,68,68,0.25)" : "#FECACA",
                  borderRadius: radii.m || 10,
                  flex: 1,
                },
              ]}
              onPress={handleWithdraw}
              disabled={withdrawing}
              activeOpacity={0.8}
            >
              {withdrawing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Text style={[styles.actionBtnIcon, { color: "#EF4444" }]}>
                    ✕
                  </Text>
                  <Text style={[styles.actionBtnLabel, { color: "#EF4444" }]}>
                    Withdraw
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Get Started + Go to Dashboard (approved state only) ── */}
        {vendorStatus === "approved" && (
          <View style={styles.approvedActions}>
            <TouchableOpacity
              style={[
                styles.getStartedBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: radii.m || 10,
                },
              ]}
              onPress={() => router.push("/(onboarding)/get-started")}
              activeOpacity={0.85}
            >
              <Text style={styles.getStartedBtnText}>Get Started 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fullDashBtn,
                {
                  backgroundColor: "transparent",
                  borderColor: colors.secondary,
                  borderWidth: 1.5,
                  borderRadius: radii.m || 10,
                },
              ]}
              onPress={() => router.push("/(tabs)/dashboard")}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.fullDashBtnText, { color: colors.secondary }]}
              >
                Go to Dashboard →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Help Modal ── */}
      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 18,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dashBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dashBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  greeting: {
    marginBottom: 4,
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    textTransform: "capitalize",
  },
  remarkCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  remarkTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  remarkBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  resubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  resubmitBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  cardSection: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  sectionDesc: {
    marginBottom: 20,
    lineHeight: 18,
    opacity: 0.9,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  // ── Action Row (Edit + Withdraw) ──────────────────────────────────────────
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  // ── Approved bottom actions ────────────────────────────────────────────────
  approvedActions: {
    gap: 10,
    marginTop: 4,
  },
  getStartedBtn: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  fullDashBtn: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  fullDashBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
