import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";
import {
  selectPopularCoins,
  selectSelectedCoinDetails,
} from "@/lib/store/coins/coinsSelectors";
import { selectIsCoinBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { initializeCoinCache } from "@/thunks/initializeCoinCacheThunk";
import { isEmpty } from "lodash";
import { ICoinDetails } from "@/types/coinTypes";

/**
 * Custom hook to hydrate coin-related data on the initial load based on the current route.
 * It checks if the user is on a coin details page and fetches necessary data accordingly.
 * It also ensures that the popular coins list is loaded and initializes the cache if needed.
 *
 */
const useHydrateCoinDataOnLoad = () => {
  console.log("useHydrateCoinDataOnLoad");
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");

  const popularCoins = useAppSelector(selectPopularCoins);
  const selectedCoinDetails = useAppSelector(selectSelectedCoinDetails);
  const coinDetailsBeingPreloaded = useAppSelector((state) =>
    selectIsCoinBeingPreloaded(state, symbol || ""),
  );

  useEffect(
    () => {
      console.log("useHydrateCoinDataOnLoad - Start");
      const isOnCoinDetailsPage = symbol != null;

      // Handle coin details loading for the coin details page
      if (isOnCoinDetailsPage) {
        console.log("useHydrateCoinDataOnLoad - On Coin Details Page");
        const coinDetailsAreFullyPreloaded =
          selectedCoinDetails?.priceChartDataset != null;

        const shouldFetchDetailsBeforePreload =
          !coinDetailsAreFullyPreloaded && !coinDetailsBeingPreloaded;

        const shouldPreloadWithExistingData =
          coinDetailsAreFullyPreloaded && !coinDetailsBeingPreloaded;

        // Initiate fetch and preload if coin details are not available or being preloaded
        if (shouldFetchDetailsBeforePreload) {
          console.warn(
            "Coin Details not fetched or preloaded - Initiating fetch and preload.",
          );
          dispatch(
            preloadCoinDetailsThunk({
              handleFetch: true,
              symbolToFetch: symbol,
              selectCoinAfterFetch: true,
            }),
          );
        }
        // Initiate preload using existing fetched data
        else if (shouldPreloadWithExistingData) {
          console.warn(
            "Coin Details exist but not preloaded - Using existing data for preload.",
          );
          dispatch(
            preloadCoinDetailsThunk({
              coinDetailsToPreload: selectedCoinDetails as ICoinDetails, // The coinDetailsAreFullyPreloaded check ensures that we are using the full coin details and not a shallow version
            }),
          );
        }
      }

      // Check for the existence of the popular coins list
      const popularCoinsExist = !isEmpty(popularCoins);

      // Determine the log based on the existence of popular coins
      const actionLogDescription = popularCoinsExist
        ? "Popular Coins exist - Initializing cache."
        : "Popular Coins not found - Fetching from API.";
      console.log(actionLogDescription);

      // Initialize the coins with the existing data if possible. If it doesn't exist, fetch before initialization
      dispatch(initializeCoinCache({ handleFetch: !popularCoinsExist }));

      console.log("hydrateCoinDataOnLoad - End");
    },
    // This should only run on the iniitial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};

export default useHydrateCoinDataOnLoad;
