import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../constants/theme";
import { selectToken } from "../../redux/authSlice";
import {
  deleteProduct,
  getMyProducts,
  selectProducts,
  selectProductsLoading,
} from "../../redux/productSlice";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ isActive, isDark }) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isActive
            ? isDark
              ? "rgba(91,183,74,0.12)"
              : "#EDF7EB"
            : isDark
              ? "rgba(239,68,68,0.12)"
              : "#FEF2F2",
        },
      ]}
    >
      <Text
        style={[styles.badgeText, { color: isActive ? "#5BB74A" : "#EF4444" }]}
      >
        {isActive ? "Active" : "Inactive"}
      </Text>
    </View>
  );
}

// ─── 3-dot Menu ──────────────────────────────────────────────────────────────

function ProductMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  anchorY,
  colors,
  radii,
  isDark,
  shadows,
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.menuBox,
                !isDark && shadows.md,
                {
                  backgroundColor: colors.card || colors.background,
                  borderColor: colors.border || "rgba(0,0,0,0.08)",
                  borderRadius: radii.m || 12,
                  top: Math.min(anchorY, 600),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onEdit();
                }}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={14} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Edit Product
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.menuDivider,
                  { backgroundColor: colors.divider || "rgba(0,0,0,0.06)" },
                ]}
              />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onDelete();
                }}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={14} color="#EF4444" />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: "#EF4444", fontWeight: "600" },
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({
  item,
  isLast,
  colors,
  radii,
  isDark,
  shadows,
  onEdit,
  onDelete,
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuY, setMenuY] = useState(200);
  const dotRef = useRef(null);

  const openMenu = () => {
    dotRef.current?.measureInWindow((_x, y) => {
      setMenuY(y + 24);
      setMenuVisible(true);
    });
  };

  const firstImage = item.images?.[0]?.url;
  const FALLBACK_COLORS = [
    "#E53935",
    "#1E88E5",
    "#5BB74A",
    "#FB8C00",
    "#8E24AA",
  ];
  const colorSeed =
    FALLBACK_COLORS[item.name?.charCodeAt(0) % FALLBACK_COLORS.length];

  return (
    <>
      <View
        style={[
          styles.row,
          {
            borderBottomColor: isLast
              ? "transparent"
              : colors.divider || "rgba(0,0,0,0.05)",
            borderBottomWidth: isLast ? 0 : 1,
          },
        ]}
      >
        {/* Thumbnail */}
        <View
          style={[
            styles.thumb,
            { backgroundColor: colorSeed + "18", borderRadius: radii.s || 8 },
          ]}
        >
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={styles.thumbImg}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.thumbEmoji, { color: colorSeed }]}>
              {item.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.productName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.price, { color: colors.textSecondary }]}>
            ₹{Number(item.price)?.toFixed?.(2) ?? item.price}
          </Text>
        </View>

        <StatusBadge isActive={item.isActive} isDark={isDark} />

        {/* 3-dot */}
        <TouchableOpacity
          ref={dotRef}
          style={styles.moreBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={openMenu}
          activeOpacity={0.7}
        >
          <Feather name="more-vertical" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ProductMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={onEdit}
        onDelete={onDelete}
        anchorY={menuY}
        colors={colors}
        radii={radii}
        isDark={isDark}
        shadows={shadows}
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecentProducts({ onViewAll }) {
  const { colors, radii, shadows, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const token = useSelector(selectToken);
  const allProducts = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);

  // Fetch vendor's products on mount
  useEffect(() => {
    if (token) dispatch(getMyProducts({ token }));
  }, [token, dispatch]);

  // Show only the 3 most recent
  const recentProducts = allProducts.slice(0, 3);

  const viewAllRef = useRef(null);

  const handleViewAll = () => {
    viewAllRef.current?.measureInWindow((x, y, w, h) => {
      // Pass the centre of the "View All" text as the circle origin
      onViewAll({ x: x + w / 2, y: y + h / 2 });
    });
  };

  const handleEdit = (product) => {
    router.push({
      pathname: "/(tabs)/product",
      params: { productId: product._id },
    });
  };

  const handleDelete = (product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteProduct({ productId: product._id, token })).then(
              () => dispatch(getMyProducts({ token })),
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Products
        </Text>
        <TouchableOpacity
          ref={viewAllRef}
          onPress={handleViewAll}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAll, { color: colors.secondary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          !isDark && shadows.sm,
          {
            backgroundColor: colors.card || "#FFFFFF",
            borderColor: colors.border || "rgba(0,0,0,0.06)",
            borderRadius: radii.lg || 14,
          },
        ]}
      >
        {recentProducts.length === 0 && !loading ? (
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No products yet. Add your first product!
            </Text>
          </View>
        ) : (
          recentProducts.map((item, index) => (
            <ProductRow
              key={item._id}
              item={item}
              isLast={index === recentProducts.length - 1}
              colors={colors}
              radii={radii}
              isDark={isDark}
              shadows={shadows}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  thumb: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  thumbEmoji: {
    fontSize: 16,
    fontWeight: "700",
  },
  info: { flex: 1 },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  price: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  moreBtn: { padding: 6 },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  menuBox: {
    position: "absolute",
    right: 16,
    minWidth: 150,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  menuDivider: {
    height: 1,
  },
  emptyRow: {
    paddingHorizontal: 14,
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
