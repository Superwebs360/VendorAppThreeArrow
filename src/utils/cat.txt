// /**
//  * CategoryScreen.jsx
//  * ─────────────────────────────────────────────────────────────────────────────
//  * Premium Category & Subcategory management screen for 3Arrow Vendor app.
//  * Two tabs: Category | Subcategory
//  * Uses useTheme() and useGridConfig() throughout.
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// import React, { useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Image,
//   Platform,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useGridConfig } from "../../constants/gridConfig";
// import { useTheme } from "../../constants/theme";

// // ─── Mock Data ───────────────────────────────────────────────────────────────

// const MOCK_CATEGORIES = [
//   {
//     id: "1",
//     name: "Fruits & Vegetables",
//     image:
//       "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80",
//     metaTitle: "Fresh Fruits & Vegetables Online | ThreeArrow",
//     metaDescription:
//       "Order fresh seasonal fruits and vegetables. Farm to doorstep delivery within 2 hours.",
//     description:
//       "Handpicked fresh produce sourced directly from local farms. Our daily harvest ensures you receive the freshest fruits and vegetables every morning.",
//   },
//   {
//     id: "2",
//     name: "Dairy & Eggs",
//     image:
//       "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
//     metaTitle: "Fresh Dairy Products & Eggs | ThreeArrow",
//     metaDescription:
//       "Premium dairy products from trusted brands like Amul. Cold chain delivery guaranteed.",
//     description:
//       "Pasteurized milk, artisan paneer, creamy curd, and farm-fresh eggs. Every product undergoes strict cold chain management from warehouse to your doorstep.",
//   },
//   {
//     id: "3",
//     name: "Snacks & Drinks",
//     image:
//       "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80",
//     metaTitle: "Snacks, Namkeen & Beverages Online | ThreeArrow",
//     metaDescription:
//       "Haldiram's, Lay's, and 200+ brands of snacks and beverages delivered fast.",
//     description:
//       "India's favourite snack brands under one roof. From Haldiram's classic namkeen to artisan craft beverages, satisfy every craving without leaving home.",
//   },
// ];

// const MOCK_SUBCATEGORIES = [
//   {
//     id: "s1",
//     name: "Leafy Greens",
//     image:
//       "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80",
//     parentCategory: "Fruits & Vegetables",
//     description:
//       "Spinach, methi, palak, coriander, and all seasonal leafy greens. Rich in iron and essential vitamins.",
//   },
//   {
//     id: "s2",
//     name: "Seasonal Fruits",
//     image:
//       "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80",
//     parentCategory: "Fruits & Vegetables",
//     description:
//       "Mangoes, litchis, guavas, and seasonal picks straight from the orchard, changed monthly based on harvest.",
//   },
//   {
//     id: "s3",
//     name: "Paneer & Curd",
//     image:
//       "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80",
//     parentCategory: "Dairy & Eggs",
//     description:
//       "Fresh soft paneer and thick homestyle curd prepared daily. Made with full-fat cow milk.",
//   },
//   {
//     id: "s4",
//     name: "Namkeen & Savoury",
//     image:
//       "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=200&q=80",
//     parentCategory: "Snacks & Drinks",
//     description:
//       "Haldiram's, Bikaji, and local favourites. A full range of roasted, fried and baked savoury snacks.",
//   },
// ];

// // ─── Tab Indicator ────────────────────────────────────────────────────────────

// const TABS = ["Category", "Subcategory"];

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function CategoryScreen() {
//   const { colors, typography, radii, shadows } = useTheme();
//   const grid = useGridConfig();

//   const [activeTab, setActiveTab] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const indicatorAnim = useRef(new Animated.Value(0)).current;

//   const screenW = grid.screenWidth || Dimensions.get("window").width;
//   const TAB_W = (screenW - 32) / 2;

//   const switchTab = (index) => {
//     setActiveTab(index);
//     setSearchQuery("");
//     Animated.spring(indicatorAnim, {
//       toValue: index * TAB_W,
//       useNativeDriver: true,
//       tension: 80,
//       friction: 12,
//     }).start();
//   };

//   const accentColor = activeTab === 0 ? colors.primary : colors.secondary;

//   const s = makeStyles(colors, typography, radii, shadows, grid, accentColor);

//   const filteredCategories = MOCK_CATEGORIES.filter((c) =>
//     c.name.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   const filteredSubcategories = MOCK_SUBCATEGORIES.filter(
//     (s) =>
//       s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       s.parentCategory.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   return (
//     <View style={s.root}>
//       <StatusBar
//         barStyle={colors.text === "#FFFFFF" ? "light-content" : "dark-content"}
//         backgroundColor={colors.background}
//       />

//       {/* ── Header ─────────────────────────────────────────── */}
//       <View style={s.header}>
//         <View>
//           <Text style={[s.headerEyebrow, { color: accentColor }]}>
//             MANAGEMENT
//           </Text>
//           <Text style={s.headerTitle}>Categories</Text>
//         </View>
//         <TouchableOpacity
//           style={[s.addBtn, { backgroundColor: accentColor }]}
//           activeOpacity={0.8}
//         >
//           <Text style={s.addBtnIcon}>＋</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── Search ─────────────────────────────────────────── */}
//       <View style={s.searchWrap}>
//         <Text style={s.searchIcon}>🔍</Text>
//         <TextInput
//           style={s.searchInput}
//           placeholder={`Search ${TABS[activeTab].toLowerCase()}…`}
//           placeholderTextColor={colors.placeholder}
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         {searchQuery.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchQuery("")}>
//             <Text style={s.searchClear}>✕</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* ── Tabs ───────────────────────────────────────────── */}
//       <View style={s.tabBar}>
//         {TABS.map((tab, i) => (
//           <Pressable key={tab} style={s.tabBtn} onPress={() => switchTab(i)}>
//             <Text
//               style={[
//                 s.tabLabel,
//                 activeTab === i && {
//                   color: i === 0 ? colors.primary : colors.secondary,
//                   fontWeight: "700",
//                 },
//               ]}
//             >
//               {tab}
//             </Text>
//           </Pressable>
//         ))}
//         <Animated.View
//           style={[
//             s.tabIndicator,
//             { width: TAB_W, transform: [{ translateX: indicatorAnim }] },
//           ]}
//         />
//       </View>

//       {/* ── Content ────────────────────────────────────────── */}
//       <ScrollView
//         style={s.scroll}
//         contentContainerStyle={s.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {activeTab === 0 ? (
//           <>
//             <Text style={s.sectionCount}>
//               {filteredCategories.length} categor
//               {filteredCategories.length === 1 ? "y" : "ies"}
//             </Text>
//             {filteredCategories.map((cat) => (
//               <CategoryCard
//                 key={cat.id}
//                 item={cat}
//                 s={s}
//                 colors={colors}
//                 radii={radii}
//                 shadows={shadows}
//               />
//             ))}
//           </>
//         ) : (
//           <>
//             <Text style={s.sectionCount}>
//               {filteredSubcategories.length} subcategor
//               {filteredSubcategories.length === 1 ? "y" : "ies"}
//             </Text>
//             {filteredSubcategories.map((sub) => (
//               <SubcategoryCard
//                 key={sub.id}
//                 item={sub}
//                 s={s}
//                 colors={colors}
//                 radii={radii}
//                 shadows={shadows}
//               />
//             ))}
//           </>
//         )}

//         {/* Empty State */}
//         {(activeTab === 0 ? filteredCategories : filteredSubcategories)
//           .length === 0 && (
//           <View style={s.emptyState}>
//             <Text style={s.emptyIcon}>🗂️</Text>
//             <Text style={s.emptyTitle}>Nothing found</Text>
//             <Text style={s.emptyBody}>
//               Try a different search term or add a new{" "}
//               {TABS[activeTab].toLowerCase()}.
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// // ─── Category Card ────────────────────────────────────────────────────────────

// function CategoryCard({ item, s, colors, radii, shadows }) {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <TouchableOpacity
//       style={s.card}
//       activeOpacity={0.95}
//       onPress={() => setExpanded((p) => !p)}
//     >
//       {/* Top row: image + primary info */}
//       <View style={s.cardTop}>
//         <Image source={{ uri: item.image }} style={s.cardImage} />
//         <View style={s.cardMeta}>
//           <View style={s.badgeRow}>
//             <View style={[s.badge, { backgroundColor: colors.primary + "18" }]}>
//               <Text style={[s.badgeText, { color: colors.primary }]}>
//                 CATEGORY
//               </Text>
//             </View>
//           </View>
//           <Text style={s.cardName} numberOfLines={2}>
//             {item.name}
//           </Text>
//           <Text style={s.cardCaption} numberOfLines={2}>
//             {item.metaTitle}
//           </Text>
//         </View>
//         <TouchableOpacity style={s.moreBtn}>
//           <Text style={s.moreDot}>⋮</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Expand toggle */}
//       <TouchableOpacity
//         style={s.expandRow}
//         onPress={() => setExpanded((p) => !p)}
//       >
//         <View style={s.expandDivider} />
//         <Text style={s.expandLabel}>{expanded ? "Less" : "Details"}</Text>
//         <Text style={[s.expandChev, expanded && s.expandChevOpen]}>›</Text>
//       </TouchableOpacity>

//       {/* Expanded fields */}
//       {expanded && (
//         <View style={s.expandedBody}>
//           <Field
//             label="Meta Title"
//             value={item.metaTitle}
//             s={s}
//             colors={colors}
//           />
//           <Field
//             label="Meta Description"
//             value={item.metaDescription}
//             s={s}
//             colors={colors}
//           />
//           <Field
//             label="Description"
//             value={item.description}
//             s={s}
//             colors={colors}
//           />
//           <View style={s.actionRow}>
//             <TouchableOpacity
//               style={[s.actionBtn, { borderColor: colors.border }]}
//             >
//               <Text style={[s.actionBtnText, { color: colors.textSecondary }]}>
//                 Edit
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 s.actionBtn,
//                 s.actionBtnPrimary,
//                 { backgroundColor: colors.primary },
//               ]}
//             >
//               <Text style={[s.actionBtnText, { color: "#fff" }]}>Manage</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// }

// // ─── Subcategory Card ─────────────────────────────────────────────────────────

// function SubcategoryCard({ item, s, colors, radii, shadows }) {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <TouchableOpacity
//       style={s.card}
//       activeOpacity={0.95}
//       onPress={() => setExpanded((p) => !p)}
//     >
//       <View style={s.cardTop}>
//         <Image source={{ uri: item.image }} style={s.cardImage} />
//         <View style={s.cardMeta}>
//           <View style={s.badgeRow}>
//             <View
//               style={[s.badge, { backgroundColor: colors.secondary + "18" }]}
//             >
//               <Text style={[s.badgeText, { color: colors.secondary }]}>
//                 SUBCATEGORY
//               </Text>
//             </View>
//           </View>
//           <Text style={s.cardName} numberOfLines={2}>
//             {item.name}
//           </Text>
//           {/* Parent category pill */}
//           <View style={s.parentPill}>
//             <Text style={s.parentPillIcon}>↳</Text>
//             <Text style={s.parentPillText} numberOfLines={1}>
//               {item.parentCategory}
//             </Text>
//           </View>
//         </View>
//         <TouchableOpacity style={s.moreBtn}>
//           <Text style={s.moreDot}>⋮</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={s.expandRow}
//         onPress={() => setExpanded((p) => !p)}
//       >
//         <View style={s.expandDivider} />
//         <Text style={s.expandLabel}>{expanded ? "Less" : "Details"}</Text>
//         <Text style={[s.expandChev, expanded && s.expandChevOpen]}>›</Text>
//       </TouchableOpacity>

//       {expanded && (
//         <View style={s.expandedBody}>
//           <Field
//             label="Parent Category"
//             value={item.parentCategory}
//             s={s}
//             colors={colors}
//           />
//           <Field
//             label="Description"
//             value={item.description}
//             s={s}
//             colors={colors}
//           />
//           <View style={s.actionRow}>
//             <TouchableOpacity
//               style={[s.actionBtn, { borderColor: colors.border }]}
//             >
//               <Text style={[s.actionBtnText, { color: colors.textSecondary }]}>
//                 Edit
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 s.actionBtn,
//                 s.actionBtnPrimary,
//                 { backgroundColor: colors.secondary },
//               ]}
//             >
//               <Text style={[s.actionBtnText, { color: "#fff" }]}>Manage</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// }

// // ─── Field Row ────────────────────────────────────────────────────────────────

// function Field({ label, value, s, colors }) {
//   return (
//     <View style={s.fieldRow}>
//       <Text style={s.fieldLabel}>{label}</Text>
//       <Text style={[s.fieldValue, { color: colors.text }]}>{value}</Text>
//     </View>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// function makeStyles(
//   colors,
//   typography,
//   radii,
//   shadows,
//   grid,
//   accentColor = colors.primary,
// ) {
//   const screenW = grid.screenWidth || Dimensions.get("window").width;

//   return StyleSheet.create({
//     root: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },

//     // Header
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: 20,
//       paddingTop:
//         Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 60,
//       paddingBottom: 12,
//       backgroundColor: colors.background,
//     },
//     headerEyebrow: {
//       ...typography.label,
//       color: colors.primary,
//       marginBottom: 2,
//     },
//     headerTitle: {
//       ...typography.heading1,
//       color: colors.text,
//     },
//     addBtn: {
//       width: 44,
//       height: 44,
//       borderRadius: radii.full,
//       backgroundColor: colors.primary,
//       alignItems: "center",
//       justifyContent: "center",
//       ...shadows.primary,
//       shadowColor: accentColor,
//     },
//     addBtnIcon: {
//       color: "#fff",
//       fontSize: 22,
//       fontWeight: "700",
//       lineHeight: 26,
//     },

//     // Search
//     searchWrap: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginHorizontal: 16,
//       marginBottom: 12,
//       paddingHorizontal: 14,
//       paddingVertical: 10,
//       backgroundColor: colors.inputBg,
//       borderRadius: radii.lg,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     searchIcon: { fontSize: 15, marginRight: 8 },
//     searchInput: {
//       flex: 1,
//       ...typography.body,
//       color: colors.text,
//       paddingVertical: 0,
//     },
//     searchClear: {
//       fontSize: 13,
//       color: colors.textMuted,
//       paddingLeft: 8,
//     },

//     // Tabs
//     tabBar: {
//       flexDirection: "row",
//       marginHorizontal: 16,
//       backgroundColor: colors.surface,
//       borderRadius: radii.lg,
//       padding: 4,
//       marginBottom: 16,
//       position: "relative",
//       overflow: "hidden",
//     },
//     tabBtn: {
//       flex: 1,
//       paddingVertical: 10,
//       alignItems: "center",
//       zIndex: 2,
//     },
//     tabLabel: {
//       ...typography.bodyMedium,
//       color: colors.textSecondary,
//     },
//     tabLabelActive: {
//       color: colors.primary,
//       fontWeight: "700",
//     },
//     tabIndicator: {
//       position: "absolute",
//       bottom: 4,
//       left: 4,
//       height: "100%",
//       backgroundColor: colors.surfaceElevated,
//       borderRadius: radii.md,
//       zIndex: 1,
//       ...shadows.sm,
//     },

//     // Scroll
//     scroll: { flex: 1 },
//     scrollContent: {
//       paddingHorizontal: 16,
//       paddingBottom: 120,
//     },
//     sectionCount: {
//       ...typography.caption,
//       color: colors.textMuted,
//       marginBottom: 10,
//       letterSpacing: 0.3,
//     },

//     // Card
//     card: {
//       backgroundColor: colors.card,
//       borderRadius: radii.xl,
//       marginBottom: 14,
//       borderWidth: 1,
//       borderColor: colors.border,
//       overflow: "hidden",
//       ...shadows.md,
//     },
//     cardTop: {
//       flexDirection: "row",
//       padding: 14,
//       alignItems: "flex-start",
//     },
//     cardImage: {
//       width: 72,
//       height: 72,
//       borderRadius: radii.md,
//       backgroundColor: colors.surface,
//     },
//     cardMeta: {
//       flex: 1,
//       marginLeft: 12,
//     },
//     badgeRow: {
//       flexDirection: "row",
//       marginBottom: 4,
//     },
//     badge: {
//       paddingHorizontal: 8,
//       paddingVertical: 3,
//       borderRadius: radii.full,
//     },
//     badgeText: {
//       ...typography.label,
//       fontSize: 10,
//     },
//     cardName: {
//       ...typography.heading3,
//       color: colors.text,
//       marginBottom: 4,
//     },
//     cardCaption: {
//       ...typography.caption,
//       color: colors.textSecondary,
//     },
//     moreBtn: {
//       paddingHorizontal: 6,
//       paddingVertical: 4,
//     },
//     moreDot: {
//       fontSize: 20,
//       color: colors.textMuted,
//       lineHeight: 22,
//     },

//     // Parent pill (subcategory)
//     parentPill: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 2,
//     },
//     parentPillIcon: {
//       fontSize: 12,
//       color: colors.secondary,
//       marginRight: 4,
//     },
//     parentPillText: {
//       ...typography.caption,
//       color: colors.secondary,
//       fontWeight: "600",
//     },

//     // Expand row
//     expandRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 14,
//       paddingVertical: 10,
//     },
//     expandDivider: {
//       flex: 1,
//       height: 1,
//       backgroundColor: colors.divider,
//     },
//     expandLabel: {
//       ...typography.caption,
//       color: colors.textMuted,
//       marginHorizontal: 8,
//     },
//     expandChev: {
//       fontSize: 18,
//       color: colors.textMuted,
//       transform: [{ rotate: "90deg" }],
//     },
//     expandChevOpen: {
//       transform: [{ rotate: "-90deg" }],
//     },

//     // Expanded body
//     expandedBody: {
//       paddingHorizontal: 14,
//       paddingBottom: 14,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     },

//     // Field
//     fieldRow: {
//       marginTop: 12,
//     },
//     fieldLabel: {
//       ...typography.label,
//       fontSize: 10,
//       color: colors.textMuted,
//       marginBottom: 4,
//     },
//     fieldValue: {
//       ...typography.body,
//       color: colors.text,
//       lineHeight: 20,
//     },

//     // Action row
//     actionRow: {
//       flexDirection: "row",
//       marginTop: 16,
//       gap: 10,
//     },
//     actionBtn: {
//       flex: 1,
//       paddingVertical: 11,
//       borderRadius: radii.md,
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: "transparent",
//     },
//     actionBtnPrimary: {
//       borderWidth: 0,
//     },
//     actionBtnText: {
//       ...typography.button,
//       fontSize: 14,
//     },

//     // Empty state
//     emptyState: {
//       alignItems: "center",
//       paddingVertical: 60,
//     },
//     emptyIcon: { fontSize: 48, marginBottom: 12 },
//     emptyTitle: {
//       ...typography.heading3,
//       color: colors.text,
//       marginBottom: 6,
//     },
//     emptyBody: {
//       ...typography.body,
//       color: colors.textSecondary,
//       textAlign: "center",
//       paddingHorizontal: 32,
//     },
//   });
// }
