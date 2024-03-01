import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { IMatchDetail, IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { useDispatch } from "react-redux";
import {
  setCurrentQuery,
  setGlobalSearchResults,
} from "@/lib/store/search/searchSlice"; // Import the action to update search results in the store
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";
import UFuzzyManager from "@/lib/search/uFuzzyManager";
import { selectIsSearchInitialized } from "@/lib/store/search/searchSelectors";
import { debounce } from "lodash";
import { useAppSelector } from "@/lib/store";
import { usePageData } from "@/lib/contexts/pageContext";

/**
 * Defines the structure for the search state within the popular coins search hook.
 * Includes the current search string, search Results, and a method to update the search string.
 *
 * @interface IUsePopularCoinsSearchState
 * @property search - The current search query string.
 * @property setSearchQuery - Function to update the search query string.
 * @property results - Search Results.
 */
interface IUsePopularCoinsSearchState {
  searchQuery: string;
  setSearchQuery: (searchTerm: string) => void;
  searchResults: IPopularCoinSearchItem[];
}

// The OUT_OF_ORDER parameter in the uFuzzy search function enables the
// fuzzy search algorithm to match search terms in the input query
// even if they appear in a different order in the target strings.
const OUT_OF_ORDER = true;
// Perform the search using the uFuzzy instance.
// Max 1000 results (Should only be 80-200 here)
const MAX_INFO_THRESHOLD = 1000;

/**
 * Custom hook for searching within a list of popular coins.
 * Utilizes the uFuzzy instance from the Redux store for performing the search.
 *
 * @returns The search state, including the search term, results, and a setter for the search term.
 */
export function usePopularCoinsSearch(): IUsePopularCoinsSearchState {
  console.log("usePopularCoinsSearch");
  // State hooks for managing search term and results.
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IPopularCoinSearchItem[]>(
    [],
  );

  const dispatch = useDispatch();
  // Redux hooks for accessing the fuzzy search instance and dispatching actions.
  const isSearchInitialized = useAppSelector(selectIsSearchInitialized);
  const allReduxPopularCoins = useAppSelector(selectPopularCoins);
  // Fallback to page specific data if Redux store doesn't have carousel coins yet due to initial hydration.
  const { popularCoins } = usePageData();

  const allPopularCoins: ICoinOverview[] =
    allReduxPopularCoins.length > 0
      ? allReduxPopularCoins
      : (popularCoins as ICoinOverview[]);
  console.log("allPopularCoins - usePopularCoinsSearch", allPopularCoins);

  // Memoize coin names and symbols to prevent recalculating them on every render.
  // This optimization helps to reduce unnecessary computations, especially when the list of coins is large.
  // We don't recalculate when allPopularCoins changes because they'll be the same name in different currencies
  const nameHaystack = useMemo(
    () => allPopularCoins.map((coin) => coin.name),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const symbolHaystack = useMemo(
    () => allPopularCoins.map((coin) => coin.symbol),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Memoize the uFuzzy instance retrieval based on the search initialization status
  const uFuzzyInstance = useMemo(() => {
    if (isSearchInitialized) {
      console.warn("search has been iniitialized in search component");
      return UFuzzyManager.getInstance();
    }
    return null;
  }, [isSearchInitialized]);

  // Ref to store the debounced global state updates
  const updateGlobalSearchState = useRef(
    debounce((searchTerm, formattedResults) => {
      dispatch(setCurrentQuery(searchTerm));
      dispatch(setGlobalSearchResults(formattedResults));
    }, 1000),
  );

  // Callback hook to memoize the search function.
  const performSearch = useCallback(
    (query: string) => {
      console.log("performSearch - usePopularCoinsSearch", query);
      if (!uFuzzyInstance) {
        // Handle the scenario where uFuzzyInstance is not available
        console.warn("Fuzzy search instance is not available.");
        return;
      }

      if (!query.trim()) {
        // Update results to be empty if the query is empty.
        setSearchResults([]);
        updateGlobalSearchState.current(query, []);
        return;
      }

      // Perform separate searches on names and symbols
      const [nameMatchedIndices, nameMatchInfo] = uFuzzyInstance.search(
        nameHaystack,
        query,
        OUT_OF_ORDER,
        MAX_INFO_THRESHOLD,
      );
      const [symbolMatchedIndices, symbolMatchInfo] = uFuzzyInstance.search(
        symbolHaystack,
        query,
        OUT_OF_ORDER,
        MAX_INFO_THRESHOLD,
      );

      // Create Maps to associate indices with their match details directly.
      const nameMatchMap = new Map<number, IMatchDetail>(
        nameMatchedIndices.map((index, i) => [
          index,
          nameMatchInfo.ranges[i] ?? null,
        ]),
      );
      const symbolMatchMap = new Map<number, IMatchDetail>(
        symbolMatchedIndices.map((index, i) => [
          index,
          symbolMatchInfo.ranges[i] ?? null,
        ]),
      );

      // Generate the formatted results using the new Maps.
      const formattedResults: IPopularCoinSearchItem[] = allPopularCoins.reduce(
        (accumulator, coin, index) => {
          // Retrieve match details for the current coin
          const nameMatches = nameMatchMap.get(index);
          const symbolMatches = symbolMatchMap.get(index);

          // Only include coins that have a match in either name or symbol.
          if (nameMatches || symbolMatches) {
            accumulator.push({
              coinDetails: coin,
              matchDetails: {
                nameMatches: nameMatches ?? null,
                symbolMatches: symbolMatches ?? null,
              },
            });
          }

          // Return the accumulated results so far.
          return accumulator;
        },
        [] as IPopularCoinSearchItem[],
      );

      // Update local state
      setSearchResults(formattedResults);
      // Update Global state with the search results.
      updateGlobalSearchState.current(query, formattedResults);
    },

    [uFuzzyInstance, nameHaystack, symbolHaystack, allPopularCoins],
  );

  // Also dispatch the current query to the Redux store
  const handleSetSearchQuery = (searchTerm: string) => {
    if (searchTerm === searchQuery) return;

    setSearchQuery(searchTerm); // Update local state
    performSearch(searchTerm);
  };

  // Return the current search state.
  return { searchQuery, setSearchQuery: handleSetSearchQuery, searchResults };
}
