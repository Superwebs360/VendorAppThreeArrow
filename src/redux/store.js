import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import categoryReducer from "./categorySlice";
import insightsReducer from "./insightsSlice";
import orderReducer from "./orderSlice";
import productReducer from "./productSlice";
import shippingSettingsReducer from "./shippingsettingSlice";
import vendorInfoReducer from "./vendorInfoSlice";
import vendorPaymentReducer from "./vendorpaymentslice";
import vendorStoreInformationReducer from "./vendorstoreinformationSlice";
import vendorUpdateReducer from "./vendorUpdateSlice";

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
    insights: insightsReducer,
    vendorPayment: vendorPaymentReducer,
  },
});
