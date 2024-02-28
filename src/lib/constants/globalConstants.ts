// Time Constants
export const FIVE_MINUTES_IN_DAYS = 5 / (24 * 60);
export const FIVE_MINUTES_IN_MS = 300000;
export const FIVE_MINUTES_IN_SECONDS = 300;
export const TEN_YEARS_IN_SECONDS = 10 * 365 * 24 * 60 * 60;
export const tenYearsInFuture = new Date(
  new Date().getTime() + TEN_YEARS_IN_SECONDS * 1000,
);
export const fiveMinutesInFuture = new Date(
  new Date().getTime() + FIVE_MINUTES_IN_MS,
);

// URLs and Host Information
export const CLIENT_HOST_URL = "https://cryptotracker.haughtonprojects.ca";

// Cache and Storage Constants
export const CACHE_EXPIRY_TIME_IN_MINUTES = 5;
export const POPULARCOINSLISTS_TABLENAME = "popularCoinsLists";
export const COINDETAILS_TABLENAME = "coinDetails";
export const CURRENCYRATES_TABLENAME = "currencyRates";
export const GLOBALCACHEINFO_TABLENAME = "globalCacheInfo";

// Currency and Financial Constants
export const ALL_CURRENCIES = ["CAD", "USD", "AUD", "GBP"] as const;
export type TCurrencyString = (typeof ALL_CURRENCIES)[number]; // This will create a type that can be one of the strings from ALL_CURRENCIES
export const ALL_SYMBOLS = ["$", "£", "AU$"] as const;
export type TCurrencySymbol = (typeof ALL_SYMBOLS)[number]; // This will create a type that can be one of the strings from ALL_SYMBOLS
export const INITIAL_CURRENCY = ALL_CURRENCIES[0];
export const SYMBOLS_BY_CURRENCIES = {
  CAD: "$",
  USD: "$",
  GBP: "£",
  AUD: "AU$",
} as const;

// Application Behavior Constants
export const MAXIMUM_PRELOADED_COIN_COUNT = 30;
export const POPULAR_COINS_PAGE_SIZE = 10;
export const CAROUSEL_COIN_COUNT = 10;
export const MAX_PRELOADING_COUNT = 5;
export const ELLIPSES = "...";
export const isLocalDev = process.env.NODE_ENV !== "production";
export const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
export const isActualProd =
  process.env.NODE_ENV === "production" && !isLocalProd;
