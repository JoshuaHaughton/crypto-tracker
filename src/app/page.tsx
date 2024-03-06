import HomePage from "@/components/pages/HomePage/HomePage";
import StoreHydrator from "@/components/Initializers/StoreHydrator/StoreHydrator";
import { PageProvider } from "@/lib/contexts/pageContext";
import { getHomePageInitialData } from "@/lib/utils/dataFormat.utils";
import { cookies } from "next/headers";

export default async function Home() {
  const initialData = await getHomePageInitialData(cookies());

  return (
    <>
      <StoreHydrator initialData={initialData?.dataToHydrate} />
      <PageProvider value={initialData?.initialPageData}>
        <HomePage />
      </PageProvider>
    </>
  );
}
