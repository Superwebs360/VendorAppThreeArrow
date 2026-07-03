import FloatingTabBar from "@/component/FloatingNavBar/FloatingTabBar";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GREEN = "#5BB74A";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "ios") {
    return (
      <NativeTabs tintColor={GREEN}>
        <NativeTabs.Trigger name="dashboard">
          <NativeTabs.Trigger.Label>DashBoard</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{
              default: "chart.bar",
              selected: "chart.bar.fill",
            }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="product">
          <NativeTabs.Trigger.Label>Product</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "shippingbox", selected: "shippingbox.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="order">
          <NativeTabs.Trigger.Label>Order</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "text.document", selected: "text.document.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile" role="search">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} insets={insets} />}
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="product" options={{ title: "Product" }} />
      <Tabs.Screen name="order" options={{ title: "Orders" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
