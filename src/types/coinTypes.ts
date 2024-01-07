import { TCurrencyString } from "@/lib/constants";

export interface ICoinOverview {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  priceChange: number;
  market_cap: number;
  volume: number;
}

export interface ICoinDetails {
  id: string;
  currency: TCurrencyString;
  coinAttributes: ICoinDetailAttributes;
}

export interface ICoinDetailAttributes extends ICoinOverview {
  description: string;
  price_change_1d: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
}
