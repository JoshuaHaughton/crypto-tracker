import { useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { COOKIE_ACTIONS, E_COOKIE_NAMES } from "@/lib/types/cookieTypes";
import { manageCookies } from "@/lib/utils/server.utils";
import { updateCurrency } from "@/thunks/updateCurrencyThunk";
import { getTenYearsInFuture } from "@/lib/utils/global.utils";
import {
  selectCurrentCurrency,
  selectCurrentSymbol,
} from "@/lib/store/currency/currencySelectors";
import { selectIsBreakpoint555 } from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";

/**
 * Custom hook to encapsulate the Navbar's stateful logic.
 *
 * Handles currency change events including updating cookies and Redux state based on the selected currency.
 * Utilizes React Redux hooks for state management and dispatch actions.
 *
 * @returns An object containing properties and functions required by the Navbar component.
 */
export const useNavbar = () => {
  console.log("useNavbar render");
  const dispatch = useAppDispatch();
  const [openNotificationBar, setOpenNotificationBar] =
    useState<boolean>(false);
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const isBreakpoint555 = useAppSelector(selectIsBreakpoint555);

  /**
   * Handles currency changes initiated by user interactions in the UI.
   * Updates both the browser cookie and Redux state to reflect the new currency.
   *
   * @param e - The event triggered on currency selection change.
   */
  const handleCurrencyChange = async (e: SelectChangeEvent<unknown>) => {
    const newCurrency = (e.target.value as string)
      .split(",")[0]
      .toUpperCase() as TCurrencyString;
    if (!newCurrency) return; // Guard clause in case newCurrency is invalid

    setOpenNotificationBar(true); // Open the notification bar to indicate the currency change.

    try {
      // Update the currency cookie with the new currency value.

      // Update the Redux store with the new currency.
      await dispatch(updateCurrency({ updatedCurrency: newCurrency }));
      await manageCookies({
        actionType: COOKIE_ACTIONS.UPDATE,
        cookieName: E_COOKIE_NAMES.CURRENT_CURRENCY,
        cookieValue: newCurrency,
        options: { expires: getTenYearsInFuture() },
      });
      setOpenNotificationBar(false); // Close the notification bar to indicate the currency change completion.
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  return {
    openNotificationBar,
    currentCurrency,
    currentSymbol,
    isBreakpoint555,
    setOpenNotificationBar,
    handleCurrencyChange,
  };
};
