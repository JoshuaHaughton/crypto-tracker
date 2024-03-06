import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { debounce } from "lodash";

interface IUseCoinDetailsPreloaderState {
  handlePreload: (symbol: string) => void;
  handleNavigation: (symbol: string) => void;
}

interface IBatchedDetails {
  [symbol: string]: ICoinDetails | null;
}

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
  const preloadedCoinDetailsRef = useRef<Map<string, ICoinDetails>>(new Map());

  // Batch update for preloaded coin details in global store
  const updateGlobalPreloadedCoinDetails = useRef(
    debounce((updates: Map<string, ICoinDetails | null>) => {
      const batchedDetails = Array.from(
        updates.entries(),
      ).reduce<IBatchedDetails>((acc, [symbol, details]) => {
        if (details) acc[symbol] = details; // Accumulate only non-null details
        return acc;
      }, {} as IBatchedDetails);

      const filteredDetails = Object.values(batchedDetails).filter(
        (detail): detail is ICoinDetails => detail !== null,
      );

      if (filteredDetails.length) {
        dispatch(
          coinsActions.setPreloadedCoinsForMultipleCurrencies({
            coinDetailsArray: Object.values(filteredDetails),
            currency: currentCurrency,
          }),
        );
      }
    }, 300),
  );

  // Preloads coin details for a given symbol. It fetches and stores them if they are not already preloaded.
  const handlePreload = useCallback(
    async (symbol: string): Promise<ICoinDetails> => {
      // Check if coin details are already stored to avoid unnecessary API calls
      if (!preloadedCoinDetailsRef.current.has(symbol)) {
        console.warn("initiateFetchIfNotPreloading triggered");
        console.log(`Initiating preload for ${symbol}`);

        // Prefetch the page for smoother navigation experience
        router.prefetch(`/coin/${symbol}`);
        // Fetch coin details and update the ref with fetched data
        const coinDetailsResponse = await fetchAndFormatCoinDetailsData(
          symbol,
          currentCurrency,
          { useCache: true },
        );
        const coinDetails = coinDetailsResponse?.coinDetails ?? null; // Default to null if no data

        if (coinDetails != null) {
          preloadedCoinDetailsRef.current.set(symbol, coinDetails);
          updateGlobalPreloadedCoinDetails.current(
            preloadedCoinDetailsRef.current,
          );
          console.log(`preload complete for ${symbol}`);
          console.log(
            `state of preloadedCoinDetailsRef`,
            preloadedCoinDetailsRef,
          ); // Set fetched coin details in the ref);
          return coinDetails;
        }
      }

      return preloadedCoinDetailsRef.current.get(symbol)!;
    },
    [currentCurrency, router],
  );

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded.
  const handleNavigation = useCallback(
    async (symbol: string) => {
      router.push(`/coin/${symbol}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );

  return { handlePreload, handleNavigation };
};

export default useCoinDetailsPreloader;
