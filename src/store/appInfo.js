import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

export const initialAppInfoState = {
  popularCoinsListPageNumber: 1,
  isCoinDetailsPreloadedFromDB: false,
  isPopularCoinsListPreloaded: false,
  coinsBeingFetched: {},
  coinsBeingFetchedOrder: [],
};

// AppInfo Reducers
const appInfoSliceDefinition = {
  name: "appInfo",
  initialState: initialAppInfoState,
  reducers: {
    updatePopularCoinsListPageNumber(state, action) {
      console.log("updatePopularCoinsListPageNumber", action);
      if (action.payload.popularCoinsListPageNumber) {
        state.popularCoinsListPageNumber =
          action.payload.popularCoinsListPageNumber;
      }
    },
    startCoinDetailsPreloading: (state) => {
      state.isCoinDetailsPreloadedFromDB = false;
    },
    finishCoinDetailsPreloading: (state) => {
      state.isCoinDetailsPreloadedFromDB = true;
    },
    startPopularCoinsListPreloading: (state) => {
      state.isPopularCoinsListPreloaded = false;
    },
    finishPopularCoinsListPreloading: (state) => {
      console.log("finishPopularCoinsListPreloading");
      state.isPopularCoinsListPreloaded = true;
    },
    // Add a coin to the list of coins being fetched
    addCoinBeingFetched: (state, action) => {
      console.warn("addCoinBeingFetched", action.payload.coinId);
      const coinId = action.payload.coinId;

      if (!state.coinsBeingFetched[coinId]) {
        state.coinsBeingFetched[coinId] = true;
        state.coinsBeingFetchedOrder.push(coinId);
      }
    },
    // Remove a coin from the list of coins being fetched
    removeCoinBeingFetched: (state, action) => {
      console.warn("removeCoinBeingFetched", action.payload.coinId);
      const coinId = action.payload.coinId;

      const { [coinId]: removed, ...remaining } = state.coinsBeingFetched;
      state.coinsBeingFetched = remaining;
      state.coinsBeingFetchedOrder = state.coinsBeingFetchedOrder.filter(
        (id) => id !== coinId,
      );
    },
    // Reset the list of coins being fetched
    resetCoinsBeingFetched: (state) => {
      console.log("resetCoinsBeingFetched");
      state.coinsBeingFetched = {};
      state.coinsBeingFetchedOrder = [];
    },
  },
};

// Enhance the slice definition with common actions
const enhancedAppInfoSliceDefinition = withCommonActions(
  appInfoSliceDefinition,
);

// Create the slice using the enhanced definition
const appInfoSlice = createSlice(enhancedAppInfoSliceDefinition);

export const appInfoActions = appInfoSlice.actions;
export default appInfoSlice.reducer;
