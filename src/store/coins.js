import { createSlice } from "@reduxjs/toolkit";

export const initialCoinsState = {
  selectedCoinDetails: {},
  selectedCoinDetailsByCurrency: {
    CAD: {},
    USD: {},
    AUD: {},
    GBP: {},
  },
  cachedCoinDetailsByCurrency: {
    CAD: {},
    USD: {},
    AUD: {},
    GBP: {},
  },
  displayedCoinListCoins: [],
  coinListCoinsByCurrency: {
    CAD: [],
    USD: [],
    AUD: [],
    GBP: [],
  },
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
    setCoinListForCurrency(state, action) {
      console.log("setCoinListForCurrency", action);
      const { currency, coinData } = action.payload;
      state.coinListCoinsByCurrency[currency] = coinData;
    },
    updateSelectedCoinDetailsForCurrency(state, action) {
      console.log("updateSelectedCoinDetailsForCurrency", action);
      const { currency, coinDetail } = action.payload;
      state.selectedCoinDetailsByCurrency[currency] = coinDetail;
    },
    setCachedCoinDetailsByCurrency(state, action) {
      console.log("setCachedCoinDetailsByCurrency", action);
      const { currency, coinData } = action.payload;
      state.cachedCoinDetailsByCurrency[currency][coinData.initialCoin.id] =
        coinData;
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
