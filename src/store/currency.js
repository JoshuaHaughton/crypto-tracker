import { createSlice } from "@reduxjs/toolkit";

const initialCurrencyState = {
  initialCurrency: "CAD",
  currency: "cad",
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
        state.currency = action.payload.currency;
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol;
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
