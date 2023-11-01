import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

export const initialAppInfoState = {
  popularCoinsListPageNumber: 1,
  areCoinDetailsHydratedFromDB: false,
  arePopularCoinsListsHydrated: false,
  coinsBeingPreloaded: {},
  coinsBeingPreloadedOrder: [],
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
    startCoinDetailsHydration: (state) => {
      state.areCoinDetailsHydratedFromDB = false;
    },
    finishCoinDetailsHydration: (state) => {
      state.areCoinDetailsHydratedFromDB = true;
    },
    startPopularCoinsListsHydration: (state) => {
      state.arePopularCoinsListsHydrated = false;
    },
    finishPopularCoinsListsHydration: (state) => {
      console.log("finishPopularCoinsListsHydration");
      state.arePopularCoinsListsHydrated = true;
    },
    // Add a coin to the list of coins being fetched
    addCoinBeingPreloaded: (state, action) => {
      console.warn("addCoinBeingPreloaded", action.payload.coinId);
      const coinId = action.payload.coinId;

      if (!state.coinsBeingPreloaded[coinId]) {
        state.coinsBeingPreloaded[coinId] = true;
        state.coinsBeingPreloadedOrder.push(coinId);
      }
    },
    // Remove a coin from the list of coins being fetched
    removeCoinBeingPreloaded: (state, action) => {
      console.warn("removeCoinBeingPreloaded", action.payload.coinId);
      const coinId = action.payload.coinId;

      const { [coinId]: removed, ...remaining } = state.coinsBeingPreloaded;
      state.coinsBeingPreloaded = remaining;
      state.coinsBeingPreloadedOrder = state.coinsBeingPreloadedOrder.filter(
        (id) => id !== coinId,
      );
    },
    // Reset the list of coins being fetched
    resetCoinsBeingPreloaded: (state) => {
      console.log("resetCoinsBeingPreloaded");
      state.coinsBeingPreloaded = {};
      state.coinsBeingPreloadedOrder = [];
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
