import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";
import { isEmpty } from "lodash";

const initialAuthState = {
  isLoggedIn: false,
  user: null,
  authLoading: false,
  error: null,
};

function extraReducers(builder) {
  builder
    // Handle signup cases
    .addCase(signupUser.pending, (state) => {
      state.authLoading = true;
      state.error = null;
    })
    .addCase(signupUser.fulfilled, (state, action) => {
      state.authLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload;
    })
    .addCase(signupUser.rejected, (state, action) => {
      state.authLoading = false;
      state.error = action.error.message || action.payload;
    })
    // Handle login cases
    .addCase(loginUser.pending, (state) => {
      state.authLoading = true;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.authLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.authLoading = false;
      state.error = action.error.message || action.payload;
    })
    // Handle logout cases
    .addCase(logoutUser.pending, (state) => {
      state.authLoading = true;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.authLoading = false;
      state.error = null;
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.authLoading = false;
      state.error = action.error.message || action.payload;
    });
}

// Auth Reducers
const authSliceDefinition = {
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isLoggedIn = !isEmpty(action.payload);
      state.authLoading = false;
      state.error = null;
    },
    clearAuthState(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.authLoading = false;
      state.error = null;
    },
  },
  extraReducers,
};

// Enhance the slice definition with common actions
const enhancedAuthSliceDefinition = withCommonActions(authSliceDefinition);

// Create the slice using the enhanced definition
const authSlice = createSlice(enhancedAuthSliceDefinition);

export const authActions = authSlice.actions;
export default authSlice.reducer;
