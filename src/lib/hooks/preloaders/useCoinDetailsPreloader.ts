/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { isEmpty } from "lodash";
import { fetchAndPreloadCoinDetailsThunk } from "@/thunks/fetchAndPreloadCoinDetailsThunk";
import { selectPreloadedCoinDetailsByCurrentCurrencyAndId } from "@/lib/store/coins/coinsSelectors";
import { TRootState, useAppDispatch, useAppSelector } from "@/lib/store";

/**
 * A custom hook to preload coin details for a given coin ID.
 *
 * @param {string} symbol - The symbol of the coin for which details need to be preloaded.
 * @returns {Object} Handlers for mouse enter and coin click events.
 */
export function useCoinDetailsPreloader(symbol: string): {
  handleMouseEnter: () => void;
  handleCoinClick: () => void;
} {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const coinCachedDetails = useAppSelector((state: TRootState) =>
    selectPreloadedCoinDetailsByCurrentCurrencyAndId(state, symbol),
  );
  const isPreloaded = !isEmpty(coinCachedDetails?.priceChartDataset);
  const isPreloadedRef = useRef(isPreloaded);

  useEffect(() => {
    isPreloadedRef.current = isPreloaded;
  }, [isPreloaded]);

  const [waitingForSpecificPreload, setWaitingForSpecificPreload] =
    useState(false);

  // Handler for mouse enter event on a coin
  const handleMouseEnter = async () => {
    console.log("hover", symbol);
    console.log("isPreloaded?", isPreloaded);

    // Check if the coin is already preloaded
    if (isPreloadedRef.current) {
      console.log(`Coin ${symbol} is already preloaded.`);
      return;
    }

    // Prefetch the route for the coin's details page
    router.prefetch(`/coin/${symbol}`);

    // Fetch and preload coin details
    dispatch(
      fetchAndPreloadCoinDetailsThunk({
        coinId: symbol,
      }),
    );
  };

  // Handler for click event on a coin
  const handleCoinClick = () => {
    console.log("click");
    console.log("isPreloadedRef", isPreloadedRef.current);
    // If coin details are preloaded, navigate to the coin's details page immediately
    if (isPreloadedRef.current && coinCachedDetails) {
      console.log("PRELOADED DATA BEING USED", coinCachedDetails);
      dispatch(
        coinsActions.setSelectedCoinDetails({ coinDetails: coinCachedDetails }),
      );
      Cookie.set("usePreloadedData", "true");
      router.push(`/coin/${symbol}`);
    } else {
      // If coin details are not preloaded, start the preload process
      dispatch(
        fetchAndPreloadCoinDetailsThunk({
          coinId: symbol,
        }),
      );
      router.prefetch(`/coin/${symbol}`);
      setWaitingForSpecificPreload(true);
      console.log("Waiting for specific preload to complete...");
    }
  };

  // useEffect to handle navigation only after waiting for specific preload
  useEffect(() => {
    if (
      waitingForSpecificPreload &&
      isPreloadedRef.current &&
      coinCachedDetails
    ) {
      console.log(
        "ROUTER PUSH AFTER waiting for preloaded data to complete",
        coinCachedDetails,
      );
      dispatch(
        coinsActions.setSelectedCoinDetails({ coinDetails: coinCachedDetails }),
      );
      Cookie.set("usePreloadedData", "true");
      router.push(`/coin/${symbol}`);
      setWaitingForSpecificPreload(false);
    }
  }, [waitingForSpecificPreload, isPreloaded]);

  return { handleMouseEnter, handleCoinClick };
}
