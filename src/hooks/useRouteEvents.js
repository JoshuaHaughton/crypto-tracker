import { useEffect } from "react";
import {
  startProgressBar,
  completeProgressBar,
  terminateProgressBar,
} from "../utils/progressBar";
import { Router } from "next/router";

/**
 * Custom hook to handle route events and show/hide/loading progress.
 *
 * @param {Function} onComplete - Callback function to run on route change completion.
 */
export const useRouteEvents = (onComplete) => {
  useEffect(() => {
    const routeChangeCompleteHandler = () => {
      completeProgressBar();
      onComplete();
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
  }, [onComplete]);
};
