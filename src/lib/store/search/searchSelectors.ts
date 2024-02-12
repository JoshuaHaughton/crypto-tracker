import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";
import { ICoinOverview } from "@/types/coinTypes";

/**
 * Selector to see if the search has been initialized yet.
 * @param state - The current state of the application.
 * @returns The fuzzy search instance or null if not set.
 */
export const selectIsSearchInitialized = (state: TRootState): boolean =>
  state.search.isSearchInitialized;

/**
 * Selector to get the current search query.
 * Directly retrieves the query from the state without additional computation.
 * @param state - The current state of the application.
 * @returns The current search query as a string.
 */
export const selectCurrentQuery = (state: TRootState): string =>
  state.search.currentQuery;

/**
 * Memoized selector for search results.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations.
 * Automatically retrieves search results from the state.
 *
 * This selector is useful when you have additional computations or filtering on the results,
 * otherwise, a direct selector like `selectCurrentQuery` can be used for simplicity.
 *
 * @param state - The current state of the application.
 * @returns An array of search results.
 */
export const selectSearchResults = createSelector(
  [(state: TRootState) => state.search.results],
  (results): ICoinOverview[] => {
    // Placeholder for potential transformations or filtering of results
    return results;
  },
);
