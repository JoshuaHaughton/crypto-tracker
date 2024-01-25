"use client";
import { useAppInitialization } from "@/lib/hooks/appLifecycle/useAppInitialization";
import { TAppStore } from "@/lib/store";

/**
 * A client-side component (`AppInitializer`) designed to be used within a server-rendered
 * component for initializing application state in a Next.js application using the App Router
 * model with Server Side Rendering (SSR) capabilities.
 *
 * The `AppInitializer` component leverages the `useAppInitialization` hook to set up
 * the application based on the Redux store state and router information. This approach
 * allows the component to run client-side initialization logic (like setting up a web worker)
 * while being nested within a server-rendered component, adhering to the constraints of
 * Next.js 14's App Router where direct usage of hooks in server components is restricted.
 *
 * By separating the initialization logic into a client component, we ensure that the
 * server component (`RootLayout`) remains focused on server-side rendering and data fetching
 * tasks, while the `AppInitializer` handles client-specific tasks. This setup facilitates
 * a hybrid architecture where server-rendered pages can efficiently initialize client-side
 * application state without violating the architectural patterns of Next.js 14.
 *
 */
export const AppInitializer: React.FC = () => {
  // Call the app initialization hook directly at the component's top level
  useAppInitialization();

  // This component does not render any UI elements.
  return null;
};
