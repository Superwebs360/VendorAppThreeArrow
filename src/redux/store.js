import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import vendorInfoReducer from "./vendorInfoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendorInfo: vendorInfoReducer,
  },
});
