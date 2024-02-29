import StoreHydrator from "@/components/Initializers/StoreHydrator/StoreHydrator";
import HomePage from "@/components/pages/HomePage/HomePage";
import { INITIAL_CURRENCY } from "@/lib/constants/globalConstants";
import { PageProvider } from "@/lib/contexts/pageContext";
import {
  InitialDataType,
  TInitialPageDataOptions,
} from "@/lib/types/apiRequestTypes";
import { E_COOKIE_NAMES } from "@/lib/types/cookieTypes";
import { fetchAndFormatPopularCoinsData } from "@/lib/utils/api.utils";
import { cookies } from "next/headers";

export default async function Page() {
  // Access cookies in server components
  const cookieStore = cookies();

  // Retrieve currency preference from cookies or use default
  const currencyPreference =
    (cookieStore.get(E_COOKIE_NAMES.CURRENT_CURRENCY)
      ?.value as TCurrencyString) || INITIAL_CURRENCY;

  const popularCoinsResponseData = await fetchAndFormatPopularCoinsData(
    currencyPreference,
  );

  // Ensure coinDetails is not null before rendering CoinDetailsPage
  if (!popularCoinsResponseData?.popularCoins) {
    // Handle the null case by rendering a placeholder
    return <div>No popular coins available</div>;
  }

  const formattedinitialData: TInitialPageDataOptions = {
    dataType: InitialDataType.POPULAR_COINS,
    data: popularCoinsResponseData,
  };

  const pageData = {
    popularCoins: popularCoinsResponseData.popularCoins,
    popularCoinsMap: popularCoinsResponseData.popularCoins.reduce(
      (acc, coin) => {
        acc[coin.symbol] = coin;
        return acc;
      },
      {} as Record<string, ICoinOverview>,
    ),
    carouselSymbolList: popularCoinsResponseData.carouselSymbolList,
  };

  return (
    <>
      <StoreHydrator initialData={formattedinitialData} />
      <PageProvider value={pageData}>
        <HomePage />
      </PageProvider>
    </>
  );
}
