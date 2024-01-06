import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import currencyReducer, {
  CurrencyState,
  initialCurrencyState,
} from "./currency";
import coinsReducer, { CoinsState, initialCoinsState } from "./coins";
import appInfoReducer, { AppInfoState, initialAppInfoState } from "./appInfo";
import mediaQueryReducer, {
  MediaQueryState,
  initialMediaQueryState,
} from "./mediaQuery";
import modalsReducer, { ModalsState, initialModalsState } from "./modals";
import { merge } from "lodash";
import Cookie from "js-cookie";

/**
 * Interface for the combined initial state of the Redux store.
 */
interface InitialStates {
  currency: CurrencyState;
  coins: CoinsState;
  appInfo: AppInfoState;
  mediaQuery: MediaQueryState;
  modals: ModalsState;
}

// Initial states for each reducer
const initialStates: InitialStates = {
  currency: initialCurrencyState,
  coins: initialCoinsState,
  appInfo: initialAppInfoState,
  mediaQuery: initialMediaQueryState,
  modals: initialModalsState,
};

/**
 * Initializes the Redux store with the given initial state.
 *
 * @param initialState - The initial state for the Redux store.
 * @returns The initialized Redux store.
 */
export const initializeStore = (
  initialState: Partial<InitialStates> = {},
): EnhancedStore => {
  const preloadedState = merge({}, initialStates, initialState);

  return configureStore({
    reducer: {
      currency: currencyReducer,
      coins: coinsReducer,
      appInfo: appInfoReducer,
      mediaQuery: mediaQueryReducer,
      modals: modalsReducer,
    },
    preloadedState,
  });
};

/**
 * Creates a new Redux store instance per request.
 *
 * @returns A new Redux store instance.
 */
export const makeStore = (): EnhancedStore => {
  return initializeStore();
};

// TypeScript types for RootState and AppDispatch
export type RootState = ReturnType<typeof initializeStore.getState>;
export type AppDispatch = ReturnType<typeof initializeStore.dispatch>;
