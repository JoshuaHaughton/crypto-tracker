import { isFinite, isNil, isObject, mergeWith } from "lodash";

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
 * Checks if the number is valid.
 *
 * @param {number} number - The number to check.
 * @returns {boolean} True if the number is valid, false otherwise.
 */
export const isValid = (number) => {
  return !isNil(number) || isFinite(number);
};

/**
 * Custom lodash merge strategy that:
 * - Replaces original arrays with new ones.
 * - Deeply merges objects.
 * - Retains non-null original values over new values.
 *
 * @param {*} objValue - The original value.
 * @param {*} srcValue - The new value to be merged.
 * @returns {*} - The merged result.
 */
export function replaceArraysDeepMergeObjects(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return srcValue;
  }

  if (isObject(objValue) && isObject(srcValue)) {
    return mergeWith({}, objValue, srcValue, replaceArraysDeepMergeObjects);
  }

  return objValue != null ? objValue : srcValue;
}
