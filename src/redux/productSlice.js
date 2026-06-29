import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new product
 * Expects FormData payload with:
 *  - name, slug, brand, sku, shortDescription, description
 *  - category, subCategory (ObjectIds)
 *  - mrp, price, costPrice, gst
 *  - stock, isFeatured, isActive
 *  - variants (JSON string or array)
 *  - weight, videoUrl, tags (JSON string), customFields (JSON string)
 *  - seo: { metaTitle, metaDescription, keywords }
 *  - images (FormData files)
 *  - video (FormData file)
 */
// export const createProduct = createAsyncThunk(
//   "product/createProduct",
//   async (productData, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();

//       // Append all text fields
//       Object.keys(productData).forEach((key) => {
//         const value = productData[key];

//         // Skip images and video (handle separately)
//         if (key === "images" || key === "video") return;

//         // Convert objects/arrays to JSON strings for FormData
//         if (typeof value === "object" && value !== null) {
//           formData.append(key, JSON.stringify(value));
//         } else {
//           formData.append(key, value);
//         }
//       });

//       // Handle image files
//       if (productData.images && Array.isArray(productData.images)) {
//         productData.images.forEach((img, idx) => {
//           if (img.uri && img.uri.startsWith("file://")) {
//             // React Native URI
//             formData.append("images", {
//               uri: img.uri,
//               type: "image/jpeg",
//               name: `product-img-${idx}.jpg`,
//             });
//           } else if (img instanceof File) {
//             // Web File object
//             formData.append("images", img);
//           }
//         });
//       }

//       // Handle video file
//       if (productData.video && productData.video.uri) {
//         formData.append("video", {
//           uri: productData.video.uri,
//           type: "video/mp4",
//           name: "product-video.mp4",
//         });
//       }

//       const response = await axios.post(PRODUCTS_ENDPOINT, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${productData.token}`,
//         },
//       });

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to create product",
//       );
//     }
//   },
// );

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        const value = productData[key];

        // ── Skip these — handled separately or not needed in body ──
        if (["images", "video", "token"].includes(key)) return;

        if (typeof value === "object" && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Image files only — existing Cloudinary URLs are already in the DB
      if (Array.isArray(productData.images)) {
        productData.images.forEach((img, idx) => {
          if (img.uri?.startsWith("file://")) {
            formData.append("images", {
              uri: img.uri,
              type: "image/jpeg",
              name: `product-img-${idx}.jpg`,
            });
          } else if (img instanceof File) {
            formData.append("images", img);
          }
          // Cloudinary URLs (edit mode) → skip, backend handles separately
        });
      }

      const response = await axios.post(PRODUCTS_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${productData.token}`, // stays in header
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create product",
      );
    }
  },
);
/**
 * Get all products with filters
 * Query params: page, limit, category, subCategory, minPrice, maxPrice, search, vendorId, lat, lng, radiusKm
 */
export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const response = await axios.get(`${PRODUCTS_ENDPOINT}?${params}`, {
        headers: filters.token
          ? { Authorization: `Bearer ${filters.token}` }
          : {},
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products",
      );
    }
  },
);

/**
 * Get a single product by ID or slug
 */
export const getProductById = createAsyncThunk(
  "product/getProductById",
  async ({ id, isSlug = false }, { rejectWithValue }) => {
    try {
      const endpoint = isSlug
        ? `${PRODUCTS_ENDPOINT}/${id}` // slug route
        : `${PRODUCTS_ENDPOINT}/id/${id}`; // id route

      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Product not found",
      );
    }
  },
);

/**
 * Update an existing product
 */
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ productId, productData, token }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append all text fields
      Object.keys(productData).forEach((key) => {
        const value = productData[key];

        // Skip images and video (handle separately)
        if (key === "images" || key === "video") return;

        // Convert objects/arrays to JSON strings for FormData
        if (typeof value === "object" && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Handle new image files
      if (productData.images && Array.isArray(productData.images)) {
        productData.images.forEach((img, idx) => {
          if (img.uri && img.uri.startsWith("file://")) {
            // React Native URI (new image)
            formData.append("images", {
              uri: img.uri,
              type: "image/jpeg",
              name: `product-img-${idx}.jpg`,
            });
          } else if (img instanceof File) {
            // Web File object (new image)
            formData.append("images", img);
          }
          // If img is just a URL string, don't append (existing image)
        });
      }

      // Handle new video file
      if (productData.video && productData.video.uri) {
        formData.append("video", {
          uri: productData.video.uri,
          type: "video/mp4",
          name: "product-video.mp4",
        });
      }

      const response = await axios.put(
        `${PRODUCTS_ENDPOINT}/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product",
      );
    }
  },
);

/**
 * Delete a product (soft delete: isDeleted = true)
 */
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${PRODUCTS_ENDPOINT}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product",
      );
    }
  },
);

// Fetch my vendor Product

export const getMyProducts = createAsyncThunk(
  "product/getMyProducts",
  async (
    { token, page = 1, limit = 12, category, subCategory, search } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (category) params.append("category", category);
      if (subCategory) params.append("subCategory", subCategory);
      if (search) params.append("search", search);

      const response = await axios.get(
        `${API_BASE_URL}/api/vendor/my-products?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data; // { products, total, page, pages }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products",
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Redux Slice
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // List view
  products: [],
  total: 0,
  page: 1,
  pages: 0,
  listLoading: false,
  listError: null,

  // Single product detail
  currentProduct: null,
  detailLoading: false,
  detailError: null,

  // Create/Update/Delete
  creating: false,
  createError: null,
  createSuccess: false,

  updating: false,
  updateError: null,
  updateSuccess: false,

  deleting: false,
  deleteError: null,
  deleteSuccess: false,

  // Form state (for edit)
  formData: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,

  reducers: {
    // Clear all messages
    clearErrors(state) {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    // Clear success flags
    clearSuccess(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },

    // Reset current product
    resetCurrentProduct(state) {
      state.currentProduct = null;
      state.detailError = null;
    },

    // Set form data for editing
    setFormData(state, action) {
      state.formData = action.payload;
    },

    // Clear form data
    clearFormData(state) {
      state.formData = null;
    },
  },

  extraReducers: (builder) => {
    // ─── CREATE PRODUCT ──────────────────────────────────────────────────
    builder
      .addCase(createProduct.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.createError = null;
        // Add the new product to the list
        if (state.products && Array.isArray(state.products)) {
          state.products.unshift(action.payload);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create product";
      });

    // ─── GET PRODUCTS ────────────────────────────────────────────────────
    builder
      .addCase(getProducts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listError = null;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 0;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch products";
      });

    // ─── GET PRODUCT BY ID ───────────────────────────────────────────────
    builder
      .addCase(getProductById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailError = null;
        state.currentProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Product not found";
      });

    // ─── UPDATE PRODUCT ──────────────────────────────────────────────────
    builder
      .addCase(updateProduct.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.updateError = null;
        state.currentProduct = action.payload;
        // Update in list
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (idx > -1) {
          state.products[idx] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update product";
      });

    // ─── DELETE PRODUCT ──────────────────────────────────────────────────
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteSuccess = true;
        state.deleteError = null;
        // Remove from list
        state.products = state.products.filter(
          (p) => p._id !== action.payload._id,
        );
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Failed to delete product";
      });
  },
});

export const {
  clearErrors,
  clearSuccess,
  resetCurrentProduct,
  setFormData,
  clearFormData,
} = productSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS - NEW (For CategoryScreen integration)
// ─────────────────────────────────────────────────────────────────────────────

export const selectProducts = (state) => state.product.products;
export const selectProductsLoading = (state) => state.product.listLoading;
export const selectProductsError = (state) => state.product.listError;

export const selectCurrentProduct = (state) => state.product.currentProduct;
export const selectCurrentProductLoading = (state) =>
  state.product.detailLoading;
export const selectCurrentProductError = (state) => state.product.detailError;

export const selectProductCreating = (state) => state.product.creating;
export const selectProductCreateError = (state) => state.product.createError;
export const selectProductCreateSuccess = (state) =>
  state.product.createSuccess;

export const selectProductUpdating = (state) => state.product.updating;
export const selectProductUpdateError = (state) => state.product.updateError;
export const selectProductUpdateSuccess = (state) =>
  state.product.updateSuccess;

export const selectProductDeleting = (state) => state.product.deleting;
export const selectProductDeleteError = (state) => state.product.deleteError;
export const selectProductDeleteSuccess = (state) =>
  state.product.deleteSuccess;

export const selectProductFormData = (state) => state.product.formData;

export default productSlice.reducer;
