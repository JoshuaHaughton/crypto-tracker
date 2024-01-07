import { createSlice } from "@reduxjs/toolkit";

/**
 * Interface representing the state structure for the modals slice.
 * Includes flags to manage the visibility of various modals.
 */
export interface IModalsState {
  isAuthModalOpen: boolean;
  isSuccessModalOpen: boolean;
  isSignUp: boolean;
}

/**
 * Initial state for the modals slice.
 */
export const initialModalsState: IModalsState = {
  isAuthModalOpen: false,
  isSuccessModalOpen: false,
  isSignUp: true,
};

const modalsSlice = createSlice({
  name: "modals",
  initialState: initialModalsState,
  reducers: {
    /**
     * Opens the authentication modal.
     * @param state - The current state of the modals slice.
     */
    openAuthModal(state: IModalsState) {
      state.isAuthModalOpen = true;
    },

    /**
     * Closes the authentication modal.
     * @param state - The current state of the modals slice.
     */
    closeAuthModal(state: IModalsState) {
      state.isAuthModalOpen = false;
    },

    /**
     * Opens the success modal.
     * @param state - The current state of the modals slice.
     */
    openSuccessModal(state: IModalsState) {
      state.isSuccessModalOpen = true;
    },

    /**
     * Closes the success modal.
     * @param state - The current state of the modals slice.
     */
    closeSuccessModal(state: IModalsState) {
      state.isSuccessModalOpen = false;
    },

    /**
     * Sets the modal state to sign-up.
     * @param state - The current state of the modals slice.
     */
    setSignUp(state: IModalsState) {
      state.isSignUp = true;
    },

    /**
     * Sets the modal state to log-in.
     * @param state - The current state of the modals slice.
     */
    setLogin(state: IModalsState) {
      state.isSignUp = false;
    },
  },
});

export const modalsActions = modalsSlice.actions;
export default modalsSlice.reducer;
