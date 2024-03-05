"use client";

import { TInitialPageDataOptions } from "@/lib/types/apiRequestTypes";
import useStoreHydrator from "./useStoreHydrator";

/**
 * Custom type for the props expected by the StoreHydrator component.
 */
interface IStoreHydratorProps {
  initialData: TInitialPageDataOptions;
}

/**
 * Component responsible for initializing the Redux store with preloaded data.
 * This component does not render any UI; it only uses the useStoreHydrator hook
 * to dispatch actions and update the Redux store based on the initial data of the app.
 *
 * @param {IStoreHydratorProps} props - The preloaded data for initializing the store.
 */
const StoreHydrator: React.FC<IStoreHydratorProps> = ({
  initialData,
}: IStoreHydratorProps) => {
  console.log("StoreHydrator Render");
  useStoreHydrator(initialData);

  return null; // This component does not render anything
};

export default StoreHydrator;
