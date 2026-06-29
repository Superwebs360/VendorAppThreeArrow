import DashboardHeader from "@/component/DashboardComponent/Dashboardheader";
import RecentProducts from "@/component/DashboardComponent/Recentproducts";
import StatsCards from "@/component/DashboardComponent/Statscards";
import StoreInsights from "@/component/DashboardComponent/Storeinsights";
import NotificationOverlay from "@/component/OrderComponent/NotificationOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "react-redux";
import { SPACING } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import VendorSocket from "../../redux/vendorSocket";
import AllProductsScreen from "../Screens/Product";

export default function Dashboard() {
  const { colors, isDark } = useTheme();
  const store = useStore();

  // Notification overlay
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);

  // All Products screen
  const [allProductsVisible, setAllProductsVisible] = useState(false);
  const [viewAllOrigin, setViewAllOrigin] = useState(null);

  // ── Connect socket once on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("vendorToken");
      if (token) VendorSocket.connect(token, store);
    })();

    return () => VendorSocket.disconnect();
  }, []);

  const handleBellPress = (origin) => {
    setNotifOrigin(origin);
    setNotifVisible(true);
  };

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

      {/* Pass colors so DashboardHeader can render UnreadBadge */}
      <DashboardHeader onBellPress={handleBellPress} colors={colors} />

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
