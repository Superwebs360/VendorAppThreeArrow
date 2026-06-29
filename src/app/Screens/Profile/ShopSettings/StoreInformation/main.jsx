import { SPACING, useGridConfig } from "@/constants/gridConfig";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Section config ───────────────────────────────────────────────────────────
// `route` must match the actual folder name under
// Screens/Profile/ShopSettings/StoreInformation/
const SECTIONS = [
  {
    key: "StoreProfile",
    route: "StoreProfile",
    label: "Store Profile",
    desc: "Name, logo & description",
    icon: "storefront-outline",
    color: "#FB8106",
  },
  {
    key: "store-address",
    route: "StoreAddress",
    label: "Store Address",
    desc: "Pickup & warehouse location",
    icon: "location-outline",
    color: "#5BB74A",
  },
  {
    key: "contact",
    route: "ContactInformation",
    label: "Contact Information",
    desc: "Phone, email & support",
    icon: "call-outline",
    color: "#3B82F6",
  },
  {
    key: "business-hours",
    route: "BusinessHours",
    label: "Business Hours",
    desc: "Open & close timings",
    icon: "time-outline",
    color: "#8B5CF6",
  },
  {
    key: "delivery",
    route: "DeliveryInformation",
    label: "Delivery Information",
    desc: "Zones, charges & ETA",
    icon: "bicycle-outline",
    color: "#EC4899",
  },
  // {
  //   key: "payment",
  //   route: "PaymentInformation",
  //   label: "Payment Information",
  //   desc: "Bank, UPI & payout",
  //   icon: "card-outline",
  //   color: "#F59E0B",
  // },
  // {
  //   key: "documents",
  //   route: "StoreDocuments",
  //   label: "Store Documents",
  //   desc: "GST, FSSAI & licences",
  //   icon: "document-text-outline",
  //   color: "#14B8A6",
  // },
  // {
  //   key: "online-presence",
  //   route: "OnlinePresence",
  //   label: "Online Presence",
  //   desc: "Website & social links",
  //   icon: "globe-outline",
  //   color: "#6366F1",
  // },
  // {
  //   key: "settings",
  //   route: "StoreSettings",
  //   label: "Store Settings",
  //   desc: "Visibility & preferences",
  //   icon: "settings-outline",
  //   color: "#64748B",
  // },
  // {
  //   key: "customer-info",
  //   route: "CustomerInformation",
  //   label: "Customer Information",
  //   desc: "Reviews & loyalty config",
  //   icon: "star-outline",
  //   color: "#F97316",
  // },
];

// ─── Main screen ──────────────────────────────────────────────────────────────
const StoreSettingsScreen = () => {
  const { colors, typography, radii, shadows } = useTheme();
  const { cardWidth, cardGap, numColumns, isTablet } = useGridConfig();
  const router = useRouter();

  // On tablets use 3 cols, phones 2
  const cols = isTablet ? 3 : 2;

  // Card width based on cols
  const gap = SPACING.md;
  const hPad = SPACING.xl;
  const { width: screenW } = require("react-native").Dimensions.get("window");
  const tileW = Math.floor((screenW - hPad * 2 - gap * (cols - 1)) / cols);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text, ...typography.heading3 },
            ]}
          >
            Store Management
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: colors.textSecondary, ...typography.caption },
            ]}
          >
            {SECTIONS.length} sections
          </Text>
        </View>

        <View
          style={[
            styles.headerBadge,
            {
              backgroundColor: colors.secondary + "18",
              borderColor: colors.secondary + "35",
            },
          ]}
        >
          <Ionicons name="storefront" size={17} color={colors.secondary} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: hPad, paddingBottom: 48 },
        ]}
      >
        {/* ── Intro banner ── */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.secondary + "0E",
              borderColor: colors.secondary + "28",
              borderRadius: radii.lg,
            },
          ]}
        >
          <View
            style={[
              styles.bannerIcon,
              { backgroundColor: colors.secondary + "20" },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.secondary}
            />
          </View>
          <Text
            style={[
              styles.bannerTxt,
              { color: colors.text, ...typography.caption },
            ]}
          >
            Keep your store info updated to build customer trust and improve
            delivery accuracy.
          </Text>
        </View>

        {/* ── Grid ── */}
        <View style={[styles.grid, { gap }]}>
          {SECTIONS.map((s) => (
            <Tile
              key={s.key}
              section={s}
              width={tileW}
              colors={colors}
              typography={typography}
              radii={radii}
              shadows={shadows}
              // ── FIX: route per-section instead of hardcoded StoreProfile ──
              onPress={() =>
                router.push(
                  `/Screens/Profile/ShopSettings/StoreInformation/${s.route}`,
                )
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Tile component ───────────────────────────────────────────────────────────
const Tile = ({
  section,
  width,
  colors,
  typography,
  radii,
  shadows,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.82}
    style={[
      styles.tile,
      {
        width,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: radii.lg,
        ...shadows.sm,
      },
    ]}
  >
    {/* Coloured icon block */}
    <View
      style={[styles.tileIconWrap, { backgroundColor: section.color + "18" }]}
    >
      <Ionicons name={section.icon} size={24} color={section.color} />
    </View>

    {/* Text */}
    <Text
      style={[
        styles.tileLabel,
        { color: colors.text, ...typography.bodyMedium },
      ]}
      numberOfLines={2}
    >
      {section.label}
    </Text>
    <Text
      style={[
        styles.tileDesc,
        { color: colors.textSecondary, ...typography.caption },
      ]}
      numberOfLines={2}
    >
      {section.desc}
    </Text>

    {/* Arrow */}
    <View style={[styles.tileArrow, { backgroundColor: section.color + "12" }]}>
      <Ionicons name="chevron-forward" size={13} color={section.color} />
    </View>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontWeight: "700", marginBottom: 1 },
  headerSub: { opacity: 0.7 },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { paddingTop: SPACING.xl },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTxt: { flex: 1, lineHeight: 18 },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // Tile
  tile: {
    borderWidth: 1,
    padding: 16,
    marginBottom: SPACING.md,
    gap: 6,
  },
  tileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tileLabel: {
    fontWeight: "600",
    lineHeight: 20,
  },
  tileDesc: {
    lineHeight: 17,
    opacity: 0.75,
    marginBottom: 8,
  },
  tileArrow: {
    alignSelf: "flex-start",
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
});

export default StoreSettingsScreen;
