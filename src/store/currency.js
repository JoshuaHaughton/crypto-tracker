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

      // const itemIndex = state.cart.findIndex(
      //   (item) => item.id === action.payload.id,
      // );

      // const originalItemQuantity = state.cart[itemIndex].quantity;
      // const newTotalCartQuantity =
      //   state.quantity - originalItemQuantity + +action.payload.newQuantity;

      // if (newTotalCartQuantity === 0) {
      //   state.quantity -= originalItemQuantity;
      //   state.cart = state.cart.filter((item) => item.id !== action.payload.id);
      //   return;
      // } else {
      //   state.cart[itemIndex].quantity = +action.payload.newQuantity;
      //   state.quantity = newTotalCartQuantity;
      // }
    },
    resetCart(state) {
      state.currency = 'cad';
      state.symbol = '$';
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
