import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";

//Redux store that hosts auth reducer slice
const store = configureStore({
  reducer: {auth: authReducer}
});


export default store;