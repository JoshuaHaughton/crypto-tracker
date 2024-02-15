import { useEffect } from "react";
import { useDispatch } from "react-redux";
import UFuzzyManager from "@/lib/search/uFuzzyManager";
import { setSearchIsInitialized } from "@/lib/store/search/searchSlice";

/**
 * Custom React hook that initializes the UFuzzy library for fuzzy searching.
 * It checks if the UFuzzy library is already loaded and if not, it initializes the UFuzzyManager,
 * which creates and manages a singleton instance of the UFuzzy library.
 * Once initialized, it dispatches an action to update the Redux store to indicate that
 * the search functionality is ready for use. This hook ensures that UFuzzy is only initialized once
 * and is available globally via UFuzzyManager for the rest of the application.
 *
 * Usage of this hook in a component ensures that the UFuzzy library is ready before attempting
 * any fuzzy search operations. It leverages React's useEffect to run initialization logic on component mount,
 * and Redux's useDispatch to communicate the readiness of the search functionality across the application.
 */
export const useInitializeUFuzzy = () => {
  console.log("useInitializeUFuzzy");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("useInitializeUFuzzy start");
    // Checks if uFuzzy is available on the window object
    if (window.uFuzzy != null) {
      try {
        // Initialize UFuzzyManager which handles the singleton pattern for uFuzzy instance
        UFuzzyManager.initialize();
        // Dispatch an action to Redux store indicating that the search functionality is initialized
        dispatch(setSearchIsInitialized());
        console.warn("uFuzzy initialized and search state set.");
      } catch (error) {
        console.error("Error initializing uFuzzy:", error);
      }
    } else {
      if (UFuzzyManager.getInstance()) {
        console.warn("UFuzzyManager instance is alerady set");
      } else {
        console.error("window.uFuzzy is not defined AND the instance isnt set");
      }
    }
  }, [dispatch]);
};
