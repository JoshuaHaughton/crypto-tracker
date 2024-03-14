import { TRootState } from "..";
import { TBreakpointKeys } from "./mediaQuerySlice";

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
 * Selector for checking the state of the extra small (xs) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the extra small breakpoint.
 */
export const selectIsBreakpointXs = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointXs;

/**
 * Selector for checking the state of the small (sm) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the small breakpoint.
 */
export const selectIsBreakpointSm = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointSm;

/**
 * Selector for checking the state of the medium (md) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the medium breakpoint.
 */
export const selectIsBreakpointMd = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointMd;

/**
 * Selector for checking the state of the large (lg) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the large breakpoint.
 */
export const selectIsBreakpointLg = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointLg;

/**
 * Selector for checking the state of the extra-large (xl) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the extra-large breakpoint.
 */
export const selectIsBreakpointXl = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointXl;

/**
 * Selector for checking the state of the double extra-large (xxl) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the double extra-large breakpoint.
 */
export const selectIsBreakpointXXL = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointXXL;

/**
 * Selector for checking the state of the triple extra-large (xxxl) breakpoint.
 * @param state - The current state of the application.
 * @returns The boolean state indicating if the viewport is within the triple extra-large breakpoint.
 */
export const selectIsBreakpointXXXL = (state: TRootState): boolean =>
  state.mediaQuery.isBreakpointXXXL;
