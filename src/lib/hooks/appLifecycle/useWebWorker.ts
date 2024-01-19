import { useEffect } from "react";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../../../../public/webWorkers/currencyTransformer/manager";
import { Dispatch } from "@reduxjs/toolkit";

/**
 * Custom hook to manage the initialization and termination of the currency transformer web worker.
 *
 * This hook ensures that the web worker is initialized when a component mounts and
 * properly terminated when the component unmounts, managing the worker's lifecycle.
 *
 * @param dispatch - The Redux dispatch function used for dispatching actions from within the worker.
 */
export const useWebWorker = (dispatch: Dispatch): void => {
  useEffect(() => {
    // Initialize the web worker
    initializeCurrencyTransformerWorker(dispatch);

    // Cleanup function to terminate the web worker on unmount
    return () => {
      terminateCurrencyTransformerWorker();
    };
  }, [dispatch]);
};
