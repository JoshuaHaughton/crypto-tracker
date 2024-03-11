import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";
import {
  ICoinDetails,
  ICoinOverview,
  TShallowOrFullCoinDetails,
} from "@/lib/types/coinTypes";

/**
 * Selector for popular coins.
 * Does not use `createSelector` for memoization because it directly retrieves a simple state slice without complex computation or derived data.
 * @param state - The current state of the application.
 * @returns An array of popular coin overviews.
 */
export const selectPopularCoins = (state: TRootState) =>
  state.coins.popularCoins;

/**
 * Selector to get the total number of popular coins.
 * This is useful for operations that require knowing the total count of items, such as pagination.
 * @param state - The current state of the application.
 * @returns The total number of popular coins as a number.
 */
export const selectPopularCoinsCount = (state: TRootState): number =>
  state.coins.popularCoins.length;

/**
 * Memoized selector for carousel coins.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations.
 * Retrieves an array of carousel coin overviews based on the symbols in the carouselCoins array.
 *
 * This selector first gets the list of carousel coin symbols from the state,
 * then maps each symbol to its corresponding coin overview in the popularCoinsMap.
 * This ensures the most current details are used for each coin in the carousel.
 *
 * @param state - The current state of the application.
 * @returns An array of carousel coin overviews.
 */
export const selectCarouselCoins = createSelector(
  [
    (state: TRootState) => state.coins.carouselSymbolList,
    (state: TRootState) => state.coins.popularCoinsMap,
  ],
  (carouselSymbolList, popularCoinsMap): ICoinOverview[] => {
    console.log("selectCarouselCoins");
    console.log("selectCarouselCoins - carouselSymbolList", carouselSymbolList);
    console.log("selectCarouselCoins - popularCoinsMap", popularCoinsMap);
    return carouselSymbolList.map((symbol) => popularCoinsMap[symbol]);
  },
);

/**
 * Selector for selected coin details.
 * This selector does not use `createSelector` because it retrieves a direct piece of state without any additional computation or filtering.
 * @param state - The current state of the application.
 * @returns Details of the selected coin.
 */
export const selectSelectedCoinDetails = (state: TRootState) =>
  state.coins.selectedCoinDetails;

/**
 * Memoized selector for a specific coin's details by the current currency.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations.
 * Automatically retrieves the current currency from the state.
 *
 * @param state - The current state of the application.
 * @returns Coin details associated with the current currency or null if not available.
 */
export const selectSelectedCoinDetailsByCurrentCurrency = createSelector(
  [
    (state: TRootState) => state.coins.cachedSelectedCoinDetailsByCurrency,
    (state: TRootState) => state.currency.currentCurrency,
  ],
  (cachedSelectedCoinDetailsByCurrency, currentCurrency) =>
    cachedSelectedCoinDetailsByCurrency[currentCurrency] || null,
);
