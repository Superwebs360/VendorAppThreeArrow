// FloatingTabBar.jsx
import { useTheme } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import TabButton from "./tabButton";

export default function FloatingTabBar({
  insets,
  descriptors,
  navigation,
  state,
}) {
  const { colors, isDark } = useTheme();

  // ✅ Use directly as strings, not destructured objects
  const GREEN = colors.secondary;
  const INACTIVE = colors.textSecondary;

  const icons = {
    dashboard: (focused) => (
      <MaterialIcons
        name="space-dashboard"
        size={24}
        color={focused ? GREEN : INACTIVE}
      />
    ),
    category: (focused) => (
      <MaterialIcons
        name="category"
        size={24}
        color={focused ? GREEN : INACTIVE}
      />
    ),

    product: (focused) => (
      <Ionicons name="cube" size={24} color={focused ? GREEN : INACTIVE} />
    ),

    order: (focused) => (
      <Ionicons name="heart" size={24} color={focused ? GREEN : INACTIVE} />
    ),

    profile: (focused) => (
      <Ionicons name="person" size={24} color={focused ? GREEN : INACTIVE} />
    ),
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom + 5, 14) }]}
    >
      <BlurView
        intensity={isDark ? 60 : 95}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.blur,
          {
            backgroundColor: isDark
              ? "rgba(26,29,38,0.85)"
              : "rgba(179, 177, 177, 0.97)",
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark
                ? "rgba(34,38,50,0.6)"
                : "rgba(255,255,255,0.42)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.9)",
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const label = descriptors[route.key]?.options?.title || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                label={label}
                focused={focused}
                onPress={onPress}
                icon={icons[route.name]?.(focused)} // ✅ icon not icons
                activeColor={GREEN}
                inactiveColor={INACTIVE}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14, zIndex: 999 },
  blur: { borderRadius: 34, overflow: "hidden" },
  container: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderRadius: 34,
    borderWidth: 1,
  },
});
