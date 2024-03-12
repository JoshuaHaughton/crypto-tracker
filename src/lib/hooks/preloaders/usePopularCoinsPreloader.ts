import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchAndFormatPopularCoinsData } from "@/lib/utils/server.utils";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { FETCH_INTERVAL_MS } from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { ICoinOverview } from "@/lib/types/coinTypes";

interface IUsePopularCoinsPreloaderState {
  handlePreload: () => void;
  handleNavigation: () => void;
}

interface IFetchStatus {
  lastFetched: number;
  isFetching: boolean;
  data: ICoinOverview[] | null;
}

type FetchStatusByCurrency = Map<string, IFetchStatus>;

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
  const fetchStatusRef = useRef<FetchStatusByCurrency>(new Map());

  const handlePreload = useCallback(async (): Promise<void> => {
    let status = fetchStatusRef.current.get(currentCurrency) || {
      lastFetched: 0,
      isFetching: false,
      data: null,
    };
    const now = new Date();

    if (
      !status.isFetching &&
      (now.getTime() - status.lastFetched > FETCH_INTERVAL_MS || !status.data)
    ) {
      fetchStatusRef.current.set(currentCurrency, {
        ...status,
        isFetching: true,
      });
      console.log(`Initiating preload for PopularCoins`);

      try {
        // Prefetch the page for a smoother navigation experience
        router.prefetch(`/`);
        // Fetch coin details and store them, utilizing Next.js caching
        const newData = await fetchAndFormatPopularCoinsData(
          currentCurrency,
          //   {
          //   useCache: true,
          // }
        );
        console.log("preload for popular coins complete", newData);
        fetchStatusRef.current.set(currentCurrency, {
          lastFetched: Date.now(),
          isFetching: false,
          data: newData?.popularCoins ?? null,
        });
      } catch (error) {
        console.error("Error fetching popular coins data:", error);
        // Keep the old data if there is any, but update fetching status and time
        fetchStatusRef.current.set(currentCurrency, {
          ...status,
          isFetching: false,
          lastFetched: Date.now(),
        });
      }

      // Update last fetch time
      lastFetchTimeRef.current = now;
    }
  }, [router, currentCurrency]);

  const handleNavigation = useCallback(() => {
    const navigate = () => {
      const status = fetchStatusRef.current.get(currentCurrency);
      const currentPopularCoins = status?.data;
      if (currentPopularCoins != null) {
        dispatch(
          coinsActions.reinitializePopularCoins({
            coinList: currentPopularCoins,
          }),
        );
      }
      router.push("/");
    };

    const status = fetchStatusRef.current.get(currentCurrency);
    if (status && !status.isFetching) {
      console.log("navigating");
      navigate();
    } else {
      const interval = setInterval(() => {
        const updateStatus = fetchStatusRef.current.get(currentCurrency);
        if (updateStatus && !updateStatus.isFetching) {
          console.log("waiting for fetch to complete");
          clearInterval(interval);
          navigate();
        }
      }, 100); // Check every 100 ms
    }
  }, [currentCurrency, dispatch, router]);

  return { handlePreload, handleNavigation };
};

export default usePopularCoinsPreloader;
