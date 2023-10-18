import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

export const initialAppInfoState = {
  popularCoinsListPageNumber: 1,
  isCoinDetailsPreloadedFromDB: false,
  isPopularCoinsListPreloaded: false,
  coinsBeingFetched: [],
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
      console.log("addCoinBeingFetched", action);
      if (!state.coinsBeingFetched.includes(action.payload.coinId)) {
        state.coinsBeingFetched.push(action.payload.coinId);
      }
    },
    // Remove a coin from the list of coins being fetched
    removeCoinBeingFetched: (state, action) => {
      console.log("removeCoinBeingFetched", action);
      state.coinsBeingFetched = state.coinsBeingFetched.filter(
        (coinId) => coinId !== action.payload.coinId,
      );
    },
    // Reset the list of coins being fetched
    resetCoinsBeingFetched: (state) => {
      console.log("resetCoinsBeingFetched");
      state.coinsBeingFetched = [];
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
