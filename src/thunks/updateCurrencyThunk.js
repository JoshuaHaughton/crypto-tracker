import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";

/**
 * Thunk to update currency.
 * Uses a web worker to perform the currency transformation for a list of coins.
 * After receiving the transformed data from the web worker, dispatches the results to the Redux store.
 */
export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { dispatch, getState }) => {
    console.log("updateCurrencyThunk active", payload);

    const { currency: updatedCurrency } = payload;
    const state = getState();

    const {
      coins: {
        displayedCoinListCoins,
        coinListCoinsByCurrency,
        selectedCoinDetails,
        cachedCoinDetailsByCurrency,
      },
      currency: { currentCurrency, currencyRates: initialRates },
    } = state;

    // handle selected coin details transformations if needed. We can prioritize these since if they exist,
    // we aren't on the page with coin list coins anyways
    if (Object.keys(selectedCoinDetails).length > 0) {
      if (
        cachedCoinDetailsByCurrency[updatedCurrency][
          selectedCoinDetails.coinInfo.symbol.toUpperCase()
        ]
      ) {
        console.log("CACHE USED - COIN DETAILS");
        // Dispatch the cached data
        dispatch(
          coinsActions.updateSelectedCoin({
            coinDetails:
              cachedCoinDetailsByCurrency[updatedCurrency][
                selectedCoinDetails.coinInfo.symbol.toUpperCase()
              ],
          }),
        );

        // Update the currency state after all coins have been updated
        dispatch(currencyActions.changeCurrency(payload));
      } else {
        // need to make sure we actually update the currency after ( dispatch(currencyActions.changeCurrency({ currency: toCurrency }));)



        

        // CoinDetails Cache doesn't exist
        console.log("CACHE NOT USED - COIN DETAILS");
        // Only transform the requested currency first to save time. Then, we cache the rest
        postMessageToCurrencyTransformerWorker({
          type: "transformCoinDetailsCurrency",
          data: {
            coinToTransform: selectedCoinDetails,
            fromCurrency: currentCurrency.toUpperCase(),
            toCurrency: updatedCurrency.toUpperCase(),
            currencyRates: initialRates,
          },
        });
        // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
        postMessageToCurrencyTransformerWorker({
          type: "transformAllCoinDetailsCurrencies",
          data: {
            coinToTransform: displayedCoinListCoins,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates: initialRates,
            // Only transform the ones that haven't been transformed yet
            currenciesToExclude: [
              updatedCurrency.toUpperCase(),
              currentCurrency.toUpperCase(),
            ],
          },
        });
      }
    }

    // Coinlist Cache exists
    if (coinListCoinsByCurrency[updatedCurrency].length > 0) {
      console.log("CACHE USED - COIN LIST");
      // Dispatch the cached data
      dispatch(
        coinsActions.updateCoins({
          displayedCoinListCoins: coinListCoinsByCurrency[updatedCurrency],
          trendingCarouselCoins: coinListCoinsByCurrency[updatedCurrency].slice(
            0,
            10,
          ),
        }),
      );

      // Update the currency state after all coins have been updated
      dispatch(currencyActions.changeCurrency(payload));
    } else {
      // CoinList Cache doesn't exist
      console.log("CACHE NOT USED - COIN LIST");
      // Only transform the requested currency first to save time. Then, we cache the rest
      postMessageToCurrencyTransformerWorker({
        type: "transformCoinListCurrency",
        data: {
          coinsToTransform: displayedCoinListCoins,
          fromCurrency: currentCurrency.toUpperCase(),
          toCurrency: updatedCurrency.toUpperCase(),
          currencyRates: initialRates,
        },
      });
      // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
      postMessageToCurrencyTransformerWorker({
        type: "transformAllCoinListCurrencies",
        data: {
          coinsToTransform: displayedCoinListCoins,
          fromCurrency: currentCurrency.toUpperCase(),
          currencyRates: initialRates,
          // Only transform the ones that haven't been transformed yet
          currenciesToExclude: [
            updatedCurrency.toUpperCase(),
            currentCurrency.toUpperCase(),
          ],
        },
      });
    }
  },
);
