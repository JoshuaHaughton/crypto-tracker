import { TCurrencyString } from "@/lib/constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "./coinTypes";
import { TCurrencyExchangeRates } from "./currencyTypes";

// Popular Coins

export interface ITopMarketCapApiResponse {
  Data: ITop100MarketCapCoinFromAPI[];
}

interface ITop100MarketCapCoinFromAPI {
  CoinInfo: {
    Name: string;
    FullName: string;
    ImageUrl: string;
  };
  RAW: {
    [key in TCurrencyString]?: {
      PRICE: number;
      MKTCAP: number;
      TOTALVOLUME24HTO: number;
      HIGH24HOUR: number;
      LOW24HOUR: number;
      CHANGE24HOUR: number;
      CHANGEPCT24HOUR: number;
      SUPPLY: number;
    };
  };
}

export interface IFormattedPopularCoinsApiResponse {
  currencyExchangeRates: TCurrencyExchangeRates;
  popularCoinsList: ICoinOverview[];
  trendingCarouselCoins: ICoinOverview[];
}

// Coin Details

export interface IFormattedCoinDetailsAPIResponse {
  coinDetails: ICoinDetails;
  currencyExchangeRates: TCurrencyExchangeRates;
}

export interface IAssetDataApiResponse {
  Data: IAssetDetails;
}

interface IAssetDetails {
  NAME: string;
  SYMBOL: string;
  LOGO_URL: string;
  ASSET_DESCRIPTION_SUMMARY: string;
  PRICE_USD: number;
  TOTAL_MKT_CAP_USD: number;
  SPOT_MOVING_24_HOUR_QUOTE_VOLUME_TOP_TIER_DIRECT_USD: number;
  TOPLIST_BASE_RANK: {
    SPOT_MOVING_24_HOUR_QUOTE_VOLUME_USD: number;
  };
}

// Coin Details - Historical Data

export interface IHistoricalDataApiResponse {
  Data: {
    Data: Array<{
      time: number; // UNIX timestamp
      close: number;
      high: number;
      low: number;
      open: number;
      volumefrom: number;
      volumeto: number;
    }>;
  };
}
