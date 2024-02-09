import { useEffect } from "react";

/**
 * Dynamically loads the UFuzzy library script and ensures it's only loaded once.
 *
 * This hook creates a script element to load the UFuzzy library from the public/scripts directory.
 * It checks if the script is already loaded to prevent duplicate loads. This approach is useful
 * for loading external scripts on demand, improving page load performance by not loading
 * scripts until they're needed.
 */
export const useInitializeUFuzzy = () => {
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
    script.src = "/scripts/uFuzzy.iife.min.js"; // Adjust the path based on your public directory structure.
    script.async = true; // Initialize the script asynchronously to not block rendering.

    // Append the script to the body to start loading it.
    document.body.appendChild(script);

    // Optional: Remove the script from the DOM when the component using this hook unmounts.
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);
};
