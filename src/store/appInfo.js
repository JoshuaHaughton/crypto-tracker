import { createSlice } from "@reduxjs/toolkit";
import { withCommonActions } from "./commonActions";

const initialAppInfoState = {
  coinListPageNumber: 1,
};

// AppInfo Reducers
const appInfoSliceDefinition = {
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
};

// Enhance the slice definition with common actions
const enhancedAppInfoSliceDefinition = withCommonActions(
  appInfoSliceDefinition,
);

// Create the slice using the enhanced definition
const appInfoSlice = createSlice(enhancedAppInfoSliceDefinition);

export const appInfoActions = appInfoSlice.actions;
export default appInfoSlice.reducer;
