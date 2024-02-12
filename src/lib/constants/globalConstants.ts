export const FIVE_MINUTES_IN_DAYS = 5 / (24 * 60);

export const CLIENT_HOST_URL = "https://cryptotracker.haughtonprojects.ca";

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

export const POPULAR_COINS_PAGE_SIZE = 10;

// https://github.com/leeoniya/uFuzzy?tab=readme-ov-file#options

// Define custom options for uFuzzy to enhance search flexibility and accuracy.
export const uFuzzyOptions = {
  // interIns: Allows additional characters between search terms.
  // This option helps to accommodate common typos such as accidental extra characters
  // or missed spaces between words, making the search more forgiving and likely to
  // return relevant results even when the query is slightly incorrect.
  interIns: Infinity,

  // intraIns: Permits one extra character within a term itself.
  // Useful for handling misspellings within single words, where a user might accidentally
  // insert an extra character. For example, searching for "apple" could still match "aapple".
  intraIns: 1,

  // intraMode: Activates single-error mode within each term of the search query.
  // In this mode, the search algorithm will tolerate one error (substitution, transposition,
  // deletion, or insertion) within each term, helping to catch and correct simple mistakes
  // made by the user while typing.
  intraMode: 1,

  // intraSlice: Defines the range within terms where errors are allowed, from the second character
  // to the end of the word. This prevents the first character of a word from being altered by
  // the error tolerance mechanism, ensuring that the beginning of the term remains as the user
  // intended, which is often critical for the search's context and accuracy.
  // intraSlice: [1, Infinity],

  // intraSub, intraTrn, intraDel: Specifically enable the algorithm to tolerate
  // single-character substitutions, transpositions, and deletions within terms.
  // These settings work together to robustly handle various common typing errors,
  // ensuring that the search remains effective even with minor inaccuracies in the query.
  // - intraSub: Allows one character to be replaced by another, e.g., "cat" to "cot".
  // - intraTrn: Allows two adjacent characters to swap places, e.g., "form" to "from".
  // - intraDel: Allows one character to be removed, e.g., "hello" to "hllo".
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,

  // Customize the sorting function as needed to refine how search results are ordered
  // based on the relevance and the nature of the typos corrected. This could involve
  // prioritizing results based on the number of errors corrected, the type of errors,
  // or other criteria specific to the application's context.
};