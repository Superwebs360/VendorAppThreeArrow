import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import categoryReducer from "./categorySlice";
import notificationReducer from "./notificationSlice";
import orderReducer from "./orderSlice";
import productReducer from "./productSlice";
import shippingSettingsReducer from "./shippingsettingSlice";
import vendorInfoReducer from "./vendorInfoSlice";
import vendorUpdateReducer from "./vendorUpdateSlice";
import vendorStoreInformationReducer from "./vendorstoreinformationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendorInfo: vendorInfoReducer,
    vendorUpdate: vendorUpdateReducer,
    vendorStoreInfo: vendorStoreInformationReducer,
    shippingSettings: shippingSettingsReducer,
    product: productReducer,
    category: categoryReducer,
    orders: orderReducer,
    notifications: notificationReducer,
  },
});
