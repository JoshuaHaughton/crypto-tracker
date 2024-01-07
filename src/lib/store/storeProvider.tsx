import { Store } from "@reduxjs/toolkit";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from ".";

/**
 * StoreProvider is a higher-order component designed to provide a Redux store to the React component tree.
 * It's particularly suitable for Single Page Applications (SPA) using Next.js, where components are dynamically
 * loaded and unloaded as the user navigates through the app. The useRef hook is used to persist the store instance
 * across re-renders, ensuring all child components have consistent access to the application's state, regardless of
 * their lifecycle in the SPA context. This approach prevents the Redux store from being reset on component re-renders
 * or page transitions, which is crucial for maintaining application state continuity in an SPA.
 *
 * @param children - Child components that require access to the Redux store.
 * @returns A component that provides the Redux store to its children, ensuring state consistency across the entire SPA.
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeRef = useRef<Store | null>(null);

  if (!storeRef.current) {
    // Create the store instance for the first render
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
