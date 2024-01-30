import { useWebWorker } from "./useWebWorker";
import { useAppDispatch } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { useHydrateCoinDataOnLoad } from "./useHydrateCoinDataOnLoad";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const symbol = searchParams.get("symbol");
  console.log("Symbol from URL:", symbol);

  useWebWorker(dispatch);
  // useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);

  // Initialize coin data from server on initial load depending on the current route
  useHydrateCoinDataOnLoad();
};
