"use client";

import { useAppInitialization } from "@/lib/hooks/appLifecycle/useAppInitialization";

/**
 * The `AppInitializer` acts as the primary client-side component for initializing
 * global application state within the Next.js App Router framework.
 * It ensures that state setup is loaded and initialized as early as possible, minimizing re-renders and
 * maintaining consistent app state across client-side navigation.
 *
 * This component leverages `useAppInitialization` for orchestrating essential client-side logic,
 * including Redux state setup and web worker configurations, alongside server-rendered content.
 * This strategic initialization supports Next.js's SSR and client-side execution model, ensuring
 * a smooth and performant application experience.
 *
 * Contrary to rendering visible UI elements, `AppInitializer` focuses on initializing state.
 */
export const AppInitializer: React.FC<{}> = ({}) => {
  console.log("AppInitializer render");
  // Initialize app-wide logic (e.g., state, web workers) on the initial mount of the app in the Client.
  useAppInitialization();

  // Render nothing.
  return null;
};
