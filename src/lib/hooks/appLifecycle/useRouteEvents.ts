import { useEffect } from "react";
import { Router } from "next/router";
import {
  terminateProgressBar,
  startProgressBar,
  completeProgressBar,
} from "@/lib/utils/services/progressBar.utils";

/**
 * Custom hook to handle route events.
 *
 * provided by the client cookie).
 */
export const useRouteEvents = () => {
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
    };

    Router.events.on("routeChangeComplete", routeChangeCompleteHandler);

    // Cleanup event listeners on unmount
    return () => {
      Router.events.off("routeChangeComplete", routeChangeCompleteHandler);
    };
  }, []);
};
