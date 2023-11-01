import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";
import { cloneDeep, isObject, mergeWith } from "lodash";

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
  displayedPopularCoinsList: [],
  popularCoinsListByCurrency: {
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
      if (action.payload.displayedPopularCoinsList) {
        state.displayedPopularCoinsList =
          action.payload.displayedPopularCoinsList;
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
    setPopularCoinsListForCurrency(state, action) {
      console.log("setPopularCoinsListForCurrency", action);
      const { currency, coinData } = action.payload;
      state.popularCoinsListByCurrency[currency] = coinData;
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
    mergeCachedCoinDetailsForCurrency(state, action) {
      console.log("mergeCachedCoinDetailsForCurrency", action);
      const { currency, coinData } = action.payload;

      // Check if coinData is just the object without the id as a key
      let formattedCoinData = coinData;
      if (coinData.coinAttributes && coinData.coinAttributes.id) {
        formattedCoinData = { [coinData.coinAttributes.id]: coinData };
      } else {
        formattedCoinData = coinData;
      }

      function customizer(objValue, srcValue) {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          return srcValue;
        }

        if (isObject(objValue) && isObject(srcValue)) {
          return mergeWith({}, objValue, srcValue, customizer);
        }

        return objValue != null ? objValue : srcValue;
      }

      const mergedData = mergeWith(
        {},
        state.cachedCoinDetailsByCurrency[currency],
        formattedCoinData,
        customizer,
      );
      state.cachedCoinDetailsByCurrency[currency] = mergedData;
    },
  },
};

// Enhance the slice definition with common actions
const enhancedCoinsSliceDefinition = withCommonActions(coinsSliceDefinition);

// Create the slice using the enhanced definition
const coinsSlice = createSlice(enhancedCoinsSliceDefinition);

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
