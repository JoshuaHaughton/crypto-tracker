import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpaLayout from "../../src/components/SpaLayout/SpaLayout";
import Dashboard from "../../src/spaRoutes/Dashboard/Dashboard";
import PopularCoins from "../../src/spaRoutes/PopularCoins/PopularCoins";
import Portfolio from "../../src/spaRoutes/Portfolio/Portfolio";
import CoinDetails from "../../src/spaRoutes/CoinDetails/CoinDetails";
import { preparePopularCoinsListPageProps } from "../../src/utils/api.server.utils";

const SpaPage = () => {
  return (
    <Router>
      <SpaLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<PopularCoins />} />
          <Route path="/market/:id" element={<CoinDetails />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </SpaLayout>
    </Router>
  );
};

export default SpaPage;

export async function getServerSideProps(context) {
  const popularCoinsListPageProps = await preparePopularCoinsListPageProps(
    context,
  );

  return popularCoinsListPageProps;
}
