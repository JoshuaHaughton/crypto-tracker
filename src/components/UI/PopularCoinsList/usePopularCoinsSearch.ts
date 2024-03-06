import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import uFuzzy from "@leeoniya/ufuzzy";
import { debounce } from "lodash";
import {
  ICoinOverview,
  IMatchDetail,
  IPopularCoinSearchItem,
} from "@/lib/types/coinTypes";
import {
  setCurrentQuery,
  setGlobalSearchResults,
} from "@/lib/store/search/searchSlice";
import { uFuzzyOptions } from "@/lib/constants/searchConstants";
import { useAppDispatch } from "@/lib/store";

interface IUsePopularCoinsSearchParams {
  allPopularCoins: ICoinOverview[];
}

interface IUsePopularCoinsSearchState {
  searchQuery: string;
  setSearchQuery: (searchTerm: string) => void;
  searchResults: IPopularCoinSearchItem[];
}

type TFuzzySeachItemTypes = "name" | "symbol";

interface IFuzzySearchItemReference {
  text: string;
  type: TFuzzySeachItemTypes;
  originalIndex: number;
}

interface ICoinMatchDetails {
  nameMatches?: IMatchDetail;
  symbolMatches?: IMatchDetail;
}

type TDetailsByOriginalIndex = Map<number, ICoinMatchDetails>;

interface ICurrentSearchData {
  queryMatchDetails: TDetailsByOriginalIndex;
}

interface IUpdateGlobalSearchStateParams {
  searchTerm?: string;
  formattedResults?: IPopularCoinSearchItem[];
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
    queryMatchDetails: new Map(),
  });

  // Memoize the uFuzzy instance retrieval based on the search initialization status
  const searchInstance = useMemo(() => new uFuzzy(uFuzzyOptions), []);

  // A combined searchable array for both types, alongside their original index.
  // This way we don't have to perform 2 searches to get matches for both params
  const searchItems: IFuzzySearchItemReference[] = useMemo(
    () =>
      allPopularCoins.flatMap((coin, index) => [
        { text: coin.name, type: "name", originalIndex: index },
        { text: coin.symbol, type: "symbol", originalIndex: index },
      ]),
    // We don't recalculate when allPopularCoins changes because they'll be the same name in different currencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const searchItemsHaystack = useMemo(() => {
    return searchItems.map((item) => item.text);
  }, [searchItems]);

  const dispatch = useAppDispatch();

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
      const matchDetailsMap: TDetailsByOriginalIndex = new Map();

      // Iterate over matched indices to distribute results to name and symbol matches based on their type
      matchedIndices?.forEach((matchIndex, i) => {
        const { type, originalIndex } = searchItems[matchIndex];
        const matchDetail: IMatchDetail = matchInfo?.ranges[i] ?? [];

        // Retrieve existing entry or initialize a new one
        const existingEntry = matchDetailsMap.get(originalIndex) ?? {};
        if (type === "name") {
          existingEntry.nameMatches = matchDetail;
        } else {
          existingEntry.symbolMatches = matchDetail;
        }

        // Update the map
        matchDetailsMap.set(originalIndex, existingEntry);
      });

      currentSearchData.current = {
        queryMatchDetails: matchDetailsMap,
      };

      const formattedResults = formatResults({
        allPopularCoins,
        matchDetailsMap,
      });

      // Update local state
      setSearchResults(formattedResults);
      // Update Global state with the search results.
      updateGlobalSearchState.current({
        searchTerm: query,
        formattedResults,
      });
    },

    [
      searchItems,
      searchItemsHaystack,
      searchInstance,
      allPopularCoins,
      updateGlobalSearchState,
    ],
  );

  // Effect to reformat results when popular coins change (E.g. Currency Updates).
  useEffect(() => {
    const currentMatchDetails = currentSearchData.current.queryMatchDetails;
    const formattedResults = formatResults({
      allPopularCoins,
      matchDetailsMap: currentMatchDetails,
    });

    // Update local state
    setSearchResults(formattedResults);
    // Update Global state with the search results.
    updateGlobalSearchState.current({
      formattedResults,
    });
  }, [allPopularCoins]);

  // Function to update query
  const handleSetSearchQuery = (searchTerm: string) => {
    if (searchTerm === searchQuery) return;

    setSearchQuery(searchTerm); // Update local state
    performSearch(searchTerm);
  };

  // Return the current search state.
  return { searchQuery, setSearchQuery: handleSetSearchQuery, searchResults };
}

// Function to format search results, this is separated so we can call it only when popularCoins change.
function formatResults({
  allPopularCoins,
  matchDetailsMap,
}: {
  allPopularCoins: ICoinOverview[];
  matchDetailsMap: TDetailsByOriginalIndex;
}) {
  // Generate the formatted results using the Maps.
  return allPopularCoins.reduce((accumulator, coin, index) => {
    // Retrieve match details for the current coin
    const nameMatches = matchDetailsMap.get(index)?.nameMatches;
    const symbolMatches = matchDetailsMap.get(index)?.symbolMatches;

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
}
