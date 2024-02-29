"use client";

import { TInitialPageDataOptions } from "@/lib/types/apiRequestTypes";
import useInitializeAndHydrateData from "./useStoreHydrator"; // Adjust the path as necessary

/**
 * Custom type for the props expected by the StoreHydrator component.
 */
interface IStoreHydratorProps {
  initialData: TInitialPageDataOptions;
}

/**
 * Component responsible for initializing the Redux store with preloaded data.
 * This component does not render any UI; it only uses the useStoreHydrator hook
 * to dispatch actions and update the Redux store based on the provided props.
 *
 * @param {IStoreHydratorProps} props - The preloaded data for initializing the store.
 */
const StoreHydrator: React.FC<IStoreHydratorProps> = ({
  initialData,
}: IStoreHydratorProps) => {
  useInitializeAndHydrateData(initialData);

  return null; // This component does not render anything
};

export default StoreHydrator;
