// src/thunks/hydrateCoinDataBasedOnRoute.ts
import { ThunkAction } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { TRootState } from "@/lib/store";
import { fetchAndInitializeCoinsCache } from "@/utils/cache.utils";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { fetchAndPreloadCoinDetailsThunk } from "./fetchAndPreloadCoinDetailsThunk";
import { initializePopularCoinsAndDetailsCache } from "./initializeCoinCacheThunk";

/**
 * A Redux thunk for hydrating coin-related data based on the current route.
 * This function checks the current page, fetches necessary data,
 * and dispatches actions to update the Redux store.
 *
 * @param symbol - The symbol parameters of the current page.
 * @returns A thunk action that performs the hydration process.
 */
export const hydrateCoinDataBasedOnRoute =
  (symbol: string | null): ThunkAction<void, TRootState, unknown, any> =>
  async (dispatch, getState) => {
    console.log("hydrateCoinDataBasedOnRoute");

    const { coins, appInfo } = getState();

    const isOnCoinDetailsPage = symbol != null;
    const selectedCoinDetails = coins.selectedCoinDetails;
    const coinIsBeingPreloaded = isOnCoinDetailsPage
      ? appInfo.coinsBeingPreloaded[symbol] != null
      : null;
    const coinDetailsArePreloaded =
      selectedCoinDetails?.priceChartDataset != null;

    // Handling Coin Details Page
    if (isOnCoinDetailsPage) {
      console.log("isOnCoinDetailsPage - hydrateCoinDataBasedOnRoute");
      if (!coinDetailsArePreloaded && !coinIsBeingPreloaded) {
        console.warn(
          "CoinDetails don't exist on initial load of CoinDetails page!!!?",
        );
        console.warn("(Fetching)");
        dispatch(
          fetchAndPreloadCoinDetailsThunk({
            coinId: symbol,
            selectCoinAfterFetch: true,
          }),
        );
      }
    }

    // Handling Popular Coins
    const popularCoinsList = coins.popularCoins;
    const popularCoinsAlreadyExist =
      Array.isArray(popularCoinsList) && popularCoinsList.length > 0;

    if (!popularCoinsAlreadyExist) {
      console.log(
        "We didn't start with PopularCoinsLists data from the server so we need to fetch it from the cache or API.",
      );
      dispatch(fetchAndInitializeCoinsCache());
    } else {
      console.log(
        "We started with PopularCoinsLists data from the server. DON'T FETCH IT AGAIN, just initialize the cache with it.",
      );
      dispatch(initializePopularCoinsAndDetailsCache());
    }
  };
