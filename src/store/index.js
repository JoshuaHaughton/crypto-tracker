import { configureStore } from "@reduxjs/toolkit";
import currencyReducer from "./currency";

//Redux store that hosts all 3 reducer slices
const store = configureStore({
  reducer: {currency: currencyReducer}
});


export default store;