import { createSlice } from "@reduxjs/toolkit";

const initialCoinsState = {
  displayedCoinListCoins: [],
  trendingCarouselCoins: [],
  coinListCoinsByCurrency: {
    CAD: [],
    USD: [],
    AUD: [],
    GBP: [],
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
    setCoinsForCurrency(state, action) {
      console.log("setCoinsForCurrency", action);
      const { currency, coinData } = action.payload;
      state.coinListCoinsByCurrency[currency] = coinData;
    },
    resetCart(state) {
      state.coins = "cad";
      state.symbol = "$";
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
