import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { initializeCoinCache } from "@/thunks/initializeCoinCacheThunk";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";

/**
 * Custom hook to handle route events.
 *
 * provided by the client cookie).
 */
const useRouteChange = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isInitialRender = useRef(true);

  // Determine if the current page is a details page based on the pathname
  const onDetailsPage = pathname.startsWith("/coin/");

  useEffect(() => {
    // Skip execution on initial render, and proceed on subsequent renders
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Reset state based on current page type when pathname changes
    if (onDetailsPage) {
      console.warn("ON COINDETAILS PAGE");
      dispatch(preloadCoinDetailsThunk({ handleFetch: false }));
    } else {
      console.warn("ON POPULARCOINS PAGE");
      dispatch(
        initializeCoinCache({
          handleFetch: false,
        }),
      );
    }
  }, [pathname, onDetailsPage, dispatch]); // React to changes in pathname and onDetailsPage
};

export default useRouteChange;
