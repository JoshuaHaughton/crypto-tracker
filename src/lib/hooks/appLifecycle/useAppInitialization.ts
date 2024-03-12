import useWebWorker from "./useWebWorker";
import useBreakpointSync from "../ui/useBreakpointSync";
import useCurrencySync from "./useCurrencySync";

/**
 * Custom hook to handle data initialization on the initial load of the app. Should not be rerendered on page navigations
 */
export const useAppInitialization = () => {
  console.log("useAppInitialization render");

  useWebWorker();
  useBreakpointSync();
  useCurrencySync();
};
