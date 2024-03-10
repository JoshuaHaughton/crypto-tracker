import CoinDetailsPage from "@/components/Pages/CoinDetailsPage/CoinDetailsPage";
import StoreHydrator from "@/components/Initializers/StoreHydrator/StoreHydrator";
import { PageProvider } from "@/lib/contexts/pageContext";
import { getCoinDetailsPageInitialData } from "@/lib/utils/dataFormat.utils";
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
      <StoreHydrator initialData={initialData?.dataToHydrate} />
      <PageProvider value={initialData?.initialPageData}>
        <CoinDetailsPage />
      </PageProvider>
    </>
  );
}
