import { memo } from "react";
import Image from "next/image";
import Carousel from "../Carousel/Carousel";
import BannerImage from "../../../../public/BannerPic.png";
import styles from "./Banner.module.scss";

const Banner = () => {
  console.log("Banner render");
  return (
    <div className={styles.container}>
      <Image
        src={BannerImage}
        alt="Banner background"
        fill
        style={{
          objectFit: "cover",
        }}
        placeholder="blur"
        // blurDataUrl will use static src here
        quality={100}
        priority
      />
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

export default memo(Banner);
