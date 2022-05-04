import React, { useState } from "react";
import styles from "./Carousel.module.css";
// import AliceCarousel from "react-alice-carousel";
import Image from "next/image";
import Link from "next/link";
// import "react-alice-carousel/lib/alice-carousel.css";
import dynamic from "next/dynamic";
const AliceCarousel = dynamic(() => import("react-alice-carousel"), {
  ssr: false,
});

const Carousel = ({ trendingCoins }) => {
  const [a, setA] = useState(trendingCoins || []);
  const responsive = {
    0: {
      items: 1,
    },
    360: {
      items: 2
    },
    512: {
      items: 3,
    },
    750: {
      items: 4
    },
    1000: {
      items: 5
    }
  };

  let items = a.map((coin) => {
    let profit = coin.price_change_percentage_24h >= 0;
    console.log(profit);
    console.log(coin);
    return (
      <div className={styles.carousel_item} key={coin.id}>
          <Link
            href={`/coin/${coin.id}`}
          >
          <Image
            key={coin.id}
            src={coin?.image}
            alt={coin.name}
            height={80}
            width={80}
          />
            </Link>
          <p>
            {coin?.symbol.toUpperCase()}&nbsp;
            {profit ? (
              <span className={styles.green}>+{coin.price_change_percentage_24h}%</span>
            ) : (
              <span className={styles.red}>{coin.price_change_percentage_24h}%</span>
            )}
          </p>
          <h6>
            ${coin?.current_price.toLocaleString("en-US", {
              maximumFractionDigits: 8,
              minimumFractionDigits: 2,
            })}
          </h6>
        </div>
    );
  });

  console.log(items);

  return (
    <div className={styles.carousel}>
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        autoPlay
        items={items}
      />
    </div>
  );
};

export default Carousel;
