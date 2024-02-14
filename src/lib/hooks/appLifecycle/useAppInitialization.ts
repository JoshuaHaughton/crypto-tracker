import useWebWorker from "./useWebWorker";
import useBreakpointSync from "../ui/useBreakpointSync";
import useHydrateCoinDataOnLoad from "./useHydrateCoinDataOnLoad";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = () => {
  // useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);
  useWebWorker();
  useBreakpointSync();
  useHydrateCoinDataOnLoad();
};
