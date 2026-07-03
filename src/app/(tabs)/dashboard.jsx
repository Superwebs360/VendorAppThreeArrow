import DashboardHeader from "@/component/DashboardComponent/Dashboardheader";
import RecentProducts from "@/component/DashboardComponent/Recentproducts";
import StatsCards from "@/component/DashboardComponent/Statscards";
import StoreInsights from "@/component/DashboardComponent/Storeinsights";
import NotificationOverlay from "@/component/OrderComponent/NotificationOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useStore } from "react-redux";
import { SPACING } from "../../constants/gridConfig";
import { useTheme } from "../../constants/theme";
import { fetchVendorOrders } from "../../redux/orderSlice";
import { getMyProducts } from "../../redux/productSlice";
import AllProductsScreen from "../Screens/Product";

export default function Dashboard() {
  const { colors, isDark } = useTheme();
  const store = useStore();
  const dispatch = useDispatch();

  // Notification overlay
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);

  // All Products screen
  const [allProductsVisible, setAllProductsVisible] = useState(false);
  const [viewAllOrigin, setViewAllOrigin] = useState(null);
  const [productsInitialFilters, setProductsInitialFilters] = useState(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      await Promise.all([
        dispatch(fetchVendorOrders({ page: 1, limit: 100 })),
        dispatch(getMyProducts({ token, page: 1, limit: 100 })),
      ]);
    } catch {
      // individual thunk errors already land in their own slice's error state
    }
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const handleBellPress = (origin) => {
    setNotifOrigin(origin);
    setNotifVisible(true);
  };

  // RecentProducts "View All" -> plain inventory view, no special filter
  const handleViewAll = (origin) => {
    setViewAllOrigin(origin);
    setProductsInitialFilters(null);
    setAllProductsVisible(true);
  };

  // StatsCards "Low Stock" card -> inventory view pre-filtered + sorted
  const handleOpenProductsWithFilter = (origin, filters) => {
    setViewAllOrigin(origin);
    setProductsInitialFilters(filters);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
          />
        }
      >
        <StoreInsights />
        <StatsCards onOpenProducts={handleOpenProductsWithFilter} />
        <View style={styles.section}>
          <RecentProducts onViewAll={handleViewAll} />
        </View>
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
        initialFilters={productsInitialFilters}
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
