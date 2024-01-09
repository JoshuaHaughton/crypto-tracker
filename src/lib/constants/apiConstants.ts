export const CRYPTO_COMPARE_WEBSITE = "https://cryptocompare.com";
const BASE_URL_CRYPTO_COMPARE = "https://min-api.cryptocompare.com/data";
const BASE_URL_CRYPTO_ASSET_DATA =
  "https://data-api.cryptocompare.com/asset/v1/data";

export const API_ENDPOINTS = {
  CURRENCY_EXCHANGE: `${BASE_URL_CRYPTO_COMPARE}/price`,
  TOP_100_MARKET_CAP_OVERVIEW: `${BASE_URL_CRYPTO_COMPARE}/top/mktcapfull`,
  HISTORICAL_HOUR: `${BASE_URL_CRYPTO_COMPARE}/v2/histohour`,
  HISTORICAL_DAY: `${BASE_URL_CRYPTO_COMPARE}/v2/histoday`,
  ASSET_DETAILS_BY_SYMBOL: `${BASE_URL_CRYPTO_ASSET_DATA}/by/symbol`,
};
