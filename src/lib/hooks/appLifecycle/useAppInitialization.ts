/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useWebWorker } from "./useWebWorker";
import { useAppDispatch } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { hydrateCoinDataBasedOnRoute } from "@/thunks/hydrateCoinDataBasedOnRoute";

/**
 * Custom hook to handle data initialization on the initial load of the app.
 */
export const useAppInitialization = () => {
  const hasInitialized = useRef(false);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const symbol = searchParams.get("symbol");
  console.log("Symbol from URL:", symbol);

  // useServiceWorker();
  useWebWorker(dispatch);
  // useRouteEvents(store, initialReduxState, serverGlobalCacheVersion);

  // Initialize coin data from server on initial load depending on the current route
  useEffect(() => {
    if (hasInitialized.current) return;

    const initializeData = async () => {
      dispatch(hydrateCoinDataBasedOnRoute(symbol));
    };

    void initializeData();

    // Update the ref to prevent re-initialization on subsequent renders
    hasInitialized.current = true;
  }, []);
};
