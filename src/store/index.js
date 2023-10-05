import { configureStore } from "@reduxjs/toolkit";
import currencyReducer, { initialCurrencyState } from "./currency";
import coinsReducer from "./coins";
import appInfoReducer from "./appInfo";
import mediaQueryReducer from "./mediaQuery";
import { updateStoreData } from "../utils/store.utils";
import Cookie from "js-cookie";

/**
 * Global reference to the Redux store.
 */
let reduxStore;

/**
 * Gets the existing Redux store or initializes a new one.
 *
 * @param {Object} [initialState] - The initial state for the Redux store.
 * @param {string} [serverGlobalCacheVersion] - The global cache version from the server.
 * @returns {Object} The existing or newly initialized Redux store.
 */
export const getOrInitializeStore = (
  initialState,
  serverGlobalCacheVersion,
) => {
  // If it's on the server side, always create a new store
  if (typeof window === "undefined") {
    return initializeStore(initialState);
  }

  // If the store doesn't exist, create a new one
  if (!reduxStore) {
    reduxStore = initializeStore(initialState);
  } else {
    const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

    if (clientGlobalCacheVersion === serverGlobalCacheVersion) {
      // If the global cache version has not changed, update the store but preserve the current currency
      const currentClientCurrency =
        Cookie.get("currentCurrency") || initialCurrencyState.currentCurrency;
      updateStoreData(reduxStore, {
        currency: {
          ...initialState.currency,
          currentCurrency: currentClientCurrency,
        },
      });
      reduxStore = initializeStore({
        ...initialState,
        currency: {
          ...initialState.currency,
          currentCurrency: currentClientCurrency,
        },
      });
    } else {
      // If we get a new globalCacheVersion but a redux store exists, update it with the new data.
      updateStoreData(reduxStore, initialState);
    }
  }

  return reduxStore;
};

/**
 * Initializes the Redux store.
 * @param {Object} [initialState={}] - The initial state for the Redux store.
 * @returns {Object} The initialized Redux store.
 */
export function initializeStore(initialState = {}) {
  console.log("initializeStore");
  reduxStore = configureStore({
    reducer: {
      currency: currencyReducer,
      coins: coinsReducer,
      appInfo: appInfoReducer,
      mediaQuery: mediaQueryReducer,
    },
    preloadedState: initialState,
  });

  return reduxStore;
}
