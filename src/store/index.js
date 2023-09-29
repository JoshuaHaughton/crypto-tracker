import { configureStore } from "@reduxjs/toolkit";
import currencyReducer from "./currency";
import coinsReducer from "./coins";
import appInfoReducer from "./appInfo";
import mediaQueryReducer from "./mediaQuery";

/**
 * Global reference to the Redux store.
 */
let reduxStore;

/**
 * Gets the existing Redux store or initializes a new one.
 *
 * @param {Object} [initialState] - The initial state for the Redux store.
 * @returns {Object} The existing or newly initialized Redux store.
 */
export const getOrInitializeStore = (initialState) => {
  // If it's on the server side, always create a new store
  if (typeof window === "undefined") {
    return initializeStore(initialState);
  }

  // If the store doesn't exist, create a new one
  if (!reduxStore) {
    reduxStore = initializeStore(initialState);
  } else if (initialState?.initialReduxState) {
    // If there's a new state from the server, overwrite the existing state
    reduxStore = initializeStore(initialState);
  }
  // If no initialReduxState is provided, just continue using the existing store
  // No need to do anything further

  return reduxStore;
};

/**
 * Initializes the Redux store.
 * @param {Object} [initialState={}] - The initial state for the Redux store.
 * @returns {Object} The initialized Redux store.
 */
export function initializeStore(initialState = {}) {
  console.log("store initialized from base");
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
