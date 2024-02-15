import { useRef, useEffect } from "react";

/**
 * Hook to log the props that have changed since the last render.
 * Useful for debugging re-renders.
 *
 * @param name - The name of the component using this hook, used for logging purposes.
 * @param props - The current props of the component.
 */
const useWhyDidYouUpdate = <T extends Record<string, any>>(
  name: string,
  props: T,
): void => {
  // Ref to store the previous props
  const previousProps = useRef<T>();

  console.warn(`useWhyDidYouUpdate - ${name} RENDER`, props);

  useEffect(() => {
    console.warn(`useWhyDidYouUpdate - ${name} UPDATE`);

    // Check if there were previous props to compare
    if (previousProps.current) {
      // Create an object to hold changes
      const changesObj: Record<string, { from: any; to: any }> = {};

      // Compare all keys in previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      allKeys.forEach((key) => {
        // If values have changed, add them to changesObj
        if (
          previousProps.current &&
          previousProps.current[key] !== props[key]
        ) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      // If changes are found, log them
      if (Object.keys(changesObj).length) {
        console.warn(`[why-did-you-update] - ${name}`, changesObj);
      } else {
        console.warn(`useWhyDidYouUpdate - ${name} No updates`);
      }
    }

    // Update previousProps with current props for the next hook call
    previousProps.current = props;
  }, [name, props]); // Effect depends on current props
};

export default useWhyDidYouUpdate;
