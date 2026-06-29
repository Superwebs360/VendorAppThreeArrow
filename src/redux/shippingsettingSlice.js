// store/slices/shippingSettingsSlice.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.17:3000";
const API_BASE = `${BASE_URL}/api/vendor/shipping-settings`;

// ── Auth header helper ────────────────────────────────────────────────────────
const authHeaders = async () => {
  const token = await AsyncStorage.getItem("vendorToken");
  return { Authorization: `Bearer ${token}` };
};

// ─────────────────────────────────────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * fetchMyShippingSettings
 * GET /api/vendor/shipping-settings/me
 * Returns null if not set yet (404).
 */
export const fetchMyShippingSettings = createAsyncThunk(
  "shippingSettings/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const headers = await authHeaders();
      const res = await axios.get(`${API_BASE}/me`, { headers });
      return res.data.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch shipping settings",
      );
    }
  },
);

/**
 * saveShippingSettings
 * Creates or updates (upsert) the vendor's shipping location.
 * POST /api/vendor/shipping-settings
 */
export const saveShippingSettings = createAsyncThunk(
  "shippingSettings/save",
  async (payload, { rejectWithValue }) => {
    try {
      const headers = await authHeaders();
      const res = await axios.post(API_BASE, payload, { headers });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save shipping settings",
      );
    }
  },
);

/**
 * updateShippingSettings
 * PUT /api/vendor/shipping-settings/:id
 * Partial update.
 */
export const updateShippingSettings = createAsyncThunk(
  "shippingSettings/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const headers = await authHeaders();
      const res = await axios.put(`${API_BASE}/${id}`, payload, { headers });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update shipping settings",
      );
    }
  },
);

/**
 * deleteShippingSettings
 * DELETE /api/vendor/shipping-settings/:id
 */
export const deleteShippingSettings = createAsyncThunk(
  "shippingSettings/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      const headers = await authHeaders();
      const res = await axios.delete(`${API_BASE}/${id}`, { headers });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete shipping settings",
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // Data
  shippingLocation: null,

  // UI flags
  loading: false,
  saving: false,

  // Status
  shippingExists: null, // null = not checked, true = set, false = not set

  // Errors
  error: null,
  saveError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const shippingSettingsSlice = createSlice({
  name: "shippingSettings",
  initialState,

  reducers: {
    clearShippingError(state) {
      state.error = null;
      state.saveError = null;
    },

    resetShipping(state) {
      state.shippingLocation = null;
      state.shippingExists = null;
      state.error = null;
      state.saveError = null;
    },

    updateLocalShipping(state, action) {
      if (state.shippingLocation) {
        state.shippingLocation = {
          ...state.shippingLocation,
          ...action.payload,
        };
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchMyShippingSettings ────────────────────────────────────────────
    builder
      .addCase(fetchMyShippingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyShippingSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingLocation = action.payload;
        state.shippingExists = !!action.payload;
      })
      .addCase(fetchMyShippingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.shippingExists = false;
      });

    // ── saveShippingSettings (upsert) ──────────────────────────────────────
    builder
      .addCase(saveShippingSettings.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveShippingSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.shippingLocation = action.payload;
        state.shippingExists = true;
        state.saveError = null;
      })
      .addCase(saveShippingSettings.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      });

    // ── updateShippingSettings ─────────────────────────────────────────────
    builder
      .addCase(updateShippingSettings.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateShippingSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.shippingLocation = action.payload;
        state.shippingExists = true;
        state.saveError = null;
      })
      .addCase(updateShippingSettings.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
      });

    // ── deleteShippingSettings ─────────────────────────────────────────────
    builder
      .addCase(deleteShippingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShippingSettings.fulfilled, (state) => {
        state.loading = false;
        state.shippingLocation = null;
        state.shippingExists = false;
      })
      .addCase(deleteShippingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

export const { clearShippingError, resetShipping, updateLocalShipping } =
  shippingSettingsSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const selectShippingLocation = (state) =>
  state.shippingSettings.shippingLocation;
export const selectShippingLoading = (state) => state.shippingSettings.loading;
export const selectShippingSaving = (state) => state.shippingSettings.saving;
export const selectShippingError = (state) => state.shippingSettings.error;
export const selectShippingSaveError = (state) =>
  state.shippingSettings.saveError;
export const selectShippingExists = (state) =>
  state.shippingSettings.shippingExists;

export default shippingSettingsSlice.reducer;
