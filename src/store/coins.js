import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";
import { mergeWith } from "lodash";
import { replaceArraysDeepMergeObjects } from "../utils/global.utils";

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
};

// Coins Reducers
const coinsSliceDefinition = {
  name: "coins",
  initialState: initialCoinsState,
  reducers: {
    updateCoins(state, action) {
      console.log("updateCoins", action);
      const payloadKeys = Object.keys(action.payload);
      for (let key of payloadKeys) {
        state[key] = action.payload[key];
      }
    },
    setPopularCoinsListForCurrency(state, action) {
      console.log("setPopularCoinsListForCurrency", action);
      const { currency, coinData } = action.payload;
      state.popularCoinsListByCurrency[currency] = coinData;
    },
    updateSelectedCoin(state, action) {
      console.log("updateSelectedCoin", action);
      if (action.payload.coinDetails) {
        state.selectedCoinDetails = action.payload.coinDetails;
      }
    },
    updateSelectedCoinDetailsByCurrency(state, action) {
      console.log("updateSelectedCoinDetailsByCurrency", action);
      const { currency, coinDetail } = action.payload;
      state.selectedCoinDetailsByCurrency[currency] = coinDetail;
    },
    updateCachedCoinDetailsForCurrency(state, action) {
      console.log("setCachedCoinDetailsByCurrency", action);
      const { currency, coinData } = action.payload;
      state.cachedCoinDetailsByCurrency[currency][coinData.coinAttributes.id] =
        coinData;
    },
    setCachedCoinDetailsByCurrency(state, action) {
      console.log("setCachedCoinDetailsByCurrency", action);
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

      const mergedData = mergeWith(
        {},
        state.cachedCoinDetailsByCurrency[currency],
        formattedCoinData,
        replaceArraysDeepMergeObjects,
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
