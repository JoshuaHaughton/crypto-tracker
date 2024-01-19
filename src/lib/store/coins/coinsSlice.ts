import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ALL_CURRENCIES,
  TCurrencyString,
} from "../../constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "../../../types/coinTypes";
import { isNull, isUndefined, mergeWith } from "lodash";

/**
 * Represents the state of the coins slice, including lists of popular and carousel coins,
 * as well as details of selected coins, both current and cached.
 */
export interface ICoinsState {
  // Popular Coins List
  popularCoins: ICoinOverview[];
  popularCoinsMap: Record<string, ICoinOverview>;
  cachedPopularCoinsByCurrency: Record<TCurrencyString, ICoinOverview[]>;

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
  /**
   * Cached popular coins by currency.
   *
   * - Will be storing a (modest) maximum of 2500 ICoinOverview objects, approximately 1.25MB (500 bytes per coin).
   * - This size is well within the general memory limits for Redux stores; desktop web applications usually
   *   operate well under 250-500 MB, while mobile applications should ideally stay below 50-150 MB.
   * - Efficient state management is key:
   *   1. Minimize unnecessary component re-renders with selective state subscriptions.
   *   2. Use normalized state shapes for more efficient updates.
   *   3. Optimize performance with memoized selectors for computed data.
   * - The goal is balancing large dataset management with responsive and smooth UI interactions.
   */
  cachedPopularCoinsByCurrency: {
    CAD: [],
    USD: [],
    GBP: [],
    AUD: [],
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
     * Sets the cached list of popular coins for a specific currency.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the list of coins and currency.
     */
    setCachedPopularCoins(
      state: ICoinsState,
      action: PayloadAction<SetCachedCoinListPayload>,
    ) {
      const { currency, coinList } = action.payload;

      state.cachedPopularCoinsByCurrency[currency] = coinList;
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
    /**
     * Adds or updates preloaded coin details across all currencies.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the coin details.
     */
    setPreloadedCoinDetailsAllCurrencies(
      state,
      action: PayloadAction<SetPreloadedCoinDetailsAllCurrenciesPayload>,
    ) {
      const { coinDetails } = action.payload;
      ALL_CURRENCIES.forEach((currency) => {
        state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
          coinDetails;
      });
    },
    /**
     * Adds or updates preloaded coin details for a specific currency.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the coin details and currency.
     */
    setPreloadedCoinDetailForCurrency(
      state,
      action: PayloadAction<SetPreloadedCoinDetailsPayload>,
    ) {
      const { coinDetails, currency } = action.payload;
      state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
        coinDetails;
    },
    /**
     * Sets or updates preloaded coin details for a specific currency.
     * If the coin details do not exist, they are set.
     * If they do exist, updates only null or undefined properties in existing details.
     * @param state - The current state of the coins slice.
     * @param action - The action payload containing the coin details and currency.
     */
    setOrUpdatePreloadedCoinDetails(
      state: ICoinsState,
      action: PayloadAction<SetPreloadedCoinDetailsPayload>,
    ) {
      const { coinDetails, currency } = action.payload;
      const existingDetails =
        state.preloadedCoinDetailsByCurrency[currency][coinDetails.id];

      if (!existingDetails) {
        // Set new coin details if they do not exist
        state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
          coinDetails;
      } else {
        // Custom merge function that only updates null or undefined properties
        const customizer = (
          objValue: ICoinDetails | undefined,
          srcValue: ICoinDetails,
        ) => {
          return isUndefined(objValue) || isNull(objValue)
            ? srcValue
            : objValue;
        };

        // Merge existing details with new details
        state.preloadedCoinDetailsByCurrency[currency][coinDetails.id] =
          mergeWith({}, existingDetails, coinDetails, customizer);
      }
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
