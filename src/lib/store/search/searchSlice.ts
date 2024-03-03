import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Defines the structure of the search slice state.
 */
interface SearchState {
  currentQuery: string;
  results: IPopularCoinSearchItem[];
}

/**
 * Provides the initial state for the search slice.
 */
const initialState: SearchState = {
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
export const { setCurrentQuery, setGlobalSearchResults } = searchSlice.actions;

/**
 * Exports the reducer for the search slice.
 */
export default searchSlice.reducer;
