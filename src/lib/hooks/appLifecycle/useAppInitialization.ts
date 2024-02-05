import { useWebWorker } from "./useWebWorker";
import { useAppDispatch } from "@/lib/store";
import { useHydrateCoinDataOnLoad } from "./useHydrateCoinDataOnLoad";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = () => {
  const dispatch = useAppDispatch();

  useWebWorker(dispatch);
  // useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);

  // Initialize coin data from server on initial load depending on the current route
  useHydrateCoinDataOnLoad();
};
