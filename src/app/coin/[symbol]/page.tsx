import CoinDetailsPage from "@/components/pages/CoinDetailsPage/CoinDetailsPage";
import { useRouter } from "next/router";
import { cookies } from "next/headers";
import { StoreProvider } from "@/lib/store/storeProvider";
import { INITIAL_CURRENCY, TCurrencyString } from "@/lib/constants/globalConstants";
import { fetchCoinDetailsData } from "@/utils/api.server.utils";

export default async function CoinPage() {
  const router = useRouter();
  // 'symbol' should always be present and a string.
  const symbol = router.query.symbol as string;

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
