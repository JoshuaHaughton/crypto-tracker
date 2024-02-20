import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";

/**
 * Defines the return type of the useCoinDetailsPreloader hook.
 */
interface IUseCoinDetailsPreloaderReturn {
  handleMouseEnter: (coinId: string) => void;
  handleCoinClick: (coinId: string) => void;
}

/**
 * Custom hook for preloading coin details upon user interactions such as mouse hover and click.
 * This hook does not depend on a specific coin symbol but provides callback functions
 * that accept a coinId to perform their operations. This allows the hook to be used
 * in a more dynamic context, such as mapping over a list of coins.
 *
 * Usage of this hook allows for decoupling the preloading logic from the component,
 * making the component cleaner and focused on presentation.
 *
 * @returns An object containing callback functions for mouse enter and click events.
 */
const useCoinDetailsPreloader = (): IUseCoinDetailsPreloaderReturn => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Handler for mouse hover event over a coin element.
  // Initiates preloading of coin details if the coin is not already being preloaded.
  const handleMouseEnter = useCallback(
    (coinId: string) => {
      console.log(`Mouse entered on coin ${coinId}`);
      // Dispatches a thunk to preload coin details.
      dispatch(
        preloadCoinDetailsThunk({ handleFetch: true, symbolToFetch: coinId }),
      );
    },
    [dispatch],
  );

  // Handler for click event on a coin element.
  // Initiates preloading of coin details and navigates to the coin's detail page upon success.
  const handleCoinClick = useCallback(
    (coinId: string) => {
      console.log(`Clicked on coin ${coinId}`);
      // Dispatches a thunk to preload coin details and then selects the coin after fetching.
      dispatch(
        preloadCoinDetailsThunk({
          handleFetch: true,
          symbolToFetch: coinId,
          selectCoinAfterFetch: true,
        }),
      );
      // Navigates to the coin details page once the action is dispatched.
      router.push(`/coin/${coinId}`);
    },
    [dispatch, router],
  );

  return {
    handleMouseEnter,
    handleCoinClick,
  };
};

export default useCoinDetailsPreloader;

// /**
//  * Custom hook to preload coin details on user interaction.
//  * This hook handles preloading of coin details upon interactions like mouse hover and click.
//  * It dispatches actions to fetch and preload coin details using Redux.
//  *
//  * - `isPreloadingDetailsForCurrentCurrency`: Local state to track if the fetching process has been initiated
//  *   from this instance of the hook. This is crucial to prevent multiple fetches from the same
//  *   component, as multiple hover/click events can occur consecutively. Local state provides a quick
//  *   response to these rapid interactions, which might not be effectively tracked by global state due to its broader scope.
//  *   This doesn't track the preloading process to the completion of the webworker logic - only to the completion of the preloading for
//  *   the current currency.
//  *
//  * - `isBeingPreloadedGlobally`: Global state from Redux, indicating if the coin is currently
//  *   being preloaded anywhere in the application. This ensures that we do not initiate a new
//  *   preload if it's already in progress elsewhere, promoting efficient data fetching and state management.
//  *   This will track the preloading process of the coin details to the completion of the webworker logic.
//  *
//  * @param symbol - The symbol of the coin for which details need to be preloaded.
//  * @returns An object containing event handlers and loading state.
//  */
// export function useCoinDetailsPreloader(
//   symbol: string,
// ): IUseCoinDetailsPreloaderReturn {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const existingPreloadedDetails = useAppSelector((state) =>
//     selectPreloadedCoinDetailsByCurrentCurrencyAndId(state, symbol),
//   );

//   // Global state from Redux to track if the coin is being preloaded anywhere in the app.
//   // Used to prevent duplicate preloading actions across components, and to maintain a uniform
//   // state across the app.
//   // This will track the preloading process of the coin details to the completion of the webworker logic.
//   const isBeingPreloadedGlobally = useAppSelector((state) =>
//     selectIsCoinBeingPreloaded(state, symbol),
//   );

//   // Local state to manage fetch initiation from this hook instance.
//   // Prevents multiple fetches due to rapid user interactions like hover/click, & doesn't track the
//   // preloading process to the completion of the webworker logic - only to the completion of preloading for the current currency.
//   const [
//     isPreloadingDetailsForCurrentCurrency,
//     setIsPreloadingDetailsForCurrentCurrency,
//   ] = useState(false);

//   // Callback to initiate the fetching process
//   const initiateFetchIfNotPreloading = useCallback(() => {
//     // Log and exit if the coin is already being preloaded
//     if (isBeingPreloadedGlobally || isPreloadingDetailsForCurrentCurrency) {
//       console.warn(
//         `Attempted to preload coin '${symbol}' which is already being preloaded.`,
//       );
//       return;
//     }
//     // Trigger fetching and update the state to indicate the process has started
//     dispatch(
//       preloadCoinDetailsThunk({
//         handleFetch: true,
//         symbolToFetch: symbol,
//       }),
//     );
//     setIsPreloadingDetailsForCurrentCurrency(true);
//   }, [
//     dispatch,
//     symbol,
//     isBeingPreloadedGlobally,
//     isPreloadingDetailsForCurrentCurrency,
//   ]);

//   // Reset fetching state once the data is fetched and preloaded
//   useEffect(() => {
//     if (
//       isPreloadingDetailsForCurrentCurrency &&
//       existingPreloadedDetails != null
//     ) {
//       setIsPreloadingDetailsForCurrentCurrency(false);
//     }
//   }, [isPreloadingDetailsForCurrentCurrency, existingPreloadedDetails]);

//   // Handler for mouse enter event
//   const handleMouseEnter = useCallback(() => {
//     console.log(`Mouse entered on coin ${symbol}`);
//     initiateFetchIfNotPreloading();
//   }, [symbol, initiateFetchIfNotPreloading]);

//   // Handler for coin click event
//   const handleCoinClick = useCallback(() => {
//     // Log the click action for debugging purposes
//     console.log(`Clicked on coin ${symbol}`);
//     const isAlreadyPreloaded =
//       existingPreloadedDetails?.priceChartDataset != null;

//     if (isAlreadyPreloaded) {
//       // If coin details are preloaded, log this information and set the selected coin details
//       console.warn(`Navigating to preloaded details for coin '${symbol}'.`);
//       dispatch(
//         coinsActions.setSelectedCoinDetails({
//           coinDetails: existingPreloadedDetails,
//         }),
//       );
//     } else if (!isBeingPreloadedGlobally) {
//       // If the coin is not being preloaded yet, log this status and initiate preloading
//       console.warn(`Coin '${symbol}' not preloaded yet. Initiating preload.`);
//       initiateFetchIfNotPreloading();
//     } else {
//       // If the coin is currently being preloaded, log this status
//       console.warn(
//         `Coin '${symbol}' is currently being preloaded. Waiting for completion.`,
//       );
//     }

//     router.push(`/coin/${symbol}`);
//   }, [
//     dispatch,
//     initiateFetchIfNotPreloading,
//     symbol,
//     router,
//     existingPreloadedDetails,
//     isBeingPreloadedGlobally,
//   ]);

//   return {
//     handleMouseEnter,
//     handleCoinClick,
//     isLoading: isBeingPreloadedGlobally,
//   };
// }

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

// export default useCoinDetailsPreloader;
