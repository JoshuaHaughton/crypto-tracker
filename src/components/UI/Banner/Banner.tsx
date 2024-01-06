import React from "react";
import Carousel from "../Carousel/Carousel";
import styles from "./Banner.module.scss";

const Banner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.title_wrapper}>
          <h2>
            <span className={styles.orange}>CRYPTO</span> TRACKER
          </h2>
          <p>Get the latest info on your favourite crypto!</p>
        </div>
        <Carousel />
      </div>
    </div>
  );
};

export default React.memo(Banner);
