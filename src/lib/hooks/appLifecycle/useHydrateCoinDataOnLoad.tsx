import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import {
  InitialDataType,
  TInitialPageDataOptions,
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
 * @param {TInitialPageDataOptions} initialData - The initial data fetched server-side and passed for hydration.
 */
const useHydrateCoinDataOnLoad = (initialData: TInitialPageDataOptions) => {
  console.log("Hydrating coin data on load - Hook Start");

  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");
  const isOnCoinDetailsPage = symbol != null;

  useEffect(() => {
    console.warn("Hydration of coin data on load - Initialization Start");

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
