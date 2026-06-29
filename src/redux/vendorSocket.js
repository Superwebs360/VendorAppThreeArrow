/**
 * vendorSocket.js
 * ─────────────────────────────────────────────────────────────
 * Singleton Socket.IO client for the 3Arrow Vendor app.
 * FIXED: Added comprehensive logging and error handling
 */

import { io } from "socket.io-client";
import { pushNotification } from "./notificationSlice";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let socket = null;
let isConnecting = false;

const VendorSocket = {
  /**
   * Open the socket connection and register all event listeners.
   *
   * @param {string} token  - vendorToken from AsyncStorage
   * @param {import("@reduxjs/toolkit").EnhancedStore} store - Redux store
   */
  connect(token, store) {
    console.log("[VendorSocket] connect() called");
    console.log("[VendorSocket] BASE_URL:", BASE_URL);
    console.log("[VendorSocket] Token present:", !!token);

    if (socket?.connected) {
      console.log("[VendorSocket] Already connected, skipping");
      return;
    }

    if (isConnecting) {
      console.log("[VendorSocket] Already connecting, skipping");
      return;
    }

    isConnecting = true;

    socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      query: { token }, // Fallback: also send token in query
    });

    // ── Connection lifecycle ──────────────────────────────────────────────
    socket.on("connect", () => {
      isConnecting = false;
      console.log("[VendorSocket] ✅ Connected:", socket.id);
      console.log("[VendorSocket] URL:", socket.io.uri);
    });

    socket.on("connect_error", (err) => {
      console.error("[VendorSocket] ❌ Connection error:", {
        message: err.message,
        type: err.type,
        data: err.data,
      });
      isConnecting = false;
    });

    socket.on("disconnect", (reason) => {
      console.log("[VendorSocket] ⚠️ Disconnected:", reason);
      isConnecting = false;
    });

    socket.on("error", (err) => {
      console.error("[VendorSocket] ❌ Socket error:", err);
    });

    // ── Vendor room acknowledgement ───────────────────────────────────────
    socket.on("vendor_room_joined", (data) => {
      console.log("[VendorSocket] ✅ Joined vendor room:", data?.room);
    });

    // ── New Order Event ───────────────────────────────────────────────────
    socket.on("new_order", (payload) => {
      console.log("[VendorSocket] 📦 new_order event received:", payload);

      try {
        const notification = {
          id: `order_${payload.orderId}_${Date.now()}`,
          type: "new_order",
          icon: "package",
          title: "New order received",
          message:
            payload.message ||
            `${payload.customerName} placed an order worth ₹${payload.total}.`,
          orderId: payload.orderId,
          timestamp: payload.timestamp || new Date().toISOString(),
          read: false,
        };

        console.log(
          "[VendorSocket] Dispatching pushNotification:",
          notification,
        );
        store.dispatch(pushNotification(notification));
      } catch (err) {
        console.error("[VendorSocket] Error processing new_order:", err);
      }
    });

    // ── Order Cancelled Event ─────────────────────────────────────────────
    socket.on("order_cancelled", (payload) => {
      console.log("[VendorSocket] ❌ order_cancelled event received:", payload);

      try {
        const notification = {
          id: `cancel_${payload.orderId}_${Date.now()}`,
          type: "order_cancelled",
          icon: "x-circle",
          title: "Order cancelled",
          message:
            payload.message || `${payload.customerName} cancelled an order.`,
          orderId: payload.orderId,
          timestamp: payload.timestamp || new Date().toISOString(),
          read: false,
        };

        console.log(
          "[VendorSocket] Dispatching pushNotification:",
          notification,
        );
        store.dispatch(pushNotification(notification));
      } catch (err) {
        console.error("[VendorSocket] Error processing order_cancelled:", err);
      }
    });

    // ── Order Status Updated Event ────────────────────────────────────────
    socket.on("order_status_updated", (payload) => {
      console.log(
        "[VendorSocket] 📊 order_status_updated event received:",
        payload,
      );

      try {
        const iconMap = {
          shipped: "truck",
          delivered: "check-circle",
          processing: "refresh-cw",
          cancelled: "x-circle",
        };

        const notification = {
          id: `status_${payload.orderId}_${Date.now()}`,
          type: "order_status_updated",
          icon: iconMap[payload.status] || "bell",
          title: `Order ${payload.status}`,
          message:
            payload.message || `Order status updated to ${payload.status}.`,
          orderId: payload.orderId,
          timestamp: payload.timestamp || new Date().toISOString(),
          read: false,
        };

        console.log(
          "[VendorSocket] Dispatching pushNotification:",
          notification,
        );
        store.dispatch(pushNotification(notification));
      } catch (err) {
        console.error(
          "[VendorSocket] Error processing order_status_updated:",
          err,
        );
      }
    });

    // ── Low Stock Alert Event ─────────────────────────────────────────────
    socket.on("low_stock_alert", (payload) => {
      console.log("[VendorSocket] ⚠️ low_stock_alert event received:", payload);

      try {
        const notification = {
          id: `stock_${payload.productId}_${Date.now()}`,
          type: "low_stock_alert",
          icon: "alert-triangle",
          title: "Low stock alert",
          message:
            payload.message ||
            `"${payload.productName}" has only ${payload.stock} unit(s) left.`,
          productId: payload.productId,
          timestamp: payload.timestamp || new Date().toISOString(),
          read: false,
        };

        console.log(
          "[VendorSocket] Dispatching pushNotification:",
          notification,
        );
        store.dispatch(pushNotification(notification));
      } catch (err) {
        console.error("[VendorSocket] Error processing low_stock_alert:", err);
      }
    });

    console.log("[VendorSocket] ✅ All event listeners registered");
  },

  /**
   * Cleanly close the socket (call on logout).
   */
  disconnect() {
    console.log("[VendorSocket] disconnect() called");
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnecting = false;
      console.log("[VendorSocket] ✅ Manually disconnected");
    }
  },

  get raw() {
    return socket;
  },

  get connected() {
    const isConn = socket?.connected ?? false;
    console.log("[VendorSocket] connected getter:", isConn);
    return isConn;
  },
};

export default VendorSocket;
