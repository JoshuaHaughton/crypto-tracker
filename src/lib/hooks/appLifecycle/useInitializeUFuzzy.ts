import { uFuzzyOptions } from "@/lib/constants/globalConstants";
import { setFuzzySearchInstance } from "@/lib/store/search/searchSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

/**
 * Dynamically loads the UFuzzy library script and ensures it's only loaded once.
 *
 * This hook creates a script element to load the UFuzzy library from the public/scripts directory.
 * It checks if the script is already loaded to prevent duplicate loads. This approach is useful
 * for loading external scripts on demand, improving page load performance by not loading
 * scripts until they're needed.
 */
export const useInitializeUFuzzy = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // The ID used to identify the script tag in the DOM.
    const scriptId = "uFuzzy-script";

    // Check if the script is already loaded to avoid re-loading it.
    if (document.getElementById(scriptId)) {
      return;
    }

    // Create a new script element.
    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "https://cdn.jsdelivr.net/npm/@leeoniya/ufuzzy@1.0.14/dist/uFuzzy.iife.min.js";
    script.async = true; // Initialize the script asynchronously to not block rendering.
    script.onload = () => {
      if (window.uFuzzy) {
        // Initialize uFuzzy with custom options and dispatch the instance to the store
        const uFuzzyInstance = window.uFuzzy(uFuzzyOptions);
        dispatch(setFuzzySearchInstance(uFuzzyInstance));

        // TypeScript may prevent direct deletion from `window` due to its strict type checking.
        // Casting `window` to `any` bypasses these checks.
        // This does not affect the reference held by the store, allowing continued use without global exposure.
        delete (window as any).uFuzzy;
      }
    };

    // Append the script to the body to start loading it.
    document.body.appendChild(script);

    // Remove the script from the DOM when the component using this hook unmounts.
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [dispatch]);
};
