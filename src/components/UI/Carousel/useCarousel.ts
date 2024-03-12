import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import AutoplayPlugin from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";
import { ICoinOverview } from "@/lib/types/coinTypes";
import { useAppSelector } from "@/lib/store";
import { selectCarouselCoins } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { selectInitialPopularCoinsStatus } from "@/lib/store/appInfo/appInfoSelectors";
import { LoadingStatus } from "@/lib/types/apiRequestTypes";
import useCoinDetailsPreloader from "@/lib/hooks/preloaders/useCoinDetailsPreloader";
import { useInitialPageData } from "@/lib/contexts/initialPageDataContext";

/**
 * Types for the custom hook's return value, utilizing ReturnType for synchronization
 * with the useEmblaCarousel hook's return types. This ensures compatibility and up-to-date
 * types with the Embla Carousel library, automatically reflecting any updates in the hook's
 * output structure.
 */
interface IUseCarouselState {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0] | null; // Reference to the carousel container
  emblaApi: ReturnType<typeof useEmblaCarousel>[1] | null; // API object for controlling the carousel
  carouselCoins: ICoinOverview[];
  currencySymbol: TCurrencySymbol;
  handleItemMouseEnter: (id: string) => void;
  handleItemClick: (id: string) => void;
}

// Set global options for all Embla Carousels
useEmblaCarousel.globalOptions = {
  loop: true, // Applies looping to all carousels
  dragFree: false, // Disables free-scrolling drag behavior by default (snapping into place after dragging)
  containScroll: "trimSnaps", // Prevents excessive scrolling at the ends
};

// Default options for the Embla Carousel
const defaultCarouselOptions: EmblaOptionsType = {
  loop: true,
  containScroll: "trimSnaps",
  duration: 50,
};

// Default autoplay options
const defaultAutoplayOptions = {
  delay: 3000, // milliseconds between transitions
  stopOnInteraction: false, // Autoplay continues even after user interacts with the carousel.
  stopOnMouseEnter: false, // Autoplay continues even when the mouse enters the carousel area.
  stopOnFocusIn: false, // Autoplay continues even when a carousel element gains focus.
  playOnInit: true, // Autoplay starts automatically upon initialization
};

/**
 * Custom hook to initialize Embla carousel with autoplay and wheel gesture functionalities.
 * This setup enhances the user experience by allowing navigation through scroll gestures alongside the autoplay feature.
 * @returns The carousel's API, state, and control functions, providing comprehensive control and information about the carousel instance.
 */
const useCarousel = (): IUseCarouselState => {
  console.log("useCarousel Hook Invoked");
  // Fetching carousel coins and loading status from Redux.
  const reduxCarouselCoins = useAppSelector(selectCarouselCoins);
  // Fallback to page specific data if Redux store doesn't have carousel coins yet.
  const { popularCoinsMap, carouselSymbolList } = useInitialPageData();
  const carouselCoins: ICoinOverview[] =
    reduxCarouselCoins.length > 0
      ? reduxCarouselCoins
      : carouselSymbolList?.reduce((acc: ICoinOverview[], symbol: string) => {
          const coin = popularCoinsMap?.[symbol];
          if (coin) acc.push(coin); // Add coin to array only if it's not undefined
          return acc;
        }, []) ?? [];
  console.warn("carouselCoins", carouselCoins);
  console.warn("reduxCarouselCoins", reduxCarouselCoins);
  console.warn("carouselSymbolList", carouselSymbolList);
  console.warn("popularCoinsMap", popularCoinsMap);
  const currencySymbol = useAppSelector(selectCurrentSymbol);

  // Combine EmblaCarousel with the default options, Autoplay and Wheel Gestures plugins.
  const [emblaRef, emblaApi] = useEmblaCarousel(defaultCarouselOptions, [
    AutoplayPlugin(defaultAutoplayOptions),
    WheelGesturesPlugin(),
  ]);

  const { handlePreload, handleNavigation } = useCoinDetailsPreloader();

  return {
    emblaRef,
    emblaApi,
    carouselCoins,
    currencySymbol,
    handleItemMouseEnter: handlePreload,
    handleItemClick: handleNavigation,
  };
};

export default useCarousel;
