import { SPACING } from "@/constants/gridConfig";
import { Radii, Typography, useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { safeBack } from "../../utils/navigation";

import {
  selectRestoring,
  selectToken,
  selectVendorUser,
} from "../../redux/authSlice";
import {
  fetchCategories,
  fetchSubCategories,
  resetSubCategories,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
  selectSubCategories,
  selectSubCategoriesError,
  selectSubCategoriesLoading,
} from "../../redux/categorySlice";
import {
  clearErrors,
  clearSuccess,
  createProduct,
  getProductById,
  updateProduct,
} from "../../redux/productSlice";

import CustomFields from "../../component/ProductComponent/CustomFields";
import Dropdown from "../../component/ProductComponent/Dropdown";
import Field from "../../component/ProductComponent/Field";
import ImageStrip from "../../component/ProductComponent/ImageStrip";
import PricingSection from "../../component/ProductComponent/PricingSection";
import SectionCard from "../../component/ProductComponent/SectionCard";
import TagsInput from "../../component/ProductComponent/TagsInput";
import TInput from "../../component/ProductComponent/TInput";
import ToggleRow from "../../component/ProductComponent/ToogleRow";
import VariantRow, {
  EMPTY_VARIANT,
} from "../../component/ProductComponent/VariantRow";

import { toSlug, validateForm } from "../../utils/addProductHelpers";
import {
  EMPTY_BASIC,
  EMPTY_CATEGORY,
  EMPTY_INVENTORY,
  EMPTY_LOGISTICS,
  EMPTY_PRICING,
  EMPTY_SEO,
} from "../../utils/formDefaults";

export default function AddProduct() {
  const router = useRouter();
  const { colors, radii } = useTheme();
  const { productId } = useLocalSearchParams();
  const isEditMode = !!productId;

  const dispatch = useDispatch();

  const {
    creating,
    createError,
    createSuccess,
    updating,
    updateError,
    updateSuccess,
    currentProduct,
    detailLoading,
  } = useSelector((state) => state.product);

  const authToken = useSelector(selectToken);
  const authUser = useSelector(selectVendorUser);
  const isRestoring = useSelector(selectRestoring);

  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const subCategories = useSelector(selectSubCategories);
  const subCategoriesLoading = useSelector(selectSubCategoriesLoading);
  const subCategoriesError = useSelector(selectSubCategoriesError);

  useEffect(() => {
    if (!isRestoring && authToken) {
      dispatch(fetchCategories({ token: authToken }));
    }
  }, [dispatch, authToken, isRestoring]);

  useEffect(() => {
    if (isRestoring) return;

    if (!authToken || !authUser) {
      // Alert.alert("Authentication Required", "Please log in to add products", [
      //   { text: "Go to Login", onPress: () => router.replace("/auth/login") },
      //   { text: "Cancel", onPress: () => router.back(), style: "cancel" },
      // ]);
      return;
    }
  }, [authToken, authUser, isRestoring, router]);

  // ── Form state ──
  const [images, setImages] = useState([]);
  const [basic, setBasic] = useState(EMPTY_BASIC);
  const [category, setCategory] = useState(EMPTY_CATEGORY);
  const [pricing, setPricing] = useState(EMPTY_PRICING);
  const [inventory, setInventory] = useState(EMPTY_INVENTORY);
  const [variants, setVariants] = useState([]);
  const [logistics, setLogistics] = useState(EMPTY_LOGISTICS);
  const [tags, setTags] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [seo, setSeo] = useState(EMPTY_SEO);
  const [errors, setErrors] = useState({});

  // ── Check if the form has any user-entered data ──
  const hasFormData = useCallback(() => {
    const hasImages = images.length > 0;
    const hasBasic =
      basic.name.trim() !== "" ||
      basic.brand.trim() !== "" ||
      basic.sku.trim() !== "" ||
      basic.shortDescription.trim() !== "" ||
      basic.description.trim() !== "";
    const hasCategory = category.category !== "" || category.subCategory !== "";
    const hasPricing =
      pricing.mrp !== "" || pricing.price !== "" || pricing.costPrice !== "";
    const hasInventory = inventory.stock !== "";
    const hasVariants = variants.length > 0;
    const hasTags = tags.length > 0;
    const hasCustomFields = customFields.length > 0;
    const hasSeo =
      seo.metaTitle.trim() !== "" ||
      seo.metaDescription.trim() !== "" ||
      seo.keywords.trim() !== "";

    return (
      hasImages ||
      hasBasic ||
      hasCategory ||
      hasPricing ||
      hasInventory ||
      hasVariants ||
      hasTags ||
      hasCustomFields ||
      hasSeo
    );
  }, [
    images,
    basic,
    category,
    pricing,
    inventory,
    variants,
    tags,
    customFields,
    seo,
  ]);

  // Resets the whole form back to a blank "Add Product" state.
  const resetForm = useCallback(() => {
    setImages([]);
    setBasic(EMPTY_BASIC);
    setCategory(EMPTY_CATEGORY);
    setPricing(EMPTY_PRICING);
    setInventory(EMPTY_INVENTORY);
    setVariants([]);
    setLogistics(EMPTY_LOGISTICS);
    setTags([]);
    setCustomFields([]);
    setSeo(EMPTY_SEO);
    setErrors({});
    dispatch(resetSubCategories());
  }, [dispatch]);

  // ── "New Product" button handler ──
  // If the form already has data, warn the user first.
  // Give them three choices: save current product, discard & start fresh, or cancel.
  const handleNewProduct = useCallback(() => {
    if (!hasFormData()) {
      // Form is already blank — nothing to warn about
      resetForm();
      return;
    }

    Alert.alert(
      "Unsaved Product",
      "You have unsaved data in this form. What would you like to do?",
      [
        {
          text: "Save Product",
          onPress: () => {
            // Trigger the normal submit flow, which will reset the form on success
            handleSubmit();
          },
        },
        {
          text: "Discard & New",
          style: "destructive",
          onPress: () => resetForm(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  }, [hasFormData, resetForm]);

  useEffect(() => {
    if (category.category) {
      dispatch(
        fetchSubCategories({
          categoryId: category.category,
          token: authToken,
        }),
      );
    } else {
      dispatch(resetSubCategories());
    }
  }, [category.category, dispatch, authToken]);

  useEffect(() => {
    if (isEditMode && productId) {
      dispatch(getProductById({ id: productId }));
    }
  }, [isEditMode, productId, dispatch]);

  useEffect(() => {
    if (currentProduct && isEditMode) {
      setBasic({
        name: currentProduct.name || "",
        slug: currentProduct.slug || "",
        brand: currentProduct.brand || "",
        sku: currentProduct.sku || "",
        shortDescription: currentProduct.shortDescription || "",
        description: currentProduct.description || "",
      });
      setCategory({
        category: currentProduct.category?._id || "",
        subCategory: currentProduct.subCategory?._id || "",
      });
      setPricing({
        mrp: String(currentProduct.mrp || ""),
        price: String(currentProduct.price || ""),
        costPrice: String(currentProduct.costPrice || ""),
        gst: String(currentProduct.gst || "0"),
      });
      setInventory({
        stock: String(currentProduct.stock || ""),
        isFeatured: currentProduct.isFeatured || false,
        isActive: currentProduct.isActive !== false,
      });
      setVariants(currentProduct.variants || []);
      setLogistics({
        weight: String(currentProduct.weight || ""),
        videoUrl: currentProduct.videoUrl || "",
      });
      setTags(currentProduct.tags || []);
      setCustomFields(currentProduct.customFields || []);
      setSeo({
        metaTitle: currentProduct.seo?.metaTitle || "",
        metaDescription: currentProduct.seo?.metaDescription || "",
        keywords: (currentProduct.seo?.keywords || []).join(", "),
      });
      if (currentProduct.images && Array.isArray(currentProduct.images)) {
        setImages(
          currentProduct.images.map((img) => ({
            uri: img.url,
            altText: img.altText || "",
          })),
        );
      }
    }
  }, [currentProduct, isEditMode]);

  // Handle success/error from Redux.
  useEffect(() => {
    if (createSuccess) {
      Alert.alert("✓ Success", "Product created successfully!", [
        {
          text: "Add another",
          onPress: () => {
            dispatch(clearSuccess());
            resetForm();
          },
        },
        {
          text: "Done",
          style: "cancel",
          onPress: () => {
            dispatch(clearSuccess());
            resetForm();
            safeBack(router);
          },
        },
      ]);
    } else if (updateSuccess) {
      Alert.alert("✓ Success", "Product updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearSuccess());
            resetForm();
            safeBack(router);
          },
        },
      ]);
    }
  }, [createSuccess, updateSuccess, dispatch, router, resetForm]);

  useEffect(() => {
    if (createError || updateError) {
      Alert.alert("Error", createError || updateError || "An error occurred");
      dispatch(clearErrors());
    }
  }, [createError, updateError, dispatch]);

  const setField = useCallback(
    (setter) => (key, val) => setter((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const handleNameChange = (val) => {
    setBasic((p) => ({ ...p, name: val, slug: toSlug(val) }));
    setErrors((p) => ({ ...p, name: undefined }));
  };

  const addVariant = () => setVariants((p) => [...p, { ...EMPTY_VARIANT }]);
  const removeVariant = (i) =>
    setVariants((p) => p.filter((_, idx) => idx !== i));
  const updateVariant = (i, key, val) =>
    setVariants((p) =>
      p.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    );

  const handleSubmit = async () => {
    const errs = validateForm({ images, basic, category, pricing, inventory });
    if (Object.keys(errs).length) {
      setErrors(errs);
      Alert.alert("Check form", "Please fix the highlighted fields.");
      return;
    }

    const payload = {
      images: images.map((img) => ({ uri: img.uri, altText: img.altText })),
      name: basic.name.trim(),
      slug: basic.slug || toSlug(basic.name),
      brand: basic.brand.trim(),
      sku: basic.sku.trim(),
      shortDescription: basic.shortDescription.trim(),
      description: basic.description.trim(),
      category: category.category,
      subCategory: category.subCategory,
      mrp: Number(pricing.mrp),
      price: Number(pricing.price),
      costPrice: Number(pricing.costPrice) || 0,
      gst: Number(pricing.gst) || 0,
      stock: Number(inventory.stock),
      isFeatured: inventory.isFeatured,
      isActive: inventory.isActive,
      variants: variants.length > 0 ? variants : [],
      weight: logistics.weight ? Number(logistics.weight) : 0,
      videoUrl: logistics.videoUrl.trim() || null,
      tags,
      customFields,
      seo: {
        metaTitle: seo.metaTitle.trim(),
        metaDescription: seo.metaDescription.trim(),
        keywords: seo.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      },
      token: authToken,
    };

    if (isEditMode && productId) {
      dispatch(
        updateProduct({ productId, productData: payload, token: authToken }),
      );
    } else {
      dispatch(createProduct(payload));
      console.log("PRODUCT DATA :", payload);
    }
  };

  if (isRestoring || (categoriesLoading && categories.length === 0)) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            {isRestoring ? "Loading..." : "Loading categories..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && detailLoading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!authToken) return null;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => safeBack(router)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.backBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEditMode ? "Edit Product" : "Add Product"}
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {isEditMode
                ? "Update the details below"
                : "Fill in the details below"}
            </Text>
          </View>

          {/* ── New Product button — only shown on Add (not Edit) screen ── */}
          {!isEditMode && (
            <TouchableOpacity
              onPress={handleNewProduct}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.newProductBtn,
                {
                  backgroundColor: colors.secondary + "15",
                  borderColor: colors.secondary + "40",
                },
              ]}
            >
              <Ionicons name="add" size={15} color={colors.secondary} />
              <Text
                style={[styles.newProductText, { color: colors.secondary }]}
              >
                New
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1 ── Images */}
          <SectionCard
            title="Product Images"
            icon="images-outline"
            colors={colors}
          >
            <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
              First image is the main photo. Up to 8 images.
            </Text>
            <ImageStrip
              images={images}
              onChange={setImages}
              colors={colors}
              radii={radii}
            />
            {errors.images && (
              <Text
                style={[
                  styles.fieldError,
                  { color: colors.error, marginTop: 6 },
                ]}
              >
                {errors.images}
              </Text>
            )}
          </SectionCard>

          {/* 2 ── Basic Info */}
          <SectionCard
            title="Basic Info"
            icon="information-circle-outline"
            colors={colors}
          >
            <Field label="Product name" required error={errors.name}>
              <TInput
                value={basic.name}
                onChangeText={handleNameChange}
                placeholder="e.g. Organic Cashews 500g"
                error={errors.name}
              />
            </Field>

            {basic.slug !== "" && (
              <View
                style={[
                  styles.slugRow,
                  { backgroundColor: colors.surface, borderRadius: radii.xs },
                ]}
              >
                <Text style={[styles.slugLabel, { color: colors.textMuted }]}>
                  Slug:{" "}
                </Text>
                <Text
                  style={[styles.slugValue, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {basic.slug}
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Brand">
                  <TInput
                    value={basic.brand}
                    onChangeText={(v) => setField(setBasic)("brand", v)}
                    placeholder="e.g. NatureFarm"
                  />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="SKU" hint="Leave blank to auto-generate">
                  <TInput
                    value={basic.sku}
                    onChangeText={(v) => setField(setBasic)("sku", v)}
                    placeholder="e.g. NF-CASH-500"
                  />
                </Field>
              </View>
            </View>

            <Field
              label="Short description"
              hint="Shows on listing cards (max 160 chars)"
            >
              <TInput
                value={basic.shortDescription}
                onChangeText={(v) => setField(setBasic)("shortDescription", v)}
                placeholder="One-line summary"
                multiline
                numberOfLines={2}
              />
            </Field>

            <Field label="Description" required error={errors.description}>
              <TInput
                value={basic.description}
                onChangeText={(v) => {
                  setField(setBasic)("description", v);
                  setErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Full product details — ingredients, features, usage…"
                multiline
                numberOfLines={5}
                error={errors.description}
              />
            </Field>
          </SectionCard>

          {/* 3 ── Category */}
          <SectionCard title="Category" icon="grid-outline" colors={colors}>
            {categoriesError && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {categoriesError}
              </Text>
            )}

            <Field
              label="Category"
              required
              error={errors.category}
              hint={categoriesLoading ? "Loading categories..." : ""}
            >
              <Dropdown
                value={category.category}
                options={categories}
                onChange={(v) => {
                  setCategory({ category: v, subCategory: "" });
                  setErrors((p) => ({
                    ...p,
                    category: undefined,
                    subCategory: undefined,
                  }));
                }}
                placeholder={
                  categoriesLoading ? "Loading..." : "Select a category"
                }
                colors={colors}
                radii={radii}
                disabled={categoriesLoading}
              />
            </Field>

            <Field
              label="Sub-category"
              required
              error={errors.subCategory}
              hint={
                !category.category
                  ? "Select a category first"
                  : subCategoriesLoading
                    ? "Loading subcategories..."
                    : ""
              }
            >
              <Dropdown
                value={category.subCategory}
                options={subCategories}
                onChange={(v) => {
                  setCategory((p) => ({ ...p, subCategory: v }));
                  setErrors((p) => ({ ...p, subCategory: undefined }));
                }}
                placeholder={
                  !category.category
                    ? "— pick category first —"
                    : subCategoriesLoading
                      ? "Loading..."
                      : "Select sub-category"
                }
                colors={colors}
                radii={radii}
                disabled={!category.category || subCategoriesLoading}
              />
            </Field>

            {subCategoriesError && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {subCategoriesError}
              </Text>
            )}
          </SectionCard>

          {/* 4 ── Pricing */}
          <SectionCard title="Pricing" icon="cash-outline" colors={colors}>
            <PricingSection
              data={pricing}
              onChange={(key, val) => {
                setField(setPricing)(key, val);
                setErrors((p) => ({ ...p, [key]: undefined }));
              }}
              errors={errors}
              colors={colors}
              radii={radii}
            />
          </SectionCard>

          {/* 5 ── Inventory */}
          <SectionCard title="Inventory" icon="cube-outline" colors={colors}>
            <Field label="Stock quantity" required error={errors.stock}>
              <TInput
                value={inventory.stock}
                onChangeText={(v) => {
                  setField(setInventory)("stock", v);
                  setErrors((p) => ({ ...p, stock: undefined }));
                }}
                placeholder="e.g. 100"
                keyboardType="number-pad"
                error={errors.stock}
              />
            </Field>

            <View style={[styles.toggleGroup, { borderColor: colors.border }]}>
              <ToggleRow
                label="Featured product"
                subtitle="Show in featured sections on the app"
                value={inventory.isFeatured}
                onChange={(v) => setField(setInventory)("isFeatured", v)}
                colors={colors}
              />
              <View
                style={[
                  styles.toggleDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <ToggleRow
                label="Active / visible"
                subtitle="Customers can find and buy this product"
                value={inventory.isActive}
                onChange={(v) => setField(setInventory)("isActive", v)}
                colors={colors}
              />
            </View>
          </SectionCard>

          {/* 6 ── Variants */}
          <SectionCard
            title="Variants"
            icon="color-palette-outline"
            colors={colors}
          >
            <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
              Add colour / size variants if this product comes in multiple
              options.
            </Text>
            {variants.map((v, i) => (
              <VariantRow
                key={i}
                variant={v}
                index={i}
                onChange={(key, val) => updateVariant(i, key, val)}
                onRemove={() => removeVariant(i)}
                colors={colors}
                radii={radii}
              />
            ))}
            <TouchableOpacity
              onPress={addVariant}
              style={[
                styles.addRowBtn,
                {
                  borderColor: colors.secondary + "50",
                  borderRadius: radii.sm,
                  marginTop: variants.length > 0 ? 4 : 0,
                },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.addRowText, { color: colors.secondary }]}>
                Add variant
              </Text>
            </TouchableOpacity>
          </SectionCard>

          {/* 7 ── Logistics */}
          <SectionCard title="Logistics" icon="car-outline" colors={colors}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Weight (kg)" hint="For shipping estimates">
                  <TInput
                    value={logistics.weight}
                    onChangeText={(v) => setField(setLogistics)("weight", v)}
                    placeholder="e.g. 0.5"
                    keyboardType="decimal-pad"
                  />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Video URL" hint="YouTube or Cloudinary">
                  <TInput
                    value={logistics.videoUrl}
                    onChangeText={(v) => setField(setLogistics)("videoUrl", v)}
                    placeholder="https://…"
                    keyboardType="url"
                  />
                </Field>
              </View>
            </View>
          </SectionCard>

          {/* 8 ── Tags & Custom Fields */}
          <SectionCard
            title="Tags & Details"
            icon="pricetag-outline"
            colors={colors}
          >
            <Field
              label="Tags"
              hint="Help customers discover this product via search"
            >
              <TagsInput
                tags={tags}
                onChange={setTags}
                colors={colors}
                radii={radii}
              />
            </Field>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Field
              label="Custom fields"
              hint="Extra specs like Material, Origin, Shelf Life…"
            >
              <CustomFields
                fields={customFields}
                onChange={setCustomFields}
                colors={colors}
                radii={radii}
              />
            </Field>
          </SectionCard>

          {/* 9 ── SEO */}
          <SectionCard title="SEO" icon="search-outline" colors={colors}>
            <Field
              label="Meta title"
              hint="Defaults to product name if left blank"
            >
              <TInput
                value={seo.metaTitle}
                onChangeText={(v) => setField(setSeo)("metaTitle", v)}
                placeholder="60 chars max"
              />
            </Field>
            <Field label="Meta description">
              <TInput
                value={seo.metaDescription}
                onChangeText={(v) => setField(setSeo)("metaDescription", v)}
                placeholder="160 chars max"
                multiline
                numberOfLines={3}
              />
            </Field>
            <Field label="Keywords" hint="Comma-separated">
              <TInput
                value={seo.keywords}
                onChangeText={(v) => setField(setSeo)("keywords", v)}
                placeholder="organic, cashews, nuts"
              />
            </Field>
          </SectionCard>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={creating || updating}
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  creating || updating ? colors.border : colors.secondary,
              },
            ]}
          >
            {creating || updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText}>
                {isEditMode ? "Update Product" : "Add Product"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...Typography.heading3, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 1 },

  // ── New Product button ──
  newProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  newProductText: {
    fontSize: 13,
    fontWeight: "600",
  },

  scrollContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 120 },
  sectionNote: { fontSize: 12, lineHeight: 17, marginBottom: 2 },
  fieldError: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  row: { flexDirection: "row", gap: SPACING.sm },
  half: { flex: 1 },
  slugRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
  },
  slugLabel: { fontSize: 11, fontWeight: "600" },
  slugValue: { fontSize: 11, flex: 1 },
  toggleGroup: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  toggleDivider: { height: StyleSheet.hairlineWidth },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addRowText: { fontSize: 13, fontWeight: "600" },
  dividerLine: { height: StyleSheet.hairlineWidth, marginVertical: SPACING.sm },
  submitBtn: {
    borderRadius: Radii.md,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
