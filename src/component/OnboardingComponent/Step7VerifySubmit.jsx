// Step7VerifySubmit.jsx
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COMPONENT } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";

function SectionCard({ title, complete, children, onEdit }) {
  const { colors, radii, isDark } = useTheme();
  return (
    <View
      style={[
        styles.sectionCard,
        {
          borderColor: colors.border || "rgba(0,0,0,0.08)",
          backgroundColor: colors.card || colors.background,
          borderRadius: radii.m || 12,
        },
      ]}
    >
      <View
        style={[
          styles.sectionHeader,
          {
            borderBottomWidth: complete ? 1 : 0,
            borderBottomColor: colors.divider || "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {complete ? (
            <View
              style={[styles.statusIcon, { backgroundColor: colors.secondary }]}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                ✓
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                },
              ]}
            >
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>○</Text>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        <Text
          style={[
            styles.badge,
            { color: complete ? colors.secondary : colors.textMuted },
          ]}
        >
          {complete ? "Complete" : "Incomplete"}
        </Text>
      </View>

      {complete ? (
        <View style={styles.sectionBody}>{children}</View>
      ) : (
        <View style={styles.incompleteBody}>
          <Text style={[styles.incompleteText, { color: colors.textMuted }]}>
            Not completed yet — go back to fill this section.
          </Text>
        </View>
      )}
    </View>
  );
}

function DataRow({ label, value }) {
  const { colors } = useTheme();
  return (
    <View style={styles.dataRow}>
      <View style={styles.dataCell}>
        <Text style={[styles.dataLabel, { color: colors.textMuted }]}>
          {label.toUpperCase()}
        </Text>
        <Text
          style={[styles.dataValue, { color: colors.text }]}
          numberOfLines={2}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

function DataGrid({ items }) {
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1]]);
  }
  return (
    <View style={{ gap: 4 }}>
      {pairs.map((pair, idx) => (
        <View key={idx} style={styles.dataGridRow}>
          <View style={styles.dataGridCell}>
            <DataRow label={pair[0].label} value={pair[0].value} />
          </View>
          {pair[1] ? (
            <View style={styles.dataGridCell}>
              <DataRow label={pair[1].label} value={pair[1].value} />
            </View>
          ) : (
            <View style={styles.dataGridCell} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function Step7VerifySubmit({ formData, onSubmit, onGoToStep }) {
  const { colors, radii, isDark } = useTheme();

  const isComplete = {
    business: !!(
      formData.businessName &&
      formData.businessType &&
      formData.gstNumber
    ),
    seller: !!(
      formData.sellerName &&
      formData.sellerEmail &&
      formData.sellerPhone
    ),
    brand: !!(formData.brandName && formData.brandType),
    bank: !!(
      formData.accountHolder &&
      formData.bankName &&
      formData.accountNumber &&
      formData.ifscCode
    ),
    shipping: !!(
      formData.warehouseAddress &&
      formData.warehouseCity &&
      formData.warehousePincode
    ),
    signature: !!formData.digitalSignConfirmed,
  };

  const completedCount = Object.values(isComplete).filter(Boolean).length;
  const incompleteCount = 6 - completedCount;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Review Application
          </Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Verify all sections before final submission
          </Text>
        </View>
        <View
          style={[
            styles.progressBadge,
            {
              backgroundColor: isDark
                ? "rgba(93,182,74,0.12)"
                : "rgba(93,182,74,0.06)",
              borderColor: isDark
                ? "rgba(93,182,74,0.25)"
                : "rgba(93,182,74,0.15)",
            },
          ]}
        >
          <Text
            style={{ color: colors.secondary, fontSize: 12, fontWeight: "600" }}
          >
            {completedCount} / 6 Complete
          </Text>
        </View>
      </View>

      {/* Business Details */}
      <SectionCard title="Business Details" complete={isComplete.business}>
        <DataGrid
          items={[
            { label: "Business Name", value: formData.businessName },
            { label: "Business Type", value: formData.businessType },
            { label: "GST Number", value: formData.gstNumber },
            { label: "PAN Number", value: formData.panNumber },
            { label: "Business Email", value: formData.businessEmail },
            { label: "Business Phone", value: formData.businessPhone },
            { label: "Year Established", value: formData.yearEstablished },
            { label: "Employees", value: formData.employees },
          ]}
        />
      </SectionCard>

      {/* Seller Details */}
      <SectionCard title="Seller Details" complete={isComplete.seller}>
        <DataGrid
          items={[
            { label: "Seller Name", value: formData.sellerName },
            { label: "Seller Email", value: formData.sellerEmail },
            { label: "Phone", value: formData.sellerPhone },
            { label: "Address", value: formData.sellerAddress },
            { label: "City", value: formData.sellerCity },
            { label: "State", value: formData.sellerState },
            { label: "Pincode", value: formData.sellerPincode },
          ]}
        />
      </SectionCard>

      {/* Brand Details */}
      <SectionCard title="Brand Details" complete={isComplete.brand}>
        <DataGrid
          items={[
            { label: "Brand Name", value: formData.brandName },
            { label: "Brand Type", value: formData.brandType },
            { label: "Trademark Number", value: formData.trademarkNumber },
            { label: "Website", value: formData.brandWebsite },
          ]}
        />
      </SectionCard>

      {/* Bank Details */}
      <SectionCard title="Bank Details" complete={isComplete.bank}>
        <DataGrid
          items={[
            { label: "Account Holder", value: formData.accountHolder },
            { label: "Bank Name", value: formData.bankName },
            {
              label: "Account Number",
              value: formData.accountNumber
                ? "•••• " + formData.accountNumber.slice(-4)
                : "",
            },
            { label: "IFSC Code", value: formData.ifscCode },
            { label: "Branch", value: formData.branch },
          ]}
        />
      </SectionCard>

      {/* Shipping */}
      <SectionCard title="Shipping Locations" complete={isComplete.shipping}>
        <DataGrid
          items={[
            { label: "Warehouse Address", value: formData.warehouseAddress },
            { label: "City", value: formData.warehouseCity },
            { label: "State", value: formData.warehouseState },
            { label: "Pincode", value: formData.warehousePincode },
            { label: "Latitude", value: formData.latitude },
            { label: "Longitude", value: formData.longitude },
          ]}
        />
      </SectionCard>

      {/* Digital Signature */}
      <SectionCard title="Digital Signature" complete={isComplete.signature}>
        <Text style={{ color: "#5BB74A", fontSize: 13, fontWeight: "600" }}>
          ✓ Application authorized by digital signature
        </Text>
      </SectionCard>

      {/* Confirmation + Submit */}
      <View style={styles.bottomSection}>
        <View
          style={[
            styles.confirmBanner,
            {
              backgroundColor: isDark
                ? "rgba(93,182,74,0.1)"
                : "rgba(93,182,74,0.04)",
              borderColor: isDark
                ? "rgba(93,182,74,0.25)"
                : "rgba(93,182,74,0.12)",
            },
          ]}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            ✓ I confirm that all information provided is{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              true, accurate, and complete
            </Text>
            . I understand that submitting false information may result in
            rejection or account termination.
          </Text>
        </View>

        {incompleteCount > 0 && (
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: isDark ? "rgba(249,115,22,0.1)" : "#FFF7ED",
                borderColor: isDark ? "rgba(249,115,22,0.25)" : "#FED7AA",
              },
            ]}
          >
            <Text
              style={{
                color: isDark ? "#FB923C" : "#C2410C",
                fontSize: 13,
                lineHeight: 18,
                fontWeight: "500",
              }}
            >
              ⚠ {incompleteCount} section(s) are not yet complete. You can still
              submit, but incomplete profiles may experience approval delays.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          // onPress={() => {
          //   router.push("/(approval)/bussiness_info");
          // }}
          style={[
            styles.submitBtn,
            { backgroundColor: colors.secondary, borderRadius: radii.s || 8 },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  heading: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  subheading: { fontSize: 13, marginTop: 4, opacity: 0.8 },
  progressBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionCard: {
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  statusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", letterSpacing: -0.1 },
  badge: { fontSize: 12, fontWeight: "600" },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 },
  incompleteBody: { padding: 14, paddingTop: 4 },
  incompleteText: { fontSize: 13, opacity: 0.8 },
  dataGridRow: { flexDirection: "row", gap: 12 },
  dataGridCell: { flex: 1 },
  dataRow: { paddingVertical: 6 },
  dataLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 4,
    fontWeight: "600",
  },
  dataValue: { fontSize: 14, fontWeight: "500", lineHeight: 18 },
  bottomSection: { marginTop: 12, gap: 12 },
  confirmBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  warningBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  submitBtn: {
    height: COMPONENT?.buttonHeight || 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
