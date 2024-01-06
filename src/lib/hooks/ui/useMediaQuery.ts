import { debounce } from "lodash";
import { useState, useEffect } from "react";

export const useMediaQuery = (breakpoint, debounceTime = 100) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure SSR compatibility
    if (typeof window !== "undefined") {
      // Convert the breakpoint to a media query string
      const mediaQuery = `(max-width: ${breakpoint}px)`;
      const media = window.matchMedia(mediaQuery);
      const updateMatch = () => {
        // Directly update the state without comparing with current state
        setMatches(media.matches);
      };
      const debouncedUpdate = debounce(updateMatch, debounceTime);

      // Add event listener
      media.addEventListener("change", debouncedUpdate);

      // Initial check
      updateMatch();

      // Cleanup: Remove the event listener when the component is unmounted
      return () => media.removeEventListener("change", debouncedUpdate);
    }
  }, [breakpoint, debounceTime]); // Removed 'matches' from the dependency array

  return matches;
};
