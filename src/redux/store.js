import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import vendorInfoReducer from "./vendorInfoSlice";
import vendorUpdateReducer from "./vendorUpdateSlice";
import vendorStoreInformationReducer from "./vendorstoreinformationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendorInfo: vendorInfoReducer,
    vendorUpdate: vendorUpdateReducer,
    vendorStoreInfo: vendorStoreInformationReducer,
  },
});
