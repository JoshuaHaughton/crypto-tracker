"use client";

import ExternalScriptLoader from "@/components/initializers/ExternalScriptLoader";
import {
  EXTERNAL_SCRIPTS,
  ScriptConfig,
} from "@/lib/constants/externalScripts";
import { useAppInitialization } from "@/lib/hooks/appLifecycle/useAppInitialization";
import { useAppDispatch } from "@/lib/store";
import { Dispatch } from "@reduxjs/toolkit";
import { ScriptProps } from "next/script";

/**
 * The `AppInitializer` acts as the primary client-side component for initializing
 * global application state and loading external scripts within the Next.js App Router framework.
 * It ensures that state setup and critical external scripts
 * are loaded and initialized promptly, minimizing re-renders and maintaining consistent app state
 * across client-side navigation.
 *
 * While the `beforeInteractive` strategy is preferred for its performance benefits, it's not always
 * feasible for scripts requiring window object modifications. Therefore, we utilize the `afterInteractive`
 * strategy to guarantee effective script operation by allowing interaction with the window object.
 *
 * This component leverages `useAppInitialization` for orchestrating essential client-side logic,
 * including Redux state setup and web worker configurations, alongside server-rendered content.
 * This strategic initialization supports Next.js's SSR and client-side execution model, ensuring
 * a smooth and performant application experience.
 *
 * Additionally, `AppInitializer` dynamically applies Redux `dispatch` to scripts requiring state
 * management interactions upon loading. This approach is facilitated by `curryScriptsWithDispatch`,
 * selectively binding `dispatch` to script `onLoad` functions that impact application state. This
 * method optimizes the integration of external scripts with Redux, particularly for those executed
 * with the `afterInteractive` strategy, enhancing state management and application responsiveness.
 *
 * Contrary to rendering visible UI elements, `AppInitializer` focuses on initializing state and
 * loading external scripts. It renders `ExternalScriptLoader` for managing script loading, indirectly
 * influencing the UI by setting up required functionalities and state.
 */
export const AppInitializer: React.FC = () => {
  // Initialize app-wide logic (e.g., state, web workers) at the component's start.
  useAppInitialization();

  // Dynamically attach dispatch to scripts that interact with the Redux store.
  const dispatch = useAppDispatch();
  const preparedScripts = curryScriptsWithDispatch(EXTERNAL_SCRIPTS, dispatch);

  // Render external scripts through ExternalScriptLoader, indirectly affecting UI by setting up app functionalities.
  return <ExternalScriptLoader scriptConfig={preparedScripts} />;
};

/**
 * Processes an array of script configurations, optionally currying the `onLoad` function with `dispatch`.
 * This allows scripts that require Redux state manipulation upon loading to have access to the `dispatch` function.
 *
 * The need for `onLoadNeedsDispatch` arises in scenarios where client-side scripts loaded with "afterInteractive" strategy
 * need to initialize or update Redux state as soon as they're executed. This ensures a streamlined, efficient way
 * to synchronize external script execution with Redux state updates, crucial for maintaining application state consistency
 * and responsiveness, especially in Next.js applications leveraging Server Components and client-side interactions.
 *
 * @param {ScriptConfig[]} scripts - An array of script configurations that may require dispatch upon loading.
 * @param {Dispatch<any>} dispatch - The Redux dispatch function, used to update the application state.
 * @returns {ScriptProps[]} An array of script properties ready for use with the Next.js <Script> component,
 *                          with `onLoad` functions appropriately curried with `dispatch` where indicated.
 */
function curryScriptsWithDispatch(
  scripts: ScriptConfig[],
  dispatch: Dispatch<any>,
): ScriptProps[] {
  return scripts.map((script) => {
    if (script.onLoadNeedsDispatch && typeof script.onLoad === "function") {
      // Safely curry the onLoad function with dispatch
      return {
        ...script,
        onLoad: () => {
          // onLoad is definitely a function here
          script.onLoad!(dispatch);
        },
      };
    }
    // Return the script configuration unaltered if it doesn't require dispatch
    return script;
  });
}
