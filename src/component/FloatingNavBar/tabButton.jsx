// tabButton.jsx
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function TabButton({
  focused,
  icon,
  label,
  onPress,
  activeColor,
  inactiveColor,
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(focused ? 1.05 : 1, { damping: 12, stiffness: 160 }),
      },
      { translateY: withSpring(focused ? -1 : 0) },
    ],
  }));

  // ✅ Build focused styles conditionally — avoid undefined color in Reanimated
  const focusedBoxStyle = focused
    ? {
        backgroundColor: activeColor + "29",
        borderWidth: 1,
        borderColor: activeColor + "38",
      }
    : {};

  return (
    <Pressable onPress={onPress} style={styles.tab} android_ripple={null}>
      <Animated.View style={[styles.iconBox, focusedBoxStyle, animatedStyle]}>
        {icon}
        <Text
          style={[
            styles.label,
            { color: focused ? activeColor : inactiveColor },
            focused && styles.activeLabel,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconBox: {
    width: 68,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    gap: 2,
  },
  label: { fontSize: 10, fontWeight: "700" },
  activeLabel: { fontWeight: "900" },
});
