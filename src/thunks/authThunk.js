// thunks/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for the API
const BASE_URL = "https://watchlist-server1.herokuapp.com";

export const signupUser = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username,
          email,
          password,
        },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Attempt to log out the user
      const response = await axios.get(`${BASE_URL}/logout`, {
        withCredentials: true,
      });
      // If successful, return the data to indicate success
      return response.status === 200 || response.status === 201;
    } catch (error) {
      // Reject the promise with the error message or error response
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const checkServerIfLogged = createAsyncThunk(
  "auth/checkLogged",
  async (_, { rejectWithValue }) => {
    try {
      // Check if the user is logged in by querying the server
      const response = await axios.get(`${BASE_URL}/logged`, {
        withCredentials: true,
      });
      // The server should return a status indicating the logged state
      // We return true or false based on the response status
      return response.status === 200 || response.status === 201;
    } catch (error) {
      // If there's an error, we'll consider the user as not logged in
      // and reject the promise with the error message or error response
      return rejectWithValue(false);
    }
  },
);
