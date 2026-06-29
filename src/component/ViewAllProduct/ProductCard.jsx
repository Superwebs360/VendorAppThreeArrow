import { Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAccentColor } from "../../utils/accentColor";
import { DiscountBadge } from "./DiscountBadge";
import { ProductMenu } from "./ProductMenu";
import { StatusBadge } from "./StatusBadge";
import { StockBar } from "./StockBar";

/**
 * Premium product card displaying all product details in a compact format
 */
export function ProductCard({
  item,
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
  const accent = getAccentColor(item.name);
  const firstImage = item.images?.[0]?.url;

  const openMenu = () => {
    dotRef.current?.measureInWindow((_x, y) => {
      setMenuY(y + 24);
      setMenuVisible(true);
    });
  };

  const savings =
    item.mrp && Number(item.mrp) > Number(item.price)
      ? Number(item.mrp) - Number(item.price)
      : null;

  return (
    <>
      <View
        style={[
          styles.card,
          !isDark && shadows.sm,
          {
            backgroundColor: colors.card || "#fff",
            borderColor: colors.border || "rgba(0,0,0,0.06)",
            borderRadius: radii.lg || 16,
          },
        ]}
      >
        {/* Left accent stripe */}
        <View style={[styles.stripe, { backgroundColor: accent }]} />

        <View style={styles.inner}>
          {/* Top row: image + info + menu */}
          <View style={styles.topRow}>
            {/* Thumbnail */}
            <View
              style={[
                styles.thumb,
                {
                  backgroundColor: accent + "18",
                  borderRadius: radii.m || 12,
                  borderColor: accent + "30",
                },
              ]}
            >
              {firstImage ? (
                <Image
                  source={{ uri: firstImage }}
                  style={styles.thumbImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={[styles.thumbInitial, { color: accent }]}>
                  {item.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              )}
              {/* Image count badge */}
              {item.images?.length > 1 && (
                <View style={[styles.imgCount, { backgroundColor: accent }]}>
                  <Text style={styles.imgCountText}>{item.images.length}</Text>
                </View>
              )}
            </View>

            {/* Info block */}
            <View style={styles.infoBlock}>
              <View style={styles.nameLine}>
                <Text
                  style={[styles.name, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <StatusBadge isActive={item.isActive} />
              </View>

              {/* Category breadcrumb */}
              {item.category?.name && (
                <View style={styles.crumb}>
                  <Feather name="tag" size={10} color={colors.textMuted} />
                  <Text
                    style={[styles.crumbText, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {item.category.name}
                    {item.subCategory?.name
                      ? ` › ${item.subCategory.name}`
                      : ""}
                  </Text>
                </View>
              )}

              {/* SKU / Brand */}
              {(item.sku || item.brand) && (
                <View style={styles.crumb}>
                  <Feather name="hash" size={10} color={colors.textMuted} />
                  <Text style={[styles.crumbText, { color: colors.textMuted }]}>
                    {[item.sku, item.brand].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              )}
            </View>

            {/* Menu button */}
            <TouchableOpacity
              ref={dotRef}
              style={styles.menuBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={openMenu}
              activeOpacity={0.7}
            >
              <Feather
                name="more-vertical"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.mid,
              { borderTopColor: colors.divider || "rgba(0,0,0,0.05)" },
            ]}
          />

          {/* Bottom row: pricing + discount + stock */}
          <View style={styles.bottomRow}>
            {/* Pricing column */}
            <View style={styles.priceCol}>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.text }]}>
                  ₹
                  {Number(item.price)?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <DiscountBadge price={item.price} mrp={item.mrp} />
              </View>
              {item.mrp && Number(item.mrp) > Number(item.price) && (
                <View style={styles.mrpRow}>
                  <Text style={[styles.mrp, { color: colors.textMuted }]}>
                    MRP ₹
                    {Number(item.mrp)?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  {savings && (
                    <Text style={styles.savings}>
                      Save ₹{savings.toLocaleString("en-IN")}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Vertical separator */}
            <View
              style={[
                styles.vSep,
                { backgroundColor: colors.divider || "rgba(0,0,0,0.06)" },
              ]}
            />

            {/* Stock column */}
            <View style={styles.stockCol}>
              <Text style={[styles.stockTitle, { color: colors.textMuted }]}>
                STOCK
              </Text>
              <StockBar
                stock={item.stock ?? 0}
                maxStock={Math.max(item.stock ?? 0, 100)}
              />
            </View>
          </View>

          {/* Tags row — variant/unit info if available */}
          {(item.unit || item.variants?.length > 0) && (
            <View style={styles.tagsRow}>
              {item.unit && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: accent + "12",
                      borderColor: accent + "30",
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: accent }]}>
                    {item.unit}
                  </Text>
                </View>
              )}
              {item.variants?.length > 0 && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: colors.textSecondary }]}
                  >
                    {item.variants.length} variants
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  stripe: { width: 4 },
  inner: { flex: 1, padding: 14 },

  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  thumb: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbInitial: { fontSize: 20, fontWeight: "800" },
  imgCount: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  imgCountText: { color: "#fff", fontSize: 8, fontWeight: "800" },

  infoBlock: { flex: 1, gap: 3 },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2, flex: 1 },
  crumb: { flexDirection: "row", alignItems: "center", gap: 4 },
  crumbText: { fontSize: 11, flex: 1 },

  menuBtn: { padding: 4, marginTop: -2 },

  mid: { borderTopWidth: StyleSheet.hairlineWidth, marginVertical: 10 },

  bottomRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  priceCol: { flex: 1 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 16, fontWeight: "800", letterSpacing: -0.5 },
  mrpRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  mrp: { fontSize: 11, textDecorationLine: "line-through" },
  savings: { fontSize: 10, color: "#10B981", fontWeight: "700" },

  vSep: { width: 1, height: 36, borderRadius: 1 },

  stockCol: { width: 110 },
  stockTitle: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  tagsRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 10, fontWeight: "600" },
});
