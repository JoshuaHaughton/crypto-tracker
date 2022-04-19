import { createSlice } from "@reduxjs/toolkit";


const initialAuthState = { isLogged: false, username: null, uid: null};

//Auth Reducers
const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    reduxLogin: (state, action) => {
      state.isLogged = true;
      state.uid = action.payload.uid;
      state.username = action.payload.username;
    },
    reduxLogout: (state) => {
      state.isLogged = false;
      state.uid = null;
      state.username = null;
    },
  },
});

export const { reduxLogin, reduxLogout } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth;


export default authSlice.reducer;
