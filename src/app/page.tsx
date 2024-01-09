import "server-only";

import HomePage from "@/components/pages/HomePage/HomePage";
import { cookies } from "next/headers";
import { StoreProvider } from "@/lib/store/storeProvider";
import { fetchPopularCoinsData } from "@/api/fetchPopularCoins";
import { TCurrencyString, INITIAL_CURRENCY } from "@/lib/constants";

export default async function Page() {
  // Retrieve the currency preference from cookies
  const cookieStore = cookies();
  const currencyPreference =
    (cookieStore.get("currencyPreference")?.value as TCurrencyString) ||
    INITIAL_CURRENCY;

  // Fetch popular coins data on the server so we can use it to initialize the Redux store
  const popularCoinsData = await fetchPopularCoinsData(currencyPreference);

  return (
    <StoreProvider
      currencyExchangeRates={popularCoinsData.currencyExchangeRates}
      popularCoins={popularCoinsData.popularCoinsList}
      carouselCoins={popularCoinsData.trendingCarouselCoins}
    >
      <HomePage />
    </StoreProvider>
  );
}
