import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { convertCurrency } from "../utils/currency.utils";
import { currencyActions } from "../store/currency";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";

export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { dispatch, getState }) => {
    console.log("updateCurrencyThunk active", payload);

    // First, update the currency state
    dispatch(currencyActions.changeCurrency(payload));

    const updatedCurrency = payload.currency;
    const updatedCurrencySymbol = SYMBOLS_BY_CURRENCIES[updatedCurrency];
    const state = getState();
    const coinListCoinsByCurrency = state.coins.coinListCoinsByCurrency;
    const initialHundredCoins = state.coins.displayedCoinListCoins;
    const initialCurrency = state.currency.initialCurrency;
    const initialRates = state.currency.currencyRates;

    let updatedCurrencyCoins;

    if (
      coinListCoinsByCurrency[updatedCurrency.toUpperCase()] &&
      coinListCoinsByCurrency[updatedCurrency.toUpperCase()].length > 0
    ) {
      console.log("CACHE USED for setNewCurrency", coinListCoinsByCurrency);
      updatedCurrencyCoins =
        coinListCoinsByCurrency[updatedCurrency.toUpperCase()];
    } else {
      console.log("CACHE, NOT used. existing cache:", coinListCoinsByCurrency);

      updatedCurrencyCoins = initialHundredCoins
        .map((coin, i) =>
          transformCurrency(
            coin,
            updatedCurrency.toUpperCase(),
            i,
            initialCurrency,
            initialRates,
          ),
        )
        .filter(Boolean);
    }

    const trendingCoins = updatedCurrencyCoins.slice(0, 10);

    dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: updatedCurrencyCoins,
        trendingCarouselCoins: trendingCoins,
        symbol: updatedCurrencySymbol,
      }),
    );
  },
);

function transformCurrency(
  coin,
  updatedCurrency,
  i,
  initialCurrency,
  initialRates,
) {
  return {
    ...coin,
    current_price: convertCurrency(
      coin.current_price,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
    market_cap: convertCurrency(
      coin.market_cap,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
    market_cap_rank: i + 1,
    total_volume: convertCurrency(
      coin.total_volume,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
    high_24h: convertCurrency(
      coin.high_24h,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
    low_24h: convertCurrency(
      coin.low_24h,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
    price_change_24h: convertCurrency(
      coin.price_change_24h,
      initialCurrency.toUpperCase(),
      updatedCurrency,
      initialRates,
    ),
  };
}
