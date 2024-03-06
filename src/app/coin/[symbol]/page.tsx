import CoinDetailsPage from "@/components/pages/CoinDetailsPage/CoinDetailsPage";
import StoreHydrator from "@/components/Initializers/StoreHydrator/StoreHydrator";
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
      <StoreHydrator initialData={initialData.dataToHydrate} />
      <CoinDetailsPage initialPageData={initialData.initialPageData} />
    </>
  );
}
