import { ScriptConfig } from "@/lib/constants/externalScriptConstants";
import { Dispatch } from "@reduxjs/toolkit";
import { ScriptProps } from "next/script";

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
export function curryScriptsWithDispatch(
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
