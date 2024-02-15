import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import AutoplayPlugin from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * Types for the custom hook's return value, utilizing ReturnType for synchronization
 * with the useEmblaCarousel hook's return types. This ensures compatibility and up-to-date
 * types with the Embla Carousel library, automatically reflecting any updates in the hook's
 * output structure.
 */
interface IUseCarouselState {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0] | null; // Reference to the carousel container
  emblaApi: ReturnType<typeof useEmblaCarousel>[1] | null; // API object for controlling the carousel
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
export const useCarousel = (): IUseCarouselState => {
  console.log("useCarousel Hook Invoked");
  // Combine EmblaCarousel with the default options, Autoplay and Wheel Gestures plugins.
  const [emblaRef, emblaApi] = useEmblaCarousel(defaultCarouselOptions, [
    AutoplayPlugin(defaultAutoplayOptions),
    WheelGesturesPlugin(),
  ]);

  return { emblaRef, emblaApi };
};
