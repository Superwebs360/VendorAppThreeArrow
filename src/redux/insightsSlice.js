import { createSelector, createSlice } from "@reduxjs/toolkit";
import { selectRawOrders } from "./orderSlice";
import { selectProducts } from "./productSlice";

/* ═══════════════════════════════════════════════════════════
   CONFIG / ASSUMPTIONS

   Your product model (as shared) doesn't expose a cost/purchase
   price field, so true profit can't be computed exactly. This
   slice looks for `product.costPrice` or `product.cost` first;
   if neither exists on a product, it falls back to assuming a
   flat profit margin (DEFAULT_MARGIN) off the sale price.

   ⚠️ Swap in your real cost field name below once you have one
   (e.g. product.purchasePrice) — search for `unitCost` in this
   file to find the one spot that needs updating.
═══════════════════════════════════════════════════════════ */
const DEFAULT_MARGIN = 0.3; // assumed 30% margin when no cost field is present

const RANGE_TO_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

const EXCLUDED_STATUSES = new Set(["cancelled", "refunded"]);

/* ═══════════════════════════════════════════════════════════
   SLICE — just UI state (selected range / metric toggle).
   Everything else below is derived via memoized selectors so
   nothing has to be duplicated into the store.
═══════════════════════════════════════════════════════════ */
const initialState = {
  range: "30d", // "7d" | "30d" | "90d" | "all"
};

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {
    setInsightsRange(state, action) {
      state.range = action.payload;
    },
  },
});

export const { setInsightsRange } = insightsSlice.actions;
export const selectInsightsRange = (state) => state.insights.range;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const getOrderDate = (o) => new Date(o.createdAt);

const isWithinRange = (date, days) => {
  if (!days) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
};

const orderRevenue = (order) => order.vendorSubtotal ?? order.total ?? 0;

/** Estimated cost for one order, summed across its line items. */
const estimateOrderCost = (order, productsById) => {
  if (!Array.isArray(order.items)) return 0;
  return order.items.reduce((sum, item) => {
    const qty = item.quantity || 1;
    const productId = item.product?._id || item.product;
    const product = productsById[productId];
    const unitPrice = item.price ?? product?.price ?? 0;
    // ← update this line if/when a real cost field exists on your product model
    const unitCost =
      product?.costPrice ?? product?.cost ?? unitPrice * (1 - DEFAULT_MARGIN);
    return sum + unitCost * qty;
  }, 0);
};

/* ═══════════════════════════════════════════════════════════
   BASE SELECTORS
═══════════════════════════════════════════════════════════ */
const selectProductsById = createSelector([selectProducts], (products) => {
  const map = {};
  (products || []).forEach((p) => {
    map[p._id] = p;
  });
  return map;
});

const selectRangeDays = createSelector(
  [selectInsightsRange],
  (range) => RANGE_TO_DAYS[range] ?? null,
);

const selectOrdersInRange = createSelector(
  [selectRawOrders, selectRangeDays],
  (orders, days) =>
    (orders || []).filter((o) => isWithinRange(getOrderDate(o), days)),
);

/* ═══════════════════════════════════════════════════════════
   SUMMARY — the 4 headline numbers
═══════════════════════════════════════════════════════════ */
export const selectInsightsSummary = createSelector(
  [selectOrdersInRange, selectProductsById],
  (orders, productsById) => {
    let revenue = 0;
    let cost = 0;
    let orderCount = 0;

    orders.forEach((o) => {
      if (EXCLUDED_STATUSES.has(o.status)) return;
      revenue += orderRevenue(o);
      cost += estimateOrderCost(o, productsById);
      orderCount += 1;
    });

    const profit = revenue - cost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    return {
      totalRevenue: Math.round(revenue),
      totalCost: Math.round(cost),
      totalProfit: Math.round(profit),
      profitMargin: Math.round(profitMargin * 10) / 10,
      orderCount,
      avgOrderValue: Math.round(avgOrderValue),
      isLoss: profit < 0,
    };
  },
);

/* ═══════════════════════════════════════════════════════════
   TIME SERIES — daily revenue vs profit, for the line chart.
   Downsamples to ~30 points max so long ranges stay readable.
═══════════════════════════════════════════════════════════ */
export const selectRevenueProfitSeries = createSelector(
  [selectOrdersInRange, selectProductsById],
  (orders, productsById) => {
    const bucket = {}; // "YYYY-MM-DD" -> { revenue, cost }

    orders.forEach((o) => {
      if (EXCLUDED_STATUSES.has(o.status)) return;
      const key = getOrderDate(o).toISOString().split("T")[0];
      if (!bucket[key]) bucket[key] = { revenue: 0, cost: 0 };
      bucket[key].revenue += orderRevenue(o);
      bucket[key].cost += estimateOrderCost(o, productsById);
    });

    let keys = Object.keys(bucket).sort();

    // Downsample if there are too many points to render legibly
    const MAX_POINTS = 30;
    if (keys.length > MAX_POINTS) {
      const step = Math.ceil(keys.length / MAX_POINTS);
      keys = keys.filter((_, i) => i % step === 0);
    }

    return keys.map((key) => {
      const { revenue, cost } = bucket[key];
      const profit = revenue - cost;
      const d = new Date(key);
      return {
        date: key,
        label: d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        revenue: Math.round(revenue),
        profit: Math.round(profit),
      };
    });
  },
);

/* ═══════════════════════════════════════════════════════════
   ORDER STATUS BREAKDOWN — for the donut chart
═══════════════════════════════════════════════════════════ */
export const selectStatusBreakdown = createSelector(
  [selectOrdersInRange],
  (orders) => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  },
);

/* ═══════════════════════════════════════════════════════════
   TOP PRODUCTS — by revenue, for the horizontal bar chart
═══════════════════════════════════════════════════════════ */
export const selectTopProducts = createSelector(
  [selectOrdersInRange, selectProductsById],
  (orders, productsById) => {
    const agg = {};

    orders.forEach((o) => {
      if (EXCLUDED_STATUSES.has(o.status)) return;
      (o.items || []).forEach((item) => {
        const id = item.product?._id || item.product;
        if (!id) return;
        const product = productsById[id];
        const name = item.product?.name || product?.name || "Unknown product";
        const qty = item.quantity || 1;
        const revenue = (item.price ?? product?.price ?? 0) * qty;

        if (!agg[id]) agg[id] = { id, name, qty: 0, revenue: 0 };
        agg[id].qty += qty;
        agg[id].revenue += revenue;
      });
    });

    return Object.values(agg)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));
  },
);

export default insightsSlice.reducer;
