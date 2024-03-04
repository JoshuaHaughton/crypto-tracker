import CoinDetailsPage from "@/components/pages/CoinDetailsPage/CoinDetailsPage";
import StoreHydrator from "@/components/Initializers/StoreHydrator/StoreHydrator";
import { cookies } from "next/headers";
import { INITIAL_CURRENCY } from "@/lib/constants/globalConstants";
import { E_COOKIE_NAMES } from "@/lib/types/cookieTypes";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import {
  InitialDataType,
  TInitialPageDataOptions,
} from "@/lib/types/apiRequestTypes";

// Define props type for the page
interface ICoinPageProps {
  symbol: string;
}

export default async function CoinPage({
  params,
}: {
  params: { symbol: string };
}) {
  // Access cookies in server components
  const cookieStore = cookies();

  // Retrieve currency preference from cookies or use default
  const currencyPreference =
    (cookieStore.get(E_COOKIE_NAMES.CURRENT_CURRENCY)
      ?.value as TCurrencyString) || INITIAL_CURRENCY;

  const coinDetailsResponseData = await fetchAndFormatCoinDetailsData(
    params.symbol,
    currencyPreference,
    { useCache: true },
  );

  // Ensure coinDetails is not null before rendering CoinDetailsPage
  if (!coinDetailsResponseData?.coinDetails) {
    // Handle the null case by rendering a placeholder
    return <div>No coin details available</div>;
  }

  const formattedinitialData: TInitialPageDataOptions = {
    dataType: InitialDataType.COIN_DETAILS,
    data: coinDetailsResponseData,
  };

  return (
    <>
      <StoreHydrator initialData={formattedinitialData} />
      <CoinDetailsPage coinDetails={coinDetailsResponseData?.coinDetails} />
    </>
  );
}
