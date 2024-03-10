import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";

/**
 * Custom hook to handle route events.
 *
 * provided by the client cookie).
 */
const useRouteEvents = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Determine if the current page is a details page based on the pathname
  const onDetailsPage = pathname.startsWith("/coin/");

  useEffect(() => {
    // Reset state based on current page type when pathname changes
    if (onDetailsPage) {
      console.warn("ON COINDETAILS PAGE. RESETTING POPULAR COINS");
      dispatch(coinsActions.resetPopularCoins());
    } else {
      console.warn("ON POPULARCOINS PAGE. RESETTING COIN DETAILS");
      dispatch(coinsActions.resetSelectedCoinDetails());
    }
  }, [pathname, onDetailsPage, dispatch]); // React to changes in pathname and onDetailsPage
};

export default useRouteEvents;
