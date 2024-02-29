import styles from "./Carousel.module.scss";
import useCarousel from "@/components/UI/Carousel/useCarousel";
import CarouselItem from "./CarouselItem";
import { CAROUSEL_COIN_COUNT } from "@/lib/constants/globalConstants";
import Link from "next/link";

/**
 * Carousel component responsible for displaying a carousel of coin items.
 * It manages the rendering of either actual coin items or skeleton loaders based on the loading state.
 * The carousel uses the 'embla-carousel' library for smooth sliding functionalities.
 *
 * @returns {React.FC} A functional component that renders the carousel with coins or skeletons based on loading state.
 */
const Carousel: React.FC = () => {
  const {
    emblaRef,
    carouselCoins,
    currencySymbol,
    isLoading,
    handleItemMouseEnter,
  } = useCarousel();

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.embla__container}>
        {/* Render either a set number of skeletons or actual coin items based on the loading state */}
        {Array.from({ length: CAROUSEL_COIN_COUNT }, (_, index) => {
          const coinSymbol = carouselCoins[index]?.symbol;

          return (
            <div className={styles.embla__slide} key={index}>
              <Link href={`/coin/${coinSymbol}`} prefetch>
                <CarouselItem
                  coin={carouselCoins[index]}
                  currencySymbol={currencySymbol}
                  showFallback={isLoading}
                  handleMouseEnter={() => handleItemMouseEnter(coinSymbol)}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
