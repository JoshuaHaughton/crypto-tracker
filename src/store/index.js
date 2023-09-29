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
  // If it's on the server side or force reinitialize is set, always create a new store
  if (typeof window === "undefined" || initialState?.forceReinitialize) {
    console.log("initialize Store on server");
    return initializeStore(initialState);
  }

  // If the store doesn't exist, create a new one
  if (!reduxStore) {
    console.log("initialize Store in client");
    reduxStore = initializeStore(initialState);
  } else if (initialState && initialState !== reduxStore.getState()) {
    // If there's an initial state and it's different from the current state, merge them
    console.log("MEERGE Store in client");
    reduxStore = initializeStore({
      ...reduxStore.getState(),
      ...initialState,
    });
  }

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
