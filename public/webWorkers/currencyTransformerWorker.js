const convertCurrency = (value, fromCurrency, toCurrency, allRates) => {
  return value * allRates[fromCurrency][toCurrency];
};

const transformCurrencyDataInBackground = (coins, rates, currency) => {
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

self.addEventListener(
  "message",
  function (e) {
    const { coins, rates } = e.data;
    const currencies = ["CAD", "USD", "AUD", "GBP"];
    const transformedCoins = {};

    currencies.forEach((currency) => {
      transformedCoins[currency] = transformCurrencyDataInBackground(
        coins,
        rates,
        currency,
      );
    });

    self.postMessage({ transformedCoins });
  },
  false,
);
