import { TCurrencyString } from "@/lib/constants/globalConstants";

export type TCurrencyExchangeRates = Record<TCurrencyString, TCurrencyRates>;

export type TCurrencyRates = {
  [Currency in TCurrencyString]: number;
};
