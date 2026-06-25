// Step6DigitalSign.jsx
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../constants/theme";

const CHECKLIST = [
  "Ensure all information provided is accurate and truthful",
  "Review all documents and details in previous steps",
  "You are responsible for the truth of the information",
  "False information may lead to rejection",
];

export default function Step6DigitalSign({ formData, onChange }) {
  const { colors, radii, isDark } = useTheme();
  const confirmed = formData.digitalSignConfirmed || false;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Digital Signature
      </Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Confirm your details and authorize the submission
      </Text>

      {/* Before you submit checklist */}
      <View
        style={[
          styles.checklistBox,
          {
            borderColor: colors.border || "rgba(0,0,0,0.06)",
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#F9FAFB",
          },
        ]}
      >
        <Text style={[styles.checklistTitle, { color: colors.text }]}>
          Before you submit:
        </Text>
        {CHECKLIST.map((item) => (
          <View key={item} style={styles.checklistRow}>
            <Text style={[styles.bullet, { color: colors.secondary }]}>•</Text>
            <Text
              style={[styles.checklistItem, { color: colors.textSecondary }]}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* Confirm checkbox */}
      <TouchableOpacity
        onPress={() => onChange("digitalSignConfirmed", !confirmed)}
        style={styles.confirmRow}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: confirmed ? colors.secondary : colors.textMuted,
              backgroundColor: confirmed ? colors.secondary : "transparent",
              borderRadius: radii.xs || 4,
            },
          ]}
        >
          {confirmed && (
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              ✓
            </Text>
          )}
        </View>
        <Text style={[styles.confirmText, { color: colors.textSecondary }]}>
          I confirm that all the information provided is{" "}
          <Text style={{ fontWeight: "700", color: colors.text }}>
            accurate and correct
          </Text>
          . I understand that submitting false information may{" "}
          <Text style={{ color: colors.error, fontWeight: "600" }}>
            result in rejection
          </Text>{" "}
          of my application.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subheading: { fontSize: 14, marginBottom: 24, opacity: 0.8 },
  checklistBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  checklistRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  bullet: { fontSize: 16, lineHeight: 20, marginTop: -2 },
  checklistItem: { fontSize: 14, lineHeight: 20, flex: 1, opacity: 0.9 },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  confirmText: { fontSize: 14, lineHeight: 21, flex: 1, opacity: 0.95 },
});
