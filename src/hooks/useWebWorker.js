import { useEffect } from "react";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../../public/webWorkers/currencyTransformer/manager";

/**
 * Custom hook to manage web worker initialization and termination.
 *
 * @param {Function} dispatch - Redux dispatch function.
 */
export const useWebWorker = (dispatch) => {
  useEffect(() => {
    // Initialize web worker
    initializeCurrencyTransformerWorker(dispatch);

    // Terminate the web worker on unmount
    return () => {
      terminateCurrencyTransformerWorker();
    };
  }, [dispatch]);
};
