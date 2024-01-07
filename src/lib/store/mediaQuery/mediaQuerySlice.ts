import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface representing the state structure for the media query slice.
 * Includes boolean flags for various breakpoints.
 */
export interface IMediaQueryState {
  isBreakpoint380: boolean;
  isBreakpoint520: boolean;
  isBreakpoint555: boolean;
  isBreakpoint680: boolean;
  isBreakpoint1040: boolean;
  isBreakpoint1250: boolean;
}

/**
 * Initial state for the media query slice.
 */
export const initialMediaQueryState: IMediaQueryState = {
  isBreakpoint380: false,
  isBreakpoint520: false,
  isBreakpoint555: false,
  isBreakpoint680: false,
  isBreakpoint1040: false,
  isBreakpoint1250: false,
};

/**
 * Payload structure for setting a breakpoint state.
 */
interface SetBreakpointPayload {
  value: boolean;
}

const mediaQuerySlice = createSlice({
  name: "mediaQuery",
  initialState: initialMediaQueryState,
  reducers: {
    /**
     * Sets the state for breakpoint 380.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint380(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint380 = action.payload.value;
    },
    /**
     * Sets the state for breakpoint 520.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint520(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint520 = action.payload.value;
    },
    /**
     * Sets the state for breakpoint 555.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint555(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint555 = action.payload.value;
    },
    /**
     * Sets the state for breakpoint 680.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint680(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint680 = action.payload.value;
    },
    /**
     * Sets the state for breakpoint 1040.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint1040(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint1040 = action.payload.value;
    },
    /**
     * Sets the state for breakpoint 1250.
     * @param state - The current state of the media query slice.
     * @param action - The action payload containing the boolean value.
     */
    setBreakpoint1250(
      state: IMediaQueryState,
      action: PayloadAction<SetBreakpointPayload>,
    ) {
      state.isBreakpoint1250 = action.payload.value;
    },
  },
});

export const mediaQueryActions = mediaQuerySlice.actions;
export default mediaQuerySlice.reducer;
