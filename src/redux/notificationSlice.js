/**
 * notificationSlice.js
 * ─────────────────────────────────────────────────────────────
 * Manages the vendor's in-app notification list.
 *
 * State shape:
 *   notifications: Array<Notification>   ← newest first
 *   unreadCount:   number
 */

import { createSlice } from "@reduxjs/toolkit";

const MAX_NOTIFICATIONS = 50;

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    pushNotification(state, action) {
      const incoming = action.payload;

      console.log("[Redux] pushNotification received:", incoming);

      // Skip duplicate
      const exists = state.notifications.some((n) => n.id === incoming.id);
      if (exists) {
        console.warn("[Redux] Duplicate notification skipped:", incoming.id);
        return;
      }

      state.notifications.unshift(incoming);
      console.log(
        "[Redux] Notification added. Total:",
        state.notifications.length,
      );

      // Trim to MAX_NOTIFICATIONS
      if (state.notifications.length > MAX_NOTIFICATIONS) {
        state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS);
      }

      // Recalculate unread count
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
      console.log("[Redux] Unread count updated:", state.unreadCount);
    },

    markRead(state, action) {
      const id = action.payload;
      const n = state.notifications.find((n) => n.id === id);
      if (n) {
        n.read = true;
        console.log("[Redux] Notification marked as read:", id);
      }
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },

    markAllRead(state) {
      console.log(
        "[Redux] Marking all notifications as read:",
        state.notifications.length,
      );
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    removeNotification(state, action) {
      const id = action.payload;
      console.log("[Redux] Removing notification:", id);
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },

    clearAllNotifications(state) {
      console.log("[Redux] Clearing all notifications");
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  pushNotification,
  markRead,
  markAllRead,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

/* ── Selectors ─────────────────────────────────────────────────────── */
export const selectNotifications = (state) => {
  const notifs = state.notifications?.notifications ?? [];
  console.log("[Selector] selectNotifications returning:", notifs.length);
  return notifs;
};

export const selectUnreadCount = (state) => {
  const count = state.notifications?.unreadCount ?? 0;
  console.log("[Selector] selectUnreadCount returning:", count);
  return count;
};

export default notificationSlice.reducer;
