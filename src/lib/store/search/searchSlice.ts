import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FuzzySearchInstance {
  // Performs a fuzzy search
  search: (
    haystack: string[],
    needle: string,
    outOfOrder?: boolean,
    infoThresh?: number,
  ) => [number[], any, number[]];

  // Splits a given needle into its constituent parts
  split: (needle: string) => string[];

  // Filters the haystack based on the needle, optionally using pre-filtered indices
  filter: (haystack: string[], needle: string, idxs?: number[]) => number[];

  // Collects detailed information about the filtered matches
  info: (idxs: number[], haystack: string[], needle: string) => any;

  // Sorts the filtered matches based on custom sorting logic
  sort: (info: any, haystack: string[], needle: string) => number[];

  // Utility for highlighting matched parts of a string
  highlight: (
    str: string,
    ranges: number[],
    mark?: (part: string, matched: boolean) => string,
    accum?: string,
    append?: (accum: string, part: string) => string,
  ) => string;
}

export type TUFuzzyConstructor = (opts?: any) => FuzzySearchInstance;

/**
 * Defines the structure of the search slice state.
 */
interface SearchState {
  isSearchInitialized: boolean;
  currentQuery: string;
  results: IPopularCoinSearchItem[];
}

/**
 * Provides the initial state for the search slice.
 */
const initialState: SearchState = {
  isSearchInitialized: false,
  currentQuery: "",
  results: [],
};

/**
 * Creates a slice for search operations.
 */
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    /**
     * Action to indicate that the search functionality is fully ready.
     * This can be utilized to signal readiness after all dependent resources,
     * like uFuzzy or other search dependencies, are initialized.
     *
     * @param state - The current state of appInfo.
     */
    setSearchIsInitialized(state) {
      state.isSearchInitialized = true;
    },

    /**
     * Updates the current search query within the state.
     * @param state - The current state of the search slice.
     * @param action - The action payload containing the new search query.
     */
    setCurrentQuery(state, action: PayloadAction<string>) {
      state.currentQuery = action.payload;
    },

    /**
     * Sets the search results based on the current query.
     * This action could be dispatched after performing a search operation.
     * @param state - The current state of the search slice.
     * @param action - The action payload containing the search results.
     */
    setGlobalSearchResults(
      state,
      action: PayloadAction<IPopularCoinSearchItem[]>,
    ) {
      state.results = action.payload;
    },
  },
});

/**
 * Exports the action creators.
 */
export const {
  setSearchIsInitialized,
  setCurrentQuery,
  setGlobalSearchResults,
} = searchSlice.actions;

/**
 * Exports the reducer for the search slice.
 */
export default searchSlice.reducer;
