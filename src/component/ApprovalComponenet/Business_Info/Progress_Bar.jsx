import React from "react";
import { StyleSheet, View } from "react-native";
import ProgressStep from "../Business_Info/Progress_Step";

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export default function ProgressBar({
  colors,
  radii,
  isDark,
  vendorStatus,
  submittedAt,
}) {
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Submitted";

  const step3Status = vendorStatus === "approved" ? "done" : "pending";
  const connector2Filled = vendorStatus === "approved";

  return (
    <View style={styles.progressBarRow}>
      <ProgressStep
        step={1}
        label="Submitted"
        sublabel={submittedLabel}
        status="done"
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
      <View style={[styles.connector, { backgroundColor: colors.secondary }]} />
      <ProgressStep
        step={2}
        label="Under Review"
        sublabel="Admin evaluation"
        status={vendorStatus === "approved" ? "done" : "active"}
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
      <View
        style={[
          styles.connector,
          {
            backgroundColor: connector2Filled
              ? colors.secondary
              : colors.border || "rgba(0,0,0,0.08)",
          },
        ]}
      />
      <ProgressStep
        step={3}
        label="Approved"
        sublabel={
          vendorStatus === "approved" ? "Approved!" : "Awaiting decision"
        }
        status={step3Status}
        colors={colors}
        radii={radii}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  connector: {
    flex: 1,
    height: 2,
    marginBottom: 32,
    borderRadius: 1,
    marginHorizontal: -4,
  },
});
