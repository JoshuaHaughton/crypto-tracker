import nProgress from "nprogress";
import { Router } from "next/router";
import { useEffect } from "react";

/**
 * Custom hook to handle route events and show/hide loading progress.
 *
 * @param {Function} onComplete - Callback function to run on route change completion.
 */
export const useRouteEvents = (onComplete) => {
  useEffect(() => {
    // Setup event listeners for route changes
    Router.events.on("routeChangeStart", nProgress.start);
    Router.events.on("routeChangeError", nProgress.done);
    Router.events.on("routeChangeComplete", nProgress.done);
    Router.events.on("routeChangeComplete", onComplete);

    // Cleanup event listeners on unmount
    return () => {
      Router.events.off("routeChangeStart", nProgress.start);
      Router.events.off("routeChangeError", nProgress.done);
      Router.events.off("routeChangeComplete", nProgress.done);
      Router.events.off("routeChangeComplete", onComplete);
    };
  }, [onComplete]);
};
