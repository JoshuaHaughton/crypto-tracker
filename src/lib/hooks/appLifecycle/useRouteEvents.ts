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
    // Setup event listeners for route changes
    window.addEventListener("beforeunload", terminateProgressBar);
    Router.events.on("routeChangeStart", startProgressBar);
    Router.events.on("routeChangeError", completeProgressBar);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("beforeunload", terminateProgressBar);
      Router.events.off("routeChangeStart", startProgressBar);
      Router.events.off("routeChangeError", completeProgressBar);
    };
  }, []); // Empty dependency array ensures this runs only once on mount and unmount

  // This RouteHandler depends on updated state, so we should separate it's logic into a useEffect with
  // the appropriate dependencies
  useEffect(() => {
    const routeChangeCompleteHandler = () => {
      completeProgressBar();
      validateAndReinitializeCacheOnRouteChange(
        store,
        initialReduxState,
        serverGlobalCacheVersion,
      );
    };

    Router.events.on("routeChangeComplete", routeChangeCompleteHandler);

    // Cleanup event listeners on unmount
    return () => {
      Router.events.off("routeChangeComplete", routeChangeCompleteHandler);
    };
  }, [store, initialReduxState, serverGlobalCacheVersion]);
};
