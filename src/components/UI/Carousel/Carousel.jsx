import React, { useRef, useState } from "react";
import styles from "./Carousel.module.css";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import CarouselCoin from "./CarouselCoin";
const AliceCarousel = dynamic(
  import("react-alice-carousel").then((mod) => mod.default),
  {
    ssr: false,
  },
);

const Carousel = () => {
  const firstRender = useRef(true);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const carouselCoins = useSelector(
    (state) => state.coins.trendingCarouselCoins,
  );
  const [carouselItems, setCarouselItems] = useState(
    carouselCoins.map((coin) => (
      <CarouselCoin key={coin.id} coin={coin} currentSymbol={currentSymbol} />
    )),
  );

  const responsive = {
    0: {
      items: 1,
    },
    360: {
      items: 2,
    },
    512: {
      items: 3,
    },
    750: {
      items: 4,
    },
    1000: {
      items: 5,
    },
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    } else {
      setCarouselItems(
        carouselCoins.map((coin) => (
          <CarouselCoin
            key={coin.id}
            coin={coin}
            currentSymbol={currentSymbol}
          />
        )),
      );
    }
  }, [carouselCoins, currentSymbol]);

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
        items={carouselItems}
      />
    </div>
  );
};

export default React.memo(Carousel);
