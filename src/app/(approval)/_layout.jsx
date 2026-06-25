import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function ApprovalLayout() {
  if (Platform.OS === "ios") {
    return (
      // NativeTabs (UITabBarController) has no swipe gestures by default —
      // no extra prop needed here.
      <NativeTabs tintColor="#5BB74A">
        <NativeTabs.Trigger name="bussiness_info">
          <NativeTabs.Trigger.Label>Business</NativeTabs.Trigger.Label>

          <NativeTabs.Trigger.Icon
            sf={{
              default: "building.2",
              selected: "building.2.fill",
            }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="seller_info">
          <NativeTabs.Trigger.Label>Seller</NativeTabs.Trigger.Label>

          <NativeTabs.Trigger.Icon
            sf={{
              default: "person.text.rectangle",
              selected: "person.text.rectangle.fill",
            }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Android: Tabs uses a ViewPager under the hood — swipeEnabled: false kills swipe.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5BB74A",
        // ↓ Disables horizontal swipe between tabs on Android
        gestureEnabled: false,
      }}
    >
      <Tabs.Screen
        name="bussiness_info"
        options={{
          title: "Business",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="office-building"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="seller_info"
        options={{
          title: "Seller",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-badge"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
