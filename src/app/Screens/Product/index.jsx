import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ActiveFilterTags } from "../../../component/ViewAllProduct/ActiveFilterTags";
import { FilterPanel } from "../../../component/ViewAllProduct/FilterPanel";
import { PaginationBar } from "../../../component/ViewAllProduct/PaginationBar";
import { ProductCard } from "../../../component/ViewAllProduct/ProductCard";
import { Colors, useTheme } from "../../../constants/theme";
import { selectToken } from "../../../redux/authSlice";
import {
  fetchCategories,
  fetchSubCategories,
  resetSubCategories,
  selectCategories,
  selectSubCategories,
} from "../../../redux/categorySlice";
import {
  deleteProduct,
  getMyProducts,
  selectProducts,
  selectProductsLoading,
  selectProductsPages,
  selectProductsTotal,
} from "../../../redux/productSlice";
import { debounce } from "../../../utils/debounce";

const { width: SW, height: SH } = Dimensions.get("window");
const LIMIT = 12;

const DEFAULT_FILTERS = {
  category: "",
  subCategory: "",
  minPrice: "",
  maxPrice: "",
  isActive: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

/**
 * Main products inventory screen with filtering, sorting, and pagination
 */
export default function AllProductsScreen({ visible, origin, onClose }) {
  const { colors, radii, shadows, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const token = useSelector(selectToken);
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const total = useSelector(selectProductsTotal);
  const pages = useSelector(selectProductsPages);
  const categories = useSelector(selectCategories);
  const subCategories = useSelector(selectSubCategories);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);
  const [stableOrigin, setStableOrigin] = useState({ x: SW - 40, y: 80 });

  const [searchText, setSearchText] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.minPrice || filters.maxPrice ? "1" : "",
    filters.isActive,
  ].filter(Boolean).length;

  useEffect(() => {
    if (visible && token && categories.length === 0)
      dispatch(fetchCategories({ token }));
  }, [visible, token]);

  const handleCategoryFilterChange = useCallback(
    (catId) => {
      if (catId) dispatch(fetchSubCategories({ categoryId: catId, token }));
      else dispatch(resetSubCategories());
    },
    [dispatch, token],
  );

  const fetchProducts = useCallback(
    (page = 1, search = searchText, activeFilters = filters) => {
      if (!token) return;
      dispatch(
        getMyProducts({ token, page, limit: LIMIT, search, ...activeFilters }),
      );
    },
    [dispatch, token, searchText, filters],
  );

  const debouncedSearch = useCallback(
    debounce((text) => {
      setCurrentPage(1);
      fetchProducts(1, text, filters);
    }, 420),
    [filters, fetchProducts],
  );

  const handleSearchChange = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(1, searchText, newFilters);
  };

  const handleRemoveTag = (key) => {
    let updated = { ...filters };
    if (key === "price") {
      updated.minPrice = "";
      updated.maxPrice = "";
    } else updated[key] = "";
    if (key === "category") {
      updated.subCategory = "";
      dispatch(resetSubCategories());
    }
    setFilters(updated);
    setCurrentPage(1);
    fetchProducts(1, searchText, updated);
  };

  const handlePrev = () => {
    const n = Math.max(1, currentPage - 1);
    setCurrentPage(n);
    fetchProducts(n);
  };

  const handleNext = () => {
    const n = Math.min(pages, currentPage + 1);
    setCurrentPage(n);
    fetchProducts(n);
  };

  useEffect(() => {
    if (visible && token) {
      setSearchText("");
      setFilters(DEFAULT_FILTERS);
      setCurrentPage(1);
      fetchProducts(1, "", DEFAULT_FILTERS);
    }
  }, [visible, token]);

  useEffect(() => {
    if (visible) {
      if (origin) setStableOrigin(origin);
      setIsRendered(true);
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setIsRendered(false));
    }
  }, [visible]);

  const handleEdit = (product) => {
    onClose();
    setTimeout(
      () =>
        router.push({
          pathname: "/(tabs)/product",
          params: { productId: product._id },
        }),
      300,
    );
  };

  const handleDelete = (product) => {
    Alert.alert("Delete Product", `Remove "${product.name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          dispatch(deleteProduct({ productId: product._id, token })).then(() =>
            fetchProducts(currentPage),
          ),
      },
    ]);
  };

  if (!isRendered) return null;

  const ox = stableOrigin.x,
    oy = stableOrigin.y;
  const distToCorner = Math.max(
    Math.hypot(ox, oy),
    Math.hypot(SW - ox, oy),
    Math.hypot(ox, SH - oy),
    Math.hypot(SW - ox, SH - oy),
  );
  const diameter = distToCorner * 2 + 40;
  const contentOpacity = scaleAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Modal
      transparent
      visible={isRendered}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Expanding circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              left: ox - diameter / 2,
              top: oy - diameter / 2,
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />

        <Animated.View style={[styles.screen, { opacity: contentOpacity }]}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={colors.background}
          />

          {/* ── Header ── */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.divider || "rgba(0,0,0,0.05)" },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.backBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.sm || 10,
                },
              ]}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="chevron-left" size={18} color={colors.text} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Inventory
              </Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                {loading
                  ? "Syncing…"
                  : `${total} product${total !== 1 ? "s" : ""} · Page ${currentPage}`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                onClose();
                setTimeout(() => router.push("/(tabs)/product"), 300);
              }}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* ── Search + Filter ── */}
          <View
            style={[styles.searchBar, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.sm || 10,
                },
              ]}
            >
              <Feather
                name="search"
                size={15}
                color={colors.textMuted}
                style={{ marginRight: 7 }}
              />
              <TextInput
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search by name, SKU, brand…"
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleSearchChange("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x-circle" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setFilterPanelOpen(true)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: hasActiveFilters
                    ? "#6366F1"
                    : colors.surface,
                  borderColor: hasActiveFilters ? "#6366F1" : colors.border,
                  borderRadius: radii.sm || 10,
                },
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name="sliders"
                size={16}
                color={hasActiveFilters ? "#fff" : colors.textSecondary}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={[styles.filterBadgeText, { color: "#6366F1" }]}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {hasActiveFilters && (
            <ActiveFilterTags
              filters={filters}
              categories={categories}
              subCategories={subCategories}
              onRemove={handleRemoveTag}
              colors={colors}
            />
          )}

          {/* ── Product List ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {loading && products.length === 0 ? (
              <View style={styles.emptyState}>
                <ActivityIndicator
                  size="small"
                  color="#6366F1"
                  style={{ marginBottom: 14 }}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Loading inventory…
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Text style={styles.emptyIcon}>
                    {searchText || hasActiveFilters ? "🔍" : "📦"}
                  </Text>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {searchText || hasActiveFilters
                    ? "No results found"
                    : "No products yet"}
                </Text>
                <Text
                  style={[styles.emptyBody, { color: colors.textSecondary }]}
                >
                  {searchText || hasActiveFilters
                    ? "Try adjusting your search or filter criteria."
                    : "Add your first product to build your catalog."}
                </Text>
                {(searchText || hasActiveFilters) && (
                  <TouchableOpacity
                    style={[styles.clearBtn, { borderColor: "#6366F1" }]}
                    onPress={() => {
                      setSearchText("");
                      setFilters(DEFAULT_FILTERS);
                      fetchProducts(1, "", DEFAULT_FILTERS);
                    }}
                  >
                    <Text style={[styles.clearBtnText, { color: "#6366F1" }]}>
                      Clear search & filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {products.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    colors={colors}
                    radii={radii}
                    isDark={isDark}
                    shadows={shadows}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}

                {loading && (
                  <View style={{ alignItems: "center", paddingVertical: 16 }}>
                    <ActivityIndicator size="small" color="#6366F1" />
                  </View>
                )}

                <PaginationBar
                  page={currentPage}
                  pages={pages}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  colors={colors}
                />
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      <FilterPanel
        visible={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        colors={colors}
        radii={radii}
        isDark={isDark}
        shadows={shadows}
        categories={categories}
        subCategories={subCategories}
        onCategoryChange={handleCategoryFilterChange}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
  circle: { position: "absolute" },
  screen: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2, opacity: 0.8 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0, margin: 0 },
  filterBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 9, fontWeight: "800" },

  listContent: { padding: 14, paddingBottom: 60 },

  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptyBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.75,
  },
  emptyText: { fontSize: 13, fontWeight: "500" },
  clearBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 13, fontWeight: "600" },
});
