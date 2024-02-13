"use client";

import ExternalScriptLoader from "@/components/initializers/ExternalScriptLoader";
import { FUZZY_SEARCH_SCRIPT } from "@/lib/constants/externalScripts";
import { useAppInitialization } from "@/lib/hooks/appLifecycle/useAppInitialization";
import { useAppDispatch } from "@/lib/store";
import { setSearchIsInitialized } from "@/lib/store/search/searchSlice";
import UFuzzyManager from "@/utils/uFuzzyManager";

/**
 * The `AppInitializer` serves as the highest level client-side component to initialize
 * application-wide scripts and state in the Next.js App Router setup. This design ensures state setup
 * and external scripts like `FUZZY_SEARCH_SCRIPT` are loaded/initialized once and early, preventing re-renders
 * across client-side navigation and maintaining consistent app state.
 *
 * Ideally, we'd execute these scripts earlier using the beforeInteractive strategy for optimal performance.
 * However, this strategy sometimes restricts modifications to the window object, which is necessary for scripts
 * that need to register or access global variables or functions. Consequently, to ensure such scripts can operate
 * effectively by interacting with the window object, we resort to the afterInteractive strategy.
 *
 * Utilizing `useAppInitialization`, this component orchestrates client-side logic,
 * such as Redux state setup and web worker configuration, complementing server-rendered
 * content with crucial client-side interactions. This separation allows for efficient
 * initialization while adhering to Next.js's SSR and client-side execution model.
 */
export const AppInitializer: React.FC = () => {
  // Call the app initialization hook directly at the component's top level
  useAppInitialization();
  const dispatch = useAppDispatch();

  const handleUFuzzyScriptLoad = () => {
    console.log("UFuzzy script loaded");
    const instance = UFuzzyManager.getInstance();
    if (instance) {
      // Only dispatch if the UFuzzy instance exists
      dispatch(setSearchIsInitialized());
      console.log("UFuzzyManager instance exists, search is initialized.");
    } else {
      console.error(
        "UFuzzyManager instance does not exist & cannot be created, search initialization skipped.",
      );
    }
  };

  // This component does not render any UI elements.
  return (
    <>
      <ExternalScriptLoader
        scriptConfig={FUZZY_SEARCH_SCRIPT}
        afterScriptsLoad={handleUFuzzyScriptLoad}
      />
    </>
  );
};
