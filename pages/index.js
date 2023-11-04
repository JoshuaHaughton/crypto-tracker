import { useEffect } from "react";
import PopularCoinsList from "../src/components/PopularCoinsList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import { useSelector } from "react-redux";
import { preparePopularCoinsListPageProps } from "../src/utils/api.server.utils";

export default function Home() {
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
      <h2>Crypto Prices</h2>
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
