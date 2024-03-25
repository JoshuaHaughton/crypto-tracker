import { useEffect, useRef } from "react";
import { useRouter } from "next-nprogress-bar";
import { useAppSelector } from "@/lib/store";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";

/**
 * A hook to refresh client-side data in a Next.js app when the currency changes.
 * It avoids a refresh on the initial mount for a smoother first-page load, but will
 * refresh the page on subsequent currency changes to ensure data consistency with
 * server-side settings. This maintains the SPA experience while updating content
 * relevant to the new currency without a full page reload.
 *
 * This should be tied to a state or context value representing the user's selected currency.
 */
const useCurrencySync = (): void => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  const currentCurrency = useAppSelector(selectCurrentCurrency);

  useEffect(() => {
    // Skip refresh on the initial mount to prevent reloading immediately after the first render.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Log a warning for debugging and transparency in development.
    console.warn("Currency changed, refreshing the page for updated content.");

    // Trigger a client-side refresh to update data based on the new currency.
    // This utilizes Next.js's router.refresh() to reload the current page's data
    // without a full page navigation, thus preserving the SPA experience.
    router.refresh();

    // This effect should only re-run when the currentCurrency changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCurrency, router]);
};

export default useCurrencySync;
