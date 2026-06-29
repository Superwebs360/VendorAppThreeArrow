import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks (unchanged except getMyProducts)
// ─────────────────────────────────────────────────────────────────────────────

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        const value = productData[key];
        if (["images", "video", "token"].includes(key)) return;
        if (typeof value === "object" && value !== null)
          formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });
      if (Array.isArray(productData.images)) {
        productData.images.forEach((img, idx) => {
          if (img.uri?.startsWith("file://"))
            formData.append("images", {
              uri: img.uri,
              type: "image/jpeg",
              name: `product-img-${idx}.jpg`,
            });
          else if (img instanceof File) formData.append("images", img);
        });
      }
      const response = await axios.post(PRODUCTS_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${productData.token}`,
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

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
          params.append(key, value);
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

export const getProductById = createAsyncThunk(
  "product/getProductById",
  async ({ id, isSlug = false }, { rejectWithValue }) => {
    try {
      const endpoint = isSlug
        ? `${PRODUCTS_ENDPOINT}/${id}`
        : `${PRODUCTS_ENDPOINT}/id/${id}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Product not found",
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ productId, productData, token }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        const value = productData[key];
        if (key === "images" || key === "video") return;
        if (typeof value === "object" && value !== null)
          formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });
      if (productData.images && Array.isArray(productData.images)) {
        productData.images.forEach((img, idx) => {
          if (img.uri && img.uri.startsWith("file://"))
            formData.append("images", {
              uri: img.uri,
              type: "image/jpeg",
              name: `product-img-${idx}.jpg`,
            });
          else if (img instanceof File) formData.append("images", img);
        });
      }
      if (productData.video && productData.video.uri)
        formData.append("video", {
          uri: productData.video.uri,
          type: "video/mp4",
          name: "product-video.mp4",
        });
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

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${PRODUCTS_ENDPOINT}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
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

// ── getMyProducts — now accepts full filter/search/pagination params ──────────
export const getMyProducts = createAsyncThunk(
  "product/getMyProducts",
  async (
    {
      token,
      page = 1,
      limit = 12,
      search = "",
      category = "",
      subCategory = "",
      minPrice = "",
      maxPrice = "",
      isActive = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (subCategory) params.append("subCategory", subCategory);
      if (minPrice !== "") params.append("minPrice", minPrice);
      if (maxPrice !== "") params.append("maxPrice", maxPrice);
      if (isActive !== "") params.append("isActive", isActive);

      const response = await axios.get(
        `${API_BASE_URL}/api/products/my-products?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data; // { products, total, page, pages, limit }
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
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  products: [],
  total: 0,
  page: 1,
  pages: 0,
  limit: 12,
  listLoading: false,
  listError: null,

  currentProduct: null,
  detailLoading: false,
  detailError: null,

  creating: false,
  createError: null,
  createSuccess: false,

  updating: false,
  updateError: null,
  updateSuccess: false,

  deleting: false,
  deleteError: null,
  deleteSuccess: false,

  formData: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearErrors(state) {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearSuccess(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    resetCurrentProduct(state) {
      state.currentProduct = null;
      state.detailError = null;
    },
    setFormData(state, action) {
      state.formData = action.payload;
    },
    clearFormData(state) {
      state.formData = null;
    },
  },
  extraReducers: (builder) => {
    // CREATE
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
        if (Array.isArray(state.products))
          state.products.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create product";
      });

    // GET PRODUCTS (public)
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

    // GET BY ID
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

    // UPDATE
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
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (idx > -1) state.products[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update product";
      });

    // DELETE
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
        state.products = state.products.filter(
          (p) => p._id !== action.payload._id,
        );
        if (state.currentProduct?._id === action.payload._id)
          state.currentProduct = null;
        if (state.total > 0) state.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Failed to delete product";
      });

    // GET MY PRODUCTS
    builder
      .addCase(getMyProducts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getMyProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listError = null;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 0;
        state.limit = action.payload.limit || 12;
      })
      .addCase(getMyProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch products";
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

export const selectProducts = (state) => state.product.products;
export const selectProductsLoading = (state) => state.product.listLoading;
export const selectProductsError = (state) => state.product.listError;
export const selectProductsTotal = (state) => state.product.total;
export const selectProductsPage = (state) => state.product.page;
export const selectProductsPages = (state) => state.product.pages;
export const selectProductsLimit = (state) => state.product.limit;
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
