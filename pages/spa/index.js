import dynamic from "next/dynamic";
import SpaLayout from "../../src/components/SPA/SpaLayout/SpaLayout";
import { preparePopularCoinsListPageProps } from "../../src/utils/api.server.utils";

// Dynamically import the SPA Router component with SSR disabled
const SpaRouter = dynamic(() => import("../../src/components/SPA/SpaRouter/SpaRouter"), {
  ssr: false, // Disable server-side rendering for the router
});

const SpaPage = () => {
  return (
    <SpaLayout>
      <SpaRouter />
    </SpaLayout>
  );
};

export default SpaPage;

export async function getServerSideProps(context) {
  const popularCoinsListPageProps = await preparePopularCoinsListPageProps(
    context,
  );

  return popularCoinsListPageProps;
}
