import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { FilterChip } from "./FilterChip";

const { height: SH } = Dimensions.get("window");

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt", order: "desc" },
  { label: "Oldest", value: "createdAt", order: "asc" },
  { label: "Price ↑", value: "price", order: "asc" },
  { label: "Price ↓", value: "price", order: "desc" },
  { label: "Name A–Z", value: "name", order: "asc" },
  { label: "Stock ↑", value: "stock", order: "asc" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

/**
 * Full-screen filter and sort panel with keyboard awareness
 */
export function FilterPanel({
  visible,
  onClose,
  filters,
  onApply,
  colors,
  radii,
  isDark,
  shadows,
  categories,
  subCategories,
  onCategoryChange,
}) {
  const [local, setLocal] = useState(filters);
  const minRef = useRef(null);
  const maxRef = useRef(null);

  // Track keyboard height manually so the panel can be translated up by
  // exactly the right amount, flush against the keyboard with no gap.
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration = e?.duration && e.duration > 0 ? e.duration : 220;
      Animated.timing(keyboardOffset, {
        toValue: height,
        duration,
        useNativeDriver: true,
      }).start();
    };
    const onHide = (e) => {
      const duration = e?.duration && e.duration > 0 ? e.duration : 220;
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible]);

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const activeSort = SORT_OPTIONS.find(
    (o) => o.value === local.sortBy && o.order === local.sortOrder,
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dim backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Panel is translated up by the tracked keyboard height — flush, no gap */}
      <Animated.View
        style={[
          styles.kavContainer,
          {
            transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }],
          },
        ]}
      >
        <View
          style={[
            styles.panel,
            !isDark && shadows.lg,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Filter & Sort
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Refine your product list
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.resetBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => {
                  const reset = {
                    category: "",
                    subCategory: "",
                    minPrice: "",
                    maxPrice: "",
                    isActive: "",
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  };
                  setLocal(reset);
                  onCategoryChange("");
                }}
              >
                <Feather name="refresh-cw" size={12} color={colors.textMuted} />
                <Text style={[styles.resetText, { color: colors.textMuted }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sort */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              SORT BY
            </Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((o) => (
                <FilterChip
                  key={`${o.value}-${o.order}`}
                  label={o.label}
                  active={
                    activeSort?.value === o.value &&
                    activeSort?.order === o.order
                  }
                  onPress={() =>
                    setLocal((p) => ({
                      ...p,
                      sortBy: o.value,
                      sortOrder: o.order,
                    }))
                  }
                  colors={colors}
                />
              ))}
            </View>

            {/* Status */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              STATUS
            </Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((o) => (
                <FilterChip
                  key={o.value}
                  label={o.label}
                  active={local.isActive === o.value}
                  onPress={() => set("isActive", o.value)}
                  colors={colors}
                />
              ))}
            </View>

            {/* Category */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              CATEGORY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View style={styles.hChipRow}>
                <FilterChip
                  label="All"
                  active={local.category === ""}
                  onPress={() => {
                    set("category", "");
                    set("subCategory", "");
                    onCategoryChange("");
                  }}
                  colors={colors}
                />
                {categories.map((cat) => (
                  <FilterChip
                    key={cat._id}
                    label={cat.name}
                    active={local.category === cat._id}
                    onPress={() => {
                      set("category", cat._id);
                      set("subCategory", "");
                      onCategoryChange(cat._id);
                    }}
                    colors={colors}
                  />
                ))}
              </View>
            </ScrollView>

            {subCategories.length > 0 && (
              <>
                <Text
                  style={[styles.sectionLabel, { color: colors.textMuted }]}
                >
                  SUB-CATEGORY
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                >
                  <View style={styles.hChipRow}>
                    <FilterChip
                      label="All"
                      active={local.subCategory === ""}
                      onPress={() => set("subCategory", "")}
                      colors={colors}
                    />
                    {subCategories.map((sub) => (
                      <FilterChip
                        key={sub._id}
                        label={sub.name}
                        active={local.subCategory === sub._id}
                        onPress={() => set("subCategory", sub._id)}
                        colors={colors}
                      />
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* Price Range */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              PRICE RANGE (₹)
            </Text>
            <View style={styles.priceRow}>
              <View
                style={[
                  styles.priceBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: radii.sm || 10,
                  },
                ]}
              >
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                  MIN
                </Text>
                <View style={styles.priceInputRow}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ₹
                  </Text>
                  <TextInput
                    ref={minRef}
                    value={local.minPrice}
                    onChangeText={(v) =>
                      set("minPrice", v.replace(/[^0-9]/g, ""))
                    }
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => maxRef.current?.focus()}
                    style={[styles.priceInput, { color: colors.text }]}
                  />
                </View>
              </View>

              <View
                style={[styles.priceDash, { backgroundColor: colors.border }]}
              />

              <View
                style={[
                  styles.priceBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: radii.sm || 10,
                  },
                ]}
              >
                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>
                  MAX
                </Text>
                <View style={styles.priceInputRow}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ₹
                  </Text>
                  <TextInput
                    ref={maxRef}
                    value={local.maxPrice}
                    onChangeText={(v) =>
                      set("maxPrice", v.replace(/[^0-9]/g, ""))
                    }
                    placeholder="∞"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    style={[styles.priceInput, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            {/* Apply */}
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onApply(local);
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  kavContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  panel: { maxHeight: SH * 0.88, paddingHorizontal: 20, paddingTop: 12 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 12, marginTop: 2 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  resetText: { fontSize: 12, fontWeight: "600" },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  hChipRow: { flexDirection: "row", gap: 8 },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  priceBox: {
    flex: 1,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  priceInputRow: { flexDirection: "row", alignItems: "center" },
  currencySymbol: { fontSize: 15, fontWeight: "700", marginRight: 3 },
  priceInput: { flex: 1, fontSize: 16, fontWeight: "700", padding: 0 },
  priceDash: { width: 20, height: 2, borderRadius: 1 },

  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5DB64A",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
  },
  applyText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
