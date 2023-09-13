/**
 * Converts a value from one currency to another based on given rates.
 *
 * @param {number} value - The value to convert.
 * @param {string} fromCurrency - The original currency of the value. Should be the initial currency first loaded.
 * @param {string} toCurrency - The target currency to convert the value into.
 * @param {Object} allRates - An object containing conversion rates. It is structured such that allRates[fromCurrency][toCurrency] gives the rate.
 * @returns {number} - The converted value.
 */
export const convertCurrency = (value, fromCurrency, toCurrency, allRates) => {
  return value * allRates[fromCurrency][toCurrency];
};
