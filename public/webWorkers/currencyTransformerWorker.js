const convertCurrency = (value, fromCurrency, toCurrency, allRates) => {
  return value * allRates[fromCurrency][toCurrency];
};

const transformCurrencyDataForCoinList = (coins, rates, currency) => {
  return coins.map((coin, i) => {
    return {
      ...coin,
      current_price: convertCurrency(
        coin.current_price,
        "CAD",
        currency,
        rates,
      ),
      market_cap: convertCurrency(coin.market_cap, "CAD", currency, rates),
      market_cap_rank: i + 1,
      total_volume: convertCurrency(coin.total_volume, "CAD", currency, rates),
      high_24h: convertCurrency(coin.high_24h, "CAD", currency, rates),
      low_24h: convertCurrency(coin.low_24h, "CAD", currency, rates),
      price_change_24h: convertCurrency(
        coin.price_change_24h,
        "CAD",
        currency,
        rates,
      ),
    };
  });
};

const transformCurrencyDataForCoinDetails = (coin, rates, currency) => {
  return {
    ...coin,
    current_price: convertCurrency(coin.current_price, "CAD", currency, rates),
    all_time_high: convertCurrency(coin.all_time_high, "CAD", currency, rates),
    market_cap: convertCurrency(coin.market_cap, "CAD", currency, rates),
    price_change_1d: convertCurrency(
      coin.price_change_1d,
      "CAD",
      currency,
      rates,
    ),
    price_change_7d: convertCurrency(
      coin.price_change_7d,
      "CAD",
      currency,
      rates,
    ),
    price_change_30d: convertCurrency(
      coin.price_change_30d,
      "CAD",
      currency,
      rates,
    ),
    price_change_365d: convertCurrency(
      coin.price_change_365d,
      "CAD",
      currency,
      rates,
    ),
  };
};

self.addEventListener(
  "message",
  function (e) {
    const { type, data } = e.data;

    if (type === "transformCoinList") {
      const { coins, rates, currentCurrency } = data;
      const currencies = ["CAD", "USD", "AUD", "GBP"].filter(
        (cur) => cur !== currentCurrency,
      );
      const transformedData = {};

      currencies.forEach((currency) => {
        transformedData[currency] = transformCurrencyDataForCoinList(
          coins,
          rates,
          currency,
        );
      });

      self.postMessage({ transformedData });
    } else if (type === "transformCoin") {
      const { coin, rates, currentCurrency } = data;
      const currencies = ["CAD", "USD", "AUD", "GBP"].filter(
        (cur) => cur !== currentCurrency,
      );
      const transformedData = {};

      currencies.forEach((currency) => {
        transformedData[currency] = transformCurrencyDataForCoinDetails(
          coin,
          rates,
          currency,
        );
      });

      self.postMessage({ transformedData });
    }
  },
  false,
);
