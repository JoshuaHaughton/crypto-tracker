import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import {
  InitialDataType,
  TInitialDataOptions,
} from "@/lib/types/apiRequestTypes";
import { isEmpty } from "lodash";
import { initializeCoinCache } from "@/thunks/initializeCoinCacheThunk";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";

/**
 * Custom hook to hydrate coin-related data on the initial load.
 * This hook is responsible for ensuring that the necessary coin data is preloaded based on the current route.
 * It differentiates between coin detail pages and other pages to fetch and preload relevant data.
 * It utilizes initial server-rendered data to minimize unnecessary API calls and rehydrations.
 *
 * @param {TInitialDataOptions} initialData - The initial data fetched server-side and passed for hydration.
 */
const useHydrateCoinDataOnLoad = (initialData: TInitialDataOptions) => {
  console.log("Hydrating coin data on load - Hook Start");

  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");
  const isOnCoinDetailsPage = symbol != null;

  useEffect(() => {
    console.warn("Hydration of coin data on load - Initialization Start");

    // Handling coin details page specific logic using initialData if on a coin details page.
    if (isOnCoinDetailsPage) {
      console.log("On Coin Details Page - Processing coin details data");

      // Check if the necessary coin details are already fully preloaded.
      const coinDetailsAreFullyPreloaded =
        initialData?.dataType === InitialDataType.COIN_DETAILS &&
        initialData.data.coinDetails?.priceChartDataset != null;

      if (coinDetailsAreFullyPreloaded) {
        console.warn("Using existing coin details data for preload.");
        dispatch(
          preloadCoinDetailsThunk({
            handleFetch: false,
            detailsToPreload: initialData.data.coinDetails,
          }),
        );
      } else {
        console.warn(
          "Coin details data not fully preloaded - Initiating fetch and preload.",
        );
        dispatch(
          preloadCoinDetailsThunk({
            handleFetch: true,
            symbolToFetch: symbol,
            selectCoinAfterFetch: true,
          }),
        );
      }
    } else {
      console.warn("Not on Coin Details Page");
    }

    // Check for the existence of the popular coins list from the initial data
    const popularCoinsExist =
      initialData?.dataType === InitialDataType.POPULAR_COINS &&
      !isEmpty(initialData?.data.popularCoins);

    // Log message to indicate the action taken based on popular coins existence
    console.warn(
      popularCoinsExist
        ? "Popular Coins exist - Initializing cache with existing data."
        : "Popular Coins not found - Fetching from API.",
    );

    // Initialize the coin cache based on the existence of popular coins
    if (popularCoinsExist) {
      // If popular coins exist in the initial data, use them directly to initialize the cache
      // Here we explicitly pass the popular coins and set handleFetch to false
      console.log(
        "Dispatching initializeCoinCache with provided popular coins data.",
      );
      dispatch(
        initializeCoinCache({
          handleFetch: false,
          popularCoins: initialData.data.popularCoins,
        }),
      );
    } else {
      // If popular coins do not exist, instruct the thunk to fetch them from the API
      console.log(
        "Dispatching initializeCoinCache to fetch popular coins data.",
      );
      dispatch(initializeCoinCache({ handleFetch: true }));
    }

    console.warn("Hydration of coin data on load - Initialization End");
  }, [dispatch, isOnCoinDetailsPage, symbol, initialData]); // Ensures hook only re-executes when necessary
};

export default useHydrateCoinDataOnLoad;
