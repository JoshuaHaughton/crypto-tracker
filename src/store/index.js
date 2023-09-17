import { configureStore } from "@reduxjs/toolkit";
import currencyReducer from "./currency";
import coinsReducer from "./coins";
import appInfoReducer from "./appInfo";
import mediaQueryReducer from "./mediaQuery";

/**
 * Global reference to the Redux store.
 */
let reduxStore;

export const getOrInitializeStore = (initialState) => {
  // Always make a new store if server, otherwise state is shared between requests
  if (typeof window === "undefined") {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!reduxStore) {
    reduxStore = initializeStore(initialState);
  }

  return reduxStore;
};

/**
 * Initializes the Redux store.
 * @param {Object} [initialState={}] - The initial state for the Redux store.
 * @returns {Object} The initialized Redux store.
 */
function initializeStore(initialState = {}) {
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
