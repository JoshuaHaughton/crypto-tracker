import useWebWorker from "./useWebWorker";
import useBreakpointSync from "../ui/useBreakpointSync";

/**
 * Custom hook to handle data initialization on the initial load of the app. Should not be rerendered on page navigations
 */
export const useAppInitialization = () => {
  useWebWorker();
  useBreakpointSync();
};
