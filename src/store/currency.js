import { createSlice } from "@reduxjs/toolkit";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";
import { withCommonActions } from "./commonActions";

export const initialCurrencyState = {
  initialCurrency: "CAD",
  currentCurrency: "CAD",
  symbol: "$",
  currencyRates: {},
};

// Currency Reducers
const currencySliceDefinition = {
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    changeCurrency(state, action) {
      console.log("changeCurrency", action);

      if (action.payload.currency) {
        state.currentCurrency = action.payload.currency;
        state.symbol = SYMBOLS_BY_CURRENCIES[action.payload.currency];
      }
    },
    updateRates(state, action) {
      console.log("updateRates", action);
      if (action.payload.currencyRates) {
        state.currencyRates = action.payload.currencyRates;
      }
    },
    updateSlice(state, action) {
      Object.keys(action.payload).forEach((key) => {
        if (!isEmpty(action.payload[key])) {
          state[key] = action.payload[key];
        }
      });
    },
  },
};

// Enhance the slice definition with common actions
const enhancedCurrencySliceDefinition = withCommonActions(
  currencySliceDefinition,
);

// Create the slice using the enhanced definition
const currencySlice = createSlice(enhancedCurrencySliceDefinition);

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
