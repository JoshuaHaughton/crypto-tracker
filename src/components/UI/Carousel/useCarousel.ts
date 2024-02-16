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

/**
 * Types for the custom hook's return value, utilizing ReturnType for synchronization
 * with the useEmblaCarousel hook's return types. This ensures compatibility and up-to-date
 * types with the Embla Carousel library, automatically reflecting any updates in the hook's
 * output structure.
 */
interface IUseCarouselState {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0] | null; // Reference to the carousel container
  emblaApi: ReturnType<typeof useEmblaCarousel>[1] | null; // API object for controlling the carousel
  isLoading: boolean;
  carouselCoins: ICoinOverview[];
  currentSymbol: TCurrencySymbol;
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
  const carouselCoins = useAppSelector(selectCarouselCoins);
  const coinsStatus = useAppSelector(selectInitialPopularCoinsStatus);
  const currentSymbol = useAppSelector(selectCurrentSymbol);

  // Determine loading state based on coin availability and their loading status.
  const isLoading =
    coinsStatus === LoadingStatus.LOADING || carouselCoins.length < 1;

  // Combine EmblaCarousel with the default options, Autoplay and Wheel Gestures plugins.
  const [emblaRef, emblaApi] = useEmblaCarousel(defaultCarouselOptions, [
    AutoplayPlugin(defaultAutoplayOptions),
    WheelGesturesPlugin(),
  ]);

  return {
    emblaRef,
    emblaApi,
    isLoading,
    carouselCoins,
    currentSymbol,
  };
};

export default useCarousel;
