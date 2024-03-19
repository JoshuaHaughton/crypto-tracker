import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import {
  BREAKPOINT_KEYS,
  TBreakpointKeys,
  TMediaQueryState,
  initialMediaQueryState,
  updateAllBreakpoints,
} from "@/lib/store/mediaQuery/mediaQuerySlice";
import { useAppDispatch } from "@/lib/store";

const RESIZE_DEBOUNCE_DELAY = 250;

/**
 * A utility hook that initializes media query listeners and updates the Redux state based on viewport changes.
 * It listens for changes in window size and dispatches actions to update the media query states in the Redux store accordingly.
 * This allows for a responsive and dynamic UI that adapts to different screen sizes.
 */
const useBreakpointSync = () => {
  console.log("useBreakpointSync");
  const dispatch = useAppDispatch();
  // Cache for previous breakpoint states to prevent unnecessary updates
  const prevBreakpointsRef = useRef<TMediaQueryState>(initialMediaQueryState);

  useEffect(() => {
    const checkAndUpdateBreakpoints = () => {
      const currentBreakpoints: Partial<TMediaQueryState> = {};
      let hasChanges = false;

      // Check each breakpoint and update the currentBreakpoints object
      Object.keys(BREAKPOINT_KEYS).forEach((key) => {
        const query = BREAKPOINT_KEYS[key as TBreakpointKeys];
        const matches = window?.matchMedia(query).matches;

        // Directly compare with the previous state to check for changes
        if (prevBreakpointsRef.current[key as TBreakpointKeys] !== matches) {
          hasChanges = true;
        }

        currentBreakpoints[key as TBreakpointKeys] = matches;
      });

      // If there are changes, update the Redux store and cache the new states
      if (hasChanges) {
        dispatch(updateAllBreakpoints(currentBreakpoints as TMediaQueryState));
        prevBreakpointsRef.current = currentBreakpoints as TMediaQueryState;
      }
    };

    const debouncedCheckAndUpdateBreakpoints = debounce(
      checkAndUpdateBreakpoints,
      RESIZE_DEBOUNCE_DELAY,
    );

    // Initial check and setup
    debouncedCheckAndUpdateBreakpoints();

    // Setup event listener for future checks
    window?.addEventListener("resize", debouncedCheckAndUpdateBreakpoints);

    // Cleanup
    return () =>
      window?.removeEventListener("resize", debouncedCheckAndUpdateBreakpoints);
    // Should only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useBreakpointSync;
