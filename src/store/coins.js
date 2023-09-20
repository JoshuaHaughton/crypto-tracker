import { createSlice } from "@reduxjs/toolkit";

export const initialCoinsState = {
  selectedCoinDetails: null,
  displayedCoinListCoins: [],
  trendingCarouselCoins: [],
  symbol: "$",
};

// Coins Reducers
const coinsSlice = createSlice({
  name: "coins",
  initialState: initialCoinsState,
  reducers: {
    updateCoins(state, action) {
      console.log("updateCoins", action);
      if (action.payload.displayedCoinListCoins) {
        state.displayedCoinListCoins = action.payload.displayedCoinListCoins;
      }

      if (action.payload.trendingCarouselCoins) {
        state.trendingCarouselCoins = action.payload.trendingCarouselCoins;
      }

      if (action.payload.symbol) {
        state.symbol = action.payload.symbol;
      }
    },
    updateSelectedCoin(state, action) {
      console.log("updateSelectedCoin", action);
      if (action.payload.coinDetails) {
        state.selectedCoinDetails = action.payload.coinDetails;
      }
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
