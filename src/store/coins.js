import { createSlice } from "@reduxjs/toolkit";

export const initialCoinsState = {
  displayedCoinListCoins: [],
  trendingCarouselCoins: [],
  coinListCoinsByCurrency: {
    CAD: [],
    USD: [],
    AUD: [],
    GBP: [],
  },
  coinDetailsByCurrency: {
    CAD: null,
    USD: null,
    AUD: null,
    GBP: null,
  },
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
    setCoinListForCurrency(state, action) {
      console.log("setCoinListForCurrency", action);
      const { currency, coinData } = action.payload;
      state.coinListCoinsByCurrency[currency] = coinData;
    },
    updateCoinDetailsForCurrency(state, action) {
      console.log("updateCoinDetailsForCurrency", action);
      const { currency, coinDetail } = action.payload;
      state.coinDetailsByCurrency[currency] = coinDetail;
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
