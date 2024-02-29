import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectCoinsBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { pfetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";

interface IUseCoinDetailsPreloaderState {
  handleMouseEnter: (symbol: string) => void;
  handleClick: (symbol: string) => void;
}

/**
 * Custom hook to manage preloading of coin details for a list of coins.
 * This hook provides functions for handling mouse hover and click events which initiate the preloading of coin details.
 * It is designed to be used at the list component level to optimize performance by reducing redundant state updates and API calls.
 *
 * @returns {IUseCoinDetailsPreloaderState} - Object containing event handlers and loading state indicator.
 */
const useCoinDetailsPreloader = (): IUseCoinDetailsPreloaderState => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentCurrency = useAppSelector(selectCurrentCurrency);

  /**
   * Initiates data fetching for a coin's details if it's not already being preloaded locally or globally,
   * and if the global preloading limit has not been exceeded.
   *
   * @param symbol - The symbol of the coin for which to initiate data fetching.
   */
  const initiateFetchIfNotPreloading = useCallback(
    async (symbol: string) => {
      console.warn("initiateFetchIfNotPreloading triggered");
      router.prefetch(`/coin/${symbol}`);
      await pfetchAndFormatCoinDetailsData(symbol, currentCurrency, {
        useCache: true,
      });

      console.log(`Initiating preload for ${symbol}`);
    },
    [router, currentCurrency],
  );

  /**
   * Handler for mouse hover events on coin list items.
   * Triggers preloading of coin details for the hovered coin symbol.
   *
   * @param symbol - The symbol of the coin being hovered.
   */
  const handleMouseEnter = useCallback(
    (symbol: string) => {
      initiateFetchIfNotPreloading(symbol);
    },
    [initiateFetchIfNotPreloading],
  );

  /**
   * Handler for click events on coin list items.
   * Triggers navigation to the coin's detail page and preloads its details if they are not already loaded.
   *
   * @param symbol - The symbol of the coin being clicked.
   */
  const handleClick = useCallback(
    async (symbol: string) => {
      console.log(`Clicked on ${symbol}`);

      // Navigate regardless to simulate an SPA-like experience
      router.push(`/coin/${symbol}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, initiateFetchIfNotPreloading],
    // initiateFetchIfNotPreloading rerendering will account for anything we could have added
  );

  // Determine if there are any coins currently being preloaded
  // const isLoadingLocally = Object.keys(localPreloadingSymbols).length > 0;
  // const isLoadingGlobally = Object.keys(coinsBeingPreloadedGlobally).length > 0;

  return { handleMouseEnter, handleClick };
};

export default useCoinDetailsPreloader;
