import { useEffect } from "react";
import PopularCoinsList from "../../components/PopularCoinsList";
import Banner from "../../components/UI/Banner/Banner";
import Pagination from "../../components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import { useSelector } from "react-redux";
import { preparePopularCoinsListPageProps } from "../../utils/api.server.utils";

export default function PopularCoins() {
  const popularCoinsListPageNumber = useSelector(
    (state) => state.appInfo.popularCoinsListPageNumber,
  );

  useEffect(() => {
    if (popularCoinsListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [popularCoinsListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Spa slices</h2>
      <PopularCoinsList />
      <Pagination />
    </div>
  );
}

export async function getServerSideProps(context) {
  const popularCoinsListPageProps = await preparePopularCoinsListPageProps(
    context,
  );

  return popularCoinsListPageProps;
}
