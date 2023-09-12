import { createSlice } from "@reduxjs/toolkit";

const initialMediaQueryState = {
  isBreakpoint380: false,
  isBreakpoint520: false,
  isBreakpoint555: false,
  isBreakpoint680: false,
  isBreakpoint1040: false,
  isBreakpoint1250: false,
};

const mediaQuerySlice = createSlice({
  name: "mediaQuery",
  initialState: initialMediaQueryState,
  reducers: {
    setBreakpoint380(state, action) {
      state.isBreakpoint380 = action.payload;
    },
    setBreakpoint520(state, action) {
      state.isBreakpoint520 = action.payload;
    },
    setBreakpoint555(state, action) {
      state.isBreakpoint555 = action.payload;
    },
    setBreakpoint680(state, action) {
      state.isBreakpoint680 = action.payload;
    },
    setBreakpoint1040(state, action) {
      state.isBreakpoint1040 = action.payload;
    },
    setBreakpoint1250(state, action) {
      state.isBreakpoint1250 = action.payload;
    },
  },
});

export const mediaQueryActions = mediaQuerySlice.actions;
export default mediaQuerySlice.reducer;
