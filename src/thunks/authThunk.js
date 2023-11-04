// thunks/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { clientAuth, clientFirestore } from "../config/firebaseClient";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signupUser = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update profile to set the displayName to the username
      await updateProfile(user, {
        displayName: username,
      });

      // Add a username to the Firestore database
      await setDoc(doc(clientFirestore, "usernames", user.uid), {
        username: username,
        email: email,
        uid: user.uid,
      });

      // Return the updated user info
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // First, sign in the user with the client-side SDK
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password,
      );

      // Then, get the ID token from the signed-in user
      const idToken = await userCredential.user.getIdToken();

      // Now, send this ID token to your Next.js API endpoint to set the session cookie
      const response = await fetch("/api/sessionLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to set session cookie.");
      }

      // Return the user data you need
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return true; // Return true to indicate success
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
