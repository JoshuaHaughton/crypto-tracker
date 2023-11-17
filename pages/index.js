import styles from "./index.module.scss";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Crypto Tracker</h1>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // Regenerate the page every hour (3600 seconds)
  };
}
