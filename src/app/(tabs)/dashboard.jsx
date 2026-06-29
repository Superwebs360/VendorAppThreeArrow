import DashboardHeader from "@/component/DashboardComponent/Dashboardheader";
import RecentProducts from "@/component/DashboardComponent/Recentproducts";
import StatsCards from "@/component/DashboardComponent/Statscards";
import StoreInsights from "@/component/DashboardComponent/Storeinsights";
import NotificationOverlay from "@/component/OrderComponent/NotificationOverlay";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import AllProductsScreen from "../Screens/Product";

// ── Import the same NotificationOverlay used in OrderScreen ─────────────────
export default function Dashboard() {
  const { colors, isDark } = useTheme();

  // Notification overlay
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);

  // All Products screen — origin is the {x, y} of the "View All" button
  const [allProductsVisible, setAllProductsVisible] = useState(false);
  const [viewAllOrigin, setViewAllOrigin] = useState(null);

  const handleBellPress = (origin) => {
    setNotifOrigin(origin);
    setNotifVisible(true);
  };

  // Called by RecentProducts with the measured position of "View All"
  const handleViewAll = (origin) => {
    setViewAllOrigin(origin);
    setAllProductsVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <DashboardHeader onBellPress={handleBellPress} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatsCards />
        <View style={styles.section}>
          <RecentProducts onViewAll={handleViewAll} />
        </View>
        <StoreInsights />
      </ScrollView>

      <NotificationOverlay
        visible={notifVisible}
        origin={notifOrigin}
        onClose={() => setNotifVisible(false)}
        colors={colors}
        isDark={isDark}
      />

      {/* ── All Products — circular reveal from "View All" button ── */}
      <AllProductsScreen
        visible={allProductsVisible}
        origin={viewAllOrigin}
        onClose={() => setAllProductsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.xl,
  },
  section: {},
});
