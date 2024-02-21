import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { selectPreloadedCoinDetailsByCurrentCurrency } from "@/lib/store/coins/coinsSelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectCoinsBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";

const MAX_PRELOADING_COINS = 3;

interface IUseCoinDetailsPreloaderState {
  handleHover: (symbol: string) => void;
  handleClick: (symbol: string) => void;
  isLoadingLocally: boolean;
  isLoadingGlobally: boolean;
}

/**
 * Custom hook to manage preloading of coin details for a list of coins.
 * This hook provides functions for handling mouse hover and click events which initiate the preloading of coin details.
 * It is designed to be used at the list component level to optimize performance by reducing redundant state updates and API calls.
 *
 * @returns {IUseCoinDetailsPreloaderState} - Object containing event handlers and loading state indicator.
 */
const useCoinDetailsListPreloader = (): IUseCoinDetailsPreloaderState => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const coinsBeingPreloadedGlobally = useAppSelector(selectCoinsBeingPreloaded);
  const globalPreloadedCoinDetails = useAppSelector(
    selectPreloadedCoinDetailsByCurrentCurrency,
  );

  // Local state tracking which symbols are currently being preloaded by this hook
  const [localPreloadingSymbols, setLocalPreloadingSymbols] = useState<
    Map<string, boolean>
  >(new Map());

  /**
   * Initiates data fetching for a coin's details if it's not already being preloaded locally or globally,
   * and if the global preloading limit has not been exceeded.
   *
   * @param symbol - The symbol of the coin for which to initiate data fetching.
   */
  const initiateFetchIfNotPreloading = useCallback(
    (symbol: string) => {
      const isGlobalPreloadLimitReached =
        Object.keys(coinsBeingPreloadedGlobally).length >= MAX_PRELOADING_COINS;
      const isAlreadyPreloadingLocally = localPreloadingSymbols.get(symbol);
      const isBeingPreloadedGlobally = !!coinsBeingPreloadedGlobally[symbol];
      const existingPreloadedDetails = globalPreloadedCoinDetails?.[symbol];

      if (
        !isGlobalPreloadLimitReached &&
        !isAlreadyPreloadingLocally &&
        !existingPreloadedDetails &&
        !isBeingPreloadedGlobally
      ) {
        dispatch(
          preloadCoinDetailsThunk({ handleFetch: true, symbolToFetch: symbol }),
        );
        setLocalPreloadingSymbols((prev) => new Map(prev).set(symbol, true));
      }
    },
    [
      dispatch,
      coinsBeingPreloadedGlobally,
      localPreloadingSymbols,
      globalPreloadedCoinDetails,
    ],
  );

  /**
   * Handler for mouse hover events on coin list items.
   * Triggers preloading of coin details for the hovered coin symbol.
   *
   * @param symbol - The symbol of the coin being hovered.
   */
  const handleHover = useCallback(
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
    (symbol: string) => {
      const existingPreloadedDetails = globalPreloadedCoinDetails?.[symbol];

      if (existingPreloadedDetails) {
        dispatch(
          coinsActions.setSelectedCoinDetails({
            coinDetails: existingPreloadedDetails,
          }),
        );
      } else {
        initiateFetchIfNotPreloading(symbol);
      }

      // Navigate regardless to simulate an SPA-like experience
      router.push(`/coin/${symbol}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, initiateFetchIfNotPreloading],
    // initiateFetchIfNotPreloading rerendering will account for anything we could have added
  );

  // Determine if there are any coins currently being preloaded
  const isLoadingLocally = Object.keys(localPreloadingSymbols).length > 0;
  const isLoadingGlobally = Object.keys(coinsBeingPreloadedGlobally).length > 0;

  return { handleHover, handleClick, isLoadingLocally, isLoadingGlobally };
};

export default useCoinDetailsListPreloader;
