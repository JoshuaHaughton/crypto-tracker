import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

interface ICoinDetailsWithTimestamp {
  details: ICoinDetails | null;
  timestamp: number;
  isFetching: boolean;
}

type TCoinDetailsCache = Map<string, ICoinDetailsWithTimestamp>;

/**
 * A hook designed to preload coin details data.
 * This hook uses a server actions for preloading and setting coin details before navigation.
 * It manages hover and click events for preloading coin details to optimize performance and reduce unnecessary API calls.
 * @returns {IUseCoinDetailsPreloaderState} Object containing methods for preloading coin data and handling navigation.
 */
const useCoinDetailsPreloader = (): IUseCoinDetailsPreloaderState => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  // State to manage the navigation after fetching
  const [isFetchingComplete, setIsFetchingComplete] = useState<
    Map<TCurrencyString, Map<string, boolean>>
  >(new Map());

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

      let existingDetails = currencyCache.get(symbol);
      let currentTime = Date.now();
      console.log("preloadedCoinDetailsRef", preloadedCoinDetailsRef);
      console.log("currencyCache", currencyCache);
      console.log("existingDetails", existingDetails);
      console.log("currentTime", currentTime);

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
            // { useCache: false },
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
        } finally {
          let fetchingStatusMap =
            isFetchingComplete.get(currentCurrency) || new Map();
          fetchingStatusMap.set(symbol, true);
          setIsFetchingComplete(
            new Map(isFetchingComplete.set(currentCurrency, fetchingStatusMap)),
          );
        }
        return coinDetails;
      }

      // Return existing details if available.
      return existingDetails.details;
    },
    [router, currentCurrency, isFetchingComplete],
  );

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded, and waits for existing details to finish preloading if the process has already started
  const handleNavigation = useCallback(
    async (symbol: string) => {
      console.warn("HANDLING NAVIGATION FOR", symbol);
      const currencyCache =
        preloadedCoinDetailsRef.current.get(currentCurrency);
      const coinDetailsStatus = currencyCache?.get(symbol);

      // If details don't exist or fetching hasn't started, call handlePreload
      if (!coinDetailsStatus || coinDetailsStatus.isFetching === false) {
        await handlePreload(symbol);
      }

      // Check if fetching is completed
      const checkIfFetchingCompleted = () => {
        let updatedDetails = currencyCache?.get(symbol);
        if (updatedDetails && updatedDetails.isFetching === false) {
          const coinDetails = updatedDetails.details;
          if (coinDetails) {
            console.log("FETCHING COMPLETED FOR", symbol);
            dispatch(coinsActions.setSelectedCoinDetails({ coinDetails }));
            dispatch(
              coinsActions.setCachedSelectedCoinDetails({
                coinDetails,
                currency: currentCurrency,
              }),
            );
            router.push(`/coin/${symbol}`);
            currencyCache?.delete(symbol);
          }
        } else {
          setTimeout(checkIfFetchingCompleted, 100); // Check again after a delay
        }
      };

      // Only wait if currently fetching
      if (coinDetailsStatus && coinDetailsStatus.isFetching) {
        checkIfFetchingCompleted();
      } else if (coinDetailsStatus && !coinDetailsStatus.isFetching) {
        // Immediately navigate if details are available and not fetching
        const coinDetails = coinDetailsStatus.details;
        if (coinDetails) {
          dispatch(coinsActions.setSelectedCoinDetails({ coinDetails }));
          dispatch(
            coinsActions.setCachedSelectedCoinDetails({
              coinDetails,
              currency: currentCurrency,
            }),
          );
          router.push(`/coin/${symbol}`);
          currencyCache?.delete(symbol);
        }
      }
    },
    [dispatch, router, currentCurrency, handlePreload],
  );

  return { handlePreload, handleNavigation };
};

export default useCoinDetailsPreloader;
