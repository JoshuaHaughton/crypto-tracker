import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialCoinsState = { coinListCoins: [], trendingCarouselCoins: [], symbol: '$' };

//Cart Reducers
const coinsSlice = createSlice({
  name: "coins",
  initialState: initialCoinsState,
  reducers: {
    updateCoins(state, action) {
      console.log('update', action)
      if (action.payload.coinListCoins) {
        state.coinListCoins = action.payload.coinListCoins
      }

      if (action.payload.trendingCarouselCoins) {
        state.trendingCarouselCoins = action.payload.trendingCarouselCoins
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol
      }


    },
    resetCart(state) {
      state.coins = 'cad';
      state.symbol = '$';
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
