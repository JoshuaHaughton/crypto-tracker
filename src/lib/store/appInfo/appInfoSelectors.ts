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
 * Enhanced memoized selector for the list of coins being preloaded with additional information.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations,
 * especially useful when dealing with lists of items that might change frequently.
 * @param state - The current state of the application.
 * @returns An array of objects containing coin IDs and their preload status.
 */
export const selectDetailedCoinsBeingPreloaded = createSelector(
  [selectCoinsBeingPreloaded, selectCoinsBeingPreloadedOrder],
  (coinsBeingPreloaded, coinsBeingPreloadedOrder) =>
    coinsBeingPreloadedOrder.map((coinId) => ({
      id: coinId,
      isPreloading: coinsBeingPreloaded[coinId],
    })),
);
