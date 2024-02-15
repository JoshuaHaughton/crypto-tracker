import styles from "./Carousel.module.scss";
import { useSelector } from "react-redux";
import { selectCarouselCoins } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { useCarousel } from "@/components/UI/Carousel/useCarousel";
import CarouselCoin from "./CarouselCoin";
// import useWhyDidComponentUpdate from "@/lib/hooks/debug/useWhyDidComponentUpdate";

const Carousel = () => {
  console.log("Carousel render");
  const currentSymbol = useSelector(selectCurrentSymbol);
  const carouselCoins = useSelector(selectCarouselCoins);
  const { emblaRef } = useCarousel();
  // useWhyDidComponentUpdate("Carousel", {
  //   carouselCoins,
  //   currentSymbol,
  //   emblaRef,
  // });

  console.log("carouselCoins - Carousel", carouselCoins);

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.embla__container}>
        {carouselCoins.map((coin) => (
          <div
            className={styles.embla__slide}
            key={coin.symbol}
            // onMouseEnter={() => setIsHovering(true)}
            // onMouseLeave={() => setIsHovering(false)}
          >
            <CarouselCoin coin={coin} currentSymbol={currentSymbol} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
