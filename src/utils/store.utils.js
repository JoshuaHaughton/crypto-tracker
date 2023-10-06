import { batch } from "react-redux";
import { appInfoActions } from "../store/appInfo";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { mediaQueryActions } from "../store/mediaQuery";

/**
 * Maps slice names to their respective actions for updating.
 */
export const sliceActionMap = {
  currency: currencyActions.updateSlice,
  coins: coinsActions.updateSlice,
  appInfo: appInfoActions.updateSlice,
  mediaQuery: mediaQueryActions.updateSlice,
};

/**
 * Dispatches actions to update each individual slice based on provided state.
 *
 * @param {Object} reduxStore - The redux store.
 * @param {Object} storeUpdates - The updated state to merge into the existing state.
 */
export function updateStoreData(reduxStore, storeUpdates) {
  console.log("reduxStore", reduxStore);
  console.log("storeUpdates", storeUpdates);

  if (
    typeof storeUpdates !== "object" ||
    storeUpdates === null ||
    Object.keys(storeUpdates).length === 0
  ) {
    console.warn(
      "storeUpdates is either not an object, null, or empty. Skipping updates.",
    );
    return;
  }

  batch(() => {
    Object.keys(storeUpdates).forEach((sliceName) => {
      const updateData = storeUpdates[sliceName];
      if (updateData !== undefined && updateData !== null) {
        const updateSliceAction = sliceActionMap[sliceName];
        if (updateSliceAction) {
          reduxStore.dispatch(updateSliceAction(updateData));
        }
      }
    });
  });
}
