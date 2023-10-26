import { isFinite, isNil } from "lodash";

export function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export const isEmpty = (value) =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" && Object.keys(value).length === 0);

export const bigNumberFormatter = (num) => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K"; // convert to K for numbers > 1000 < 1 million
  } else if (num > 1000000 && num < 1000000000) {
    return (num / 1000000).toFixed(1) + "M"; // convert to M for numbers > 1 million
  } else if (num > 1000000000 && num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + "B"; // convert to B for numbers > 1 billion
  } else if (num > 1000000000000) {
    return (num / 1000000000000).toFixed(1) + "T"; // convert to T for numbers > 1 trillion
  } else if (num <= 999) {
    return num; // if value < 1000, nothing to do
  }
};

export const removeHTML = (str) => str.replace(/<\/?[^>]+(>|$)/g, "");

/**
 * Converts the exchange data from the API into a structured format for easier currency conversions.
 *
 * The function takes in raw exchange data and processes it to provide conversion rates between
 * different currency pairs. The resulting object provides a way to get conversion rates between
 * any two supported currencies.
 *
 * @param {Object} exchangeData - The raw exchange data from the API.
 * @returns {Object} An object representing conversion rates between supported currency pairs.
 */
export function getCurrencyRatesFromExchangeData(exchangeData) {
  // Extracting conversion rates for CAD
  const cadRates = {
    CAD: 1,
    USD: exchangeData.RAW.CAD.USD.PRICE,
    AUD: exchangeData.RAW.CAD.AUD.PRICE,
    GBP: exchangeData.RAW.CAD.GBP.PRICE,
  };

  // Extracting conversion rates for USD using CAD as the base
  const usdRates = {
    CAD: 1 / cadRates.USD,
    USD: 1,
    AUD: cadRates.AUD / cadRates.USD,
    GBP: cadRates.GBP / cadRates.USD,
  };

  // Extracting conversion rates for AUD using CAD as the base
  const audRates = {
    CAD: 1 / cadRates.AUD,
    USD: cadRates.USD / cadRates.AUD,
    AUD: 1,
    GBP: cadRates.GBP / cadRates.AUD,
  };

  // Extracting conversion rates for GBP using CAD as the base
  const gbpRates = {
    CAD: 1 / cadRates.GBP,
    USD: cadRates.USD / cadRates.GBP,
    AUD: cadRates.AUD / cadRates.GBP,
    GBP: 1,
  };

  return {
    CAD: cadRates,
    USD: usdRates,
    AUD: audRates,
    GBP: gbpRates,
  };
}

/**
 * Checks if the number is valid.
 *
 * @param {number} number - The number to check.
 * @returns {boolean} True if the number is valid, false otherwise.
 */
export const isValid = (number) => {
  return !isNil(number) || isFinite(number);
};
