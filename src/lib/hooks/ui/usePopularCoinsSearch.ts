import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ICoinOverview,
  IMatchDetail,
  IPopularCoinSearchItem,
} from "@/lib/types/coinTypes";
import { useDispatch } from "react-redux";
import {
  setCurrentQuery,
  setGlobalSearchResults,
} from "@/lib/store/search/searchSlice";
import { debounce } from "lodash";
import uFuzzy from "@leeoniya/ufuzzy";
import { uFuzzyOptions } from "@/lib/constants/searchConstants";

interface IUsePopularCoinsSearchParams {
  allPopularCoins: ICoinOverview[];
}

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

interface ICurrentSearchData {
  matches: Map<
    number,
    { nameMatches?: IMatchDetail; symbolMatches?: IMatchDetail }
  >;
}

// The OUT_OF_ORDER parameter in the uFuzzy search function enables the
// fuzzy search algorithm to match search terms in the input query
// even if they appear in a different order in the target strings.
const OUT_OF_ORDER = 1;
// Perform the search using the uFuzzy instance.
// Max 1000 results (Should only be 80-200 here)
const MAX_INFO_THRESHOLD = 1000;

/**
 * Custom hook for searching within a list of popular coins.
 * Utilizes the uFuzzy instance from the Redux store for performing the search.
 *
 * @returns The search state, including the search term, results, and a setter for the search term.
 */
export function usePopularCoinsSearch({
  allPopularCoins,
}: IUsePopularCoinsSearchParams): IUsePopularCoinsSearchState {
  console.log("usePopularCoinsSearch");
  // State hooks for managing search term and results.
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IPopularCoinSearchItem[]>(
    [],
  );
  // Ref updated when search changes. We use this when formatting results because formatResults may be called whenever popularCoins change,
  // and we don't want to recompute search logic in those siituations
  const currentSearchData = useRef<ICurrentSearchData>({
    matches: new Map(),
  });

  // Memoize the uFuzzy instance retrieval based on the search initialization status
  const searchInstance = useMemo(() => new uFuzzy(uFuzzyOptions), []);

  // Create a combined searchable array for both names and symbols, alongside their original index.
  const searchItems = useMemo(() => {
    return allPopularCoins.flatMap((coin, index) => [
      { text: coin.name, type: "name", originalIndex: index },
      { text: coin.symbol, type: "symbol", originalIndex: index },
    ]);
    // We don't recalculate when allPopularCoins changes because they'll be the same name in different currencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchItemsHaystack = useMemo(() => {
    return searchItems.map((item) => item.text);
  }, [searchItems]);

  const dispatch = useDispatch();

  // Ref to store the debounced global state updates
  const updateGlobalSearchState = useRef(
    debounce(({ searchTerm, formattedResults }) => {
      if (searchTerm != null) {
        dispatch(setCurrentQuery(searchTerm));
      }
      if (formattedResults != null) {
        dispatch(setGlobalSearchResults(formattedResults));
      }
    }, 1000),
  );

  // Function to format search results, this is separated so we can call it only when popularCoins change.
  const formatResults = useCallback(
    (matchesMap = currentSearchData.current.matches) => {
      // Generate the formatted results using the Maps.
      return allPopularCoins.reduce((accumulator, coin, index) => {
        // Retrieve match details for the current coin
        const nameMatches = matchesMap.get(index)?.nameMatches;
        const symbolMatches = matchesMap.get(index)?.symbolMatches;

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
      }, [] as IPopularCoinSearchItem[]);
    },
    [allPopularCoins],
  );

  // Callback hook to memoize the search function.
  const performSearch = useCallback(
    (query: string) => {
      console.log("performSearch - usePopularCoinsSearch", query);
      if (!query.trim()) {
        // Update results to be empty if the query is empty.
        setSearchResults([]);
        updateGlobalSearchState.current({
          searchTerm: query,
          formattedResults: [],
        });
        return;
      }

      const [matchedIndices, matchInfo] = searchInstance.search(
        searchItemsHaystack,
        query,
        OUT_OF_ORDER,
        MAX_INFO_THRESHOLD,
      );

      // Initialize a new map to store combined match details
      const combinedMatchDetails = new Map<
        number,
        { nameMatches?: IMatchDetail; symbolMatches?: IMatchDetail }
      >();

      // Iterate over matched indices to distribute results to name and symbol matches based on their type
      matchedIndices?.forEach((matchIndex, i) => {
        const { type, originalIndex } = searchItems[matchIndex];
        const matchDetail: IMatchDetail = matchInfo?.ranges[i] ?? [];

        // Retrieve existing entry or initialize a new one
        const existingEntry = combinedMatchDetails.get(originalIndex) ?? {};
        if (type === "name") {
          existingEntry.nameMatches = matchDetail;
        } else {
          existingEntry.symbolMatches = matchDetail;
        }

        // Update the map
        combinedMatchDetails.set(originalIndex, existingEntry);
      });

      currentSearchData.current = {
        matches: combinedMatchDetails,
      };

      const formattedResults = formatResults(combinedMatchDetails);

      // Update local state
      setSearchResults(formattedResults);
      // Update Global state with the search results.
      updateGlobalSearchState.current({
        searchTerm: query,
        formattedResults,
      });
    },

    [searchItems, searchItemsHaystack, searchInstance, formatResults],
  );

  // Effect to reformat results when popular coins change.
  useEffect(() => {
    const formattedResults = formatResults();

    // Update local state
    setSearchResults(formattedResults);
    // Update Global state with the search results.
    updateGlobalSearchState.current({
      formattedResults,
    });
    // We shouldn't add formatResults to the deps array because it rerenders whenever search changes,
    // and we only want to call this on global state updates (e.g. currency updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPopularCoins]);

  // Also dispatch the current query to the Redux store
  const handleSetSearchQuery = (searchTerm: string) => {
    if (searchTerm === searchQuery) return;

    setSearchQuery(searchTerm); // Update local state
    performSearch(searchTerm);
  };

  // Return the current search state.
  return { searchQuery, setSearchQuery: handleSetSearchQuery, searchResults };
}
