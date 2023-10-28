import { useEffect } from "react";
import {
  startProgressBar,
  completeProgressBar,
  terminateProgressBar,
} from "../../utils/progressBar";
import { Router } from "next/router";
import { validateAndReinitializeCacheOnRouteChange } from "../../utils/cache.utils";

/**
 * Custom hook to handle route events.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} initialReduxState - The Initial Redux state.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be
 * provided by the client cookie).
 */
export const useRouteEvents = (
  store,
  initialReduxState,
  serverGlobalCacheVersion,
) => {
  useEffect(() => {
    const routeChangeCompleteHandler = () => {
      completeProgressBar();
      validateAndReinitializeCacheOnRouteChange(
        store,
        initialReduxState,
        serverGlobalCacheVersion,
      );
    };

    // Setup event listeners for route changes
    window.addEventListener("beforeunload", terminateProgressBar);

    Router.events.on("routeChangeStart", startProgressBar);
    Router.events.on("routeChangeError", completeProgressBar);
    Router.events.on("routeChangeComplete", routeChangeCompleteHandler);

    // Cleanup event listeners on unmount
    return () => {
      Router.events.off("routeChangeStart", startProgressBar);
      Router.events.off("routeChangeError", completeProgressBar);
      Router.events.off("routeChangeComplete", routeChangeCompleteHandler);
      window.removeEventListener("beforeunload", terminateProgressBar);
    };
  }, [store, initialReduxState]);
};
