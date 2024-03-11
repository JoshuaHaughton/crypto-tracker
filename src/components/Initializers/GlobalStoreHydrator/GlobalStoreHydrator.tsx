"use client";

import { TInitialPageDataOptions } from "@/lib/types/apiRequestTypes";
import useGlobalStoreHydrator from "./useGlobalStoreHydrator";

/**
 * Custom type for the props expected by the GlobalStoreHydrator component.
 */
interface IGlobalStoreHydratorProps {
  initialData: TInitialPageDataOptions;
}

/**
 * Component responsible for initializing the Redux store with preloaded data.
 * This component does not render any UI; it only uses the useGlobalStoreHydrator hook
 * to dispatch actions and update the Redux store based on the initial data of the app.
 *
 * @param {IGlobalStoreHydratorProps} props - The preloaded data for initializing the store.
 */
const GlobalStoreHydrator: React.FC<IGlobalStoreHydratorProps> = ({
  initialData,
}: IGlobalStoreHydratorProps) => {
  console.log("GlobalStoreHydrator Render", initialData);
  useGlobalStoreHydrator(initialData);

  return null; // This component does not render anything
};

export default GlobalStoreHydrator;
