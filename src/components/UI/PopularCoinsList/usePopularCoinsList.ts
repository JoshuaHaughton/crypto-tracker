import { usePopularCoinsSearch } from "./usePopularCoinsSearch";
import useCurrentPageCoins from "./useCurrentPageCoins";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import {
  selectIsMobile,
  selectIsTablet,
  selectIsDesktop,
} from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { ChangeEvent } from "react";
import { COLORS, TCurrencySymbol } from "@/lib/constants/globalConstants";
import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { useAppSelector } from "@/lib/store";
import useCoinDetailsPreloader from "@/lib/hooks/preloaders/useCoinDetailsPreloader";
import { useInitialPageData } from "@/lib/contexts/initialPageDataContext";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";
import usePagination, { TPaginationItem } from "../Pagination/usePagination";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  searchQuery: string;
  coinsForCurrentPage: IPopularCoinSearchItem[];
  currentPageNumber: number;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  paginationRange: TPaginationItem[];
  totalItemsCount: number;
  currentSymbol: TCurrencySymbol;
  setSearchQuery: (searchTerm: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleItemMouseEnter: (symbol: string) => void;
  handleNavigation: (symbol: string) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToPage: (pageNumber: number) => void;
}

/**
 * Integrates search and pagination for displaying popular coins using Redux for state management.
 * It optimizes data flow and UI consistency by minimizing local state usage.
 *
 * @returns {IUsePopularCoinsListState} Includes the search state, setter function, and coins for the current page.
 */
export const usePopularCoinsList = (): IUsePopularCoinsListState => {
  console.log("usePopularCoinsList render");
  const currentPageNumber = useAppSelector(selectPopularCoinsPageNumber);
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const allReduxPopularCoins = useAppSelector(selectPopularCoins);
  // Fallback to page specific data if Redux store doesn't have carousel coins yet due to initial hydration.
  const { popularCoins } = useInitialPageData();

  const allPopularCoins: ICoinOverview[] =
    allReduxPopularCoins.length > 0
      ? allReduxPopularCoins
      : (popularCoins as ICoinOverview[]);

  // Manage search term via Redux, reducing local state management.
  const { searchQuery, setSearchQuery, searchResults } = usePopularCoinsSearch({
    allPopularCoins,
  });

  // Fetch current page coins based on Redux-stored search results, enhancing performance.
  const { coinsForCurrentPage } = useCurrentPageCoins({
    currentQuery: searchQuery,
    searchResults: searchResults,
    currentPageNumber,
  });

  const totalItemsCount =
    searchQuery.trim().length > 0
      ? searchResults.length
      : allPopularCoins.length;

  const { paginationRange, onPrevious, onNext, goToPage } = usePagination({
    totalItemsCount,
    currentPageNumber,
  });

  const isFirstPage = currentPageNumber === 1;
  const isLastPage = currentPageNumber === paginationRange.at(-1);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("handleInputChange");
    setSearchQuery(e.target.value);
  };

  const { handlePreload, handleNavigation } = useCoinDetailsPreloader();

  // Provides API for search term management and current page coins display.
  return {
    searchQuery,
    coinsForCurrentPage,
    totalItemsCount,
    currentPageNumber,
    isPreviousDisabled: isFirstPage,
    isNextDisabled: isLastPage,
    paginationRange,
    currentSymbol,
    setSearchQuery,
    handleInputChange,
    handleItemMouseEnter: handlePreload,
    handleNavigation,
    goToPreviousPage: onPrevious,
    goToNextPage: onNext,
    goToPage,
  };
};

export const TEXT_FIELD_SX = {
  "& .MuiInputLabel-root": { color: "#b2b2b2" },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": { borderColor: COLORS.WHITE, color: COLORS.WHITE },
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": {
      borderColor: COLORS.PRIMARY,
    },
  },
  "& .MuiOutlinedInput-root:hover": {
    "& > fieldset": {
      borderColor: COLORS.PRIMARY,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: COLORS.WHITE,
  },
  "& .MuiInputLabel-root.Mui-hover": {
    color: COLORS.WHITE,
  },
  input: { color: COLORS.WHITE },
};
