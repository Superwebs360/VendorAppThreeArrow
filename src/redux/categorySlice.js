import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const CATEGORIES_ENDPOINT = `${API_BASE_URL}/api/categories`;
const SUBCATEGORIES_ENDPOINT = `${API_BASE_URL}/api/subcategories`;

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all categories
 * Query params: vendorId (optional)
 */
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async ({ vendorId = null, token = null } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (vendorId) params.append("vendorId", vendorId);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${CATEGORIES_ENDPOINT}?${params}`,
        { headers }
      );

      // Handle both array and object responses
      return Array.isArray(response.data) ? response.data : response.data.categories || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch categories"
      );
    }
  }
);

/**
 * Fetch subcategories for a specific category
 * Query params: category (required), vendorId (optional)
 */
export const fetchSubCategories = createAsyncThunk(
  "category/fetchSubCategories",
  async ({ categoryId, vendorId = null, token = null } = {}, { rejectWithValue }) => {
    try {
      if (!categoryId) {
        return rejectWithValue("Category ID is required");
      }

      const params = new URLSearchParams();
      params.append("category", categoryId);
      if (vendorId) params.append("vendorId", vendorId);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${SUBCATEGORIES_ENDPOINT}?${params}`,
        { headers }
      );

      // Handle both array and object responses
      return Array.isArray(response.data)
        ? response.data
        : response.data.subCategories || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch subcategories"
      );
    }
  }
);

/**
 * Fetch a single category by slug
 */
export const fetchCategoryBySlug = createAsyncThunk(
  "category/fetchCategoryBySlug",
  async ({ slug }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CATEGORIES_ENDPOINT}/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Category not found"
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Redux Slice
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // Categories list
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  // Subcategories list
  subCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,

  // Single category
  currentCategory: null,
  currentCategoryLoading: false,
  currentCategoryError: null,

  // Cached subcategories by category ID
  subCategoriesByCategory: {}, // { categoryId: [...subcategories] }
};

const categorySlice = createSlice({
  name: "category",
  initialState,

  reducers: {
    // Clear errors
    clearCategoryErrors(state) {
      state.categoriesError = null;
      state.subCategoriesError = null;
      state.currentCategoryError = null;
    },

    // Reset subcategories (when switching category)
    resetSubCategories(state) {
      state.subCategories = [];
      state.subCategoriesError = null;
    },
  },

  extraReducers: (builder) => {
    // ─── FETCH CATEGORIES ───────────────────────────────────────────────────
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = null;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload || "Failed to fetch categories";
      });

    // ─── FETCH SUBCATEGORIES ────────────────────────────────────────────────
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.subCategoriesLoading = true;
        state.subCategoriesError = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategoriesError = null;
        state.subCategories = action.payload || [];

        // Cache subcategories by category ID
        const categoryId = action.meta.arg.categoryId;
        if (categoryId) {
          state.subCategoriesByCategory[categoryId] = action.payload || [];
        }
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategoriesError = action.payload || "Failed to fetch subcategories";
      });

    // ─── FETCH CATEGORY BY SLUG ─────────────────────────────────────────────
    builder
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.currentCategoryLoading = true;
        state.currentCategoryError = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategoryError = null;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategoryError = action.payload || "Category not found";
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions & Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const { clearCategoryErrors, resetSubCategories } = categorySlice.actions;

// Selectors
export const selectCategories = (state) => state.category.categories;
export const selectCategoriesLoading = (state) => state.category.categoriesLoading;
export const selectCategoriesError = (state) => state.category.categoriesError;

export const selectSubCategories = (state) => state.category.subCategories;
export const selectSubCategoriesLoading = (state) => state.category.subCategoriesLoading;
export const selectSubCategoriesError = (state) => state.category.subCategoriesError;

export const selectCurrentCategory = (state) => state.category.currentCategory;
export const selectCurrentCategoryLoading = (state) => state.category.currentCategoryLoading;
export const selectCurrentCategoryError = (state) => state.category.currentCategoryError;

export const selectSubCategoriesByCategory = (categoryId) => (state) =>
  state.category.subCategoriesByCategory[categoryId] || [];

export default categorySlice.reducer;