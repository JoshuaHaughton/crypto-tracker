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
  data: ICoinOverview[] | null; // Replace 'any' with the actual data type you expect
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
  const fetchStatusRef = useRef<IFetchStatus>({
    lastFetched: 0,
    isFetching: false,
    data: null,
  });

  const handlePreload = useCallback(async (): Promise<void> => {
    const now = new Date();
    const { lastFetched, isFetching, data } = fetchStatusRef.current;

    if (
      !isFetching &&
      (now.getTime() - lastFetched > FETCH_INTERVAL_MS || !data)
    ) {
      fetchStatusRef.current.isFetching = true;
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
        fetchStatusRef.current = {
          lastFetched: Date.now(),
          isFetching: false,
          data: newData?.popularCoins ??null,
        };
      } catch (error) {
        console.error("Error fetching popular coins data:", error);
        // Keep the old data if there is any, but update fetching status and time
        fetchStatusRef.current.isFetching = false;
        fetchStatusRef.current.lastFetched = Date.now();
      }

      // Update last fetch time
      lastFetchTimeRef.current = now;
    }
  }, [router, currentCurrency]);

  const handleNavigation = useCallback(() => {
    const navigate = () => {
      dispatch(
        coinsActions.setPopularCoins({ coinList: fetchStatusRef.current.data }),
      ); // Assuming this is the action to set popular coins
      dispatch(
        coinsActions.setCachedPopularCoinsMap({
          coinList: fetchStatusRef.current.data,
          currency: currentCurrency,
        }),
      ); // Assuming this is the action to set popular coins
      router.push("/");
    };

    const { isFetching } = fetchStatusRef.current;
    console.log("fetchStatusRef.current", fetchStatusRef.current);

    if (!isFetching) {
      console.log("navigating");
      navigate();
    } else {
      const interval = setInterval(() => {
        if (!fetchStatusRef.current.isFetching) {
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
