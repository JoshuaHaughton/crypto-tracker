import { createAction, createReducer } from "@reduxjs/toolkit";

const initialState = {};

export const updateStoreData = createAction("updateStoreData");

const rootReducer = createReducer(initialState, {
  [updateStoreData]: (state, action) => {
    // Spread the fetched data into the state
    return { ...state, ...action.payload };
  },
});

export default rootReducer;
