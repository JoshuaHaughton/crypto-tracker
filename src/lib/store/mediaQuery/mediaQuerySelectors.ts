import { TRootState } from "..";
import { TBreakpointKeys } from "./mediaQuerySlice";

/**
 * Selector for checking the state of breakpoint 380.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 380.
 */
export const selectIsBreakpoint380 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint380;

/**
 * Selector for checking the state of breakpoint 520.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 520.
 */
export const selectIsBreakpoint520 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint520;

/**
 * Selector for checking the state of breakpoint 555.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 555.
 */
export const selectIsBreakpoint555 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint555;

/**
 * Selector for checking the state of breakpoint 680.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 680.
 */
export const selectIsBreakpoint680 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint680;

/**
 * Selector for checking the state of breakpoint 1040.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 1040.
 */
export const selectIsBreakpoint1040 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint1040;

/**
 * Selector for checking the state of breakpoint 1250.
 * @param state - The current state of the application.
 * @returns The boolean state of breakpoint 1250.
 */
export const selectIsBreakpoint1250 = (state: TRootState) =>
  state.mediaQuery.isBreakpoint1250;

/**
 * Selector for checking the state of the mobile breakpoint.
 * This selector provides a boolean indicating whether the viewport width is within the mobile breakpoint range.
 * It's essential for adjusting UI components or behavior based on mobile viewport sizes.
 *
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the mobile breakpoint.
 */
export const selectIsMobile = (state: TRootState): boolean =>
  state.mediaQuery.isMobile;

/**
 * Selector for checking the state of the tablet breakpoint.
 * Utilize this selector to determine if the application's viewport matches the tablet breakpoint specifications.
 * It aids in rendering tablet-specific layouts or features.
 *
 * @param state - The current state of the application.
 * @returns The boolean state of the tablet breakpoint.
 */
export const selectIsTablet = (state: TRootState): boolean =>
  state.mediaQuery.isTablet;

/**
 * Selector for checking the state of the desktop breakpoint.
 * This function is crucial for applications that need to differentiate between desktop and smaller device layouts,
 * enabling desktop-specific adjustments to the UI.
 *
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the current viewport is within the desktop breakpoint.
 */
export const selectIsDesktop = (state: TRootState): boolean =>
  state.mediaQuery.isDesktop;

/**
 * Selector for checking the state of the large desktop breakpoint.
 * It's particularly useful for designs that require additional adjustments or special features
 * at larger desktop resolutions, ensuring optimal layout and functionality.
 *
 * @param state - The current state of the application.
 * @returns The boolean state of the large desktop breakpoint.
 */
export const selectIsLargeDesktop = (state: TRootState): boolean =>
  state.mediaQuery.isLargeDesktop;

/**
 * A generic selector for checking the state of any defined breakpoint.
 * This function abstracts the process of selecting a specific breakpoint's state from the Redux store,
 * making it easier to access the state of various breakpoints dynamically.
 *
 * @param breakpoint - The key representing the breakpoint.
 * @returns A function that takes the root state and returns the boolean state of the specified breakpoint.
 *
 * @example
 * // Usage example in a component
 * const isBreakpoint380 = useSelector(selectBreakpoint('isBreakpoint380'));
 */
export const selectBreakpoint =
  (breakpoint: TBreakpointKeys) => (state: TRootState) =>
    state.mediaQuery[breakpoint];
