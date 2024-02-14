import { TShallowOrFullCoinDetails, ICoinDetails } from "@/types/coinTypes";
import { isFinite, isNil, isObject, mergeWith } from "lodash";

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

/**
 * Type guard to check if the provided coin details are of the type `ICoinDetails`.
 *
 * This function uses specific properties unique to `ICoinDetails` (e.g., `priceChartDataset`)
 * to differentiate it from `ShallowCoinDetails`.
 *
 * @param coinDetails - The coin details object to be checked.
 * @returns `true` if `coinDetails` is of type `ICoinDetails`, otherwise `false`.
 */
export function isFullCoinDetails(
  coinDetails: TShallowOrFullCoinDetails | null,
): coinDetails is ICoinDetails {
  return (coinDetails as ICoinDetails)?.priceChartDataset != null;
}
