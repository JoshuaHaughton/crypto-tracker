import { TShallowOrFullCoinDetails, ICoinDetails } from "@/lib/types/coinTypes";

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