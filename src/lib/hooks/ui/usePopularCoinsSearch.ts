import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentQuery,
  setGlobalSearchResults,
} from "@/lib/store/search/searchSlice"; // Import the action to update search results in the store
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";
import UFuzzyManager from "@/lib/search/uFuzzyManager";
import { selectIsSearchInitialized } from "@/lib/store/search/searchSelectors";

/**
 * Defines the structure for the search state within the popular coins search hook.
 * Includes the current search string, search Results, and a method to update the search string.
 *
 * @interface IUsePopularCoinsSearchState
 * @property search - The current search query string.
 * @property setSearch - Function to update the search query string.
 * @property results - Search Results.
 */
interface IUsePopularCoinsSearchState {
  search: string;
  setSearch: (searchTerm: string) => void;
  results: IPopularCoinSearchItem[];
}

/**
 * Custom hook for searching within a list of popular coins.
 * Utilizes the uFuzzy instance from the Redux store for performing the search.
 *
 * @returns The search state, including the search term, results, and a setter for the search term.
 */
export function usePopularCoinsSearch(): IUsePopularCoinsSearchState {
  console.log("usePopularCoinsSearch");
  // State hooks for managing search term and results.
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<IPopularCoinSearchItem[]>([]);

  // Redux hooks for accessing the fuzzy search instance and dispatching actions.
  const isSearchInitialized = useSelector(selectIsSearchInitialized);
  const allPopularCoins = useSelector(selectPopularCoins);
  const dispatch = useDispatch();

  // Memoize coin names and symbols to prevent recalculating them on every render.
  // This optimization helps to reduce unnecessary computations, especially when the list of coins is large.
  const nameHaystack = useMemo(
    () => allPopularCoins.map((coin) => coin.name),
    [allPopularCoins],
  );
  const symbolHaystack = useMemo(
    () => allPopularCoins.map((coin) => coin.symbol),
    [allPopularCoins],
  );

  const initialSearchPerformed = useRef(false);

  // Memoize the uFuzzy instance retrieval based on the search initialization status
  const uFuzzyInstance = useMemo(() => {
    if (isSearchInitialized) {
      console.warn("search has been iniitialized in search component");
      return UFuzzyManager.getInstance();
    }
    return null;
  }, [isSearchInitialized]);

  // Callback hook to memoize the search function.
  const performSearch = useCallback(
    (query: string) => {
      console.log("performSearch - usePopularCoinsSearch");
      if (!uFuzzyInstance) {
        // Handle the scenario where uFuzzyInstance is not available
        console.warn("Fuzzy search instance is not available.");
        return;
      }

      if (!query.trim()) {
        // Dispatch action to update the Redux store with the initial set of coins if query is empty.
        dispatch(setGlobalSearchResults([]));
        return;
      }

      // The outOfOrder parameter in the uFuzzy search function enables the
      // fuzzy search algorithm to match search terms in the input query
      // even if they appear in a different order in the target strings.
      const outOfOrder = true;
      // Perform the search using the uFuzzy instance.
      // Max 1000 results (Should only be 80-200 here)
      const infoThreshold = 1000;

      // Perform separate searches on names and symbols
      const nameMatches = uFuzzyInstance.search(
        nameHaystack,
        query,
        outOfOrder,
        infoThreshold,
      );
      const symbolMatches = uFuzzyInstance.search(
        symbolHaystack,
        query,
        outOfOrder,
        infoThreshold,
      );
      console.log("NAMEMATCHES", nameMatches);
      console.log("NAMEHaystack", nameHaystack);
      console.log("SYMBOLMATCHES", symbolMatches);
      console.log("SYMBOLHaystack", symbolHaystack);

      // Combine and map results back to the coin data, including which field was matched
      const combinedResults = new Set([...nameMatches[0], ...symbolMatches[0]]);
      console.log("combinedResults", Array.from(combinedResults));
      const formattedResults = Array.from(combinedResults).map(
        (resultIndex, orderIndex) => ({
          coinDetails: allPopularCoins[resultIndex],
          matchDetails: {
            nameMatches: nameMatches[1].ranges?.[orderIndex] || null, // Highlight details for names
            symbolMatches: symbolMatches[1].ranges?.[orderIndex] || null, // Highlight details for symbols
          },
        }),
      );

      setResults(formattedResults);
      // Update Redux state with the search results.
      // dispatch(setGlobalSearchResults(formattedResults));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, uFuzzyInstance, nameHaystack, symbolHaystack],
  );

  // Effect hook to perform search operations after the initial mount.
  useEffect(() => {
    // Only perform search if it's not the initial search
    if (initialSearchPerformed.current) {
      performSearch(search);
    } else {
      console.log("initial search attempted but not performed");
    }

    // Mark that an initial search has been performed after the first non-initial render.
    if (!initialSearchPerformed.current && isSearchInitialized) {
      initialSearchPerformed.current = true;
    }
  }, [isSearchInitialized, search, performSearch]);

  // Also dispatch the current query to the Redux store
  const handleSetSearch = (searchTerm: string) => {
    setSearch(searchTerm); // Update local state
    // dispatch(setCurrentQuery(searchTerm)); // Dispatch action to update the Redux store
  };

  // Return the current search state.
  return { search, setSearch: handleSetSearch, results };
}
