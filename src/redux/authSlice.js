import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ── Base URL ──────────────────────────────────────────────────────────────────
// Update this to your actual backend URL or use an env variable
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.17:3000";
const AUTH_BASE = `${BASE_URL}/api/auth/vendor`;

// ── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * sendOTP
 * POST /api/auth/vendor/send-otp
 * Body: { emailOrPhone }
 */
export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async ({ emailOrPhone }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_BASE}/send-otp`, {
        emailOrPhone,
      });
      return response.data; // { message: "OTP sent successfully" }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

/**
 * verifyOTP
 * POST /api/auth/vendor/verify-otp
 * Body: { emailOrPhone, otp }
 * Returns: { message, token, user: { _id, email, phone, role, createdAt } }
 */
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ emailOrPhone, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${AUTH_BASE}/verify-otp`, {
        emailOrPhone,
        otp,
      });
      const { token, user } = response.data;

      // Persist token to AsyncStorage
      await AsyncStorage.setItem("vendorToken", token);
      await AsyncStorage.setItem("vendorUser", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid or expired OTP",
      );
    }
  },
);

/**
 * restoreAuth
 * Called on app boot to rehydrate token + user from AsyncStorage
 */
export const restoreAuth = createAsyncThunk(
  "auth/restoreAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const userStr = await AsyncStorage.getItem("vendorUser");
      if (!token || !userStr) return null;
      return { token, user: JSON.parse(userStr) };
    } catch {
      return rejectWithValue("Failed to restore session");
    }
  },
);

/**
 * logout
 * Clears AsyncStorage and resets state
 */
export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("vendorToken");
  await AsyncStorage.removeItem("vendorUser");
});

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  // Session
  token: null,
  user: null,
  isAuthenticated: false,

  // OTP flow
  otpSent: false,
  emailOrPhone: null,

  // Loading states
  otpLoading: false, // sendOTP in progress
  verifyLoading: false, // verifyOTP in progress
  restoring: true, // rehydrating on boot

  // Errors
  otpError: null,
  verifyError: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Reset OTP state (e.g., user pressed "Use different number")
    resetOtpState(state) {
      state.otpSent = false;
      state.emailOrPhone = null;
      state.otpError = null;
      state.verifyError = null;
    },

    // Clear only errors (e.g., on modal close)
    clearAuthErrors(state) {
      state.otpError = null;
      state.verifyError = null;
    },
  },

  extraReducers: (builder) => {
    // ── sendOTP ──────────────────────────────────────────────────────────────
    builder
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        // emailOrPhone is passed in the thunk arg — store for context display
        state.emailOrPhone = action.meta.arg.emailOrPhone;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      });

    // ── verifyOTP ────────────────────────────────────────────────────────────
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.emailOrPhone = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.verifyLoading = false;
        state.verifyError = action.payload;
      });

    // ── restoreAuth ──────────────────────────────────────────────────────────
    builder
      .addCase(restoreAuth.pending, (state) => {
        state.restoring = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.restoring = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.restoring = false;
      });

    // ── logout ───────────────────────────────────────────────────────────────
    builder.addCase(logout.fulfilled, () => ({
      ...initialState,
      restoring: false,
    }));
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────
export const { resetOtpState, clearAuthErrors } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectVendorUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectOtpLoading = (state) => state.auth.otpLoading;
export const selectVerifyLoading = (state) => state.auth.verifyLoading;
export const selectOtpSent = (state) => state.auth.otpSent;
export const selectOtpError = (state) => state.auth.otpError;
export const selectVerifyError = (state) => state.auth.verifyError;
export const selectRestoring = (state) => state.auth.restoring;
export const selectStoredEmailOrPhone = (state) => state.auth.emailOrPhone;

export default authSlice.reducer;
