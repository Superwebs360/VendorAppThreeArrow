import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * GET /api/orders/vendor/my-orders
 * Supports: ?page=1&limit=10&status=shipped
 */
export const fetchVendorOrders = createAsyncThunk(
  "orders/fetchVendorOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 25, status, from, to, search } = params;

      const query = new URLSearchParams({ page, limit });
      if (status) query.set("status", status);
      // Note: backend doesn't support from/to/search for vendor orders yet;
      // we filter client-side for those — but we still pass them for future support.
      if (from) query.set("from", from);
      if (to) query.set("to", to);

      const token = await AsyncStorage.getItem("vendorToken");

      const { data } = await axios.get(
        `${BASE_URL}/api/orders/vendor/my-orders?${query.toString()}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { ...data, requestedParams: params };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

/**
 * PUT /api/orders/vendor/:id/status
 * Body: { status, trackingNumber?, notes? }
 */
export const updateVendorOrderStatus = createAsyncThunk(
  "orders/updateVendorOrderStatus",
  async ({ orderId, status, trackingNumber, notes }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const { data } = await axios.put(
        `${BASE_URL}/api/orders/vendor/${orderId}/status`,
        { status, trackingNumber, notes },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data.data; // updated order object
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update order status",
      );
    }
  },
);

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

// Date helpers
export const getLast30DaysRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

// Client-side search filter applied over already-fetched orders
export const filterOrdersLocally = (orders, { search, status, from, to }) => {
  let result = [...orders];

  if (search?.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (o) =>
        o._id?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.user?.phone?.includes(q) ||
        o.items?.some((i) => i.product?.name?.toLowerCase().includes(q)),
    );
  }

  if (status && status !== "all") {
    result = result.filter((o) => o.status === status);
  }

  if (from) {
    const fromDate = new Date(from);
    result = result.filter((o) => new Date(o.createdAt) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter((o) => new Date(o.createdAt) <= toDate);
  }

  return result;
};

/* ═══════════════════════════════════════════════════════════
   SLICE
═══════════════════════════════════════════════════════════ */

const initialState = {
  // Raw data from API
  orders: [],
  pagination: { total: 0, page: 1, pages: 1, limit: 25 },

  // Active filters (drives both API re-fetch and local filter)
  filters: {
    status: "all", // "all" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
    search: "",
    dateRange: "all", // "all" | "last30" | "custom"
    from: null, // ISO date string "YYYY-MM-DD"
    to: null,
  },

  // UI states
  loading: false,
  updating: false, // for status update spinner
  error: null,
  updateError: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setFilter(state, action) {
      // action.payload = { key: 'status', value: 'shipped' }
      const { key, value } = action.payload;
      state.filters[key] = value;
    },

    setDateRange(state, action) {
      // action.payload = "all" | "last30" | "custom"
      state.filters.dateRange = action.payload;
      if (action.payload === "last30") {
        const { from, to } = getLast30DaysRange();
        state.filters.from = from;
        state.filters.to = to;
      } else if (action.payload === "all") {
        state.filters.from = null;
        state.filters.to = null;
      }
      // "custom" → caller must also dispatch setFilter for from/to
    },

    setCustomDateRange(state, action) {
      // action.payload = { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
      state.filters.dateRange = "custom";
      state.filters.from = action.payload.from;
      state.filters.to = action.payload.to;
    },

    resetFilters(state) {
      state.filters = initialState.filters;
    },

    clearUpdateError(state) {
      state.updateError = null;
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ── fetchVendorOrders ──────────────────────────────────────────────────
    builder
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateVendorOrderStatus ────────────────────────────────────────────
    builder
      .addCase(updateVendorOrderStatus.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateVendorOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        const idx = state.orders.findIndex((o) => o._id === updated._id);
        if (idx !== -1) {
          state.orders[idx] = { ...state.orders[idx], ...updated };
        }
      })
      .addCase(updateVendorOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      });
  },
});

export const {
  setFilter,
  setDateRange,
  setCustomDateRange,
  resetFilters,
  clearUpdateError,
  clearError,
} = orderSlice.actions;

/* ── Selectors ── */
export const selectRawOrders = (state) => state.orders.orders;
export const selectFilters = (state) => state.orders.filters;
export const selectPagination = (state) => state.orders.pagination;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersUpdating = (state) => state.orders.updating;
export const selectOrdersError = (state) => state.orders.error;

/**
 * Derived selector — applies local filters over raw orders.
 * Memoized with createSelector so it only recomputes (and only returns
 * a new array reference) when `orders` or `filters` actually change,
 * instead of on every store update / component render.
 */
export const selectFilteredOrders = createSelector(
  [selectRawOrders, selectFilters],
  (orders, filters) => filterOrdersLocally(orders, filters),
);

export default orderSlice.reducer;
