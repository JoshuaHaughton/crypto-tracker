import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { selectPreloadedCoinDetailsByCurrentCurrencyAndId } from "@/lib/store/coins/coinsSelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectCoinsBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";

const MAX_PRELOADING_COINS = 3;

interface IUseCoinDetailsPreloaderReturn {
  handleHover: () => void;
  handleClick: () => void;
  isLoading: boolean;
}

/**
 * Custom hook to preload coin details on user interaction.
 * This hook handles preloading of coin details upon interactions like mouse hover and click.
 * It dispatches actions to fetch and preload coin details using Redux.
 *
 * - `isLocalPreloadingActive`: Local state to track if the fetching process has been initiated
 *   from this instance of the hook. This is crucial to prevent multiple fetches from the same
 *   component, as multiple hover/click events can occur consecutively. Local state provides a quick
 *   response to these rapid interactions, which might not be effectively tracked by global state due to its broader scope.
 *   This doesn't track the preloading process to the completion of the webworker logic - only to the completion of the preloading for
 *   the current currency.
 *
 * - `isBeingPreloadedGlobally`: Global state from Redux, indicating if the coin is currently
 *   being preloaded anywhere in the application. This ensures that we do not initiate a new
 *   preload if it's already in progress elsewhere, promoting efficient data fetching and state management.
 *   This will track the preloading process of the coin details to the completion of the webworker logic.
 *
 * @param symbol - The symbol of the coin for which details need to be preloaded.
 * @returns An object containing event handlers and loading state.
 */
const useCoinDetailsPreloader = (
  symbol: string,
): IUseCoinDetailsPreloaderReturn => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const existingPreloadedDetails = useAppSelector((state) =>
    selectPreloadedCoinDetailsByCurrentCurrencyAndId(state, symbol),
  );
  // Global state from Redux to track if the coin is being preloaded anywhere in the app.
  // Used to prevent duplicate preloading actions across components, and to maintain a uniform
  // state across the app.
  // This will track the preloading process of the coin details to the completion of the webworker logic.
  const coinsBeingPreloadedGlobally = useAppSelector(selectCoinsBeingPreloaded);
  const isBeingPreloadedGlobally = coinsBeingPreloadedGlobally[symbol] != null;

  // Local state to manage fetch initiation from this hook instance.
  // Prevents multiple fetches due to rapid user interactions like hover/click, & doesn't track the
  // preloading process to the completion of the webworker logic - only to the completion of preloading for the current currency.
  const [isLocalPreloadingActive, setLocalPreloadingActive] = useState(false);

  // Callback to initiate the fetching process
  const initiateFetchIfNotPreloading = useCallback(() => {
    console.warn("initiateFetchIfNotPreloading triggered");
    const exceedsPreloadLimit =
      Object.keys(coinsBeingPreloadedGlobally).length >= MAX_PRELOADING_COINS;
    const alreadyPreloaded = existingPreloadedDetails !== null;
    const alreadyLoading = isLocalPreloadingActive || isBeingPreloadedGlobally;

    if (exceedsPreloadLimit) {
      console.error(
        `Cannot preload '${symbol}': Exceeds maximum preloading limit.`,
      );
      return;
    }

    if (alreadyPreloaded || alreadyLoading) {
      const status = alreadyPreloaded
        ? "already preloaded"
        : "already being preloaded";
      console.warn(
        `Preload attempt for '${symbol}' ignored: Coin is ${status}.`,
      );
      return;
    }

    dispatch(
      preloadCoinDetailsThunk({ handleFetch: true, symbolToFetch: symbol }),
    );
    setLocalPreloadingActive(true);
  }, [
    dispatch,
    symbol,
    existingPreloadedDetails,
    isBeingPreloadedGlobally,
    coinsBeingPreloadedGlobally,
    isLocalPreloadingActive,
  ]);

  // Reset fetching state once the data is fetched and preloaded
  useEffect(() => {
    if (isLocalPreloadingActive && existingPreloadedDetails != null) {
      setLocalPreloadingActive(false);
    }
  }, [isLocalPreloadingActive, existingPreloadedDetails]);

  // Handler for mouse enter event
  const handleHover = useCallback(() => {
    console.log(`Mouse entered on coin ${symbol}`);
    initiateFetchIfNotPreloading();
  }, [symbol, initiateFetchIfNotPreloading]);

  // Handler for coin click event
  const handleClick = useCallback(() => {
    // Log the click action for debugging purposes
    console.log(`Clicked on coin ${symbol}`);
    const isAlreadyPreloaded =
      existingPreloadedDetails?.priceChartDataset != null;

    if (isAlreadyPreloaded) {
      // If coin details are preloaded, log this information and set the selected coin details
      console.warn(`Navigating to preloaded details for coin '${symbol}'.`);
      dispatch(
        coinsActions.setSelectedCoinDetails({
          coinDetails: existingPreloadedDetails,
        }),
      );
    } else if (!isBeingPreloadedGlobally) {
      // If the coin is not being preloaded yet, log this status and initiate preloading
      console.warn(`Coin '${symbol}' not preloaded yet. Initiating preload.`);
      initiateFetchIfNotPreloading();
    } else {
      // If the coin is currently being preloaded, log this status
      console.warn(
        `Coin '${symbol}' is currently being preloaded. Waiting for completion.`,
      );
    }

    router.push(`/coin/${symbol}`);
  }, [
    dispatch,
    initiateFetchIfNotPreloading,
    symbol,
    router,
    existingPreloadedDetails,
    isBeingPreloadedGlobally,
  ]);

  return {
    handleHover,
    handleClick,
    isLoading: isBeingPreloadedGlobally,
  };
};

export default useCoinDetailsPreloader;
