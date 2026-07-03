import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios"; // swap for your shared `api` instance if you have one

// TODO: point this at your real API base URL / shared axios instance
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const API_BASE = `${BASE_URL}/api/vendors`;

// ─────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────

export const fetchPaymentMethods = createAsyncThunk(
  "vendorPayment/fetchAll",
  async (vendorId, { rejectWithValue }) => {
    const url = `${API_BASE}/${vendorId}/payment-methods`;
    try {
      const res = await axios.get(url);
      return res.data.data; // array of methods
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch payment methods",
      );
    }
  },
);

// payload: { vendorId, method: { type, appId, upiId, cardName, cardNumber,
// cardExpiry, bankHolder, bankAccount, bankIfsc, bankName } }
export const addPaymentMethod = createAsyncThunk(
  "vendorPayment/add",
  async ({ vendorId, method }, { rejectWithValue }) => {
    const url = `${API_BASE}/${vendorId}/payment-methods`;
    try {
      const res = await axios.post(url, method);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add payment method",
      );
    }
  },
);

// payload: { vendorId, id, updates }
export const updatePaymentMethod = createAsyncThunk(
  "vendorPayment/update",
  async ({ vendorId, id, updates }, { rejectWithValue }) => {
    const url = `${API_BASE}/${vendorId}/payment-methods/${id}`;
    try {
      const res = await axios.put(url, updates);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update payment method",
      );
    }
  },
);

// payload: { vendorId, id }
export const togglePaymentMethodStatus = createAsyncThunk(
  "vendorPayment/toggleStatus",
  async ({ vendorId, id }, { rejectWithValue }) => {
    const url = `${API_BASE}/${vendorId}/payment-methods/${id}/toggle`;
    try {
      const res = await axios.patch(url);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle payment method",
      );
    }
  },
);

// payload: { vendorId, id }
export const deletePaymentMethod = createAsyncThunk(
  "vendorPayment/delete",
  async ({ vendorId, id }, { rejectWithValue }) => {
    const url = `${API_BASE}/${vendorId}/payment-methods/${id}`;
    try {
      const res = await axios.delete(url);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete payment method",
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // per-action flags, handy for disabling buttons in the UI
  mutationStatus: "idle",
  mutationError: null,
};

const vendorPaymentSlice = createSlice({
  name: "vendorPayment",
  initialState,
  reducers: {
    clearPaymentMethods(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
    clearPaymentMutationError(state) {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetch all ──
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // ── add ──
      .addCase(addPaymentMethod.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload || action.error.message;
      })

      // ── update ──
      .addCase(updatePaymentMethod.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const idx = state.items.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload || action.error.message;
      })

      // ── toggle active/inactive ──
      .addCase(togglePaymentMethodStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(togglePaymentMethodStatus.rejected, (state, action) => {
        state.mutationError = action.payload || action.error.message;
      })

      // ── delete ──
      .addCase(deletePaymentMethod.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = state.items.filter((m) => m._id !== action.payload);
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload || action.error.message;
      });
  },
});

export const { clearPaymentMethods, clearPaymentMutationError } =
  vendorPaymentSlice.actions;

// ── Selectors ──
export const selectPaymentMethods = (state) => state.vendorPayment.items;
export const selectActivePaymentMethods = (state) =>
  state.vendorPayment.items.filter((m) => m.active);
export const selectPaymentMethodsStatus = (state) => state.vendorPayment.status;
export const selectPaymentMethodsError = (state) => state.vendorPayment.error;

export default vendorPaymentSlice.reducer;
