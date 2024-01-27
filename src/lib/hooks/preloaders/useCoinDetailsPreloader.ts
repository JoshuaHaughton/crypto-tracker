import { useState, useEffect, useCallback } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { isEmpty } from "lodash";
import { selectPreloadedCoinDetailsByCurrentCurrencyAndId } from "@/lib/store/coins/coinsSelectors";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { selectIsCoinBeingPreloaded } from "@/lib/store/appInfo/appInfoSelectors";
import { useFetchCoinDetailsDataQuery } from "@/lib/reduxApi/apiSlice";
import { TCurrencyString } from "@/lib/constants/globalConstants";
import { preloadCoinDetails } from "@/thunks/preloadCoinDetailsThunk";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";

/**
 * Custom hook to preload coin details on user interaction.
 * This hook integrates RTK Query for data fetching and Redux for state management.
 * It handles preloading of coin details upon user interactions like mouse hover and click.
 *
 * @param symbol - The symbol of the coin for which details need to be preloaded.
 * @param targetCurrency - The target currency for conversion rates.
 * @returns An object containing handlers for mouse enter and coin click events.
 */
export function useCoinDetailsPreloader(
  symbol: string,
  targetCurrency: TCurrencyString,
) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const existingPreloadedDetails = useAppSelector((state) =>
    selectPreloadedCoinDetailsByCurrentCurrencyAndId(state, symbol),
  );
  const isBeingPreloaded = useAppSelector((state) =>
    selectIsCoinBeingPreloaded(state, symbol),
  );
  // State to manage the initiation of the fetching process
  const [isFetchingInitiated, setIsFetchingInitiated] = useState(false);

  // RTK Query hook to fetch coin details. The 'skip' option is controlled by isFetchingInitiated and isBeingPreloaded flags.
  const {
    data: fetchedCoinDetailsData,
    isError,
    error,
  } = useFetchCoinDetailsDataQuery(
    { symbol, targetCurrency },
    { skip: !isFetchingInitiated || isBeingPreloaded },
  );

  // Callback to initiate the fetching process
  const initiateFetchIfNotPreloading = useCallback(() => {
    // Log and exit if the coin is already being preloaded
    if (isBeingPreloaded) {
      console.warn(
        `Attempted to preload coin '${symbol}' which is already being preloaded.`,
      );
      return;
    }
    // Trigger fetching and update the state to indicate the process has started
    if (!isFetchingInitiated) {
      dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: symbol }));
      setIsFetchingInitiated(true);
    }
  }, [dispatch, symbol, isBeingPreloaded, isFetchingInitiated]);

  // Effect for handling successful data fetching
  useEffect(() => {
    // On successful fetch, trigger the preloading process and reset the fetching initiation flag
    if (fetchedCoinDetailsData && isFetchingInitiated) {
      // Dispatch the preloadCoinDetails thunk with the fetched data.
      // Note: The thunk 'preloadCoinDetails' handles the removal of the coin from the
      // 'coinsBeingPreloaded' state upon completion. This ensures that the state is
      // updated accurately once the preloading process finishes, including any asynchronous
      // operations handled within the thunk, like web worker communication.
      dispatch(preloadCoinDetails(fetchedCoinDetailsData.coinDetails));
      setIsFetchingInitiated(false);
    }
  }, [dispatch, symbol, fetchedCoinDetailsData, isFetchingInitiated]);

  // Error handling effect
  useEffect(() => {
    // Log errors and remove the coin from the preloading state in case of fetch errors
    if (isError) {
      console.error("Error fetching coin details for symbol:", symbol, error);
      dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId: symbol }));
    }
  }, [isError, error, dispatch, symbol]);

  // Handler for mouse enter event
  const handleMouseEnter = useCallback(() => {
    console.log(`Mouse entered on coin ${symbol}`);
    initiateFetchIfNotPreloading();
  }, [symbol, initiateFetchIfNotPreloading]);

  // Handler for coin click event
  const handleCoinClick = useCallback(() => {
    // Log the click action for debugging purposes
    console.log(`Clicked on coin ${symbol}`);
    const isAlreadyPreloaded = !isEmpty(
      existingPreloadedDetails?.priceChartDataset,
    );

    if (isAlreadyPreloaded) {
      // If coin details are preloaded, log this information and set the selected coin details
      console.warn(`Navigating to preloaded details for coin '${symbol}'.`);
      dispatch(
        coinsActions.setSelectedCoinDetails({
          coinDetails: existingPreloadedDetails,
        }),
      );
      Cookie.set("usePreloadedData", "true");
    } else if (!isBeingPreloaded) {
      // If the coin is not being preloaded yet, log this status and initiate preloading
      console.warn(`Coin '${symbol}' not preloaded yet. Initiating preload.`);
      initiateFetchIfNotPreloading();
    } else {
      // If the coin is currently being preloaded, log this status
      console.warn(
        `Coin '${symbol}' is currently being preloaded. Waiting for completion.`,
      );
    }

    router.push(`/coin/${symbol}`);
  }, [
    dispatch,
    initiateFetchIfNotPreloading,
    symbol,
    router,
    existingPreloadedDetails,
    isBeingPreloaded,
  ]);

  return { handleMouseEnter, handleCoinClick };
}

// /**
//  * A custom hook to preload coin details for a given coin ID.
//  *
//  * @param {string} symbol - The symbol of the coin for which details need to be preloaded.
//  * @returns {Object} Handlers for mouse enter and coin click events.
//  */
// export function useCoinDetailsPreloader(symbol: string): {
//   handleMouseEnter: () => void;
//   handleCoinClick: () => void;
// } {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const existingPreloadedDetails = useAppSelector((state: TRootState) =>
//     selectPreloadedCoinDetailsByCurrentCurrencyAndId(state, symbol),
//   );
//   const isPreloaded = !isEmpty(existingPreloadedDetails?.priceChartDataset);
//   const isPreloadedRef = useRef(isPreloaded);

//   useEffect(() => {
//     isPreloadedRef.current = isPreloaded;
//   }, [isPreloaded]);

//   const [waitingForSpecificPreload, setWaitingForSpecificPreload] =
//     useState(false);

//   // Handler for mouse enter event on a coin
//   const handleMouseEnter = useCallback(async () => {
//     console.log("hover", symbol);
//     console.log("isPreloaded?", isPreloaded);

//     // Check if the coin is already preloaded
//     if (isPreloadedRef.current) {
//       console.log(`Coin ${symbol} is already preloaded.`);
//       return;
//     }

//     // Prefetch the route for the coin's details page
//     router.prefetch(`/coin/${symbol}`);

//     // Fetch and preload coin details
//     dispatch(
//       fetchAndPreloadCoinDetailsThunk({
//         coinId: symbol,
//       }),
//     );
//   }, [symbol, dispatch, router, isPreloadedRef]);

//   // Handler for click event on a coin
//   const handleCoinClick = useCallback(() => {
//     console.log("click");
//     console.log("isPreloadedRef", isPreloadedRef.current);
//     // If coin details are preloaded, navigate to the coin's details page immediately
//     if (isPreloadedRef.current && existingPreloadedDetails) {
//       console.log("PRELOADED DATA BEING USED", existingPreloadedDetails);
//       dispatch(
//         coinsActions.setSelectedCoinDetails({
//           coinDetails: existingPreloadedDetails,
//         }),
//       );
//       Cookie.set("usePreloadedData", "true");
//       router.push(`/coin/${symbol}`);
//     } else {
//       // If coin details are not preloaded, start the preload process
//       dispatch(
//         fetchAndPreloadCoinDetailsThunk({
//           coinId: symbol,
//         }),
//       );
//       router.prefetch(`/coin/${symbol}`);
//       setWaitingForSpecificPreload(true);
//       console.log("Waiting for specific preload to complete...");
//     }
//   }, [symbol, dispatch, router, existingPreloadedDetails, isPreloadedRef]);

//   // useEffect to handle navigation only after waiting for specific preload
//   useEffect(() => {
//     if (
//       waitingForSpecificPreload &&
//       isPreloadedRef.current &&
//       existingPreloadedDetails
//     ) {
//       console.log(
//         "ROUTER PUSH AFTER waiting for preloaded data to complete",
//         existingPreloadedDetails,
//       );
//       dispatch(
//         coinsActions.setSelectedCoinDetails({ coinDetails: existingPreloadedDetails }),
//       );
//       Cookie.set("usePreloadedData", "true");
//       router.push(`/coin/${symbol}`);
//       setWaitingForSpecificPreload(false);
//     }
//   }, [waitingForSpecificPreload, isPreloaded]);

//   return { handleMouseEnter, handleCoinClick };
// }
