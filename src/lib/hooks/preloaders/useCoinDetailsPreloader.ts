import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { selectPreloadedCoinDetailsByCurrentCurrency } from "@/lib/store/coins/coinsSelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectCoinsBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";
import { MAX_PRELOADING_COUNT } from "@/lib/constants/globalConstants";

interface IUseCoinDetailsPreloaderState {
  handleMouseEnter: (symbol: string) => void;
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
  const [preloadQueue, setPreloadQueue] = useState<Set<string>>(new Set());

  /**
   * Initiates data fetching for a coin's details if it's not already being preloaded locally or globally,
   * and if the global preloading limit has not been exceeded.
   *
   * @param symbol - The symbol of the coin for which to initiate data fetching.
   */
  const initiateFetchIfNotPreloading = useCallback(
    (symbol: string) => {
      console.warn("initiateFetchIfNotPreloading triggered");
      const isGlobalPreloadLimitReached =
        Object.keys(coinsBeingPreloadedGlobally).length >= MAX_PRELOADING_COUNT;
      const isAlreadyPreloadingLocally = localPreloadingSymbols.get(symbol);
      const isBeingPreloadedGlobally = !!coinsBeingPreloadedGlobally[symbol];
      const existingPreloadedDetails = globalPreloadedCoinDetails?.[symbol];
      const coinDetailsAreFullyPreloaded =
        existingPreloadedDetails?.priceChartDataset != null;

      console.log(`Checking preload status for ${symbol}`);

      if (
        isAlreadyPreloadingLocally ||
        coinDetailsAreFullyPreloaded ||
        isBeingPreloadedGlobally
      ) {
        console.warn(
          `Preload attempt for '${symbol}' ignored: Coin is already ${
            coinDetailsAreFullyPreloaded ? "preloaded" : "being preloaded"
          }.`,
        );
        return;
      }

      if (isGlobalPreloadLimitReached) {
        // Add symbol to queue if global limit is reached and it's not already in the queue.
        if (!preloadQueue.has(symbol)) {
          setPreloadQueue((prevQueue) => {
            const updatedQueue = new Set(prevQueue).add(symbol);
            return updatedQueue;
          });
        }
      } else {
        // Initiate preloading if under global limit.
        dispatch(
          preloadCoinDetailsThunk({
            handleFetch: true,
            symbolToFetch: symbol,
          }),
        );
        setLocalPreloadingSymbols((prev) => new Map(prev).set(symbol, true));
      }

      console.log(`Initiating preload for ${symbol}`);
    },
    [
      dispatch,
      preloadQueue,
      coinsBeingPreloadedGlobally,
      localPreloadingSymbols,
      globalPreloadedCoinDetails,
    ],
  );

  // Effect to monitor global preloading changes and process queue accordingly.
  useEffect(() => {
    if (
      Object.keys(coinsBeingPreloadedGlobally).length < MAX_PRELOADING_COUNT &&
      preloadQueue.size > 0
    ) {
      // Create a copy of the queue and remove the first symbol
      const newQueue = new Set(preloadQueue);
      const nextSymbol = newQueue.values().next().value;

      // Update the queue state and initiate preloading if there's a symbol
      newQueue.delete(nextSymbol);
      setPreloadQueue(newQueue);
      if (nextSymbol) {
        console.log("QUEUE UP");
        initiateFetchIfNotPreloading(nextSymbol);
      }
    }
  }, [coinsBeingPreloadedGlobally, preloadQueue, initiateFetchIfNotPreloading]);

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
    (symbol: string) => {
      console.log(`Clicked on ${symbol}`);
      const existingPreloadedDetails = globalPreloadedCoinDetails?.[symbol];
      const coinDetailsAreFullyPreloaded =
        existingPreloadedDetails?.priceChartDataset != null;

      if (coinDetailsAreFullyPreloaded) {
        console.log(`Navigating to preloaded details for ${symbol}`);
        dispatch(
          coinsActions.setSelectedCoinDetails({
            coinDetails: existingPreloadedDetails,
          }),
        );
      } else {
        console.log(
          `Details aren't preloaded for ${symbol}, initiating preload`,
        );
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

  return { handleMouseEnter, handleClick, isLoadingLocally, isLoadingGlobally };
};

export default useCoinDetailsListPreloader;
