import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ALL_CURRENCIES,
  TCurrencyString,
} from "../../constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "../../../types/coinTypes";
import { isNull, isUndefined, mergeWith } from "lodash";
import { mergeCoinDetailsWithCoinOverview } from "@/utils/dataFormat.utils";

/**
 * Represents the state of the coins slice, including lists of popular and carousel coins,
 * as well as details of selected coins, both current and cached.
 */
export interface ICoinsState {
  // Popular Coins List
  popularCoins: ICoinOverview[];
  popularCoinsMap: Record<string, ICoinOverview>;
  /**
   * Cached popular coin maps by currency.
   *
   * - Will be storing coin data as a map for each currency, keyed by the coin symbol.
   * - This structure is optimized for efficient lookups with O(1) time complexity, enhancing performance.
   * - Memory usage is optimized by eliminating redundant storage and data duplicity which is common
   *   with multiple data structures like arrays and maps for the same data set.
   *
   * - Considering an average of 2500 ICoinOverview objects (approximately 1.25MB (500 bytes per coin)), the storage requirement is well
   *   within the general memory limits for Redux stores. Desktop web applications usually operate
   *   under 250-500 MB, while mobile applications should ideally stay below 50-150 MB.
   *
   * - Object.values(map) can be used for iteration, making it efficient for both individual coin access
   *   and list operations, thus providing flexibility for various use-case scenarios.
   * - This approach aligns with modern practices for state management in Redux, focusing on
   *   performance optimization and effective memory usage.
   */
  cachedPopularCoinMapsByCurrency: Record<
    TCurrencyString,
    Record<string, ICoinOverview>
  >;

  // Carousel Coins
  carouselSymbolList: string[];

  // Selected Coin Details
  selectedCoinDetails: ICoinDetails | null;
  cachedSelectedCoinDetailsByCurrency: Record<
    TCurrencyString,
    ICoinDetails | null
  >;

  // Preloaded Coin Details
  preloadedCoinDetailsByCurrency: Record<
    TCurrencyString,
    Record<string, ICoinDetails>
  >;
}

/**
 * The initial state for the coins slice.
 */
export const initialCoinsState: ICoinsState = {
  popularCoins: [],
  popularCoinsMap: {},
  cachedPopularCoinMapsByCurrency: {
    CAD: {},
    USD: {},
    GBP: {},
    AUD: {},
  },

  carouselSymbolList: [],

  selectedCoinDetails: null,
  cachedSelectedCoinDetailsByCurrency: {
    CAD: null,
    USD: null,
    GBP: null,
    AUD: null,
  },
  preloadedCoinDetailsByCurrency: {
    CAD: {},
    USD: {},
    GBP: {},
    AUD: {},
  },
};

/**
 * Payload structure for setting the list of popular coins.
 */
export interface SetCoinListPayload {
  coinList: ICoinOverview[];
}

/**
 * Payload structure for setting the cached list of popular coins
 * based on a specific currency.
 */
export interface SetCachedCoinListPayload extends SetCoinListPayload {
  currency: TCurrencyString;
}

/**
 * Payload structure for setting the list of carousel coins.
 */
export interface SetCarouselSymbolsPayload {
  carouselSymbols: string[];
}

/**
 * Payload structure for setting the details of a selected coin.
 */
export interface SetCoinDetailsPayload {
  coinDetails: ICoinsState["selectedCoinDetails"] | null;
}

/**
 * Payload structure for setting the cached details of a selected coin
 * based on a specific currency.
 */
export interface SetCachedCoinDetailsPayload extends SetCoinDetailsPayload {
  currency: TCurrencyString;
}

/**
 * Payload structure for setting or updating preloaded coin details for all currencies.
 */
export interface SetPreloadedCoinDetailsAllCurrenciesPayload {
  coinDetails: ICoinDetails;
}

/**
 * Payload structure for setting or updating preloaded coin details for a specific currency.
 */
export interface SetPreloadedCoinDetailsPayload
  extends SetPreloadedCoinDetailsAllCurrenciesPayload {
  currency: TCurrencyString;
}

const coinsSlice = createSlice({
  name: "coins",
  initialState: initialCoinsState,
  reducers: {
    /**
     * Sets the list of popular coins.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the list of coins.
     */
    setPopularCoins(
      state: ICoinsState,
      action: PayloadAction<SetCoinListPayload>,
    ) {
      const { coinList } = action.payload;

      state.popularCoins = coinList;
      state.popularCoinsMap = coinList.reduce((acc, coin) => {
        acc[coin.symbol] = coin;
        return acc;
      }, {} as Record<string, ICoinOverview>);
    },

    /**
     * Sets the cached map of popular coins for a specific currency.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the list of coins and currency.
     */
    setCachedPopularCoinsMap(
      state: ICoinsState,
      action: PayloadAction<SetCachedCoinListPayload>,
    ) {
      const { currency, coinList } = action.payload;

      // Populate the map for quick individual coin data access
      state.cachedPopularCoinMapsByCurrency[currency] = coinList.reduce(
        (acc, coin) => {
          acc[coin.symbol] = coin;
          return acc;
        },
        {} as Record<string, ICoinOverview>,
      );
    },

    /**
     * Sets the list of carousel coins.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the list of coins.
     */
    setCarouselSymbolList(
      state: ICoinsState,
      action: PayloadAction<SetCarouselSymbolsPayload>,
    ) {
      const { carouselSymbols } = action.payload;

      state.carouselSymbolList = carouselSymbols;
    },

    /**
     * Sets the details of the selected coin.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the details of the coin.
     */
    setSelectedCoinDetails(
      state: ICoinsState,
      action: PayloadAction<SetCoinDetailsPayload>,
    ) {
      const { coinDetails } = action.payload;

      state.selectedCoinDetails = coinDetails;
    },
    /**
     * Sets the cached details of the selected coin for a specific currency.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the details of the coin and currency.
     */
    setCachedSelectedCoinDetails(
      state: ICoinsState,
      action: PayloadAction<SetCachedCoinDetailsPayload>,
    ) {
      const { currency, coinDetails } = action.payload;

      state.cachedSelectedCoinDetailsByCurrency[currency] = coinDetails;
    },
    // /**
    //  * Adds or updates preloaded coin details across all currencies.
    //  * @param state - The current state of the coins slice.
    //  * @param action - The action payload containing the coin details.
    //  */
    // setPreloadedCoinDetailsAllCurrencies(
    //   state,
    //   action: PayloadAction<SetPreloadedCoinDetailsAllCurrenciesPayload>,
    // ) {
    //   const { coinDetails } = action.payload;
    //   ALL_CURRENCIES.forEach((currency) => {
    //     state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
    //       coinDetails;
    //   });
    // },
    /**
     * Adds or updates preloaded coin details for a specific currency.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the coin details and currency.
     */
    setPreloadedCoinForCurrency(
      state,
      action: PayloadAction<SetPreloadedCoinDetailsPayload>,
    ) {
      const { coinDetails, currency } = action.payload;
      state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
        coinDetails;
    },
    /**
     * Preloads a coin's details for a specific currency using CoinOverview details from the cachedPopularCoinMapsByCurrency as a base.
     *
     * @remarks
     * This action leverages the cachedPopularCoinMapsByCurrency to provide base coin details (shallow details)
     * and merges them with additional coin details. It's designed for scenarios where complete coin details
     * need to be constructed or updated, starting with the basic overview available in the coin map.
     *
     * - The merge operation ensures that any existing additional details are retained unless they are null or undefined.
     * - This approach allows for the efficient construction of complete coin details while minimizing data duplication.
     * - The process is memory-efficient, as it avoids the need to store separate complete details for each coin when
     *   the base information can be reused from the existing map structure.
     *
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the coin symbol and additional details.
     */
    setPreloadedCoinDetailsUsingPopularCoinsBase(
      state: ICoinsState,
      action: PayloadAction<SetPreloadedCoinDetailsPayload>,
    ) {
      const { currency, coinDetails } = action.payload;
      const symbol = coinDetails.coinAttributes.symbol;

      // Retrieve shallow coin details from the map
      const shallowDetails =
        state.cachedPopularCoinMapsByCurrency[currency]?.[symbol];

      let mergedDetails: ICoinDetails;

      if (shallowDetails != null) {
        mergedDetails = mergeCoinDetailsWithCoinOverview(
          shallowDetails,
          coinDetails,
          currency,
        );
      } else {
        mergedDetails = coinDetails;
      }

      // Update the preloaded coin details in the state
      state.preloadedCoinDetailsByCurrency[currency][symbol] = mergedDetails;
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
