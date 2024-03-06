import { Dispatch, SetStateAction, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { updateCurrency } from "@/thunks/updateCurrencyThunk";
import {
  selectCurrentCurrency,
  selectCurrentSymbol,
} from "@/lib/store/currency/currencySelectors";
import { selectIsBreakpoint555 } from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { updateCurrencyCookie } from "@/app/api/updateCookie/utils";
import usePopularCoinsPreloader from "@/lib/hooks/preloaders/usePopularCoinsPreloader";

interface IUseNavbarState {
  openNotificationBar: boolean;
  currentCurrency: TCurrencyString;
  currentSymbol: string;
  isBreakpoint555: boolean;
  setOpenNotificationBar: Dispatch<SetStateAction<boolean>>;
  handleCurrencyChange: (e: SelectChangeEvent<unknown>) => Promise<void>;
  handleHomepagePreload: () => void;
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
  const [openNotificationBar, setOpenNotificationBar] =
    useState<boolean>(false);
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const isBreakpoint555 = useAppSelector(selectIsBreakpoint555);

  const { handlePreload } = usePopularCoinsPreloader();

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
      // Update the Redux store with the new currency.
      await dispatch(updateCurrency({ updatedCurrency: newCurrency }));

      // Close the notification bar to indicate the currency change completion.
      setOpenNotificationBar(false);

      // Update the currency cookie with the new currency value.
      updateCurrencyCookie(newCurrency);
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
    handleHomepagePreload: handlePreload,
  };
};
