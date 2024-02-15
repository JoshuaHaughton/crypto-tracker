import {
  configureStore,
  Store,
  combineReducers,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import currencyReducer from "./currency/currencySlice";
import coinsReducer from "./coins/coinsSlice";
import appInfoReducer from "./appInfo/appInfoSlice";
import mediaQueryReducer from "./mediaQuery/mediaQuerySlice";
import modalsReducer from "./modals/modalsSlice";
import searchReducer from "./search/searchSlice";
import loggerMiddleware from "./middleware/logger";

/**
 * The rootReducer, a combined reducer function created by combining individual slice reducers.
 * Each key in the object passed to `combineReducers` corresponds to a slice of the Redux state,
 * and the value is the reducer function managing that slice of state.
 */
const rootReducer = combineReducers({
  currency: currencyReducer,
  coins: coinsReducer,
  appInfo: appInfoReducer,
  mediaQuery: mediaQueryReducer,
  modals: modalsReducer,
  search: searchReducer,
});

/**
 * The type of the root state of the Redux store.
 */
export type TRootState = ReturnType<typeof rootReducer>;

/**
 * The type of the Redux store created by the `makeStore` function.
 */
export type TAppStore = ReturnType<typeof makeStore>;

/**
 * The dispatch type for the Redux store.
 */
export type TAppDispatch = TAppStore["dispatch"] &
  ThunkDispatch<TRootState, any, UnknownAction>;

/**
 * Creates and configures a new Redux store instance.
 *
 * Utilizes Redux Toolkit's `configureStore` to set up the store with a root reducer,
 * preloaded state slices, custom logging middleware, and enhancers. It is particularly useful for server-side rendering (SSR),
 * ensuring a unique store instance per request. The function also sets up hot module replacement for reducers
 * during development, improving the development experience.
 *
 * The `initialStates` parameter provides the capability to initialize specific state slices with custom values.
 * This feature is beneficial for state hydration in SSR or initializing states from external sources.
 * The provided states partially overwrite the default initial states defined in the reducers.
 *
 * @param initialStates An optional object with initial states for specific slices. Keys correspond to state slice names,
 *                      and values are the desired initial states for those slices, merging with reducer-defined defaults.
 * @returns A configured Redux store instance with combined reducers and potential preloaded states.
 */
export const makeStore = (
  initialStates: Partial<TRootState> = {},
): Store<TRootState> => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(loggerMiddleware),
    preloadedState: initialStates,
  });

  // HMR setup for Redux reducers in development mode.
  // This enables live-updating of reducers without full page reloads,
  // preserving the application state during development.

  // Check for non-production environment and HMR support.
  if (process.env.NODE_ENV !== "production" && (module as any).hot) {
    // Accept updates for the reducer module.
    (module as any).hot.accept("./index", () => {
      // Re-import the updated module containing the rootReducer.
      const newRootReducer = require("./index").default;

      // Replace the existing reducer with the new version.
      // This updates the reducer logic while keeping the Redux store state.
      store.replaceReducer(newRootReducer);
    });
  }

  return store;
};

/**
 * Custom useDispatch hook typed with TAppDispatch.
 * Ensures type safety when dispatching actions in the application.
 *
 * @returns The dispatch function for the Redux store.
 */
export const useAppDispatch = () => useDispatch<TAppDispatch>();

/**
 * Custom useSelector hook typed with TRootState.
 * Ensures type safety when selecting parts of the state from the Redux store.
 *
 * @type TypedUseSelectorHook<TRootState>
 */
export const useAppSelector: TypedUseSelectorHook<TRootState> = useSelector;
