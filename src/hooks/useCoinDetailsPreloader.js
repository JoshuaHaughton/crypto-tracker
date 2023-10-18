import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import { coinsActions } from "../store/coins";
import { fetchAndPreloadCoin } from "../utils/cache.utils";
import { appInfoActions } from "../store/appInfo";

/**
 * A custom hook to preload coin details for a given coin ID.
 *
 * @param {string} id - The ID of the coin for which details need to be preloaded.
 * @returns {Object} Handlers for mouse enter and coin click events.
 */
export function useCoinDetailsPreloader(id) {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentCurrency = useSelector((state) => state.currency.currentCurrency);
  const currencyRates = useSelector((state) => state.currency.currencyRates);
  const coinCachedDetails = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency[currentCurrency][id]
  );
  const isPreloaded = coinCachedDetails != null;

  // Handler for mouse enter event on a coin
  const handleMouseEnter = async () => {
    console.log("hover", id);
    console.log("isPreloaded?", isPreloaded);

    // Check if the coin is already preloaded
    if (isPreloaded) {
      console.log(`Coin ${id} is already preloaded.`);
      return;
    }

    // Prefetch the route for the coin's details page
    router.prefetch(`/coin/${id}`);

    // Fetch and preload coin details
    await fetchAndPreloadCoin(id, currentCurrency, currencyRates, dispatch);
  };

  // Handler for click event on a coin
  const handleCoinClick = () => {
    // If coin details are preloaded, navigate to the coin's details page immediately
    if (isPreloaded) {
      console.log("PRELOADED DATA BEING USED", coinCachedDetails);
      dispatch(coinsActions.updateSelectedCoin({ coinDetails: coinCachedDetails }));
      Cookie.set("usePreloadedData", "true");
      router.push(`/coin/${id}`);
    } else {
      // If coin details are not preloaded, start the preload process
      fetchAndPreloadCoin(id, currentCurrency, currencyRates, dispatch);
      dispatch(appInfoActions.startProgressBar());
      console.log("Waiting for specific preload to complete...");
    }
  };

  // Use an effect to handle navigation once specific preloading completes
  useEffect(() => {
    if (isPreloaded) {
      dispatch(coinsActions.updateSelectedCoin({ coinDetails: coinCachedDetails }));
      Cookie.set("usePreloadedData", "true");
      console.log("ROUTER PUSH AFTER waiting for preloaded data", coinCachedDetails);
      router.push(`/coin/${id}`);
    }
  }, [isPreloaded]);

  return { handleMouseEnter, handleCoinClick };
}
