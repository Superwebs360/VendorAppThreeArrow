import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DeliverySettings from "@/component/ProductComponent/Deliverysettings";
import ExpectedSales from "@/component/ProductComponent/Expectedsales";
import Inventory from "@/component/ProductComponent/Inventory";
import Pricing from "@/component/ProductComponent/Pricing";
import ProductImageUpload from "@/component/ProductComponent/Productimageupload";
import ProductInfo from "@/component/ProductComponent/Productinfo";
import UnitWeight from "@/component/ProductComponent/Unitweight";
import { SPACING } from "@/constants/gridConfig";
import { Radii, Shadows, Typography, useTheme } from "@/constants/theme";

function Card({ children, colors }) {
  return (
    <View
      style={[
        styles.card,
        Shadows.sm,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

const product = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const [images, setImages] = useState([]);

  const [productInfo, setProductInfo] = useState({
    name: "",
    category: "",
    brand: "",
  });

  const [pricing, setPricing] = useState({
    mrp: "",
    selling: "",
    discount: "0",
  });

  const [inventory, setInventory] = useState({
    quantity: "",
    inStock: true,
  });

  const [unitWeight, setUnitWeight] = useState({
    unit: "",
    customUnit: "",
  });

  const [delivery, setDelivery] = useState({
    deliveryTime: "10 min",
    express: true,
  });

  const handleSubmit = () => {
    const payload = {
      images,
      ...productInfo,
      ...pricing,
      ...inventory,
      ...unitWeight,
      ...delivery,
    };
    // TODO: wire to createProduct thunk / API call
    console.log("Submitting product:", payload);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Add Product
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card colors={colors}>
          <ProductImageUpload images={images} onChange={setImages} />
        </Card>

        <Card colors={colors}>
          <ProductInfo data={productInfo} onChange={setProductInfo} />
        </Card>

        <Card colors={colors}>
          <Pricing data={pricing} onChange={setPricing} />
        </Card>

        <Card colors={colors}>
          <Inventory data={inventory} onChange={setInventory} />
        </Card>

        <Card colors={colors}>
          <UnitWeight data={unitWeight} onChange={setUnitWeight} />
        </Card>

        <Card colors={colors}>
          <DeliverySettings data={delivery} onChange={setDelivery} />
        </Card>

        <ExpectedSales />

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          style={[styles.submitBtn, { backgroundColor: colors.secondary }]}
        >
          <Text style={styles.submitText}>Add Product</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default product;

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: SPACING.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 12,
  },
  headerTitle: { ...Typography.heading3, fontWeight: "700" },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 16,
  },
  submitBtn: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
