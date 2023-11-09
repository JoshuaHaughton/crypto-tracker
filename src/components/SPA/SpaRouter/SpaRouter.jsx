import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../../../spaRoutes/Dashboard/Dashboard";
import PopularCoins from "../../../spaRoutes/PopularCoins/PopularCoins";
import Portfolio from "../../../spaRoutes/Portfolio/Portfolio";
import CoinDetails from "../../../spaRoutes/CoinDetails/CoinDetails";

const SpaRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<PopularCoins />} />
        <Route path="/market/:id" element={<CoinDetails />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
};

export default SpaRouter;
