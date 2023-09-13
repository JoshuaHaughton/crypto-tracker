import { configureStore } from "@reduxjs/toolkit";
import currencyReducer from "./currency";
import coinsReducer from "./coins";
import appInfoReducer from "./appInfo";
import mediaQueryReducer from "./mediaQuery";

//Redux store that hosts all 3 reducer slices
const store = configureStore({
  reducer: {
    currency: currencyReducer,
    coins: coinsReducer,
    appInfo: appInfoReducer,
    mediaQuery: mediaQueryReducer,
  },
});

export default store;
