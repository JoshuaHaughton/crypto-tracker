"use client";

import { useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { usePageData } from "@/lib/contexts/pageContext";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { selectSelectedCoinDetails } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";

interface ICoinDetailsState {
  currentSymbol: TCurrencySymbol;
  coinDetails: ICoinDetails | undefined;
}

/**
 * A hook to encapsulate the logic for fetching and determining the coin details to be displayed.
 * It leverages both the global Redux state and the context specific to the page to find the appropriate
 * coin details to use. It also determines whether the details are fully preloaded.
 *
 * @returns {object} - An object containing the current symbol, the full coin details,
 * and a boolean indicating whether the details are fully preloaded.
 */
const useCoinDetails = (): ICoinDetailsState => {
  // Accessing current symbol and global coin details from the Redux store.
  const currentSymbol = useSelector(selectCurrentSymbol);
  const globalCoinDetails = useSelector(selectSelectedCoinDetails);

  // Accessing initial coin details from the page's context.
  const { selectedCoinDetails: initialCoinDetails } = usePageData();

  // Determining which coin details to use based on the global state or initial context.
  const coinDetails =
    !globalCoinDetails || isEmpty(globalCoinDetails)
      ? initialCoinDetails
      : globalCoinDetails;

  // Logging statements for debugging and verification.
  console.warn("INITIAL COINDETAILS ON PAGE", initialCoinDetails);
  console.warn("GLOBAL COINDETAILS ON PAGE", globalCoinDetails);
  console.warn("FINAL COINDETAILS ON PAGE", coinDetails);

  // Returning the relevant data for use in the component.
  return {
    currentSymbol,
    coinDetails,
  };
};

export default useCoinDetails;
