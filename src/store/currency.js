import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialCurrencyState = {
  initialCurrency: "CAD",
  currency: "cad",
  cachedCurrency: "cad",
  symbol: "$",
};

// Currency Reducers
const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    changeCurrency(state, action) {
      console.log("currency change");
      if (action.payload.currency) {
        state.cachedCurrency = state.currency;
        state.currency = action.payload.currency;
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol;
      }
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
