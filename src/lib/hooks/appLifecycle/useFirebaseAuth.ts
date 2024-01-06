import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authActions } from "../../store/auth";
import { clientAuth } from "../../config/firebaseClient";

/**
 * Custom hook to synchronize the Redux store with Firebase authentication state.
 *
 * @param {Function} dispatch - The Redux `dispatch` function used to send actions to the store.
 */
export const useFirebaseAuth = (dispatch) => {
  useEffect(() => {
    // This listener is called whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
      if (user) {
        // User is signed in, update the Redux store with the user's info.
        dispatch(
          authActions.setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        );
      } else {
        // User is signed out, clear the auth state in the Redux store.
        dispatch(authActions.clearAuthState());
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  // The hook doesn't return anything as it is just for synchronization
};
