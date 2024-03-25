import { useCallback, useRef, useState } from "react";
import { useRouter } from "next13-progressbar";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { ICoinDetails } from "@/lib/types/coinTypes";
import {
  FETCH_INTERVAL_MS,
  TCurrencyString,
} from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";

interface IUseCoinDetailsPreloaderState {
  handlePreload: (symbol: string) => void;
  handleNavigation: (symbol: string) => void;
}

interface ICoinPreloadingDetails {
  details: ICoinDetails | null;
  timestamp: number;
  isFetching: boolean;
}

type TCoinDetailsCache = Map<string, ICoinPreloadingDetails>;

/**
 * A hook designed to preload coin details data.
 * This hook uses a server actions for preloading and setting coin details before navigation.
 * It manages hover and click events for preloading coin details to optimize performance and reduce unnecessary API calls.
 * @returns {IUseCoinDetailsPreloaderState} Object containing methods for preloading coin data and handling navigation.
 */
const useCoinDetailsPreloader = (): IUseCoinDetailsPreloaderState => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Ref to store coin details along with their fetch timestamp.
  const preloadedCoinDetailsRef = useRef<
    Map<TCurrencyString, TCoinDetailsCache>
  >(new Map());

  // Function to preload coin details data for a given coin symbol.
  const handlePreload = useCallback(
    async (symbol: string): Promise<ICoinDetails | null> => {
      // Ensure there is a Map for the current currency.
      let currencyCache = preloadedCoinDetailsRef.current.get(currentCurrency);
      if (!currencyCache) {
        currencyCache = new Map();
        preloadedCoinDetailsRef.current.set(currentCurrency, currencyCache);
      }

      const existingDetails = currencyCache.get(symbol);
      const currentTime = Date.now();
      console.log("preloadedCoinDetailsRef", preloadedCoinDetailsRef);
      console.log("existingDetails", existingDetails);

      // Check if details need to be fetched. Conditions for fetching:
      // 1. There are no existing details.
      // 2. The existing details are not currently being fetched, and are either missing or outdated.
      if (
        (!existingDetails?.details && !existingDetails?.isFetching) ||
        currentTime - existingDetails.timestamp > FETCH_INTERVAL_MS
      ) {
        // Set fetching state before starting the fetch
        currencyCache.set(symbol, {
          details: null,
          timestamp: Date.now(),
          isFetching: true,
        });

        console.log(`Initiating preload for ${symbol}`);
        router.prefetch(`/coin/${symbol}`); // Prefetch the page for a smoother navigation experience.

        let coinDetails;
        try {
          const coinDetailsResponse = await fetchAndFormatCoinDetailsData(
            symbol,
            currentCurrency,
            { updateCache: true },
          );

          coinDetails = coinDetailsResponse.coinDetails;

          // Update cache with new details and fetched state
          currencyCache.set(symbol, {
            details: coinDetails,
            timestamp: Date.now(),
            isFetching: false,
          });
          console.log(`Preload complete for ${symbol}`);
        } catch (error) {
          console.error(`Preload failed for ${symbol}`, error);
          currencyCache.set(symbol, {
            details: null,
            timestamp: Date.now(),
            isFetching: false,
          });
          coinDetails = null;
        }

        return coinDetails;
      }

      // Return existing details if available.
      return existingDetails.details;
    },
    [router, currentCurrency],
  );

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded, and waits for existing details to finish preloading if the process has already started
  const handleNavigation = useCallback(
    async (symbol: string) => {
      if (isNavigating) {
        console.log(
          "Already navigating. Waiting for existing navigation to complete",
        );
        return;
      }

      setIsNavigating(true);
      console.warn("HANDLING NAVIGATION FOR", symbol);
      const currencyCache =
        preloadedCoinDetailsRef.current.get(currentCurrency);
      const coinDetailsStatus = currencyCache?.get(symbol);

      // Check if fetching is completed
      const checkIfFetchingCompleted = () => {
        let updatedDetails = currencyCache?.get(symbol);
        if (updatedDetails && updatedDetails.isFetching === false) {
          const coinDetails = updatedDetails.details;
          if (coinDetails) {
            console.log("FETCHING COMPLETED FOR", symbol);
            dispatch(
              coinsActions.reinitializeSelectedCoinDetails({
                coinDetails,
              }),
            );
            currencyCache?.delete(symbol);
            router.push(`/coin/${symbol}`);
            setIsNavigating(false);
          }
        } else {
          setTimeout(checkIfFetchingCompleted, 100); // Check again after a delay
        }
      };

      // Only wait if currently fetching
      if (coinDetailsStatus && coinDetailsStatus.isFetching) {
        checkIfFetchingCompleted();
      } else {
        // Immediately navigate if details are available and not fetching
        currencyCache?.delete(symbol);
        router.push(`/coin/${symbol}`);
      }
    },
    [dispatch, router, isNavigating, currentCurrency],
  );

  return { handlePreload, handleNavigation };
};

export default useCoinDetailsPreloader;
