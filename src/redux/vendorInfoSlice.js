// src/store/slices/vendorInfoSlice.js
//
// ── Field name mapping guide ─────────────────────────────────────────────────
// Wizard formData key  →  Mongoose schema field
// ─────────────────────────────────────────────────────────────────────────────
// employees            →  businessDetails.numberOfEmployees
// productCategories    →  businessDetails.categories  (array of strings)
// onboardAs            →  businessDetails.onboardingType  (array: ["retailer","wholesaler"])
// sellerAddress        →  sellerDetails.address
// sellerCity           →  sellerDetails.city
// sellerState          →  sellerDetails.state
// sellerPincode        →  sellerDetails.pincode
// accountHolder        →  bankDetails.accountHolderName
// warehouseCity        →  shippingLocations.city
// warehouseState       →  shippingLocations.state
// warehousePincode     →  shippingLocations.pincode
// latitude/longitude   →  shippingLocations.latitude/longitude  (Number)
// digitalSignConfirmed →  digitalSignature.signed  (Boolean)
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.17:3000";

async function authHeaders() {
  const token = await AsyncStorage.getItem("vendorToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform flat wizard formData → nested backend schema shape
// Called once per step before POST /save-step
// ─────────────────────────────────────────────────────────────────────────────
function buildStepPayload(stepNumber, formData) {
  switch (stepNumber) {
    case 1:
      return {
        step: "businessDetails",
        data: {
          businessName: formData.businessName,
          businessType: formData.businessType,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          businessEmail: formData.businessEmail,
          businessPhone: formData.businessPhone,
          yearEstablished: formData.yearEstablished
            ? Number(formData.yearEstablished)
            : undefined,
          // Schema field: numberOfEmployees
          numberOfEmployees: formData.employees
            ? Number(formData.employees)
            : undefined,
          // Schema field: categories
          categories: formData.productCategories || [],
          // Schema field: onboardingType  (lowercase to match enum)
          onboardingType: (formData.onboardAs || []).map((v) =>
            v.toLowerCase(),
          ),
        },
      };

    case 2:
      return {
        step: "sellerDetails",
        data: {
          sellerName: formData.sellerName,
          sellerEmail: formData.sellerEmail,
          sellerPhone: formData.sellerPhone,
          // Schema field: address (not sellerAddress)
          address: formData.sellerAddress,
          // Schema fields: city / state / pincode (not sellerCity etc.)
          city: formData.sellerCity,
          state: formData.sellerState,
          pincode: formData.sellerPincode,
        },
      };

    case 3:
      return {
        step: "brandDetails",
        data: {
          brandName: formData.brandName,
          brandType: formData.brandType,
          trademarkNumber: formData.trademarkNumber,
          brandWebsite: formData.brandWebsite,
        },
      };

    case 4:
      return {
        step: "bankDetails",
        data: {
          // Schema field: accountHolderName (not accountHolder)
          accountHolderName: formData.accountHolder,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branch: formData.branch,
        },
      };

    case 5:
      return {
        step: "shippingLocations",
        data: {
          warehouseAddress: formData.warehouseAddress,
          // Schema fields: city / state / pincode (not warehouseCity etc.)
          city: formData.warehouseCity,
          state: formData.warehouseState,
          pincode: formData.warehousePincode,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude
            ? Number(formData.longitude)
            : undefined,
        },
      };

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform backend vendor document → flat wizard formData
// Called when hydrating a saved draft or rejected application
// ─────────────────────────────────────────────────────────────────────────────
function hydrateFormData(vendor) {
  if (!vendor) return {};

  const bd = vendor.businessDetails || {};
  const sd = vendor.sellerDetails || {};
  const brd = vendor.brandDetails || {};
  const bk = vendor.bankDetails || {};
  const sh = vendor.shippingLocations || {};
  const ds = vendor.digitalSignature || {};

  return {
    // ── Step 1: Business Details ──────────────────────────────────────────────
    businessName: bd.businessName || "",
    businessType: bd.businessType || "",
    gstNumber: bd.gstNumber || "",
    panNumber: bd.panNumber || "",
    businessEmail: bd.businessEmail || "",
    businessPhone: bd.businessPhone || "",
    yearEstablished: bd.yearEstablished ? String(bd.yearEstablished) : "",
    // schema → numberOfEmployees, wizard → employees
    employees: bd.numberOfEmployees ? String(bd.numberOfEmployees) : "",
    // schema → categories, wizard → productCategories
    productCategories: bd.categories || [],
    // schema → onboardingType (lowercase), wizard → onboardAs (capitalized)
    onboardAs: (bd.onboardingType || []).map(
      (v) => v.charAt(0).toUpperCase() + v.slice(1), // "retailer" → "Retailer"
    ),

    // ── Step 2: Seller Details ────────────────────────────────────────────────
    sellerName: sd.sellerName || "",
    sellerEmail: sd.sellerEmail || "",
    sellerPhone: sd.sellerPhone || "",
    // schema → address, wizard → sellerAddress
    sellerAddress: sd.address || "",
    // schema → city/state/pincode, wizard → sellerCity/sellerState/sellerPincode
    sellerCity: sd.city || "",
    sellerState: sd.state || "",
    sellerPincode: sd.pincode || "",

    // ── Step 3: Brand Details ─────────────────────────────────────────────────
    brandName: brd.brandName || "",
    brandType: brd.brandType || "",
    trademarkNumber: brd.trademarkNumber || "",
    brandWebsite: brd.brandWebsite || "",

    // ── Step 4: Bank Details ──────────────────────────────────────────────────
    // schema → accountHolderName, wizard → accountHolder
    accountHolder: bk.accountHolderName || "",
    accountNumber: bk.accountNumber || "",
    ifscCode: bk.ifscCode || "",
    bankName: bk.bankName || "",
    branch: bk.branch || "",

    // ── Step 5: Shipping Locations ────────────────────────────────────────────
    warehouseAddress: sh.warehouseAddress || "",
    // schema → city/state/pincode, wizard → warehouseCity/warehouseState/warehousePincode
    warehouseCity: sh.city || "",
    warehouseState: sh.state || "",
    warehousePincode: sh.pincode ? String(sh.pincode) : "",
    latitude: sh.latitude ? String(sh.latitude) : "",
    longitude: sh.longitude ? String(sh.longitude) : "",

    // ── Step 6: Digital Signature ─────────────────────────────────────────────
    // schema → digitalSignature.signed, wizard → digitalSignConfirmed
    digitalSignConfirmed: ds.signed || false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunk — submit entire wizard on Step 7
// ─────────────────────────────────────────────────────────────────────────────
export const submitVendorApplication = createAsyncThunk(
  "vendorInfo/submitVendorApplication",
  async (formData, { rejectWithValue }) => {
    try {
      const config = await authHeaders();

      // Phase 1: save each step section with correctly mapped field names
      for (const stepNum of [1, 2, 3, 4, 5]) {
        const payload = buildStepPayload(stepNum, formData);
        if (!payload) continue;
        await axios.post(
          `${BASE_URL}/api/auth/vendor/save-step`,
          payload,
          config,
        );
      }

      // Phase 2: flip vendor status → "pending"
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/vendor/submit`,
        {},
        config,
      );

      return data.vendor;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Submission failed. Please try again.";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Thunk — fetch existing vendor profile (for resuming a draft)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchMyVendorProfile = createAsyncThunk(
  "vendorInfo/fetchMyVendorProfile",
  async (_, { rejectWithValue }) => {
    try {
      const config = await authHeaders();
      const { data } = await axios.get(
        `${BASE_URL}/api/auth/vendor/my-profile`,
        config,
      );
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not load vendor profile.";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Thunk — withdraw a pending application (resets status back to "draft")
// Calls POST /api/auth/vendor/withdraw
// ─────────────────────────────────────────────────────────────────────────────
export const withdrawVendorApplication = createAsyncThunk(
  "vendorInfo/withdrawVendorApplication",
  async (_, { rejectWithValue }) => {
    try {
      const config = await authHeaders();
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/vendor/withdraw`,
        {},
        config,
      );
      return data.vendor;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not withdraw application. Please try again.";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  formData: {},
  vendor: null,
  submitStatus: "idle",
  fetchStatus: "idle",
  withdrawStatus: "idle",
  error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const vendorInfoSlice = createSlice({
  name: "vendorInfo",
  initialState,

  reducers: {
    setField(state, action) {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    setFormData(state, action) {
      state.formData = action.payload;
    },
    resetWizard(state) {
      state.formData = {};
      state.vendor = null;
      state.submitStatus = "idle";
      state.fetchStatus = "idle";
      state.withdrawStatus = "idle";
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // submitVendorApplication
    builder
      .addCase(submitVendorApplication.pending, (state) => {
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(submitVendorApplication.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        state.vendor = action.payload;
      })
      .addCase(submitVendorApplication.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload;
      });

    // fetchMyVendorProfile
    builder
      .addCase(fetchMyVendorProfile.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMyVendorProfile.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.vendor = action.payload;
        // Hydrate formData using correct field name mapping
        state.formData = hydrateFormData(action.payload);
      })
      .addCase(fetchMyVendorProfile.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload;
      });

    // withdrawVendorApplication
    builder
      .addCase(withdrawVendorApplication.pending, (state) => {
        state.withdrawStatus = "loading";
        state.error = null;
      })
      .addCase(withdrawVendorApplication.fulfilled, (state, action) => {
        state.withdrawStatus = "succeeded";
        // Update vendor in store with the returned draft-status vendor
        state.vendor = action.payload;
        // Re-hydrate formData so wizard is pre-filled if user goes to edit
        state.formData = hydrateFormData(action.payload);
      })
      .addCase(withdrawVendorApplication.rejected, (state, action) => {
        state.withdrawStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { setField, setFormData, resetWizard, clearError } =
  vendorInfoSlice.actions;

export default vendorInfoSlice.reducer;

// Selectors
export const selectVendorFormData = (state) => state.vendorInfo.formData;
export const selectVendorSubmitStatus = (state) =>
  state.vendorInfo.submitStatus;
export const selectVendorFetchStatus = (state) => state.vendorInfo.fetchStatus;
export const selectVendorWithdrawStatus = (state) =>
  state.vendorInfo.withdrawStatus;
export const selectVendorError = (state) => state.vendorInfo.error;
export const selectVendorProfile = (state) => state.vendorInfo.vendor;
