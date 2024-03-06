import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store";
import { fetchAndFormatPopularCoinsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";

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
  const currentCurrency = useAppSelector(selectCurrentCurrency);

  // Preloads coin details for a given symbol. It fetches and stores them if they are not already preloaded.
  const handlePreload = useCallback(async (): Promise<void> => {
    console.log(`Initiating preload for PopularCoins`);

    // Prefetch the page for smoother navigation experience
    router.prefetch(`/`);
    // Fetch coin details to cache the results with Nextjs for 30 seconds. If the HomePage is accessed that cache will be used.
    // Wee use 30 seconds so that we still have up to date data
    await fetchAndFormatPopularCoinsData(currentCurrency, {
      useCache: true,
    });
  }, [router, currentCurrency]);

  // Handles navigation to the coin detail page for a given symbol. Preloads details if they haven't been preloaded.
  const handleNavigation = useCallback(() => {
    router.push(`/`);
  }, [router]);

  return { handlePreload, handleNavigation };
};

export default usePopularCoinsPreloader;
