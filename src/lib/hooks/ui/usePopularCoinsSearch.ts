import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { IPopularCoinSearchResult } from "@/types/coinTypes";
import { useSelector, useDispatch } from "react-redux";
import { setGlobalSearchResults } from "@/lib/store/search/searchSlice"; // Import the action to update search results in the store
import { selectFuzzySearchInstance } from "@/lib/store/search/searchSelectors";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";

/**
 * Defines the structure for the search state within the popular coins search hook.
 * Includes the current search string, search searchResults, and a method to update the search string.
 *
 * @interface IUsePopularCoinsSearchState
 * @property search - The current search query string.
 * @property setSearch - Function to update the search query string.
 */
interface IUsePopularCoinsSearchState {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Custom hook for searching within a list of popular coins.
 * Utilizes the uFuzzy instance from the Redux store for performing the search.
 *
 * @returns The search state, including the search term, results, and a setter for the search term.
 */
export function usePopularCoinsSearch(): IUsePopularCoinsSearchState {
  // State hooks for managing search term and results.
  const [search, setSearch] = useState<string>("");

  // Redux hooks for accessing the fuzzy search instance and dispatching actions.
  const uFuzzyInstance = useSelector(selectFuzzySearchInstance);
  const allPopularCoins = useSelector(selectPopularCoins);
  const dispatch = useDispatch();

  // Ref to track the initial mount of the component.
  const isInitialMount = useRef(true);

  // Memoize the haystack to prevent recalculating it on every render
  const haystack = useMemo(
    () => allPopularCoins.map((coin) => `${coin.name} ${coin.symbol}`),
    [allPopularCoins],
  );

  // Callback hook to memoize the search function.
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        // Dispatch action to update the Redux store with the initial set of coins if query is empty.
        dispatch(setGlobalSearchResults([]));
        return;
      }

      if (!uFuzzyInstance) {
        // Handle the scenario where uFuzzyInstance is not available
        console.warn("Fuzzy search instance is not available.");
        return;
      }

      // The outOfOrder parameter in the uFuzzy search function enables the
      // fuzzy search algorithm to match search terms in the input query
      // even if they appear in a different order in the target strings.
      const outOfOrder = true;
      // Perform the search using the uFuzzy instance.
      // Max 1000 results (Should only be 80-200 here)
      const infoThreshold = 1000;

      // Perform the search using the uFuzzy instance.
      const [idxs, info] = uFuzzyInstance.search(
        haystack,
        query,
        outOfOrder,
        infoThreshold,
      );

      // Prepare search results with highlighting details
      const results: IPopularCoinSearchResult[] = idxs.map((index) => {
        const coin = allPopularCoins[index];
        // Directly use ranges provided by uFuzzy for highlighting
        const highlightDetails = info.ranges[index] || [];

        return {
          ...coin,
          matchDetails: highlightDetails, // Directly usable by the HighlightedText component
        };
      });

      // Update Redux state with the search results.
      dispatch(setGlobalSearchResults(results));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, haystack, uFuzzyInstance],
  );

  // Effect hook to perform search operations after the initial mount.
  useEffect(() => {
    if (isInitialMount.current) {
      // Mark initial mount as complete.
      isInitialMount.current = false;
    } else {
      performSearch(search);
    }
  }, [search, performSearch]);

  // Return the current search state.
  return { search, setSearch };
}
