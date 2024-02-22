import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  LoadingStatus,
  TInitialPopularCoinsStatus,
  TPreloadedPopularCoinsStatus,
} from "@/lib/types/apiRequestTypes";

/**
 * Interface representing the state structure for the appInfo slice.
 */
export interface IAppInfoState {
  popularCoinsPageNumber: number;
  coinsBeingPreloaded: Record<string, boolean>;
  coinsBeingPreloadedOrder: string[];
  initialPopularCoinsStatus: TInitialPopularCoinsStatus;
  preloadedPopularCoinsStatus: TPreloadedPopularCoinsStatus;
}

/**
 * Interface for the payload to set popular coins list page number.
 */
export interface SetPopularCoinsPageNumberPayload {
  popularCoinsPageNumber: IAppInfoState["popularCoinsPageNumber"];
}

/**
 * Interface for the payload to add or remove a coin being preloaded.
 */
export interface CoinPreloadPayload {
  coinId: string;
}

/**
 * Initial state for the appInfo slice.
 */
export const initialAppInfoState: IAppInfoState = {
  popularCoinsPageNumber: 1,
  coinsBeingPreloaded: {},
  coinsBeingPreloadedOrder: [],
  initialPopularCoinsStatus: "idle",
  preloadedPopularCoinsStatus: "idle",
};

const appInfoSlice = createSlice({
  name: "appInfo",
  initialState: initialAppInfoState,
  reducers: {
    /**
     * Set the current page number of the popular coins list.
     * @param state - Current state of appInfo.
     * @param action - Action payload containing the new page number.
     */
    setPopularCoinsListPageNumber(
      state: IAppInfoState,
      action: PayloadAction<SetPopularCoinsPageNumberPayload>,
    ) {
      const { popularCoinsPageNumber } = action.payload;

      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.popularCoinsPageNumber = popularCoinsPageNumber;
    },

    /**
     * Add a coin ID to the list of coins being preloaded.
     * @param state - Current state of appInfo.
     * @param action - Action payload containing the coin ID.
     */
    addCoinBeingPreloaded(
      state: IAppInfoState,
      action: PayloadAction<CoinPreloadPayload>,
    ) {
      const { coinId } = action.payload;

      if (!state.coinsBeingPreloaded[coinId]) {
        state.coinsBeingPreloaded[coinId] = true;
        state.coinsBeingPreloadedOrder.push(coinId);
      }
    },

    /**
     * Remove a coin ID from the list of coins being preloaded.
     * @param state - Current state of appInfo.
     * @param action - Action payload containing the coin ID.
     */
    removeCoinBeingPreloaded(
      state: IAppInfoState,
      action: PayloadAction<CoinPreloadPayload>,
    ) {
      const { coinId } = action.payload;

      delete state.coinsBeingPreloaded[coinId];
      state.coinsBeingPreloadedOrder = state.coinsBeingPreloadedOrder.filter(
        (id) => id !== coinId,
      );
    },

    /**
     * Reset the list of coins being preloaded.
     * @param state - Current state of appInfo.
     */
    resetCoinsBeingPreloaded(state: IAppInfoState) {
      state.coinsBeingPreloaded = {};
      state.coinsBeingPreloadedOrder = [];
    },

    /**
     * Initiates loading of initial popular coins.
     * @param state - The current state of the app information.
     */
    startInitialPopularCoinsLoading(state: IAppInfoState) {
      state.initialPopularCoinsStatus = LoadingStatus.LOADING;
    },

    /**
     * Marks the completion of initial popular coins loading.
     * @param state - The current state of the app information.
     */
    completeInitialPopularCoinsLoading(state: IAppInfoState) {
      state.initialPopularCoinsStatus = LoadingStatus.LOADED;
    },

    /**
     * Marks the failure of initial popular coins loading.
     * @param state - The current state of the app information.
     */
    failInitialPopularCoinsLoading(state: IAppInfoState) {
      state.initialPopularCoinsStatus = LoadingStatus.FAILED;
    },

    /**
     * Starts the comprehensive coins preloading process after initial coins are loaded.
     * @param state - The current state of the app information.
     */
    startPopularCoinsPreloading(state: IAppInfoState) {
      state.preloadedPopularCoinsStatus = LoadingStatus.PRELOADING;
    },

    /**
     * Completes the comprehensive coins preloading process.
     * @param state - The current state of the app information.
     */
    completePopularCoinsPreloading(state: IAppInfoState) {
      state.preloadedPopularCoinsStatus = LoadingStatus.PRELOADED;
    },

    /**
     * Marks the failure of comprehensive coins preloading process.
     * @param state - The current state of the app information.
     */
    failPopularCoinsPreloading(state: IAppInfoState) {
      state.preloadedPopularCoinsStatus = LoadingStatus.FAILED;
    },
  },
});

export const appInfoActions = appInfoSlice.actions;
export default appInfoSlice.reducer;
