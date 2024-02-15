import {
  useState,
  useEffect,
  useRef,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";

/**
 * Default options for the Embla Carousel
 */
const defaultOptions: EmblaOptionsType = {
  loop: true,
  // dragFree: true,
  containScroll: "trimSnaps",
  duration: 50,
};

interface CarouselState {
  emblaRef: UseEmblaCarouselType[0] | null;
  emblaApi: UseEmblaCarouselType[1] | null;
  setIsHovering: Dispatch<SetStateAction<boolean>>;
}

/**
 * Custom hook to handle the responsive carousel functionality.
 * Handles the autoplay functionality and hover interactions.
 * @param autoplayIntervalMs - The interval for autoplay in milliseconds.
 * @param options - Configuration options for the Embla Carousel.
 * @returns An object containing the carousel's API, state, and control functions.
 */
export const useCarousel = (
  autoplayIntervalMs: number = 3000,
  options: EmblaOptionsType = defaultOptions,
): CarouselState => {
  console.log("useCarousel Hook Invoked");
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [isHovering, setIsHovering] = useState(false);
  // Reference to store the interval ID.
  const autoplayTimeoutRef = useRef<number | null>(null);
  // Reference to store the time when the autoplay was paused.
  const pauseTimeRef = useRef<number | null>(null);

  const controlAutoplayStart = useCallback(() => {
    console.log("controlAutoplayStart - useCarousel");
    if (autoplayTimeoutRef.current === null && emblaApi) {
      // Calculate the remaining time for the next autoplay, if paused before
      const elapsedTime = pauseTimeRef.current
        ? Date.now() - pauseTimeRef.current
        : 0;
      const remainingTime = Math.max(autoplayIntervalMs - elapsedTime, 0);

      autoplayTimeoutRef.current = window.setTimeout(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        }
        // Reset the timeout ref and pause time ref after scrolling
        clearTimeout(autoplayTimeoutRef.current as number);
        autoplayTimeoutRef.current = null;
        pauseTimeRef.current = null;
        // Immediately start the next autoplay cycle
        controlAutoplayStart();
      }, remainingTime);
    }
  }, [autoplayIntervalMs, emblaApi]);

  const controlAutoplayStop = useCallback(
    ({ shouldPause }: { shouldPause: boolean }) => {
      console.log("controlAutoplayStop - useCarousel");
      if (autoplayTimeoutRef.current !== null) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;

        if (shouldPause) {
          // Save the pause time when pausing the autoplay
          pauseTimeRef.current = Date.now();
        } else {
          // Reset the pause time when stopping the autoplay
          pauseTimeRef.current = null;
        }
      }
    },
    [],
  );

  const handleCarouselVisibilityChange = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      console.log("handleCarouselVisibilityChange - useCarousel");
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Carousel is visible
          controlAutoplayStart();
        } else {
          // Carousel is not visible
          controlAutoplayStop({ shouldPause: true });
        }
      });
    },
    [controlAutoplayStart, controlAutoplayStop],
  );

  const handleDocumentVisibilityChange = useCallback(() => {
    console.log("handleDocumentVisibilityChange - useCarousel");
    if (document.visibilityState === "hidden") {
      controlAutoplayStop({ shouldPause: true });
    } else if (document.visibilityState === "visible") {
      controlAutoplayStart();
    }
  }, [controlAutoplayStart, controlAutoplayStop]);

  // Effect to handle pausing the animation when the carousel is not in the viewport,
  // and document visibility changes.
  useEffect(() => {
    console.log("observerCreation - useCarousel");
    // Create an IntersectionObserver to track carousel visibility.
    const observer = new IntersectionObserver(handleCarouselVisibilityChange, {
      threshold: 0.1,
    });

    // Get the root node of the Embla Carousel.
    const emblaRootNode = emblaApi?.rootNode();

    // Observe the carousel's root node for visibility changes.
    if (emblaRootNode) {
      console.log("observer embla root", emblaRootNode);
      observer.observe(emblaRootNode);
    }

    // Add event listeners fordocument visibility changes.
    document.addEventListener(
      "visibilitychange",
      handleDocumentVisibilityChange,
    );

    // Return a cleanup function to unsubscribe from observers and remove event listeners.
    return () => {
      // Unobserve the carousel's root node to stop tracking visibility changes.
      if (emblaRootNode) {
        observer.unobserve(emblaRootNode);
      }
      // Remove event listeners for document visibility changes.
      document.removeEventListener(
        "visibilitychange",
        handleDocumentVisibilityChange,
      );
    };
  }, [
    emblaApi,
    handleDocumentVisibilityChange,
    handleCarouselVisibilityChange,
  ]);

  // Effect to pause/play based on hover state.
  useEffect(() => {
    console.log("hover - useCarousel", isHovering);
    // Check if the mouse is not hovering over the carousel.
    if (!isHovering) {
      // If not hovering, start autoplay.
      controlAutoplayStart();
    } else {
      // If hovering, pause autoplay.
      controlAutoplayStop({ shouldPause: true });
    }
  }, [isHovering, controlAutoplayStart, controlAutoplayStop]);

  // Effect to start autoplay when the component mounts and stop /reset it when it unmounts.
  useEffect(() => {
    console.log("initial - useCarousel");
    // Start autoplay when the component mounts.
    controlAutoplayStart();

    // Return a cleanup function.
    return () => {
      // Stop/reset autoplay when the component unmounts.
      controlAutoplayStop({ shouldPause: false });

      // Check if there's a current autoplay timeout.
      if (autoplayTimeoutRef.current) {
        // If yes, clear the autoplay timeout to prevent memory leaks.
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [controlAutoplayStart, controlAutoplayStop]);

  return { emblaRef, emblaApi, setIsHovering };
};
