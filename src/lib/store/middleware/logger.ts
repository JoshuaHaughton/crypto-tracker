import { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { TRootState } from "..";
import { isEqual, cloneDeep, isObject } from "lodash";

/**
 * Recursively find differences between two objects.
 * Only includes properties that have changed and does not exist in the previous state.
 *
 * @param obj1 - The previous state object.
 * @param obj2 - The new state object after the action is dispatched.
 * @returns An object containing the differences between the two objects.
 */
function findDeepDifferences(obj1: any, obj2: any): any {
  const changes: any = {};
  // Combine keys from both objects to ensure all differences are found.
  Object.keys({ ...obj1, ...obj2 }).forEach((key) => {
    // Recursively check nested objects.
    if (isObject(obj1[key]) && isObject(obj2[key])) {
      const difference = findDeepDifferences(obj1[key], obj2[key]);
      // Only add differences that result in actual changes.
      if (Object.keys(difference).length > 0) {
        changes[key] = difference;
      }
    } else if (!isEqual(obj1[key], obj2[key])) {
      // Add non-object differences that are not equal between states.
      changes[key] = { from: obj1[key], to: obj2[key] };
    }
  });
  return changes;
}

/**
 * Logger middleware for Redux using TypeScript.
 * Logs the action being dispatched, the specific changes made to the state that are different from the previous state,
 * and the complete new state after the action is dispatched.
 *
 * @param store - The Redux store, providing access to the current state.
 * @returns A middleware function that intercepts actions, logs changes, and forwards the action.
 */
const loggerMiddleware: Middleware<{}, TRootState> =
  (store: MiddlewareAPI) => (next) => (action: any) => {
    // Start a log group for better readability in the console.
    console.group(action.type);
    console.info("dispatching", action);

    // Capture a deep clone of the state before the action to prevent mutations.
    const prevState = cloneDeep(store.getState());
    // Dispatch the action and capture the result.
    const result = next(action);
    // Get the state after the action has been dispatched.
    const nextState = store.getState();

    // Find and log only the changes that are different from the previous state.
    const changes = findDeepDifferences(prevState, nextState);
    if (Object.keys(changes).length > 0) {
      console.log("Changes made:", changes);
      // Log the complete new state for full context after changes.
      console.log("Complete new state:", nextState);
    } else {
      console.log("No changes to state");
    }

    // Close the log group.
    console.groupEnd();

    return result;
  };

export default loggerMiddleware;
