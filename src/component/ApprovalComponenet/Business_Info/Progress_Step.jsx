import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Progress Step ────────────────────────────────────────────────────────────
export default function ProgressStep({
  step,
  label,
  sublabel,
  status,
  colors,
  radii,
  isDark,
}) {
  const isDone = status === "done";
  const isActive = status === "active";

  const circleBg = isDone
    ? colors.secondary
    : isActive
      ? isDark
        ? "rgba(93,182,74,0.15)"
        : "rgba(93,182,74,0.06)"
      : "transparent";

  const circleBorder =
    isDone || isActive ? colors.secondary : colors.border || "rgba(0,0,0,0.1)";
  const textColor = isDone || isActive ? colors.text : colors.textMuted;
  const subColor = isDone || isActive ? colors.textSecondary : colors.textMuted;

  return (
    <View style={styles.stepWrapper}>
      <View
        style={[
          styles.stepCircle,
          {
            backgroundColor: circleBg,
            borderColor: circleBorder,
            borderRadius: radii.full || 99,
            borderWidth: isDone ? 0 : 1.5,
          },
        ]}
      >
        {isDone ? (
          <Text style={styles.stepCheck}>✓</Text>
        ) : isActive ? (
          <View
            style={[styles.activeDot, { backgroundColor: colors.secondary }]}
          />
        ) : (
          <Text style={[styles.stepNum, { color: colors.textMuted }]}>
            {step}
          </Text>
        )}
      </View>
      <Text style={[styles.stepLabel, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.stepSub, { color: subColor }]} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stepWrapper: {
    alignItems: "center",
    width: 76,
  },
  stepCircle: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepCheck: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.1,
  },
  stepSub: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
    opacity: 0.8,
  },
});
