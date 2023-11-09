import { preparePopularCoinsListPageProps } from "../../src/utils/api.server.utils";

const SpaDashboard = () => {
  return <div>SpaDashboard</div>;
};

export default SpaDashboard;

export async function getServerSideProps(context) {
  const popularCoinsListPageProps = await preparePopularCoinsListPageProps(
    context,
  );

  return popularCoinsListPageProps;
}
