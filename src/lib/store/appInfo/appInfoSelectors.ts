import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";

/**
 * Selector for the current page number of popular coins.
 * @param state - The current state of the application.
 * @returns The current page number.
 */
export const selectPopularCoinsPageNumber = (state: TRootState) =>
  state.appInfo.popularCoinsPageNumber;

/**
 * Selector for the coins being preloaded.
 * @param state - The current state of the application.
 * @returns An object with coin IDs as keys and boolean preload status as values.
 */
export const selectCoinsBeingPreloaded = (state: TRootState) =>
  state.appInfo.coinsBeingPreloaded;

/**
 * Selector for the order of coins being preloaded.
 * @param state - The current state of the application.
 * @returns An array of coin IDs in the order they are being preloaded.
 */
export const selectCoinsBeingPreloadedOrder = (state: TRootState) =>
  state.appInfo.coinsBeingPreloadedOrder;

/**
 * Checks if a specific coin is being preloaded.
 * @param state - The global state from Redux.
 * @param coinId - The ID of the coin to check.
 * @returns True if the coin is being preloaded, false otherwise.
 */
export const selectIsCoinBeingPreloaded = (
  state: TRootState,
  coinId: string,
) => {
  return state.appInfo.coinsBeingPreloaded[coinId] ?? false;
};

/**
 * Selector for the loading status of initial popular coins.
 * @param state - The current state of the application.
 * @returns The loading status of initial popular coins.
 */
export const selectInitialPopularCoinsStatus = (state: TRootState) =>
  state.appInfo.initialPopularCoinsStatus;

/**
 * Selector for the loading status of preloaded popular coins.
 * @param state - The current state of the application.
 * @returns The loading status of preloaded popular coins.
 */
export const selectPreloadedPopularCoinsStatus = (state: TRootState) =>
  state.appInfo.preloadedPopularCoinsStatus;

/**
 * Determines if the initial popular coins are currently being loaded.
 * @param state - The current state of the application.
 * @returns A boolean indicating if the initial popular coins are being loaded.
 */
export const selectIsInitialPopularCoinsLoading = createSelector(
  [selectInitialPopularCoinsStatus],
  (status) => status === "loading",
);

/**
 * Determines if the initial popular coins have been loaded.
 * @param state - The current state of the application.
 * @returns A boolean indicating if the initial popular coins have been loaded.
 */
export const selectAreInitialPopularCoinsLoaded = createSelector(
  [selectInitialPopularCoinsStatus],
  (status) => status === "loaded",
);

/**
 * Determines if the preloaded popular coins are currently being preloaded.
 * @param state - The current state of the application.
 * @returns A boolean indicating if the preloaded popular coins are being preloaded.
 */
export const selectIsPreloadedPopularCoinsPreloading = createSelector(
  [selectPreloadedPopularCoinsStatus],
  (status) => status === "preloading",
);

/**
 * Determines if the preloaded popular coins have been completely preloaded.
 * @param state - The current state of the application.
 * @returns A boolean indicating if the preloaded popular coins have been preloaded.
 */
export const selectArePreloadedPopularCoinsPreloaded = createSelector(
  [selectPreloadedPopularCoinsStatus],
  (status) => status === "preloaded",
);
