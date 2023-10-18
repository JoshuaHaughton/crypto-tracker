/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Cookie from "js-cookie";
import { useRouter } from "next/router";

/**
 * A custom hook to preload coin list data.
 *
 * @returns {Object} Handlers for link hover and link click events.
 */
export function usePopularCoinsListPreloader() {
  const router = useRouter();
  const isPopularCoinsListPreloaded = useSelector(
    (state) => state.appInfo.isPopularCoinsListPreloaded,
  );
  // The PopularCoinsList is automatically preloaded by the useAppInitialization hook
  const [loading, setLoading] = useState(!isPopularCoinsListPreloaded);
  const [waitingForPreload, setWaitingForPreload] = useState(false);

  const handleMouseEnter = () => {
    console.log("handleMouseEnter - usePopularCoinsListPreloader");
    // Prefetch the route for the coin list page
    router.prefetch(`/`);
  };

  // Handler for click event on a link pointing to the coin list page
  const handleLinkClick = (event) => {
    event.preventDefault();

    // If coin list data is preloaded, navigate to the coin list page immediately
    if (isPopularCoinsListPreloaded) {
      console.log("usePreloadedData - usePopularCoinsListPreloader");
      Cookie.set("usePreloadedData", "true");
      router.push("/");
    } else {
      console.log("start the preload process - usePopularCoinsListPreloader");
      // If coin list data is not preloaded, start the preload process
      if (!loading) {
        setLoading(true);
      }
      setWaitingForPreload(true);
    }
  };

  // Handle navigation once coin list preloading completes
  useEffect(() => {
    if (waitingForPreload && isPopularCoinsListPreloaded) {
      console.log(
        "Handle navigation once coin list preloading completes - usePopularCoinsListPreloader",
      );
      setWaitingForPreload(false);
      Cookie.set("usePreloadedData", "true");
      router.push("/");
    }
  }, [waitingForPreload, isPopularCoinsListPreloaded]);

  return { handleMouseEnter, handleLinkClick };
}
