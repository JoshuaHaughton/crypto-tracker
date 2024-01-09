import { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { TRootState } from "..";

/**
 * Logger middleware for Redux.
 * This middleware logs the action type, the action itself, and the resulting state.
 * Updated to use the latest Redux practices and TypeScript for type safety,
 * while also addressing complex type compatibility issues.
 *
 * @param store - MiddlewareAPI object that allows dispatching actions and getting the current state.
 * @returns A function that takes the next dispatch method and returns a dispatch function.
 */
const loggerMiddleware: Middleware<{}, TRootState> =
  (store: MiddlewareAPI) => (next: any) => (action: any) => {
    console.group(action.type);
    console.info("dispatching", action);
    let result = next(action);
    console.log("next state", store.getState());
    console.groupEnd();
    return result;
  };

export default loggerMiddleware;
