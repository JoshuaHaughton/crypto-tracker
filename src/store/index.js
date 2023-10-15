import { merge } from "lodash";
import { configureStore } from "@reduxjs/toolkit";
import currencyReducer, { initialCurrencyState } from "./currency";
import coinsReducer, { initialCoinsState } from "./coins";
import appInfoReducer, { initialAppInfoState } from "./appInfo";
import mediaQueryReducer, { initialMediaQueryState } from "./mediaQuery";
import { updateStoreData } from "../utils/store.utils";
import Cookie from "js-cookie";
import { deepMerge } from "../utils/global.utils";

/**
 * Global reference to the Redux store.
 */
let reduxStore;

const initialStates = {
  currency: initialCurrencyState,
  coins: initialCoinsState,
  appInfo: initialAppInfoState,
  mediaQuery: initialMediaQueryState,
};

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

  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  // If the store doesn't exist, create a new one
  if (!reduxStore) {
    console.warn("creating new redux store");
    reduxStore = initializeStore(initialState);
  } else if (
    serverGlobalCacheVersion &&
    serverGlobalCacheVersion > clientGlobalCacheVersion
  ) {
    // If the store does exist, and the data from the server is fresh,
    // update it with the new data from the server
    console.warn("clientGlobalCacheVersion !== serverGlobalCacheVersion");
    updateStoreData(reduxStore, initialState);
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

  // Set preloadedState using a loop
  const preloadedState = merge({}, initialStates, initialState);
  console.log("initialStates", initialStates);
  console.log("initialState", initialState);
  console.log("preloadedState", preloadedState);

  reduxStore = configureStore({
    reducer: {
      currency: currencyReducer,
      coins: coinsReducer,
      appInfo: appInfoReducer,
      mediaQuery: mediaQueryReducer,
    },
    preloadedState: preloadedState,
  });

  return reduxStore;
}
