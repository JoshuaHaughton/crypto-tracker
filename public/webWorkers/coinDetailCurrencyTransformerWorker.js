const convertCurrency = (value, fromCurrency, toCurrency, allRates) => {
  return value * allRates[fromCurrency][toCurrency];
};

const transformCurrencyDataForCoin = (coin, rates, currency) => {
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

self.addEventListener("message", function (e) {
  const { coin, rates } = e.data;

  const currencies = ["CAD", "USD", "AUD", "GBP"];
  const transformedCoins = {};

  currencies.forEach((currency) => {
    transformedCoins[currency] = transformCurrencyDataForCoin(
      coin,
      rates,
      currency,
    );
  });

  self.postMessage({ transformedCoins });
});
