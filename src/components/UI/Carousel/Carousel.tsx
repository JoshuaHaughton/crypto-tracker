import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./Carousel.module.scss";
import CarouselCoin from "./CarouselCoin";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { selectCarouselCoins } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";

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
  const [isMounted, setIsMounted] = useState(false);
  const currentSymbol = useSelector(selectCurrentSymbol);
  const carouselCoins = useSelector(selectCarouselCoins);
  const formattedCarouselCoins = carouselCoins?.map((coin) => (
    <CarouselCoin key={coin.id} coin={coin} currentSymbol={currentSymbol} />
  ));

  useEffect(() => {
    setIsMounted(true); // Set the component as mounted after the initial render (AliceCarousel issue)
  }, []);

  return (
    <section className={styles.carousel}>
      {/* 
          TODO: Use a different carousel library during CSS updates for better performance.
          The AliceCarousel library has an issue with initial rendering that requires setting the innerWidth manually to
          prevent visual glitches.
      */}
      {isMounted && (
        <AliceCarousel
          mouseTracking
          infinite
          autoPlay
          autoPlayInterval={1000}
          animationDuration={1500}
          disableDotsControls
          disableButtonsControls
          responsive={responsiveBreakpoints}
          items={formattedCarouselCoins}
        />
      )}
    </section>
  );
};

export default Carousel;
