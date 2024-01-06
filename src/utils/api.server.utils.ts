import { parse } from "cookie";
import {
  fetchCoinDetailsData,
  getPopularCoinsCacheData,
} from "./api.client.utils";
import {
  SYMBOLS_BY_CURRENCIES,
  FIVE_MINUTES_IN_MS,
  FIVE_MINUTES_IN_SECONDS,
} from "../global/constants";
import { prepareAuthContext } from "./auth.utils";
import { initialCoinsState } from "../store/coins";

/**
 * Fetches and prepares the initial props for a coin's details page.
 *
 * @param {Object} context - The Next.js context object.
 * @returns {Object} The initial props to hydrate the page with, including the Redux state.
 */
export async function prepareCoinDetailsPageProps(context) {
  const { id } = context.params;
  const cookies = parse(context.req.headers.cookie || "");
  const currentCurrency =
    cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const usePreloadedData = cookies.usePreloadedData === "true";

  // Reset the "usePreloadedData" cookie for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  if (usePreloadedData) {
    console.log(
      "Using cached data for coinDetails page! Not returning initialReduxState from server.",
    );
    return { props: {} };
  }

  console.log("Fetching new data for coins page...");
  let initialReduxState;

  try {
    const coinDetails = await fetchCoinDetailsData(id, currentCurrency);
    const {
      coinAttributes,
      marketChartValues,
      marketValues,
      chartValues,
      currencyRates,
    } = coinDetails;

    initialReduxState = {
      coins: {
        selectedCoinDetails: {
          coinAttributes,
          marketChartValues,
          marketValues,
          chartValues,
        },
        selectedCoinDetailsByCurrency: {
          [currentCurrency]: {
            coinAttributes,
            marketChartValues,
            marketValues,
            chartValues,
          },
        },
      },
      currency: {
        currentCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        currencyRates: currencyRates,
      },
    };
  } catch (err) {
    // Return a default state if we can't get the data from the API
    console.warn(err);

    initialReduxState = {
      currency: {
        currentCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
      },
    };
  }

  return {
    props: {
      initialReduxState,
    },
  };
}

/**
 * Fetches and prepares the initial props for the PopularCoinsList page, including user authentication status and coin data based on currency preferences.
 *
 * @param {Object} context - The Next.js context object with request and response objects.
 * @returns {Object} The initial props to hydrate the page with, including the Redux state with user auth status & popular coin data.
 */
export async function preparePopularCoinsListPageProps(context) {
  // Retrieve cookies
  const currentCurrency =
    context.req.cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const clientGlobalCacheVersion = parseInt(
    context.req.cookies.globalCacheVersion || "0",
  );
  const usePreloadedData = context.req.cookies.usePreloadedData === "true";

  // Retrieve the X-Current-Currency header value. The Service Worker sets this header when the user updates their currency preference. If the page is cached by Vercel, this header helps in busting the cache and ensuring data relevant to the user's current currency is served.
  const incomingCurrency =
    context.req.headers["X-Current-Currency"] || currentCurrency;
  console.log("X-Current-Currency", incomingCurrency);
  console.log("currentCurrency cookie", currentCurrency);

  // Calculate the time difference between now and the last globalCacheVersion
  let currentTimestamp = Date.now();
  const timeSinceLastFetch = currentTimestamp - clientGlobalCacheVersion;

  /* Check conditions to determine whether to fetch fresh data or use cached data.
  
  1. If more than five minutes have passed since the last fetch, fetch fresh data. This ensures that the user receives up-to-date cryptocurrency data.
  2. If usePreloadedData is false, this indicates that the client doesn't have recent data preloaded, or the data might be outdated; hence, fetch fresh data.
  3. On Vercel's production environment, the `Vary` header with `X-Current-Currency` ensures that separate cache versions are maintained for different currency preferences. When a user changes their currency, the cache is busted, and `getServerSideProps` runs again, fetching fresh data for the new currency (Or using the cache if available).

  Note: In a local development environment, Vercel's edge caching is not present, so every request will run `getServerSideProps` afresh. Nonetheless, the logic above is still relevant as it ensures that even locally, data remains consistent and is refreshed based on the time since the last fetch and the currency preference.
  */
  let shouldFetchData =
    timeSinceLastFetch >= FIVE_MINUTES_IN_MS || !usePreloadedData;

  let initialReduxState = {};
  let globalCacheVersion = null;

  if (shouldFetchData) {
    console.log("Fetching new PopularCoinsLists data on the server");

    try {
      // Check the user session and get the user details
      const authData = await prepareAuthContext(context);
      initialReduxState.auth = authData;

      const popularCoinsListData = await getPopularCoinsCacheData(
        incomingCurrency,
      );
      // Update the globalCacheVersion after the fetch has completed
      globalCacheVersion = Date.now().toString();

      initialReduxState.coins = { ...popularCoinsListData.coins };
      initialReduxState.currency = { ...popularCoinsListData.currency };

      // Set Cache-Control header to cache the page at the edge (CDN) for 5 minutes.
      // The stale-while-revalidate directive means that stale data can be used while the cache is being revalidated in the background.
      context.res.setHeader(
        "Cache-Control",
        `s-maxage=${FIVE_MINUTES_IN_SECONDS}, stale-while-revalidate`,
      );
    } catch (err) {
      console.log("Error fetching data:", err);

      globalCacheVersion = clientGlobalCacheVersion.toString();

      // Return default data to prevent breaking the site
      initialReduxState = {
        coins: initialCoinsState,
        currency: {
          currentCurrency,
          symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        },
      };
    }
  } else {
    console.log(
      "Client has a recent globalCacheVersion and data was preloaded. Assuming data is up-to-date.",
    );
  }

  // Clear the usePreloadedData cookie for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  /**
   * Set Vary header on X-Current-Currency, X-Global-Cache-Version, and X-Is-Logged-In.
   * This ensures that multiple factors can trigger a cache update or invalidation:
   * - X-Current-Currency: If a user changes their currency preference, this will ensure
   *   that the cache considers the user's current currency and serves the appropriate
   *   version of the page or fetches a new one if it doesn't exist.
   * - X-Global-Cache-Version: If new data is fetched client-side, this header can help
   *   the service worker to detect the change and update the cache accordingly.
   * - X-Is-Logged-In: This header is used to manage cache based on user login status.
   *   When a user logs in or out, this header changes, signaling the CDN to serve the
   *   correct version of the content based on the user's authentication status.
   * This combination of headers provides fine-grained control over the cache behavior,
   * ensuring that users see the most accurate and personalized content.
   */
  context.res.setHeader(
    "Vary",
    "X-Current-Currency, X-Global-Cache-Version, X-Is-Logged-In",
  );

  return {
    props: {
      initialReduxState,
      globalCacheVersion,
    },
  };
}
