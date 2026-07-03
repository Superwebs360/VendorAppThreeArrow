/* ═══════════════════════════════════════════════════════════
   STATS HELPERS
   Shared logic for computing dashboard stats from orders/products
═══════════════════════════════════════════════════════════ */

// Orders counted as "revenue" — adjust if you want to include "shipped" too
export const REVENUE_STATUSES = ["delivered"];

// Orders counted as "pending" (needs vendor action) — adjust as needed
export const PENDING_STATUSES = ["pending", "confirmed", "processing"];

// Threshold below which a product is considered "low stock"
export const LOW_STOCK_THRESHOLD = 25;

export const getOrderAmount = (order) =>
  order.totalAmount ?? order.total ?? order.amount ?? 0;

export const isSameMonth = (dateStr, ref) => {
  const d = new Date(dateStr);
  return (
    d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
  );
};

export const formatINR = (num) => `₹${Math.round(num).toLocaleString("en-IN")}`;

/**
 * Computes all dashboard stats from raw orders + products arrays.
 * Pure function — easy to unit test independently of Redux/React.
 */
export const computeDashboardStats = (orders = [], products = []) => {
  const now = new Date();
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ── Total Sales (this month, delivered orders) ──
  const thisMonthSales = orders
    .filter(
      (o) =>
        REVENUE_STATUSES.includes(o.status) && isSameMonth(o.createdAt, now),
    )
    .reduce((sum, o) => sum + getOrderAmount(o), 0);

  const lastMonthSales = orders
    .filter(
      (o) =>
        REVENUE_STATUSES.includes(o.status) &&
        isSameMonth(o.createdAt, lastMonthRef),
    )
    .reduce((sum, o) => sum + getOrderAmount(o), 0);

  let salesChange = null;
  let salesPositive = true;
  if (lastMonthSales > 0) {
    const pct = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
    salesPositive = pct >= 0;
    salesChange = `${salesPositive ? "+" : ""}${pct.toFixed(0)}%`;
  } else if (thisMonthSales > 0) {
    salesChange = "New";
  }

  // ── Pending Orders ──
  const pendingCount = orders.filter((o) =>
    PENDING_STATUSES.includes(o.status),
  ).length;

  // ── Products (active + low stock) ──
  const activeProducts = products.filter((p) => p.isActive !== false).length;

  const lowStockCount = products.filter(
    (p) => (p.stock ?? p.quantity ?? 0) <= LOW_STOCK_THRESHOLD,
  ).length;

  return {
    totalSales: formatINR(thisMonthSales),
    salesChange,
    salesPositive,
    activeProducts,
    lowStockCount,
    pendingCount,
  };
};
