import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchAndFormatPopularCoinsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { FETCH_INTERVAL_MS } from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";

interface IUsePopularCoinsPreloaderState {
  handlePreload: () => void;
  handleNavigation: () => void;
}

/**
 * A hook designed to preload coin details data.
 * This hook uses a server actions for preloading and setting coin details before navigation.
 * It manages hover and click events for preloading coin details to optimize performance and reduce unnecessary API calls.
 * @returns {IUsePopularCoinsPreloaderState} Object containing methods for preloading coin data and handling navigation.
 */
const usePopularCoinsPreloader = (): IUsePopularCoinsPreloaderState => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const lastFetchTimeRef = useRef<Date | null>(null);

  const handlePreload = useCallback(async (): Promise<void> => {
    const now = new Date();
    if (
      !lastFetchTimeRef.current ||
      now.getTime() - lastFetchTimeRef.current.getTime() > FETCH_INTERVAL_MS
    ) {
      console.log(`Initiating preload for PopularCoins`);

      // Prefetch the page for a smoother navigation experience
      // router.prefetch(`/`);
      // Fetch coin details and store them, utilizing Next.js caching
      // await fetchAndFormatPopularCoinsData(currentCurrency, {
      //   useCache: false,
      // });

      // Update last fetch time
      lastFetchTimeRef.current = now;
    }
  }, [router, currentCurrency]);

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded.
  const handleNavigation = useCallback(() => {
    router.push(`/`);
    
    // dispatch(coinsActions.setSelectedCoinDetails({ coinDetails: null }));
  }, [dispatch, router]);

  return { handlePreload, handleNavigation };
};

export default usePopularCoinsPreloader;
