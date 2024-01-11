import styles from "./Carousel.module.scss";
import { useSelector } from "react-redux";
import CarouselCoin from "./CarouselCoin";
import { selectCarouselCoins } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { useCarousel } from "@/lib/hooks/ui/useCarousel";

const Carousel = () => {
  const { emblaRef, setIsHovering } = useCarousel();
  const currentSymbol = useSelector(selectCurrentSymbol);
  const carouselCoins = useSelector(selectCarouselCoins);
  console.log("carousel mounted");
  console.log("carousel coins", carouselCoins);

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.embla__container}>
        {carouselCoins.map((coin) => (
          <div
            className={styles.embla__slide}
            key={coin.symbol}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <CarouselCoin coin={coin} currentSymbol={currentSymbol} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
