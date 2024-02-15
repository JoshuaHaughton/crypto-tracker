import { TAppStore } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import { ICoinOverview, ICoinDetails } from "@/lib/types/coinTypes";
import { TCurrencyExchangeRates } from "@/lib/types/currencyTypes";
import { Dispatch } from "@reduxjs/toolkit";

interface IStoreInitializationOptions {
  popularCoins?: ICoinOverview[];
  coinDetails?: ICoinDetails;
  carouselSymbolList?: string[];
  currencyExchangeRates?: TCurrencyExchangeRates;
}

/**
 * Initializes the Redux store with provided data.
 * Depending on the data type provided, it dispatches specific actions to update the store's state.
 * This allows for a clean and maintainable way to handle different initialization scenarios.
 *
 * @param store - The Redux store instance to be initialized.
 * @param initOptions - An object containing various pieces of initial data to be set in the store.
 */
export function initializeStore(
  store: TAppStore,
  initOptions: IStoreInitializationOptions,
): void {
  // Destructure initOptions
  const {
    popularCoins,
    coinDetails,
    carouselSymbolList,
    currencyExchangeRates,
  } = initOptions;

  // Dispatch actions based on the presence of each option
  if (popularCoins) {
    store.dispatch(coinsActions.setPopularCoins({ coinList: popularCoins }));
  }

  if (coinDetails) {
    store.dispatch(coinsActions.setSelectedCoinDetails({ coinDetails }));
  }

  if (carouselSymbolList) {
    store.dispatch(
      coinsActions.setCarouselSymbolList({
        carouselSymbols: carouselSymbolList,
      }),
    );
  }

  if (currencyExchangeRates) {
    store.dispatch(
      currencyActions.setCurrencyRates({
        currencyRates: currencyExchangeRates,
      }),
    );
  }
}

interface IStoreInitializationOptions {
  popularCoins?: ICoinOverview[];
  coinDetails?: ICoinDetails;
  carouselSymbolList?: string[];
  currencyExchangeRates?: TCurrencyExchangeRates;
}

/**
 * Initializes the Redux store with provided data.
 * Depending on the data type provided, it dispatches specific actions to update the store's state.
 * This allows for a clean and maintainable way to handle different initialization scenarios.
 *
 * @param store - The Redux store instance to be initialized.
 * @param initOptions - An object containing various pieces of initial data to be set in the store
 */
export function initializeStoreDispatch(
  dispatch: Dispatch,
  initOptions: IStoreInitializationOptions,
): void {
  // Destructure initOptions
  const {
    popularCoins,
    coinDetails,
    carouselSymbolList,
    currencyExchangeRates,
  } = initOptions;

  console.log('boutta dispatch!')
  // Dispatch actions based on the presence of each option
  if (popularCoins) {
    dispatch(coinsActions.setPopularCoins({ coinList: popularCoins }));
  }

  if (coinDetails) {
    dispatch(coinsActions.setSelectedCoinDetails({ coinDetails }));
  }

  if (carouselSymbolList) {
    dispatch(
      coinsActions.setCarouselSymbolList({
        carouselSymbols: carouselSymbolList,
      }),
    );
  }

  if (currencyExchangeRates) {
    dispatch(
      currencyActions.setCurrencyRates({
        currencyRates: currencyExchangeRates,
      }),
    );
  }
}
