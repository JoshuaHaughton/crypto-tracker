import { useEffect } from "react";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../utils/currencyTransformerService";

export const useWebWorker = (dispatch) => {
  useEffect(() => {
    initializeCurrencyTransformerWorker(dispatch);

    return () => {
      terminateCurrencyTransformerWorker();
    };
  }, [dispatch]);
};
