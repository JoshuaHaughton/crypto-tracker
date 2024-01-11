import CoinDetailsPage from "@/components/pages/CoinDetailsPage/CoinDetailsPage";
import { cookies } from "next/headers";
import { StoreProvider } from "@/lib/store/storeProvider";
import {
  INITIAL_CURRENCY,
  TCurrencyString,
} from "@/lib/constants/globalConstants";
import { fetchCoinDetailsData } from "@/utils/api.server.utils";

// Define an interface for the expected structure of `params`
interface CoinPageParams {
  symbol: string;
}

export default async function CoinPage({ params }: { params: CoinPageParams }) {
  // Extract the 'symbol' parameter from `params`
  const { symbol } = params;

  // Retrieve the currency preference from cookies
  const cookieStore = cookies();
  const currencyPreference =
    (cookieStore.get("currencyPreference")?.value as TCurrencyString) ||
    INITIAL_CURRENCY;

  // Fetch coin details using the symbol and currency preference
  const coinDetailsData = await fetchCoinDetailsData(
    symbol,
    currencyPreference,
  );

  return (
    <StoreProvider
      currencyExchangeRates={coinDetailsData?.currencyExchangeRates}
      coinDetails={coinDetailsData?.coinDetails}
    >
      <CoinDetailsPage />
    </StoreProvider>
  );
}
