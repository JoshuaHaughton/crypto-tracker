import { TShallowOrFullCoinDetails, ICoinDetails } from "@/lib/types/coinTypes";
import {
  TEN_YEARS_IN_SECONDS,
  FIVE_MINUTES_IN_MS,
} from "../constants/globalConstants";

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
