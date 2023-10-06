import { useEffect } from "react";
import {
  fetchUpdateAndReinitalizeCoinListCache,
  isCacheValid,
  storeCurrencyRatesInIndexedDB,
} from "../utils/cache.utils";
import {
  COINLISTS_TABLENAME,
  CURRENCYRATES_TABLENAME,
  CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
  GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
} from "../global/constants";
import Cookie from "js-cookie";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

export const useDataInitialization = (store, globalCacheVersion) => {
  useEffect(() => {
    const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

    // If we don't start off with the CoinLists (any page other than the CoinLists page) Preload the CoinLists data
    if (
      !Array.isArray(initialHundredCoins) ||
      initialHundredCoins.length === 0
    ) {
      console.log(
        "We didnt start with CoinLists data so we need to preload it.",
      );
      const cacheIsValid =
        isCacheValid(COINLISTS_TABLENAME) &&
        isCacheValid(CURRENCYRATES_TABLENAME);
      console.log("Is cache valid for preloading?", cacheIsValid);

      fetchUpdateAndReinitalizeCoinListCache(store, cacheIsValid);
    } else {
      console.log(
        "We start with CoinLists data. DON'T PRELOAD IT, just initalize the cache with this.",
      );

      store.dispatch(initializeCoinListCache());

      const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");
      if (
        globalCacheVersion != null &&
        globalCacheVersion !== clientGlobalCacheVersion
      ) {
        Cookie.set("globalCacheVersion", globalCacheVersion, {
          expires: GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
        });

        storeCurrencyRatesInIndexedDB(store.getState().currency.currencyRates);
      }
    }

    // Update Cookie for current currency
    Cookie.set("currentCurrency", store.getState().currency.currentCurrency, {
      expires: CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
    });
  }, [store, globalCacheVersion]);
};
