import CoinDetailsPage from "@/components/Pages/CoinDetailsPage/CoinDetailsPage";
import GlobalStoreHydrator from "@/components/Initializers/GlobalStoreHydrator/GlobalStoreHydrator";
import { InitialPageDataProvider } from "@/lib/contexts/initialPageDataContext";
import { getCoinDetailsPageInitialData } from "@/lib/utils/api.utils";
import { cookies } from "next/headers";

interface ICoinPageProps {
  params: { symbol: string };
}

export default async function CoinPage({ params }: ICoinPageProps) {
  const initialData = await getCoinDetailsPageInitialData(
    cookies(),
    params.symbol,
  );

  return (
    <>
      <GlobalStoreHydrator initialData={initialData?.dateForGlobalStore} />
      <InitialPageDataProvider value={initialData?.initialPageData}>
        <CoinDetailsPage />
      </InitialPageDataProvider>
    </>
  );
}
