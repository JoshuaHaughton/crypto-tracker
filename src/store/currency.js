import { createSlice } from "@reduxjs/toolkit";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";

export const initialCurrencyState = {
  initialCurrency: "CAD",
  currentCurrency: "CAD",
  symbol: "$",
  currencyRates: {},
};

// Currency Reducers
const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    changeCurrency(state, action) {
      console.log("changeCurrency", action);
      if (action.payload.currency) {
        state.currentCurrency = action.payload.currency;
        state.symbol = SYMBOLS_BY_CURRENCIES[action.payload.currency];
      }
    },
    updateRates(state, action) {
      console.log("updateRates", action);
      if (action.payload.currencyRates) {
        state.currencyRates = action.payload.currencyRates;
      }
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
