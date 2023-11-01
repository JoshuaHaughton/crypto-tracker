import { coinsActions } from "../store/coins";
import { mapPopularCoinsToShallowDetailedAttributes } from "../utils/dataFormat.utils";

/**
 * Thunk to process popular coins and extract more detailed attributes for each coin.
 *
 * @returns {Promise<void>}
 */
export const getShallowDetailedCoins = createAsyncThunk(
  "coins/processPopularCoins",
  async (_, { dispatch, getState }) => {
    const state = getState();

    const popularCoinsList = state.coins.displayedPopularCoinsList;
    const currentCurrency = state.currency.currentCurrency;

    // Map the popular coins to get detailed attributes
    const detailedCoinsList =
      mapPopularCoinsToShallowDetailedAttributes(popularCoinsList);

    // Set this as showllow copy of CoinDetails so that coins can maintain consitent attributes in the COinDetails page. Without this, the API would return a different price than what's displayed for the PopularCOinsList
    dispatch(
      coinsActions.setCachedCoinDetailsForCurrency({
        currency: currentCurrency,
        coinData,
      }),
    );

    // At this point, you can either dispatch another action to store this detailedCoinsList in your Redux store
    // or perform any other operations as needed.
    // For now, we'll just return the detailedCoinsList
    return detailedCoinsList;
  },
);
