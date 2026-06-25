import { StyleSheet, Text, View } from "react-native";
import { Radii, Shadows, Typography } from "../../constants/theme";

function Section({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View
        style={[
          styles.sectionCard,
          Shadows.sm,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: { ...Typography.heading3, fontWeight: "700" },
  sectionCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});

export default Section;
