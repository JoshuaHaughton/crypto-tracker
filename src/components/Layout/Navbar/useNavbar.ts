import { useState } from "react";
import { updateCurrency } from "@/thunks/updateCurrencyThunk";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { selectIsBreakpointMd } from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { updateCurrencyCookie } from "@/app/api/updateCookie/utils";
import usePopularCoinsPreloader from "@/lib/hooks/preloaders/usePopularCoinsPreloader";

interface IUseNavbarState {
  isNotificationBarOpen: boolean;
  currentCurrency: TCurrencyString;
  isMobileMenuOpen: boolean;
  isBreakpoint555: boolean;
  closeNotificationBar: () => void;
  handleCurrencyChange: (newCurrency: TCurrencyString) => Promise<void>;
  handleHomepagePreload: () => void;
  handleHomepageNavigation: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

/**
 * Custom hook to encapsulate the Navbar's stateful logic.
 *
 * Handles currency change events including updating cookies and Redux state based on the selected currency.
 * Utilizes React Redux hooks for state management and dispatch actions.
 *
 * @returns An object containing properties and functions required by the Navbar component.
 */
export const useNavbar = (): IUseNavbarState => {
  console.log("useNavbar render");
  const dispatch = useAppDispatch();
  const [isNotificationBarOpen, setIsNotificationBarOpen] =
    useState<boolean>(false);
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const isBreakpoint555 = useAppSelector(selectIsBreakpointMd);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { handlePreload, handleNavigation } = usePopularCoinsPreloader();

  /**
   * Handles currency changes initiated by user interactions in the UI.
   * Updates both the browser cookie and Redux state to reflect the new currency.
   *
   * @param e - The event triggered on currency selection change.
   */
  const handleCurrencyChange = async (newCurrency: TCurrencyString) => {
    if (!newCurrency) return; // Guard clause in case newCurrency is invalid

    setIsNotificationBarOpen(true); // Open the notification bar to indicate the currency change.

    try {
      // Update the currency cookie with the new currency value.
      // We update the server first so that there isn't a race condition when invalidating caches for the previous currency on the client,
      // since it uses data from the server to dictate what currency is correct.
      // useCurrencySync handles the router.refresh() call to do that invalidation in response to the clientside currency change from Redux
      await updateCurrencyCookie(newCurrency);

      // Update the Redux store with the new currency.
      await dispatch(updateCurrency({ updatedCurrency: newCurrency }));

      // Close the notification bar to indicate the currency change completion.
      setIsNotificationBarOpen(false);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  const closeNotificationBar = () => setIsNotificationBarOpen(false);

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return {
    isNotificationBarOpen,
    currentCurrency,
    isMobileMenuOpen,
    isBreakpoint555,
    handleCurrencyChange,
    handleHomepagePreload: handlePreload,
    handleHomepageNavigation: handleNavigation,
    closeNotificationBar,
    openMobileMenu,
    closeMobileMenu,
  };
};
