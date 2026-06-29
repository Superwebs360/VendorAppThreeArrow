import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

/**
 * Displays active filters as removable tags
 */
export function ActiveFilterTags({
  filters,
  categories,
  subCategories,
  onRemove,
  colors,
}) {
  const tags = [];
  const cat = categories.find((c) => c._id === filters.category);
  if (cat) tags.push({ key: "category", label: cat.name });

  const sub = subCategories.find((s) => s._id === filters.subCategory);
  if (sub) tags.push({ key: "subCategory", label: sub.name });

  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `₹${filters.minPrice}–₹${filters.maxPrice}`
        : filters.minPrice
          ? `≥ ₹${filters.minPrice}`
          : `≤ ₹${filters.maxPrice}`;
    tags.push({ key: "price", label });
  }

  if (filters.isActive === "true")
    tags.push({ key: "isActive", label: "Active only" });
  if (filters.isActive === "false")
    tags.push({ key: "isActive", label: "Inactive only" });

  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingVertical: 8 }}
      contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
    >
      {tags.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[
            styles.tag,
            { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
          ]}
          onPress={() => onRemove(t.key)}
        >
          <Text style={[styles.text, { color: "#4338CA" }]}>{t.label}</Text>
          <Feather
            name="x"
            size={11}
            color="#4338CA"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: "600" },
});
