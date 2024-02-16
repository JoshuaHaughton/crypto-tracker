import styles from "./Carousel.module.scss";
import useCarousel from "@/components/UI/Carousel/useCarousel";
import CarouselItem from "./CarouselItem";
import CarouselItemSkeleton from "../Skeletons/CarouselItemSkeleton/CarouselItemSkeleton";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";
import { ICoinOverview } from "@/lib/types/coinTypes";

const CAROUSEL_COIN_COUNT = 10;

/**
 * Props for CarouselContent component.
 */
interface CarouselContentProps {
  isLoading: boolean;
  coin?: ICoinOverview;
  currentSymbol: TCurrencySymbol;
}

/**
 * Component that decides whether to render the actual carousel item or a skeleton based on the loading state.
 * This approach allows maintaining the structure of the carousel, ensuring that transitions and carousel state
 * are not disrupted by changes in content.
 *
 * @param isLoading - Boolean indicating if the carousel data is still loading.
 * @param coin - Coin data to be displayed in the carousel item.
 * @param currentSymbol - Current currency symbol for price display.
 * @returns A CarouselItem or CarouselSkeletonItem based on the loading state.
 */
const CarouselContent: React.FC<CarouselContentProps> = ({
  isLoading,
  coin,
  currentSymbol,
}) => {
  // Here we render CarouselSkeletonItem if isLoading is true, otherwise we render CarouselItem.
  // This ensures that each slide's structure remains intact, maintaining the carousel's seamless operation.
  return isLoading ? (
    <CarouselItemSkeleton />
  ) : (
    <CarouselItem coin={coin!} currentSymbol={currentSymbol} /> // The non-null assertion '!' is safe here as coin will not be undefined when isLoading is false.
  );
};

/**
 * Carousel component responsible for displaying a carousel of coin items.
 * It manages the rendering of either actual coin items or skeleton loaders based on the loading state.
 * The carousel uses the 'embla-carousel' library for smooth sliding functionalities.
 *
 * @returns {React.FC} A functional component that renders the carousel with coins or skeletons based on loading state.
 */
const Carousel: React.FC = () => {
  const { emblaRef, carouselCoins, currentSymbol, isLoading } = useCarousel();

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.embla__container}>
        {/* Render either a set number of skeletons or actual coin items based on the loading state */}
        {Array.from(
          { length: isLoading ? CAROUSEL_COIN_COUNT : carouselCoins.length },
          (_, index) => (
            <div className={styles.embla__slide} key={index}>
              {/* CarouselContent decides whether to render a coin item or a skeleton based on isLoading */}
              <CarouselContent
                isLoading={isLoading}
                coin={carouselCoins[index]} // Note: coin might be undefined if isLoading is true; handled in CarouselContent.
                currentSymbol={currentSymbol}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default Carousel;
