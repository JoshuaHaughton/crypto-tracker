export const FIVE_MINUTES_IN_DAYS = 5 / (24 * 60);

export const CACHE_EXPIRY_TIME_IN_MINUTES = 5;

export const ALL_CURRENCIES = ["CAD", "USD", "AUD", "GBP"] as const;

// This will create a type that can be one of the strings from ALL_CURRENCIES
export type TCurrencyString = (typeof ALL_CURRENCIES)[number];

export const ALL_SYMBOLS = ["$", "£", "AU$"] as const;

export const INITIAL_CURRENCY = ALL_CURRENCIES[0];

// This will create a type that can be one of the strings from ALL_SYMBOLS
export type TCurrencySymbol = (typeof ALL_SYMBOLS)[number];

export const POPULARCOINSLISTS_TABLENAME = "popularCoinsLists";

export const COINDETAILS_TABLENAME = "coinDetails";

export const CURRENCYRATES_TABLENAME = "currencyRates";

export const GLOBALCACHEINFO_TABLENAME = "globalCacheInfo";

export const SYMBOLS_BY_CURRENCIES = {
  CAD: "$",
  USD: "$",
  GBP: "£",
  AUD: "AU$",
} as const;

export const FIVE_MINUTES_IN_MS = 300000;

export const FIVE_MINUTES_IN_SECONDS = 300;

export const TEN_YEARS_IN_SECONDS = 10 * 365 * 24 * 60 * 60;

export const tenYearsInFuture = new Date(
  new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000,
);

export const fiveMinutesInFuture = new Date(
  new Date().getTime() + 5 * 60 * 1000,
);

export const CURRENT_CURRENCY_COOKIE_EXPIRY_TIME = tenYearsInFuture;

export const GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME = fiveMinutesInFuture;

export const MAXIMUM_PRELOADED_COIN_COUNT = 30;

export const isLocalDev = process.env.NODE_ENV !== "production";
export const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL === "true";
export const isActualProd =
  process.env.NODE_ENV === "production" && !isLocalProd;
