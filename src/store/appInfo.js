import { createSlice } from "@reduxjs/toolkit";

const initialAppInfoState = {
  coinListPageNumber: 1,
};

// AppInfo Reducers
const appInfoSlice = createSlice({
  name: "appInfo",
  initialState: initialAppInfoState,
  reducers: {
    updateCoinListPageNumber(state, action) {
      console.log("updateCoinListPageNumber", action);
      if (action.payload.coinListPageNumber) {
        state.coinListPageNumber = action.payload.coinListPageNumber;
      }
    },
  },
});

export const appInfoActions = appInfoSlice.actions;
export default appInfoSlice.reducer;
