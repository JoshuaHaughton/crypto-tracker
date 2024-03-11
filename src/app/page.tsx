import HomePage from "@/components/Pages/HomePage/HomePage";
import GlobalStoreHydrator from "@/components/Initializers/GlobalStoreHydrator/GlobalStoreHydrator";
import { InitialPageDataProvider } from "@/lib/contexts/initialPageDataContext";
import { getHomePageInitialData } from "@/lib/utils/dataFormat.utils";
import { cookies } from "next/headers";

export default async function Home() {
  const initialData = await getHomePageInitialData(cookies());
  console.log('UHUHUHUH', initialData)

  return (
    <>
      <GlobalStoreHydrator initialData={initialData?.dateForGlobalStore} />
      <InitialPageDataProvider value={initialData?.initialPageData}>
        <HomePage />
      </InitialPageDataProvider>
    </>
  );
}
