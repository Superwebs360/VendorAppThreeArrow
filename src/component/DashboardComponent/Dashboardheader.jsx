import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Typography, useTheme } from "../../constants/theme";

/**
 * DashboardHeader
 *
 * Props:
 *  - onBellPress: ({ x, y }) => void
 *    Parent (Dashboard) is the one who owns the overlay state.
 *    When the bell is pressed, we measure its screen position and
 *    pass it up so the circular reveal starts from exactly this point.
 */
export default function DashboardHeader({ onBellPress }) {
  const { colors } = useTheme();
  const bellRef = useRef(null);

  const handleBellPress = () => {
    if (bellRef.current) {
      // measureInWindow gives us the bell's actual position on screen
      bellRef.current.measureInWindow((x, y, width, height) => {
        // Pass the centre of the bell button up to the parent
        onBellPress?.({ x: x + width / 2, y: y + height / 2 });
      });
    } else {
      onBellPress?.(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Row 1: Logo + Bell */}
      <View style={styles.row}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        {/* Bell button — ref attached so we can measure its position */}
        <Pressable
          ref={bellRef}
          onPress={handleBellPress}
          style={[
            styles.bell,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          hitSlop={8}
        >
          <Feather name="bell" size={20} color={colors.text} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </Pressable>
      </View>

      {/* Row 2: Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.hello, { color: colors.text }]}>
          Hello, Storefront
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Here is what is happening with your shop today.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginTop: -20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  logoContainer: {
    height: 60,
    width: 170,
  },
  logoImage: {
    width: 180,
    height: 80,
    marginLeft: -20,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 8,
    right: 8,
  },
  greeting: { gap: 4 },
  hello: {
    ...Typography.heading1,
  },
  sub: {
    ...Typography.body,
    lineHeight: 20,
  },
});
