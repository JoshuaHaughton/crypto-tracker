import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialCurrencyState = {
  currency: "cad",
  cachedCurrency: "cad",
  symbol: "$",
};

//Cart Reducers
const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    changeCurrency(state, action) {
      console.log('currency change')
      if (action.payload.currency) {
        state.cachedCurrency = state.currency;
        state.currency = action.payload.currency;
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol;
      }
    },
    resetCart(state) {
      state.currency = "cad";
      state.symbol = "$";
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
