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
          <h1>
            <span className={styles.orange}>CRYPTO</span> TRACKER
          </h1>
          <h6>Get the latest info on your favourite crypto!</h6>
        </div>
        <Carousel />
      </div>
    </div>
  );
};

export default memo(Banner);
