import { useState, useEffect, useCallback, useRef } from "react";
import Fuse from "fuse.js";
import { ICoinOverview } from "@/types/coinTypes";

/**
 * Defines the structure for the search state within the popular coins search hook.
 * Includes the current search string, search searchResults, and a method to update the search string.
 *
 * @interface IUsePopularCoinsSearchState
 * @property search - The current search query string.
 * @property searchResults - The search searchResults based on the current query.
 * @property setSearch - Function to update the search query string.
 */
interface IUsePopularCoinsSearchState {
  search: string;
  searchResults: ICoinOverview[];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * A custom hook designed for efficient searching within a list of popular coins using Fuse.js.
 *
 * @param currentPageCoins - An array of coin objects that are searchable.
 * @returns The current search state, including the search query, search searchResults, and a setter for the query.
 */
export function usePopularCoinsSearch(
  currentPageCoins: ICoinOverview[],
): IUsePopularCoinsSearchState {
  const [search, setSearch] = useState<string>("");
  const [searchResults, setSearchResults] =
    useState<ICoinOverview[]>(currentPageCoins);

  // Initialize Fuse.js and keep it updated with the latest coins list
  const fuseRef = useRef(
    new Fuse(currentPageCoins, {
      keys: ["name", "symbol"],
      includeScore: true,
      threshold: 0.3,
    }),
  );

  const isInitialMount = useRef(true);

  // Update Fuse.js instance only when currentPageCoins changes
  useEffect(() => {
    // Skip search on initial mount, but perform search on subsequent updates
    if (!isInitialMount.current) {
      fuseRef.current.setCollection(currentPageCoins);
    }
  }, [currentPageCoins]);

  // Memoize function to perform search
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults(currentPageCoins); // Show all coins or clear searchResults if preferred
        return;
      }
      const searchsearchResults = fuseRef.current
        .search(query)
        .map((result) => result.item);
      setSearchResults(searchsearchResults);
    },
    [currentPageCoins],
  );

  useEffect(() => {
    if (!isInitialMount.current) {
      // Check if it's not the initial mount before performing the search
      performSearch(search);
    }
  }, [performSearch, search]);

  // Delay setting isInitialMount to false to ensure it correctly reflects the initial mount state across all effects
  useEffect(() => {
    if (isInitialMount.current) {
      // Then, mark the initial mount as complete
      isInitialMount.current = false;
    }
  }, []);

  return { search, setSearch, searchResults };
}
