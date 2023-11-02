// modalSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

export const initialModalsState = {
  isAuthModalOpen: false,
  isSuccessModalOpen: false,
  isSignUp: true,
};

const modalsSliceDefinition = {
  name: "modals",
  initialState: initialModalsState,
  reducers: {
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    openSuccessModal: (state) => {
      state.isSuccessModalOpen = true;
    },
    closeSuccessModal: (state) => {
      state.isSuccessModalOpen = false;
    },
    setSignUp: (state) => {
      state.isSignUp = true;
    },
    setLogin: (state) => {
      state.isSignUp = false;
    },
  },
};

// Enhance the slice definition with common actions
const enhancedModalsSliceDefinition = withCommonActions(modalsSliceDefinition);

// Create the slice using the enhanced definition
const modalsSlice = createSlice(enhancedModalsSliceDefinition);

export const modalsActions = modalsSlice.actions;

export default modalsSlice.reducer;
