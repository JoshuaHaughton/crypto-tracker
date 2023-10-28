/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import {
  hydratePopularCoinsListFromAvailableSources,
  hydratePreloadedCoinsFromCacheIfAvailable,
  preloadDetailsForCurrentCoinIfOnDetailsPage,
  validateNecessaryCachesAndClearAllIfInvalid,
} from "../../utils/cache.utils";
import { useWebWorker } from "./useWebWorker";
import { useServiceWorker } from "./useServiceWorker";
import { useRouteEvents } from "./useRouteEvents";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} initialReduxState - The Initial Redux state.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided
 * by the client cookie).
 */
export const useAppInitialization = (
  store,
  initialReduxState,
  serverGlobalCacheVersion,
) => {
  console.log("useAppInitialization");

  useServiceWorker();
  useWebWorker(store.dispatch);
  useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);

  useEffect(() => {
    const initializeData = async () => {
      const areNecessaryCachesValid =
        await validateNecessaryCachesAndClearAllIfInvalid(
          serverGlobalCacheVersion,
        );
      hydratePopularCoinsListFromAvailableSources(
        store,
        areNecessaryCachesValid,
        serverGlobalCacheVersion,
      );
      await hydratePreloadedCoinsFromCacheIfAvailable(store.dispatch);
      preloadDetailsForCurrentCoinIfOnDetailsPage(store);
    };

    initializeData();
  }, []);
};
