import { configureStore, Store, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import currencyReducer from "./currency/currencySlice";
import coinsReducer from "./coins/coinsSlice";
import appInfoReducer from "./appInfo/appInfoSlice";
import mediaQueryReducer from "./mediaQuery/mediaQuerySlice";
import modalsReducer from "./modals/modalsSlice";

// Correctly combining all slice reducers into a single root reducer.
const rootReducer = combineReducers({
  currency: currencyReducer,
  coins: coinsReducer,
  appInfo: appInfoReducer,
  mediaQuery: mediaQueryReducer,
  modals: modalsReducer,
});

// Defining the TRootState type based on the rootReducer's returned state.
export type TRootState = ReturnType<typeof rootReducer>;
// Infer the types for AppStore and AppDispatch from the store itself
export type TAppStore = ReturnType<typeof makeStore>;
export type TAppDispatch = TAppStore["dispatch"];

/**
 * Creates and configures a new Redux store instance.
 *
 * Utilizes Redux Toolkit's `configureStore` to combine specified reducers into a root reducer and allows
 * initializing the store with preloaded state slices. This is particularly useful for server-side rendering (SSR),
 * ensuring a unique store instance for each request.
 *
 * The `initialStates` parameter provides the capability to initialize specific state slices with custom values.
 * This feature is beneficial for state hydration in SSR or initializing states from external sources like
 * localStorage. The provided states partially overwrite the default initial states defined in the reducers.
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
    preloadedState: initialStates,
  });

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
