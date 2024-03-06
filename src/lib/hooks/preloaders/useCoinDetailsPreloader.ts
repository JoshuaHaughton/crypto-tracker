import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { FETCH_INTERVAL_MS } from "@/lib/constants/globalConstants";

interface IUseCoinDetailsPreloaderState {
  handlePreload: (symbol: string) => void;
  handleNavigation: (symbol: string) => void;
}

interface ICoinDetailsWithTimestamp {
  details: ICoinDetails;
  timestamp: number;
}

/**
 * A hook designed to preload coin details data.
 * This hook uses a server actions for preloading and setting coin details before navigation.
 * It manages hover and click events for preloading coin details to optimize performance and reduce unnecessary API calls.
 * @returns {IUseCoinDetailsPreloaderState} Object containing methods for preloading coin data and handling navigation.
 */
const useCoinDetailsPreloader = (): IUseCoinDetailsPreloaderState => {
  const router = useRouter();
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  // Ref to store coin details along with their fetch timestamp.
  const preloadedCoinDetailsRef = useRef<
    Map<string, ICoinDetailsWithTimestamp>
  >(new Map());

  // Function to preload coin details data for a given coin symbol.
  const handlePreload = useCallback(
    async (symbol: string): Promise<ICoinDetails> => {
      const existingDetails = preloadedCoinDetailsRef.current.get(symbol);
      let currentTime = Date.now();

      // Fetch new details if they don't exist or are stale.
      if (
        !existingDetails ||
        currentTime - existingDetails.timestamp > FETCH_INTERVAL_MS
      ) {
        console.log(`Initiating preload for ${symbol}`);
        router.prefetch(`/coin/${symbol}`); // Prefetch the page for a smoother navigation experience.

        const coinDetailsResponse = await fetchAndFormatCoinDetailsData(
          symbol,
          currentCurrency,
          { useCache: true },
        );
        currentTime = Date.now();
        const { coinDetails } = coinDetailsResponse;

        // Update the ref with new details and their fetch time if successfully fetched.
        preloadedCoinDetailsRef.current.set(symbol, {
          details: coinDetails,
          timestamp: currentTime,
        });
        console.log(`Preload complete for ${symbol}`);
        return coinDetails;
      }

      // Return existing details if available.
      return existingDetails.details;
    },
    [router, currentCurrency],
  );

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded.
  const handleNavigation = useCallback(
    async (symbol: string) => {
      router.push(`/coin/${symbol}`);
    },
    [router],
  );

  return { handlePreload, handleNavigation };
};

export default useCoinDetailsPreloader;
