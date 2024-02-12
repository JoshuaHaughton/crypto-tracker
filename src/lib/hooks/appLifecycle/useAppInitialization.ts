import { useWebWorker } from "./useWebWorker";
import { useHydrateCoinDataOnLoad } from "./useHydrateCoinDataOnLoad";
import { useInitializeUFuzzy } from "./useInitializeUFuzzy";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = () => {
  // useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);
  useWebWorker();
  useInitializeUFuzzy();
  useHydrateCoinDataOnLoad();
};
