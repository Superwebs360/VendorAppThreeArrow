// src/redux/vendorUpdateSlice.js
//
// ── Redux slice for updating vendor profile (not registration wizard) ───────────
// BUG FIX: After every successful update, we also dispatch setVendorProfile
//          to keep vendorInfoSlice in sync (VendorEditProfile reads from there).
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
// Update individual section (Business, Seller, Brand, Bank, Shipping)
// ─────────────────────────────────────────────────────────────────────────────
export const updateVendorSection = createAsyncThunk(
  "vendorUpdate/updateSection",
  async ({ sectionKey, data }, { rejectWithValue, dispatch }) => {
    try {
      console.log("──────────────────────────────────────");
      console.log(`[vendorUpdateSlice] Saving section: "${sectionKey}"`);
      console.log(
        "[vendorUpdateSlice] Payload →",
        JSON.stringify(data, null, 2),
      );
      console.log("──────────────────────────────────────");

      const config = await authHeaders();

      const sectionMap = {
        business: "businessDetails",
        seller: "sellerDetails",
        brand: "brandDetails",
        bank: "bankDetails",
        shipping: "shippingLocations",
      };

      const mongoField = sectionMap[sectionKey];
      if (!mongoField) {
        return rejectWithValue(`Invalid section: ${sectionKey}`);
      }

      const { data: response } = await axios.put(
        `${BASE_URL}/api/auth/vendor/update-section`,
        { section: mongoField, data },
        config,
      );

      console.log("[vendorUpdateSlice] Response →", response);

      // BUG FIX: sync the updated vendor back to vendorInfoSlice so
      // VendorEditProfile (which reads selectVendorProfile) stays current
      if (response.vendor) {
        const { setVendorProfile } = await import("./vendorInfoSlice");
        dispatch(setVendorProfile(response.vendor));
      }

      return { section: sectionKey, vendor: response.vendor };
    } catch (err) {
      console.error(
        "[vendorUpdateSlice] updateVendorSection error →",
        err?.response?.data || err.message,
      );
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update section";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Update digital signature
// ─────────────────────────────────────────────────────────────────────────────
export const updateVendorSignature = createAsyncThunk(
  "vendorUpdate/updateSignature",
  async (signatureData, { rejectWithValue, dispatch }) => {
    try {
      console.log("[vendorUpdateSlice] Saving signature →", signatureData);

      const config = await authHeaders();

      const { data: response } = await axios.put(
        `${BASE_URL}/api/auth/vendor/update-signature`,
        signatureData,
        config,
      );

      console.log("[vendorUpdateSlice] Signature response →", response);

      // BUG FIX: sync to vendorInfoSlice
      if (response.vendor) {
        const { setVendorProfile } = await import("./vendorInfoSlice");
        dispatch(setVendorProfile(response.vendor));
      }

      return response.vendor;
    } catch (err) {
      console.error(
        "[vendorUpdateSlice] updateVendorSignature error →",
        err?.response?.data || err.message,
      );
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update signature";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Upload KYC avatar (profile photo)
// ─────────────────────────────────────────────────────────────────────────────
export const uploadKycAvatar = createAsyncThunk(
  "vendorUpdate/uploadKycAvatar",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      console.log("[vendorUpdateSlice] Uploading KYC avatar...");

      const token = await AsyncStorage.getItem("vendorToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data: response } = await axios.post(
        `${BASE_URL}/api/auth/vendor/upload-kyc-avatar`,
        formData,
        config,
      );

      console.log("[vendorUpdateSlice] Avatar upload response →", response);

      if (response.vendor) {
        const { setVendorProfile } = await import("./vendorInfoSlice");
        dispatch(setVendorProfile(response.vendor));
      }

      return response.vendor;
    } catch (err) {
      console.error(
        "[vendorUpdateSlice] uploadKycAvatar error →",
        err?.response?.data || err.message,
      );
      const message = err?.response?.data?.message || "Failed to upload avatar";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Upload KYC document (Aadhaar / Driving Licence)
// ─────────────────────────────────────────────────────────────────────────────
export const uploadKycDocument = createAsyncThunk(
  "vendorUpdate/uploadKycDocument",
  async ({ formData, docType }, { rejectWithValue, dispatch }) => {
    try {
      console.log(`[vendorUpdateSlice] Uploading KYC doc: ${docType}`);

      const token = await AsyncStorage.getItem("vendorToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      // BUG FIX: docType must be appended to FormData so the backend can read
      // it from req.body — the backend controller reads req.body.docType
      formData.append("docType", docType);

      const { data: response } = await axios.post(
        `${BASE_URL}/api/auth/vendor/upload-kyc-document`,
        formData,
        config,
      );

      console.log("[vendorUpdateSlice] Doc upload response →", response);

      if (response.vendor) {
        const { setVendorProfile } = await import("./vendorInfoSlice");
        dispatch(setVendorProfile(response.vendor));
      }

      return { docType, vendor: response.vendor };
    } catch (err) {
      console.error(
        "[vendorUpdateSlice] uploadKycDocument error →",
        err?.response?.data || err.message,
      );
      const message =
        err?.response?.data?.message || "Failed to upload document";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Remove KYC document
// ─────────────────────────────────────────────────────────────────────────────
export const removeKycDocument = createAsyncThunk(
  "vendorUpdate/removeKycDocument",
  async (docType, { rejectWithValue, dispatch }) => {
    try {
      console.log(`[vendorUpdateSlice] Removing KYC doc: ${docType}`);

      const config = await authHeaders();

      const { data: response } = await axios.delete(
        `${BASE_URL}/api/auth/vendor/remove-kyc-document/${docType}`,
        config,
      );

      if (response.vendor) {
        const { setVendorProfile } = await import("./vendorInfoSlice");
        dispatch(setVendorProfile(response.vendor));
      }

      return { docType, vendor: response.vendor };
    } catch (err) {
      console.error(
        "[vendorUpdateSlice] removeKycDocument error →",
        err?.response?.data || err.message,
      );
      const message =
        err?.response?.data?.message || "Failed to remove document";
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  vendor: null,
  updateStatus: "idle",
  uploadStatus: "idle",
  signatureStatus: "idle",
  error: null,
  successMessage: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const vendorUpdateSlice = createSlice({
  name: "vendorUpdate",
  initialState,

  reducers: {
    clearUpdateError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    setVendor(state, action) {
      state.vendor = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ── updateVendorSection ────────────────────────────────────────────────────
    builder
      .addCase(updateVendorSection.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVendorSection.fulfilled, (state, action) => {
        state.updateStatus = "idle"; // reset to idle so button re-enables
        state.vendor = action.payload.vendor;
        state.successMessage = `${action.payload.section} updated successfully`;
      })
      .addCase(updateVendorSection.rejected, (state, action) => {
        state.updateStatus = "idle";
        state.error = action.payload;
      });

    // ── updateVendorSignature ──────────────────────────────────────────────────
    builder
      .addCase(updateVendorSignature.pending, (state) => {
        state.signatureStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVendorSignature.fulfilled, (state, action) => {
        state.signatureStatus = "idle";
        state.vendor = action.payload;
        state.successMessage = "Digital signature updated successfully";
      })
      .addCase(updateVendorSignature.rejected, (state, action) => {
        state.signatureStatus = "idle";
        state.error = action.payload;
      });

    // ── uploadKycAvatar ────────────────────────────────────────────────────────
    builder
      .addCase(uploadKycAvatar.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadKycAvatar.fulfilled, (state, action) => {
        state.uploadStatus = "idle";
        state.vendor = action.payload;
        state.successMessage = "Profile photo updated successfully";
      })
      .addCase(uploadKycAvatar.rejected, (state, action) => {
        state.uploadStatus = "idle";
        state.error = action.payload;
      });

    // ── uploadKycDocument ──────────────────────────────────────────────────────
    builder
      .addCase(uploadKycDocument.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadKycDocument.fulfilled, (state, action) => {
        state.uploadStatus = "idle";
        state.vendor = action.payload.vendor;
        state.successMessage = "Document uploaded successfully";
      })
      .addCase(uploadKycDocument.rejected, (state, action) => {
        state.uploadStatus = "idle";
        state.error = action.payload;
      });

    // ── removeKycDocument ──────────────────────────────────────────────────────
    builder
      .addCase(removeKycDocument.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(removeKycDocument.fulfilled, (state, action) => {
        state.uploadStatus = "idle";
        state.vendor = action.payload.vendor;
        state.successMessage = "Document removed successfully";
      })
      .addCase(removeKycDocument.rejected, (state, action) => {
        state.uploadStatus = "idle";
        state.error = action.payload;
      });
  },
});

export const { clearUpdateError, clearSuccessMessage, setVendor } =
  vendorUpdateSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectVendor = (state) => state.vendorUpdate.vendor;
export const selectUpdateStatus = (state) => state.vendorUpdate.updateStatus;
export const selectUploadStatus = (state) => state.vendorUpdate.uploadStatus;
export const selectSignatureStatus = (state) =>
  state.vendorUpdate.signatureStatus;
export const selectUpdateError = (state) => state.vendorUpdate.error;
export const selectSuccessMessage = (state) =>
  state.vendorUpdate.successMessage;

export default vendorUpdateSlice.reducer;
