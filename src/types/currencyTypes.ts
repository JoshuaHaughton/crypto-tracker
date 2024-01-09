import { TCurrencyString } from "@/lib/constants";

export type TCurrencyExchangeRates = Record<TCurrencyString, TCurrencyRates>;

export type TCurrencyRates = {
  [Currency in TCurrencyString]: number;
};
