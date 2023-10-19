import { memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./Carousel.module.css";
import CarouselCoin from "./CarouselCoin";
import AliceCarousel from "react-alice-carousel";

const responsiveBreakpoints = {
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

const Carousel = () => {
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const carouselCoins = useSelector(
    (state) => state.coins.trendingCarouselCoins,
  );

  // State to track if the carousel items are ready to be displayed
  const [isReady, setIsReady] = useState(false);

  const formattedCarouselCoins = carouselCoins.map((coin) => (
    <CarouselCoin key={coin.id} coin={coin} currentSymbol={currentSymbol} />
  ));

  useEffect(() => {
    // Check if the items for the carousel are populated
    if (formattedCarouselCoins.length > 0) {
      setIsReady(true);
    }
  }, [formattedCarouselCoins]);

  // With the AliceCarousel library, there's an issue with the initial rendering
  // when the items are not yet available, causing visual glitches.
  // By ensuring the items are available before rendering the carousel, we can prevent these issues.
  return (
    <section className={styles.carousel}>
      {/* TODO: Consider using a different carousel library during CSS updates for better performance and fewer workarounds */}
      {isReady ? (
        <AliceCarousel
          mouseTracking
          infinite
          autoPlayInterval={1000}
          animationDuration={1500}
          disableDotsControls
          disableButtonsControls
          responsive={responsiveBreakpoints}
          items={formattedCarouselCoins}
          autoPlay
        />
      ) : null}
    </section>
  );
};

export default memo(Carousel);
