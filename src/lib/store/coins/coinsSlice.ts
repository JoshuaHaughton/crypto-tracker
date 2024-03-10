import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ALL_CURRENCIES,
  TCurrencyString,
} from "../../constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "../../types/coinTypes";

/**
 * Represents the state of the coins slice, including lists of popular and carousel coins,
 * as well as details of selected coins, both current and cached.
 */
export interface ICoinsState {
  // Popular Coins List
  popularCoins: ICoinOverview[];
  // Used as an index for the carouselSymbolList
  popularCoinsMap: Record<string, ICoinOverview>;
  // Used to cache popular coins for other currencies for quick transitions
  cachedPopularCoinMapsByCurrency: Record<
    TCurrencyString,
    Record<string, ICoinOverview>
  >;

  // Carousel Coins
  carouselSymbolList: string[];

  // Selected Coin Details
  selectedCoinDetails: ICoinDetails | null;
  // Used to cache selected coin details for other currencies for quick transitions
  cachedSelectedCoinDetailsByCurrency: Record<
    TCurrencyString,
    ICoinDetails | null
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
      console.log(
        "map set",
        coinList.reduce((acc, coin) => {
          acc[coin.symbol] = coin;
          return acc;
        }, {} as Record<string, ICoinOverview>),
      );
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
     * Resets the popularCoins, popularCoinsMap, and popularCoinsCache for all currencies.
     * @param state - The current state of the coins slice.
     */
    resetPopularCoins(state: ICoinsState) {
      state.popularCoins = [];
      state.popularCoinsMap = {};

      ALL_CURRENCIES.forEach((currency) => {
        state.cachedPopularCoinMapsByCurrency[currency] = {};
      });
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
     * Resets the details and cache of the selected coin for all currencies.
     * @param state - The current state of the coins slice.
     */
    resetSelectedCoinDetails(state: ICoinsState) {
      state.selectedCoinDetails = null;

      ALL_CURRENCIES.forEach((currency) => {
        state.cachedSelectedCoinDetailsByCurrency[currency] = null;
      });
    },
  },
});

export const coinsActions = coinsSlice.actions;
export default coinsSlice.reducer;
