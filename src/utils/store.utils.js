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
  batch(() => {
    Object.keys(storeUpdates).forEach((sliceName) => {
      const updateSliceAction = sliceActionMap[sliceName];
      if (updateSliceAction) {
        reduxStore.dispatch(updateSliceAction(storeUpdates[sliceName]));
      }
    });
  });
}
