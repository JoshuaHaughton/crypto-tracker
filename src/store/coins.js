import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

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
const coinsSliceDefinition = {
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
      state.cachedCoinDetailsByCurrency[currency][coinData.coinAttributes.id] =
        coinData;
    },
    // todo, combine with above
    setCachedCoinDetailsForCurrency(state, action) {
      console.log("setCachedCoinDetailsForCurrency", action);
      const { currency, coinData } = action.payload;
      state.cachedCoinDetailsByCurrency[currency] = coinData;
    },
  },
};

// Enhance the slice definition with common actions
const enhancedCoinsSliceDefinition = withCommonActions(coinsSliceDefinition);

// Create the slice using the enhanced definition
const coinsSlice = createSlice(enhancedCoinsSliceDefinition);

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
