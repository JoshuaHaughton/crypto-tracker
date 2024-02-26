import useWebWorker from "./useWebWorker";
import useBreakpointSync from "../ui/useBreakpointSync";
import useHydrateCoinDataOnLoad from "./useHydrateCoinDataOnLoad";
import { TInitialDataOptions } from "@/lib/types/apiRequestTypes";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = (initialData: TInitialDataOptions) => {
  useWebWorker();
  useBreakpointSync();
  useHydrateCoinDataOnLoad(initialData);
};
