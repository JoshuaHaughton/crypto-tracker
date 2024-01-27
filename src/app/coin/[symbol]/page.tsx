import CoinDetailsPage from "@/components/pages/CoinDetailsPage/CoinDetailsPage";
import { cookies } from "next/headers";
import { StoreProvider } from "@/lib/store/storeProvider";
import {
  INITIAL_CURRENCY,
  TCurrencyString,
} from "@/lib/constants/globalConstants";
import { fetchAndFormatCoinDetailsData } from "@/utils/api.server.utils";

// Define an interface for the expected structure of `params`
interface CoinPageParams {
  symbol: string;
}

export default async function CoinPage({ params }: { params: CoinPageParams }) {
  // Extract the 'symbol' parameter from `params`
  const { symbol } = params;

  // Default values for client-side rendering
  let currencyExchangeRates;
  let coinDetails;

  // Check if running on the server
  if (typeof window === "undefined") {
    console.log("SERVER SIDE RENDERING");
    // Retrieve the currency preference from cookies
    const cookieStore = cookies();
    const currencyPreference =
      (cookieStore.get("currencyPreference")?.value as TCurrencyString) ||
      INITIAL_CURRENCY;

    // Fetch coin details using the symbol and currency preference
    const coinDetailsData = await fetchAndFormatCoinDetailsData(
      symbol,
      currencyPreference,
    );

    // Set the fetched data for server-side rendering
    currencyExchangeRates = coinDetailsData?.currencyExchangeRates;
    coinDetails = coinDetailsData?.coinDetails;
    console.log("DATA LOADED");
  } else {
    console.log("CLIENT SIDE RENDERING");
  }

  return (
    <StoreProvider
      currencyExchangeRates={currencyExchangeRates}
      coinDetails={coinDetails}
    >
      <CoinDetailsPage />
    </StoreProvider>
  );
}
