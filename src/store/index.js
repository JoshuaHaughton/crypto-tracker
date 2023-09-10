import { configureStore } from "@reduxjs/toolkit";
import currencyReducer from "./currency";
import coinsReducer from "./coins";
import appInfoReducer from "./appInfo";

//Redux store that hosts all 3 reducer slices
const store = configureStore({
  reducer: {
    currency: currencyReducer,
    coins: coinsReducer,
    appInfo: appInfoReducer,
  },
});

export default store;
