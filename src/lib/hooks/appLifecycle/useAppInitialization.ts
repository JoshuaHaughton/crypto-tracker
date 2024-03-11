import useWebWorker from "./useWebWorker";
import useBreakpointSync from "../ui/useBreakpointSync";
import useRouteChange from "./useRouteChange";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";

/**
 * Custom hook to handle data initialization on the initial load of the app. Should not be rerendered on page navigations
 */
export const useAppInitialization = () => {
  console.log("useAppInitialization render");
  const router = useRouter();
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const isInitialMount = useRef(true);

  useWebWorker();
  useBreakpointSync();
  useRouteChange();

  // When we update the currency, we update the cookie on the server so that we can use that currency on subsequent page navigations.
  // We need to use router.refresh() here to update the Client so that it is aware of the cookie udpates, and doesn't use invalidated data
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark as mounted (no refresh on initial load)
      return;
    }

    console.warn("Currency changed, refreshing the page for updated content.");
    router.refresh();

    // Refresh only when currency changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCurrency]);
};
