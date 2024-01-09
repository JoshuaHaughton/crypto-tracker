import "server-only";

import HomePage from "@/components/pages/HomePage/HomePage";
import { StoreProvider } from "@/lib/store/storeProvider";
import { fetchPopularCoinsData } from "@/api/fetchPopularCoins";

export default async function Page() {
  // Fetch popular coins data on the server so we can use it to initialize the Redux store
  const popularCoinsData = await fetchPopularCoinsData();

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
