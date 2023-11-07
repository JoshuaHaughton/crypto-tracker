import styles from "./index.module.css";
import { preparePopularCoinsListPageProps } from "../src/utils/api.server.utils";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Crypto Tracker</h1>
    </div>
  );
}

// TODO: getStaticProps?
export async function getServerSideProps(context) {
  const popularCoinsListPageProps = await preparePopularCoinsListPageProps(
    context,
  );

  return popularCoinsListPageProps;
}
