import { TCurrencyString } from "@/lib/constants";

export type TCurrencyExchangeRates = Record<TCurrencyString, ICurrencyRates>;

export type ICurrencyRates = {
  [Currency in TCurrencyString]: number;
};
