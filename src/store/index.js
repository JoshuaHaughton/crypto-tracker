import { isEmpty, merge } from "lodash";
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
  } else {
    console.log("getOrInitializeStore - initialState", initialState);
  }

  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  // If the store doesn't exist, create a new one
  if (!reduxStore) {
    console.warn("creating new redux store");
    reduxStore = initializeStore(initialState);
  } else if (
    initialState != null &&
    ((serverGlobalCacheVersion &&
      serverGlobalCacheVersion >= clientGlobalCacheVersion) ||
      !isEmpty(initialState.coins?.selectedCoinDetails))
  ) {
    // If we get fresh data from the server (new GCV) or we get selectedCoin details from the server
    // (Coin detail page without preloading), We should update the store.
    // NOTE - GCV doesn't reset on new selectedCoin Detail fetches
    if (serverGlobalCacheVersion == clientGlobalCacheVersion) {
      console.warn("cache used to update redux store");
    } else {
      console.warn("Updating redux store with fresh data from the server");
    }
    updateStoreData(reduxStore, initialState);
  } else {
    console.warn("Existing redux store used without updates.");
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
  if (typeof window !== "undefined") {
    console.log("initialStates - initializeStore", initialStates);
    console.log("initialState - initializeStore", initialState);
    console.log("preloadedState - initializeStore", preloadedState);
  }

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
