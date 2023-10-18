/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import {
  hydrateCoinListFromAvailableSources,
  hydratePreloadedCoinsFromCacheIfAvailable,
  preloadDetailsForCurrentCoinIfOnDetailsPage,
  validateAndClearCache,
} from "../utils/cache.utils";
import { useWebWorker } from "./useWebWorker";
import { useServiceWorker } from "./useServiceWorker";
import { useRouteEvents } from "./useRouteEvents";

/**
 * Custom hook to handle data initialization.
 *
 * @param {Object} store - The Redux store.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 */
export const useAppInitialization = (store, serverGlobalCacheVersion) => {
  console.log("useAppInitialization");

  useServiceWorker();
  useWebWorker(store.dispatch);
  useRouteEvents(store, serverGlobalCacheVersion);

  useEffect(() => {
    const initializeData = async () => {
      const areNecessaryCachesValid = await validateAndClearCache(
        serverGlobalCacheVersion,
      );
      hydrateCoinListFromAvailableSources(
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
