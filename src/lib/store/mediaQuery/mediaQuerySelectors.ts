import { TRootState } from "..";

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
