import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TCurrencySymbol,
  TCurrencyString,
  SYMBOLS_BY_CURRENCIES,
  INITIAL_CURRENCY,
} from "../../constants/globalConstants";
import { TCurrencyExchangeRates } from "@/lib/types/currencyTypes";

/**
 * Interface representing the state structure for the currency slice.
 * It includes the current currency, its corresponding symbol, and a record of currency rates.
 */
export interface ICurrencyState {
  currentCurrency: TCurrencyString;
  currentSymbol: TCurrencySymbol;
  currencyRates: TCurrencyExchangeRates | null;
}

/**
 * Initial state for the currency slice.
 * Sets the initial currency, its symbol, and initializes currency rates as null.
 */
export const initialCurrencyState: ICurrencyState = {
  currentCurrency: INITIAL_CURRENCY,
  currentSymbol: SYMBOLS_BY_CURRENCIES[INITIAL_CURRENCY],
  currencyRates: null,
};

/**
 * Payload structure for setting the displayed currency.
 */
interface SetDisplayedCurrencyPayload {
  currency: ICurrencyState["currentCurrency"];
}

/**
 * Payload structure for setting the currency rates.
 */
interface SetCurrencyRatesPayload {
  currencyRates: ICurrencyState["currencyRates"];
}

// Currency slice definition
const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    /**
     * Sets the displayed currency and updates the corresponding symbol.
     * @param state - The current state of the currency slice.
     * @param action - The action payload containing the new currency.
     */
    setDisplayedCurrency(
      state,
      action: PayloadAction<SetDisplayedCurrencyPayload>,
    ) {
      const { currency } = action.payload;

      state.currentCurrency = currency;
      state.currentSymbol = SYMBOLS_BY_CURRENCIES[currency];
    },
    /**
     * Sets the currency rates for different currencies.
     * @param state - The current state of the currency slice.
     * @param action - The action payload containing the new currency rates.
     */
    setCurrencyRates(state, action: PayloadAction<SetCurrencyRatesPayload>) {
      const { currencyRates } = action.payload;

      state.currencyRates = currencyRates;
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
