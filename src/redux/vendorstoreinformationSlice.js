import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.17:3000";
const API_BASE = `${BASE_URL}/api/vendor/store-information`;

// ── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * fetchVendorStoreInformation
 * GET /api/vendor/store-information/:vendorId
 * Retrieves store information for a specific vendor
 */
export const fetchVendorStoreInformation = createAsyncThunk(
  "vendorStoreInfo/fetchVendorStoreInformation",
  async ({ vendorId }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.get(`${API_BASE}/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch store information",
      );
    }
  },
);

/**
 * createVendorStoreInformation
 * POST /api/vendor/store-information
 * Creates new store information with image uploads
 */
export const createVendorStoreInformation = createAsyncThunk(
  "vendorStoreInfo/createVendorStoreInformation",
  async (formData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.post(API_BASE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create store information",
      );
    }
  },
);

/**
 * updateVendorStoreInformation
 * PUT /api/vendor/store-information/:vendorId
 * Updates existing store information
 */
export const updateVendorStoreInformation = createAsyncThunk(
  "vendorStoreInfo/updateVendorStoreInformation",
  async ({ vendorId, formData }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.put(`${API_BASE}/${vendorId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update store information",
      );
    }
  },
);

/**
 * deleteVendorStoreInformation
 * DELETE /api/vendor/store-information/:vendorId
 * Deletes store information
 */
export const deleteVendorStoreInformation = createAsyncThunk(
  "vendorStoreInfo/deleteVendorStoreInformation",
  async ({ vendorId }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.delete(`${API_BASE}/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete store information",
      );
    }
  },
);

/**
 * uploadStoreImage
 * POST /api/vendor/store-information/upload/:vendorId
 * Uploads multiple store images (field name: storeImages, max 10)
 */
export const uploadStoreImage = createAsyncThunk(
  "vendorStoreInfo/uploadStoreImage",
  async ({ vendorId, formData }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.post(
        `${API_BASE}/upload/${vendorId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload image",
      );
    }
  },
);

/**
 * getMyStoreInformation
 * GET /api/vendor/store-information/me
 * Retrieves the authenticated vendor's own store information
 * Returns null if store hasn't been created yet (404 response)
 */
export const getMyStoreInformation = createAsyncThunk(
  "vendorStoreInfo/getMyStoreInformation",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await axios.get(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      // 404 means store hasn't been created yet — return null instead of error
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch your store information",
      );
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  // Store Data
  storeInfo: null,
  stores: [],

  // UI States
  loading: false,
  uploading: false,
  saving: false,
  isVerified: false,

  // Error Handling
  error: null,
  uploadError: null,
  saveError: null,

  // Form State
  formDirty: false,

  // Store creation status
  storeExists: null, // null = not checked, true = exists, false = doesn't exist
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const vendorStoreInformationSlice = createSlice({
  name: "vendorStoreInfo",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
      state.uploadError = null;
      state.saveError = null;
    },

    markFormDirty(state) {
      state.formDirty = true;
    },

    markFormClean(state) {
      state.formDirty = false;
    },

    resetStoreInfo(state) {
      state.storeInfo = null;
      state.stores = [];
      state.error = null;
      state.saveError = null;
      state.storeExists = null;
      state.formDirty = false;
    },

    updateLocalStoreInfo(state, action) {
      if (state.storeInfo) {
        state.storeInfo = { ...state.storeInfo, ...action.payload };
        state.formDirty = true;
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchVendorStoreInformation ───────────────────────────────────────
    builder
      .addCase(fetchVendorStoreInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorStoreInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = action.payload;
        state.storeExists = !!action.payload;
        state.isVerified = action.payload?.isVerified || false;
      })
      .addCase(fetchVendorStoreInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.storeExists = false;
      });

    // ── createVendorStoreInformation ──────────────────────────────────────
    builder
      .addCase(createVendorStoreInformation.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createVendorStoreInformation.fulfilled, (state, action) => {
        state.saving = false;
        state.storeInfo = action.payload;
        state.storeExists = true;
        state.isVerified = action.payload?.isVerified || false;
        state.formDirty = false;
        state.saveError = null;
      })
      .addCase(createVendorStoreInformation.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      });

    // ── updateVendorStoreInformation ──────────────────────────────────────
    builder
      .addCase(updateVendorStoreInformation.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateVendorStoreInformation.fulfilled, (state, action) => {
        state.saving = false;
        state.storeInfo = action.payload;
        state.storeExists = true;
        state.isVerified = action.payload?.isVerified || false;
        state.formDirty = false;
        state.saveError = null;
      })
      .addCase(updateVendorStoreInformation.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      });

    // ── deleteVendorStoreInformation ──────────────────────────────────────
    builder
      .addCase(deleteVendorStoreInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendorStoreInformation.fulfilled, (state) => {
        state.loading = false;
        state.storeInfo = null;
        state.storeExists = false;
        state.isVerified = false;
        state.formDirty = false;
      })
      .addCase(deleteVendorStoreInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── uploadStoreImage ──────────────────────────────────────────────────
    builder
      .addCase(uploadStoreImage.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
      })
      .addCase(uploadStoreImage.fulfilled, (state, action) => {
        state.uploading = false;
        if (state.storeInfo) {
          state.storeInfo = { ...state.storeInfo, ...action.payload };
          state.formDirty = true;
        }
        state.uploadError = null;
      })
      .addCase(uploadStoreImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
      });

    // ── getMyStoreInformation ─────────────────────────────────────────────
    builder
      .addCase(getMyStoreInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyStoreInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = action.payload;
        state.storeExists = !!action.payload;
        state.isVerified = action.payload?.isVerified || false;
        state.error = null;
      })
      .addCase(getMyStoreInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.storeExists = false;
      });
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────
export const {
  clearError,
  markFormDirty,
  markFormClean,
  resetStoreInfo,
  updateLocalStoreInfo,
} = vendorStoreInformationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectStoreInfo = (state) => state.vendorStoreInfo.storeInfo;
export const selectStores = (state) => state.vendorStoreInfo.stores;
export const selectStoreLoading = (state) => state.vendorStoreInfo.loading;
export const selectStoreUploading = (state) => state.vendorStoreInfo.uploading;
export const selectStoreSaving = (state) => state.vendorStoreInfo.saving;
export const selectStoreError = (state) => state.vendorStoreInfo.error;
export const selectUploadError = (state) => state.vendorStoreInfo.uploadError;
export const selectSaveError = (state) => state.vendorStoreInfo.saveError;
export const selectIsStoreVerified = (state) =>
  state.vendorStoreInfo.isVerified;
export const selectFormDirty = (state) => state.vendorStoreInfo.formDirty;
export const selectStoreExists = (state) => state.vendorStoreInfo.storeExists;

export default vendorStoreInformationSlice.reducer;
