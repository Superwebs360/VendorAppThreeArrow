// StepProgressBar.jsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../constants/theme";

const STEPS = [
  { id: 1, label: "Business details" },
  { id: 2, label: "Seller details" },
  { id: 3, label: "Brand details" },
  { id: 4, label: "Bank details" },
  { id: 5, label: "Shipping locations" },
  { id: 6, label: "Digital signature" },
  { id: 7, label: "Verify & submit" },
];

export default function StepProgressBar({
  currentStep = 1,
  completedSteps = [],
}) {
  const { colors, radii, isDark } = useTheme();

  const isCompleted = (id) => completedSteps.includes(id);
  const isCurrent = (id) => id === currentStep;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.divider || "rgba(0,0,0,0.05)",
        },
      ]}
    >
      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STEPS.map((step, index) => {
          const done = isCompleted(step.id);
          const active = isCurrent(step.id);
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step.id} style={styles.stepRow}>
              {/* Step Item Content Node */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: done
                        ? colors.secondary
                        : active
                          ? isDark
                            ? "rgba(93,182,74,0.12)"
                            : "rgba(93,182,74,0.06)"
                          : isDark
                            ? "rgba(255,255,255,0.03)"
                            : colors.surface || "#F3F4F6",
                      borderWidth: done ? 0 : 1.5,
                      borderColor: active
                        ? colors.secondary
                        : done
                          ? "transparent"
                          : colors.border || "rgba(0,0,0,0.08)",
                    },
                  ]}
                >
                  {done ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : active ? (
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: colors.secondary },
                      ]}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.stepNum,
                        {
                          color: colors.textMuted,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: active
                        ? colors.text
                        : done
                          ? colors.textSecondary
                          : colors.textMuted,
                      fontWeight: active ? "700" : "500",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>

              {/* Seamless Segment Connector line */}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: done
                        ? colors.secondary
                        : colors.border || "rgba(0,0,0,0.08)",
                      opacity: done ? 1 : 0.6,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    minWidth: 80,
    paddingHorizontal: 2,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepNum: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 88,
    letterSpacing: -0.1,
    lineHeight: 14,
  },
  line: {
    width: 32,
    height: 2,
    marginHorizontal: -4,
    marginBottom: 20,
    borderRadius: 1,
  },
});
