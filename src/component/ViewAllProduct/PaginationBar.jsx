import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Pagination controls for navigating between product pages
 */
export function PaginationBar({ page, pages, onPrev, onNext, colors }) {
  if (pages <= 1) return null;

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={page <= 1}
        style={[
          styles.btn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: page <= 1 ? 0.35 : 1,
          },
        ]}
      >
        <Feather name="chevron-left" size={16} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Page{" "}
        <Text style={{ color: colors.text, fontWeight: "800" }}>{page}</Text> of{" "}
        {pages}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        disabled={page >= pages}
        style={[
          styles.btn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: page >= pages ? 0.35 : 1,
          },
        ]}
      >
        <Feather name="chevron-right" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
    paddingBottom: 12,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 13 },
});
