import { TShallowOrFullCoinDetails, ICoinDetails } from "@/lib/types/coinTypes";
import {
  TEN_YEARS_IN_SECONDS,
  FIVE_MINUTES_IN_MS,
} from "../constants/globalConstants";
import { ENumericThresholds } from "../types/numericTypes";

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
  coinDetails: TShallowOrFullCoinDetails | undefined | null,
): coinDetails is ICoinDetails {
  return (coinDetails as ICoinDetails)?.priceChartDataset != null;
}

export const getTenYearsInFuture = (): Date => {
  return new Date(new Date().getTime() + TEN_YEARS_IN_SECONDS * 1000);
};

export const getFiveMinutesInFuture = (): Date => {
  return new Date(new Date().getTime() + FIVE_MINUTES_IN_MS);
};

export function isNumber(value: number) {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Formats a numeric value into a condensed string representation with suffixes.
 *
 * This function converts large numbers into a shorter format using the suffixes 'K' for thousands,
 * 'M' for millions, 'B' for billions, and 'T' for trillions. It's optimized to handle numbers
 * up to a trillion and ensures a single decimal point precision.
 *
 * @param num - The number to format.
 * @returns The formatted string representation of the number.
 *
 * @example
 * formatBigNumber(1234); // returns '1.2K'
 * formatBigNumber(1234567); // returns '1.2M'
 */
export const formatBigNumber = (num: number): string => {
  // Define thresholds for number ranges
  const { THOUSAND, MILLION, BILLION, TRILLION } = ENumericThresholds;

  // Check and format for the 'thousands' range
  if (num >= THOUSAND && num < MILLION) {
    return (num / THOUSAND).toFixed(1) + "K"; // Convert to 'K' format
  }

  // Check and format for the 'millions' range
  else if (num >= MILLION && num < BILLION) {
    return (num / MILLION).toFixed(1) + "M"; // Convert to 'M' format
  }

  // Check and format for the 'billions' range
  else if (num >= BILLION && num < TRILLION) {
    return (num / BILLION).toFixed(1) + "B"; // Convert to 'B' format
  }

  // Check and format for the 'trillions' range
  else if (num >= TRILLION) {
    return (num / TRILLION).toFixed(1) + "T"; // Convert to 'T' format
  }

  // Return the number as-is if it's less than 1000. (Rounded to 6 decimal places)
  else {
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
};
