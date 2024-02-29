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
  const isSearchInitialized = useAppSelector(selectIsSearchInitialized);
  const allReduxPopularCoins = useAppSelector(selectPopularCoins);
  // Fallback to page specific data if Redux store doesn't have carousel coins yet.
  const { popularCoins } = usePageData();
  const allPopularCoins: ICoinOverview[] =
    allReduxPopularCoins.length > 0
      ? allReduxPopularCoins
      : (popularCoins as ICoinOverview[]);
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

  // Ref to store the debounced function
  const debouncedSetGlobalSearchResultsRef = useRef(
    debounce((formattedResults: IPopularCoinSearchItem[]) => {
      dispatch(setGlobalSearchResults(formattedResults));
    }, 1000),
  );

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
        debouncedSetGlobalSearchResultsRef.current([]);
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
      const [nameMatchedIndices, nameMatchInfo] = uFuzzyInstance.search(
        nameHaystack,
        query,
        outOfOrder,
        infoThreshold,
      );
      const [symbolMatchedIndices, symbolMatchInfo] = uFuzzyInstance.search(
        symbolHaystack,
        query,
        outOfOrder,
        infoThreshold,
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

      setResults(formattedResults);
      // Update Redux state with the search results.
      debouncedSetGlobalSearchResultsRef.current(formattedResults);
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

  // Ref to store the debounced function
  const debouncedSetCurrentQueryRef = useRef(
    debounce((searchTerm: string) => {
      dispatch(setCurrentQuery(searchTerm));
    }, 1000),
  );

  // Also dispatch the current query to the Redux store
  const handleSetSearch = (searchTerm: string) => {
    setSearch(searchTerm); // Update local state
    debouncedSetCurrentQueryRef.current(searchTerm);
  };

  // Return the current search state.
  return { search, setSearch: handleSetSearch, results };
}
