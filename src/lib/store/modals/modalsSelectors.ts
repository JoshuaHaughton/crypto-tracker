import { TRootState } from "..";

/**
 * Selector to get the auth modal open state.
 * @param state - The current state of the application.
 * @returns The open state of the auth modal.
 */
export const selectIsAuthModalOpen = (state: TRootState) =>
  state.modals.isAuthModalOpen;

/**
 * Selector to get the success modal open state.
 * @param state - The current state of the application.
 * @returns The open state of the success modal.
 */
export const selectIsSuccessModalOpen = (state: TRootState) =>
  state.modals.isSuccessModalOpen;

/**
 * Selector to determine if the modal is in sign-up mode.
 * @param state - The current state of the application.
 * @returns True if the modal is in sign-up mode, false if in log-in mode.
 */
export const selectIsSignUp = (state: TRootState) => state.modals.isSignUp;
