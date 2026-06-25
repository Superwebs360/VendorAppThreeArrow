// (approval)/seller_info.jsx
// Shows real seller data from Redux store (fetched by LoginVerifyModal before routing here)
// If store is empty (direct navigation), fetches vendor profile on mount
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { SPACING, useGridConfig } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import {
  fetchMyVendorProfile,
  selectVendorFetchStatus,
  selectVendorFormData,
  selectVendorProfile,
} from "../../redux/vendorInfoSlice";

// ─── Progress Step ────────────────────────────────────────────────────────────
function ProgressStep({
  step,
  label,
  sublabel,
  status,
  colors,
  radii,
  isDark,
}) {
  const isDone = status === "done";
  const isActive = status === "active";

  const circleBg = isDone
    ? colors.secondary
    : isActive
      ? isDark
        ? "rgba(93,182,74,0.15)"
        : "rgba(93,182,74,0.06)"
      : "transparent";

  const circleBorder =
    isDone || isActive ? colors.secondary : colors.border || "rgba(0,0,0,0.1)";
  const textColor = isDone || isActive ? colors.text : colors.textMuted;
  const subColor = isDone || isActive ? colors.textSecondary : colors.textMuted;

  return (
    <View style={styles.stepWrapper}>
      <View
        style={[
          styles.stepCircle,
          {
            backgroundColor: circleBg,
            borderColor: circleBorder,
            borderRadius: radii.full || 99,
            borderWidth: isDone ? 0 : 1.5,
          },
        ]}
      >
        {isDone ? (
          <Text style={styles.stepCheck}>✓</Text>
        ) : isActive ? (
          <View
            style={[styles.activeDot, { backgroundColor: colors.secondary }]}
          />
        ) : (
          <Text style={[styles.stepNum, { color: colors.textMuted }]}>
            {step}
          </Text>
        )}
      </View>
      <Text style={[styles.stepLabel, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.stepSub, { color: subColor }]} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ colors, radii, isDark, vendorStatus, submittedAt }) {
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Submitted";

  const connector2Filled = vendorStatus === "approved";

  return (
    <View style={styles.progressBarRow}>
      <ProgressStep
        step={1}
        label="Submitted"
        sublabel={submittedLabel}
        status="done"
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
      <View style={[styles.connector, { backgroundColor: colors.secondary }]} />
      <ProgressStep
        step={2}
        label="Under Review"
        sublabel="Admin evaluation"
        status={vendorStatus === "approved" ? "done" : "active"}
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
      <View
        style={[
          styles.connector,
          {
            backgroundColor: connector2Filled
              ? colors.secondary
              : colors.border || "rgba(0,0,0,0.08)",
          },
        ]}
      />
      <ProgressStep
        step={3}
        label="Approved"
        sublabel={
          vendorStatus === "approved" ? "Approved!" : "Awaiting decision"
        }
        status={vendorStatus === "approved" ? "done" : "pending"}
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
    </View>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ fields, colors }) {
  return (
    <View style={styles.tableRow}>
      {fields.map((f, i) => (
        <View key={i} style={styles.tableCell}>
          <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
            {f.label}
          </Text>
          <Text
            style={[
              styles.cellValue,
              { color: f.value ? colors.text : colors.textMuted },
            ]}
            numberOfLines={2}
          >
            {f.value || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SellerInfo() {
  const { colors, typography, radii, shadows, isDark } = useTheme();
  const grid = useGridConfig();
  const dispatch = useDispatch();

  const vendor = useSelector(selectVendorProfile);
  const formData = useSelector(selectVendorFormData);
  const fetchStatus = useSelector(selectVendorFetchStatus);

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

  // ── Derive seller data ────────────────────────────────────────────────────────
  // Priority: vendor.sellerDetails (backend) → formData (in-memory wizard)
  const sd = vendor?.sellerDetails || {};

  // ── Schema field names (sellerDetails in Mongoose model) ─────────────────
  // schema: sellerName / sellerEmail / sellerPhone (same as wizard)
  const sellerName = sd.sellerName || formData.sellerName || "";
  const sellerEmail = sd.sellerEmail || formData.sellerEmail || "";
  const sellerPhone = sd.sellerPhone || formData.sellerPhone || "";
  // schema: address  →  wizard formData: sellerAddress
  const sellerAddress = sd.address || formData.sellerAddress || "";
  // schema: city     →  wizard formData: sellerCity
  const sellerCity = sd.city || formData.sellerCity || "";
  // schema: state    →  wizard formData: sellerState
  const sellerState = sd.state || formData.sellerState || "";
  // schema: pincode  →  wizard formData: sellerPincode
  const sellerPincode = sd.pincode
    ? String(sd.pincode)
    : formData.sellerPincode || "";

  const vendorStatus = vendor?.status || "pending";
  const submittedAt = vendor?.updatedAt || vendor?.createdAt;

  // Display name in header — use seller name, fallback to business name
  const bd = vendor?.businessDetails || {};
  const displayName =
    sellerName || bd.businessName || formData.businessName || "Vendor";

  const cardStyle = {
    backgroundColor: colors.card || colors.background,
    borderRadius: radii.xl || 16,
    borderColor: colors.border || "rgba(0,0,0,0.06)",
    borderWidth: 1,
    ...(!isDark && shadows.sm),
    overflow: "hidden",
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.loaderWrap, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
          Loading seller information…
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
            {displayName}
          </Text>
        </View>

        {/* ── Main Card ── */}
        <View style={cardStyle}>
          {/* Progress Section */}
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
                : "Your application is currently "}
              {vendorStatus === "pending" && (
                <Text style={{ color: colors.secondary, fontWeight: "600" }}>
                  under review
                </Text>
              )}
              {vendorStatus === "pending" &&
                " by our team. We'll notify you once a decision is made."}
            </Text>
            <ProgressBar
              colors={colors}
              radii={radii}
              isDark={isDark}
              vendorStatus={vendorStatus}
              submittedAt={submittedAt}
            />
          </View>

          {/* ── Seller Information heading ── */}
          <View style={[styles.cardSection, { paddingBottom: 4 }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, ...typography.heading3, fontSize: 16 },
              ]}
            >
              Seller Information
            </Text>
          </View>

          {/* ── Seller Data Rows ── */}
          <InfoRow
            colors={colors}
            fields={[
              { label: "Seller Name", value: sellerName },
              { label: "Seller Email", value: sellerEmail },
            ]}
          />
          <InfoRow
            colors={colors}
            fields={[
              { label: "Phone", value: sellerPhone },
              { label: "City", value: sellerCity },
            ]}
          />
          <InfoRow
            colors={colors}
            fields={[
              { label: "State", value: sellerState },
              { label: "Pincode", value: sellerPincode },
            ]}
          />
          {sellerAddress ? (
            <InfoRow
              colors={colors}
              fields={[{ label: "Address", value: sellerAddress }]}
            />
          ) : null}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  greeting: {
    marginBottom: 4,
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textTransform: "capitalize",
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
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  stepWrapper: {
    alignItems: "center",
    width: 76,
  },
  stepCircle: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepCheck: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.1,
  },
  stepSub: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
    opacity: 0.8,
  },
  connector: {
    flex: 1,
    height: 2,
    marginBottom: 32,
    borderRadius: 1,
    marginHorizontal: -4,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: "wrap",
    gap: 12,
  },
  tableCell: {
    flex: 1,
    minWidth: 130,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cellValue: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
});
