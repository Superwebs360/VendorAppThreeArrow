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

// ── Import the same NotificationOverlay used in OrderScreen ─────────────────

export default function Dashboard() {
  const { colors, isDark } = useTheme();

  // Notification overlay state — lives here so the overlay can cover
  // the entire screen (SafeAreaView + ScrollView + Header).
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifOrigin, setNotifOrigin] = useState(null);

  // Called by DashboardHeader when bell is pressed.
  // `origin` = { x, y } centre of the bell button on screen.
  const handleBellPress = (origin) => {
    setNotifOrigin(origin);
    setNotifVisible(true);
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

      {/* Sticky header — outside ScrollView so it never scrolls.
          We pass onBellPress so the header can report the bell's position. */}
      <DashboardHeader onBellPress={handleBellPress} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatsCards />
        <View style={styles.section}>
          <RecentProducts onViewAll={() => {}} />
        </View>
        <StoreInsights />
      </ScrollView>

      {/* ── Notification overlay ─────────────────────────────────────────────
          Rendered OUTSIDE the ScrollView and AFTER everything else so it
          sits on top of the entire screen (zIndex 100 handles the rest).   */}
      <NotificationOverlay
        visible={notifVisible}
        origin={notifOrigin}
        onClose={() => setNotifVisible(false)}
        colors={colors}
        isDark={isDark}
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
