import { ICoinDetails } from "@/lib/types/coinTypes";
import { selectSelectedCoinDetails } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";
import usePopularCoinsPreloader from "@/lib/hooks/preloaders/usePopularCoinsPreloader";
import { useInitialPageData } from "@/lib/contexts/initialPageDataContext";
import { useAppSelector } from "@/lib/store";

interface ICoinDetailsState {
  currentSymbol: TCurrencySymbol;
  coinDetails: ICoinDetails;
  handleHomepagePreload: () => void;
  handleHomepageNavigation: () => void;
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
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const globalCoinDetails = useAppSelector(selectSelectedCoinDetails);
  const { selectedCoinDetails: initialCoinDetails } = useInitialPageData();
  const { handlePreload, handleNavigation } = usePopularCoinsPreloader();

  // Determining which coin details to use based on the global state or initial context.
  const coinDetails = !globalCoinDetails
    ? initialCoinDetails
    : globalCoinDetails;

  if (coinDetails == null) {
    throw new Error("Coin Details are null");
  }

  // Returning the relevant data for use in the component.
  return {
    currentSymbol,
    coinDetails,
    handleHomepagePreload: handlePreload,
    handleHomepageNavigation: handleNavigation,
  };
};

export default useCoinDetails;
