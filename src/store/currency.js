import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialCurrencyState = { currency: "cad", symbol: "$" };

//Cart Reducers
const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    changeCurrency(state, action) {
      if (action.payload.currency) {
        state.currency = action.payload.currency
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol
      }
    },
    resetCart(state) {
      state.currency = 'cad';
      state.symbol = '$';
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
