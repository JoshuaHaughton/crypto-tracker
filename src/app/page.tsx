import HomePage from "@/components/pages/HomePage/HomePage";
import { cookies } from "next/headers";
import { StoreProvider } from "@/lib/store/storeProvider";
import { fetchPopularCoinsData } from "@/utils/api.server.utils";
import {
  TCurrencyString,
  INITIAL_CURRENCY,
} from "@/lib/constants/globalConstants";

export default async function Page() {
  // Default values for client-side rendering
  let currencyExchangeRates;
  let popularCoins;
  let carouselSymbolList;
  const isSPANavigation = typeof window !== "undefined";

  // Check if running on the server
  if (isSPANavigation) {
    console.log("CLIENT SIDE RENDERING");
  } else {
    console.log("SERVER SIDE RENDERING");
    // Retrieve the currency preference from cookies
    const cookieStore = cookies();
    const currencyPreference =
      (cookieStore.get("currencyPreference")?.value as TCurrencyString) ||
      INITIAL_CURRENCY;

    // Fetch popular coins data on the server so we can use it to initialize the Redux store
    const popularCoinsData = await fetchPopularCoinsData(currencyPreference);
    // Set the fetched data for server-side rendering
    currencyExchangeRates = popularCoinsData.currencyExchangeRates;
    popularCoins = popularCoinsData.popularCoinsList;
    carouselSymbolList = popularCoinsData.carouselSymbolList;
    console.log("DATA LOADED");
  }

  return (
    <StoreProvider
      currencyExchangeRates={currencyExchangeRates}
      popularCoins={popularCoins}
      carouselSymbolList={carouselSymbolList}
    >
      <HomePage />
    </StoreProvider>
  );
}
