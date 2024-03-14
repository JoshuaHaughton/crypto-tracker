import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define breakpoints as a const object
export const BREAKPOINT_KEYS = {
  isMobile: "(max-width: 480px)",
  isTablet: "(max-width: 768px)",
  isDesktop: "(max-width: 1024px)",
  isLargeDesktop: "(max-width: 1280px)",

  isBreakpointXs: "(max-width: 380px)",
  isBreakpointSm: "(max-width: 520px)",
  isBreakpointMd: "(max-width: 555px)",
  isBreakpointLg: "(max-width: 680px)",
  isBreakpointXl: "(max-width: 880px)",
  isBreakpointXXL: "(max-width: 1100px)",
  isBreakpointXXXL: "(max-width: 1250px)",
} as const;

// Use this approach for TypeScript compatibility
export type TBreakpointKeys = keyof typeof BREAKPOINT_KEYS;

/**
 * Type representing the state structure for the media query slice.
 * Includes boolean flags for various breakpoints.
 */
export type TMediaQueryState = {
  [K in TBreakpointKeys]: boolean;
};

// Generate initial state dynamically from BREAKPOINT_KEYS
const generateInitialState = (): TMediaQueryState => {
  const state: Partial<TMediaQueryState> = {};
  Object.keys(BREAKPOINT_KEYS).forEach((key) => {
    state[key as TBreakpointKeys] = false;
  });
  return state as TMediaQueryState;
};

/**
 * Initial state for the media query slice.
 */
export const initialMediaQueryState: TMediaQueryState = generateInitialState();

/**
 * Payload structure for setting a breakpoint state.
 */
interface IUpdateBreakpointPayload {
  breakpoint: TBreakpointKeys;
  value: boolean;
}

const mediaQuerySlice = createSlice({
  name: "mediaQuery",
  initialState: initialMediaQueryState,
  reducers: {
    /**
     * Updates the media query state for a given breakpoint.
     * This reducer changes the boolean state of a specified breakpoint based on the action's payload.
     * It is used to dynamically adjust the UI based on viewport changes, ensuring components
     * respond to different screen sizes or orientations.
     *
     * @param {TMediaQueryState} state - The current state of the media query slice.
     * @param {PayloadAction<IUpdateBreakpointPayload>} action - An object containing the breakpoint key and its new boolean value.
     *                                                           The `breakpoint` key corresponds to one of the predefined breakpoint keys, and `value` indicates whether the breakpoint is currently active (true) or not (active).
     */
    updateBreakpoint(
      state: TMediaQueryState,
      action: PayloadAction<IUpdateBreakpointPayload>,
    ) {
      const { breakpoint, value } = action.payload;
      state[breakpoint] = value;
    },
    /**
     * Updates the state for all breakpoints simultaneously.
     * This reducer function takes the entire media query state object as the payload and updates the Redux state to match it.
     * It's an efficient way to update multiple breakpoints at once without dispatching multiple actions, thus reducing the number of re-renders and potentially improving performance.
     *
     * @param {TMediaQueryState} state - The current state of the media query slice.
     * @param {PayloadAction<IUpdateBreakpointPayload>} action - An object containing the breakpoint key and its new boolean value.
     *                                                           The `breakpoint` key corresponds to one of the predefined breakpoint keys, and `value` indicates whether the breakpoint is currently active (true) or not (active).
     */
    updateAllBreakpoints(
      state: TMediaQueryState,
      action: PayloadAction<TMediaQueryState>,
    ) {
      Object.entries(action.payload).forEach(([key, value]) => {
        state[key as TBreakpointKeys] = value;
      });
    },
  },
});

export const { updateBreakpoint, updateAllBreakpoints } =
  mediaQuerySlice.actions;
export default mediaQuerySlice.reducer;
