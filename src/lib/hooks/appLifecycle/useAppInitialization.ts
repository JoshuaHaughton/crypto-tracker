/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import {
  hydrateCoinDataBasedOnRoute,
  validateNecessaryCachesAndClearAllIfInvalid,
} from "../../utils/cache.utils";
import { useWebWorker } from "./useWebWorker";
import { useServiceWorker } from "./useServiceWorker";
import { useRouteEvents } from "./useRouteEvents";
import { useFirebaseAuth } from "./useFirebaseAuth";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} router - The Next.js router.
 * @param {Object} initialReduxState - The Initial Redux state.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 */
export const useAppInitialization = (
  store,
  router,
  initialReduxState,
  serverGlobalCacheVersion,
) => {
  const hasInitialized = useRef(false);

  useServiceWorker();
  useWebWorker(store.dispatch);
  useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);

  useEffect(() => {
    if (!router.isReady || hasInitialized.current) return;

    const initializeData = async () => {
      const areNecessaryCachesValid =
        await validateNecessaryCachesAndClearAllIfInvalid(
          serverGlobalCacheVersion,
        );

      await hydrateCoinDataBasedOnRoute(
        store,
        router,
        areNecessaryCachesValid,
        serverGlobalCacheVersion,
      );
    };

    void initializeData();

    // Update the ref to prevent re-initialization on subsequent renders
    hasInitialized.current = true;
  }, [router.isReady]);
};
